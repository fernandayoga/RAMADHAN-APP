import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { SURAH_LIST, fetchSurah, isSurahCached, getCachedSurahNumbers } from "../utils/quran";

export default function Quran() {
  const { quranBookmark, setQuranBookmark } = useApp();
  const [view, setView]         = useState("list");   // "list" | "read"
  const [activeSurah, setActiveSurah] = useState(null);
  const [surahData, setSurahData]     = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState("");
  const [showTranslation, setShowTranslation] = useState(true);
  const [cachedNumbers, setCachedNumbers] = useState([]);

  // 2. Load cached numbers saat pertama render
useEffect(() => {
  getCachedSurahNumbers().then(setCachedNumbers);
}, []);

  const openSurah = async (surah) => {
  setView("read");
  setActiveSurah(surah);
  setSurahData(null);
  setLoading(true);
  setError(null);
  try {
    const { data } = await fetchSurah(surah.number);
    setSurahData(data);
    // Update cache indicator
    getCachedSurahNumbers().then(setCachedNumbers);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const saveBookmark = (surahNum, ayahNum) => {
    setQuranBookmark({ surah: surahNum, ayah: ayahNum });
  };

  const filteredSurah = SURAH_LIST.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.nameAr.includes(search) ||
    String(s.number).includes(search)
  );

  if (view === "read" && activeSurah) {
    return (
      <ReadView
        surah={activeSurah}
        surahData={surahData}
        loading={loading}
        error={error}
        bookmark={quranBookmark}
        showTranslation={showTranslation}
        onToggleTranslation={() => setShowTranslation(v => !v)}
        onBack={() => setView("list")}
        onBookmark={saveBookmark}
      />
    );
  }

  return (
    <ListView
      surahList={filteredSurah}
      search={search}
      onSearch={setSearch}
      bookmark={quranBookmark}
      onOpenSurah={openSurah}
      cachedNumbers={cachedNumbers}  
    />
  );
}

// ─── List View ────────────────────────────────────────

function ListView({ surahList, search, onSearch, bookmark, onOpenSurah, cachedNumbers }) {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto flex flex-col gap-5 animate-fadeinup">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#e8eaf6]">Al-Qur'an</h2>
          <p className="text-xs text-[#3a5070] mt-0.5">114 Surah · Terjemahan Indonesia</p>
        </div>
        
      </div>

      {/* Bookmark banner */}
      {bookmark && (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer"
          style={{
            background: "rgba(212,168,67,0.08)",
            border: "1px solid rgba(212,168,67,0.2)"
          }}
          onClick={() => {
            const s = SURAH_LIST.find(x => x.number === bookmark.surah);
            if (s) onOpenSurah(s);
          }}
        >
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-bookmark text-[#d4a843]" />
            <div>
              <p className="text-xs font-semibold text-[#d4a843]">Lanjut membaca</p>
              <p className="text-[11px] text-[#6a7890]">
                {SURAH_LIST.find(s => s.number === bookmark.surah)?.name} · Ayat {bookmark.ayah}
              </p>
            </div>
          </div>
          <i className="fa-solid fa-arrow-right text-[#d4a843] text-xs" />
        </div>
      )}

      {/* Search */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)"
        }}
      >
        <i className="fa-solid fa-magnifying-glass text-[#2a4070] text-sm" />
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Cari surah..."
          className="flex-1 bg-transparent outline-none text-sm text-[#e8eaf6] placeholder-[#2a4070]"
          style={{ fontFamily: "Poppins, sans-serif" }}
        />
        {search && (
          <button
            onClick={() => onSearch("")}
            className="text-[#2a4070] hover:text-[#e8eaf6] transition-colors cursor-pointer border-none bg-transparent"
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        )}
      </div>

      {/* Surah grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {surahList.map(surah => (
          <SurahCard
            key={surah.number}
            surah={surah}
            isBookmarked={bookmark?.surah === surah.number}
            isCached={cachedNumbers.includes(surah.number)}
            onClick={() => onOpenSurah(surah)}
          />
        ))}
      </div>

      {surahList.length === 0 && (
        <div className="text-center py-12 text-[#2a3858]">
          <i className="fa-solid fa-magnifying-glass text-3xl mb-3 block" />
          <p className="text-sm">Surah tidak ditemukan</p>
        </div>
      )}
    </div>
  );
}

function SurahCard({ surah, isBookmarked, isCached, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left w-full cursor-pointer border-none transition-all duration-200"
      style={{
        background: isBookmarked
          ? "rgba(212,168,67,0.08)"
          : "rgba(255,255,255,0.02)",
        border: isBookmarked
          ? "1px solid rgba(212,168,67,0.2)"
          : "1px solid rgba(255,255,255,0.05)"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        e.currentTarget.style.transform = "translateX(4px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = isBookmarked
          ? "rgba(212,168,67,0.08)" : "rgba(255,255,255,0.02)";
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      {/* Nomor */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          background: "rgba(30,58,122,0.4)",
          color: "#4a7ab0"
        }}
      >
        {surah.number}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[#c8d0e8] truncate">{surah.name}</p>
          {isBookmarked && <i className="fa-solid fa-bookmark text-[#d4a843] text-[10px]" />}
          {isCached && <i className="fa-solid fa-circle-check text-[#10b981] text-[10px]" />}
        </div>
        <p className="text-[11px] text-[#2a3858]">
          {surah.ayahs} ayat · {surah.revelation}
        </p>
      </div>

      {/* Nama Arab */}
      <p className="font-arabic text-lg text-[#d4a843] flex-shrink-0">{surah.nameAr}</p>
    </button>
  );
}

// ─── Read View ────────────────────────────────────────

function ReadView({ surah, surahData, loading, error, bookmark, showTranslation, onToggleTranslation, onBack, onBookmark }) {
  const bookmarkRef = useRef(null);

  // Scroll ke ayat bookmark saat data tersedia
  useEffect(() => {
    if (surahData && bookmark?.surah === surah.number && bookmarkRef.current) {
      setTimeout(() => {
        bookmarkRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [surahData]);

  useEffect(() => {
  // Ambil elemen main
  const main = document.querySelector("main");
  if (main) {
    main.style.overflow = "hidden";
    main.style.height = "100dvh";
  }
  document.body.style.overflow = "hidden";

  return () => {
    // Kembalikan saat keluar ReadView
    if (main) {
      main.style.overflow = "";
      main.style.height = "";
    }
    document.body.style.overflow = "";
  };
}, []);

  return (
    <div className="flex flex-col h-screen max-h-screen fixed inset-0 lg:left-64">

      {/* Sticky header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b mt-10 lg:mt-0 "
        style={{
          background: "rgba(7,13,31,0.95)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(212,168,67,0.12)"
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.05)" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            <i className="fa-solid fa-arrow-left text-[#4a6890] text-sm" />
          </button>
          <div>
            <p className="text-sm font-bold text-[#e8eaf6]">{surah.name}</p>
            <p className="text-[11px] text-[#2a3858]">{surah.ayahs} ayat · {surah.revelation}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle terjemahan */}
          <button
            onClick={onToggleTranslation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs cursor-pointer border-none transition-all duration-200"
            style={showTranslation ? {
              background: "rgba(59,130,246,0.15)",
              color: "#3b82f6",
              border: "1px solid rgba(59,130,246,0.25)"
            } : {
              background: "rgba(255,255,255,0.05)",
              color: "#3a5070",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <i className="fa-solid fa-language text-[10px]" />
            Terjemahan
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-2xl mx-auto px-6 py-6 flex flex-col gap-1">

          {/* Bismillah (kecuali At-Taubah) */}
          {surah.number !== 9 && (
            <div className="text-center py-6 mb-2">
              <p className="font-arabic text-2xl text-[#d4a843] leading-loose">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col gap-4 py-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="h-8 rounded-lg animate-pulse w-3/4 ml-auto"
                    style={{ background: "rgba(255,255,255,0.04)" }} />
                  <div className="h-4 rounded animate-pulse"
                    style={{ background: "rgba(255,255,255,0.03)" }} />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-2xl text-sm my-4"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)"
              }}
            >
              <i className="fa-solid fa-triangle-exclamation text-[#ef4444] mt-0.5" />
              <div>
                <p className="text-[#ef4444] font-medium text-xs">Gagal memuat surah</p>
                <p className="text-[#6a3030] text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Ayat */}
          {surahData?.ayahs?.map(ayah => {
            const isBookmarked =
              bookmark?.surah === surah.number && bookmark?.ayah === ayah.number;

            return (
              <AyahCard
                key={ayah.number}
                ayah={ayah}
                surahNumber={surah.number}
                isBookmarked={isBookmarked}
                showTranslation={showTranslation}
                onBookmark={onBookmark}
                ref={isBookmarked ? bookmarkRef : null}
              />
            );
          })}

          <div className="h-10" />
        </div>
      </div>
    </div>
  );
}

// ─── Ayah Card ────────────────────────────────────────

import { forwardRef } from "react";

const AyahCard = forwardRef(function AyahCard(
  { ayah, surahNumber, isBookmarked, showTranslation, onBookmark },
  ref
) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      className="flex flex-col gap-3 px-5 py-5 rounded-2xl transition-all duration-200"
      style={{
        background: isBookmarked
          ? "rgba(212,168,67,0.06)"
          : hovered ? "rgba(255,255,255,0.03)" : "transparent",
        border: isBookmarked
          ? "1px solid rgba(212,168,67,0.2)"
          : "1px solid transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Nomor ayat + bookmark */}
      <div className="flex items-center justify-between">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
          style={{ background: "rgba(30,58,122,0.3)", color: "#4a6890" }}
        >
          {ayah.number}
        </div>
        <button
          onClick={() => onBookmark(surahNumber, ayah.number)}
          className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer border-none transition-all duration-200"
          style={{
            background: isBookmarked ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.04)",
            color: isBookmarked ? "#d4a843" : "#2a3858"
          }}
          title="Simpan bookmark"
        >
          <i className={`fa-${isBookmarked ? "solid" : "regular"} fa-bookmark text-[11px]`} />
        </button>
      </div>

      {/* Teks Arab */}
      <p
        className="font-arabic text-2xl leading-loose text-right"
        style={{ color: "#e8d5a0", direction: "rtl", lineHeight: "2.2" }}
      >
        {ayah.arabic}
      </p>

      {/* Terjemahan */}
      {showTranslation && (
        <p className="text-sm text-[#4a6890] leading-relaxed border-t pt-3"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {ayah.translation}
        </p>
      )}
    </div>
  );
});