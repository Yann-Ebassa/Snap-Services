import crypto from 'node:crypto';
import { google } from 'googleapis';
import { archiveContactMessage } from './archive.mjs';
import { getAllowedOrigin, getGmailConfig } from './config.mjs';

function clean(value, maxLength) {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

function assertValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function headerSafe(value) {
  return String(value).replace(/[\r\n]/g, ' ').trim();
}

function encodeBase64Url(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function buildRawEmail({ cfg, name, email, message, location, id }) {
  const subjectLocation = location.label ? ` — ${location.label}` : '';
  const subject = headerSafe(`Nouvelle demande Snap Services${subjectLocation}`);
  const lines = [
    'Nouvelle demande depuis le formulaire Snap Services',
    '',
    `Identifiant : ${id}`,
    `Nom : ${name || 'Non renseigné'}`,
    `E-mail : ${email}`,
    `Lieu : ${location.label || 'Non renseigné'}`,
    `Latitude : ${location.lat ?? 'Non renseignée'}`,
    `Longitude : ${location.lng ?? 'Non renseignée'}`,
    `Place ID : ${location.placeId || 'Non renseigné'}`,
    '',
    'Message :',
    message,
    '',
    'Répondre directement au visiteur en utilisant l’adresse indiquée dans Reply-To.'
  ];
  const body = Buffer.from(lines.join('\n'), 'utf8').toString('base64');

  const raw = [
    `From: Snap Services <${headerSafe(cfg.sender)}>` ,
    `To: ${headerSafe(cfg.recipient)}`,
    `Reply-To: ${headerSafe(email)}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    body
  ].join('\r\n');

  return encodeBase64Url(raw);
}

export async function processContactRequest({ method, headers = {}, body }) {
  const requestOrigin = headers.origin || headers.Origin || '';
  const allowedOrigin = getAllowedOrigin(requestOrigin);
  const corsHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
  const makeResponse = (status, payload) => ({ status, headers: corsHeaders, payload });

  if (method === 'OPTIONS') return makeResponse(204, {});
  if (method !== 'POST') return makeResponse(405, { ok: false, error: 'Méthode non autorisée.' });
  if (allowedOrigin !== '*' && requestOrigin && requestOrigin !== allowedOrigin) {
    return makeResponse(403, { ok: false, error: 'Origine non autorisée.' });
  }

  try {
    const payload = typeof body === 'string' ? JSON.parse(body || '{}') : (body || {});
    if (clean(payload.website, 120)) {
      return makeResponse(200, { ok: true, message: 'Message reçu.' });
    }

    const name = clean(payload.name, 120);
    const email = clean(payload.email, 254).toLowerCase();
    const rawMessage = String(payload.message ?? '').trim();
    if (rawMessage.length > 1000) {
      return makeResponse(422, { ok: false, error: 'Le message doit contenir entre 1 et 1000 caractères.' });
    }
    const message = clean(rawMessage, 1000);
    const location = {
      label: clean(payload.location?.label, 400),
      lat: Number.isFinite(Number(payload.location?.lat)) ? Number(payload.location.lat) : null,
      lng: Number.isFinite(Number(payload.location?.lng)) ? Number(payload.location.lng) : null,
      placeId: clean(payload.location?.placeId, 200)
    };

    if (!assertValidEmail(email)) return makeResponse(422, { ok: false, error: 'Adresse e-mail invalide.' });
    if (!message || message.length > 1000) {
      return makeResponse(422, { ok: false, error: 'Le message doit contenir entre 1 et 1000 caractères.' });
    }

    const id = crypto.randomUUID();
    const receivedAt = new Date().toISOString();
    const userAgent = clean(headers['user-agent'] || headers['User-Agent'], 500);
    const archivePayload = { id, receivedAt, name, email, message, location, userAgent };

    // On archive d'abord afin de ne pas perdre la demande en cas d'échec Gmail.
    const archive = await archiveContactMessage(archivePayload);

    const cfg = getGmailConfig();
    const auth = new google.auth.OAuth2(cfg.clientId, cfg.clientSecret);
    auth.setCredentials({ refresh_token: cfg.refreshToken });
    const gmail = google.gmail({ version: 'v1', auth });
    const raw = buildRawEmail({ cfg, name, email, message, location, id });
    const gmailResult = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });

    return makeResponse(200, {
      ok: true,
      message: 'Votre message a bien été envoyé.',
      reference: id,
      archive: { driver: archive.driver, name: archive.name },
      mail: { id: gmailResult.data.id || null }
    });
  } catch (error) {
    console.error('[snap-service/contact]', error);
    return makeResponse(500, {
      ok: false,
      error: 'Le message n’a pas pu être envoyé pour le moment. Utilisez WhatsApp si le besoin est urgent.'
    });
  }
}
