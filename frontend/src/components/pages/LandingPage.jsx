import React from 'react';

// Layout Components
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

// Section Components
import Hero from '../sections/Hero';
import VehicleCategories from '../sections/VehicleCategories';
import PopularVehicle from '../sections/PopularVehicle';
import Testimonials from '../sections/Testimonials';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <VehicleCategories />
        <PopularVehicle />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;