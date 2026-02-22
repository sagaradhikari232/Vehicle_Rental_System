import { Star, Quote } from 'lucide-react';
import { useState } from 'react';
import Section from '../common/Section';
import Card from '../common/Card';
import { testimonials } from '../../data/bikes';

export default function Testimonials() {
  const [activeId, setActiveId] = useState<number>(testimonials[0].id);

  return (
    <Section background="gray">
      <div className="text-center mb-20">
        <div className="inline-block mb-6">
          <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold">
            TESTIMONIALS
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          What Our Riders Say
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Join thousands of satisfied customers who trust us for their riding adventures and experiences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            onClick={() => setActiveId(testimonial.id)}
            className="cursor-pointer"
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
          >
            <Card
              hover
              gradient={activeId === testimonial.id}
              className={`p-10 h-full transition-all duration-500 transform ${
                activeId === testimonial.id
                  ? 'ring-2 ring-orange-500 shadow-2xl shadow-orange-500/20 scale-105'
                  : 'hover:scale-102'
              }`}
            >
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-start gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-orange-200"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 font-medium">{testimonial.role}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-orange-500 fill-orange-500 transition-transform duration-300 hover:scale-110"
                  />
                ))}
              </div>

              <div className="relative">
                <Quote className={`absolute -top-4 -left-4 w-10 h-10 transition-all duration-300 ${
                  activeId === testimonial.id ? 'text-orange-300' : 'text-orange-100'
                }`} />
                <p className="text-gray-700 leading-relaxed pl-8 text-lg">
                  {testimonial.content}
                </p>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        {testimonials.map((testimonial) => (
          <button
            key={testimonial.id}
            onClick={() => setActiveId(testimonial.id)}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeId === testimonial.id
                ? 'bg-orange-500 w-8'
                : 'bg-gray-300 w-2 hover:bg-gray-400'
            }`}
            aria-label={`View testimonial from ${testimonial.name}`}
          />
        ))}
      </div>
    </Section>
  );
}
