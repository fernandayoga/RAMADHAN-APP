import { timeToMinutes } from "./prayer";

// Hitung status puasa saat ini
export const getFastingStatus = (timings) => {
  if (!timings) return null;

  const now     = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const imsakMins   = timeToMinutes(timings.Imsak);
  const fajrMins    = timeToMinutes(timings.Fajr);
  const maghribMins = timeToMinutes(timings.Maghrib);
  const ishaMins    = timeToMinutes(timings.Isha);

  if (nowMins >= maghribMins) {
    return { status: "buka",   label: "Waktu Berbuka!",     color: "#d4a843" };
  } else if (nowMins >= fajrMins) {
    return { status: "puasa",  label: "Sedang Berpuasa",    color: "#3b82f6" };
  } else if (nowMins >= imsakMins) {
    return { status: "imsak",  label: "Waktu Imsak!",       color: "#ef4444" };
  } else if (nowMins >= 0) {
    return { status: "sahur",  label: "Waktu Sahur",        color: "#10b981" };
  }

  return { status: "puasa", label: "Sedang Berpuasa", color: "#3b82f6" };
};

// Hitung countdown ke waktu target
export const getCountdown = (targetTimeStr, allowNextDay = true) => {
  if (!targetTimeStr) return "--:--:--";

  const [h, m]  = targetTimeStr.split(":").map(Number);
  const target  = new Date();
  target.setHours(h, m, 0, 0);

  const now = new Date();
  if (target <= now && allowNextDay) {
    target.setDate(target.getDate() + 1);
  }

  const diff  = target - now;
  if (diff <= 0) return "00:00:00";

  const hours = Math.floor(diff / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  const secs  = Math.floor((diff % 60000) / 1000);

  return `${String(hours).padStart(2,"0")}:${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
};