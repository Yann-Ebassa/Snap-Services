import http from 'node:http';
import process from 'node:process';
import { URL } from 'node:url';
import { google } from 'googleapis';

const clientId = process.env.GMAIL_CLIENT_ID?.trim();
const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();
if (!clientId || !clientSecret) {
  console.error('GMAIL_CLIENT_ID et GMAIL_CLIENT_SECRET sont requis.');
  process.exit(1);
}

const port = Number(process.env.GMAIL_OAUTH_PORT || 8787);
const redirectUri = `http://localhost:${port}/oauth2callback`;
const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/drive'
  ]
});

console.log('\n1) Ouvrez cette URL dans votre navigateur :\n');
console.log(authUrl);
console.log(`\n2) Autorisez le compte qui servira à envoyer les messages.`);
console.log(`3) Le navigateur doit revenir sur ${redirectUri}.\n`);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, redirectUri);
    if (url.pathname !== '/oauth2callback') {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const code = url.searchParams.get('code');
    if (!code) {
      res.writeHead(400);
      res.end('Code OAuth manquant.');
      return;
    }

    const { tokens } = await oauth2Client.getToken(code);
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Autorisation réussie. Vous pouvez fermer cet onglet.');

    console.log('\nGMAIL_REFRESH_TOKEN=');
    console.log(tokens.refresh_token || '(aucun refresh token retourné — réessayez avec prompt=consent)');
    console.log('\nAjoutez cette valeur dans les variables d’environnement Netlify.\n');
    server.close(() => process.exit(0));
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end('Erreur OAuth. Consultez le terminal.');
    server.close(() => process.exit(1));
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Callback OAuth en écoute sur ${redirectUri}`);
});
