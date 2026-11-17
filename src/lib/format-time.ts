/**
 * Formats an ISO timestamp into crisp, authentic 2008-modern relative time
 * matching the reference screenshot ("now", "2m", "3m", "17m", "2h", "3d").
 */
export function formatRelativeTime(
  isoDateString: string,
  nowMs: number = Date.now()
): string {
  const timestamp = new Date(isoDateString).getTime();
  if (Number.isNaN(timestamp)) {
    return "now";
  }

  const diffSeconds = Math.max(0, Math.floor((nowMs - timestamp) / 1000));

  if (diffSeconds < 45) {
    return "now";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

export function formatExactTimestamp(isoDateString: string): string {
  const date = new Date(isoDateString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

