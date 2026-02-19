import { useApp } from "../context/AppContext";

const PAGE_TITLES = {
  home:    "Ramadhan App",
  prayer:  "Waktu Sholat",
  iftar:   "Sahur & Berbuka",
  qibla:   "Arah Kiblat",
  quran:   "Al-Qur'an",
  fasting: "Catatan Puasa",
  tracker: "Tracker Ibadah",
};

export default function Header() {
  const { activePage, hijriDate } = useApp();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-3.5 border-b border-[#243058] backdrop-blur-xl bg-linear-to-b from-[#0f1729] to-transparent">
      <div className="flex items-center gap-2">
        <span className="text-2xl drop-shadow-[0_0_6px_rgba(212,168,67,0.8)]">☪</span>
        <span className="text-base font-bold tracking-wide text-[#e8eaf6]">
          {PAGE_TITLES[activePage] || "Ramadhan App"}
        </span>
      </div>
      <span className="text-[11px] tracking-widest text-[#d4a843]">{hijriDate}</span>
    </header>
  );
}