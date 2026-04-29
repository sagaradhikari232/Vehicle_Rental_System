import { useState, useEffect } from 'react';
import Section from '../common/Section';
import VehicleCard from './VehicleCard';
import { Fuel } from 'lucide-react';

const SectionHeader = () => (
  <div className="text-center mb-20">
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
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="rounded-2xl bg-gray-100 animate-pulse h-[480px]"
      />
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

// Maps DB schema fields → VehicleCard expected fields
const normalizeVehicle = (v) => ({
  _id:      v._id,
  name:     `${v.brand} ${v.model}`,
  category: v.type,
  image:    v.image_url,
  price:    v.daily_rate,
  fuelType: v.fuel_type,
  transmission: v.fuel_type == 'electric' ? 'Automatic' : 'Manual',
  rating:   v.rating ?? 4.5,                          // not in schema; default
  features: v.features?.length                         // not in schema; derive
    ? v.features
    : [v.fuel_type, `${v.seats} seats`].filter(Boolean),
  status:   v.status,
  location: v.location,
   seats: v.seats,
   range: v.fuel_type == 'electric' ? `${v.battery_range}`: `${v.mileage}`
  });

export default function PopularVehicle() {
  const [vehicles, setVehicles]   = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken'); // adjust key if different

      const res = await fetch('/api/v1/vehicles/get-allvehicles', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
       
      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const json = await res.json();
      
      // console.log('API response:', json); // 👈 check this in console, then remove

      // Robustly extract the array wherever it lives
const raw =
  Array.isArray(json)             ? json              :  // plain array
  Array.isArray(json.data)        ? json.data         :  // { data: [...] }
  Array.isArray(json.vehicles)    ? json.vehicles     :  // { vehicles: [...] }
  Array.isArray(json.data?.vehicles) ? json.data.vehicles : // { data: { vehicles: [...] } }
  [];

if (raw.length === 0) {
  console.warn('Could not find vehicle array in response:', json);
}

const available = raw.filter((v) => v.status === 'available');
setVehicles(available.map(normalizeVehicle));
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
      setError('Failed to load vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <Section id="vehicles" background="white">
      <SectionHeader />

      {loading && <LoadingGrid />}

      {!loading && error && (
        <ErrorState message={error} onRetry={fetchVehicles} />
      )}

      {!loading && !error && vehicles.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No vehicles available right now.</p>
        </div>
      )}

      {!loading && !error && vehicles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {vehicles.map((vehicle) => (
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
      )}
    </Section>
  );
}