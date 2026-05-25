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
        [TRACKING_PAYLOAD_FIELD]: formatUsefulSummary(payload),
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

function formatUsefulSummary(payload) {
  const lines = [
    `• Quand : ${formatWhen(payload.timestamp)}`,
    `• Action : ${formatAction(payload)}`,
    `• Bonnes réponses : ${payload.correctAnswers}`,
    `• Score : ${payload.score}`,
    `• Pratiqués : ${payload.practicedCount}`,
    `• À revoir : ${payload.reviewCount}`,
  ];

  if (payload.itemId) lines.splice(2, 0, `• Élément : ${payload.itemId}`);
  if (payload.appLanguage) lines.push(`• Langue : ${payload.appLanguage}`);
  if (payload.sessionId) lines.push(`• Session : ${payload.sessionId.slice(0, 8)}`);

  return lines.join("\n");
}

function formatAction(payload) {
  if (payload.eventType === "session_start") return "Ouverture de l'app";
  if (payload.eventType === "session_ping") return "App encore ouverte";
  if (payload.eventType === "reward_unlocked") return "Récompense débloquée";
  if (payload.eventType === "answer") {
    const result = payload.correct === true ? "bonne réponse" : "mauvaise réponse";
    return `Réponse ${payload.activityType || "exercice"} (${result})`;
  }
  return payload.eventType;
}

function formatWhen(timestamp) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(new Date(timestamp));
  } catch {
    return timestamp;
  }
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
