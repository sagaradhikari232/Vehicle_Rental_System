import { Schema, model } from "mongoose";

const bookingSchema = new Schema(
  {
    // ─── Core References ───────────────────────────────────────
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vehicle: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    // ─── Schedule ──────────────────────────────────────────────
    pickup_datetime: {
      type: Date,
      required: true,
    },

    dropoff_datetime: {
      type: Date,
      required: true,
      validate: {
        validator: function () {
          return this.dropoff_datetime > this.pickup_datetime;
        },
        message: "dropoff_datetime must be after pickup_datetime",
      },
    },

    // Actual return time — may differ from dropoff_datetime (late/early return)
    actual_dropoff_datetime: {
      type: Date,
      default: null,
    },

    // ─── Locations ─────────────────────────────────────────────
    pickup_location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    dropoff_location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    // ─── Financials ────────────────────────────────────────────
    total_rent_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // 0 means no deposit required for this booking
    security_deposit: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Extra charges added at completion (late return, fuel, damage, etc.)
    extra_charges: [
      {
        reason: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],

    // ─── Payment ───────────────────────────────────────────────
    payment_status: {
      type: String,
      enum: ["pending", "paid", "partial", "refunded", "failed"],
      default: "pending",
    },

    // Linked once a payment document is created
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },

    // ─── Booking Status ────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "confirmed", "active", "completed", "cancelled"],
      default: "pending",
      required: true,
    },

    // Auto-set by pre-save middleware on status change
    cancelled_at: {
      type: Date,
      default: null,
    },
    completed_at: {
      type: Date,
      default: null,
    },

    // ─── Vehicle Condition at Pickup / Dropoff ─────────────────
    odometer_start: {
      type: Number,
      min: 0,
      default: null,
    },

    odometer_end: {
      type: Number,
      min: 0,
      default: null,
    },

    fuel_level_pickup: {
      type: String,
      enum: ["empty", "quarter", "half", "three_quarter", "full"],
      default: null,
    },

    fuel_level_dropoff: {
      type: String,
      enum: ["empty", "quarter", "half", "three_quarter", "full"],
      default: null,
    },

    // ─── Notes ─────────────────────────────────────────────────
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    cancellation_reason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ──────────────────────────────────────────────────

// Planned duration in hours
bookingSchema.virtual("duration_hours").get(function () {
  if (!this.pickup_datetime || !this.dropoff_datetime) return null;
  return (this.dropoff_datetime - this.pickup_datetime) / (1000 * 60 * 60);
});

// Actual duration in hours (uses actual_dropoff if available)
bookingSchema.virtual("actual_duration_hours").get(function () {
  if (!this.pickup_datetime) return null;
  const end = this.actual_dropoff_datetime || this.dropoff_datetime;
  return (end - this.pickup_datetime) / (1000 * 60 * 60);
});

// Total mileage driven
bookingSchema.virtual("total_mileage").get(function () {
  if (this.odometer_start == null || this.odometer_end == null) return null;
  return this.odometer_end - this.odometer_start;
});

// Total extra charges amount
bookingSchema.virtual("total_extra_charges").get(function () {
  if (!this.extra_charges?.length) return 0;
  return this.extra_charges.reduce((sum, c) => sum + c.amount, 0);
});

// Grand total = rent + extra charges
bookingSchema.virtual("grand_total").get(function () {
  return (this.total_rent_amount ?? 0) + (this.total_extra_charges ?? 0);
});

// ─── Middleware ─────────────────────────────────────────────────

// Auto-set cancelled_at / completed_at on status change
bookingSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "cancelled" && !this.cancelled_at) {
      this.cancelled_at = new Date();
    }
    if (this.status === "completed" && !this.completed_at) {
      this.completed_at = new Date();
    }
  }
  next();
});

// ─── Indexes ────────────────────────────────────────────────────

// Availability check: find overlapping bookings for a vehicle
bookingSchema.index({ vehicle: 1, pickup_datetime: 1, dropoff_datetime: 1 });

// User's booking history (most recent first)
bookingSchema.index({ user: 1, createdAt: -1 });

// Filter bookings by status
bookingSchema.index({ status: 1 });

// Admin / ops: bookings by vehicle and status
bookingSchema.index({ vehicle: 1, status: 1 });

export const Booking = model("Booking", bookingSchema);
