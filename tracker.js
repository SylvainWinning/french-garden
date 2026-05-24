const TRACKING_ENDPOINT = "https://docs.google.com/forms/d/e/1FAIpQLScPJz900yUZ6JEpUYOeXa3bzNnALZ7xZVF6xjcJCdzfqg2qzQ/formResponse";
const TRACKING_PAYLOAD_FIELD = "entry.1264612823";
const HAS_TRACKING_ENDPOINT = TRACKING_ENDPOINT.startsWith("https://docs.google.com/forms/");
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
      const body = new URLSearchParams({
        [TRACKING_PAYLOAD_FIELD]: JSON.stringify(payload),
      }).toString();
      if (navigator.sendBeacon) {
        const blob = new Blob([body], {
          type: "application/x-www-form-urlencoded;charset=UTF-8",
        });
        navigator.sendBeacon(TRACKING_ENDPOINT, blob);
        return;
      }

      fetch(TRACKING_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
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
