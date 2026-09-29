/**
 * Recebe os leads do formulário e grava na planilha Google.
 *
 * Como usar: veja a seção "Conectar ao Google Sheets" no README.md.
 */

// Nome da aba onde os leads serão gravados (criada automaticamente)
var SHEET_NAME = 'Leads';

// E-mail(s) para aviso de novo lead, separados por vírgula. Deixe '' para desativar.
var NOTIFY_EMAIL = '';

// Colunas extras capturadas automaticamente pelo formulário
var META_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
                   'gclid', 'fbclid', 'pagina', 'referencia'];

var MAX_VALUE_LENGTH = 5000;

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var p = (e && e.parameter) || {};

    // Honeypot: robôs preenchem o campo oculto. Fingimos sucesso e descartamos.
    if (p._hp) return json_({ ok: true });

    var formFields = String(p._fields || '')
      .split(',')
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return /^[\w-]{1,64}$/.test(s); });
    if (!formFields.length) return json_({ ok: false, error: 'payload inválido' });

    lock.waitLock(10000);

    var sheet = getSheet_();
    var headers = ensureHeaders_(sheet, ['data_hora'].concat(formFields, META_FIELDS));

    var row = headers.map(function (h) {
      if (h === 'data_hora') return new Date();
      return sanitize_(p[h]);
    });
    sheet.appendRow(row);

    if (NOTIFY_EMAIL) notify_(headers, row);

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'erro interno' });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

// Permite verificar no navegador que a implantação está ativa
function doGet() {
  return json_({ ok: true, status: 'online' });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Garante que todas as colunas existam; novas colunas são adicionadas ao final
// para não bagunçar dados antigos quando você altera os campos do formulário.
function ensureHeaders_(sheet, wanted) {
  var lastCol = sheet.getLastColumn();
  var headers = lastCol ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String) : [];
  var missing = wanted.filter(function (h) { return headers.indexOf(h) === -1; });
  if (missing.length) {
    sheet.getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing])
      .setFontWeight('bold');
    headers = headers.concat(missing);
  }
  return headers;
}

// Evita injeção de fórmulas (=, +, -, @) e limita o tamanho dos valores
function sanitize_(v) {
  if (v === undefined || v === null) return '';
  var s = String(v).slice(0, MAX_VALUE_LENGTH);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function notify_(headers, row) {
  var lines = headers.map(function (h, i) {
    return row[i] === '' ? null : h + ': ' + row[i];
  }).filter(Boolean);
  var nome = row[headers.indexOf('nome')] || 'sem nome';
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: 'Novo lead: ' + nome,
    body: lines.join('\n') + '\n\nPlanilha: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
