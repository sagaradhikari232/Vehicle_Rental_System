import VehicleCard from '../sections/VehicleCard';

export default function SimilarVehicles({ vehicles }) {
  if (vehicles.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-1">
            You May Also Like
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Similar Vehicles</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </section>
  );
}