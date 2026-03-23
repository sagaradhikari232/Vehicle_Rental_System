import React from 'react';

// Layout Components
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

// Section Components
import Hero from '../sections/Hero';
import BikeCategories from '../sections/BikeCategories';
import PopularBikes from '../sections/PopularBikes';
import Testimonials from '../sections/Testimonials';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <BikeCategories />
        <PopularBikes />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;