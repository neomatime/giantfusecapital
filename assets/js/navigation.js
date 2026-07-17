(function () {
  'use strict';

  function setActiveLink() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-links a, .navbar-mobile-menu a').forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === current);
    });
  }

  function init() {
    if (typeof document === 'undefined') return;
    setActiveLink();
    const toggleBtn = document.querySelector('#navbar-toggle-btn');
    const menu = document.querySelector('#navbar-mobile-menu');
    if (toggleBtn && menu) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('is-open');
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
      });
    }
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('is-scrolled', window.scrollY > 24);
      });
    }
  }

  const api = { init, setActiveLink };

  if (typeof window !== 'undefined') {
    window.Giantfuse = window.Giantfuse || {};
    window.Giantfuse.Nav = api;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
