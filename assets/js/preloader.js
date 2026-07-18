(function () {
  'use strict';

  if (typeof document === 'undefined') return;

  const preloader = document.querySelector('#preloader');
  if (!preloader) return;

  const MIN_VISIBLE_MS = 600;
  const MAX_WAIT_MS = 5000;
  const startTime = performance.now();
  let hidden = false;

  function hide() {
    if (hidden) return;
    hidden = true;
    const elapsed = performance.now() - startTime;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    setTimeout(() => {
      preloader.classList.add('is-hidden');
      const remove = () => {
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
      };
      preloader.addEventListener('transitionend', remove, { once: true });
      setTimeout(remove, 500);
    }, remaining);
  }

  window.addEventListener('load', hide, { once: true });
  setTimeout(hide, MAX_WAIT_MS);
})();
