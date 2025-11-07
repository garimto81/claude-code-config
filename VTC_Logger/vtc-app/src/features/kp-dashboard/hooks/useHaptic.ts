import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Hook for haptic feedback (vibration) on mobile devices
 * Provides tactile feedback for user interactions
 */
export function useHaptic() {
  const vibrate = useCallback((type: HapticType = 'medium') => {
    // Check if Vibration API is supported
    if (!('vibrate' in navigator)) {
      return;
    }

    // Map haptic types to vibration patterns
    const patterns: Record<HapticType, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 50, 10], // Double tap
      warning: [20, 100, 20], // Stronger double tap
      error: [30, 50, 30, 50, 30], // Triple tap
    };

    const pattern = patterns[type];

    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, []);

  return { vibrate };
}
