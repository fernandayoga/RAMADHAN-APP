import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useQibla } from "../hooks/useQibla";
import { calcQiblaDirection, calcDistanceToKabah, formatDistance } from "../utils/qibla";
import LocationModal from "../components/LocationModal";

export default function Qibla() {
  const { location }               = useApp();
  const [showLocationModal, setShowLocationModal] = useState(false);

  if (!location) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto animate-fadeinup">
        <NoLocation onSet={() => setShowLocationModal(true)} />
        {showLocationModal && <LocationModal onClose={() => setShowLocationModal(false)} />}
      </div>
    );
  }

  const qiblaDir = calcQiblaDirection(location.lat, location.lng);
  const distance = calcDistanceToKabah(location.lat, location.lng);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto flex flex-col gap-6 animate-fadeinup">

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#e8eaf6]">Arah Kiblat</h2>
        <p className="text-xs text-[#3a5070] mt-0.5">
          <i className="fa-solid fa-location-dot mr-1 text-[#3b82f6]" />
          {location.city || `${location.lat.toFixed(2)}°, ${location.lng.toFixed(2)}°`}
        </p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-4">
        <InfoCard
          icon="fa-compass"
          label="Arah Kiblat"
          value={`${Math.round(qiblaDir)}°`}
          sub="dari Utara"
          color="#d4a843"
        />
        <InfoCard
          icon="fa-route"
          label="Jarak ke Ka'bah"
          value={formatDistance(distance)}
          sub="Makkah Al-Mukarramah"
          color="#3b82f6"
        />
      </div>

      {/* Kompas */}
      <CompassCard qiblaDir={qiblaDir} />

      {/* Manual fallback */}
      <ManualGuide qiblaDir={qiblaDir} location={location} />

    </div>
  );
}

// ─── Kompas ───────────────────────────────────────────

function CompassCard({ qiblaDir }) {
  const { heading, needleRotation, supported, permission, error, requestSensor } =
    useQibla(qiblaDir);

  const isAligned =
    needleRotation !== null &&
    (needleRotation < 5 || needleRotation > 355);

  return (
    <div
      className="flex flex-col items-center gap-6 px-6 py-8 rounded-3xl"
      style={{
        background: "linear-gradient(135deg, #0c1e4a 0%, #0a1535 100%)",
        border: `1px solid ${isAligned ? "rgba(16,185,129,0.4)" : "rgba(212,168,67,0.15)"}`,
        boxShadow: isAligned
          ? "0 8px 32px rgba(16,185,129,0.15)"
          : "0 8px 32px rgba(0,0,0,0.3)",
        transition: "all 0.5s ease"
      }}
    >
      {/* Status */}
      {isAligned && (
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
          style={{
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.3)",
            color: "#10b981"
          }}
        >
          <i className="fa-solid fa-circle-check" />
          Menghadap Kiblat!
        </div>
      )}

      {/* Kompas lingkaran */}
      <div className="relative flex items-center justify-center">
        {/* Ring luar */}
        <div
          className="w-64 h-64 rounded-full flex items-center justify-center relative"
          style={{
            background: "radial-gradient(circle, #0f1e40 0%, #070d1f 100%)",
            border: "2px solid rgba(212,168,67,0.2)",
            boxShadow: "0 0 40px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.3)"
          }}
        >
          {/* Tick marks */}
          {[...Array(36)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{ transform: `rotate(${i * 10}deg)`, width: "100%", height: "100%", top: 0, left: 0 }}
            >
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  top: 4,
                  width: i % 9 === 0 ? 2 : 1,
                  height: i % 9 === 0 ? 12 : 6,
                  background: i % 9 === 0
                    ? "rgba(212,168,67,0.6)"
                    : "rgba(255,255,255,0.1)"
                }}
              />
            </div>
          ))}

          {/* Arah mata angin */}
          {[
            { label: "U", deg: 0   },
            { label: "T", deg: 90  },
            { label: "S", deg: 180 },
            { label: "B", deg: 270 },
          ].map(({ label, deg }) => (
            <span
              key={label}
              className="absolute text-[11px] font-bold"
              style={{
                color: label === "U" ? "#ef4444" : "rgba(212,168,67,0.5)",
                transform: `rotate(${deg}deg) translateY(-88px) rotate(-${deg}deg)`,
              }}
            >
              {label}
            </span>
          ))}

          {/* Jarum kompas — merah ke Utara */}
          <div
            className="absolute w-full h-full"
            style={{
              transform: heading !== null ? `rotate(${-heading}deg)` : "rotate(0deg)",
              transition: "transform 0.3s ease"
            }}
          >
            {/* Jarum atas (merah = Utara) */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                bottom: "50%",
                width: 4,
                height: 80,
                borderRadius: "4px 4px 0 0",
                background: "linear-gradient(to top, #6a3030, #ef4444)",
                transformOrigin: "bottom center",
                boxShadow: "0 0 8px rgba(239,68,68,0.5)"
              }}
            />
            {/* Jarum bawah (putih = Selatan) */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: "50%",
                width: 4,
                height: 60,
                borderRadius: "0 0 4px 4px",
                background: "linear-gradient(to bottom, #888, #444)",
                transformOrigin: "top center"
              }}
            />
          </div>

          {/* Jarum Kiblat — emas */}
          {needleRotation !== null && (
            <div
              className="absolute w-full h-full"
              style={{
                transform: `rotate(${needleRotation}deg)`,
                transition: "transform 0.4s ease"
              }}
            >
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: "50%",
                  width: 3,
                  height: 90,
                  borderRadius: "4px 4px 0 0",
                  background: "linear-gradient(to top, #8a6820, #f0c96a)",
                  transformOrigin: "bottom center",
                  boxShadow: "0 0 10px rgba(212,168,67,0.6)"
                }}
              />
              {/* Ka'bah icon di ujung jarum */}
              <div
                className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center text-[10px]"
                style={{ bottom: "calc(50% + 90px)" }}
              >
                🕋
              </div>
            </div>
          )}

          {/* Titik tengah */}
          <div
            className="w-4 h-4 rounded-full z-10"
            style={{
              background: "radial-gradient(circle, #f0c96a, #d4a843)",
              boxShadow: "0 0 10px rgba(212,168,67,0.6)"
            }}
          />
        </div>
      </div>

      {/* Info heading */}
      <div className="flex items-center gap-8 text-center">
        <div>
          <p className="text-[11px] text-[#2a3858] uppercase tracking-widest mb-1">Kiblat</p>
          <p className="text-lg font-bold text-[#d4a843]">{Math.round(qiblaDir)}°</p>
        </div>
        <div
          className="h-8 w-px"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
        <div>
          <p className="text-[11px] text-[#2a3858] uppercase tracking-widest mb-1">Kompas</p>
          <p className="text-lg font-bold text-[#e8eaf6]">
            {heading !== null ? `${Math.round(heading)}°` : "—"}
          </p>
        </div>
        <div
          className="h-8 w-px"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
        <div>
          <p className="text-[11px] text-[#2a3858] uppercase tracking-widest mb-1">Sensor</p>
          <p className={`text-sm font-bold ${heading !== null ? "text-[#10b981]" : "text-[#3a5070]"}`}>
            {heading !== null ? "Aktif" : "—"}
          </p>
        </div>
      </div>

      {/* Error / permission */}
      {error && (
        <div
          className="w-full flex items-start gap-2 px-4 py-3 rounded-xl text-xs"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#ef4444"
          }}
        >
          <i className="fa-solid fa-triangle-exclamation mt-0.5" />
          {error}
        </div>
      )}

      {/* iOS permission button */}
      {permission === "unknown" &&
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function" && (
        <button
          onClick={requestSensor}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-none"
          style={{
            background: "linear-gradient(135deg, #1e3a8a, #1e40af)",
            color: "#e8eaf6"
          }}
        >
          <i className="fa-solid fa-compass" />
          Aktifkan Sensor Kompas
        </button>
      )}

      {!supported && (
        <p className="text-xs text-[#3a5070] text-center">
          <i className="fa-solid fa-circle-info mr-1" />
          Gunakan panduan manual di bawah sebagai alternatif.
        </p>
      )}
    </div>
  );
}

// ─── Manual Guide ─────────────────────────────────────

function ManualGuide({ qiblaDir, location }) {
  const getCardinalDirection = (deg) => {
    const dirs = ["Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"];
    return dirs[Math.round(deg / 45) % 8];
  };

  return (
    <div
      className="rounded-2xl px-5 py-5"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)"
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <i className="fa-solid fa-map text-[#3b82f6] text-sm" />
        <p className="text-sm font-semibold text-[#c8d0e8]">Panduan Manual</p>
      </div>
      <div className="flex flex-col gap-3 text-sm text-[#4a6890] leading-relaxed">
        <p>
          <i className="fa-solid fa-circle-1 mr-2 text-[#d4a843]" />
          Hadapkan dirimu ke arah <span className="text-[#e8eaf6] font-semibold">{getCardinalDirection(qiblaDir)}</span>
        </p>
        <p>
          <i className="fa-solid fa-circle-2 mr-2 text-[#d4a843]" />
          Putar <span className="text-[#e8eaf6] font-semibold">{Math.round(qiblaDir)}° dari Utara</span> searah jarum jam
        </p>
        <p>
          <i className="fa-solid fa-circle-3 mr-2 text-[#d4a843]" />
          Dari <span className="text-[#e8eaf6] font-semibold">
            {location.city || "lokasimu"}
          </span>, Ka'bah berada di arah tersebut
        </p>
      </div>
    </div>
  );
}

// ─── Info Card ────────────────────────────────────────

function InfoCard({ icon, label, value, sub, color }) {
  return (
    <div
      className="flex flex-col gap-3 px-5 py-4 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${color}20`
      }}
    >
      <div className="flex items-center gap-2">
        <i className={`fa-solid ${icon} text-sm`} style={{ color }} />
        <p className="text-[11px] text-[#2a3858] font-medium">{label}</p>
      </div>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-[11px] text-[#2a3858]">{sub}</p>
    </div>
  );
}

// ─── No Location ──────────────────────────────────────

function NoLocation({ onSet }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
      >
        <i className="fa-solid fa-compass text-3xl text-[#10b981]" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-[#e8eaf6] mb-2">Lokasi Belum Diset</h3>
        <p className="text-sm text-[#3a5070] max-w-xs leading-relaxed">
          Arah kiblat dihitung berdasarkan lokasimu. Silakan atur lokasi terlebih dahulu.
        </p>
      </div>
      <button
        onClick={onSet}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer border-none"
        style={{
          background: "linear-gradient(135deg, #1e3a8a, #1e40af)",
          color: "#e8eaf6",
          boxShadow: "0 4px 16px rgba(30,58,138,0.4)"
        }}
      >
        <i className="fa-solid fa-location-crosshairs" />
        Atur Lokasi Sekarang
      </button>
    </div>
  );
}