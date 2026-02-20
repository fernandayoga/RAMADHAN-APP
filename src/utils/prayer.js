// Metode perhitungan sholat
export const CALC_METHODS = [
  { id: 20, name: "Kemenag Indonesia" },
  { id: 11, name: "Muslim World League" },
  { id: 2,  name: "Islamic Society of NA" },
  { id: 5,  name: "Umm Al-Qura (Makkah)" },
  { id: 3,  name: "Egyptian Authority" },
];

const CACHE_KEY     = "prayer_times_cache";
const METHOD_KEY    = "prayer_calc_method";
const DEFAULT_METHOD = 20;

// Ambil metode tersimpan
export const getSavedMethod = () => {
  try {
    const v = localStorage.getItem(METHOD_KEY);
    return v ? parseInt(v) : DEFAULT_METHOD;
  } catch { return DEFAULT_METHOD; }
};

// Simpan metode
export const saveMethod = (id) => {
  try { localStorage.setItem(METHOD_KEY, String(id)); } catch {}
};

// Format tanggal → "DD-MM-YYYY"
const formatDate = (date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

// Cek apakah cache masih valid (hari ini)
const isCacheValid = (cache) => {
  if (!cache || !cache.date) return false;
  return cache.date === formatDate(new Date());
};

// Fetch dari Aladhan API
export const fetchPrayerTimes = async (lat, lng, method = DEFAULT_METHOD) => {
  // Cek cache dulu
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const cache = JSON.parse(raw);
      
      // ← Validasi cache lebih ketat
      const isValid =
        isCacheValid(cache) &&
        cache.lat === lat &&
        cache.lng === lng &&
        cache.method === method &&
        cache.timings &&
        cache.timings.Fajr &&      // ← pastikan key utama ada
        cache.timings.Dhuhr &&
        cache.timings.Asr &&
        cache.timings.Maghrib &&
        cache.timings.Isha;

      if (isValid) {
        return { data: cache.timings, fromCache: true };
      } else {
        // Cache tidak valid → hapus
        localStorage.removeItem(CACHE_KEY);
      }
    }
  } catch {
    localStorage.removeItem(CACHE_KEY); // ← kalau parse error, hapus juga
  }

  // Fetch API ...
  const date = formatDate(new Date());
  const url  = `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lng}&method=${method}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error("Gagal mengambil data waktu sholat.");
  const json    = await res.json();
  const timings = json.data.timings;

  const toCache = { date, lat, lng, method, timings };
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(toCache)); } catch {}

  return { data: timings, fromCache: false };
};

// Nama-nama sholat yang ditampilkan
export const PRAYER_NAMES = [
  { key: "Fajr",    label: "Subuh",   icon: "fa-cloud-sun"  },
  { key: "Dhuhr",   label: "Dzuhur",  icon: "fa-sun"        },
  { key: "Asr",     label: "Ashar",   icon: "fa-sun-plant-wilt" },
  { key: "Maghrib", label: "Maghrib", icon: "fa-cloud-moon" },
  { key: "Isha",    label: "Isya",    icon: "fa-moon"       },
];

// Konversi "HH:MM" ke menit dari tengah malam
export const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return 0; // ← guard
  const parts = timeStr.split(":");
  if (parts.length < 2) return 0; // ← guard
  const [h, m] = parts.map(Number);
  return h * 60 + m;
};


// Cari waktu sholat aktif & berikutnya
export const getActivePrayer = (timings) => {
  if (!timings) return { active: null, next: null, nextTime: null };

  const now     = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  // Build list, skip kalau timings[key] undefined
  const list = [];
  for (const p of PRAYER_NAMES) {
    const t = timings[p.key];
    if (!t || typeof t !== "string" || !t.includes(":")) continue;
    const [h, m] = t.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) continue;
    list.push({ ...p, mins: h * 60 + m });
  }

  // Kalau list masih kosong, return early
  if (list.length === 0) return { active: null, next: null, nextTime: null };

  let active = null;
  for (let i = list.length - 1; i >= 0; i--) {
    if (nowMins >= list[i].mins) { active = list[i].key; break; }
  }

  let next     = null;
  let nextTime = null;
  for (const p of list) {
    if (p.mins > nowMins) { next = p.key; nextTime = p.mins; break; }
  }
  if (!next) { next = list[0].key; nextTime = list[0].mins + 24 * 60; }

  return { active, next, nextTime };
};