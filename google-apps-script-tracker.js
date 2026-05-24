const SHEET_NAME = "Events";
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
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, app: "French Garden tracker" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getEventsSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
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
