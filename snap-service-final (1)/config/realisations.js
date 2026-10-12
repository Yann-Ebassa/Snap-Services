/*
 * ============================================================
 * SNAP SERVICES — Catalogue du portfolio
 * ============================================================
 * Ce fichier contient uniquement les données du portfolio.
 * La structure HTML et le rendu sont gérés par js/realisations.js.
 *
 * POUR AJOUTER UNE RÉALISATION :
 * 1. Déposer l'image dans images/realisations/.
 * 2. Dupliquer un objet ci-dessous.
 * 3. Modifier image, category, title, description et link.
 * 4. Enregistrer : la nouvelle carte apparaît automatiquement.
 *
 * Champs :
 * - image       : chemin de l'image depuis index.html
 * - alt         : description accessible de l'image
 * - category    : Design | Développement | Vidéo | ...
 * - title       : titre du projet
 * - description : description courte
 * - link        : URL du projet (laisser '' si aucune URL publique)
 * - linkLabel   : texte du bouton (optionnel)
 * ============================================================
 */
window.SNAP_REALISATIONS = [
  {
    image: 'images/realisations/design-01.jpg',
    alt: 'Projet de design graphique réalisé par Snap Servicess',
    category: 'Design',
    title: 'Flyer promotionnel — Boutique XYZ (exemple à remplacer)',
    description: 'Création d’un visuel promotionnel prêt à publier sur les réseaux sociaux.',
    link: '',
    linkLabel: 'Voir le projet'
  },
  {
    image: 'images/realisations/design-02.jpg',
    alt: 'Projet d’identité visuelle réalisé par Snap Servicess',
    category: 'Design',
    title: 'Identité visuelle — Projet XYZ (exemple à remplacer)',
    description: 'Composition graphique pensée pour renforcer la visibilité d’une activité.',
    link: '',
    linkLabel: 'Voir le projet'
  },
  {
    image: 'images/realisations/site-01.jpg',
    alt: 'Capture d’un site vitrine développé par Snap Servicess',
    category: 'Développement',
    title: 'Site vitrine — XYZ (exemple à remplacer)',
    description: 'Interface web responsive conçue pour présenter une activité et ses services.',
    link: '',
    linkLabel: 'Voir le site'
  },
  {
    image: 'images/realisations/site-02.jpg',
    alt: 'Capture d’une landing page développée par Snap Servicess',
    category: 'Développement',
    title: 'Landing page — XYZ (exemple à remplacer)',
    description: 'Page de présentation structurée pour mettre en avant une offre ou un événement.',
    link: '',
    linkLabel: 'Voir le site'
  },
  {
    image: 'images/realisations/video-01.jpg',
    alt: 'Miniature d’une vidéo promotionnelle montée par Snap Servicess',
    category: 'Vidéo',
    title: 'Vidéo promotionnelle — XYZ (exemple à remplacer)',
    description: 'Montage court destiné aux réseaux sociaux et à la mise en valeur d’une activité.',
    link: '',
    linkLabel: 'Voir la vidéo'
  },
  {
    image: 'images/realisations/video-02.jpg',
    alt: 'Miniature d’une vidéo événementielle montée par Snap Servicess',
    category: 'Vidéo',
    title: 'Vidéo événementielle — XYZ (exemple à remplacer)',
    description: 'Montage rythmé conçu pour présenter un événement et ses moments forts.',
    link: '',
    linkLabel: 'Voir la vidéo'
  }
];
