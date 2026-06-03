const SHEET_NAME = "French Garden Usage Tracker";
const SPREADSHEET_ID = "1jH-f1Pz5pMgW2ts5BSBwaChSIivFcfjkPO6p_4PIWDw";
const HEADERS = [
  "receivedAt",
  "timestamp",
  "eventType",
  "activityType",
  "correct",
  "itemId",
  "score",
  "correctAnswers",
  "practicedCount",
  "reviewCount",
  "appLanguage",
  "sessionId",
  "clientId",
  "userAgent",
  "source",
];

function doPost(event) {
  const sheet = getEventsSheet();
  const payload = parsePayload(event);

  sheet.appendRow(
    HEADERS.map((header) => {
      if (header === "receivedAt") return new Date().toISOString();
      return payload[header] ?? "";
    })
  );

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const sheet = getEventsSheet();
  const values = sheet.getDataRange().getDisplayValues();
  const csv = values
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");

  return ContentService
    .createTextOutput(csv)
    .setMimeType(ContentService.MimeType.CSV);
}

function getEventsSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }

  return sheet;
}

function parsePayload(event) {
  try {
    return JSON.parse(event.postData.contents || "{}");
  } catch {
    return {};
  }
}

function escapeCsvCell(value) {
  const text = String(value ?? "");
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}
