// Koordinat Ka'bah
const KABAH = { lat: 21.4225, lng: 39.8262 };

// Konversi derajat ke radian
const toRad = (deg) => (deg * Math.PI) / 180;
// Konversi radian ke derajat
const toDeg = (rad) => (rad * 180) / Math.PI;

// Hitung arah kiblat (bearing) dari koordinat user ke Ka'bah
export const calcQiblaDirection = (userLat, userLng) => {
  const lat1 = toRad(userLat);
  const lat2 = toRad(KABAH.lat);
  const dLng = toRad(KABAH.lng - userLng);

  const x = Math.sin(dLng) * Math.cos(lat2);
  const y =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  const bearing = toDeg(Math.atan2(x, y));
  return (bearing + 360) % 360; // normalize 0–360
};

// Hitung jarak ke Ka'bah (Haversine formula) dalam km
export const calcDistanceToKabah = (userLat, userLng) => {
  const R    = 6371; // radius bumi km
  const dLat = toRad(KABAH.lat - userLat);
  const dLng = toRad(KABAH.lng - userLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(userLat)) * Math.cos(toRad(KABAH.lat)) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// Format jarak
export const formatDistance = (km) => {
  if (km >= 1000) return `${(km / 1000).toFixed(1).replace(".", ",")} ribu km`;
  return `${km.toLocaleString("id-ID")} km`;
};