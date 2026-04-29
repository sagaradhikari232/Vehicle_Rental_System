import { Fuel, Settings2, Users, Gauge } from 'lucide-react';

export default function SpecsGrid({ vehicle }) {
  const specs = [
    {
      icon: <Fuel className="w-5 h-5 text-orange-500" />,
      label: 'Fuel Type',
      value: vehicle.fuelType,
    },
    {
      icon: <Settings2 className="w-5 h-5 text-orange-500" />,
      label: 'Transmission',
      value: vehicle.transmission,
    },
    {
      icon: <Users className="w-5 h-5 text-orange-500" />,
      label: 'Seating',
      value: `${vehicle.seats} Seats`,
    },
    {
      icon: <Gauge className="w-5 h-5 text-orange-500" />,
      label: `${vehicle.fuelType == 'electric' ? 'Battery Range': 'Mileage'}`,
      value: vehicle.range,
    },
  ];

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Specifications</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="bg-orange-50/60 border border-orange-100 rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
          >
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
              {spec.icon}
            </div>
            <p className="text-xs text-gray-500 font-medium">{spec.label}</p>
            <p className="text-sm font-bold text-gray-800">{spec.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}