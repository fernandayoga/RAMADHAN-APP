import { useApp } from "../context/AppContext";

const NAV_ITEMS = [
  { id: "home",    icon: "🏠", label: "Beranda" },
  { id: "prayer",  icon: "🕐", label: "Sholat" },
  { id: "iftar",   icon: "🌙", label: "Sahur/Buka" },
  { id: "quran",   icon: "📖", label: "Qur'an" },
  { id: "tracker", icon: "✅", label: "Tracker" },
];

export default function BottomNav() {
  const { activePage, setActivePage } = useApp();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 border-t border-[#243058] bg-[#0f1729]/90 backdrop-blur-xl pb-safe">
      <div className="flex justify-around px-1 py-2">
        {NAV_ITEMS.map(({ id, icon, label }) => {
          const active = activePage === id;
          return (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              className={`relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[60px] border-none cursor-pointer
                ${active ? "bg-[#d4a843]/10" : "bg-transparent"}`}
            >
              <span className="text-xl">{icon}</span>
              <span className={`text-[10px] font-sans tracking-tight transition-colors duration-200
                ${active ? "text-[#d4a843]" : "text-[#8892b0]"}`}>
                {label}
              </span>
              {active && (
                <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#d4a843] shadow-[0_0_6px_#d4a843]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}