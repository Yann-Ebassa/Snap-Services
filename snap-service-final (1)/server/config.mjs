import process from 'node:process';

const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Variable d'environnement manquante: ${name}`);
  return value;
};

export function getGmailConfig() {
  return {
    clientId: required('GMAIL_CLIENT_ID'),
    clientSecret: required('GMAIL_CLIENT_SECRET'),
    refreshToken: required('GMAIL_REFRESH_TOKEN'),
    sender: required('GMAIL_SENDER'),
    recipient: required('GMAIL_RECIPIENT')
  };
}

export function getDriveConfig() {
  return {
    clientId: required('GMAIL_CLIENT_ID'),
    clientSecret: required('GMAIL_CLIENT_SECRET'),
    refreshToken: required('GMAIL_REFRESH_TOKEN'),
    driveFolderId: required('GOOGLE_DRIVE_FOLDER_ID')
  };
}

export function getAllowedOrigin(requestOrigin = '') {
  const configured = process.env.ALLOWED_ORIGIN?.trim();
  if (configured) return configured;
  // Netlify expose l'URL du site au runtime des Functions.
  if (process.env.URL) return process.env.URL.trim();
  return requestOrigin || '*';
}
