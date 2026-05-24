// Paste the deployed Google Apps Script Web app URL here.
// Example: https://script.google.com/macros/s/AKfycb.../exec
const TRACKING_ENDPOINT = "";
const HAS_TRACKING_ENDPOINT = TRACKING_ENDPOINT.startsWith("https://script.google.com/");
const CLIENT_ID_KEY = "french-garden-tracker-client-id";
const HEARTBEAT_INTERVAL_MS = 3 * 60 * 1000;

export function createUsageTracker({ getLanguage, getStats }) {
  const clientId = getOrCreateClientId();
  const sessionId = createId();
  let heartbeatId = null;

  function track(eventType, details = {}) {
    if (!HAS_TRACKING_ENDPOINT) return;

    const stats = getStats();
    const payload = {
      timestamp: new Date().toISOString(),
      eventType,
      activityType: details.activityType || "",
      correct: typeof details.correct === "boolean" ? details.correct : "",
      itemId: details.itemId || "",
      score: stats.score,
      correctAnswers: stats.correctAnswers,
      practicedCount: stats.practicedCount,
      reviewCount: stats.reviewCount,
      appLanguage: getLanguage(),
      sessionId,
      clientId,
      userAgent: navigator.userAgent,
    };

    try {
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "text/plain;charset=UTF-8" });
        navigator.sendBeacon(TRACKING_ENDPOINT, blob);
        return;
      }

      fetch(TRACKING_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body,
      }).catch(() => {});
    } catch {
      // Tracking must never interrupt the learning app.
    }
  }

  function startHeartbeat() {
    if (!HAS_TRACKING_ENDPOINT || heartbeatId) return;
    heartbeatId = window.setInterval(() => {
      track("session_ping");
    }, HEARTBEAT_INTERVAL_MS);
  }

  return { track, startHeartbeat };
}

function getOrCreateClientId() {
  try {
    const saved = localStorage.getItem(CLIENT_ID_KEY);
    if (saved) return saved;
    const clientId = createId();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
    return clientId;
  } catch {
    return createId();
  }
}

function createId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
