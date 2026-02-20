import { useState, useCallback } from "react";
import { getCurrentPosition, reverseGeocode } from "../utils/location";
import { useApp } from "../context/AppContext";

export const useLocation = () => {
  const { saveLocation } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const detect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { lat, lng } = await getCurrentPosition();
      const { city, country } = await reverseGeocode(lat, lng);
      saveLocation({ lat, lng, city, country, updatedAt: Date.now() });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [saveLocation]);

  const setManual = useCallback((lat, lng, city = null) => {
    saveLocation({ lat, lng, city, country: null, updatedAt: Date.now() });
  }, [saveLocation]);

  return { detect, setManual, loading, error };
};