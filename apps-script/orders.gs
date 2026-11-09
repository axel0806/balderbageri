/**
 * Balder Bageri – orderregistrering (Google Apps Script)
 *
 * Tar emot betalda beställningar från /api/stripe-webhook, skriver en rad i fliken "Ordrar"
 * i kalkylbladet och skickar ett e-postmeddelande till dig.
 *
 * Engångsinställning:
 *  1. Skapa ett nytt Google Sheets-dokument, t.ex. "Balder Bageri – ordrar".
 *  2. Extensions → Apps Script. Klistra in den här filen och spara.
 *  3. Project Settings → Script properties → lägg till TOKEN = ett långt slumpat lösenord.
 *     Samma värde läggs i Vercel som APPS_SCRIPT_TOKEN.
 *  4. Deploy → New deployment → Type: Web app. Execute as: Me. Who has access: Anyone.
 *     Kopiera webbappens URL och lägg den i Vercel som APPS_SCRIPT_URL.
 *  5. Kör funktionen setupSheet() en gång från editorn (godkänn behörigheterna).
 */

const SHEET_NAME = 'Ordrar';
const HEADERS = [
  'Datum', 'Ordernummer', 'Påse', 'Sorter', 'Belopp (kr)',
  'Namn', 'E-post', 'Telefon', 'Gatuadress', 'Adress 2', 'Postnummer', 'Ort', 'Betalning', 'Kundens ordernummer',
];

function setupSheet() {
  const sheet = getSheet_();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let order;
  try {
    order = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut_({ ok: false, error: 'bad json' });
  }

  const token = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (!token || order.token !== token) return jsonOut_({ ok: false, error: 'forbidden' });

  const sheet = getSheet_();
  if (sheet.getLastRow() === 0) setupSheet();
  // Older sheets lack the newest header. Add it so the column is labelled.
  const lastHeader = HEADERS.length;
  if (!sheet.getRange(1, lastHeader).getValue()) sheet.getRange(1, lastHeader).setValue(HEADERS[lastHeader - 1]).setFontWeight('bold');

  // Stripe kan skicka samma händelse flera gånger. Skriv inte samma order två gånger.
  const existing = sheet.getLastRow() > 1
    ? sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues().flat()
    : [];
  if (existing.indexOf(order.orderId) !== -1) return jsonOut_({ ok: true, duplicate: true });

  const pkgName = order.package === 'stor' ? 'Stor påse' : order.package === 'liten' ? 'Liten påse' : order.package;
  sheet.appendRow([
    order.created,
    order.orderId,
    pkgName,
    order.sorts,
    order.amount,
    order.name,
    order.email,
    order.phone,
    order.street,
    order.street2,
    order.postcode,
    order.city,
    'Betald (kort)',
    order.orderNumber || '',
  ]);

  const subject = `Ny beställning: ${pkgName} (${order.amount} kr)`;
  const body = [
    'Ny betald beställning.',
    '',
    `Påse: ${pkgName}`,
    `Sorter: ${order.sorts}`,
    `Belopp: ${order.amount} kr`,
    '',
    `Namn: ${order.name}`,
    `E-post: ${order.email}`,
    `Telefon: ${order.phone}`,
    `Adress: ${order.street} ${order.street2}`.trim(),
    `Postnummer och ort: ${order.postcode} ${order.city}`.trim(),
    '',
    `Ordernummer (kund): ${order.orderNumber}`,
    `Stripe-id: ${order.orderId}`,
    'Betalningen syns även i Stripe-dashboarden.',
  ].join('\n');
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(), subject, body);

  return jsonOut_({ ok: true });
}
