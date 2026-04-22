const TYPES = ['car', 'bike', 'scooter', 'suv', 'jeep', 'ev'];
const FUEL_TYPES = ['petrol', 'diesel', 'electric'];

const MIN_DAILY = 500,
MAX_DAILY = 15000;
const MIN_SEATS = 1,
MAX_SEATS = 8;

function normalize(value, min, max) {
    if (max === min) return 0;
    return (value - min) / (max - min);
}

function oneHot(value, categories) {
    return categories.map(cat => (cat === value ? 1 : 0));
}

export function toVector(vehicle) {
    return [
        normalize(vehicle.seats, MIN_SEATS, MAX_SEATS),
        normalize(vehicle.daily_rate, MIN_DAILY, MAX_DAILY),
        // hourly_rate dropped — optional field, causes NaN when missing
        ...oneHot(vehicle.type, TYPES),
        ...oneHot(vehicle.fuel_type, FUEL_TYPES),
    ];
}