import { useEffect, useState } from 'react';

export type Orientation = {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  isFaceDown: boolean;
};

export const useOrientation = () => {
  const [orientation, setOrientation] = useState<Orientation>({
    alpha: null,
    beta: null,
    gamma: null,
    isFaceDown: false,
  });

  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const requestPermission = async () => {
    // @ts-ignore - DeviceOrientationEvent.requestPermission is iOS specific
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        // @ts-ignore
        const response = await DeviceOrientationEvent.requestPermission();
        setPermissionGranted(response === 'granted');
        return response === 'granted';
      } catch (error) {
        console.error('Permission request failed', error);
        setPermissionGranted(false);
        return false;
      }
    } else {
      // Non-iOS or older browsers
      setPermissionGranted(true);
      return true;
    }
  };

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { alpha, beta, gamma } = event;
      
      // isFaceDown logic:
      // Beta is front-to-back tilt. 0 is flat on back, 180 or -180 is flat on face.
      // Gamma is left-to-right tilt.
      // Usually, face down is when beta is near 180 or -180.
      // However, different browsers/OS might report differently.
      // A common way: if beta is > 150 or < -150, it's roughly face down.
      const isFaceDown = beta !== null && (Math.abs(beta) > 160);

      setOrientation({ alpha, beta, gamma, isFaceDown });
    };

    if (permissionGranted) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permissionGranted]);

  return { orientation, requestPermission, permissionGranted };
};
