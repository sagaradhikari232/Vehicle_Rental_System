import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import BikeCategories from './components/sections/BikeCategories';
import PopularBikes from './components/sections/PopularBikes';
import WhyChooseUs from './components/sections/WhyChooseUs';
import Testimonials from './components/sections/Testimonials';
import CTA from './components/sections/CTA';

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <BikeCategories />
      <PopularBikes />
      <WhyChooseUs />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default App;
