import { useState, useEffect } from "react";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { useApp } from "../context/AppContext";
import LocationModal from "../components/LocationModal";
import { PRAYER_NAMES, CALC_METHODS, getActivePrayer } from "../utils/prayer";

export default function Prayer() {
  const { location } = useApp();
  const {
    prayerTimes,
    loading,
    error,
    method,
    changeMethod,
    reload,
    fromCache,
  } = usePrayerTimes();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [now, setNow] = useState(new Date());

  // Update jam setiap menit
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const { active, next } = getActivePrayer(prayerTimes);

  // Kalau belum ada lokasi
  if (!location) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto animate-fadeinup">
        <NoLocation onSet={() => setShowLocationModal(true)} />
        {showLocationModal && (
          <LocationModal onClose={() => setShowLocationModal(false)} />
        )}
      </div>
    );
  }

  return (
  
    <div className="p-6 lg:p-8 max-w-3xl mx-auto flex flex-col gap-6 animate-fadeinup" >
      {/* Header info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#e8eaf6]">Waktu Sholat</h2>
          <p className="text-xs text-[#3a5070] mt-0.5">
            <i className="fa-solid fa-location-dot mr-1 text-[#3b82f6]" />
            {location.city ||
              `${location.lat.toFixed(2)}°, ${location.lng.toFixed(2)}°`}
            {" · "}
            {now.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <button
          onClick={() => reload()}
          disabled={loading}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border-none"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(59,130,246,0.12)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
          }
          title="Refresh"
        >
          <i
            className={`fa-solid fa-rotate text-[#3b82f6] text-sm ${
              loading ? "fa-spin" : ""
            }`}
          />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-2xl text-sm"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <i className="fa-solid fa-triangle-exclamation text-[#ef4444] mt-0.5" />
          <div>
            <p className="text-[#ef4444] font-medium text-xs">
              Gagal memuat waktu sholat
            </p>
            <p className="text-[#6a3030] text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !prayerTimes && (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
          ))}
        </div>
      )}

      {/* Prayer cards */}
      {prayerTimes && (
        <>
          {/* Next prayer countdown banner */}
          <NextPrayerBanner prayerTimes={prayerTimes} next={next} now={now} />

          {/* Prayer list */}
          <div className="flex flex-col gap-3">
            {PRAYER_NAMES.map(({ key, label, icon }) => {
              const isActive = active === key;
              const isNext = next === key;
              const time = prayerTimes[key];

              return (
                <PrayerCard
                  key={key}
                  icon={icon}
                  label={label}
                  time={time}
                  isActive={isActive}
                  isNext={isNext}
                />
              );
            })}
          </div>

          {/* Cache info */}
          {fromCache && (
            <p className="text-[11px] text-[#243058] text-center">
              <i className="fa-solid fa-database mr-1" />
              Data akan diperbarui otomatis besok
            </p>
          )}
        </>
      )}
    </div>
   
  );
}

// ─── Sub Components ───────────────────────────────────

function NextPrayerBanner({ prayerTimes, next, now }) {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const calc = () => {
      if (!next || !prayerTimes) return;
      const nextTime = prayerTimes[next];
      if (!nextTime) return;

      const [h, m] = nextTime.split(":").map(Number);
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);

      const diff = target - new Date();
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(
        `${String(hours).padStart(2, "0")}:${String(mins).padStart(
          2,
          "0",
        )}:${String(secs).padStart(2, "0")}`,
      );
    };

    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [next, prayerTimes, now]);

  const nextPrayer = PRAYER_NAMES.find((p) => p.key === next);
  if (!nextPrayer) return null;

  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center justify-between"
      style={{
        background: "linear-gradient(135deg, #0c1e4a 0%, #0a1535 100%)",
        border: "1px solid rgba(212,168,67,0.2)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <div>
        <p className="text-[11px] text-[#3a5070] uppercase tracking-widest font-medium mb-1">
          Waktu sholat berikutnya
        </p>
        <div className="flex items-center gap-2">
          <i className={`fa-solid ${nextPrayer.icon} text-[#d4a843]`} />
          <p className="text-base font-bold text-[#e8eaf6]">
            {nextPrayer.label}
          </p>
          <span className="text-xs text-[#3a5070]">·</span>
          <p className="text-sm text-[#6a88b0]">{prayerTimes[next]}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[11px] text-[#3a5070] mb-1">Menuju</p>
        <p
          className="text-xl font-bold tracking-widest"
          style={{ color: "#d4a843", fontVariantNumeric: "tabular-nums" }}
        >
          {countdown}
        </p>
      </div>
    </div>
  );
}

function PrayerCard({ icon, label, time, isActive, isNext }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300"
      style={
        isActive
          ? {
              background:
                "linear-gradient(135deg, rgba(30,58,122,0.5), rgba(212,168,67,0.06))",
              border: "1px solid rgba(212,168,67,0.25)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }
          : isNext
          ? {
              background: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.2)",
            }
          : {
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
            }
      }
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: isActive
              ? "rgba(212,168,67,0.15)"
              : "rgba(255,255,255,0.04)",
          }}
        >
          <i
            className={`fa-solid ${icon} text-sm`}
            style={{
              color: isActive ? "#d4a843" : isNext ? "#3b82f6" : "#2a4070",
            }}
          />
        </div>

        {/* Label */}
        <div>
          <p
            className={`text-sm font-semibold ${
              isActive
                ? "text-[#d4a843]"
                : isNext
                ? "text-[#e8eaf6]"
                : "text-[#4a6890]"
            }`}
          >
            {label}
          </p>
          {isActive && (
            <p className="text-[10px] text-[#3a5070] mt-0.5">
              Waktu sholat sekarang
            </p>
          )}
          {isNext && !isActive && (
            <p className="text-[10px] text-[#2a4870] mt-0.5">Berikutnya</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <p
          className={`text-base font-bold tracking-wide ${
            isActive
              ? "text-[#d4a843]"
              : isNext
              ? "text-[#c8d8f0]"
              : "text-[#2a4070]"
          }`}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {time}
        </p>
        {isActive && (
          <div
            className="w-2 h-2 rounded-full bg-[#d4a843]"
            style={{
              boxShadow: "0 0 8px #d4a843",
              animation: "pulse 2s infinite",
            }}
          />
        )}
      </div>
    </div>
  );
}

function ExtraTimeCard({ label, icon, time, color }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <i className={`fa-solid ${icon} text-sm`} style={{ color }} />
      <div>
        <p className="text-[11px] text-[#2a3858] font-medium">{label}</p>
        <p
          className="text-sm font-bold text-[#4a6890]"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {time || "--:--"}
        </p>
      </div>
    </div>
  );
}

function NoLocation({ onSet }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{
          background: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.2)",
        }}
      >
        <i className="fa-solid fa-location-dot text-3xl text-[#3b82f6]" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-[#e8eaf6] mb-2">
          Lokasi Belum Diset
        </h3>
        <p className="text-sm text-[#3a5070] max-w-xs leading-relaxed">
          Waktu sholat dihitung berdasarkan lokasi. Silakan atur lokasimu
          terlebih dahulu.
        </p>
      </div>
      <button
        onClick={onSet}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer border-none"
        style={{
          background: "linear-gradient(135deg, #1e3a8a, #1e40af)",
          color: "#e8eaf6",
          boxShadow: "0 4px 16px rgba(30,58,138,0.4)",
        }}
      >
        <i className="fa-solid fa-location-crosshairs" />
        Atur Lokasi Sekarang
      </button>
    </div>
  );
}
