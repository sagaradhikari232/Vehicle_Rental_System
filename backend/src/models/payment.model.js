// models/Payment.js
import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema({
  booking_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Booking',
    index: true
  },

  rental_amount: {
    type: Number,
    required: true, min: 0
  },
  security_deposit: {
    type: Number,
    default: 0,
    min: 0
  },
  total_charged: {
    type: Number,
    required: true,
    min: 0
  },

  payment_method: {
    type: String,
    enum: ['khalti', 'cash', 'card'],
    required: true
  },

  payment_gateway: {
    type: String,
    enum: [ 'khalti', 'cash', 'manual'],
    required: true
  },

  // Method-specific
  khalti_pidx: { type: String, sparse: true, unique: true },
  transaction_note: String,   // manual entry / receipt number

  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'partially_paid', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending',
    index: true
  },

  paid_at: Date,
  refunded_at: Date,
  failed_at: Date,

  currency: { type: String, default: 'NPR' },

  // Optional but very useful
  payer_phone: String,
  payer_name: String,
  remarks: String,

  gateway_raw: { type: Schema.Types.Mixed }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

paymentSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'paid' && !this.paid_at) {
    this.paid_at = new Date();
  }
  next();
});

paymentSchema.index({ booking_id: 1, status: 1 });
paymentSchema.index({ status: 1, paid_at: -1 });


// Virtual for display (optional)
paymentSchema.virtual('displayId').get(function () {
  return `PAY-${this.id.toString().padStart(8, '0')}`;  // e.g. PAY-00050001
});

// Pre-save: basic business rules
paymentSchema.pre('save', function (next) {
  // If status = 'paid' but no paid_at → set it automatically
  if (this.isModified('status') && this.status === 'paid' && !this.paid_at) {
    this.paid_at = new Date();
  }

  // Optional: cash payments usually don't have transaction_id
  if (this.payment_method === 'cash' && this.transaction_id) {
    this.transaction_id = null;
  }

  next();
});

// Useful indexes
paymentSchema.index({ booking_id: 1, status: 1 });
paymentSchema.index({ status: 1, paid_at: -1 });     // For reports: recent successful payments

export const Payment = mongoose.model('Payment', paymentSchema);

