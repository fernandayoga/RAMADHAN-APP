import { useState, useEffect } from "react";
import { useLocation } from "../hooks/UseLocation";
import { useApp } from "../context/AppContext";

// Kota-kota besar Indonesia sebagai shortcut manual
const POPULAR_CITIES = [
  { name: "Jakarta",    lat: -6.2088,  lng: 106.8456 },
  { name: "Surabaya",   lat: -7.2575,  lng: 112.7521 },
  { name: "Bandung",    lat: -6.9175,  lng: 107.6191 },
  { name: "Medan",      lat:  3.5952,  lng:  98.6722 },
  { name: "Makassar",   lat: -5.1477,  lng: 119.4327 },
  { name: "Semarang",   lat: -6.9932,  lng: 110.4203 },
  { name: "Yogyakarta", lat: -7.7956,  lng: 110.3695 },
  { name: "Palembang",  lat: -2.9761,  lng: 104.7754 },
];

export default function LocationModal({ onClose }) {
  const { location } = useApp();
  const { detect, setManual, loading, error } = useLocation();
  const [tab, setTab] = useState("auto"); // "auto" | "manual"
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = "";
  };
}, []);



  const handleDetect = async () => {
    await detect();
    setSuccess(true);
    setTimeout(onClose, 1200);
  };

  const handleManualSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng)) return;
    setManual(lat, lng, manualCity || null);
    setSuccess(true);
    setTimeout(onClose, 1200);
  };

  const handleCityShortcut = (city) => {
    setManual(city.lat, city.lng, city.name);
    setSuccess(true);
    setTimeout(onClose, 1200);
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4   "
     
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Modal */}
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c1530 0%, #070d1f 100%)",
          border: "1px solid rgba(212,168,67,0.2)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)"
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
              style={{ background: "rgba(59,130,246,0.15)" }}
            >
              <i className="fa-solid fa-location-dot text-[#3b82f6]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#e8eaf6]">Atur Lokasi</h2>
              <p className="text-[11px] text-[#2a3858]">Digunakan untuk waktu sholat & kiblat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#3a5070] hover:text-[#e8eaf6] transition-colors cursor-pointer border-none"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Current location info */}
        {location && (
          <div
            className="mx-6 mt-5 px-4 py-3 rounded-xl flex items-center gap-3"
            style={{ background: "rgba(212,168,67,0.06)", border: "1px solid rgba(212,168,67,0.15)" }}
          >
            <i className="fa-solid fa-circle-check text-[#d4a843] text-sm" />
            <div>
              <p className="text-xs text-[#d4a843] font-medium">Lokasi saat ini</p>
              <p className="text-[11px] text-[#6a88a0]">
                {location.city || `${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°`}
                {location.country ? `, ${location.country}` : ""}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 px-6 mt-5">
          {[
            { id: "auto",   label: "Otomatis", icon: "fa-satellite-dish" },
            { id: "manual", label: "Manual",   icon: "fa-pen" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer border-none"
              style={tab === t.id ? {
                background: "rgba(59,130,246,0.2)",
                color: "#3b82f6",
                border: "1px solid rgba(59,130,246,0.3)"
              } : {
                background: "rgba(255,255,255,0.04)",
                color: "#3a5070",
                border: "1px solid rgba(255,255,255,0.06)"
              }}
            >
              <i className={`fa-solid ${t.icon} text-[10px]`} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-6 py-5">

          {/* ── AUTO TAB ── */}
          {tab === "auto" && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-[#3a5070] leading-relaxed">
                Klik tombol di bawah untuk mendeteksi lokasi secara otomatis menggunakan GPS perangkatmu.
                Browser akan meminta izin akses lokasi.
              </p>

              {error && (
                <div
                  className="flex items-start gap-2 px-4 py-3 rounded-xl text-xs text-[#ef4444]"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <i className="fa-solid fa-triangle-exclamation mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs text-[#10b981]"
                  style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
                >
                  <i className="fa-solid fa-circle-check" />
                  <span>Lokasi berhasil disimpan!</span>
                </div>
              )}

              <button
                onClick={handleDetect}
                disabled={loading || success}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border-none"
                style={{
                  background: loading || success
                    ? "rgba(59,130,246,0.1)"
                    : "linear-gradient(135deg, #1e3a8a, #1e40af)",
                  color: loading || success ? "#3a5070" : "#e8eaf6",
                  boxShadow: loading || success ? "none" : "0 4px 16px rgba(30,58,138,0.4)"
                }}
              >
                <i className={`fa-solid ${loading ? "fa-circle-notch fa-spin" : "fa-satellite-dish"}`} />
                {loading ? "Mendeteksi lokasi..." : success ? "Tersimpan!" : "Deteksi Lokasi Otomatis"}
              </button>
            </div>
          )}

          {/* ── MANUAL TAB ── */}
          {tab === "manual" && (
            <div className="flex flex-col gap-4">

              {/* Shortcut kota */}
              <div>
                <p className="text-[11px] text-[#2a3858] uppercase tracking-widest font-semibold mb-2">
                  Pilih Kota
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {POPULAR_CITIES.map(city => (
                    <button
                      key={city.name}
                      onClick={() => handleCityShortcut(city)}
                      className="py-2 px-1 rounded-xl text-[11px] font-medium text-center transition-all duration-200 cursor-pointer border-none"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        color: "#4a6890",
                        border: "1px solid rgba(255,255,255,0.06)"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(212,168,67,0.1)";
                        e.currentTarget.style.color = "#d4a843";
                        e.currentTarget.style.border = "1px solid rgba(212,168,67,0.25)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        e.currentTarget.style.color = "#4a6890";
                        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)";
                      }}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
                <span className="text-[10px] text-[#2a3858]">atau koordinat manual</span>
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>

              {/* Koordinat input */}
              <div className="flex flex-col gap-3">
                {[
                  { label: "Latitude",  val: manualLat, set: setManualLat, placeholder: "cth: -6.2088" },
                  { label: "Longitude", val: manualLng, set: setManualLng, placeholder: "cth: 106.8456" },
                  { label: "Nama Kota (opsional)", val: manualCity, set: setManualCity, placeholder: "cth: Jakarta" },
                ].map(({ label, val, set, placeholder }) => (
                  <div key={label}>
                    <label className="text-[11px] text-[#2a3858] font-medium mb-1.5 block">{label}</label>
                    <input
                      type="text"
                      value={val}
                      onChange={e => set(e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#e8eaf6",
                        fontFamily: "Poppins, sans-serif"
                      }}
                      onFocus={e => e.target.style.border = "1px solid rgba(59,130,246,0.4)"}
                      onBlur={e => e.target.style.border = "1px solid rgba(255,255,255,0.08)"}
                    />
                  </div>
                ))}
              </div>

              {success && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs text-[#10b981]"
                  style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
                >
                  <i className="fa-solid fa-circle-check" />
                  <span>Lokasi berhasil disimpan!</span>
                </div>
              )}

              <button
                onClick={handleManualSubmit}
                disabled={!manualLat || !manualLng || success}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border-none"
                style={{
                  background: !manualLat || !manualLng || success
                    ? "rgba(255,255,255,0.04)"
                    : "linear-gradient(135deg, #1e3a8a, #1e40af)",
                  color: !manualLat || !manualLng || success ? "#2a3858" : "#e8eaf6",
                  boxShadow: !manualLat || !manualLng || success ? "none" : "0 4px 16px rgba(30,58,138,0.4)"
                }}
              >
                <i className="fa-solid fa-floppy-disk" />
                Simpan Lokasi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}