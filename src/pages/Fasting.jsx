import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  RAMADHAN_DAYS,
  HIJRI_YEAR,
  RAMADHAN_START,
  STATUS,
  STATUS_CONFIG,
  ALASAN_OPTIONS,
  dateToKey,
  getRamadhanDate,
  getTodayRamadhanDay,
  calcStats,
} from "../utils/fasting";

export default function Fasting() {
  const { fastingLog, setFastingLog } = useApp();
  const [selectedDay, setSelectedDay] = useState(getTodayRamadhanDay() || 1);
  const [showModal, setShowModal] = useState(false);
  const todayDay = getTodayRamadhanDay();
  const stats = calcStats(fastingLog);

  const getEntry = (day) => {
    const key = dateToKey(getRamadhanDate(day));
    return fastingLog[key] || { status: STATUS.BELUM, alasan: "" };
  };

  const saveEntry = (day, status, alasan = "") => {
    const key = dateToKey(getRamadhanDate(day));
    setFastingLog((prev) => ({
      ...prev,
      [key]: { status, alasan, updatedAt: Date.now() },
    }));
  };

  const selectedEntry = getEntry(selectedDay);
  const selectedDate = getRamadhanDate(selectedDay);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto flex flex-col gap-6 animate-fadeinup">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#e8eaf6]">Catatan Puasa</h2>
        <p className="text-xs text-[#3a5070] mt-0.5">
          Ramadhan {HIJRI_YEAR} H · {RAMADHAN_DAYS} hari
        </p>
      </div>

      {/* Statistik */}
      <StatsBar stats={stats} />

      {/* Kalender */}
      <div
        className="rounded-3xl p-5"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-[#c8d0e8]">
            <i className="fa-solid fa-calendar mr-2 text-[#3b82f6]" />
            Kalender Ramadhan
          </p>
          {todayDay && (
            <span
              className="text-[11px] px-2.5 py-1 rounded-full font-medium"
              style={{
                background: "rgba(59,130,246,0.12)",
                color: "#3b82f6",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              Hari ke-{todayDay}
            </span>
          )}
        </div>

        {/* Grid kalender */}
        <div className="grid grid-cols-6 lg:grid-cols-10 gap-2">
          {Array.from({ length: RAMADHAN_DAYS }, (_, i) => i + 1).map((day) => {
            const entry = getEntry(day);
            const config = STATUS_CONFIG[entry.status];
            const isToday = day === todayDay;
            const isSelected = day === selectedDay;
            const isFuture = todayDay ? day > todayDay : false;

            return (
              <div
                key={day}
                className="flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200 relative"
                style={{
                  background: isSelected
                    ? `${config.color}20`
                    : "rgba(255,255,255,0.03)",
                  border: isToday
                    ? `2px solid ${config.color}`
                    : isSelected
                    ? `1px solid ${config.color}50`
                    : "1px solid rgba(255,255,255,0.05)",
                  opacity: isFuture ? 0.3 : 1,
                  cursor: isFuture ? "not-allowed" : "pointer",
                }}
                onClick={() => {
                  if (!isFuture) setSelectedDay(day); // klik area → hanya select
                }}
                onMouseEnter={(e) => {
                  if (!isFuture)
                    e.currentTarget.style.background = `${config.color}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isSelected
                    ? `${config.color}20`
                    : "rgba(255,255,255,0.03)";
                }}
              >
                <span
                  className="text-[10px] font-bold"
                  style={{ color: config.color }}
                >
                  {day}
                </span>
                <i
                  className={`fa-solid ${config.icon} text-[10px]`}
                  style={{ color: config.color }}
                />

                {/* Tombol edit — hanya muncul saat di-hover atau selected, dan bukan future */}
                {!isFuture && isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // jangan trigger onClick parent
                      setShowModal(true);
                    }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer border-none z-10"
                    style={{
                      background: config.color,
                      boxShadow: `0 0 6px ${config.color}80`,
                    }}
                    title="Edit"
                  >
                    <i className="fa-solid fa-pen text-[7px] text-white" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(
            ([key, { label, color, icon }]) => (
              <div key={key} className="flex items-center gap-1.5">
                <i
                  className={`fa-solid ${icon} text-[11px]`}
                  style={{ color }}
                />
                <span className="text-[11px] text-[#2a3858]">{label}</span>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Detail hari dipilih */}
      <DayDetail
        day={selectedDay}
        date={selectedDate}
        entry={selectedEntry}
        isToday={selectedDay === todayDay}
        isFuture={todayDay ? selectedDay > todayDay : false}
        onSave={saveEntry}
      />

      {/* Modal input — mobile friendly */}
      {showModal && (
        <EntryModal
          day={selectedDay}
          date={selectedDate}
          entry={selectedEntry}
          onSave={(status, alasan) => {
            saveEntry(selectedDay, status, alasan);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────

function StatsBar({ stats }) {
  const pct = Math.round((stats.puasa / stats.total) * 100);

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        {
          label: "Puasa",
          value: stats.puasa,
          color: "#10b981",
          icon: "fa-circle-check",
        },
        {
          label: "Tidak Puasa",
          value: stats.tidak,
          color: "#ef4444",
          icon: "fa-circle-xmark",
        },
        {
          label: "Belum Diisi",
          value: stats.belum,
          color: "#2a3858",
          icon: "fa-circle",
        },
      ].map(({ label, value, color, icon }) => (
        <div
          key={label}
          className="flex flex-col gap-2 px-4 py-4 rounded-2xl"
          style={{
            background: `${color}08`,
            border: `1px solid ${color}20`,
          }}
        >
          <i className={`fa-solid ${icon} text-sm`} style={{ color }} />
          <p className="text-2xl font-bold" style={{ color }}>
            {value}
          </p>
          <p className="text-[11px] text-[#2a3858]">{label}</p>
        </div>
      ))}

      {/* Progress bar */}
      <div
        className="col-span-3 px-4 py-3 rounded-2xl flex flex-col gap-2"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#3a5070] font-medium">Progress Puasa</p>
          <p className="text-xs font-bold text-[#10b981]">{pct}%</p>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #059669, #10b981)",
            }}
          />
        </div>
        <p className="text-[11px] text-[#2a3858]">
          {stats.puasa} dari {stats.total} hari ·{" "}
          {stats.tidak > 0
            ? `${stats.tidak} hari perlu diqadha`
            : "Semangat! 🌙"}
        </p>
      </div>
    </div>
  );
}

// ─── Day Detail ───────────────────────────────────────

function DayDetail({ day, date, entry, isToday, isFuture, onSave }) {
  const config = STATUS_CONFIG[entry.status];

  return (
    <div
      className="rounded-2xl px-5 py-5 flex flex-col gap-4"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#2a3858] font-medium uppercase tracking-widest mb-1">
            {isToday ? "Hari Ini" : `Ramadhan Hari ke-${day}`}
          </p>
          <p className="text-sm font-semibold text-[#c8d0e8]">
            {date.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: `${config.color}15`,
            color: config.color,
            border: `1px solid ${config.color}30`,
          }}
        >
          <i className={`fa-solid ${config.icon} text-[10px]`} />
          {config.label}
        </div>
      </div>

      {entry.alasan && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <i className="fa-solid fa-note-sticky text-[#3a5070]" />
          <span className="text-[#4a6890]">{entry.alasan}</span>
        </div>
      )}
    </div>
  );
}

// ─── Entry Modal ──────────────────────────────────────

import { useEffect } from "react";

function EntryModal({ day, date, entry, onSave, onClose }) {
  const [status, setStatus] = useState(entry.status);
  const [alasan, setAlasan] = useState(entry.alasan || "");
  const [custom, setCustom] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSave = () => {
    // Kalau status PUASA, alasan dikosongkan otomatis
    const finalAlasan =
      status === STATUS.PUASA ? "" : alasan === "Lainnya" ? custom : alasan;
    onSave(status, finalAlasan);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{
        background: "transparent",
        backdropFilter: "blur(6px)",
        height: "100dvh",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden mt-10"
        style={{
          background: "linear-gradient(135deg, #0c1530 0%, #070d1f 100%)",
          border: "1px solid rgba(212,168,67,0.2)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "rgba(212,168,67,0.12)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(212,168,67,0.1)" }}
            >
              <i className="fa-solid fa-calendar-day text-[#d4a843]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#e8eaf6]">
                Ramadhan Hari ke-{day}
              </h2>
              <p className="text-[11px] text-[#2a3858]">
                {date.toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", color: "#3a5070" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e8eaf6")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3a5070")}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Status toggle */}
          <div>
            <p className="text-[11px] text-[#2a3858] uppercase tracking-widest font-semibold mb-3">
              Status Puasa
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: STATUS.PUASA,
                  label: "Puasa",
                  icon: "fa-circle-check",
                  color: "#10b981",
                },
                {
                  value: STATUS.TIDAK,
                  label: "Tidak Puasa",
                  icon: "fa-circle-xmark",
                  color: "#ef4444",
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setStatus(opt.value);
                    // Reset alasan kalau pilih PUASA
                    if (opt.value === STATUS.PUASA) {
                      setAlasan("");
                      setCustom("");
                    }
                  }}
                  className="flex flex-col items-center gap-2 py-4 rounded-2xl cursor-pointer border-none transition-all duration-200"
                  style={
                    status === opt.value
                      ? {
                          background: `${opt.color}18`,
                          border: `2px solid ${opt.color}50`,
                          color: opt.color,
                        }
                      : {
                          background: "rgba(255,255,255,0.03)",
                          border: "2px solid rgba(255,255,255,0.06)",
                          color: "#3a5070",
                        }
                  }
                >
                  <i className={`fa-solid ${opt.icon} text-2xl`} />
                  <span className="text-xs font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Alasan — hanya tampil kalau tidak puasa */}
          {status === STATUS.TIDAK && (
            <div>
              <p className="text-[11px] text-[#2a3858] uppercase tracking-widest font-semibold mb-3">
                Alasan (Opsional)
              </p>
              <div className="flex flex-col gap-2">
                {ALASAN_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAlasan(opt)}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm cursor-pointer border-none transition-all duration-200 text-left"
                    style={
                      alasan === opt
                        ? {
                            background: "rgba(212,168,67,0.1)",
                            color: "#d4a843",
                            border: "1px solid rgba(212,168,67,0.25)",
                          }
                        : {
                            background: "rgba(255,255,255,0.03)",
                            color: "#4a6890",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }
                    }
                  >
                    {opt}
                    {alasan === opt && (
                      <i className="fa-solid fa-check text-xs" />
                    )}
                  </button>
                ))}

                {/* Input custom kalau pilih "Lainnya" */}
                {alasan === "Lainnya" && (
                  <input
                    type="text"
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    placeholder="Tulis alasan..."
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e8eaf6",
                      fontFamily: "Poppins, sans-serif",
                    }}
                    onFocus={(e) =>
                      (e.target.style.border = "1px solid rgba(212,168,67,0.4)")
                    }
                    onBlur={(e) =>
                      (e.target.style.border =
                        "1px solid rgba(255,255,255,0.1)")
                    }
                  />
                )}
              </div>
            </div>
          )}

          {/* Simpan + Reset */}
          <div className="flex gap-3">
            {/* Tombol Reset — hanya tampil kalau sudah ada entry sebelumnya */}
            {entry.status !== STATUS.BELUM && (
              <button
                onClick={() => {
                  setStatus(STATUS.BELUM);
                  setAlasan("");
                  setCustom("");
                  onSave(STATUS.BELUM, "");
                  onClose();
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all duration-200"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                  e.currentTarget.style.border =
                    "1px solid rgba(239,68,68,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                  e.currentTarget.style.border =
                    "1px solid rgba(239,68,68,0.2)";
                }}
              >
                <i className="fa-solid fa-rotate-left text-sm" />
                Reset
              </button>
            )}

            {/* Tombol Simpan */}
            <button
              onClick={handleSave}
              disabled={status === STATUS.BELUM}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all duration-200"
              style={
                status !== STATUS.BELUM
                  ? {
                      background: "linear-gradient(135deg, #1e3a8a, #1e40af)",
                      color: "#e8eaf6",
                      boxShadow: "0 4px 16px rgba(30,58,138,0.4)",
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      color: "#2a3858",
                    }
              }
            >
              <i className="fa-solid fa-floppy-disk" />
              Simpan Catatan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
