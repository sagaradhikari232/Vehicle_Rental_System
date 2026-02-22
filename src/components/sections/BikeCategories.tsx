import { Zap, Bike, Wind } from 'lucide-react';
import { useState } from 'react';
import Section from '../common/Section';
import CategoryCard from './CategoryCard';
import { categories } from '../../data/bikes';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Bike,
  Wind,
};

const SectionHeader = () => (
  <div className="text-center mb-20">
    <div className="inline-block mb-6">
      <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold">
        BIKE CATEGORIES
      </span>
    </div>
    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
      Explore Our Collection
    </h2>
    <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
      Choose from our diverse range of premium bikes, each perfectly suited for different riding styles and adventures
    </p>
  </div>
);

export default function BikeCategories() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <Section id="categories" background="gray">
      <SectionHeader />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {categories.map((category) => {
          const IconComponent = ICON_MAP[category.icon];
          return (
            <CategoryCard
              key={category.id}
              category={category}
              isHovered={hoveredId === category.id}
              onHoverChange={(isHovered) => setHoveredId(isHovered ? category.id : null)}
              iconComponent={IconComponent}
            />
          );
        })}
      </div>
    </Section>
  );
}
