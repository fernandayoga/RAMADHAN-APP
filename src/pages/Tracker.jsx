import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  IBADAH_LIST, CATEGORIES, getDayTracker,
  getDayScore, calcTrackerStats, calcSholatStreak,
} from "../utils/tracker";
import {
  RAMADHAN_DAYS, getRamadhanDate,
  getTodayRamadhanDay, dateToKey,
} from "../utils/fasting";

export default function Tracker() {
  const { trackerLog, setTrackerLog } = useApp();
  const todayDay     = getTodayRamadhanDay() || 1;
  const [activeDay, setActiveDay] = useState(todayDay);
  const [activeTab, setActiveTab] = useState("today"); // "today" | "recap"

  const toggleIbadah = (ibadahId) => {
    const key   = dateToKey(getRamadhanDate(activeDay));
    const entry = trackerLog[key] || {};
    setTrackerLog(prev => ({
      ...prev,
      [key]: {
        ...entry,
        [ibadahId]: !entry[ibadahId],
        updatedAt: Date.now(),
      }
    }));
  };

  const stats  = calcTrackerStats(trackerLog);
  const streak = calcSholatStreak(trackerLog);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto flex flex-col gap-6 animate-fadeinup">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#e8eaf6]">Tracker Ibadah</h2>
          <p className="text-xs text-[#3a5070] mt-0.5">Ramadhan 1447 H</p>
        </div>

        {/* Streak badge */}
        {streak.streak > 0 && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: "rgba(212,168,67,0.1)",
              border: "1px solid rgba(212,168,67,0.25)"
            }}
          >
            <i className="fa-solid fa-fire text-[#d4a843] text-sm" />
            <div>
              <p className="text-xs font-bold text-[#d4a843]">{streak.streak} hari</p>
              <p className="text-[10px] text-[#6a7890]">Sholat lengkap</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-2xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {[
          { id: "today",  label: "Check-point",  icon: "fa-calendar-day" },
          { id: "recap",  label: "Rekap",     icon: "fa-chart-bar"    },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium cursor-pointer border-none transition-all duration-200"
            style={activeTab === tab.id ? {
              background: "linear-gradient(135deg, #1e3a8a, #1e40af)",
              color: "#e8eaf6",
              boxShadow: "0 4px 12px rgba(30,58,138,0.3)"
            } : {
              background: "transparent",
              color: "#3a5070"
            }}
          >
            <i className={`fa-solid ${tab.icon} text-xs`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Hari Ini */}
      {activeTab === "today" && (
        <TodayTab
          activeDay={activeDay}
          setActiveDay={setActiveDay}
          trackerLog={trackerLog}
          todayDay={todayDay}
          onToggle={toggleIbadah}
        />
      )}

      {/* Tab: Rekap */}
      {activeTab === "recap" && (
        <RecapTab
          trackerLog={trackerLog}
          stats={stats}
          streak={streak}
        />
      )}
    </div>
  );
}

// ─── Today Tab ────────────────────────────────────────

function TodayTab({ activeDay, setActiveDay, trackerLog, todayDay, onToggle }) {
  const entry      = getDayTracker(trackerLog, activeDay);
  const { done, total } = getDayScore(trackerLog, activeDay);
  const pct        = Math.round((done / total) * 100);
  const activeDate = getRamadhanDate(activeDay);

  return (
    <div className="flex flex-col gap-5">

      {/* Day selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveDay(d => Math.max(1, d - 1))}
          disabled={activeDay === 1}
          className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: activeDay === 1 ? "#1a2440" : "#4a6890",
            opacity: activeDay === 1 ? 0.4 : 1
          }}
        >
          <i className="fa-solid fa-chevron-left text-xs" />
        </button>

        <div
          className="flex-1 text-center py-2.5 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)"
          }}
        >
          <p className="text-sm font-bold text-[#e8eaf6]">
            {activeDay === todayDay ? "Hari Ini · " : ""}
            Ramadhan Hari ke-{activeDay}
          </p>
          <p className="text-[11px] text-[#3a5070]">
            {activeDate.toLocaleDateString("id-ID", {
              weekday: "long", day: "numeric", month: "long"
            })}
          </p>
        </div>

        <button
          onClick={() => setActiveDay(d => Math.min(RAMADHAN_DAYS, d + 1))}
          disabled={activeDay === RAMADHAN_DAYS}
          className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: activeDay === RAMADHAN_DAYS ? "#1a2440" : "#4a6890",
            opacity: activeDay === RAMADHAN_DAYS ? 0.4 : 1
          }}
        >
          <i className="fa-solid fa-chevron-right text-xs" />
        </button>
      </div>

      {/* Progress hari ini */}
      <div
        className="px-5 py-4 rounded-2xl flex items-center gap-4"
        style={{
          background: "linear-gradient(135deg, #0c1e4a 0%, #0a1535 100%)",
          border: "1px solid rgba(212,168,67,0.15)"
        }}
      >
        {/* Circle progress */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none"
              stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <circle cx="32" cy="32" r="26" fill="none"
              stroke={pct === 100 ? "#10b981" : "#d4a843"}
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - pct / 100)}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-[#e8eaf6]">{pct}%</span>
          </div>
        </div>

        <div>
          <p className="text-base font-bold text-[#e8eaf6]">{done} / {total} ibadah</p>
          <p className="text-xs text-[#3a5070] mt-0.5">
            {pct === 100
              ? "Sempurna! Alhamdulillah 🌟"
              : pct >= 60
              ? "Hampir lengkap, semangat!"
              : "Yuk lengkapi ibadah hari ini"}
          </p>
        </div>
      </div>

      {/* Checklist per kategori */}
      {CATEGORIES.map(cat => (
        <div key={cat.id} className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <i className={`fa-solid ${cat.icon} text-xs text-[#2a3858]`} />
            <p className="text-[11px] uppercase tracking-widest text-[#2a3858] font-semibold">
              {cat.label}
            </p>
          </div>
          {IBADAH_LIST
            .filter(i => i.category === cat.id)
            .map(ibadah => (
              <IbadahItem
                key={ibadah.id}
                ibadah={ibadah}
                checked={entry[ibadah.id] === true}
                onToggle={() => onToggle(ibadah.id)}
              />
            ))
          }
        </div>
      ))}
    </div>
  );
}

function IbadahItem({ ibadah, checked, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl w-full text-left cursor-pointer border-none transition-all duration-200"
      style={checked ? {
        background: `${ibadah.color}12`,
        border: `1px solid ${ibadah.color}35`,
      } : {
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)"
      }}
    >
      {/* Icon ibadah */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: checked ? `${ibadah.color}20` : "rgba(255,255,255,0.04)",
        }}
      >
        <i
          className={`fa-solid ${ibadah.icon} text-sm`}
          style={{ color: checked ? ibadah.color : "#2a4070" }}
        />
      </div>

      {/* Label */}
      <p
        className="flex-1 text-sm font-medium transition-colors duration-200"
        style={{ color: checked ? "#e8eaf6" : "#4a6090" }}
      >
        {ibadah.label}
      </p>

      {/* Checkbox */}
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={checked ? {
          background: ibadah.color,
          boxShadow: `0 0 10px ${ibadah.color}50`
        } : {
          background: "rgba(255,255,255,0.05)",
          border: "2px solid rgba(255,255,255,0.1)"
        }}
      >
        {checked && <i className="fa-solid fa-check text-white text-[10px]" />}
      </div>
    </button>
  );
}

// ─── Recap Tab ────────────────────────────────────────

function RecapTab({ trackerLog, stats, streak }) {
  return (
    <div className="flex flex-col gap-5">

      

      {/* Stats per ibadah */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)"
        }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <p className="text-sm font-semibold text-[#c8d0e8]">
            <i className="fa-solid fa-chart-bar mr-2 text-[#3b82f6]" />
            Statistik per Ibadah
          </p>
        </div>
        <div className="px-5 py-3 flex flex-col gap-3">
          {IBADAH_LIST.map(ibadah => {
            const count = stats[ibadah.id] || 0;
            const pct   = Math.round((count / RAMADHAN_DAYS) * 100);
            return (
              <div key={ibadah.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i
                      className={`fa-solid ${ibadah.icon} text-xs w-4 text-center`}
                      style={{ color: ibadah.color }}
                    />
                    <span className="text-xs text-[#4a6890]">{ibadah.label}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: ibadah.color }}>
                    {count} / {RAMADHAN_DAYS}
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: ibadah.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap 30 hari */}
      <HeatmapCalendar trackerLog={trackerLog} />
    </div>
  );
}

function HeatmapCalendar({ trackerLog }) {
  return (
    <div
      className="rounded-2xl px-5 py-5"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)"
      }}
    >
      <p className="text-sm font-semibold text-[#c8d0e8] mb-4">
        <i className="fa-solid fa-fire-flame-curved mr-2 text-[#ef4444]" />
        Heatmap 30 Hari
      </p>
      <div className="grid grid-cols-10 gap-1.5">
        {Array.from({ length: RAMADHAN_DAYS }, (_, i) => i + 1).map(day => {
          const { done, total } = getDayScore(trackerLog, day);
          const pct             = done / total;
          const todayDay        = getTodayRamadhanDay();
          const isFuture        = todayDay ? day > todayDay : false;

          const bg = isFuture
            ? "rgba(255,255,255,0.03)"
            : pct === 0
            ? "rgba(255,255,255,0.06)"
            : pct < 0.4
            ? "rgba(212,168,67,0.2)"
            : pct < 0.7
            ? "rgba(212,168,67,0.45)"
            : pct < 1
            ? "rgba(212,168,67,0.7)"
            : "#d4a843";

          return (
            <div
              key={day}
              className="aspect-square rounded-lg flex items-center justify-center"
              style={{ background: bg }}
              title={`Hari ${day}: ${done}/${total} ibadah`}
            >
              <span
                className="text-[9px] font-bold"
                style={{ color: pct >= 0.7 ? "#070d1f" : "rgba(255,255,255,0.3)" }}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend heatmap */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-[#2a3858]">Kurang</span>
        {["rgba(255,255,255,0.06)", "rgba(212,168,67,0.2)", "rgba(212,168,67,0.45)", "rgba(212,168,67,0.7)", "#d4a843"].map((bg, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ background: bg }} />
        ))}
        <span className="text-[10px] text-[#2a3858]">Lengkap</span>
      </div>
    </div>
  );
}