import { useState } from 'react';
import Section from '../common/Section';
import BikeCard from './BikeCard';
import { bikes } from '../../data/bikes';

const SectionHeader = () => (
  <div className="text-center mb-20">
    <div className="inline-block mb-6">
      <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold">
        POPULAR BIKES
      </span>
    </div>
    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
      Featured Collection
    </h2>
    <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
      Discover our most loved bikes, trusted by thousands of riders for their performance and reliability
    </p>
  </div>
);

export default function PopularBikes() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <Section id="bikes" background="white">
      <SectionHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        {bikes.map((bike) => (
          <BikeCard
            key={bike.id}
            bike={bike}
            isHovered={hoveredId === bike.id}
            onHoverChange={(isHovered) => setHoveredId(isHovered ? bike.id : null)}
          />
        ))}
      </div>
    </Section>
  );
}
