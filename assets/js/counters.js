(function () {
  'use strict';

  function parseNumeric(value) {
    const match = String(value).match(/^(-?\d+(?:\.\d+)?)(.*)$/);
    if (!match) return null;
    return { number: parseFloat(match[1]), suffix: match[2] };
  }

  function formatAtProgress(value, progress) {
    const parsed = parseNumeric(value);
    if (!parsed) return value;
    const clamped = Math.min(Math.max(progress, 0), 1);
    const current = parsed.number * clamped;
    const decimals = (parsed.number.toString().split('.')[1] || '').length;
    return `${current.toFixed(decimals)}${parsed.suffix}`;
  }

  function animateElement(el) {
    const target = el.getAttribute('data-count-target');
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = formatAtProgress(target, progress);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function init(selector) {
    if (typeof document === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateElement(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    elements.forEach((el) => observer.observe(el));
  }

  const api = { parseNumeric, formatAtProgress, init };

  if (typeof window !== 'undefined') {
    window.Giantfuse = window.Giantfuse || {};
    window.Giantfuse.Counters = api;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
