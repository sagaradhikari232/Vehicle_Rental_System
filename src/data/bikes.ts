import { Bike, Category, Feature, Testimonial } from '../types';

export const categories: Category[] = [
  {
    id: 1,
    name: 'Sports',
    icon: 'Zap',
    description: 'High-performance bikes for thrill seekers'
  },
  {
    id: 2,
    name: 'Scooter',
    icon: 'Bike',
    description: 'Perfect for city commutes'
  },
  {
    id: 3,
    name: 'Cruiser',
    icon: 'Wind',
    description: 'Comfortable rides for long journeys'
  },
  {
    id: 4,
    name: 'Electric',
    icon: 'Zap',
    description: 'Eco-friendly and efficient'
  }
];

export const bikes: Bike[] = [
  {
    id: 1,
    name: 'Royal Enfield Classic',
    category: 'Cruiser',
    price: 750,
    rating: 4.9,
    image: 'https://imgcdn.zigwheels.my/large/gallery/exterior/89/1414/royal-enfield-classic-350-left-side-view-full-image-708581.jpg',
    features: ['Classic Design', 'Powerful Engine', 'Comfort Seat']
  },
  {
    id: 2,
    name: 'Mahindria Scorpio',
    category: 'Scorpio',
    price: 2500,
    rating: 4.5,
    image: 'https://imgd.aeplcdn.com/1920x1080/n/cw/ec/128413/scorpio-classic-exterior-left-rear-three-quarter.jpeg?isig=0&q=80&q=80',
    features: ['Stylish', 'Easy to Ride', 'Urban']
  },
  {
    id: 4,
    name: 'Ather Energy',
    category: 'Electric',
    price: 600,
    rating: 4.7,
    image: 'https://atherenergy.com.np/assets/450/colors/Ather-450-colours-Stealth-Blue.webp',
    features: ['Zero Emission', 'Fast Charging', 'Silent']
  },
  {
    id: 5,
    name: 'Kawasaki Ninja',
    category: 'Sports',
    price: 1500,
    rating: 4.9,
    image: 'https://imgcdn.oto.com/large/gallery/exterior/88/1127/kawasaki-ninja-300-slant-rear-view-full-image-129480.jpg',
    features: ['High Speed', 'Sport Mode', 'Premium']
  },
  {
    id: 6,
    name: 'Honda Activa',
    category: 'Scooter',
    price: 650,
    rating: 4.6,
    image: 'https://cdn.bikedekho.com/processedimages/honda/activa-6g/source/activa-6g67ff494881d78.jpg',
    features: ['Fuel Efficient', 'Comfortable', 'Storage']
  }
];

export const features: Feature[] = [
  {
    id: 1,
    icon: 'Shield',
    title: 'Fully Insured',
    description: 'All bikes are fully insured for your safety and peace of mind'
  },
  {
    id: 2,
    icon: 'Clock',
    title: '24/7 Support',
    description: 'Round-the-clock customer service for any assistance you need'
  },
  {
    id: 3,
    icon: 'MapPin',
    title: 'Multiple Locations',
    description: 'Pick up and drop off at various convenient locations'
  },
  {
    id: 4,
    icon: 'DollarSign',
    title: 'Best Prices',
    description: 'Competitive pricing with no hidden charges'
  }
];

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Binod Bista',
    role: 'Adventure Enthusiast',
    content: 'Amazing service! The bike was in perfect condition and the booking process was seamless. Highly recommend for anyone looking to explore the city.',
    rating: 5,
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 2,
    name: 'Prashan Poudel',
    role: 'Daily Commuter',
    content: 'Best bike rental service in town. Affordable prices, great customer support, and well-maintained bikes. Been using them for months now.',
    rating: 4,
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    id: 3,
    name: 'Mohan Rana',
    role: 'Tourist',
    content: 'Perfect for tourists! Easy pickup, flexible timings, and the staff was super helpful in suggesting the best routes. Made my vacation memorable.',
    rating: 3,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200'
  }
];
