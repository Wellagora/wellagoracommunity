import { useState, useEffect } from 'react';

type InteractionMode = 'mouse' | 'touch';

export const useInteractionMode = (): InteractionMode => {
  const [mode, setMode] = useState<InteractionMode>('mouse');

  useEffect(() => {
    // Initial detection based on touch capability
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setMode('touch');
    }

    const handleTouch = () => setMode('touch');
    const handleMouse = (e: MouseEvent) => {
      // Only set to mouse if it seems like a real mouse event
      // Check for movement values that suggest real mouse
      if (e.movementX !== 0 || e.movementY !== 0) {
        setMode('mouse');
      }
    };

    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('mousemove', handleMouse, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return mode;
};
