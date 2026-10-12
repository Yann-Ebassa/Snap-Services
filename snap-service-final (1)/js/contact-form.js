(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function getConfig() {
    return window.SNAP_SITE_CONFIG || {
      contact: { whatsappNumber: '', companyEmail: '', formEndpoint: '/api/send-email', maxMessageLength: 1000 },
      maps: { apiKey: '', language: 'fr', region: 'CM', defaultCenter: { lat: 3.8480, lng: 11.5021 }, defaultZoom: 12 }
    };
  }

  function normalizeWhatsapp(number) {
    return String(number || '').replace(/\D/g, '');
  }

  function setStatus(element, text, type) {
    if (!element) return;
    element.textContent = text || '';
    element.className = 'contact-status' + (type ? ' ' + type : '');
  }

  function setDisabledLink(anchor, label, message) {
    anchor.classList.add('disabled');
    anchor.setAttribute('aria-disabled', 'true');
    anchor.setAttribute('href', '#contact');
    anchor.dataset.disabledMessage = message;
    var labelEl = anchor.querySelector('[data-whatsapp-number]');
    if (labelEl && label) labelEl.textContent = label;
  }

  function configureContactLinks(config) {
    var phone = normalizeWhatsapp(config.contact && config.contact.whatsappNumber);
    var email = String(config.contact && config.contact.companyEmail || '').trim();
    var greeting = String(config.contact && config.contact.whatsappGreeting || 'Bonjour Snap Services, je souhaite vous contacter pour un besoin.');

    document.querySelectorAll('[data-whatsapp-link]').forEach(function (anchor) {
      if (phone) {
        anchor.classList.remove('disabled');
        anchor.removeAttribute('aria-disabled');
        anchor.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(greeting);
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        var labelEl = anchor.querySelector('[data-whatsapp-number]');
        if (labelEl) labelEl.textContent = '+' + phone;
      } else {
        setDisabledLink(anchor, 'Numéro de service à configurer', 'Le numéro WhatsApp n’est pas encore configuré.');
      }
    });

    if (email) {
      var emailLink = document.getElementById('company-email-link');
      var emailLabel = document.getElementById('company-email-label');
      if (emailLink) {
        emailLink.href = 'mailto:' + email;
        emailLink.classList.remove('disabled');
        emailLink.removeAttribute('aria-disabled');
      }
      if (emailLabel) emailLabel.textContent = email;
    } else {
      var emailLinkFallback = document.getElementById('company-email-link');
      var emailLabelFallback = document.getElementById('company-email-label');
      if (emailLinkFallback) setDisabledLink(emailLinkFallback, 'Adresse à configurer', 'L’adresse e-mail de l’entreprise n’est pas encore configurée.');
      if (emailLabelFallback) emailLabelFallback.textContent = 'Adresse de l’entreprise à configurer';
    }

    return { phone: phone, email: email };
  }

  function loadGoogleMaps(apiKey, language, region) {
    if (!apiKey) return Promise.reject(new Error('NO_MAPS_KEY'));
    if (window.google && window.google.maps) return Promise.resolve(window.google.maps);

    return new Promise(function (resolve, reject) {
      var callbackName = '__snapGoogleMapsReady_' + Date.now();
      var script = document.createElement('script');
      var timeout = window.setTimeout(function () {
        delete window[callbackName];
        reject(new Error('MAPS_TIMEOUT'));
      }, 15000);

      window[callbackName] = function () {
        window.clearTimeout(timeout);
        delete window[callbackName];
        resolve(window.google.maps);
      };

      script.async = true;
      script.defer = true;
      script.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(apiKey)
        + '&loading=async&libraries=places&language=' + encodeURIComponent(language || 'fr')
        + '&region=' + encodeURIComponent(region || 'CM')
        + '&callback=' + encodeURIComponent(callbackName);
      script.onerror = function () {
        window.clearTimeout(timeout);
        delete window[callbackName];
        reject(new Error('MAPS_LOAD_ERROR'));
      };
      document.head.appendChild(script);
    });
  }

  function setupMaps(config, elements) {
    var key = config.maps && String(config.maps.apiKey || '').trim();
    var mapContainer = elements.map;
    var mapPlaceholder = document.createElement('div');
    mapPlaceholder.className = 'map-placeholder';
    mapPlaceholder.textContent = 'Google Maps est désactivé tant qu’une clé publique valide n’est pas renseignée dans la configuration.';

    if (!key) {
      mapContainer.replaceWith(mapPlaceholder);
      elements.map = mapPlaceholder;
      elements.useLocation.disabled = true;
      return Promise.resolve(null);
    }

    return loadGoogleMaps(key, config.maps.language, config.maps.region).then(async function () {
      var mapsApi = window.google.maps;
      var mapsLib = await mapsApi.importLibrary('maps');
      var placesLib = await mapsApi.importLibrary('places');
      var center = config.maps.defaultCenter || { lat: 3.8480, lng: 11.5021 };
      var map = new mapsLib.Map(mapContainer, {
        center: center,
        zoom: Number(config.maps.defaultZoom || 12),
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false
      });

      var marker = new mapsApi.Marker({ map: map, position: center, draggable: true, visible: false });
      var geocoder = new mapsApi.Geocoder();

      function reverseGeocode(latLng, fallbackLabel) {
        return new Promise(function (resolve) {
          geocoder.geocode({ location: latLng }, function (results, status) {
            if (status === 'OK' && results && results[0]) resolve(results[0].formatted_address);
            else resolve(fallbackLabel || 'Position sélectionnée sur la carte');
          });
        });
      }

      function saveSelectedLocation(data) {
        var location = data || {};
        elements.locationLabel.value = location.label || '';
        elements.locationLat.value = Number.isFinite(Number(location.lat)) ? Number(location.lat).toFixed(7) : '';
        elements.locationLng.value = Number.isFinite(Number(location.lng)) ? Number(location.lng).toFixed(7) : '';
        elements.locationPlaceId.value = location.placeId || '';
        elements.selectedLocation.textContent = location.label
          ? 'Lieu sélectionné : ' + location.label + (location.lat != null && location.lng != null ? ` (${Number(location.lat).toFixed(5)}, ${Number(location.lng).toFixed(5)})` : '')
          : 'Aucun lieu précis sélectionné.';
      }

      async function setMapLocation(lat, lng, label, placeId) {
        var position = { lat: Number(lat), lng: Number(lng) };
        map.panTo(position);
        map.setZoom(Math.max(map.getZoom() || 12, 14));
        marker.setPosition(position);
        marker.setVisible(true);
        var resolvedLabel = label || await reverseGeocode(position);
        saveSelectedLocation({ label: resolvedLabel, lat: position.lat, lng: position.lng, placeId: placeId || '' });
      }

      // Click sur la carte = sélection directe du lieu.
      map.addListener('click', function (event) {
        if (!event.latLng) return;
        setMapLocation(event.latLng.lat(), event.latLng.lng());
      });

      // Déplacement manuel du marqueur = nouvelle position.
      marker.addListener('dragend', function (event) {
        if (!event.latLng) return;
        setMapLocation(event.latLng.lat(), event.latLng.lng());
      });

      // Widget Places (New) : l’utilisateur peut taper un lieu ou une adresse.
      var widget = new placesLib.PlaceAutocompleteElement();
      widget.placeholder = 'Ville, quartier, adresse…';
      widget.setAttribute('aria-label', 'Rechercher un lieu d’intervention');
      try {
        if (config.maps.componentRestrictions) widget.componentRestrictions = config.maps.componentRestrictions;
      } catch (e) {
        // Les restrictions ne sont qu’un confort : la recherche reste disponible sans elles.
      }
      elements.locationWidget.replaceChildren(widget);
      elements.locationFallback.classList.add('is-hidden');

      widget.addEventListener('gmp-select', async function (event) {
        try {
          var placePrediction = event.placePrediction;
          if (!placePrediction) return;
          var place = placePrediction.toPlace();
          await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location', 'id'] });
          if (!place.location) return;
          var label = place.formattedAddress || place.displayName || 'Lieu sélectionné';
          await setMapLocation(place.location.lat(), place.location.lng(), label, place.id || '');
        } catch (error) {
          console.error('[Snap Maps] sélection du lieu', error);
        }
      });

      elements.useLocation.disabled = false;
      elements.useLocation.addEventListener('click', function () {
        if (!navigator.geolocation) {
          elements.selectedLocation.textContent = 'La géolocalisation n’est pas disponible sur cet appareil.';
          return;
        }
        elements.useLocation.disabled = true;
        elements.useLocation.textContent = 'Localisation…';
        navigator.geolocation.getCurrentPosition(async function (position) {
          try {
            var label = await reverseGeocode({ lat: position.coords.latitude, lng: position.coords.longitude }, 'Ma position actuelle');
            await setMapLocation(position.coords.latitude, position.coords.longitude, label);
          } catch (error) {
            console.error('[Snap Maps] géolocalisation', error);
          } finally {
            elements.useLocation.disabled = false;
            elements.useLocation.textContent = 'Me localiser';
          }
        }, function () {
          elements.selectedLocation.textContent = 'Impossible de récupérer votre position. Vérifiez l’autorisation de localisation du navigateur.';
          elements.useLocation.disabled = false;
          elements.useLocation.textContent = 'Me localiser';
        }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
      });

      return { map: map, marker: marker, saveSelectedLocation: saveSelectedLocation };
    }).catch(function (error) {
      console.warn('[Snap Maps] API indisponible', error);
      elements.map.textContent = 'Google Maps n’a pas pu être chargé. Le lieu peut toujours être saisi manuellement.';
      elements.useLocation.disabled = true;
      elements.locationWidget.replaceChildren();
      return null;
    });
  }

  function setupContactForm(config) {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var elements = {
      name: document.getElementById('contact-name'),
      email: document.getElementById('contact-email'),
      message: document.getElementById('contact-message'),
      count: document.getElementById('contact-char-count'),
      status: document.getElementById('contact-status'),
      submit: document.getElementById('contact-submit'),
      website: document.getElementById('contact-website'),
      locationWidget: document.getElementById('contact-location-widget'),
      locationFallback: document.getElementById('contact-location-fallback'),
      map: document.getElementById('contact-map'),
      useLocation: document.getElementById('contact-use-location'),
      selectedLocation: document.getElementById('contact-selected-location'),
      locationLabel: document.getElementById('contact-location-label'),
      locationLat: document.getElementById('contact-location-lat'),
      locationLng: document.getElementById('contact-location-lng'),
      locationPlaceId: document.getElementById('contact-location-place-id')
    };

    var max = Number(config.contact && config.contact.maxMessageLength || 1000);
    elements.message.maxLength = max;

    function updateCount() {
      elements.count.textContent = elements.message.value.length + ' / ' + max;
    }
    elements.message.addEventListener('input', updateCount);
    updateCount();

    elements.locationFallback.addEventListener('input', function () {
      if (!elements.locationLabel.value || elements.locationLabel.value !== elements.locationFallback.value) {
        elements.locationLabel.value = elements.locationFallback.value.trim().slice(0, 400);
        elements.locationLat.value = '';
        elements.locationLng.value = '';
        elements.locationPlaceId.value = '';
        elements.selectedLocation.textContent = elements.locationFallback.value.trim()
          ? 'Lieu saisi : ' + elements.locationFallback.value.trim()
          : 'Aucun lieu précis sélectionné.';
      }
    });

    setupMaps(config, elements);

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      setStatus(elements.status, '', '');

      var endpoint = String(config.contact && config.contact.formEndpoint || '/api/send-email');
      var name = elements.name.value.trim().slice(0, 120);
      var email = elements.email.value.trim().toLowerCase();
      var message = elements.message.value.trim();
      var fallbackLocation = elements.locationFallback.value.trim().slice(0, 400);
      var locationLabel = elements.locationLabel.value.trim().slice(0, 400) || fallbackLocation;
      var website = elements.website.value.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus(elements.status, 'Veuillez renseigner une adresse e-mail valide.', 'error');
        elements.email.focus();
        return;
      }
      if (!message || message.length > max) {
        setStatus(elements.status, 'Veuillez décrire votre besoin en 1000 caractères maximum.', 'error');
        elements.message.focus();
        return;
      }

      elements.submit.disabled = true;
      elements.submit.textContent = 'Envoi…';
      setStatus(elements.status, 'Envoi et archivage de votre demande…', '');

      try {
        var response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            name: name,
            email: email,
            message: message,
            website: website,
            location: {
              label: locationLabel,
              lat: elements.locationLat.value || null,
              lng: elements.locationLng.value || null,
              placeId: elements.locationPlaceId.value || ''
            }
          })
        });

        var result = await response.json().catch(function () { return {}; });
        if (!response.ok || !result.ok) throw new Error(result.error || 'Erreur serveur');

        setStatus(elements.status, 'Message envoyé. Référence : ' + (result.reference || 'OK') + '.', 'success');
        form.reset();
        var placeWidget = elements.locationWidget.querySelector('gmp-place-autocomplete');
        if (placeWidget) {
          try { placeWidget.value = ''; } catch (e) {}
        }
        elements.locationLabel.value = '';
        elements.locationLat.value = '';
        elements.locationLng.value = '';
        elements.locationPlaceId.value = '';
        elements.selectedLocation.textContent = 'Aucun lieu précis sélectionné.';
        updateCount();
      } catch (error) {
        console.error('[Snap Contact]', error);
        setStatus(elements.status, 'Le message n’a pas pu être envoyé. Utilisez WhatsApp si la demande est urgente.', 'error');
      } finally {
        elements.submit.disabled = false;
        elements.submit.textContent = 'Envoyer le message';
      }
    });
  }

  ready(function () {
    var config = getConfig();
    var links = configureContactLinks(config);

    document.querySelectorAll('[data-whatsapp-link].disabled').forEach(function (anchor) {
      anchor.addEventListener('click', function (event) {
        event.preventDefault();
        window.alert(anchor.dataset.disabledMessage || 'Le contact WhatsApp n’est pas encore configuré.');
      });
    });

    var emailLink = document.getElementById('company-email-link');
    if (emailLink && emailLink.classList.contains('disabled')) {
      emailLink.addEventListener('click', function (event) {
        event.preventDefault();
        window.alert('L’adresse e-mail de l’entreprise n’est pas encore configurée.');
      });
    }

    setupContactForm(config);

    // Expose uniquement la configuration publique nécessaire à d’éventuelles pages complémentaires.
    window.SnapContact = Object.freeze({
      companyEmail: links.email,
      whatsappNumber: links.phone,
      environment: config.environment || 'unknown'
    });
  });
})();
