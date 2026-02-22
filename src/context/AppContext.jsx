import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { storage } from "../utils/storage";

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
 
  return ctx;
};



// const getHijriDate = () => {
//   try {
//     return new Intl.DateTimeFormat("id-ID-u-ca-islamic", {
//       day: "numeric", month: "long", year: "numeric",
//     }).format(new Date());
//   } catch {
//     return "Ramadhan 1446 H";
//   }
// };



export const AppProvider = ({ children }) => {
  const [activePage, setActivePage]       = useState("home");
  const [location, setLocation]           = useState(() => storage.get("user_location"));
  
  
  const [prayerTimes, setPrayerTimes]     = useState(() => storage.get("prayer_times_cache"));
  const [fastingLog, setFastingLog]       = useState(() => storage.get("fasting_log", {}));
  const [trackerLog, setTrackerLog]       = useState(() => storage.get("tracker_log", {}));
  const [quranBookmark, setQuranBookmark] = useState(() => storage.get("quran_bookmark", { surah: 1, ayah: 1 }));
  const [hijriDate, setHijriDate] = useState('Loading...');

useEffect(() => {
  fetchHijriDate();
}, []);

const fetchHijriDate = async () => {
  try {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    
    const response = await fetch(
      `https://api.aladhan.com/v1/gToH/${day}-${month}-${year}`
    );
    
    const data = await response.json();
    
    console.log(data.data.hijri);
    
    if (data.code === 200) {
      const hijri = data.data.hijri;
      setHijriDate(`${hijri.day} ${hijri.month.en} ${hijri.year} H`);
    } else {
      setHijriDate('5 Ramadan 1447 H');
    }
  } catch (error) {
    console.error('Hijri API error:', error);
    setHijriDate('5 Ramadan 1447 H');
  }
};

  useEffect(() => { storage.set("fasting_log", fastingLog); }, [fastingLog]);
  useEffect(() => { storage.set("tracker_log", trackerLog); }, [trackerLog]);
  useEffect(() => { storage.set("quran_bookmark", quranBookmark); }, [quranBookmark]);

  const saveLocation = useCallback((loc) => {
    setLocation(loc);
    storage.set("user_location", loc);
  }, []);

  return (
    <AppContext.Provider value={{
      activePage, setActivePage,
      location, saveLocation,
      hijriDate,
      prayerTimes, setPrayerTimes,
      fastingLog, setFastingLog,
      trackerLog, setTrackerLog,
      quranBookmark, setQuranBookmark,
    }}>
      {children}
    </AppContext.Provider>
  );
};