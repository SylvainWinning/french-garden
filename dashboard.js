import { trackerRows } from "./dashboard-data.js?v=20260525-dashboard";

const state = { rows: trackerRows };

render();

document.querySelector("#import-csv").addEventListener("click", () => {
  const rows = parseCsv(document.querySelector("#csv-input").value.trim());
  if (rows.length) {
    state.rows = rows;
    render();
  }
});

function render() {
  const events = state.rows.map(normalizeRow).filter(Boolean);
  const answers = events.filter((event) => event.eventType === "answer");
  const correct = answers.filter((event) => event.correct === true).length;
  const wrong = answers.filter((event) => event.correct === false).length;
  const sessions = new Set(events.map((event) => event.sessionId).filter(Boolean));
  const latest = latestProgress(events);

  setText("total-events", events.length);
  setText("total-sessions", sessions.size);
  setText("good-answers", correct);
  setText("max-score", latest.score);

  const totalAnswers = correct + wrong;
  setText("success-rate", totalAnswers ? `${Math.round((correct / totalAnswers) * 100)}%` : "0%");
  drawPie(correct, wrong);
  renderLegend(correct, wrong);
  renderActivityBars(answers);
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
    eventType: action.includes("Réponse") ? "answer" : action.includes("Ouverture") ? "session_start" : "session_ping",
    activityType: activityFromAction(action),
    correct: action.includes("bonne réponse") ? true : action.includes("mauvaise réponse") ? false : "",
    itemId: fields["Élément"] || "",
    score: Number(fields.Score || 0),
    correctAnswers: Number(fields["Bonnes réponses"] || 0),
    practicedCount: Number(fields["Pratiqués"] || 0),
    reviewCount: Number(fields["À revoir"] || 0),
    appLanguage: fields.Langue || "",
    sessionId: fields.Session || "",
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
  const lines = text.split(/\r?\n/).filter(Boolean);
  return lines
    .map((line) => {
      const match = line.match(/^("([^"]|"")*"|[^,\t;]+)[,\t;]([\s\S]+)$/);
      if (!match) return null;
      return {
        receivedAt: cleanCell(match[1]),
        info: cleanCell(match[3]),
      };
    })
    .filter(Boolean);
}

function cleanCell(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) return trimmed.slice(1, -1).replace(/""/g, '"');
  return trimmed;
}

function actionFromJson(event) {
  if (event.eventType === "session_start") return "Ouverture de l'app";
  if (event.eventType === "session_ping") return "App encore ouverte";
  if (event.eventType === "answer") return `Réponse ${event.activityType || "exercice"} (${event.correct ? "bonne réponse" : "mauvaise réponse"})`;
  return event.eventType || "Événement";
}

function activityFromAction(action) {
  const match = action.match(/^Réponse\s+([^(]+)/);
  return match ? match[1].trim() : "";
}

function legendRow(color, label, count) {
  return `<div class="legend-row"><span class="dot" style="background:${color}"></span><span>${label}</span><strong>${count}</strong></div>`;
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
