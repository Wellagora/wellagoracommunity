import { useState, useEffect } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

export const useGyroscope = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  
  const tiltX = useSpring(rawX, { stiffness: 100, damping: 20 });
  const tiltY = useSpring(rawY, { stiffness: 100, damping: 20 });

  const requestPermission = async () => {
    if (typeof window === 'undefined') return false;
    
    // Request permission on iOS 13+
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const state = await (DeviceOrientationEvent as any).requestPermission();
        if (state === 'granted') {
          setPermissionGranted(true);
          return true;
        }
      } catch {
        return false;
      }
    } else {
      // Non-iOS or older iOS - permission not needed
      setPermissionGranted(true);
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        setIsSupported(true);
        // Clamp values for subtle effect
        rawX.set(Math.max(-15, Math.min(15, (e.beta || 0) / 3)));
        rawY.set(Math.max(-15, Math.min(15, (e.gamma || 0) / 3)));
      }
    };

    // Check if already granted or not needed
    if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
      setPermissionGranted(true);
    }

    if (permissionGranted) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permissionGranted, rawX, rawY]);

  return { tiltX, tiltY, isSupported, permissionGranted, requestPermission };
};
