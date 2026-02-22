import Card from '../common/Card';
import { Category } from '../../types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {};

interface CategoryCardProps {
  category: Category;
  isHovered: boolean;
  onHoverChange: (isHovered: boolean) => void;
  iconComponent: React.ComponentType<{ className?: string }>;
}

export default function CategoryCard({
  category,
  isHovered,
  onHoverChange,
  iconComponent: IconComponent
}: CategoryCardProps) {
  return (
    <Card
      hover
      className="p-10 text-center h-full flex flex-col justify-center"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <div className="relative mb-6">
        <div
          className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto transition-all duration-500 ${
            isHovered
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/50 scale-110'
              : 'bg-gradient-to-br from-orange-100 to-orange-50'
          }`}
        >
          <IconComponent
            className={`w-12 h-12 transition-all duration-500 ${
              isHovered ? 'text-white scale-110' : 'text-orange-500'
            }`}
          />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3 transition-all duration-300">
        {category.name}
      </h3>
      <p className={`transition-all duration-300 ${isHovered ? 'text-gray-700' : 'text-gray-600'}`}>
        {category.description}
      </p>
    </Card>
  );
}
