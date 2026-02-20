import { useState, useEffect, useCallback } from "react";

export const useQibla = (qiblaDirection) => {
  const [heading, setHeading]         = useState(null); // arah device (kompas)
  const [supported, setSupported]     = useState(true);
  const [permission, setPermission]   = useState("unknown"); // "unknown"|"granted"|"denied"
  const [error, setError]             = useState(null);

  const handleOrientation = useCallback((e) => {
    // alpha = rotasi Z (kompas heading)
    if (e.alpha !== null && e.alpha !== undefined) {
      setHeading(e.alpha);
    }
  }, []);

  const requestSensor = useCallback(async () => {
    setError(null);

    // iOS 13+ butuh requestPermission
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        const result = await DeviceOrientationEvent.requestPermission();
        if (result === "granted") {
          setPermission("granted");
          window.addEventListener("deviceorientation", handleOrientation, true);
        } else {
          setPermission("denied");
          setError("Izin sensor kompas ditolak.");
        }
      } catch {
        setPermission("denied");
        setError("Gagal meminta izin sensor kompas.");
      }
      return;
    }

    // Android / Desktop — langsung listen
    if ("DeviceOrientationEvent" in window) {
      setPermission("granted");
      window.addEventListener("deviceorientation", handleOrientation, true);
    } else {
      setSupported(false);
      setError("Sensor kompas tidak tersedia di perangkat ini.");
    }
  }, [handleOrientation]);

  useEffect(() => {
    // Auto-start untuk non-iOS
    if (
      "DeviceOrientationEvent" in window &&
      typeof DeviceOrientationEvent.requestPermission !== "function"
    ) {
      window.addEventListener("deviceorientation", handleOrientation, true);
      setPermission("granted");
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, [handleOrientation]);

  // Hitung rotasi jarum kiblat
  // needle harus menunjuk ke arah qibla relatif terhadap heading device
  const needleRotation =
    heading !== null && qiblaDirection !== null
      ? (qiblaDirection - heading + 360) % 360
      : null;

  return { heading, needleRotation, supported, permission, error, requestSensor };
};