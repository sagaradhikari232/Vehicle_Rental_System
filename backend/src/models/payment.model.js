import { Schema, model } from "mongoose";

const paymentSchema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Amount in NPR (human-readable)
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ─── Khalti specific fields ───────────────────────────────

    // pidx: Khalti's unique payment identifier — returned on initiate
    // Used for all future references including lookup
    pidx: {
      type: String,
      default: null,
    },

    // Khalti's transaction_id — only available after Completed status
    khalti_transaction_id: {
      type: String,
      default: null,
    },

    // The payment URL Khalti returns — frontend redirects user here
    payment_url: {
      type: String,
      default: null,
    },

    // Khalti payment link expiry time
    expires_at: {
      type: Date,
      default: null,
    },

    // ─── Status ───────────────────────────────────────────────

    // Maps to Khalti lookup statuses + our own internal ones
    status: {
      type: String,
      enum: [
        "initiated",    // payment created on our side, not yet sent to Khalti
        "pending",      // sent to Khalti, awaiting user payment
        "completed",    // Khalti confirmed: status = "Completed"
        "failed",       // Khalti returned failed
        "expired",      // Khalti payment link expired
        "refunded",     // Khalti confirmed refund
        "user_canceled",// User canceled on Khalti's payment page
      ],
      default: "initiated",
      required: true,
    },

    // Raw Khalti lookup response — stored for audit/debugging
    khalti_response: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────────
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ pidx: 1 }, { sparse: true }); // fast lookup by Khalti pidx
paymentSchema.index({ status: 1 });

export const Payment = model("Payment", paymentSchema);