/**
 * PUBLIC_INTERFACE
 * formatTime converts seconds to mm:ss format with zero padding.
 */
export function formatTime(totalSeconds) {
  /** Formats a time value in seconds into mm:ss string. */
  if (totalSeconds == null || Number.isNaN(totalSeconds) || !Number.isFinite(totalSeconds)) {
    return "0:00";
  }
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
