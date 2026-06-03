const state = { rows: window.trackerRows || [] };
const REMOTE_CSV_URL_KEY = "french-garden-dashboard-csv-url";
const LEGACY_CODEX_SESSION_IDS = new Set([
  "81ccb76d-f5e3-4f88-ae8c-278c08750263",
  "codex-test",
]);

document.querySelector("#import-csv").addEventListener("click", () => {
  const rows = parseCsv(document.querySelector("#csv-input").value.trim());
  if (rows.length) {
    state.rows = rows;
    render();
    setImportStatus(`Dashboard mis à jour avec ${rows.length} événement${rows.length > 1 ? "s" : ""}.`, "success");
  } else {
    setImportStatus("Aucune ligne exploitable trouvée dans l'export collé.", "error");
  }
});

document.querySelector("#refresh-csv").addEventListener("click", refreshFromRemoteCsv);

setInitialImportStatus();
render();

async function refreshFromRemoteCsv() {
  const button = document.querySelector("#refresh-csv");
  const url = getRemoteCsvUrl();
  if (!url) {
    setImportStatus("Actualisation annulée : aucune URL CSV enregistrée.", "error");
    return;
  }

  button.disabled = true;
  setImportStatus("Actualisation en cours...", "");

  try {
    const response = await fetch(withCacheBust(url));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    const rows = parseCsv(text.trim());
    if (!rows.length) throw new Error("CSV vide ou format non reconnu");

    state.rows = rows;
    document.querySelector("#csv-input").value = text;
    render();
    setImportStatus(`Actualisé depuis Google Sheets : ${rows.length} événement${rows.length > 1 ? "s" : ""}.`, "success");
  } catch {
    setImportStatus("Impossible d'actualiser. Vérifie que l'URL CSV publiée est accessible.", "error");
  } finally {
    button.disabled = false;
  }
}

function render() {
  const events = state.rows.map(normalizeRow).filter(Boolean);
  const answers = events.filter((event) => event.eventType === "answer");
  const rewards = events.filter((event) => event.eventType === "reward_unlocked");
  const correct = answers.filter((event) => event.correct === true).length;
  const wrong = answers.filter((event) => event.correct === false).length;
  const sessions = new Set(events.map((event) => event.sessionId).filter(Boolean));
  const sessionDurations = getSessionDurations(events);
  const learnerSessionDurations = sessionDurations.filter((session) => session.source === "Elle");
  const latest = latestProgress(events);

  setText("total-events", events.length);
  setText("total-sessions", sessions.size);
  setText("good-answers", correct);
  setText("max-score", latest.score);
  setText("total-rewards", rewards.length);
  setText("latest-reward", rewards.length ? rewards[rewards.length - 1].itemId || "Récompense" : "-");
  setText("total-session-time", learnerSessionDurations.length ? formatDuration(sumDurations(learnerSessionDurations)) : "0 min");
  setText("average-session-time", learnerSessionDurations.length ? formatDuration(averageDuration(learnerSessionDurations)) : "0 min");

  const totalAnswers = correct + wrong;
  setText("success-rate", totalAnswers ? `${Math.round((correct / totalAnswers) * 100)}%` : "0%");
  drawPie(correct, wrong);
  renderLegend(correct, wrong);
  renderActivityBars(answers);
  renderReviewPriorities(answers);
  renderRewards(rewards);
  renderSessionDurations(sessionDurations);
  renderRecent(events);
}

function normalizeRow(row) {
  const raw = row.info || "";
  if (!raw.trim()) return null;

  if (raw.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(raw);
      return {
        receivedAt: row.receivedAt,
        occurredAtMs: parseEventTime(parsed.timestamp || row.receivedAt),
        eventType: parsed.eventType,
        activityType: parsed.activityType || "",
        correct: parsed.correct === true ? true : parsed.correct === false ? false : "",
        itemId: parsed.itemId || "",
        score: Number(parsed.score || 0),
        correctAnswers: Number(parsed.correctAnswers || 0),
        practicedCount: Number(parsed.practicedCount || 0),
        reviewCount: Number(parsed.reviewCount || 0),
        appLanguage: parsed.appLanguage || "",
        sessionId: parsed.sessionId || "",
        source: parsed.source || sourceFromPayload(parsed),
        actionLabel: actionFromJson(parsed),
      };
    } catch {
      return null;
    }
  }

  const fields = Object.fromEntries(
    raw
      .split("\n")
      .map((line) => line.replace(/^•\s*/, "").split(/\s:\s(.+)/))
      .filter((parts) => parts.length === 3)
      .map(([key, value]) => [key.trim(), value.trim()])
  );
  const action = fields.Action || "";
  return {
    receivedAt: row.receivedAt || fields.Quand || "",
    occurredAtMs: parseEventTime(fields.Quand || row.receivedAt),
    eventType: eventTypeFromAction(action),
    activityType: activityFromAction(action),
    correct: action.includes("bonne réponse") ? true : action.includes("mauvaise réponse") ? false : "",
    itemId: fields["Élément"] || "",
    score: Number(fields.Score || 0),
    correctAnswers: Number(fields["Bonnes réponses"] || 0),
    practicedCount: Number(fields["Pratiqués"] || 0),
    reviewCount: Number(fields["À revoir"] || 0),
    appLanguage: fields.Langue || "",
    sessionId: fields.Session || "",
    source: fields.Source || "Elle",
    actionLabel: action,
  };
}

function latestProgress(events) {
  return events.reduce(
    (best, event) => ({
      score: Math.max(best.score, event.score || 0),
      correctAnswers: Math.max(best.correctAnswers, event.correctAnswers || 0),
    }),
    { score: 0, correctAnswers: 0 }
  );
}

function getSessionDurations(events) {
  const grouped = events
    .filter((event) => event.sessionId && Number.isFinite(event.occurredAtMs))
    .reduce((map, event) => {
      const current = map.get(event.sessionId) || {
        sessionId: event.sessionId,
        startedAt: event.receivedAt,
        endedAt: event.receivedAt,
        startedAtMs: event.occurredAtMs,
        endedAtMs: event.occurredAtMs,
        eventCount: 0,
        answerCount: 0,
        sources: new Set(),
      };

      if (event.occurredAtMs < current.startedAtMs) {
        current.startedAtMs = event.occurredAtMs;
        current.startedAt = event.receivedAt;
      }
      if (event.occurredAtMs > current.endedAtMs) {
        current.endedAtMs = event.occurredAtMs;
        current.endedAt = event.receivedAt;
      }
      current.eventCount += 1;
      if (event.eventType === "answer") current.answerCount += 1;
      if (event.source) current.sources.add(event.source);
      map.set(event.sessionId, current);
      return map;
    }, new Map());

  return Array.from(grouped.values())
    .map((session) => ({
      ...session,
      durationMs: Math.max(0, session.endedAtMs - session.startedAtMs),
      source: summarizeSources(session.sources),
    }))
    .sort((a, b) => b.startedAtMs - a.startedAtMs);
}

function sumDurations(sessions) {
  return sessions.reduce((total, session) => total + session.durationMs, 0);
}

function averageDuration(sessions) {
  if (!sessions.length) return 0;
  return Math.round(sumDurations(sessions) / sessions.length);
}

function drawPie(correct, wrong) {
  const canvas = document.querySelector("#success-chart");
  const ctx = canvas.getContext("2d");
  const total = correct + wrong || 1;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = 100;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSlice(ctx, cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * correct) / total, "#35a874");
  drawSlice(ctx, cx, cy, radius, -Math.PI / 2 + (Math.PI * 2 * correct) / total, Math.PI * 1.5, "#e25555");
  ctx.beginPath();
  ctx.fillStyle = "#fffafc";
  ctx.arc(cx, cy, 56, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2b1d2d";
  ctx.font = "800 28px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${correct}/${correct + wrong}`, cx, cy);
}

function drawSlice(ctx, cx, cy, radius, start, end, color) {
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, radius, start, end);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function renderLegend(correct, wrong) {
  document.querySelector("#success-legend").innerHTML = [
    legendRow("#35a874", "Bonnes réponses", correct),
    legendRow("#e25555", "Mauvaises réponses", wrong),
  ].join("");
}

function renderActivityBars(answers) {
  const counts = answers.reduce((map, answer) => {
    const key = answer.activityType || "autre";
    map[key] = (map[key] || 0) + 1;
    return map;
  }, {});
  const max = Math.max(1, ...Object.values(counts));
  document.querySelector("#activity-bars").innerHTML =
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => {
        const width = Math.round((count / max) * 100);
        return `<div class="bar-row"><strong>${escapeHtml(label)}</strong><div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div><span>${count}</span></div>`;
      })
      .join("") || `<p>Aucune réponse pour l'instant.</p>`;
}

function renderReviewPriorities(answers) {
  const priorities = answers
    .filter((answer) => answer.correct === false)
    .reduce((map, answer) => {
      const key = answer.itemId || `${answer.activityType || "exercice"} sans élément`;
      const current = map.get(key) || {
        itemId: key,
        activityTypes: new Set(),
        wrongCount: 0,
        lastSeenAt: answer.receivedAt,
        lastSeenAtMs: 0,
      };
      current.activityTypes.add(answer.activityType || "exercice");
      current.wrongCount += 1;
      if ((answer.occurredAtMs || 0) >= current.lastSeenAtMs) {
        current.lastSeenAt = answer.receivedAt;
        current.lastSeenAtMs = answer.occurredAtMs || 0;
      }
      map.set(key, current);
      return map;
    }, new Map());

  document.querySelector("#review-priority-list").innerHTML =
    Array.from(priorities.values())
      .sort((a, b) => b.wrongCount - a.wrongCount || b.lastSeenAtMs - a.lastSeenAtMs)
      .slice(0, 5)
      .map((item) => {
        const countLabel = `${item.wrongCount} erreur${item.wrongCount > 1 ? "s" : ""}`;
        const activityLabel = Array.from(item.activityTypes).sort().join(", ");
        return `<div class="review-priority-item"><span>${escapeHtml(item.lastSeenAt)}</span><strong>${escapeHtml(item.itemId)}</strong><em>${escapeHtml(activityLabel)} · ${escapeHtml(countLabel)}</em></div>`;
      })
      .join("") || `<p>Aucun point difficile pour l'instant.</p>`;
}

function renderRewards(rewards) {
  document.querySelector("#reward-list").innerHTML =
    rewards
      .slice()
      .reverse()
      .map((reward) => {
        const label = reward.itemId || "Récompense";
        const details = [
          `${reward.correctAnswers || 0} bonnes réponses`,
          `${reward.score || 0} points`,
        ].join(" · ");
        return `<div class="reward-item"><span>${escapeHtml(reward.receivedAt)}</span><strong>${escapeHtml(label)}</strong><em>${escapeHtml(details)}</em></div>`;
      })
      .join("") || `<p>Aucune récompense débloquée pour l'instant.</p>`;
}

function renderSessionDurations(sessions) {
  const sortedSessions = sessions
    .slice()
    .sort((a, b) => Number(b.source === "Elle") - Number(a.source === "Elle") || b.startedAtMs - a.startedAtMs);

  document.querySelector("#session-duration-list").innerHTML =
    sortedSessions
      .map((session) => {
        const details = [
          session.source,
          `${session.answerCount} réponse${session.answerCount > 1 ? "s" : ""}`,
          `${session.eventCount} événement${session.eventCount > 1 ? "s" : ""}`,
        ].join(" · ");
        const isLearnerSession = session.source === "Elle";
        const className = isLearnerSession ? "session-duration-item" : "session-duration-item is-debug-source";
        const debugLabel = isLearnerSession ? "" : `<small>Donnée test/debug</small>`;
        return `<div class="${className}"><span>${escapeHtml(session.startedAt)}</span><strong>${escapeHtml(formatDuration(session.durationMs))}</strong><em>${escapeHtml(details)}</em>${debugLabel}</div>`;
      })
      .join("") || `<p>Aucune durée de session pour l'instant.</p>`;
}

function renderRecent(events) {
  const interesting = events
    .filter((event) => event.eventType !== "session_ping" && event.eventType !== "test")
    .slice(-8)
    .reverse();
  document.querySelector("#recent-list").innerHTML = interesting
    .map((event) => `<div class="recent-item"><span>${escapeHtml(event.receivedAt)}</span><strong>${escapeHtml(event.actionLabel)}</strong><em>${escapeHtml(event.itemId || "app")}</em></div>`)
    .join("");
}

function parseCsv(text) {
  if (!text) return [];
  const rows = parseDelimitedRows(text);
  const headers = rows[0]?.map((cell) => cell.trim()) || [];
  const headerLookup = new Map(headers.map((header, index) => [normalizeHeader(header), index]));

  if (hasStructuredTrackerHeaders(headerLookup)) {
    return rows
      .slice(1)
      .map((cells) => rowFromStructuredCsv(cells, headerLookup))
      .filter(Boolean);
  }

  return rows
    .map((cells) => {
      if (cells.length < 2) return null;
      if (isHeaderRow(cells)) return null;
      return {
        receivedAt: cells[0].trim(),
        info: cells.slice(1).join(" ").trim(),
      };
    })
    .filter(Boolean);
}

function hasStructuredTrackerHeaders(headerLookup) {
  return headerLookup.has("eventtype") && headerLookup.has("sessionid");
}

function rowFromStructuredCsv(cells, headerLookup) {
  const value = (name) => cells[headerLookup.get(name)]?.trim() || "";
  const eventType = value("eventtype");
  if (!eventType) return null;

  const payload = {
    timestamp: value("timestamp"),
    eventType,
    activityType: value("activitytype"),
    correct: parseBooleanValue(value("correct")),
    itemId: value("itemid"),
    score: Number(value("score") || 0),
    correctAnswers: Number(value("correctanswers") || 0),
    practicedCount: Number(value("practicedcount") || 0),
    reviewCount: Number(value("reviewcount") || 0),
    appLanguage: value("applanguage"),
    sessionId: value("sessionid"),
    clientId: value("clientid"),
    userAgent: value("useragent"),
    source: value("source"),
  };

  return {
    receivedAt: value("receivedat") || payload.timestamp,
    info: JSON.stringify(payload),
  };
}

function parseBooleanValue(value) {
  if (value === "true" || value === "TRUE" || value === "1") return true;
  if (value === "false" || value === "FALSE" || value === "0") return false;
  return "";
}

function isHeaderRow(cells) {
  const first = normalizeHeader(cells[0]);
  const second = normalizeHeader(cells[1]);
  return (
    (first === "horodateur" && second === "infosutiles") ||
    (first === "timestamp" && second === "payload") ||
    (first === "receivedat" && second === "info")
  );
}

function parseDelimitedRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes && (char === "," || char === ";" || char === "\t")) {
      row.push(cell);
      cell = "";
    } else if (!inQuotes && char === "\n") {
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function actionFromJson(event) {
  if (event.eventType === "session_start") return "Ouverture de l'app";
  if (event.eventType === "session_ping") return "App encore ouverte";
  if (event.eventType === "reward_unlocked") return "Récompense débloquée";
  if (event.eventType === "answer") return `Réponse ${event.activityType || "exercice"} (${event.correct ? "bonne réponse" : "mauvaise réponse"})`;
  return event.eventType || "Événement";
}

function eventTypeFromAction(action) {
  if (action.includes("Réponse")) return "answer";
  if (action.includes("Ouverture")) return "session_start";
  if (action.includes("Récompense débloquée")) return "reward_unlocked";
  return "session_ping";
}

function activityFromAction(action) {
  if (action.includes("Récompense débloquée")) return "reward";
  const match = action.match(/^Réponse\s+([^(]+)/);
  return match ? match[1].trim() : "";
}

function sourceFromPayload(payload) {
  const userAgent = payload.userAgent || "";
  if (LEGACY_CODEX_SESSION_IDS.has(payload.sessionId)) return "Codex";
  if (/codex|electron|curl/i.test(userAgent)) return "Codex";
  if (payload.clientId === "codex-test" || payload.sessionId === "codex-test" || payload.appLanguage === "test") return "Codex";
  return "Elle";
}

function summarizeSources(sources) {
  const labels = Array.from(sources).filter(Boolean);
  if (!labels.length) return "Non précisé";
  const precise = labels.filter((label) => label !== "Non précisé");
  const unique = Array.from(new Set(precise.length ? precise : labels));
  return unique.length === 1 ? unique[0] : "Mixte";
}

function parseEventTime(value) {
  if (!value) return NaN;
  const parsed = Date.parse(value);
  if (Number.isFinite(parsed)) return parsed;

  const match = String(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return NaN;
  const [, day, month, year, hour, minute, second = "0"] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)).getTime();
}

function formatDuration(milliseconds) {
  const totalMinutes = Math.max(0, Math.round(milliseconds / 60000));
  if (totalMinutes < 1) return "< 1 min";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

function legendRow(color, label, count) {
  return `<div class="legend-row"><span class="dot" style="background:${color}"></span><span>${label}</span><strong>${count}</strong></div>`;
}

function setInitialImportStatus() {
  if (readStoredCsvUrl()) {
    setImportStatus("Source Google Sheets enregistrée.", "");
  }
}

function getRemoteCsvUrl() {
  const saved = readStoredCsvUrl();
  if (saved) return saved;

  const value = window.prompt("Colle l'URL CSV publiée de la feuille de réponses Google Forms.", "");
  if (value === null) return "";

  const url = value.trim();
  if (!url) {
    window.localStorage.removeItem(REMOTE_CSV_URL_KEY);
    return "";
  }
  if (!/^https?:\/\//i.test(url)) {
    setImportStatus("L'URL doit commencer par http:// ou https://.", "error");
    return "";
  }

  window.localStorage.setItem(REMOTE_CSV_URL_KEY, url);
  return url;
}

function readStoredCsvUrl() {
  try {
    return window.localStorage.getItem(REMOTE_CSV_URL_KEY) || "";
  } catch {
    return "";
  }
}

function withCacheBust(url) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_=${Date.now()}`;
}

function setImportStatus(message, tone) {
  const status = document.querySelector("#import-status");
  status.textContent = message;
  status.dataset.tone = tone;
}

function normalizeHeader(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

function setText(id, value) {
  document.querySelector(`#${id}`).textContent = value;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}
