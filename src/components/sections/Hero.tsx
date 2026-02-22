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
            <div className="mb-6 inline-block w-fit">
              <span className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-semibold border border-orange-500/50">
                Premium Bike Rentals Available
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 tracking-tight">
              Ride Your Dream
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 mt-3">
                Bike Today
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-xl">
              Experience the freedom of the open road with our premium bike rental service. From high-performance sports bikes to comfortable cruisers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2">
                Explore Bikes
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white/40 hover:border-white/80 hover:bg-white/10"
              >
                Learn More
              </Button>
            </div>
          </div>

          <div className="relative h-full hidden lg:flex items-center justify-end">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/2 -right-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 w-full max-w-md">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl mr-3 flex items-center justify-center">
                    <Bike className="w-6 h-6 text-white" />
                  </div>
                  Quick Booking
                </h3>
                <form className="space-y-5">
                  <div className="relative">
                    <label className="flex items-center text-sm font-medium text-white/80 mb-3">
                      <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter pickup location"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all backdrop-blur-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="flex items-center text-sm font-medium text-white/80 mb-3">
                        <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                        Pickup
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all backdrop-blur-sm"
                      />
                    </div>
                    <div className="relative">
                      <label className="flex items-center text-sm font-medium text-white/80 mb-3">
                        <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                        Return
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="flex items-center text-sm font-medium text-white/80 mb-3">
                      <Bike className="w-4 h-4 mr-2 text-orange-400" />
                      Bike Type
                    </label>
                    <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all backdrop-blur-sm appearance-none cursor-pointer">
                      <option value="" className="text-gray-900">Select bike type</option>
                      <option value="sports" className="text-gray-900">Sports</option>
                      <option value="scooter" className="text-gray-900">Scooter</option>
                      <option value="cruiser" className="text-gray-900">Cruiser</option>
                      <option value="electric" className="text-gray-900">Electric</option>
                    </select>
                  </div>

                  <Button type="submit" size="lg" className="w-full gap-2 mt-6">
                    Search Bikes
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            </div>
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
