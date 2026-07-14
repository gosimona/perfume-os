// PERFUME OS — puente de sincronización con Google Sheets.
//
// Opción A (Extensions > Apps Script): pega este código tal cual, deja
// SHEET_ID en blanco, y despliega como Web App.
//
// Opción B (script.new, si Extensions > Apps Script te da error): crea el
// proyecto en https://script.new, pega este código, y pon en SHEET_ID el
// ID de tu hoja (la parte de la URL entre /d/ y /edit). Luego despliega
// igual como Web App.
//
// En ambos casos: reemplaza TOKEN por la clave que te dio Claude y
// despliega como Web App (Execute as: Me, Who has access: Anyone).
// Ver README para el paso a paso.

var TOKEN = 'FR5QUHm1LbbpjHk02xo-VHzC';
var SHEET_ID = ''; // solo necesario con la Opción B (script.new)

var SALES_HEADERS = ['id', 'customer', 'perfume', 'qty', 'price', 'paid', 'date', 'notes'];
var INVENTORY_HEADERS = ['id', 'perfume', 'cost', 'price', 'unit', 'stock', 'threshold'];

function getSpreadsheet_() {
  return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet_(name, headers) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sheet;
}

function readRows_(sheet, headers) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    if (!row[0]) continue; // skip rows without an id
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = row[j];
    if (obj.date instanceof Date) {
      obj.date = Utilities.formatDate(obj.date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    }
    rows.push(obj);
  }
  return rows;
}

function writeRows_(sheet, headers, rows) {
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, headers.length).clearContent();
  }
  if (!rows || rows.length === 0) return;
  var values = rows.map(function (r) {
    return headers.map(function (h) { return r[h] !== undefined && r[h] !== null ? r[h] : ''; });
  });
  sheet.getRange(2, 1, values.length, headers.length).setValues(values);
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var token = e && e.parameter && e.parameter.token;
  if (token !== TOKEN) return jsonResponse_({ ok: false, error: 'unauthorized' });

  var salesSheet = getSheet_('Sales', SALES_HEADERS);
  var inventorySheet = getSheet_('Inventory', INVENTORY_HEADERS);

  return jsonResponse_({
    ok: true,
    sales: readRows_(salesSheet, SALES_HEADERS),
    inventory: readRows_(inventorySheet, INVENTORY_HEADERS),
    updatedAt: new Date().toISOString(),
  });
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse_({ ok: false, error: 'bad-json' });
  }

  if (body.token !== TOKEN) return jsonResponse_({ ok: false, error: 'unauthorized' });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var salesSheet = getSheet_('Sales', SALES_HEADERS);
    var inventorySheet = getSheet_('Inventory', INVENTORY_HEADERS);

    if (Array.isArray(body.sales)) writeRows_(salesSheet, SALES_HEADERS, body.sales);
    if (Array.isArray(body.inventory)) writeRows_(inventorySheet, INVENTORY_HEADERS, body.inventory);

    return jsonResponse_({ ok: true, updatedAt: new Date().toISOString() });
  } finally {
    lock.releaseLock();
  }
}
