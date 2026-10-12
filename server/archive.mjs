import process from 'node:process';
import path from 'node:path';
import fs from 'node:fs/promises';
import { Readable } from 'node:stream';
import { google } from 'googleapis';
import { getDriveConfig } from './config.mjs';

function sanitizeFilename(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'message';
}

export function buildArchiveFilename({ id, email }) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sender = sanitizeFilename(email.split('@')[0]);
  return `contact-${stamp}-${sender}-${id}.txt`;
}

export function buildArchiveText({ id, receivedAt, name, email, message, location, userAgent }) {
  const safeLocation = location ?? {};
  return [
    'SNAP SERVICE — ARCHIVE MESSAGE CONTACT',
    '======================================',
    `Identifiant : ${id}`,
    `Date UTC : ${receivedAt}`,
    '',
    'EXPÉDITEUR',
    `Nom : ${name || 'Non renseigné'}`,
    `E-mail : ${email}`,
    '',
    'DEMANDE',
    `Message (${message.length}/1000 caractères) :`,
    message,
    '',
    "LIEU D'INTERVENTION",
    `Libellé : ${safeLocation.label || 'Non renseigné'}`,
    `Latitude : ${safeLocation.lat ?? 'Non renseignée'}`,
    `Longitude : ${safeLocation.lng ?? 'Non renseignée'}`,
    `Place ID : ${safeLocation.placeId || 'Non renseigné'}`,
    '',
    'MÉTADONNÉES',
    `Navigateur : ${userAgent || 'Non renseigné'}`,
    ''
  ].join('\n');
}

function getOAuthClient() {
  const cfg = getDriveConfig();
  const auth = new google.auth.OAuth2(cfg.clientId, cfg.clientSecret);
  auth.setCredentials({ refresh_token: cfg.refreshToken });
  return { auth, cfg };
}

async function archiveToGoogleDrive(filename, content) {
  const { auth, cfg } = getOAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      mimeType: 'text/plain',
      parents: [cfg.driveFolderId]
    },
    media: {
      mimeType: 'text/plain; charset=utf-8',
      body: Readable.from([content])
    },
    fields: 'id,name,webViewLink'
  });

  return {
    driver: 'google-drive',
    id: response.data.id,
    name: response.data.name || filename,
    url: response.data.webViewLink || ''
  };
}

async function archiveLocally(filename, content) {
  const dir = path.resolve(process.env.LOCAL_ARCHIVE_DIR || './storage/messages');
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, content, 'utf8');
  return { driver: 'local', name: filename, path: filePath };
}

export async function archiveContactMessage(payload) {
  const filename = buildArchiveFilename(payload);
  const content = buildArchiveText(payload);
  const driver = (process.env.ARCHIVE_DRIVER || 'google-drive').trim().toLowerCase();

  if (driver === 'local') return archiveLocally(filename, content);
  if (driver === 'google-drive') return archiveToGoogleDrive(filename, content);

  throw new Error(`ARCHIVE_DRIVER invalide: ${driver}`);
}
