/**
 * Guestbook + RSVP backend for the wedding page (Google Apps Script web app).
 * Paste into Extensions > Apps Script of a Google Sheet, then deploy as a web app
 * (Execute as: Me, Who has access: Anyone). See HUONG-DAN.md.
 *
 * Sheets (created automatically on first request):
 *   LoiChuc : Thời gian | Tên | Lời chúc | Ẩn   (put "x" in "Ẩn" to hide a message)
 *   XacNhan : Thời gian | Tên | Tham dự | Số người
 */
var MAX_NAME = 50;
var MAX_MESSAGE = 500;
var LIST_LIMIT = 200;

function doGet() {
  var sheet = getSheet_('LoiChuc', ['Thời gian', 'Tên', 'Lời chúc', 'Ẩn']);
  var rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues() : [];
  var messages = rows
    .filter(function (r) { return r[1] && r[2] && !String(r[3]).trim(); })
    .slice(-LIST_LIMIT)
    .reverse()
    .map(function (r) { return { time: new Date(r[0]).getTime(), name: String(r[1]), message: String(r[2]) }; });
  return json_({ ok: true, messages: messages });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.website) return json_({ ok: true }); // honeypot field filled => bot, silently ignore

    var name = clean_(data.name, MAX_NAME);
    if (!name) return json_({ ok: false, error: 'Vui lòng nhập tên' });

    if (data.type === 'message') {
      var message = clean_(data.message, MAX_MESSAGE);
      if (!message) return json_({ ok: false, error: 'Vui lòng nhập lời chúc' });
      getSheet_('LoiChuc', ['Thời gian', 'Tên', 'Lời chúc', 'Ẩn']).appendRow([new Date(), name, message, '']);
      return json_({ ok: true });
    }
    if (data.type === 'rsvp') {
      var attend = data.attendance === 'yes' ? 'Có tham dự' : 'Không tham dự';
      var guests = Math.min(Math.max(parseInt(data.guests, 10) || 0, 0), 20) || '';
      getSheet_('XacNhan', ['Thời gian', 'Tên', 'Tham dự', 'Số người']).appendRow([new Date(), name, attend, guests]);
      return json_({ ok: true });
    }
    return json_({ ok: false, error: 'Yêu cầu không hợp lệ' });
  } catch (err) {
    return json_({ ok: false, error: 'Lỗi máy chủ, vui lòng thử lại' });
  } finally {
    lock.releaseLock();
  }
}

// Trim, cap length, and neutralise spreadsheet formulas (=, +, -, @ prefixes).
function clean_(value, max) {
  var s = String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function getSheet_(name, header) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(header);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastColumn() < header.length) {
    // add columns introduced after the sheet was created
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
