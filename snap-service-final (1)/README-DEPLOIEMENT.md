# Snap Services — Contact, Google Maps, Gmail et archivage

Cette version conserve `index.html` comme page principale, tout en séparant les paramètres publics et les secrets serveur.

## 1. Configuration publique

Les coordonnées modifiables sans toucher au HTML sont dans :

- `config/config.production.js` — production
- `config/config.preview.js` — aperçu / développement
- `config/runtime-config.js` — choisit le fichier selon le hostname

Renseigner notamment `contact.whatsappNumber` et `contact.companyEmail` au format réel. Le numéro WhatsApp doit être au format international sans `+`, par exemple `2376XXXXXXXX`. Le lien cliquable est ensuite construit automatiquement avec `https://wa.me/`.

Pour un domaine de production, ajouter son hostname dans `PRODUCTION_HOSTS` dans `config/runtime-config.js`. Pendant l’aperçu, `?config=preview` ou `?config=production` permet de forcer le fichier voulu.

## 2. WhatsApp

Le besoin du bouton du site est un lien Click-to-Chat vers le numéro de service. Cela ne nécessite pas de jeton WhatsApp Cloud API : le bouton ouvre directement WhatsApp avec un message prérempli. Le numéro n’est pas codé dans `index.html`, donc un changement de numéro est centralisé dans le fichier de configuration.

Une future automatisation WhatsApp Cloud API peut être ajoutée côté serveur sans exposer le jeton au navigateur.

## 3. Google Maps

La zone de lieu permet :

- saisie/recherche d’un lieu via Place Autocomplete (New) ;
- sélection d’un résultat ;
- clic directement sur la carte ;
- géolocalisation du navigateur via « Me localiser » ;
- conservation du libellé, latitude, longitude et `placeId` dans le formulaire.

Aucune fausse clé n’est fournie. Tant que `maps.apiKey` est vide, l’interface garde un champ de lieu manuel et affiche un message de configuration au lieu de casser le formulaire.

Pour la production, créer une clé Google Maps Platform restreinte au domaine et n’activer que les API nécessaires, puis l’inscrire dans `config/config.production.js`. Google documente le chargement dynamique de Maps JavaScript et le nouveau widget Place Autocomplete. Voir la documentation officielle : https://developers.google.com/maps/documentation/javascript/load-maps-js-api et https://developers.google.com/maps/documentation/javascript/place-autocomplete-new

## 4. Gmail — envoi direct

Le formulaire n’utilise pas `mailto:`. Il appelle `/api/send-email`, qui exécute une fonction Netlify.

La fonction :

1. valide l’adresse e-mail et limite le message à 1000 caractères ;
2. conserve les données utiles de la demande ;
3. archive la demande en `.txt` ;
4. envoie le courriel avec Gmail API ;
5. renseigne `Reply-To` avec l’adresse du visiteur afin que l’entreprise puisse répondre directement à cette personne.

L’API Gmail demande OAuth 2.0 et l’envoi utilise `users.messages.send` avec un message MIME encodé en base64URL.

### Variables Netlify à définir

Voir `.env.example` :

`GMAIL_CLIENT_ID`
`GMAIL_CLIENT_SECRET`
`GMAIL_REFRESH_TOKEN`
`GMAIL_SENDER`
`GMAIL_RECIPIENT`
`GOOGLE_DRIVE_FOLDER_ID`
`ALLOWED_ORIGIN`
`ARCHIVE_DRIVER`

Ne jamais mettre ces valeurs dans `config/*.js`.

### Générer le refresh token

1. Créer un projet dans Google Cloud.
2. Activer Gmail API et Google Drive API.
3. Configurer l’écran de consentement OAuth.
4. Créer un client OAuth 2.0 utilisable localement et récupérer son Client ID / Client Secret.
5. Installer les dépendances avec `npm install`.
6. Lancer : `GMAIL_CLIENT_ID="..." GMAIL_CLIENT_SECRET="..." npm run oauth:gmail`
7. Ouvrir l’URL affichée, autoriser le compte Gmail/Workspace qui enverra les messages, puis copier le `GMAIL_REFRESH_TOKEN` retourné dans Netlify.

Pour une configuration Workspace plus stricte, utiliser le type de clientèle OAuth adapté à l’organisation et les règles de consentement de Google.

## 5. Archivage `.txt`

### Local

`ARCHIVE_DRIVER=local` écrit dans `storage/messages/`. Ce mode est destiné au développement / aux tests. Il ne doit pas être considéré comme un stockage persistant d’une fonction serverless.

### Production

`ARCHIVE_DRIVER=google-drive` crée un fichier texte par demande dans le dossier dont l’ID est `GOOGLE_DRIVE_FOLDER_ID`.

Chaque fichier contient notamment :

- identifiant de demande ;
- date UTC ;
- nom éventuel ;
- adresse e-mail du visiteur ;
- message ;
- lieu saisi ou sélectionné ;
- latitude / longitude ;
- `placeId` ;
- User-Agent pour le diagnostic.

Le nom du fichier ressemble à `contact-2026-09-29T...-prenom-uuid.txt`.

L’API Drive accepte l’upload multipart/media de petits fichiers, ce qui convient aux archives texte générées ici.

## 6. Limites et pistes d’évolution

Le filesystem d’une Function n’est pas adapté comme archive de production : il faut un stockage externe persistant. Dans cette implémentation, Google Drive joue ce rôle et reste consultable sans créer une base de données supplémentaire.

Pour une version plus évoluée, on peut ajouter une base de données (Supabase/Postgres/Firestore), une console d’administration des demandes, un statut `nouveau / traité / archivé`, une recherche, une limitation anti-abus persistante et des notifications supplémentaires.

## 7. Déploiement Netlify

Le projet contient `netlify.toml` et expose la fonction en :

`/api/send-email`

Commandes :

`npm install`
`npm run test:syntax`
`npm run dev`

Puis renseigner les variables d’environnement dans Netlify et redéployer.

## 8. Aperçu sans clés

Le site continue de s’afficher même sans clé Maps. Le formulaire permet toujours de renseigner du texte libre pour le lieu, et les boutons de contact signalent proprement quand le numéro ou l’e-mail n’ont pas encore été configurés.

## 9. Vercel (optionnel)

Un adaptateur `api/send-email.js` est aussi inclus pour Vercel. Il réutilise exactement le même service serveur et les mêmes variables d’environnement. Sur Vercel, conserver l’URL `/api/send-email` utilisée par le formulaire.

## Gestion des réalisations

La section « Nos réalisations » est alimentée par `config/realisations.js`, puis rendue automatiquement par `js/realisations.js`. Le HTML, le CSS et le JavaScript principal sont séparés : `index.html` contient la structure, `css/styles.css` contient les styles et `js/main.js` contient les interactions globales.
Les images sont stockées dans `images/realisations/`.

Pour ajouter un projet :
1. Déposer l'image dans `images/realisations/`.
2. Ajouter un objet dans le tableau `window.SNAP_REALISATIONS` de `config/realisations.js`.
3. Renseigner `image`, `alt`, `category`, `title`, `description`, et éventuellement `link` + `linkLabel`.
4. Recharger le site. `index.html`, `css/styles.css` et `js/realisations.js` n'ont pas besoin d'être modifiés.
