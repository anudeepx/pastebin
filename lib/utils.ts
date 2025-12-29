export function getCurrentTime(headers: Headers): number {
  const testMode = process.env.TEST_MODE === "1";

  if (testMode) {
    const testNowMs = headers.get("x-test-now-ms");
    if (testNowMs) {
      return parseInt(testNowMs, 10);
    }
  }

  return Date.now();
}

export function isPasteAvailable(
  paste: {
    expires_at: number | null;
    max_views: number | null;
    view_count: number;
  },
  currentTime: number
): boolean {
  // Check expiry
  if (paste.expires_at !== null && currentTime >= paste.expires_at) {
    return false;
  }

  // Check view limit
  if (paste.max_views !== null && paste.view_count >= paste.max_views) {
    return false;
  }

  return true;
}
