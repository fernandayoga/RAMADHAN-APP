import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import LocationModal from "../components/LocationModal";
import { getFastingStatus, getCountdown } from "../utils/iftar";

const   DOA_SAHUR = {
  arabic: "نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هَذِهِ السَّنَةِ لِلَّهِ تَعَالَى",
  latin:  "Nawaitu shauma ghadin 'an adaa'i fardhi syahri Ramadhana hadzihis sanati lillahi ta'ala.",
  arti:   "Saya niat berpuasa esok hari untuk menunaikan kewajiban puasa bulan Ramadhan tahun ini karena Allah Ta'ala."
};

const DOA_BUKA = {
  arabic: "اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
  latin:  "Allahumma laka shumtu wa bika aamantu wa 'alaa rizqika afthartu.",
  arti:   "Ya Allah, untuk-Mu aku berpuasa, kepada-Mu aku beriman, dan dengan rezeki-Mu aku berbuka."
};

export default function Iftar() {
  const { location }    = useApp();
  const { prayerTimes, loading } = usePrayerTimes();
  const [now, setNow]   = useState(new Date());
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [activeDoa, setActiveDoa] = useState(null); // "sahur" | "buka"

  // Tick setiap detik
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!location) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto animate-fadeinup">
        <NoLocation onSet={() => setShowLocationModal(true)} />
        {showLocationModal && <LocationModal onClose={() => setShowLocationModal(false)} />}
      </div>
    );
  }

  const fastingStatus = prayerTimes ? getFastingStatus(prayerTimes) : null;
  const imsakTime     = prayerTimes?.Imsak;
  const fajrTime      = prayerTimes?.Fajr;
  const maghribTime   = prayerTimes?.Maghrib;

  // Tentukan target countdown
  const isBukaTime  = fastingStatus?.status === "buka";
  const isImsakTime = fastingStatus?.status === "imsak";

  const countdownTarget = isBukaTime
    ? null
    : isImsakTime
    ? fajrTime
    : fastingStatus?.status === "sahur"
    ? imsakTime
    : maghribTime;

  const countdownLabel = isBukaTime
    ? null
    : isImsakTime
    ? "Menuju Subuh"
    : fastingStatus?.status === "sahur"
    ? "Menuju Imsak"
    : "Menuju Berbuka";

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto flex flex-col gap-6 animate-fadeinup">

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#e8eaf6]">Sahur & Berbuka</h2>
        <p className="text-xs text-[#3a5070] mt-0.5">
          <i className="fa-solid fa-location-dot mr-1 text-[#3b82f6]" />
          {location.city || `${location.lat.toFixed(2)}°, ${location.lng.toFixed(2)}°`}
          {" · "}
          {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Loading */}
      {loading && !prayerTimes && (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      )}

      {prayerTimes && (
        <>
          {/* Status Banner */}
          <StatusBanner status={fastingStatus} now={now} />

          {/* Countdown Card */}
          {countdownTarget && (
            <CountdownCard
              label={countdownLabel}
              targetTime={countdownTarget}
              status={fastingStatus}
            />
          )}

          {/* Waktu Sahur & Berbuka */}
          <div className="grid grid-cols-2 gap-4">
            <TimeCard
              icon="fa-utensils"
              title="Sahur"
              subtitle="Batas Imsak"
              time={imsakTime}
              subtime={fajrTime}
              subLabel="Subuh"
              color="#10b981"
            />
            <TimeCard
              icon="fa-sun"
              title="Berbuka"
              subtitle="Waktu Maghrib"
              time={maghribTime}
              color="#d4a843"
            />
          </div>

          {/* Doa Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: "rgba(212,168,67,0.1)" }} />
              <p className="text-[10px] uppercase tracking-widest text-[#243058] font-semibold">Doa</p>
              <div className="h-px flex-1" style={{ background: "rgba(212,168,67,0.1)" }} />
            </div>

            <DoaCard
              title="Niat Puasa"
              icon="fa-moon"
              color="#6366f1"
              doa={DOA_SAHUR}
              isOpen={activeDoa === "sahur"}
              onToggle={() => setActiveDoa(activeDoa === "sahur" ? null : "sahur")}
            />
            <DoaCard
              title="Doa Berbuka"
              icon="fa-sun"
              color="#d4a843"
              doa={DOA_BUKA}
              isOpen={activeDoa === "buka"}
              onToggle={() => setActiveDoa(activeDoa === "buka" ? null : "buka")}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sub Components ───────────────────────────────────

function StatusBanner({ status, now }) {
  if (!status) return null;

  const icons = {
    sahur:  "fa-bowl-rice",
    imsak:  "fa-triangle-exclamation",
    puasa:  "fa-droplet-slash",
    buka:   "fa-star-and-crescent",
  };

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded-2xl"
      style={{
        background: `linear-gradient(135deg, ${status.color}15, ${status.color}08)`,
        border: `1px solid ${status.color}35`,
        boxShadow: `0 4px 20px ${status.color}10`
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: `${status.color}20` }}
      >
        <i className={`fa-solid ${icons[status.status]}`} style={{ color: status.color }} />
      </div>
      <div className="flex-1">
        <p className="text-base font-bold" style={{ color: status.color }}>{status.label}</p>
        <p className="text-xs text-[#3a5070] mt-0.5">
          {now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
        </p>
      </div>
      {status.status === "puasa" && (
        <div className="text-right ">
          <p className="text-[9px] text-[#2a3858]">Hari ini</p>
          <p className="text-[9px] sm:text-sm font-bold text-[#3b82f6]">Tetap semangat! 💪</p>
        </div>
      )}
    </div>
  );
}

function CountdownCard({ label, targetTime, status }) {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const tick = () => setCountdown(getCountdown(targetTime));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [targetTime]);

  const color = status?.color || "#3b82f6";

  return (
    <div
      className="rounded-2xl px-6 py-6 text-center"
      style={{
        background: "linear-gradient(135deg, #0c1e4a 0%, #0a1535 100%)",
        border: "1px solid rgba(212,168,67,0.15)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
      }}
    >
      <p className="text-[11px] uppercase tracking-widest font-medium mb-3"
        style={{ color: "#3a5070" }}>
        {label}
      </p>
      <p
        className="text-5xl font-bold tracking-widest mb-2"
        style={{ color, fontVariantNumeric: "tabular-nums",
          textShadow: `0 0 30px ${color}40` }}
      >
        {countdown}
      </p>
      <p className="text-xs text-[#2a3858]">jam : menit : detik</p>
    </div>
  );
}

function TimeCard({ icon, title, subtitle, time, subtime, subLabel, color }) {
  return (
    <div
      className="flex flex-col gap-3 px-5 py-5 rounded-2xl"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
        border: `1px solid ${color}25`,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <i className={`fa-solid ${icon} text-sm`} style={{ color }} />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#c8d0e8]">{title}</p>
          <p className="text-[10px] text-[#2a3858]">{subtitle}</p>
        </div>
      </div>
      <p
        className="text-3xl font-bold tracking-wide"
        style={{ color, fontVariantNumeric: "tabular-nums" }}
      >
        {time || "--:--"}
      </p>
      {subtime && (
        <p className="text-[11px] text-[#2a3858]">
          <i className="fa-solid fa-arrow-right mr-1" />
          {subLabel}: {subtime}
        </p>
      )}
    </div>
  );
}



function DoaCard({ title, icon, color, doa, isOpen, onToggle }) {
  const contentRef = useRef(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    if (isOpen) {
      // Set height dari 0 ke scrollHeight
      el.style.height = "0px";
      el.style.opacity = "0";
      requestAnimationFrame(() => {
        el.style.height = `${el.scrollHeight}px`;
        el.style.opacity = "1";
      });
    } else {
      // Set height dari scrollHeight ke 0
      el.style.height = `${el.scrollHeight}px`;
      el.style.opacity = "1";
      requestAnimationFrame(() => {
        el.style.height = "0px";
        el.style.opacity = "0";
      });
    }
  }, [isOpen]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)"
      }}
    >
      {/* Toggle header — tetap sama */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer border-none"
        style={{ background: "transparent" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${color}18` }}
          >
            <i className={`fa-solid ${icon} text-sm`} style={{ color }} />
          </div>
          <p className="text-sm font-semibold text-[#c8d0e8]">{title}</p>
        </div>
        <i
          className="fa-solid fa-chevron-down text-[#2a3858] text-xs"
          style={{
            transition: "transform 0.3s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
          }}
        />
      </button>

      {/* Content — selalu di DOM, tingginya yang dianimasikan */}
      <div
        ref={contentRef}
        style={{
          height: "0px",
          opacity: 0,
          overflow: "hidden",
          transition: "height 0.35s ease, opacity 0.3s ease",
        }}
      >
        <div
          className="px-5 pb-5 flex flex-col gap-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          {/* Arabic */}
          <p
            className="font-arabic text-xl text-right leading-loose pt-4"
            style={{ color: "#d4a843", direction: "rtl" }}
          >
            {doa.arabic}
          </p>

          {/* Latin */}
          <p className="text-sm text-[#6a88a0] italic leading-relaxed">
            {doa.latin}
          </p>

          {/* Arti */}
          <div
            className="px-4 py-3 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)"
            }}
          >
            <p className="text-[11px] text-[#2a3858] uppercase tracking-widest font-medium mb-1">
              Artinya
            </p>
            <p className="text-xs text-[#4a6890] leading-relaxed">{doa.arti}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoLocation({ onSet }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.2)" }}
      >
        <i className="fa-solid fa-location-dot text-3xl text-[#d4a843]" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-[#e8eaf6] mb-2">Lokasi Belum Diset</h3>
        <p className="text-sm text-[#3a5070] max-w-xs leading-relaxed">
          Waktu sahur dan berbuka dihitung berdasarkan lokasi. Silakan atur lokasimu terlebih dahulu.
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