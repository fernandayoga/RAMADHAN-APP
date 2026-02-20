# 🌙 Ramadhan App

Aplikasi web Ramadhan berbasis React dengan pendekatan **offline-first** — membantu umat Muslim menjalankan ibadah selama bulan Ramadhan dengan fitur yang ringan, akurat, dan mudah digunakan.

![Ramadhan App](https://img.shields.io/badge/Ramadhan-1447H-gold?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0yMSAxMi4yOUE5IDkgMCAxIDEgMTEuNzEgM2E3IDcgMCAxIDAgOS4yOSA5LjI5eiIvPjwvc3ZnPg==)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss)

---

## ✨ Fitur Utama

### 🕐 Waktu Sholat
- Jadwal sholat 5 waktu otomatis berdasarkan GPS
- Cache harian — API hanya dipanggil **1x per hari**
- Highlight waktu sholat aktif & berikutnya
- Countdown real-time menuju sholat berikutnya
- Support multiple metode perhitungan (Kemenag, MWL, dll)

### 🌙 Sahur & Berbuka
- Countdown real-time menuju waktu sahur dan berbuka
- Status otomatis: Waktu Sahur / Imsak / Sedang Puasa / Waktu Berbuka
- Doa niat puasa & doa berbuka (Arab + Latin + Terjemahan)


### 🕌 Arah Kiblat
- Kompas digital berbasis sensor perangkat (GPS + Gyroscope)
- Kalkulasi arah kiblat menggunakan formula bearing
- Kalkulasi jarak ke Ka'bah (Haversine formula)
- Panduan manual sebagai fallback

### 📖 Al-Qur'an
- 114 Surah lengkap dengan terjemahan Bahasa Indonesia
- Cache per surah di **IndexedDB** — makin sering dipakai, makin offline
- Bookmark ayat terakhir dibaca
- Toggle terjemahan on/off

### 📅 Catatan Puasa
- Tandai status puasa harian (Puasa / Tidak Puasa)
- Catat alasan jika tidak puasa
- Kalender visual 30 hari Ramadhan
- Statistik & progress bar puasa

### ✅ Tracker Ibadah
- Checklist 8 ibadah harian (Sholat 5 waktu, Tarawih, Tadarus, Sedekah)
- Streak sholat 5 waktu berturut-turut


---

## 🛠️ Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| React 18 | UI Framework |
| Vite 5 | Build Tool |
| Tailwind CSS 4 | Styling |
| IndexedDB (`idb`) | Cache data Al-Qur'an |
| localStorage | Cache prayer times, settings, logs |
| Aladhan API | Data waktu sholat (free, no API key) |
| alquran.cloud API | Data Al-Qur'an (free, no API key) |
| Nominatim OSM | Reverse geocoding lokasi (free, no API key) |
| Font Awesome 6 | Icons |
| Google Fonts | Poppins + Amiri (Arabic) |

---

## 📦 Instalasi

### Prerequisites
- Node.js >= 18
- npm >= 9

### Clone & Install
```bash
git clone https://github.com/username/ramadhan-app.git
cd ramadhan-app
npm install
```

### Jalankan Development Server
```bash
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser.

### Build Production
```bash
npm run build
npm run preview
```

---


```

---

## 🌐 API yang Digunakan

| API | Endpoint | Keterangan |
|-----|----------|------------|
| Aladhan | `api.aladhan.com/v1/timings` | Waktu sholat, gratis, no API key |
| alquran.cloud | `api.alquran.cloud/v1/surah` | Data Al-Qur'an, gratis, no API key |
| Nominatim OSM | `nominatim.openstreetmap.org/reverse` | Reverse geocoding, gratis, no API key |

Semua API **gratis** dan **tidak memerlukan API key**.

---

## 💾 Strategi Penyimpanan Data
```
localStorage (data kecil, ~5MB limit)
├── user_location        — koordinat & nama kota
├── prayer_times_cache   — jadwal sholat (cache harian)
├── fasting_log          — catatan puasa 30 hari
├── tracker_log          — checklist ibadah harian
├── quran_bookmark       — bookmark ayat terakhir
└── prayer_calc_method   — metode perhitungan sholat

IndexedDB (data besar, ratusan MB)
└── quran-surahs
    ├── surah 1 — Al-Fatihah (Arab + terjemahan)
    ├── surah 2 — Al-Baqarah
    └── ... (114 surah, cached setelah pertama dibuka)
```

---



Untuk install di HP:
1. Buka di browser (Chrome/Safari)
2. Tap menu browser → **"Add to Home Screen"**
3. App bisa diakses seperti aplikasi native

---

## 🚀 Deploy

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
```bash
npm install -g vercel
vercel
```

### Manual Build
```bash
npm run build
# Upload folder /dist ke hosting manapun
```

---

## 🤝 Kontribusi

Pull request dan issue sangat diterima! Untuk perubahan besar, buka issue terlebih dahulu.

---

## 📄 Lisensi

MIT License © 2026 Ramadhan App

---

<div align="center">
  <p>Developed by Fernanda Yoga</p>
  <p>Ramadhan Kareem 🌙</p>
</div>