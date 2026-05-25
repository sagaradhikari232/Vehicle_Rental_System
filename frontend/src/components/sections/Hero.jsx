import { MapPin, Calendar, Bike, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px)',
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent" />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10 pt-24 pb-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-120px)]">
          <div className="text-white flex flex-col justify-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 tracking-tight">
              Ride Your Dream
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 mt-3">
                Vehicle Today
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-xl">
              Experience the freedom of the open road with our Vehicle rental service. From high-performance sports bikes to comfortable cruisers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* <Button size="lg" className="gap-2" onClick= "#PopularVehicle">
                Explore Vehicles
                <ArrowRight className="w-5 h-5" />
              </Button> */}

              <Button
                size="lg"
                className="gap-2"
                onClick={() => {
                  const section = document.getElementById("vehicles");
                  if (section) {
                    section.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Explore Vehicles
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="relative h-full hidden lg:flex items-center justify-end">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/2 -right-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}