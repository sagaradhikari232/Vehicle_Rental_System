// controllers/vehicleController.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Vehicle } from "../models/vehicle.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { getRecommendations } from '../services/recommendationService.js';
import mongoose from "mongoose";

// Function to add vehicle to cookie for recommendation
const addToRecentlyViewed = (req, res, next) => {
  const vehicleId = String(req.params.id);

  let recentViewed = [];
  try {
    const parsed = req.cookies.recentViewed
      ? JSON.parse(req.cookies.recentViewed)
      : [];
    recentViewed = Array.isArray(parsed) ? parsed : [];
  } catch {
    recentViewed = [];
  }

  recentViewed = recentViewed.filter(id => id !== vehicleId);
  recentViewed.unshift(vehicleId);
  recentViewed = recentViewed.slice(0, 5);

  res.cookie('recentViewed', JSON.stringify(recentViewed), {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  next();
};


const getRecommendedVehicles = async (req, res) => {
  try {
    let recentIds = [];
    try {
      const parsed = req.cookies.recentViewed
        ? JSON.parse(req.cookies.recentViewed)
        : [];
      recentIds = Array.isArray(parsed) ? parsed : [];
    } catch {
      recentIds = [];
    }
    var recent = recentIds[0]
    var type 
    // console.log(recent)
    // console.log('recentIds from cookie:', recentIds); // 👈 check this
    if (recent){
    const currentvehicle = await Vehicle.findById(recent)
    type = currentvehicle.type
    }

    const availableVehicles = await Vehicle.find({ status: 'available', type: type });
    // console.log('available vehicles are', availableVehicles)

    if (recentIds.length === 0) {
      const fallback = availableVehicles.slice(0, 6).map(v => v.toObject());
      return res.json({ recommendations: fallback, basedOn: 'popular' });
    }

    const recommendations = getRecommendations(recentIds, availableVehicles);
    console.log("log from recommnedatoins", recommendations)
    res.json({ recommendations, basedOn: 'recentlyViewed', viewedCount: recentIds.length });

  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).json({ message: 'Could not fetch recommendations' });
  }
};

// ────────────────────────────────────────────────
// 1. CREATE VEHICLE (usually restricted to admin/manager)
// ────────────────────────────────────────────────
const registerVehicle = asyncHandler(async (req, res) => {
  // 1. Strict admin/fleet authorization
  // const user = await User.findOne({
  //     $or: [{ username }, { email }],
  //   });
  //   console.log(user)
  
  //   if (!user) {
  //     throw new ApiError("404", "user not found !!!");
  //   }
  console.log(req.user)
  if (!req.user || !['admin', 'fleet_manager'].includes(req.user.role)) {
    throw new ApiError(403, "Only admins and fleet managers can register vehicles");
  }

  const {
    model,
    brand,
    registration_number,
    type,
    fuel_type,
    seats,
    daily_rate,
    hourly_rate,
    image_url,
    status,
    location,
    mileage,
    battery_range,
    last_maintenance,
    registeredBy,
  } = req.body;

  // ──────────────────────────────────────────────
  // Strong validation (array-based for clean errors)
  // ──────────────────────────────────────────────
  const errors = [];

  if (!model?.trim()) errors.push("Model is required");
  if (!brand?.trim()) errors.push("Brand is required");

  // Nepal-specific registration number validation
  // Examples: "Ba 2 Cha 1234", "Lumbini Ba 1-5678", "A BC 1234", "Ga 12-3456"
  const nepRegRegex = /^(?:[A-Za-z]+(?:\s|-)?)?[A-Za-z]\s?[A-Za-z]?\s?-?\s?\d{1,4}(?:\s?-?\s?\d{1,4})?$/i;
  const regUpper = registration_number?.trim().toUpperCase();
  if (!regUpper || !nepRegRegex.test(regUpper)) {
    errors.push("Invalid Nepali registration number format (e.g. Ba 2 Cha 1234 or Lumbini Ba 1-5678)");
  }

  // Vehicle type (expanded for Nepal context)
  const validTypes = ['car', 'bike', 'scooter', 'suv', 'jeep', 'ev'];
  if (!type || !validTypes.includes(type.toLowerCase())) {
    errors.push(`Invalid vehicle type. Allowed: ${validTypes.join(', ')}`);
  }

  const validFuels = ['petrol', 'diesel', 'electric'];
  if (!fuel_type || !validFuels.includes(fuel_type.toLowerCase())) {
    errors.push(`Invalid fuel type. Allowed: ${validFuels.join(', ')}`);
  }

  const seatsNum = Number(seats);
  if (!Number.isInteger(seatsNum) || seatsNum < 1 || seatsNum > 8) {
    errors.push("Seats must be integer between 1–8");
  }

  // Pricing – realistic for Nepal tourist/fleet market 2026
  const daily = Number(daily_rate);
  if (!Number.isFinite(daily) || daily <= 0 || daily > 20000) {
    errors.push("Daily rate must be positive number ≤ NPR 20,000");
  }

  if (hourly_rate !== undefined) {
    const hourly = Number(hourly_rate);
    if (!Number.isFinite(hourly) || hourly <= 0 || hourly > daily / 3) {  // hourly usually < daily/3–4
      errors.push("Hourly rate must be positive and ≤ 1/3 of daily rate");
    }
  }

  // EV validation
  if (type?.toLowerCase() === 'ev') {
    const range = Number(battery_range);
    if (!Number.isFinite(range) || range < 80) {
      errors.push("Electric vehicles must have battery range ≥ 80 km");
    }
  }

  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed", { errors });
  }

  // ──────────────────────────────────────────────
  // Uniqueness check (registration must be globally unique in fleet)
  // ──────────────────────────────────────────────
  const existing = await Vehicle.findOne({
    registration_number: regUpper,
  });

  if (existing) {
    throw new ApiError(409, "Vehicle with this registration number already exists in the fleet");
  }

  // ──────────────────────────────────────────────
  // Image URL validation (still basic – prefer upload in production)
  // ──────────────────────────────────────────────
  let finalImageUrl = undefined;
  if (image_url?.trim()) {
    if (!image_url.match(/^https?:\/\/.*\.(jpg|jpeg|png|webp|svg)$/i)) {
      throw new ApiError(400, "Invalid image URL format (jpg, jpeg, png, webp allowed)");
    }
    finalImageUrl = image_url.trim();
  }


  //  check for images, check for avatar ✅
  console.log("log of req.files from userController:-", req.files);
  const imageLocalPath = req.files?.image_url[0]?.path;


  if (!imageLocalPath) {
    throw new ApiError(400, "Image file is required");
  } 

  // 5. upload them to cloudinary, check for avatar
  const image = await uploadOnCloudinary(imageLocalPath);

  if (!image) {
    throw new ApiError(400, "Image file is required");
  }


  // ──────────────────────────────────────────────
  // Create vehicle – admin/fleet context
  // ──────────────────────────────────────────────
  const vehicle = await Vehicle.create({
    model: model.trim(),
    brand: brand.trim(),
    registration_number: regUpper,
    type: type.toLowerCase(),
    fuel_type: fuel_type.toLowerCase(),
    seats: seatsNum,
    daily_rate: daily,
    hourly_rate: hourly_rate !== undefined ? Number(hourly_rate) : undefined,
    image_url: image.url,
    status: status && ['available', 'maintenance', 'reserved', 'rented', 'inactive'].includes(status)
      ? status
      : 'available',
    location: location?.trim() || 'Lumbini Branch',  // default sensible for your province
    battery_range: battery_range ? Number(battery_range) : undefined,
    last_maintenance: last_maintenance ? safeParseDate(last_maintenance) : undefined,
    // branch: branch?.trim() || req.user.branch || 'Main', // fallback to user's branch if set
    registeredBy: req.user._id,
  });

  return res.status(201).json(
    new ApiResponse(201, vehicle, "Vehicle registered successfully by admin/fleet manager")
  );
});

// Helper to safely parse date (avoid invalid date crashes)
function safeParseDate(value) {
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
}

// ────────────────────────────────────────────────
// 2. GET ALL VEHICLES (with basic filtering & search)
// ────────────────────────────────────────────────

// Helper to safely create a numeric range filter object
const createRangeFilter = (min, max, fieldName) => {
  if (!min && !max) return null;

  const range = {};

  const minNum = min ? Number(min) : null;
  const maxNum = max ? Number(max) : null;

  // Skip invalid numbers
  if (min && isNaN(minNum)) return null;
  if (max && isNaN(maxNum)) return null;

  if (minNum !== null) range.$gte = minNum;
  if (maxNum !== null) range.$lte = maxNum;

  return Object.keys(range).length > 0 ? range : null;
};


const getAllVehicles = asyncHandler(async (req, res) => {
  const {
    type,
    fuel_type,
    status,
    location,
    seats,
    minSeats,
    maxSeats,
    minDailyRate,
    maxDailyRate,
    search,
    page: pageStr,
    limit: limitStr,
  } = req.query;

  const filter = {};

  if (type) filter.type = type.trim();
  if (fuel_type) filter.fuel_type = fuel_type.trim();
  if (status) filter.status = status.trim();

  if (location?.trim()) {
    filter.location = { $regex: location.trim(), $options: 'i' };
  }

  const seatsRange = createRangeFilter(minSeats, maxSeats);
  if (seatsRange) {
    filter.seats = seatsRange;
  } else if (seats) {
    const exact = Number(seats);
    if (!isNaN(exact)) filter.seats = exact;
  }

  const rateRange = createRangeFilter(minDailyRate, maxDailyRate);
  if (rateRange) {
    filter.daily_rate = rateRange;
  }

  if (search?.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { brand: regex },
      { model: regex },
    ];
  }

  // Pagination - safer defaults & guards
  const page = Math.max(1, Number(pageStr) || 1);
  const limit = Math.max(1, Math.min(50, Number(limitStr) || 12)); // cap at 50
  const skip = (page - 1) * limit;

  const vehicles = await Vehicle 
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Vehicle.countDocuments(filter);

  if(total == 0){
    throw new ApiError(404, "Sorry vehicle not found by this category!!")
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        vehicles,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      },
      "Vehicles fetched successfully"
    )
  );
});

// ────────────────────────────────────────────────
// 3. GET SINGLE VEHICLE by MongoDB _id
// ────────────────────────────────────────────────
const getVehicleById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id)

  const vehicle = await Vehicle.findById(id);

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }
 
  return res
    .status(200)
    .json(new ApiResponse(200, vehicle, "Vehicle fetched successfully"));
});

// ────────────────────────────────────────────────
// 4. UPDATE VEHICLE (partial update)
// ────────────────────────────────────────────────
const updateVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid or missing vehicle ID");
  }

  // ✅ Find vehicle FIRST before updating
  const vehicle = await Vehicle.findById(id);

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  // ✅ Auth check BEFORE update (was after before — bug fixed)
  if (vehicle.registeredBy?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this vehicle");
  }

  const allowedUpdates = [
    "model", "brand", "status", "daily_rate",
    "hourly_rate", "image_url", "location",
    "last_maintenance", "battery_range",
  ];

  const updates = {};

  // ✅ Fixed: extract body fields OUTSIDE the image if-block (was inside before — bug fixed)
  for (const key of Object.keys(req.body)) {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  }

  // Handle new image upload
  if (req.files?.image_url?.[0]?.path) {
    const imageLocalPath = req.files.image_url[0].path;

    // Delete old image from Cloudinary
    if (vehicle.image_url) {
      const oldPublicId = extractPublicIdFromUrl(vehicle.image_url);
      if (oldPublicId) await deleteFromCloudinary(oldPublicId).catch(console.error);
    }

    const uploaded = await uploadOnCloudinary(imageLocalPath);
    if (uploaded?.url) {
      updates.image_url = uploaded.url;
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields to update");
  }

  const updatedVehicle = await Vehicle.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVehicle, "Vehicle updated successfully"));
});

// ────────────────────────────────────────────────
// 5. DELETE VEHICLE
// ────────────────────────────────────────────────
const deleteVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vehicle = await Vehicle.findByIdAndDelete(id);

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Vehicle deleted successfully"));
});

export {
  addToRecentlyViewed,
  registerVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getRecommendedVehicles
};