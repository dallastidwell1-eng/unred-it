// Short labels for the meta line. Pure functions.

/** "now", "5m", "3h", "2d", "4mo", "1y" from a UTC time in seconds. */
export function formatAge(createdUtc: number, nowMs: number = Date.now()): string {
  const seconds = Math.max(0, Math.floor(nowMs / 1000 - createdUtc));
  if (seconds < 60) {
    return 'now';
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${String(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${String(hours)}h`;
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${String(days)}d`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${String(months)}mo`;
  }
  return `${String(Math.floor(days / 365))}y`;
}

/** 999, 1k, 1.2k, 16.4k, 312k, 1.5m. */
export function formatCount(value: number): string {
  const n = Math.round(value);
  const abs = Math.abs(n);
  if (abs < 1000) {
    return String(n);
  }
  const [divisor, unit] = abs < 1_000_000 ? [1000, 'k'] : [1_000_000, 'm'];
  const scaled = n / divisor;
  const text = Math.abs(scaled) < 100 ? scaled.toFixed(1) : scaled.toFixed(0);
  return `${text.replace(/\.0$/, '')}${unit}`;
}
