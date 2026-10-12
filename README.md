# Snap-Services
Landing page one-page en HTML/CSS/JS, avec configuration publique séparée et fonctions serverless optionnelles pour le contact. Thème clair/sombre, responsive, SEO de base en place.

## Contenu du dossier

- `index.html` — la structure HTML de la page
- `css/styles.css` — tous les styles du site, séparés du HTML
- `js/main.js` — thème clair/sombre et menu mobile
- `js/realisations.js` — rendu dynamique du portfolio
- `images/logo.jpg` — logo Snap Services, appelé depuis le CSS (`--logo-url`) partout où il apparaît : nav, hero, section « À propos », pied de page
- `images/og-image.jpg` — image de partage (1200×630px) pour les aperçus WhatsApp/Facebook/LinkedIn, générée à partir du logo et de la palette de marque
- `robots.txt` — autorise l'indexation, pointe vers le sitemap
- `sitemap.xml` — plan du site (une seule URL, landing page one-page)
- `README.md` — présentation du projet
- `README-DEPLOIEMENT.md` — configuration Gmail/Drive/Maps, variables serveur et déploiement serverless
- `config/` — configurations publiques preview/production et sélection d’environnement
- `js/contact-form.js` — logique du formulaire, WhatsApp et Google Maps
- `config/realisations.js` — catalogue modifiable des réalisations
- `server/` — logique serveur commune : Gmail, validation et archivage `.txt`
- `netlify/functions/send-contact-email.mjs` — fonction Netlify `/api/send-email`
- `api/send-email.js` — adaptateur Vercel pour le même endpoint
- `.env.example` — modèle des variables serveur

Toutes les images du site vivent dans `images/`. Pour changer le logo,
il suffit de remplacer `images/logo.jpg` par un autre fichier du même nom.

### Portfolio / réalisations

La section « Nos réalisations » n'est plus codée en dur dans `index.html`.
Le HTML contient uniquement le conteneur du portfolio ; les cartes sont
générées par `js/realisations.js` à partir de `config/realisations.js`.

Structure prévue :

```text
images/
└── realisations/
    ├── design-01.jpg
    ├── design-02.jpg
    ├── site-01.jpg
    ├── site-02.jpg
    ├── video-01.jpg
    └── video-02.jpg
```

Pour ajouter un projet, déposer son image dans `images/realisations/`,
puis ajouter un objet dans `config/realisations.js`. Les champs `link` et
`linkLabel` permettent respectivement d'ajouter l'URL du projet et le texte
du bouton (« Voir le projet », « Voir le site », « Voir la vidéo », etc.).
`index.html`, `css/styles.css` et `js/realisations.js` n'ont normalement
pas besoin d'être modifiés pour ajouter une nouvelle réalisation.

## Mise en ligne

Le frontend n'a pas d'étape de build obligatoire. Pour activer Gmail, Google Drive et l'endpoint `/api/send-email`, il faut utiliser l'adaptateur serverless Netlify ou Vercel décrit dans `README-DEPLOIEMENT.md`. Une mise en ligne purement statique conserve l'interface, mais ne peut pas envoyer les formulaires via Gmail.

Quelques options simples pour l'hébergement :

- **Netlify / Vercel** : glisser-déposer le dossier sur leur interface
- **GitHub Pages** : pousser le dossier dans un dépôt, activer Pages
- **Hébergement mutualisé classique** (OVH, o2switch...) : envoyer les
  fichiers dans le dossier racine du site via FTP/SFTP

## Configuration de contact et déploiement

La zone Contact est maintenant interactive : WhatsApp, e-mail, formulaire et lieu d’intervention. Les coordonnées publiques sont séparées dans `config/config.production.js` et `config/config.preview.js`; `index.html` ne contient pas les coordonnées de service.

Le formulaire collecte le nom (facultatif), l’adresse e-mail, un besoin de 1000 caractères maximum et, si renseigné, le lieu avec libellé/coordonnées/Place ID. L’envoi réel passe par la fonction serverless `/api/send-email`, qui archive d’abord la demande au format `.txt`, puis l’envoie via Gmail API avec l’e-mail du visiteur en `Reply-To`.

La procédure complète et les variables d’environnement sont documentées dans `README-DEPLOIEMENT.md`. Aucun secret Gmail/Drive ne doit être placé dans les fichiers `config/*.js`.

## Après la mise en ligne

- Soumettre `sitemap.xml` dans Google Search Console
- Vérifier le rendu du partage sur WhatsApp/Facebook/LinkedIn (og:image)
- Tester le bouton de thème clair/sombre et le menu mobile sur un vrai
  téléphone
