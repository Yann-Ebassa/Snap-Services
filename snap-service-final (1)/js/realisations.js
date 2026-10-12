(function () {
  'use strict';

  /*
   * Rend le contenu du catalogue dans #realisations-grid.
   * Toute modification des projets se fait dans config/realisations.js.
   */

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function defaultLinkLabel(category) {
    var normalized = String(category || '').toLowerCase();
    if (normalized.indexOf('vid') !== -1) return 'Voir la vidéo';
    if (normalized.indexOf('développement') !== -1 || normalized.indexOf('developpement') !== -1) return 'Voir le site';
    return 'Voir le projet';
  }

  function renderRealisations() {
    var grid = document.getElementById('realisations-grid');
    if (!grid) return;

    var items = Array.isArray(window.SNAP_REALISATIONS)
      ? window.SNAP_REALISATIONS.filter(function (item) { return item && item.image; })
      : [];

    if (!items.length) {
      grid.innerHTML = '<p class="realisations-empty">Les réalisations seront bientôt disponibles.</p>';
      return;
    }

    grid.innerHTML = items.map(function (item, index) {
      var safeImage = escapeHtml(item.image);
      var safeAlt = escapeHtml(item.alt || item.title || 'Réalisation Snap Services');
      var safeCategory = escapeHtml(item.category || 'Réalisation');
      var safeTitle = escapeHtml(item.title || 'Réalisation');
      var safeDescription = escapeHtml(item.description || '');
      var link = String(item.link || '').trim();
      var body = '';
      var action = '';

      if (item.description) {
        body += '<p class="work-description">' + safeDescription + '</p>';
      }

      if (link) {
        var label = escapeHtml(item.linkLabel || defaultLinkLabel(item.category));
        action = '<a class="work-link" href="' + escapeHtml(link) + '" target="_blank" rel="noopener noreferrer">' + label + ' <span aria-hidden="true">→</span></a>';
      }

      return '<article class="work-card work-card--type-' + ((index % 3) + 1) + '">' +
        '<div class="work-thumb">' +
          '<img src="' + safeImage + '" alt="' + safeAlt + '" loading="lazy" decoding="async">' +
        '</div>' +
        '<div class="w-body work-body">' +
          '<div class="tag">' + safeCategory + '</div>' +
          '<h3>' + safeTitle + '</h3>' +
          body +
          action +
        '</div>' +
      '</article>';
    }).join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderRealisations);
  } else {
    renderRealisations();
  }
})();
