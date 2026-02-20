import { openDB } from "idb";

const BASE_URL = "https://api.alquran.cloud/v1";
const DB_NAME    = "ramadhan-app";
const DB_VERSION = 1;
const STORE_NAME = "quran-surahs";

// Buka / inisialisasi IndexedDB
const getDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "number" });
      }
    },
  });
};

// Cek apakah surah sudah di-cache di IndexedDB
export const isSurahCached = async (number) => {
  try {
    const db   = await getDB();
    const data = await db.get(STORE_NAME, number);
    return !!data;
  } catch { return false; }
};

// Fetch surah — cek IndexedDB dulu, baru API
export const fetchSurah = async (number) => {
  try {
    const db     = await getDB();
    const cached = await db.get(STORE_NAME, number);
    if (cached?.ayahs?.length > 0) {
      return { data: cached, fromCache: true };
    }
  } catch {}

  // Fetch Arab + terjemahan Indonesia bersamaan
  const [resAr, resId] = await Promise.all([
    fetch(`${BASE_URL}/surah/${number}`),
    fetch(`${BASE_URL}/surah/${number}/id.indonesian`),
  ]);

  if (!resAr.ok || !resId.ok) throw new Error("Gagal mengambil data surah.");

  const [jsonAr, jsonId] = await Promise.all([
    resAr.json(),
    resId.json(),
  ]);

  const ayahs = jsonAr.data.ayahs.map((ayah, i) => ({
    number:      ayah.numberInSurah,
    arabic:      ayah.text,
    translation: jsonId.data.ayahs[i]?.text || "",
  }));

  const data = {
    number,
    name:        jsonAr.data.name,
    englishName: jsonAr.data.englishName,
    ayahs,
  };

  // Simpan ke IndexedDB
  try {
    const db = await getDB();
    await db.put(STORE_NAME, data);
  } catch (e) {
    console.warn("Gagal simpan ke IndexedDB:", e);
  }

  return { data, fromCache: false };
};

// Ambil semua nomor surah yang sudah di-cache
export const getCachedSurahNumbers = async () => {
  try {
    const db   = await getDB();
    const keys = await db.getAllKeys(STORE_NAME);
    return keys; // array of number
  } catch { return []; }
};

// Hapus cache satu surah
export const clearSurahCache = async (number) => {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, number);
  } catch {}
};

// Hapus semua cache Qur'an
export const clearAllQuranCache = async () => {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
  } catch {}
};

// ── SURAH LIST (hardcode, tetap offline) ──────────────
export const SURAH_LIST = [
  { number: 1,   name: "Al-Fatihah",       nameAr: "الفاتحة",       ayahs: 7,   revelation: "Makkiyyah"  },
  { number: 2,   name: "Al-Baqarah",       nameAr: "البقرة",        ayahs: 286, revelation: "Madaniyyah" },
  { number: 3,   name: "Ali 'Imran",       nameAr: "آل عمران",      ayahs: 200, revelation: "Madaniyyah" },
  { number: 4,   name: "An-Nisa",          nameAr: "النساء",        ayahs: 176, revelation: "Madaniyyah" },
  { number: 5,   name: "Al-Ma'idah",       nameAr: "المائدة",       ayahs: 120, revelation: "Madaniyyah" },
  { number: 6,   name: "Al-An'am",         nameAr: "الأنعام",       ayahs: 165, revelation: "Makkiyyah"  },
  { number: 7,   name: "Al-A'raf",         nameAr: "الأعراف",       ayahs: 206, revelation: "Makkiyyah"  },
  { number: 8,   name: "Al-Anfal",         nameAr: "الأنفال",       ayahs: 75,  revelation: "Madaniyyah" },
  { number: 9,   name: "At-Taubah",        nameAr: "التوبة",        ayahs: 129, revelation: "Madaniyyah" },
  { number: 10,  name: "Yunus",            nameAr: "يونس",          ayahs: 109, revelation: "Makkiyyah"  },
  { number: 11,  name: "Hud",              nameAr: "هود",           ayahs: 123, revelation: "Makkiyyah"  },
  { number: 12,  name: "Yusuf",            nameAr: "يوسف",          ayahs: 111, revelation: "Makkiyyah"  },
  { number: 13,  name: "Ar-Ra'd",          nameAr: "الرعد",         ayahs: 43,  revelation: "Madaniyyah" },
  { number: 14,  name: "Ibrahim",          nameAr: "إبراهيم",       ayahs: 52,  revelation: "Makkiyyah"  },
  { number: 15,  name: "Al-Hijr",          nameAr: "الحجر",         ayahs: 99,  revelation: "Makkiyyah"  },
  { number: 16,  name: "An-Nahl",          nameAr: "النحل",         ayahs: 128, revelation: "Makkiyyah"  },
  { number: 17,  name: "Al-Isra",          nameAr: "الإسراء",       ayahs: 111, revelation: "Makkiyyah"  },
  { number: 18,  name: "Al-Kahf",          nameAr: "الكهف",         ayahs: 110, revelation: "Makkiyyah"  },
  { number: 19,  name: "Maryam",           nameAr: "مريم",          ayahs: 98,  revelation: "Makkiyyah"  },
  { number: 20,  name: "Ta Ha",            nameAr: "طه",            ayahs: 135, revelation: "Makkiyyah"  },
  { number: 21,  name: "Al-Anbiya",        nameAr: "الأنبياء",      ayahs: 112, revelation: "Makkiyyah"  },
  { number: 22,  name: "Al-Hajj",          nameAr: "الحج",          ayahs: 78,  revelation: "Madaniyyah" },
  { number: 23,  name: "Al-Mu'minun",      nameAr: "المؤمنون",      ayahs: 118, revelation: "Makkiyyah"  },
  { number: 24,  name: "An-Nur",           nameAr: "النور",         ayahs: 64,  revelation: "Madaniyyah" },
  { number: 25,  name: "Al-Furqan",        nameAr: "الفرقان",       ayahs: 77,  revelation: "Makkiyyah"  },
  { number: 26,  name: "Asy-Syu'ara",      nameAr: "الشعراء",       ayahs: 227, revelation: "Makkiyyah"  },
  { number: 27,  name: "An-Naml",          nameAr: "النمل",         ayahs: 93,  revelation: "Makkiyyah"  },
  { number: 28,  name: "Al-Qasas",         nameAr: "القصص",         ayahs: 88,  revelation: "Makkiyyah"  },
  { number: 29,  name: "Al-'Ankabut",      nameAr: "العنكبوت",      ayahs: 69,  revelation: "Makkiyyah"  },
  { number: 30,  name: "Ar-Rum",           nameAr: "الروم",         ayahs: 60,  revelation: "Makkiyyah"  },
  { number: 31,  name: "Luqman",           nameAr: "لقمان",         ayahs: 34,  revelation: "Makkiyyah"  },
  { number: 32,  name: "As-Sajdah",        nameAr: "السجدة",        ayahs: 30,  revelation: "Makkiyyah"  },
  { number: 33,  name: "Al-Ahzab",         nameAr: "الأحزاب",       ayahs: 73,  revelation: "Madaniyyah" },
  { number: 34,  name: "Saba",             nameAr: "سبأ",           ayahs: 54,  revelation: "Makkiyyah"  },
  { number: 35,  name: "Fatir",            nameAr: "فاطر",          ayahs: 45,  revelation: "Makkiyyah"  },
  { number: 36,  name: "Ya Sin",           nameAr: "يس",            ayahs: 83,  revelation: "Makkiyyah"  },
  { number: 37,  name: "As-Saffat",        nameAr: "الصافات",       ayahs: 182, revelation: "Makkiyyah"  },
  { number: 38,  name: "Sad",              nameAr: "ص",             ayahs: 88,  revelation: "Makkiyyah"  },
  { number: 39,  name: "Az-Zumar",         nameAr: "الزمر",         ayahs: 75,  revelation: "Makkiyyah"  },
  { number: 40,  name: "Ghafir",           nameAr: "غافر",          ayahs: 85,  revelation: "Makkiyyah"  },
  { number: 41,  name: "Fussilat",         nameAr: "فصلت",          ayahs: 54,  revelation: "Makkiyyah"  },
  { number: 42,  name: "Asy-Syura",        nameAr: "الشورى",        ayahs: 53,  revelation: "Makkiyyah"  },
  { number: 43,  name: "Az-Zukhruf",       nameAr: "الزخرف",        ayahs: 89,  revelation: "Makkiyyah"  },
  { number: 44,  name: "Ad-Dukhan",        nameAr: "الدخان",        ayahs: 59,  revelation: "Makkiyyah"  },
  { number: 45,  name: "Al-Jasiyah",       nameAr: "الجاثية",       ayahs: 37,  revelation: "Makkiyyah"  },
  { number: 46,  name: "Al-Ahqaf",         nameAr: "الأحقاف",       ayahs: 35,  revelation: "Makkiyyah"  },
  { number: 47,  name: "Muhammad",         nameAr: "محمد",          ayahs: 38,  revelation: "Madaniyyah" },
  { number: 48,  name: "Al-Fath",          nameAr: "الفتح",         ayahs: 29,  revelation: "Madaniyyah" },
  { number: 49,  name: "Al-Hujurat",       nameAr: "الحجرات",       ayahs: 18,  revelation: "Madaniyyah" },
  { number: 50,  name: "Qaf",              nameAr: "ق",             ayahs: 45,  revelation: "Makkiyyah"  },
  { number: 51,  name: "Az-Zariyat",       nameAr: "الذاريات",      ayahs: 60,  revelation: "Makkiyyah"  },
  { number: 52,  name: "At-Tur",           nameAr: "الطور",         ayahs: 49,  revelation: "Makkiyyah"  },
  { number: 53,  name: "An-Najm",          nameAr: "النجم",         ayahs: 62,  revelation: "Makkiyyah"  },
  { number: 54,  name: "Al-Qamar",         nameAr: "القمر",         ayahs: 55,  revelation: "Makkiyyah"  },
  { number: 55,  name: "Ar-Rahman",        nameAr: "الرحمن",        ayahs: 78,  revelation: "Madaniyyah" },
  { number: 56,  name: "Al-Waqi'ah",       nameAr: "الواقعة",       ayahs: 96,  revelation: "Makkiyyah"  },
  { number: 57,  name: "Al-Hadid",         nameAr: "الحديد",        ayahs: 29,  revelation: "Madaniyyah" },
  { number: 58,  name: "Al-Mujadila",      nameAr: "المجادلة",      ayahs: 22,  revelation: "Madaniyyah" },
  { number: 59,  name: "Al-Hasyr",         nameAr: "الحشر",         ayahs: 24,  revelation: "Madaniyyah" },
  { number: 60,  name: "Al-Mumtahanah",    nameAr: "الممتحنة",      ayahs: 13,  revelation: "Madaniyyah" },
  { number: 61,  name: "As-Saf",           nameAr: "الصف",          ayahs: 14,  revelation: "Madaniyyah" },
  { number: 62,  name: "Al-Jumu'ah",       nameAr: "الجمعة",        ayahs: 11,  revelation: "Madaniyyah" },
  { number: 63,  name: "Al-Munafiqun",     nameAr: "المنافقون",     ayahs: 11,  revelation: "Madaniyyah" },
  { number: 64,  name: "At-Tagabun",       nameAr: "التغابن",       ayahs: 18,  revelation: "Madaniyyah" },
  { number: 65,  name: "At-Talaq",         nameAr: "الطلاق",        ayahs: 12,  revelation: "Madaniyyah" },
  { number: 66,  name: "At-Tahrim",        nameAr: "التحريم",       ayahs: 12,  revelation: "Madaniyyah" },
  { number: 67,  name: "Al-Mulk",          nameAr: "الملك",         ayahs: 30,  revelation: "Makkiyyah"  },
  { number: 68,  name: "Al-Qalam",         nameAr: "القلم",         ayahs: 52,  revelation: "Makkiyyah"  },
  { number: 69,  name: "Al-Haqqah",        nameAr: "الحاقة",        ayahs: 52,  revelation: "Makkiyyah"  },
  { number: 70,  name: "Al-Ma'arij",       nameAr: "المعارج",       ayahs: 44,  revelation: "Makkiyyah"  },
  { number: 71,  name: "Nuh",              nameAr: "نوح",           ayahs: 28,  revelation: "Makkiyyah"  },
  { number: 72,  name: "Al-Jinn",          nameAr: "الجن",          ayahs: 28,  revelation: "Makkiyyah"  },
  { number: 73,  name: "Al-Muzzammil",     nameAr: "المزمل",        ayahs: 20,  revelation: "Makkiyyah"  },
  { number: 74,  name: "Al-Muddassir",     nameAr: "المدثر",        ayahs: 56,  revelation: "Makkiyyah"  },
  { number: 75,  name: "Al-Qiyamah",       nameAr: "القيامة",       ayahs: 40,  revelation: "Makkiyyah"  },
  { number: 76,  name: "Al-Insan",         nameAr: "الإنسان",       ayahs: 31,  revelation: "Madaniyyah" },
  { number: 77,  name: "Al-Mursalat",      nameAr: "المرسلات",      ayahs: 50,  revelation: "Makkiyyah"  },
  { number: 78,  name: "An-Naba",          nameAr: "النبأ",         ayahs: 40,  revelation: "Makkiyyah"  },
  { number: 79,  name: "An-Nazi'at",       nameAr: "النازعات",      ayahs: 46,  revelation: "Makkiyyah"  },
  { number: 80,  name: "'Abasa",           nameAr: "عبس",           ayahs: 42,  revelation: "Makkiyyah"  },
  { number: 81,  name: "At-Takwir",        nameAr: "التكوير",       ayahs: 29,  revelation: "Makkiyyah"  },
  { number: 82,  name: "Al-Infitar",       nameAr: "الانفطار",      ayahs: 19,  revelation: "Makkiyyah"  },
  { number: 83,  name: "Al-Mutaffifin",    nameAr: "المطففين",      ayahs: 36,  revelation: "Makkiyyah"  },
  { number: 84,  name: "Al-Insyiqaq",      nameAr: "الانشقاق",      ayahs: 25,  revelation: "Makkiyyah"  },
  { number: 85,  name: "Al-Buruj",         nameAr: "البروج",        ayahs: 22,  revelation: "Makkiyyah"  },
  { number: 86,  name: "At-Tariq",         nameAr: "الطارق",        ayahs: 17,  revelation: "Makkiyyah"  },
  { number: 87,  name: "Al-A'la",          nameAr: "الأعلى",        ayahs: 19,  revelation: "Makkiyyah"  },
  { number: 88,  name: "Al-Gasiyah",       nameAr: "الغاشية",       ayahs: 26,  revelation: "Makkiyyah"  },
  { number: 89,  name: "Al-Fajr",          nameAr: "الفجر",         ayahs: 30,  revelation: "Makkiyyah"  },
  { number: 90,  name: "Al-Balad",         nameAr: "البلد",         ayahs: 20,  revelation: "Makkiyyah"  },
  { number: 91,  name: "Asy-Syams",        nameAr: "الشمس",         ayahs: 15,  revelation: "Makkiyyah"  },
  { number: 92,  name: "Al-Lail",          nameAr: "الليل",         ayahs: 21,  revelation: "Makkiyyah"  },
  { number: 93,  name: "Ad-Duha",          nameAr: "الضحى",         ayahs: 11,  revelation: "Makkiyyah"  },
  { number: 94,  name: "Asy-Syarh",        nameAr: "الشرح",         ayahs: 8,   revelation: "Makkiyyah"  },
  { number: 95,  name: "At-Tin",           nameAr: "التين",         ayahs: 8,   revelation: "Makkiyyah"  },
  { number: 96,  name: "Al-'Alaq",         nameAr: "العلق",         ayahs: 19,  revelation: "Makkiyyah"  },
  { number: 97,  name: "Al-Qadr",          nameAr: "القدر",         ayahs: 5,   revelation: "Makkiyyah"  },
  { number: 98,  name: "Al-Bayyinah",      nameAr: "البينة",        ayahs: 8,   revelation: "Madaniyyah" },
  { number: 99,  name: "Az-Zalzalah",      nameAr: "الزلزلة",       ayahs: 8,   revelation: "Madaniyyah" },
  { number: 100, name: "Al-'Adiyat",       nameAr: "العاديات",      ayahs: 11,  revelation: "Makkiyyah"  },
  { number: 101, name: "Al-Qari'ah",       nameAr: "القارعة",       ayahs: 11,  revelation: "Makkiyyah"  },
  { number: 102, name: "At-Takasur",       nameAr: "التكاثر",       ayahs: 8,   revelation: "Makkiyyah"  },
  { number: 103, name: "Al-'Asr",          nameAr: "العصر",         ayahs: 3,   revelation: "Makkiyyah"  },
  { number: 104, name: "Al-Humazah",       nameAr: "الهمزة",        ayahs: 9,   revelation: "Makkiyyah"  },
  { number: 105, name: "Al-Fil",           nameAr: "الفيل",         ayahs: 5,   revelation: "Makkiyyah"  },
  { number: 106, name: "Quraisy",          nameAr: "قريش",          ayahs: 4,   revelation: "Makkiyyah"  },
  { number: 107, name: "Al-Ma'un",         nameAr: "الماعون",       ayahs: 7,   revelation: "Makkiyyah"  },
  { number: 108, name: "Al-Kausar",        nameAr: "الكوثر",        ayahs: 3,   revelation: "Makkiyyah"  },
  { number: 109, name: "Al-Kafirun",       nameAr: "الكافرون",      ayahs: 6,   revelation: "Makkiyyah"  },
  { number: 110, name: "An-Nasr",          nameAr: "النصر",         ayahs: 3,   revelation: "Madaniyyah" },
  { number: 111, name: "Al-Masad",         nameAr: "المسد",         ayahs: 5,   revelation: "Makkiyyah"  },
  { number: 112, name: "Al-Ikhlas",        nameAr: "الإخلاص",       ayahs: 4,   revelation: "Makkiyyah"  },
  { number: 113, name: "Al-Falaq",         nameAr: "الفلق",         ayahs: 5,   revelation: "Makkiyyah"  },
  { number: 114, name: "An-Nas",           nameAr: "الناس",         ayahs: 6,   revelation: "Makkiyyah"  },
];