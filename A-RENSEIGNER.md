# Snap Services — champs modifiables

## Contact (modifiable à tout moment)
Fichier : `config/config.production.js` (et `config/config.preview.js` pour l'aperçu)
- `whatsappNumber` : format international, sans +, espaces ni tirets. Actuel : 237650913505
- `companyEmail` : e-mail public. Actuel : snapservices.pros@gmail.com
- `whatsappGreeting` : message pré-rempli sur WhatsApp
- `social.facebook` / `social.instagram` : liens des réseaux (le lien Senvato est dans `index.html`)

Les boutons WhatsApp et le lien e-mail du site se mettent à jour automatiquement ; aucun autre fichier à toucher.

## Portfolio
`config/realisations.js` + images dans `images/realisations/`. Les 6 projets « XYZ » sont des exemples à remplacer par de vrais projets.

## À faire avant la mise en ligne
- Remplacer `https://snapservice.example/` par le vrai domaine dans `index.html` (canonical, og:url, og:image, JSON-LD), `sitemap.xml` et `robots.txt`.
- Formulaire : renseigner les variables serveur de `.env.example` (Gmail OAuth, destinataire, dossier Drive) dans l'environnement Netlify, jamais dans un fichier public. Sans elles, le formulaire ne peut pas envoyer ; WhatsApp reste utilisable.
- Clé Google Maps (facultatif) : `maps.apiKey` dans la config.
