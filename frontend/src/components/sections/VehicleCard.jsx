import { Star } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';

export default function VehicleCard({ vehicle, isHovered, onHoverChange }) {
  const navigate = useNavigate();

  const handleRentNow = () => {
    // console.log(vehicle)
    navigate(`/vehicle/${vehicle._id}`, {state: {vehicle: vehicle}})
  }
  return (
    <Card
      hover
      gradient
      className="overflow-hidden h-full flex flex-col"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <div className="relative h-72 overflow-hidden bg-gray-100">
        <img
          src={vehicle.image}
          alt={vehicle.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
          {vehicle.category}
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {vehicle.name}
        </h3>

        <div className="flex flex-wrap gap-2 mb-6">
          {vehicle.features.map((feature, idx) => (
            <span
              key={idx}
              className="text-xs bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 px-3 py-1.5 rounded-lg font-medium border border-orange-200"
            >
              {feature}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-auto">
          <div>
            <p className="text-sm text-gray-600 mb-1">Starting from</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Rs.{vehicle.price}
            </p>
            <p className="text-xs text-gray-500 mt-1">per day</p>
          </div>
          <Button size="md" onClick = {handleRentNow}>Rent Now</Button>
        </div>
      </div>
    </Card>
  );
}