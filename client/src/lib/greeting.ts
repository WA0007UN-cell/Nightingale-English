/**
 * Returns a calm entry greeting using the browser-local hour.
 * This is presentation-only: it does not persist time or access care data.
 */
export function getTimeAwareGreeting(hour: number): "Good morning" | "Good afternoon" | "Good evening" {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
