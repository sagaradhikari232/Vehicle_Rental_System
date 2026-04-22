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

/**
 * Returns true for payment statuses that are dead and unrecoverable.
 * Used to decide whether to clear booking.payment ref for retry.
 */
const isTerminalPaymentStatus = (status) =>
  ["failed", "expired", "user_canceled", "refunded"].includes(status);

// ─────────────────────────────────────────────
// @desc    Initiate Khalti payment for a booking
// @route   POST /api/v1/payments/initiate/:bookingId
// @access  Private (user)
// ─────────────────────────────────────────────
export const initiatePayment = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // 1. Fetch booking
    const booking = await Booking.findById(bookingId).populate(
      "user",
      "fullname email phone"
    );
    console.log(booking.user);

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

    // 4. Check for an existing active payment
    //
    // FIX 1 — Before blocking the retry, check if the existing payment
    // has already expired locally (expires_at < now). If it has, mark it
    // expired and clear the booking ref so a fresh payment can be created.
    // Without this, a user whose Khalti link expired is permanently locked
    // out with "A payment is already in progress" even though it isn't.
    const existingPayment = await Payment.findOne({
      booking: bookingId,
      status: { $in: ["initiated", "pending"] },
    });

    if (existingPayment) {
      const isLocallyExpired =
        existingPayment.expires_at && existingPayment.expires_at < new Date();

      if (isLocallyExpired) {
        // Mark the dead payment expired and free the booking for retry
        existingPayment.status = "expired";
        await existingPayment.save();

        booking.payment = null;
        booking.payment_status = "pending";
        await booking.save();

        // Fall through to create a fresh payment below
      } else {
        // Payment is genuinely still active — block duplicate
        return res.status(409).json({
          message: "A payment is already in progress for this booking.",
          payment_url: existingPayment.payment_url,
          expires_at: existingPayment.expires_at,
        });
      }
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
      // FIX 4 — return_url must include /v1/ to match Express route mounting.
      // Original code had /api/payments/callback which 404s on your server.
      // Khalti completes the payment but your callback never fires —
      // booking stays pending forever and user sees a broken page.
      return_url: `${process.env.WEBSITE_URL}/api/v1/payments/callback`,
      website_url: process.env.WEBSITE_URL,
      amount: amountInPaisa,
      purchase_order_id: booking._id.toString(),
      purchase_order_name: `Vehicle Rental - Booking #${booking._id}`,
      customer_info: {
        name: booking.user.fullname,
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
//          Khalti redirects user's browser to this GET URL
// @route   GET /api/v1/payments/callback
// @access  Public (Khalti redirects here — no JWT)
// ─────────────────────────────────────────────
export const khaltiCallback = async (req, res) => {
  try {
    const { pidx, transaction_id } = req.query;

    if (!pidx) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/failed?reason=missing_pidx`
      );
    }

    // Always verify via Khalti lookup — never trust callback params alone
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
      console.error(`khaltiCallback: no Payment found for pidx=${pidx}`);
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/failed?reason=payment_not_found`
      );
    }

    // Update payment with verified data from Khalti
    payment.status = ourStatus;
    payment.khalti_transaction_id = lookup.transaction_id ?? transaction_id ?? null;
    payment.khalti_response = lookup;
    await payment.save();

    // Sync booking
    const booking = await Booking.findById(payment.booking);

    // FIX 3 — Previously this was a silent `if (booking) { ... }` which
    // meant a completed payment with a missing booking produced no error,
    // no log, and left the data in an undetectable broken state.
    // Now we log clearly so it shows up for manual reconciliation.
    if (!booking) {
      console.error(
        `khaltiCallback: Payment ${payment._id} marked ${ourStatus} but ` +
        `Booking ${payment.booking} does not exist. Manual reconciliation needed.`
      );
      // Payment went through on Khalti's side — redirect to success so
      // the user isn't confused. Admin resolves the booking side manually.
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment/success?bookingId=${payment.booking}`
      );
    }

    booking.payment_status = mapToBookingPaymentStatus(ourStatus);

    if (ourStatus === "completed") {
      // Auto-confirm booking on successful payment
      if (booking.status === "pending") {
        booking.status = "confirmed";
      }
    } else if (isTerminalPaymentStatus(ourStatus)) {
      // FIX 2 — When payment is terminal (user_canceled, expired, failed),
      // clear the booking's payment ref and reset payment_status to "pending".
      // Without this, the duplicate check in initiatePayment finds the dead
      // payment and permanently blocks the user from retrying — they'd be
      // stuck with an unpaid booking they can never pay for.
      booking.payment = null;
      booking.payment_status = "pending";
      // booking.status intentionally stays "pending" — user can try again
    }

    await booking.save();

    const frontendBase = process.env.FRONTEND_URL;
    if (ourStatus === "completed") {
      return res.redirect(
        `${frontendBase}/payment/success?bookingId=${booking._id}`
      );
    } else {
      return res.redirect(
        `${frontendBase}/payment/failed?bookingId=${booking._id}&reason=${ourStatus}`
      );
    }
  } catch (error) {
    console.error("khaltiCallback error:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  }
};

// ─────────────────────────────────────────────
// @desc    Manually verify a payment by pidx
//          Use when callback was missed or user claims payment was made
// @route   POST /api/v1/payments/verify
// @access  Private (user or admin)
// ─────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ message: "pidx is required." });
    }

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
      Math.abs(paidAmountNPR - payment.amount) > 1 // 1 NPR rounding tolerance
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

    // Sync booking
    const booking = await Booking.findById(payment.booking);

    // FIX 3 — Same clear error logging as khaltiCallback.
    // Previously silently continued if booking was null.
    if (!booking) {
      console.error(
        `verifyPayment: Payment ${payment._id} verified as ${ourStatus} but ` +
        `Booking ${payment.booking} does not exist. Manual reconciliation needed.`
      );
      return res.status(200).json({
        message: "Payment verified but linked booking not found. Contact support.",
        status: ourStatus,
        payment,
      });
    }

    booking.payment_status = mapToBookingPaymentStatus(ourStatus);

    if (ourStatus === "completed") {
      if (booking.status === "pending") {
        booking.status = "confirmed";
      }
    } else if (isTerminalPaymentStatus(ourStatus)) {
      // FIX 2 — Same retry logic as khaltiCallback.
      booking.payment = null;
      booking.payment_status = "pending";
    }

    await booking.save();

    return res.status(200).json({
      message: "Payment verified.",
      status: ourStatus,
      khalti_status: lookup.status,
      transaction_id: lookup.transaction_id,
      amount: paidAmountNPR,
      booking_status: booking.status,
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
// @route   GET /api/v1/payments/booking/:bookingId
// @access  Private (owner or admin)
// ─────────────────────────────────────────────
export const getPaymentByBooking = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      booking: req.params.bookingId,
    }).populate(
      "booking",
      "status payment_status total_rent_amount pickup_datetime dropoff_datetime"
    );

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
// @route   GET /api/v1/payments
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
        .populate(
          "booking",
          "status total_rent_amount pickup_datetime dropoff_datetime"
        )
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