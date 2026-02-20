// Koordinat Ka'bah (dipakai juga nanti di step Qibla)
export const KABAH = { lat: 21.4225, lng: 39.8262 };

// Ambil lokasi dari browser
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation tidak didukung browser ini."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        const messages = {
          1: "Izin lokasi ditolak. Silakan izinkan akses lokasi di browser.",
          2: "Lokasi tidak dapat ditemukan.",
          3: "Permintaan lokasi timeout.",
        };
        reject(new Error(messages[err.code] || "Gagal mendapatkan lokasi."));
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  });
};

// Reverse geocode pakai Nominatim (gratis, no API key)
export const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "id" } }
    );
    const data = await res.json();
    const addr = data.address || {};
    const city =
      addr.city || addr.town || addr.village ||
      addr.county || addr.state || "Lokasi Ditemukan";
    return { city, country: addr.country || "" };
  } catch {
    return { city: null, country: null };
  }
};