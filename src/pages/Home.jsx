import { useApp } from "../context/AppContext";
import LocationModal from "../components/LocationModal";
import { useState } from "react";


const QUICK_LINKS = [
  {
    icon: "fa-clock",
    label: "Waktu Sholat",
    desc: "Jadwal sholat 5 waktu otomatis berdasarkan lokasi GPS kamu — Subuh, Dzuhur, Ashar, Maghrib, Isya.",
    color: "#3b82f6",
    badge: "Auto GPS"
  },
  {
    icon: "fa-moon",
    label: "Sahur & Berbuka",
    desc: "Countdown real-time menuju waktu sahur dan berbuka, diturunkan langsung dari jadwal Subuh & Maghrib.",
    color: "#6366f1",
    badge: "Countdown"
  },
  {
    icon: "fa-compass",
    label: "Arah Kiblat",
    desc: "Kompas digital berbasis sensor perangkat untuk menunjukkan arah Ka'bah dari posisimu saat ini.",
    color: "#10b981",
    badge: "Kompas"
  },
  {
    icon: "fa-book-open",
    label: "Al-Qur'an",
    desc: "Baca 30 Juz Al-Qur'an lengkap dengan terjemahan Bahasa Indonesia. Data tersimpan offline di perangkat.",
    color: "#d4a843",
    badge: "Offline"
  },
  {
    icon: "fa-calendar-day",
    label: "Catatan Puasa",
    desc: "Tandai status puasa harian, catat alasan jika tidak puasa, dan lihat ringkasan statistik selama Ramadhan.",
    color: "#ef4444",
    badge: "Statistik"
  },
  {
    icon: "fa-list-check",
    label: "Tracker Ibadah",
    desc: "Checklist ibadah harian — Sholat, Tarawih, Tadarus, Sedekah — lengkap dengan rekap mingguan.",
    color: "#06b6d4",
    badge: "Checklist"
  },
];

function QuickCard({ icon, label, desc, color, badge }) {
  return (
    <div
      className="flex flex-col gap-4 p-5 rounded-2xl"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
      }}
    >
      {/* Icon + Badge */}
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
          style={{ background: `${color}18` }}
        >
          <i className={`fa-solid ${icon}`} style={{ color }} />
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1.5">
        <p className="text-md font-semibold text-[#c8d0e8]">{label}</p>
        <p className="text-sm text-[#536e95] leading-relaxed">{desc}</p>
      </div>

      
    </div>
  );
}

const STARS = Array.from({ length: 24 }, (_, i) => ({
  top:   `${5  + (i * 13) % 88}%`,
  left:  `${3  + (i * 19) % 94}%`,
  delay: `${(i * 0.35).toFixed(2)}s`,
  size:  [2, 2, 3, 2, 4][i % 5],
}));

export default function Home() {
  const { location, hijriDate } = useApp();
   const [showLocationModal, setShowLocationModal] = useState(false);
  const now = new Date();
  const greeting = now.getHours() < 11 ? "Selamat Pagi" : now.getHours() < 16 ? "Selamat Siang": now.getHours() < 19 ? "Selamat Sore" : "Selamat Malam";

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 max-w-5xl mx-auto animate-fadeinup ">

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 lg:p-12 text-center"
        style={{
          background: "linear-gradient(135deg, #2d1057 0%, #1a0533 40%, #0f2a5e 100%)",
          border: "1px solid rgba(212,168,67,0.2)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)"
        }}>

        {/* Stars */}
        {STARS.map((s, i) => (
          <span key={i} className="absolute rounded-full bg-white animate-twinkle"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay, opacity: 0.5 }} />
        ))}

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #d4a843, transparent)" }} />

        {/* Moon */}
        <div className="relative flex justify-center mb-6">
          <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full animate-moon"
            style={{
              background: "radial-gradient(circle at 35% 30%, #f0c96a, #d4a843 55%, #8a6820 100%)",
              boxShadow: "0 0 30px rgba(212,168,67,0.5), 0 0 80px rgba(212,168,67,0.15), inset -4px -4px 12px rgba(0,0,0,0.3)"
            }}>
            <div className="absolute -inset-4 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 70%)" }} />
          </div>
        </div>

        <p className="font-arabic text-xl lg:text-2xl text-[#d4a843] mb-2 leading-loose">
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
        </p>
        <h2 className="text-[13px] text-[#9878d0] uppercase tracking-widest font-medium mb-1">{greeting}</h2>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-widest mb-3 gold-shimmer font-arabic">
          Ramadhan Kareem
        </h1>
        <p className="text-sm text-[#6a88b0] mb-5 font-arabic">{hijriDate}</p>
       

        <button
          onClick={() => setShowLocationModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer border-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.border = "1px solid rgba(59,130,246,0.35)";
            e.currentTarget.style.background = "rgba(59,130,246,0.08)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          }}
        >
          <i className="fa-solid fa-location-dot text-[#3b82f6]" />
          <span className="text-[#4a6890]">
            {location
              ? (location.city || `${location.lat.toFixed(2)}°, ${location.lng.toFixed(2)}°`)
              : "Belum diset — klik untuk atur lokasi"}
          </span>
          <i className="fa-solid fa-pen text-[#2a3858] text-[10px]" />
        </button>
      </div>

      {/* Section title */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "rgba(212,168,67,0.15)" }} />
        <p className="text-xs uppercase tracking-widest text-[#4a3570] font-semibold px-2">Fitur Utama</p>
        <div className="h-px flex-1" style={{ background: "rgba(212,168,67,0.15)" }} />
      </div>

      {/* Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {QUICK_LINKS.map(({ icon, label, desc, page, color }) => (
          <QuickCard key={page} icon={icon} label={label} desc={desc} page={page} color={color} />
        ))}
      </div>
      

      {showLocationModal && (
        <LocationModal onClose={() => setShowLocationModal(false)} />
      )}

      {/* Copyright */}
        <div className="px-4 pb-1 pt-2 lg:hidden">
          <p className="text-[10px] text-center text-[#586488] leading-relaxed">
            © {new Date().getFullYear()} Ramadhan App <br />
            Developed by Fernanda Yoga.
          </p>
        </div>
    </div>
  );
}

