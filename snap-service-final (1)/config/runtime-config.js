/*
 * Sélectionne le fichier de configuration sans exposer de secret dans
 * index.html. Pour passer un domaine en production, ajouter son hostname
 * dans PRODUCTION_HOSTS ci-dessous.
 */
(function () {
  'use strict';

  var PRODUCTION_HOSTS = [
    // Exemple : 'snapservice.cm', 'www.snapservice.cm'
  ];

  var hostname = (window.location.hostname || '').toLowerCase();
  var isProduction = PRODUCTION_HOSTS.indexOf(hostname) !== -1;
  var forced = new URLSearchParams(window.location.search).get('config');
  if (forced === 'production') isProduction = true;
  if (forced === 'preview') isProduction = false;

  var src = isProduction ? 'config/config.production.js' : 'config/config.preview.js';
  document.write('<script src="' + src.replace(/"/g, '&quot;') + '"><' + '/script>');
})();
