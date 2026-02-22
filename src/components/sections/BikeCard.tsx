import { Star } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Bike } from '../../types';

interface BikeCardProps {
  bike: Bike;
  isHovered: boolean;
  onHoverChange: (isHovered: boolean) => void;
}

export default function BikeCard({ bike, isHovered, onHoverChange }: BikeCardProps) {
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
          src={bike.image}
          alt={bike.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
          {bike.category}
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {bike.name}
        </h3>

        <div className="flex items-center mb-6">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 transition-all ${
                  i < Math.floor(bike.rating)
                    ? 'text-orange-500 fill-orange-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-3 text-sm font-semibold text-gray-700">
            {bike.rating}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {bike.features.map((feature, idx) => (
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
              Rs.{bike.price}
            </p>
            <p className="text-xs text-gray-500 mt-1">per day</p>
          </div>
          <Button size="md">Rent Now</Button>
        </div>
      </div>
    </Card>
  );
}
