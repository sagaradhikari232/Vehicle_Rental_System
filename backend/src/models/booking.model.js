import { Schema, model, Types } from "mongoose";

const bookingSchema = new Schema(
  {
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

    pickup_datetime: {
      type: Date,
      required: true,
    },
    dropoff_datetime: {
      type: Date,
      required: true,
    },

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

    total_rent_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    security_deposit: {
      type: Number,
      required: true,
      min: 0,
    },

    // Add at least one of these two
    payment_status: {
      type: String,
      enum: ["pending", "paid", "partial", "refunded", "failed"],
      default: "pending",
    },
    // or / and
    payment: {
       type: Schema.Types.ObjectId,
       ref: "Payment"
       },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
        // "rejected", "expired" ← consider later
      ],
      default: "pending",
      required: true,
    },

    // Optional but frequent
    notes: String,
    cancellation_reason: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Very important compound index for availability queries
bookingSchema.index({ vehicle: 1, pickup_datetime: 1, dropoff_datetime: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });     // user's recent bookings

export const Booking = model("Booking", bookingSchema);