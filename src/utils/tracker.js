import { RAMADHAN_START, RAMADHAN_DAYS, dateToKey, getRamadhanDate } from "./fasting";

export const IBADAH_LIST = [
  {
    id:    "subuh",
    label: "Sholat Subuh",
    icon:  "fa-cloud-sun",
    color: "#6366f1",
    category: "sholat"
  },
  {
    id:    "dzuhur",
    label: "Sholat Dzuhur",
    icon:  "fa-sun",
    color: "#f59e0b",
    category: "sholat"
  },
  {
    id:    "ashar",
    label: "Sholat Ashar",
    icon:  "fa-sun-plant-wilt",
    color: "#f97316",
    category: "sholat"
  },
  {
    id:    "maghrib",
    label: "Sholat Maghrib",
    icon:  "fa-cloud-moon",
    color: "#8b5cf6",
    category: "sholat"
  },
  {
    id:    "isya",
    label: "Sholat Isya",
    icon:  "fa-moon",
    color: "#3b82f6",
    category: "sholat"
  },
  {
    id:    "tarawih",
    label: "Tarawih",
    icon:  "fa-star-and-crescent",
    color: "#d4a843",
    category: "sunnah"
  },
  {
    id:    "tadarus",
    label: "Tadarus Qur'an",
    icon:  "fa-book-open",
    color: "#10b981",
    category: "sunnah"
  },
  {
    id:    "sedekah",
    label: "Sedekah",
    icon:  "fa-hand-holding-heart",
    color: "#ef4444",
    category: "sunnah"
  },
];

export const CATEGORIES = [
  { id: "sholat", label: "Sholat Wajib", icon: "fa-mosque"             },
  { id: "sunnah", label: "Ibadah Sunnah", icon: "fa-star-and-crescent" },
];

// Ambil tracker entry untuk satu hari
export const getDayTracker = (trackerLog, day) => {
  const key = dateToKey(getRamadhanDate(day));
  return trackerLog[key] || {};
};

// Hitung skor satu hari (berapa ibadah selesai)
export const getDayScore = (trackerLog, day) => {
  const entry = getDayTracker(trackerLog, day);
  const done  = IBADAH_LIST.filter(i => entry[i.id] === true).length;
  return { done, total: IBADAH_LIST.length };
};

// Hitung statistik keseluruhan
export const calcTrackerStats = (trackerLog) => {
  const stats = {};

  IBADAH_LIST.forEach(ibadah => {
    stats[ibadah.id] = 0;
  });

  for (let day = 1; day <= RAMADHAN_DAYS; day++) {
    const entry = getDayTracker(trackerLog, day);
    IBADAH_LIST.forEach(ibadah => {
      if (entry[ibadah.id] === true) stats[ibadah.id]++;
    });
  }

  return stats;
};

// Hitung streak hari berturut-turut dengan sholat 5 waktu lengkap
export const calcSholatStreak = (trackerLog) => {
  const sholatIds = IBADAH_LIST
    .filter(i => i.category === "sholat")
    .map(i => i.id);

  let streak    = 0;
  let maxStreak = 0;
  let current   = 0;

  for (let day = 1; day <= RAMADHAN_DAYS; day++) {
    const entry    = getDayTracker(trackerLog, day);
    const complete = sholatIds.every(id => entry[id] === true);
    if (complete) {
      current++;
      maxStreak = Math.max(maxStreak, current);
    } else {
      current = 0;
    }
  }

  streak = current;
  return { streak, maxStreak };
};