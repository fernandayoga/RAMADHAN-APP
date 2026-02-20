
// Hitung tanggal mulai Ramadhan secara dinamis
const getRamadhanStart = () => {
  // Mapping tahun Hijriah → tanggal mulai Ramadhan (Gregorian)
 const RAMADHAN_DATES = {
  1446: new Date(2025, 2, 1),   // 1 Maret 2025
  1447: new Date(2026, 1, 19),  // 19 Februari 2026  ← fix
  1448: new Date(2027, 1, 8),   // 8 Februari 2027
  1449: new Date(2028, 0, 28),  // 28 Januari 2028
  1450: new Date(2029, 0, 17),  // 17 Januari 2029
};

  // Ambil tahun Hijriah sekarang dari Intl API
  try {
    const hijriYear = parseInt(
      new Intl.DateTimeFormat("id-ID-u-ca-islamic", { year: "numeric" })
        .format(new Date())
    );
    return {
      start: RAMADHAN_DATES[hijriYear] || new Date(),
      year:  hijriYear
    };
  } catch {
    return { start: new Date(2026, 2, 1), year: 1447 };
  }
};


// export const RAMADHAN_START = new Date(2025, 2, 1); // 1 Maret 2025
// export const RAMADHAN_DAYS  = 30;
const { start: RAMADHAN_START, year: HIJRI_YEAR } = getRamadhanStart();
export { RAMADHAN_START, HIJRI_YEAR };
export const RAMADHAN_DAYS = 30;

export const STATUS = {
  PUASA:      "puasa",
  TIDAK:      "tidak",
  BELUM:      "belum",  // belum diisi
};

export const STATUS_CONFIG = {
  puasa: { label: "Puasa",       color: "#10b981", icon: "fa-circle-check"  },
  tidak: { label: "Tidak Puasa", color: "#ef4444", icon: "fa-circle-xmark"  },
  belum: { label: "Belum diisi", color: "#2a3858", icon: "fa-circle"        },
};

export const ALASAN_OPTIONS = [
  "Sakit",
  "Haid / Nifas",
  "Perjalanan jauh (Safar)",
  "Hamil / Menyusui",
  "Lanjut Usia",
  "Lainnya",
];

// Format tanggal jadi key: "2025-03-01"
export const dateToKey = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Ambil tanggal Ramadhan ke-N (1-based)
export const getRamadhanDate = (dayNumber) => {
  const date = new Date(RAMADHAN_START);
  date.setDate(date.getDate() + dayNumber - 1);
  return date;
};

// Hari Ramadhan sekarang (1-30), null kalau di luar Ramadhan
export const getTodayRamadhanDay = () => {
  const today   = new Date();
  today.setHours(0, 0, 0, 0);
  const start   = new Date(RAMADHAN_START);
  start.setHours(0, 0, 0, 0);
  const diff    = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  if (diff < 0 || diff >= RAMADHAN_DAYS) return null;
  return diff + 1;
};

// Hitung statistik dari fastingLog
export const calcStats = (fastingLog) => {
  let puasa = 0, tidak = 0, belum = 0;

  for (let i = 1; i <= RAMADHAN_DAYS; i++) {
    const key    = dateToKey(getRamadhanDate(i));
    const status = fastingLog[key]?.status || STATUS.BELUM;
    if (status === STATUS.PUASA) puasa++;
    else if (status === STATUS.TIDAK) tidak++;
    else belum++;
  }

  return { puasa, tidak, belum, total: RAMADHAN_DAYS };
};