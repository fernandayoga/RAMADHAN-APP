import { useState } from "react";
import { useApp } from "../context/AppContext";

const PAGE_TITLES = {
  home: "Beranda", prayer: "Waktu Sholat", iftar: "Sahur & Berbuka",
  qibla: "Arah Kiblat", quran: "Al-Qur'an", fasting: "Catatan Puasa", tracker: "Tracker Ibadah",
};

const NAV_ITEMS = [
  { id: "home",    icon: "fa-house" },
  { id: "prayer",  icon: "fa-clock" },
  { id: "iftar",   icon: "fa-moon" },
  { id: "quran",   icon: "fa-book-open" },
  { id: "tracker", icon: "fa-list-check" },
];

export default function TopBar() {
  const { activePage, setActivePage, hijriDate } = useApp();

  return (
    <>
      {/* Top header - mobile only */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 "
        style={{ background: "rgba(13,5,32,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(212,168,67,0.12)" }}>
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-star-and-crescent text-[#d4a843] text-lg" />
          <span className="text-sm font-semibold tracking-wide">Ramadhan App</span>
        </div>
        <span className="text-[11px] text-[#d4a843] font-arabic">{PAGE_TITLES[activePage]}</span>
      </header>

      {/* Bottom nav - mobile only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around px-2 py-2"
        style={{ background: "rgba(13,5,32,0.95)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(212,168,67,0.12)" }}>
        {NAV_ITEMS.map(({ id, icon }) => {
          const active = activePage === id;
          return (
            <button key={id} onClick={() => setActivePage(id)}
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200
                ${active ? "text-[#d4a843]" : "text-[#4a3570]"}`}
              style={active ? { background: "rgba(124,58,237,0.2)" } : {}}>
              <i className={`fa-solid ${icon} text-lg`} />
              {active && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#d4a843]" />}
            </button>
          );
        })}
      </nav>
    </>
  );
}