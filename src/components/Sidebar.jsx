import { useApp } from "../context/AppContext";
import LocationModal from "./LocationModal";
import { useState } from "react";


const NAV_ITEMS = [
  { id: "home", icon: "fa-house", label: "Beranda" },
  { id: "prayer", icon: "fa-clock", label: "Waktu Sholat" },
  { id: "iftar", icon: "fa-moon", label: "Sahur & Berbuka" },
  { id: "qibla", icon: "fa-compass", label: "Arah Kiblat" },
  { id: "quran", icon: "fa-book-open", label: "Al-Qur'an" },
  { id: "fasting", icon: "fa-calendar-day", label: "Catatan Puasa" },
  { id: "tracker", icon: "fa-list-check", label: "Tracker Ibadah" },
];

export default function Sidebar() {
  const { activePage, setActivePage, hijriDate, location } = useApp();
  const [showLocationModal, setShowLocationModal] = useState(false);
 

  return (
    <>
      <aside
        className="fixed left-0 top-0 h-screen w-64 z-40 flex flex-col"
        style={{
          background: "linear-gradient(180deg, #1a0533 0%, #0d0520 100%)",
          borderRight: "1px solid rgba(212,168,67,0.15)",
        }}
      >
        {/* Logo area */}
        <div
          className="px-6 py-7 border-b"
          style={{ borderColor: "rgba(212,168,67,0.12)" }}
        >
          <div className="flex items-center gap-3 ">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #4c1d95)",
                boxShadow: "0 0 20px rgba(124,58,237,0.4)",
              }}
            >
              <i className="fa-solid fa-star-and-crescent text-[#d4a843]" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-widest text-[#e8eaf6] uppercase">
                Ramadhan App
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-hide">
          <p className="text-[10px] uppercase tracking-widest text-[#4a3570] px-3 mb-3 font-semibold">
            Menu
          </p>
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ id, icon, label }) => {
              const active = activePage === id;
              return (
                <li key={id}>
                  <button
                    onClick={() => setActivePage(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left
                    ${
                      active
                        ? "text-[#d4a843]"
                        : "text-[#8878b0] hover:text-[#c4b0e8] hover:bg-white/5"
                    }`}
                    style={
                      active
                        ? {
                            background:
                              "linear-gradient(90deg, rgba(124,58,237,0.3), rgba(212,168,67,0.08))",
                            border: "1px solid rgba(212,168,67,0.2)",
                            boxShadow: "0 0 12px rgba(124,58,237,0.2)",
                          }
                        : { border: "1px solid transparent" }
                    }
                  >
                    <i
                      className={`fa-solid ${icon} w-4 text-center text-base ${
                        active ? "text-[#d4a843]" : "text-[#5a4080]"
                      }`}
                    />
                    <span>{label}</span>
                    {active && (
                      <i className="fa-solid fa-chevron-right ml-auto text-[10px] text-[#d4a843]/60" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Location badge */}
        <div
          className="px-4 py-4 border-t"
          style={{ borderColor: "rgba(212,168,67,0.12)" }}
        >
          <button
            onClick={() => setShowLocationModal(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer border-none text-left"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.border = "1px solid rgba(59,130,246,0.3)";
              e.currentTarget.style.background = "rgba(59,130,246,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)";
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            }}
          >
            <i className="fa-solid fa-location-dot text-[#3b82f6] text-sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#2a3858] font-medium">Lokasi</p>
              <p className="text-xs text-[#4a6890] truncate">
                {location
                  ? location.city ||
                    `${location.lat.toFixed(2)}°, ${location.lng.toFixed(2)}°`
                  : "Belum diset — klik untuk atur"}
              </p>
            </div>
            <i className="fa-solid fa-pen text-[#2a3858] text-[10px]" />
          </button>
        </div>

        
      </aside>
      {/* Modal */}
      {showLocationModal && (
        <LocationModal onClose={() => setShowLocationModal(false)} />
      )}
    </>
  );
}
