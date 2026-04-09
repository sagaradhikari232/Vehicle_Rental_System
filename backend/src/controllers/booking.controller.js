import { Booking } from "../models/booking.model.js";
import { Vehicle } from "../models/vehicle.model.js";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Check if a vehicle is available for the requested time window.
 * Excludes a specific bookingId (used during updates to ignore self).
 */
const isVehicleAvailable = async (
  vehicleId,
  pickupDatetime,
  dropoffDatetime,
  excludeBookingId = null
) => {
  const query = {
    vehicle: vehicleId,
    status: { $in: ["pending", "confirmed", "active"] },
    $or: [
      {
        pickup_datetime: { $lt: dropoffDatetime },
        dropoff_datetime: { $gt: pickupDatetime },
      },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflict = await Booking.findOne(query);
  return !conflict;
};

/**
 * Calculate total rent based on duration.
 * - Uses daily_rate if booking duration >= 24 hours (rounded up to full days).
 * - Uses hourly_rate if duration < 24 hours.
 * - Falls back to prorating daily_rate if no hourly_rate is set.
 */
const calculateRent = (vehicleDoc, pickup, dropoff) => {
  const durationHours = (dropoff - pickup) / (1000 * 60 * 60);

  if (durationHours >= 24) {
    const durationDays = Math.ceil(durationHours / 24);
    return { total_rent_amount: durationDays * vehicleDoc.daily_rate, durationHours };
  }

  if (vehicleDoc.hourly_rate) {
    return { total_rent_amount: durationHours * vehicleDoc.hourly_rate, durationHours };
  }

  // No hourly_rate set — prorate the daily_rate
  return {
    total_rent_amount: (durationHours / 24) * vehicleDoc.daily_rate,
    durationHours,
  };
};

// ─────────────────────────────────────────────
// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (user)
// ─────────────────────────────────────────────
export const createBooking = async (req, res) => {
  try {
    const {
      vehicle,
      pickup_datetime,
      dropoff_datetime,
      pickup_location,
      dropoff_location,
      notes,
    } = req.body;

    const userId = req.user._id;

    // 1. Validate dates
    const pickup = new Date(pickup_datetime);
    const dropoff = new Date(dropoff_datetime);

    if (isNaN(pickup) || isNaN(dropoff)) {
      return res.status(400).json({ message: "Invalid date format." });
    }
    if (pickup < new Date()) {
      return res.status(400).json({ message: "Pickup datetime cannot be in the past." });
    }
    if (dropoff <= pickup) {
      return res.status(400).json({ message: "Dropoff must be after pickup." });
    }

    // 2. Validate notes length for a clean 400 response
    if (notes && notes.length > 1000) {
      return res.status(400).json({ message: "Notes cannot exceed 1000 characters." });
    }

    // 3. Check vehicle exists and is rentable
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({ message: "Vehicle not found." });
    }
    if (vehicleDoc.status !== "available") {
      return res.status(400).json({ message: "Vehicle is not available for rent." });
    }

    // 4. Check for overlapping bookings
    const available = await isVehicleAvailable(vehicle, pickup, dropoff);
    if (!available) {
      return res.status(409).json({
        message: "Vehicle is already booked for the selected time window.",
      });
    }

    // 5. Calculate rent (smart: daily vs hourly)
    const { total_rent_amount } = calculateRent(vehicleDoc, pickup, dropoff);

    // 6. Create booking
    // Note: security_deposit is not on the Vehicle model — defaults to 0
    const booking = await Booking.create({
      user: userId,
      vehicle,
      pickup_datetime: pickup,
      dropoff_datetime: dropoff,
      pickup_location,
      dropoff_location,
      total_rent_amount,
      security_deposit: 0,
      notes,
      status: "pending",
      payment_status: "pending",
    });

    return res.status(201).json({
      message: "Booking created successfully.",
      booking,
    });
  } catch (error) {
    console.error("createBooking error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────
// @desc    Get all bookings (admin: all, user: own)
// @route   GET /api/bookings
// @access  Private
// ─────────────────────────────────────────────
export const getAllBookings = async (req, res) => {
  try {
    const { status, payment_status, page = 1, limit = 10 } = req.query;

    const filter = {};

    // Non-admin users only see their own bookings
    if (req.user.role !== "admin") {
      filter.user = req.user._id;
    }

    if (status) filter.status = status;
    if (payment_status) filter.payment_status = payment_status;

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("user", "name email phone")
        // brand, model, registration_number match actual Vehicle schema
        .populate("vehicle", "brand model registration_number hourly_rate daily_rate type")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(filter),
    ]);

    return res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      bookings,
    });
  } catch (error) {
    console.error("getAllBookings error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────
// @desc    Get logged-in user's own bookings
// @route   GET /api/bookings/my
// @access  Private (user)
// ─────────────────────────────────────────────
export const getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        // image_url is the correct field name (not "images")
        .populate("vehicle", "brand model registration_number image_url type status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(filter),
    ]);

    return res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      bookings,
    });
  } catch (error) {
    console.error("getMyBookings error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────
// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
// ─────────────────────────────────────────────
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email phone")
      // registration_number replaces plate_number
      .populate("vehicle", "brand model registration_number hourly_rate daily_rate type fuel_type seats image_url")
      .populate("payment");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Non-admin can only view their own booking
    if (
      req.user.role !== "admin" &&
      booking.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    return res.status(200).json({ booking });
  } catch (error) {
    console.error("getBookingById error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────
// @desc    Update booking (reschedule / update notes)
// @route   PATCH /api/bookings/:id
// @access  Private (owner or admin)
// ─────────────────────────────────────────────
export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Only owner or admin can update
    if (
      req.user.role !== "admin" &&
      booking.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Cannot modify active, completed, or cancelled bookings
    if (["active", "completed", "cancelled"].includes(booking.status)) {
      return res.status(400).json({
        message: `Cannot update a booking with status: ${booking.status}.`,
      });
    }

    const {
      pickup_datetime,
      dropoff_datetime,
      pickup_location,
      dropoff_location,
      notes,
    } = req.body;

    // Validate notes length
    if (notes && notes.length > 1000) {
      return res.status(400).json({ message: "Notes cannot exceed 1000 characters." });
    }

    // If rescheduling, re-validate dates and re-check availability
    if (pickup_datetime || dropoff_datetime) {
      const pickup = new Date(pickup_datetime ?? booking.pickup_datetime);
      const dropoff = new Date(dropoff_datetime ?? booking.dropoff_datetime);

      if (pickup < new Date()) {
        return res.status(400).json({ message: "Pickup datetime cannot be in the past." });
      }
      if (dropoff <= pickup) {
        return res.status(400).json({ message: "Dropoff must be after pickup." });
      }

      const available = await isVehicleAvailable(
        booking.vehicle,
        pickup,
        dropoff,
        booking._id
      );
      if (!available) {
        return res.status(409).json({
          message: "Vehicle is already booked for the new time window.",
        });
      }

      // Recalculate rent using correct vehicle fields (daily_rate / hourly_rate)
      const vehicleDoc = await Vehicle.findById(booking.vehicle);
      const { total_rent_amount } = calculateRent(vehicleDoc, pickup, dropoff);

      booking.total_rent_amount = total_rent_amount;
      booking.pickup_datetime = pickup;
      booking.dropoff_datetime = dropoff;
    }

    if (pickup_location) booking.pickup_location = pickup_location;
    if (dropoff_location) booking.dropoff_location = dropoff_location;
    if (notes !== undefined) booking.notes = notes;

    await booking.save();

    return res.status(200).json({
      message: "Booking updated successfully.",
      booking,
    });
  } catch (error) {
    console.error("updateBooking error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────
// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (owner or admin)
// ─────────────────────────────────────────────
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Only owner or admin can cancel
    if (
      req.user.role !== "admin" &&
      booking.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    if (["completed", "cancelled"].includes(booking.status)) {
      return res.status(400).json({
        message: `Booking is already ${booking.status}.`,
      });
    }
    if (booking.status === "active") {
      return res.status(400).json({
        message: "Cannot cancel an active booking. Contact support.",
      });
    }

    // Validate cancellation_reason length
    const { cancellation_reason } = req.body;
    if (cancellation_reason && cancellation_reason.length > 500) {
      return res.status(400).json({
        message: "Cancellation reason cannot exceed 500 characters.",
      });
    }

    booking.status = "cancelled";
    booking.cancellation_reason = cancellation_reason ?? null;
    // cancelled_at is auto-set by pre-save middleware

    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully.",
      booking,
    });
  } catch (error) {
    console.error("cancelBooking error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────
// @desc    Confirm a booking (admin only)
// @route   PATCH /api/bookings/:id/confirm
// @access  Private (admin)
// ─────────────────────────────────────────────
export const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: `Only pending bookings can be confirmed. Current status: ${booking.status}.`,
      });
    }

    booking.status = "confirmed";
    await booking.save();

    return res.status(200).json({ message: "Booking confirmed.", booking });
  } catch (error) {
    console.error("confirmBooking error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────
// @desc    Activate a booking (vehicle picked up)
// @route   PATCH /api/bookings/:id/activate
// @access  Private (admin)
// ─────────────────────────────────────────────
export const activateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        message: "Only confirmed bookings can be activated.",
      });
    }

    booking.status = "active";

    // Record odometer and fuel level at pickup
    if (req.body.odometer_start !== undefined) {
      booking.odometer_start = req.body.odometer_start;
    }
    if (req.body.fuel_level_pickup) {
      booking.fuel_level_pickup = req.body.fuel_level_pickup;
    }

    await booking.save();

    return res.status(200).json({
      message: "Booking activated. Vehicle is now with the customer.",
      booking,
    });
  } catch (error) {
    console.error("activateBooking error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────
// @desc    Complete a booking (vehicle returned)
// @route   PATCH /api/bookings/:id/complete
// @access  Private (admin)
// ─────────────────────────────────────────────
export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (booking.status !== "active") {
      return res.status(400).json({
        message: "Only active bookings can be completed.",
      });
    }

    booking.status = "completed";
    // completed_at is auto-set by pre-save middleware

    // Record actual return time
    booking.actual_dropoff_datetime = new Date();

    // Record odometer and fuel at dropoff
    if (req.body.odometer_end !== undefined) {
      booking.odometer_end = req.body.odometer_end;
    }
    if (req.body.fuel_level_dropoff) {
      booking.fuel_level_dropoff = req.body.fuel_level_dropoff;
    }

    // Extra charges (late return, fuel difference, damage, etc.)
    if (req.body.extra_charges?.length) {
      booking.extra_charges = req.body.extra_charges;
    }

    await booking.save();

    return res.status(200).json({
      message: "Booking completed. Vehicle returned.",
      booking,
    });
  } catch (error) {
    console.error("completeBooking error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────
// @desc    Update payment status (called by payment controller)
// @route   PATCH /api/bookings/:id/payment-status
// @access  Private (admin or internal)
// ─────────────────────────────────────────────
export const updatePaymentStatus = async (req, res) => {
  try {
    const { payment_status, payment } = req.body;

    const validStatuses = ["pending", "paid", "partial", "refunded", "failed"];
    if (!payment_status || !validStatuses.includes(payment_status)) {
      return res.status(400).json({
        message: `Invalid payment_status. Must be one of: ${validStatuses.join(", ")}.`,
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    booking.payment_status = payment_status;

    // Optionally link the Payment document
    if (payment) {
      booking.payment = payment;
    }

    await booking.save();

    return res.status(200).json({ message: "Payment status updated.", booking });
  } catch (error) {
    console.error("updatePaymentStatus error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────
// @desc    Check vehicle availability for a time window
// @route   GET /api/bookings/availability?vehicle=&pickup=&dropoff=
// @access  Public
// ─────────────────────────────────────────────
export const checkAvailability = async (req, res) => {
  try {
    const { vehicle, pickup, dropoff } = req.query;

    if (!vehicle || !pickup || !dropoff) {
      return res.status(400).json({
        message: "vehicle, pickup, and dropoff query params are required.",
      });
    }

    const pickupDate = new Date(pickup);
    const dropoffDate = new Date(dropoff);

    if (isNaN(pickupDate) || isNaN(dropoffDate)) {
      return res.status(400).json({ message: "Invalid date format." });
    }
    if (dropoffDate <= pickupDate) {
      return res.status(400).json({ message: "Dropoff must be after pickup." });
    }

    const available = await isVehicleAvailable(vehicle, pickupDate, dropoffDate);

    return res.status(200).json({ available });
  } catch (error) {
    console.error("checkAvailability error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
