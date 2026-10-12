/*
 * Snap Services — configuration publique de production.
 *
 * Ce fichier peut être modifié sans toucher à index.html.
 * NE METTRE AUCUN SECRET ICI : le fichier est envoyé au navigateur.
 */
window.SNAP_SITE_CONFIG = Object.freeze({
  environment: 'production',
  contact: Object.freeze({
    // Numéro WhatsApp : format international, sans +, espaces ni tirets. Modifiable ici à tout moment.
    whatsappNumber: '237650913505',
    // E-mail public affiché sur le site. Modifiable ici à tout moment.
    companyEmail: 'snapservices.pros@gmail.com',
    whatsappGreeting: 'Bonjour Snap Services, je souhaite vous contacter pour un besoin.',
    formEndpoint: '/api/send-email',
    maxMessageLength: 1000
  }),
  maps: Object.freeze({
    // Clé publique côté navigateur : à renseigner uniquement après création
    // d'une clé Google Maps restreinte au domaine de production.
    apiKey: '',
    language: 'fr',
    region: 'CM',
    componentRestrictions: { country: ['cm'] },
    defaultCenter: Object.freeze({ lat: 3.8480, lng: 11.5021 }),
    defaultZoom: 12
  }),
  social: Object.freeze({
    facebook: 'https://www.facebook.com/profile.php?id=61584956727022',
    instagram: 'https://www.instagram.com/snap.services.237'
  })
});
