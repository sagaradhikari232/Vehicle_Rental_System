import { useState, useEffect, useMemo } from 'react';
import Section from '../common/Section';
import VehicleCard from './VehicleCard';
import { SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const VEHICLES_PER_PAGE = 6;

const FUEL_TYPES = ['All', 'Petrol', 'Diesel', 'Electric'];
const VEHICLE_TYPES = ['All', 'Bike', 'Scooter', 'Car', 'SUV'];
const PRICE_RANGES = [
  { label: 'Any Price',          min: 0,     max: 15000 },
  { label: 'Under ₹2,000/day',  min: 0,     max: 2000 },
  { label: '₹2,000 – ₹5,000',  min: 2000,  max: 5000 },
  { label: '₹5,000 – ₹10,000', min: 5000,  max: 10000 },
  { label: '₹10,000+/day',      min: 10000, max: 15000 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = () => (
  <div className="text-center mb-12">
    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
      Featured Collection
    </h2>
    <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
      Discover our most loved vehicles, trusted by thousands of riders for their
      performance and reliability
    </p>
  </div>
);

const LoadingGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-[480px]" />
    ))}
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="text-center py-20">
    <p className="text-gray-500 text-lg mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="px-6 py-2 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
    >
      Try Again
    </button>
  </div>
);

// Pill-style filter button
const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 whitespace-nowrap
      ${active
        ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
        : 'bg-white border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500'
      }`}
  >
    {label}
  </button>
);

// Filter bar with all three filter groups
const FilterBar = ({ filters, onChange, activeCount, onReset }) => (
  <div className="mb-10 space-y-4">
    {/* Header row */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-700 font-semibold">
        <SlidersHorizontal size={18} className="text-orange-500" />
        <span>Filter Vehicles</span>
        {activeCount > 0 && (
          <span className="ml-1 bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
            {activeCount} active
          </span>
        )}
      </div>
      {activeCount > 0 && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-orange-500 transition-colors"
        >
          <X size={14} />
          Reset all
        </button>
      )}
    </div>

    {/* Vehicle Type */}
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Type</p>
      <div className="flex flex-wrap gap-2">
        {VEHICLE_TYPES.map((t) => (
          <FilterPill
            key={t}
            label={t}
            active={filters.vehicleType === t}
            onClick={() => onChange('vehicleType', t)}
          />
        ))}
      </div>
    </div>

    {/* Fuel Type */}
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Fuel Type</p>
      <div className="flex flex-wrap gap-2">
        {FUEL_TYPES.map((f) => (
          <FilterPill
            key={f}
            label={f}
            active={filters.fuelType === f}
            onClick={() => onChange('fuelType', f)}
          />
        ))}
      </div>
    </div>

    {/* Price Range */}
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">Price Range</p>
      <div className="flex flex-wrap gap-2">
        {PRICE_RANGES.map((r) => (
          <FilterPill
            key={r.label}
            label={r.label}
            active={filters.priceRange.label === r.label}
            onClick={() => onChange('priceRange', r)}
          />
        ))}
      </div>
    </div>
  </div>
);

// Pagination controls
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-full border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-full text-sm font-semibold transition-all duration-200
            ${currentPage === page
              ? 'bg-orange-500 text-white shadow-md scale-110'
              : 'border border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500'
            }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-full border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

// ─── Data helpers ─────────────────────────────────────────────────────────────

const normalizeVehicle = (v) => ({
  _id:          v._id,
  name:         `${v.brand} ${v.model}`,
  category:     v.type,
  image:        v.image_url,
  price:        v.daily_rate,
  fuelType:     v.fuel_type,
  transmission: v.fuel_type === 'electric' ? 'Automatic' : 'Manual',
  rating:       v.rating ?? 4.5,
  features:     v.features?.length
    ? v.features
    : [v.fuel_type, `${v.seats} seats`].filter(Boolean),
  status:       v.status,
  location:     v.location,
  seats:        v.seats,
  range:        v.fuel_type === 'electric' ? `${v.battery_range}` : `${v.mileage}`,
});

const DEFAULT_FILTERS = {
  vehicleType: 'All',
  fuelType:    'All',
  priceRange:  PRICE_RANGES[0],
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function PopularVehicle() {
  const [vehicles, setVehicles]   = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [filters, setFilters]     = useState(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/v1/vehicles/get-allvehicles', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const json = await res.json();

      const raw =
        Array.isArray(json)                 ? json              :
        Array.isArray(json.data)            ? json.data         :
        Array.isArray(json.vehicles)        ? json.vehicles     :
        Array.isArray(json.data?.vehicles)  ? json.data.vehicles :
        [];

      if (raw.length === 0) console.warn('Could not find vehicle array in response:', json);

      const available = raw.filter((v) => v.status === 'available');
      setVehicles(available.map(normalizeVehicle));
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
      setError('Failed to load vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  // ── Filter handler ─────────────────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // reset to first page on filter change
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  // Count active (non-default) filters
  const activeFilterCount = [
    filters.vehicleType !== 'All',
    filters.fuelType !== 'All',
    filters.priceRange.label !== PRICE_RANGES[0].label,
  ].filter(Boolean).length;

  // ── Derived data ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchType  = filters.vehicleType === 'All' ||
        v.category?.toLowerCase() === filters.vehicleType.toLowerCase();
      const matchFuel  = filters.fuelType === 'All' ||
        v.fuelType?.toLowerCase() === filters.fuelType.toLowerCase();
      const matchPrice = v.price >= filters.priceRange.min &&
        v.price < filters.priceRange.max;
      return matchType && matchFuel && matchPrice;
    });
  }, [vehicles, filters]);

  const totalPages   = Math.ceil(filtered.length / VEHICLES_PER_PAGE);
  const paginated    = filtered.slice(
    (currentPage - 1) * VEHICLES_PER_PAGE,
    currentPage * VEHICLES_PER_PAGE,
  );

  // If current page becomes out of range after filtering, snap back
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [totalPages, currentPage]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Section id="vehicles" background="white">
      <SectionHeader />

      {/* Filters – only show once data is loaded */}
      {!loading && !error && (
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          activeCount={activeFilterCount}
          onReset={handleReset}
        />
      )}

      {/* Results meta */}
      {!loading && !error && vehicles.length > 0 && (
        <p className="text-sm text-gray-400 mb-6">
          Showing{' '}
          <span className="font-semibold text-gray-600">
            {(currentPage - 1) * VEHICLES_PER_PAGE + 1}–
            {Math.min(currentPage * VEHICLES_PER_PAGE, filtered.length)}
          </span>{' '}
          of <span className="font-semibold text-gray-600">{filtered.length}</span> vehicles
        </p>
      )}

      {/* States */}
      {loading && <LoadingGrid />}

      {!loading && error && (
        <ErrorState message={error} onRetry={fetchVehicles} />
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-3">No vehicles match your filters.</p>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {!loading && !error && paginated.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {paginated.map((vehicle) => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                isHovered={hoveredId === vehicle._id}
                onHoverChange={(isHovered) =>
                  setHoveredId(isHovered ? vehicle._id : null)
                }
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </Section>
  );
}