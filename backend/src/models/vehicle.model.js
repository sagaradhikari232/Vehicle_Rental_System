import mongoose, { Schema } from "mongoose";


const vehicleSchema = new Schema({
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true,
    maxlength: [20, 'Model name too long']
  },

  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    maxlength: [15, 'Brand name too long']
  },

  registration_number: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [
      /^[A-Z]{2}\s*\d{1,3}\s*[A-Z]{2}\s*\d{1,4}$/i,      ,
      'Invalid registration number format. Example: LU 19 PA 1428'
    ]
  },

  type: {
    type: String,
    enum: ['car', 'bike', 'scooter', 'suv', 'jeep'],
    required: [true, 'Vehicle type is required']
  },

  fuel_type: {
    type: String,
    enum: ['petrol', 'diesel', 'electric'],
    required: [true, 'Fuel type is required']
  },

  seats: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: [1, 'At least 1 seat required'],
    max: [8, 'Too many seats']
  },

  daily_rate: {
    type: Number,
    required: [true, 'Daily rate is required'],
    min: [500, 'Rate cannot be negative'],
    max: [15000, 'Rate is too high']
  },

  hourly_rate: {
    type: Number,
    min: [100, 'Rate cannot be negative'],
    max: [2500, 'Rate is too high']
  },

  image_url: {
    type: String,
    trim: true,
    validate: {
      validator: v => /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v),
      message: 'Invalid image URL'
    }
  },

  status: {
    type: String,
    enum: ['available', 'booked', 'maintenance'],
    default: 'available',
    required: true
  },

  location: {
    type: String,
    trim: true,
    maxlength: [255],
  },

  mileage: {
    type: Number,
    trim: true,
    max: [60, 'Mileage is too high'],
    min: [10, 'Mileage is too low']
  },

  battery_range: {
    type: Number,
    min: [30, 'Battery range is too low'],
    max: [700, 'Battery range is too high']
  },

  last_maintenance: {
    type: Date
  },

  registeredBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


export const Vehicle = mongoose.model('Vehicle', vehicleSchema);