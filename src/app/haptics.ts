/**
 * Vibration API wrapper — haptic feedback for mobile devices.
 */

export function vibrate(pattern: number | number[]): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}
