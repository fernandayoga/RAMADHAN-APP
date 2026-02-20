import { useState, useEffect, useCallback } from "react";
import { fetchPrayerTimes, getSavedMethod, saveMethod } from "../utils/prayer";
import { useApp } from "../context/AppContext";

export const usePrayerTimes = () => {
  const { location, prayerTimes, setPrayerTimes } = useApp();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [method, setMethodState] = useState(getSavedMethod);
  const [fromCache, setFromCache] = useState(false);

  const load = useCallback(async (forceMethod = null) => {
    if (!location) return;
    setLoading(true);
    setError(null);
    try {
      const m = forceMethod ?? method;
      const { data, fromCache: cached } = await fetchPrayerTimes(location.lat, location.lng, m);
      setPrayerTimes(data);
      setFromCache(cached);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [location, method, setPrayerTimes]);

  // Auto load saat lokasi berubah atau pertama kali
  useEffect(() => { load(); }, [load]);

  const changeMethod = (id) => {
    saveMethod(id);
    setMethodState(id);
    // Hapus cache agar fetch ulang dengan metode baru
    try { localStorage.removeItem("prayer_times_cache"); } catch {}
    load(id);
  };

  return { prayerTimes, loading, error, method, changeMethod, reload: load, fromCache };
};