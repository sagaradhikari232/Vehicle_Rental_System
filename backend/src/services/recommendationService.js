import { toVector } from '../utils/vehcileVectorized.js';

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export function getRecommendations(recentIds, allVehicles, topN = 3) {
  const viewedSet      = new Set(recentIds.map(String));
  // console.log("log from viewedset", viewedSet)
  const viewedVehicles = allVehicles.filter(v => viewedSet.has(String(v._id)));
  // console.log("log from viewedvehicles", viewedVehicles)

  const length = Object.keys(viewedVehicles).length; 
  console.log(viewedVehicles.length)
  // if (viewedVehicles.length == 0) return [];

  // Build weighted profile vector (recent = higher weight)
  const dims     = toVector(viewedVehicles[0]).length;
  let dim0    = toVector(viewedVehicles[0]);
  // console.log("log from dim0", dim0)
  const profileVector = new Array(dims).fill(0);
  // console.log("log from profileVector", profileVector)
  let   totalWeight   = 0;

  viewedVehicles.forEach(v => {
    const posInRecent = recentIds.findIndex(id => String(id) === String(v._id));
    const weight      = 1 / (posInRecent + 1);   // pos=0 → weight=1, pos=1 → 0.5 ...
    const vec         = toVector(v);
    totalWeight      += weight;
    vec.forEach((val, i) => { profileVector[i] += val * weight; });
  });

  // Normalize profile vector
  profileVector.forEach((val, i) => { profileVector[i] = val / totalWeight; });

  // Score unseen candidates
  const candidates = allVehicles.filter  (v => !viewedSet.has(String(v._id)));
  // const candidates = allVehicles.slice(1); 
  // console.log("log from candidates", candidates) 

  return candidates
    .map(vehicle => {
      const vehicleObj = vehicle.toObject ? vehicle.toObject() : vehicle;
      return {
        ...vehicleObj,
        _score: parseFloat(cosineSimilarity(profileVector, toVector(vehicle)).toFixed(4)),
      };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, topN);
}