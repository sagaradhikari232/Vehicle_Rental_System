import axios from "axios";
import { Payment } from "../models/payment.model.js";
import { Booking } from "../models/booking.model.js";

// ─────────────────────────────────────────────
// KHALTI CONFIG
// ─────────────────────────────────────────────

const KHALTI_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://khalti.com/api/v2"
    : "https://dev.khalti.com/api/v2";

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

const khaltiHeaders = {
  Authorization: `Key ${KHALTI_SECRET_KEY}`,
  "Content-Type": "application/json",
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Convert NPR to paisa (Khalti requires amount in paisa).
 * Minimum is 1000 paisa = Rs. 10
 */
const toPaisa = (amountInNPR) => Math.round(amountInNPR * 100);

/**
 * Map Khalti lookup status → our Payment model status
 */
const mapKhaltiStatus = (khaltiStatus) => {
  const map = {
    Completed: "completed",
    Pending: "pending",
    Initiated: "pending",
    Refunded: "refunded",
    Expired: "expired",
    "User canceled": "user_canceled",
    "Partially refunded": "refunded",
  };
  return map[khaltiStatus] ?? "failed";
};

/**
 * Map our Payment status → Booking payment_status
 */
const mapToBookingPaymentStatus = (paymentStatus) => {
  const map = {
    completed: "paid",
    refunded: "refunded",
    failed: "failed",
    user_canceled: "failed",
    expired: "failed",
    pending: "pending",
    initiated: "pending",
  };
  return map[paymentStatus] ?? "pending";
};

// ─────────────────────────────────────────────
// @desc    Initiate Khalti payment for a booking
// @route   POST /api/payments/initiate/:bookingId
// @access  Private (user)
// ─────────────────────────────────────────────
export const initiatePayment = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // 1. Fetch booking
    const booking = await Booking.findById(bookingId).populate(
      "user",
      "name email phone"
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // 2. Only the booking owner can initiate payment
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }

    // 3. Only pending or confirmed bookings can be paid
    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({
        message: `Cannot initiate payment for a booking with status: ${booking.status}.`,
      });
    }

    // 4. Prevent duplicate active payments
    const existingPayment = await Payment.findOne({
      booking: bookingId,
      status: { $in: ["initiated", "pending"] },
    });
    if (existingPayment) {
      return res.status(409).json({
        message: "A payment is already in progress for this booking.",
        payment_url: existingPayment.payment_url,
      });
    }

    // 5. Amount must be at least Rs. 10 (1000 paisa)
    const amountInPaisa = toPaisa(booking.total_rent_amount);
    if (amountInPaisa < 1000) {
      return res.status(400).json({
        message: "Booking amount must be at least Rs. 10 to process payment.",
      });
    }

    // 6. Build Khalti initiate payload
    const khaltiPayload = {
      return_url: `${process.env.WEBSITE_URL}/api/payments/callback`,
      website_url: process.env.WEBSITE_URL,
      amount: amountInPaisa,
      purchase_order_id: booking._id.toString(),
      purchase_order_name: `Vehicle Rental - Booking #${booking._id}`,
      customer_info: {
        name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone,
      },
      amount_breakdown: [
        { label: "Rent Amount", amount: toPaisa(booking.total_rent_amount) },
      ],
      product_details: [
        {
          identity: booking._id.toString(),
          name: `Vehicle Rental Booking #${booking._id}`,
          total_price: amountInPaisa,
          quantity: 1,
          unit_price: amountInPaisa,
        },
      ],
      // merchant_ prefix fields are returned in callback — useful for tracking
      merchant_booking_id: booking._id.toString(),
    };

    // 7. Call Khalti initiate API
    const khaltiRes = await axios.post(
      `${KHALTI_BASE_URL}/epayment/initiate/`,
      khaltiPayload,
      { headers: khaltiHeaders }
    );

    const { pidx, payment_url, expires_at } = khaltiRes.data;

    // 8. Create Payment document in our DB
    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: booking.total_rent_amount,
      pidx,
      payment_url,
      expires_at: new Date(expires_at),
      status: "pending",
    });

    // 9. Link payment ref to booking
    booking.payment = payment._id;
    await booking.save();

    return res.status(200).json({
      message: "Payment initiated. Redirect user to payment_url.",
      payment_url,
      pidx,
      expires_at,
    });
  } catch (error) {
    // Surface Khalti's own validation errors
    if (error.response?.data) {
      return res.status(400).json({
        message: "Khalti payment initiation failed.",
        error: error.response.data,
      });
    }
    console.error("initiatePayment error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────
// @desc    Khalti callback after user pays
//          Khalti redirects user to this GET URL
// @route   GET /api/payments/callback
// @access  Public (Khalti redirects here)
// ─────────────────────────────────────────────
export const khaltiCallback = async (req, res) => {
  try {
    // Khalti sends these as query params on the return_url
    const {
      pidx,
      status,
      transaction_id,
      amount,
      purchase_order_id,
    } = req.query;

    if (!pidx) {
      return res.status(400).json({ message: "pidx is required." });
    }

    // Always verify via Khalti lookup — never trust callback alone
    const lookupRes = await axios.post(
      `${KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx },
      { headers: khaltiHeaders }
    );

    const lookup = lookupRes.data;
    const ourStatus = mapKhaltiStatus(lookup.status);

    // Find the payment by pidx
    const payment = await Payment.findOne({ pidx });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found." });
    }

    // Update payment with verified data
    payment.status = ourStatus;
    payment.khalti_transaction_id =
      lookup.transaction_id ?? transaction_id ?? null;
    payment.khalti_response = lookup;
    await payment.save();

    // Update booking payment_status to stay in sync
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.payment_status = mapToBookingPaymentStatus(ourStatus);

      // Auto-confirm booking on successful payment
      if (ourStatus === "completed" && booking.status === "pending") {
        booking.status = "confirmed";
      }

      await booking.save();
    }

    // Redirect user to frontend with result
    const frontendBase = process.env.FRONTEND_URL;

    if (ourStatus === "completed") {
      return res.redirect(
        `${frontendBase}/payment/success?bookingId=${payment.booking}`
      );
    } else {
      return res.redirect(
        `${frontendBase}/payment/failed?bookingId=${payment.booking}&reason=${ourStatus}`
      );
    }
  } catch (error) {
    console.error("khaltiCallback error:", error);
    // Redirect to a generic failure page rather than exposing errors
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  }
};

// ─────────────────────────────────────────────
// @desc    Manually verify/lookup a payment by pidx
//          Use this if callback was missed or user claims payment was made
// @route   POST /api/payments/verify
// @access  Private (user or admin)
// ─────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ message: "pidx is required." });
    }

    // Find our payment record
    const payment = await Payment.findOne({ pidx });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found." });
    }

    // Only owner or admin can verify
    if (
      req.user.role !== "admin" &&
      payment.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Call Khalti lookup API
    const lookupRes = await axios.post(
      `${KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx },
      { headers: khaltiHeaders }
    );

    const lookup = lookupRes.data;
    const ourStatus = mapKhaltiStatus(lookup.status);

    // Validate amount matches — guard against tampering
    const paidAmountNPR = lookup.total_amount / 100;
    if (
      ourStatus === "completed" &&
      Math.abs(paidAmountNPR - payment.amount) > 1 // allow 1 NPR rounding tolerance
    ) {
      payment.status = "failed";
      payment.khalti_response = lookup;
      await payment.save();

      return res.status(400).json({
        message: "Payment amount mismatch. Payment rejected.",
        expected: payment.amount,
        received: paidAmountNPR,
      });
    }

    // Update payment record
    payment.status = ourStatus;
    payment.khalti_transaction_id = lookup.transaction_id ?? null;
    payment.khalti_response = lookup;
    await payment.save();

    // Sync booking payment_status
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.payment_status = mapToBookingPaymentStatus(ourStatus);

      if (ourStatus === "completed" && booking.status === "pending") {
        booking.status = "confirmed";
      }

      await booking.save();
    }

    return res.status(200).json({
      message: "Payment verified.",
      status: ourStatus,
      khalti_status: lookup.status,
      transaction_id: lookup.transaction_id,
      amount: paidAmountNPR,
      payment,
    });
  } catch (error) {
    if (error.response?.data) {
      return res.status(400).json({
        message: "Khalti lookup failed.",
        error: error.response.data,
      });
    }
    console.error("verifyPayment error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────
// @desc    Get payment details by booking ID
// @route   GET /api/payments/booking/:bookingId
// @access  Private (owner or admin)
// ─────────────────────────────────────────────
export const getPaymentByBooking = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      booking: req.params.bookingId,
    }).populate("booking", "status payment_status total_rent_amount");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    if (
      req.user.role !== "admin" &&
      payment.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    return res.status(200).json({ payment });
  } catch (error) {
    console.error("getPaymentByBooking error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────
// @desc    Get all payments (admin only)
// @route   GET /api/payments
// @access  Private (admin)
// ─────────────────────────────────────────────
export const getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("user", "name email phone")
        .populate("booking", "status total_rent_amount pickup_datetime dropoff_datetime")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments(filter),
    ]);

    return res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      payments,
    });
  } catch (error) {
    console.error("getAllPayments error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};