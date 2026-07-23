(function () {
  'use strict';

  function setActiveLink() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-links a, .navbar-mobile-links a').forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === current);
    });
  }

  function init() {
    if (typeof document === 'undefined') return;
    setActiveLink();

    const toggleBtn = document.querySelector('#navbar-toggle-btn');
    const menu = document.querySelector('#navbar-mobile-menu');

    function setOpen(isOpen) {
      if (menu) menu.classList.toggle('is-open', isOpen);
      if (toggleBtn) {
        toggleBtn.classList.toggle('is-open', isOpen);
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
      }
      document.body.classList.toggle('nav-open', isOpen);
    }

    if (toggleBtn && menu) {
      toggleBtn.addEventListener('click', () => {
        setOpen(!menu.classList.contains('is-open'));
      });
      menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setOpen(false));
      });
      document.addEventListener('click', (event) => {
        if (!menu.classList.contains('is-open')) return;
        if (menu.contains(event.target) || toggleBtn.contains(event.target)) return;
        setOpen(false);
      });
    }
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu && menu.classList.contains('is-open')) {
        setOpen(false);
      }
    });

    const navbar = document.querySelector('.navbar');
    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('is-scrolled', window.scrollY > 40);
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
