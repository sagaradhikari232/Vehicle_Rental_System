export interface Bike {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  features: string[];
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  description: string;
}

export interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}
