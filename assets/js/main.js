(function () {
  'use strict';

  const ICONS = {
    bank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10 L12 4 L21 10 Z"/><line x1="5" y1="10" x2="5" y2="19"/><line x1="9.5" y1="10" x2="9.5" y2="19"/><line x1="14.5" y1="10" x2="14.5" y2="19"/><line x1="19" y1="10" x2="19" y2="19"/><line x1="3" y1="21" x2="21" y2="21"/></svg>',
    people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><circle cx="17" cy="9" r="2.3"/><path d="M15.8 14.2c2.6.2 4.7 2.1 4.7 4.8"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L20 6 V11 C20 16 16.5 19.5 12 21 C7.5 19.5 4 16 4 11 V6 Z"/><path d="M8.5 12 L11 14.5 L16 9"/></svg>',
    growth: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="19" x2="5" y2="13"/><line x1="12" y1="19" x2="12" y2="9"/><line x1="19" y1="19" x2="19" y2="5"/><line x1="3" y1="19" x2="21" y2="19"/></svg>',
    trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,17 9,11 13,14 21,5"/><polyline points="15,5 21,5 21,11"/></svg>',
    pie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 A9 9 0 1 1 4.5 17.2 L12 12 Z"/><line x1="12" y1="3" x2="12" y2="12"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18"/><line x1="9" y1="7" x2="9" y2="7.01"/><line x1="12" y1="7" x2="12" y2="7.01"/><line x1="15" y1="7" x2="15" y2="7.01"/><line x1="9" y1="11" x2="9" y2="11.01"/><line x1="12" y1="11" x2="12" y2="11.01"/><line x1="15" y1="11" x2="15" y2="11.01"/><line x1="9" y1="15" x2="9" y2="15.01"/><line x1="12" y1="15" x2="12" y2="15.01"/><line x1="15" y1="15" x2="15" y2="15.01"/></svg>'
  };

  async function fetchInclude(name) {
    const response = await fetch(`components/${name}.html`);
    if (!response.ok) throw new Error(`Failed to load component: ${name}`);
    return response.text();
  }

  async function includeStatic(name, targetSelector) {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    target.innerHTML = await fetchInclude(name);
  }

  async function loadCardTemplate(name) {
    const html = await fetchInclude(name);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return wrapper.querySelector('template');
  }

  function renderCards(template, items, container, fill) {
    if (!template || !container) return;
    items.forEach((item) => {
      const node = template.content.cloneNode(true);
      fill(node, item);
      container.appendChild(node);
    });
  }

  async function renderStrategies() {
    const container = document.querySelector('#strategies-grid');
    if (!container) return;
    const [template, response] = await Promise.all([
      loadCardTemplate('strategy-card'),
      fetch('data/strategies.json'),
    ]);
    const items = await response.json();
    renderCards(template, items, container, (node, item) => {
      node.querySelector('[data-field="icon"]').innerHTML = ICONS[item.icon] || '';
      node.querySelector('[data-field="title"]').textContent = item.title;
      node.querySelector('[data-field="description"]').textContent = item.description;
      node.querySelector('[data-field="link"]').setAttribute('href', item.link);
    });
  }

  async function renderStatistics() {
    const container = document.querySelector('#stats-grid');
    if (!container) return;
    const [template, response] = await Promise.all([
      loadCardTemplate('stat-card'),
      fetch('data/statistics.json'),
    ]);
    const items = await response.json();
    renderCards(template, items, container, (node, item) => {
      node.querySelector('[data-field="icon"]').innerHTML = ICONS[item.icon] || '';
      const valueEl = node.querySelector('[data-field="value"]');
      if (item.numeric) {
        valueEl.textContent = '0';
        valueEl.setAttribute('data-count-target', item.value);
      } else {
        valueEl.textContent = item.value;
      }
      node.querySelector('[data-field="label"]').textContent = item.label;
    });
    if (window.Giantfuse && window.Giantfuse.Counters) {
      window.Giantfuse.Counters.init('#stats-grid [data-count-target]');
    }
  }

  async function renderInsights() {
    const container = document.querySelector('#insights-grid');
    const template = document.querySelector('#insight-card-template');
    if (!container || !template) return;
    const response = await fetch('data/insights.json');
    const items = await response.json();
    renderCards(template, items.slice(0, 3), container, (node, item) => {
      node.querySelector('[data-field="category"]').textContent = item.category;
      node.querySelector('[data-field="title"]').textContent = item.title;
      const date = new Date(item.date);
      const formattedDate = date.toLocaleDateString('en-ZA', { month: 'long', day: 'numeric', year: 'numeric' });
      node.querySelector('[data-field="meta"]').textContent = `${formattedDate} • ${item.readTime}`;
      node.querySelector('[data-field="link"]').setAttribute('href', item.link);
    });
  }

  async function init() {
    await Promise.all([
      includeStatic('navbar', '[data-include="navbar"]'),
      includeStatic('footer', '[data-include="footer"]'),
    ]);
    if (window.Giantfuse && window.Giantfuse.Nav) window.Giantfuse.Nav.init();
    await renderStrategies();
    await renderStatistics();
    await renderInsights();
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
  }

  if (typeof window !== 'undefined') {
    window.Giantfuse = window.Giantfuse || {};
    window.Giantfuse.Icons = ICONS;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ICONS, fetchInclude, includeStatic, loadCardTemplate, renderCards };
  }
})();
