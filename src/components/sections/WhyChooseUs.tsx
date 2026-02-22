import { Shield, Clock, MapPin, DollarSign } from 'lucide-react';
import { useState } from 'react';
import Section from '../common/Section';
import { features } from '../../data/bikes';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Clock,
  MapPin,
  DollarSign,
};

export default function WhyChooseUs() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <Section id="about" background="dark">
      <div className="text-center mb-20">
        <div className="inline-block mb-6">
          <span className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-semibold border border-orange-500/50">
            WHY CHOOSE US
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          Premium Service, Guaranteed
        </h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
          We are committed to providing you with the best bike rental experience through exceptional service, quality bikes, and customer satisfaction
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => {
          const IconComponent = iconMap[feature.icon];
          const isHovered = hoveredId === feature.id;

          return (
            <div
              key={feature.id}
              onMouseEnter={() => setHoveredId(feature.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
              className={`p-8 rounded-2xl transition-all duration-500 border ${
                isHovered
                  ? 'bg-gradient-to-br from-orange-500/20 to-transparent border-orange-500/50 shadow-xl shadow-orange-500/20'
                  : 'bg-white/5 border-white/10 hover:border-orange-500/30'
              }`}
            >
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 ${
                isHovered
                  ? 'bg-gradient-to-br from-orange-400 to-orange-500 scale-110 shadow-lg shadow-orange-500/50'
                  : 'bg-gradient-to-br from-orange-500/20 to-orange-600/20'
              }`}>
                <IconComponent className={`transition-all duration-500 ${
                  isHovered ? 'w-8 h-8 text-white' : 'w-8 h-8 text-orange-400'
                }`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 transition-all duration-300">
                {feature.title}
              </h3>
              <p className={`leading-relaxed transition-all duration-300 ${
                isHovered ? 'text-gray-200' : 'text-gray-400'
              }`}>
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
