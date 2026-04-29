// export const vehicles = [
//   {
//     id: 'v1',
//     name: 'Toyota Corolla',
//     category: 'Sedan',
//     price: 4500,
//     rating: 4.5,
//     reviewCount: 128,
//     image: 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=1200',
//     available: true,
//     fuelType: 'Petrol',
//     transmission: 'Automatic',
//     seats: 5,
//     mileage: '18 km/l',
//     description:
//       'The Toyota Corolla is one of the world\'s best-selling cars — and for good reason. Smooth ride, excellent fuel economy, and a spacious interior make it the ideal choice for city commutes or long weekend drives.',
//     features: ['Bluetooth Audio', 'Backup Camera', 'Cruise Control', 'Apple CarPlay', 'ABS Brakes', 'Keyless Entry'],
//   },
// ];

export function getSimilarVehicles(current, limit = 4) {
  return vehicles.filter(
    (v) =>
      v.id !== current.id &&
      (v.category === current.category ||
        Math.abs(v.price - current.price) <= 2000)
  ).slice(0, limit);
}