/**
 * FavouritesPage.jsx
 * Production-ready Favourites Page for Vehicle Rental Management System
 *
 * Architecture:
 *   FavouritesPage
 *     ├── FavouritesHeader
 *     ├── LoadingSkeleton  (while fetching)
 *     ├── EmptyState       (no favourites)
 *     └── FavouriteVehicleCard[] (grid)
 *           └── BookingModal (on "Book Now")
 */

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  memo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Star,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  Trash2,
  X,
  Calendar,
  MapPin,
  Loader2,
  ChevronDown,
  SlidersHorizontal,
  Bookmark,
  Search,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_FAVOURITES = [
  {
    _id: "v1",
    name: "Toyota Fortuner",
    category: "SUV",
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    price: 5500,
    rating: 4.8,
    status: true,
    features: ["4WD", "AC", "GPS", "Bluetooth"],
    description:
      "The iconic Fortuner offers supreme off-road capability combined with premium comfort for any journey.",
  },
  {
    _id: "v2",
    name: "Hyundai Tucson",
    category: "SUV",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    price: 3800,
    rating: 4.6,
    status: true,
    features: ["AWD", "Sunroof", "Heated Seats", "Apple CarPlay"],
    description:
      "Sleek, modern crossover with top-tier safety features and an elegant cabin.",
  },
  {
    _id: "v3",
    name: "Suzuki Swift",
    category: "Hatchback",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80",
    price: 1800,
    rating: 4.4,
    status: false,
    features: ["AC", "Bluetooth", "Fuel Efficient"],
    description:
      "Nimble city car perfect for urban exploration with excellent fuel economy.",
  },
  {
    _id: "v4",
    name: "BMW 5 Series",
    category: "Sedan",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    price: 8500,
    rating: 4.9,
    status: true,
    features: ["Leather Seats", "Panoramic Roof", "Adaptive Cruise", "HUD"],
    description:
      "The pinnacle of executive driving — effortless power, supreme luxury, and razor-sharp handling.",
  },
  {
    _id: "v5",
    name: "Honda Jazz",
    category: "Hatchback",
    image:
      "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&q=80",
    price: 2200,
    rating: 4.3,
    status: true,
    features: ["AC", "Magic Seats", "Bluetooth"],
    description:
      "Clever, practical city car with Honda's legendary Magic Seat system for maximum versatility.",
  },
  {
    _id: "v6",
    name: "Land Rover Defender",
    category: "SUV",
    image:
      "https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800&q=80",
    price: 12000,
    rating: 4.9,
    status: true,
    features: ["Terrain Response", "360 Camera", "Meridian Audio", "4WD"],
    description:
      "The ultimate adventure companion — born for both the wild mountains and the city streets.",
  },
];

// ─── Utility ─────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── BookingModal ─────────────────────────────────────────────────────────────

const BookingModal = memo(({ vehicle, onClose }) => {
  const today = new Date().toISOString().slice(0, 16);
  const [form, setForm] = useState({
    pickup_datetime: "",
    dropoff_datetime: "",
    pickup_location: "",
    dropoff_location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }, []);

  const totalDays = useMemo(() => {
    if (!form.pickup_datetime || !form.dropoff_datetime) return null;
    const ms =
      new Date(form.dropoff_datetime) - new Date(form.pickup_datetime);
    if (ms <= 0) return null;
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }, [form.pickup_datetime, form.dropoff_datetime]);

  const totalAmount = totalDays ? totalDays * vehicle.price : null;

  const handleSubmit = async () => {
    if (!form.pickup_datetime || !form.dropoff_datetime)
      return setError("Please select both pickup and dropoff date & time.");
    if (new Date(form.dropoff_datetime) <= new Date(form.pickup_datetime))
      return setError("Dropoff must be after pickup.");
    if (!form.pickup_location.trim())
      return setError("Pickup location is required.");

    setLoading(true);
    setError("");
    try {
      // Replace with real api.post('/bookings', ...) call
      await sleep(1500);
      setSuccess(true);
      await sleep(1200);
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Book ${vehicle.name}`}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: "modalIn 0.22s cubic-bezier(.22,.68,0,1.2)" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 px-8 py-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close booking modal"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-orange-100 text-sm font-medium mb-1">Booking</p>
          <h2 className="text-2xl font-extrabold">{vehicle.name}</h2>
          <p className="text-orange-100 text-sm mt-1">
            Rs. {vehicle.price.toLocaleString()} / day
          </p>
        </div>

        {success ? (
          <div className="px-8 py-12 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-xl font-bold text-gray-800">Booking Confirmed!</p>
            <p className="text-sm text-gray-500 text-center">
              Redirecting to payment…
            </p>
          </div>
        ) : (
          <div className="px-8 py-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
            {/* Fields */}
            {[
              {
                label: "Pickup Date & Time",
                name: "pickup_datetime",
                type: "datetime-local",
                min: today,
                placeholder: "",
              },
              {
                label: "Dropoff Date & Time",
                name: "dropoff_datetime",
                type: "datetime-local",
                min: form.pickup_datetime || today,
                placeholder: "",
              },
            ].map(({ label, name, type, min }) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  min={min}
                  value={form[name]}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>
            ))}
            {[
              {
                label: "Pickup Location",
                name: "pickup_location",
                placeholder: "e.g. Thamel, Kathmandu",
                optional: false,
              },
              {
                label: "Dropoff Location",
                name: "dropoff_location",
                placeholder: "e.g. Pokhara",
                optional: true,
              },
            ].map(({ label, name, placeholder, optional }) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  {label}
                  {optional && (
                    <span className="text-gray-400 font-normal text-xs">
                      (optional)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  name={name}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>
            ))}

            {/* Price Summary */}
            {totalDays && (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 font-medium">
                  {totalDays} day{totalDays > 1 ? "s" : ""} × Rs.{" "}
                  {vehicle.price.toLocaleString()}
                </p>
                <p className="text-lg font-black text-orange-600">
                  Rs. {totalAmount.toLocaleString()}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base shadow-lg shadow-orange-200 transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing…</span>
                </>
              ) : (
                "Confirm & Pay with Khalti"
              )}
            </button>
            <p className="text-center text-xs text-gray-400">
              You'll be redirected to Khalti's secure payment page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── LoadingSkeleton ──────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="h-52 bg-gray-200" />
    <div className="p-5 flex flex-col gap-3">
      <div className="h-5 bg-gray-200 rounded-lg w-2/3" />
      <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
      <div className="flex gap-2 mt-1">
        <div className="h-6 w-16 bg-gray-100 rounded-lg" />
        <div className="h-6 w-20 bg-gray-100 rounded-lg" />
        <div className="h-6 w-14 bg-gray-100 rounded-lg" />
      </div>
      <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
        <div className="h-8 w-24 bg-gray-200 rounded-lg" />
        <div className="h-9 w-28 bg-gray-200 rounded-xl" />
      </div>
    </div>
  </div>
);

export const LoadingSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────

export const EmptyState = ({ onExplore }) => (
  <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
    <div
      className="relative mb-8"
      style={{ animation: "floatBadge 3s ease-in-out infinite" }}
    >
      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center shadow-lg shadow-orange-100">
        <Heart className="w-12 h-12 text-orange-300" strokeWidth={1.5} />
      </div>
      <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
        <span className="text-white text-xs font-black">0</span>
      </div>
    </div>
    <h2 className="text-2xl font-extrabold text-gray-800 mb-3">
      No Favourites Yet
    </h2>
    <p className="text-gray-500 max-w-sm text-base leading-relaxed mb-8">
      You haven't saved any vehicles yet. Explore our fleet and tap the heart
      icon to save your favourites here.
    </p>
    <button
      onClick={onExplore}
      className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
    >
      <Search className="w-4 h-4" />
      Explore Vehicles
    </button>
  </div>
);

// ─── FavouriteVehicleCard ─────────────────────────────────────────────────────

const FavouriteVehicleCard = memo(({ vehicle, onRemove, onBook, onViewDetails }) => {
  const [hovered, setHovered] = useState(false);
  const [removing, setRemoving] = useState(false);
  const cardRef = useRef(null);

  const handleRemove = useCallback(
    async (e) => {
      e.stopPropagation();
      setRemoving(true);
      // Optimistic: animate out, then call parent
      await sleep(320);
      onRemove(vehicle._id);
    },
    [onRemove, vehicle._id]
  );

  return (
    <article
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Favourite vehicle: ${vehicle.name}`}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full transition-all duration-300"
      style={{
        boxShadow: hovered
          ? "0 20px 40px -8px rgba(249,115,22,0.18), 0 4px 16px -4px rgba(0,0,0,0.06)"
          : "0 1px 8px -2px rgba(0,0,0,0.06)",
        transform: removing ? "scale(0.92) opacity(0)" : "scale(1)",
        opacity: removing ? 0 : 1,
        transition: removing
          ? "transform 0.3s ease, opacity 0.3s ease"
          : "box-shadow 0.3s ease, transform 0.2s ease",
      }}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={vehicle.image}
          alt={vehicle.name}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {/* Category badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md tracking-wide uppercase">
          {vehicle.category}
        </div>

        {/* Availability */}
        <div
          className={`absolute top-3 right-12 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${
            vehicle.status
              ? "bg-emerald-500 text-white"
              : "bg-gray-500/90 text-white"
          }`}
        >
          {vehicle.status ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
          {vehicle.status ? "Available" : "Unavailable"}
        </div>

        {/* Remove from favourites */}
        <button
          onClick={handleRemove}
          disabled={removing}
          aria-label={`Remove ${vehicle.name} from favourites`}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-rose-500 text-rose-400 hover:text-white flex items-center justify-center shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          {removing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Heart className="w-3.5 h-3.5 fill-rose-400 group-hover:fill-white transition-colors" />
          )}
        </button>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-extrabold text-gray-900 mb-1 leading-tight">
          {vehicle.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(vehicle.rating)
                    ? "text-orange-400 fill-orange-400"
                    : "text-gray-200 fill-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-600">
            {vehicle.rating}
          </span>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {vehicle.features.slice(0, 3).map((f) => (
            <span
              key={f}
              className="text-xs bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-1 rounded-lg font-semibold"
            >
              {f}
            </span>
          ))}
          {vehicle.features.length > 3 && (
            <span className="text-xs text-gray-400 font-medium px-1 py-1">
              +{vehicle.features.length - 3} more
            </span>
          )}
        </div>

        {/* Price + Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">From</p>
            <p className="text-xl font-extrabold text-orange-500">
              Rs.{vehicle.price.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">per day</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(vehicle)}
              aria-label={`View details for ${vehicle.name}`}
              className="p-2.5 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onBook(vehicle)}
              disabled={!vehicle.status}
              aria-label={`Book ${vehicle.name}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-md shadow-orange-100 hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Book
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});

// ─── FavouritesHeader ─────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "added", label: "Recently Added" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const FavouritesHeader = memo(
  ({ count, sortBy, onSortChange, onClearAll }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const handleClick = (e) => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const selectedLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-200">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              My Favourites
            </h1>
          </div>
          <p className="text-gray-500 text-sm ml-12">
            {count === 0
              ? "No saved vehicles"
              : `${count} saved vehicle${count !== 1 ? "s" : ""}`}
          </p>
        </div>

        {count > 0 && (
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-orange-300 rounded-xl text-sm font-semibold text-gray-700 shadow-sm hover:shadow transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              >
                <SlidersHorizontal className="w-4 h-4 text-orange-400" />
                {selectedLabel}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open && (
                <ul
                  role="listbox"
                  className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-20 overflow-hidden"
                  style={{ animation: "dropIn 0.15s ease" }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={sortBy === opt.value}
                      onClick={() => {
                        onSortChange(opt.value);
                        setOpen(false);
                      }}
                      className={`px-4 py-2.5 text-sm cursor-pointer transition-colors duration-100 font-medium ${
                        sortBy === opt.value
                          ? "bg-orange-50 text-orange-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Clear all */}
            <button
              onClick={onClearAll}
              aria-label="Remove all favourites"
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-rose-500 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        )}
      </div>
    );
  }
);

// ─── FavouritesPage ───────────────────────────────────────────────────────────

export default function FavouritesPage() {
  const navigate = useNavigate();

  // In production: replace with API fetch (e.g., useFavourites() hook)
  const [loading, setLoading] = useState(true);
  const [favourites, setFavourites] = useState([]);
  const [sortBy, setSortBy] = useState("added");
  const [bookingVehicle, setBookingVehicle] = useState(null);

  // Simulate initial fetch
  useEffect(() => {
    const fetch = async () => {
      await sleep(1200);
      setFavourites(MOCK_FAVOURITES);
      setLoading(false);
    };
    fetch();
  }, []);

  // Optimistic remove
  const handleRemove = useCallback((vehicleId) => {
    setFavourites((prev) => prev.filter((v) => v._id !== vehicleId));
    // In production: api.delete(`/favourites/${vehicleId}`)
  }, []);

  const handleClearAll = useCallback(() => {
    setFavourites([]);
    // In production: api.delete('/favourites')
  }, []);

  const handleViewDetails = useCallback(
    (vehicle) => {
      navigate(`/vehicle/${vehicle._id}`, { state: { vehicle } });
    },
    [navigate]
  );

  const handleBook = useCallback((vehicle) => {
    setBookingVehicle(vehicle);
  }, []);

  const handleExplore = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Sorted list
  const sortedFavourites = useMemo(() => {
    const list = [...favourites];
    switch (sortBy) {
      case "price_asc":
        return list.sort((a, b) => a.price - b.price);
      case "price_desc":
        return list.sort((a, b) => b.price - a.price);
      case "rating":
        return list.sort((a, b) => b.rating - a.rating);
      default:
        return list; // "added" order — original mock order
    }
  }, [favourites, sortBy]);

  return (
    <>
      {/* Global keyframe styles */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.93) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatBadge {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        {/* Subtle decorative header gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <FavouritesHeader
            count={favourites.length}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearAll={handleClearAll}
          />

          {loading ? (
            <LoadingSkeleton count={6} />
          ) : favourites.length === 0 ? (
            <EmptyState onExplore={handleExplore} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedFavourites.map((vehicle, i) => (
                <div
                  key={vehicle._id}
                  style={{
                    animation: `fadeSlideUp 0.4s ease both`,
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <FavouriteVehicleCard
                    vehicle={vehicle}
                    onRemove={handleRemove}
                    onBook={handleBook}
                    onViewDetails={handleViewDetails}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Booking Modal */}
      {bookingVehicle && (
        <BookingModal
          vehicle={bookingVehicle}
          onClose={() => setBookingVehicle(null)}
        />
      )}
    </>
  );
}