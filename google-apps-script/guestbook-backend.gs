/**
 * Guestbook + RSVP backend for the wedding page (Google Apps Script web app).
 * Paste into Extensions > Apps Script of a Google Sheet, then deploy as a web app
 * (Execute as: Me, Who has access: Anyone). See HUONG-DAN.md.
 *
 * Sheets (created automatically on first request):
 *   LoiChuc : Thời gian | Tên | Lời chúc | Ẩn   (put "x" in "Ẩn" to hide a message)
 *   XacNhan : Thời gian | Tên | Tham dự | Số người
 *
 * Photo layout (admin page): stored in Script Properties as PHOTO_CONFIG.
 * Saving requires the ADMIN_KEY script property (Project Settings > Script properties).
 */
var MAX_NAME = 50;
var MAX_MESSAGE = 500;
var LIST_LIMIT = 200;

function doGet(e) {
  if (e && e.parameter && e.parameter.type === 'config') {
    var raw = PropertiesService.getScriptProperties().getProperty('PHOTO_CONFIG');
    return json_({ ok: true, config: raw ? JSON.parse(raw) : null });
  }
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
    if (data.type === 'config' || data.type === 'checkKey') return adminRequest_(data);

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

// Admin: verify the key, and save the photo layout chosen on the admin page.
function adminRequest_(data) {
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty('ADMIN_KEY');
  if (!key) return json_({ ok: false, error: 'Chưa đặt ADMIN_KEY trong Script properties' });
  if (String(data.key || '') !== key) return json_({ ok: false, error: 'Sai mật khẩu' });
  if (data.type === 'checkKey') return json_({ ok: true });
  var text = JSON.stringify(data.config || {});
  if (text.length > 8500) return json_({ ok: false, error: 'Cấu hình quá lớn' });
  props.setProperty('PHOTO_CONFIG', text);
  return json_({ ok: true });
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
