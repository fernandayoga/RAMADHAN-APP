import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import TopBar  from "./components/TopBar";

import Home    from "./pages/Home";
import Prayer  from "./pages/Prayer";
import Iftar   from "./pages/Iftar";
import Qibla   from "./pages/Qibla";
import Quran   from "./pages/Quran";
import Fasting from "./pages/Fasting";
import Tracker from "./pages/Tracker";

const PAGE_MAP = {
  home: Home, prayer: Prayer, iftar: Iftar,
  qibla: Qibla, quran: Quran, fasting: Fasting, tracker: Tracker,
};

function AppInner() {
  const { activePage } = useApp();
  const ActivePage = PAGE_MAP[activePage] || Home;

  return (
    <div className="min-h-screen" style={{ background: "#0d0520" }}>

      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 20% 0%, rgba(124,58,237,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 100%, rgba(45,212,191,0.06) 0%, transparent 60%)
          `
        }} />

      {/* Sidebar — desktop only */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* TopBar + BottomNav — mobile only */}
      <TopBar />

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen relative z-10 overflow-y-auto
        pt-16 pb-20 lg:pt-0 lg:pb-0">
        <ActivePage />
      </main>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}