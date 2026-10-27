"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface DeviceOrientationState {
  supported: boolean;
  active: boolean;
  permissionGranted: boolean;
  alpha: number; // yaw 0 - 360
  beta: number;  // pitch -180 - 180
  gamma: number; // roll -90 - 90
}

export function useDeviceOrientation() {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const orientationRef = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const initialOffsetRef = useRef<{ alpha: number; beta: number } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      setSupported(true);
    }
  }, []);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (event.alpha === null || event.beta === null) return;

    const alpha = event.alpha; // 0 - 360
    const beta = event.beta;   // -180 - 180
    const gamma = event.gamma || 0;

    if (!initialOffsetRef.current) {
      initialOffsetRef.current = { alpha, beta };
    }

    // Relative to initial tilt
    orientationRef.current = {
      alpha,
      beta,
      gamma,
    };
  }, []);

  const enableGyro = async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    // Check iOS 13+ permission API
    const DeviceOrientation = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    if (typeof DeviceOrientation?.requestPermission === "function") {
      try {
        const response = await DeviceOrientation.requestPermission();
        if (response === "granted") {
          setPermissionGranted(true);
          setActive(true);
          initialOffsetRef.current = null;
          window.addEventListener("deviceorientation", handleOrientation);
          return true;
        } else {
          alert("Quyền truy cập cảm biến nghiêng bị từ chối.");
          return false;
        }
      } catch (err) {
        console.error("Error requesting gyro permission:", err);
        return false;
      }
    } else {
      // Android / standard desktop test
      setPermissionGranted(true);
      setActive(true);
      initialOffsetRef.current = null;
      window.addEventListener("deviceorientation", handleOrientation);
      return true;
    }
  };

  const disableGyro = () => {
    setActive(false);
    if (typeof window !== "undefined") {
      window.removeEventListener("deviceorientation", handleOrientation);
    }
    initialOffsetRef.current = null;
  };

  const toggleGyro = async () => {
    if (active) {
      disableGyro();
      return false;
    } else {
      return await enableGyro();
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
    };
  }, [handleOrientation]);

  return {
    supported,
    active,
    permissionGranted,
    toggleGyro,
    enableGyro,
    disableGyro,
    orientationRef,
  };
}
