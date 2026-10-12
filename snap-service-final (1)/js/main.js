/*
 * 1) Application immédiate du thème mémorisé, AVANT le rendu visible.
 *    Placé en tout début de <script> (hors DOMContentLoaded) pour éviter
 *    un "flash" du thème clair avant bascule vers le sombre mémorisé.
 *    Si rien n'est mémorisé, on ne touche à rien : c'est la media query
 *    prefers-color-scheme (dans le <style>) qui prend le relais.
 */
(function(){
  try{
    var stored = localStorage.getItem('snap-theme');
    if(stored === 'light' || stored === 'dark'){
      document.documentElement.setAttribute('data-theme', stored);
    }
  }catch(e){
    /* localStorage indisponible (navigation privée, cookies bloqués...) :
       on continue sans mémorisation, la page reste fonctionnelle. */
  }
})();

document.addEventListener('DOMContentLoaded', function(){

  /* 2) Bouton soleil/lune : bascule et mémorise le thème choisi. */
  var btn = document.getElementById('theme-toggle');
  if(btn){
    btn.addEventListener('click', function(){
      var root = document.documentElement;
      var current = root.getAttribute('data-theme');
      var isDark;
      if(current === 'dark'){ isDark = true; }
      else if(current === 'light'){ isDark = false; }
      else { isDark = window.matchMedia('(prefers-color-scheme: dark)').matches; }
      var next = isDark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try{ localStorage.setItem('snap-theme', next); }catch(e){}
    });
  }

  /* 3) Menu mobile (hamburger) : ouverture/fermeture + fermeture
        automatique au clic sur un lien ou au repassage en format desktop. */
  var menuBtn = document.getElementById('menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  if(menuBtn && mobileMenu){
    var burgerIcon = menuBtn.querySelector('.icon-burger');
    var closeIcon = menuBtn.querySelector('.icon-close');
    var setMenu = function(open){
      mobileMenu.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if(burgerIcon) burgerIcon.classList.toggle('is-hidden', open);
      if(closeIcon) closeIcon.classList.toggle('is-visible', open);
    };
    menuBtn.addEventListener('click', function(){
      setMenu(!mobileMenu.classList.contains('open'));
    });
    // Un clic sur une ancre referme le menu avant le défilement.
    mobileMenu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ setMenu(false); });
    });
    // Sécurité : si la fenêtre est agrandie au-delà du point de rupture
    // mobile alors que le menu est ouvert, on le referme proprement.
    window.addEventListener('resize', function(){
      if(window.innerWidth > 860) setMenu(false);
    });
  }
});

