(function () {
  'use strict';

  const ICONS = {
    bank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10 L12 4 L21 10 Z"/><line x1="5" y1="10" x2="5" y2="19"/><line x1="9.5" y1="10" x2="9.5" y2="19"/><line x1="14.5" y1="10" x2="14.5" y2="19"/><line x1="19" y1="10" x2="19" y2="19"/><line x1="3" y1="21" x2="21" y2="21"/></svg>',
    people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><circle cx="17" cy="9" r="2.3"/><path d="M15.8 14.2c2.6.2 4.7 2.1 4.7 4.8"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 L20 6 V11 C20 16 16.5 19.5 12 21 C7.5 19.5 4 16 4 11 V6 Z"/><path d="M8.5 12 L11 14.5 L16 9"/></svg>',
    growth: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="19" x2="5" y2="13"/><line x1="12" y1="19" x2="12" y2="9"/><line x1="19" y1="19" x2="19" y2="5"/><line x1="3" y1="19" x2="21" y2="19"/></svg>',
    trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3,17 9,11 13,14 21,5"/><polyline points="15,5 21,5 21,11"/></svg>',
    pie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 A9 9 0 1 1 4.5 17.2 L12 12 Z"/><line x1="12" y1="3" x2="12" y2="12"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="3" width="12" height="18"/><line x1="9" y1="7" x2="9" y2="7.01"/><line x1="12" y1="7" x2="12" y2="7.01"/><line x1="15" y1="7" x2="15" y2="7.01"/><line x1="9" y1="11" x2="9" y2="11.01"/><line x1="12" y1="11" x2="12" y2="11.01"/><line x1="15" y1="11" x2="15" y2="11.01"/><line x1="9" y1="15" x2="9" y2="15.01"/><line x1="12" y1="15" x2="12" y2="15.01"/><line x1="15" y1="15" x2="15" y2="15.01"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12 C5 6 9 4 12 4 C15 4 19 6 22 12 C19 18 15 20 12 20 C9 20 5 18 2 12 Z"/><circle cx="12" cy="12" r="3"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="3" x2="5" y2="21"/><path d="M5 4 L19 4 L15.5 8 L19 12 L5 12 Z"/></svg>',
    lightbulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18 L15 18"/><path d="M10 21 L14 21"/><path d="M12 3 C8 3 6 6 6 9 C6 11.5 7.2 13 8.5 14.5 C9 15 9 16 9 17 L15 17 C15 16 15 15 15.5 14.5 C16.8 13 18 11.5 18 9 C18 6 16 3 12 3 Z"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19 C5 10 10 4 20 4 C20 14 14 19 5 19 Z"/><path d="M5 19 C9 15 12 11 17 7"/></svg>',
    checkmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4,13 9,18 20,6"/></svg>',
    magnifyingGlass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="21" y2="21"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><line x1="3" y1="12" x2="21" y2="12"/></svg>',
    locationPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21 C12 21 5 14 5 9 C5 5.5 8.1 3 12 3 C15.9 3 19 5.5 19 9 C19 14 12 21 12 21 Z"/><circle cx="12" cy="9" r="2.3"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 3.5 C7.5 3.5 8 4 8.5 5.5 L9.5 8 C9.8 8.8 9.6 9.5 9 10 L7.8 11 C8.5 13 10.9 15.4 13 16.2 L14 15 C14.5 14.4 15.2 14.2 16 14.5 L18.5 15.5 C20 16 20.5 16.5 20.5 17.5 C20.5 19.5 18.8 21 17 21 C11.5 21 3 12.5 3 7 C3 5.2 4.5 3.5 6.5 3.5 Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M4 6.5 L12 13 L20 6.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7 L12 12 L15.5 14"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11 V7.5 C8 5 9.8 3.5 12 3.5 C14.2 3.5 16 5 16 7.5 V11"/></svg>',
    chatBubble: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="3"/><path d="M8 17 L8 20.5 L12 17"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12 L20 4 L14 20 L11 13 L4 12 Z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>'
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

  function syncNavbarHeight() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const applyHeight = () => {
      document.documentElement.style.setProperty('--navbar-height', `${navbar.getBoundingClientRect().height}px`);
    };
    applyHeight();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(applyHeight).observe(navbar);
    } else {
      window.addEventListener('resize', applyHeight);
    }
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
    if (!response.ok) throw new Error('Failed to load data: data/strategies.json');
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
    if (!response.ok) throw new Error('Failed to load data: data/statistics.json');
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
    if (!response.ok) throw new Error('Failed to load data: data/insights.json');
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

  async function renderStrategyDetails() {
    const container = document.querySelector('#strategy-details-grid');
    const template = document.querySelector('#strategy-detail-template');
    if (!container || !template) return;
    const response = await fetch('data/strategies.json');
    if (!response.ok) throw new Error('Failed to load data: data/strategies.json');
    const items = await response.json();
    renderCards(template, items, container, (node, item) => {
      const card = node.querySelector('.strategy-detail-card');
      card.id = item.link.split('#')[1] || '';
      node.querySelector('[data-field="icon"]').innerHTML = ICONS[item.icon] || '';
      node.querySelector('[data-field="title"]').textContent = item.title;
      node.querySelector('[data-field="subtitle"]').textContent = item.subtitle;
      node.querySelector('[data-field="description"]').textContent = item.fullDescription;
      const list = node.querySelector('[data-field="highlights"]');
      item.highlights.forEach((highlight) => {
        const li = document.createElement('li');
        const iconSpan = document.createElement('span');
        iconSpan.className = 'icon-badge';
        iconSpan.innerHTML = ICONS.checkmark;
        li.appendChild(iconSpan);
        li.appendChild(document.createTextNode(highlight));
        list.appendChild(li);
      });
      node.querySelector('[data-field="link"]').setAttribute('href', item.link);
    });
  }

  async function renderLeadership() {
    const teamContainer = document.querySelector('#leader-grid');
    const teamTemplate = document.querySelector('#leader-card-template');
    const committeeContainer = document.querySelector('#committee-grid');
    const committeeTemplate = document.querySelector('#committee-member-template');
    if (!teamContainer && !committeeContainer) return;
    const response = await fetch('data/leadership.json');
    if (!response.ok) throw new Error('Failed to load data: data/leadership.json');
    const data = await response.json();
    if (teamContainer && teamTemplate) {
      renderCards(teamTemplate, data.team, teamContainer, (node, item) => {
        node.querySelector('[data-field="initials"]').textContent = item.initials;
        node.querySelector('[data-field="name"]').textContent = item.name;
        node.querySelector('[data-field="title"]').textContent = item.title;
        node.querySelector('[data-field="bio"]').textContent = item.bio;
        node.querySelector('[data-field="linkedin"]').setAttribute('href', item.linkedin);
      });
    }
    if (committeeContainer && committeeTemplate) {
      renderCards(committeeTemplate, data.committee, committeeContainer, (node, item) => {
        node.querySelector('[data-field="initials"]').textContent = item.initials;
        node.querySelector('[data-field="name"]').textContent = item.name;
        node.querySelector('[data-field="title"]').textContent = item.title;
        node.querySelector('[data-field="bio"]').textContent = item.bio;
      });
    }
  }

  function scrollToHash() {
    if (typeof window === 'undefined' || !window.location.hash) return;
    const target = document.getElementById(window.location.hash.slice(1));
    if (!target) return;
    target.classList.add('is-revealed');
    target.scrollIntoView();
  }

  async function init() {
    await Promise.all([
      includeStatic('navbar', '[data-include="navbar"]'),
      includeStatic('footer', '[data-include="footer"]'),
    ]);
    syncNavbarHeight();
    if (window.Giantfuse && window.Giantfuse.Nav) window.Giantfuse.Nav.init();
    if (window.Giantfuse && window.Giantfuse.ContactForm) window.Giantfuse.ContactForm.init();
    try {
      await renderStrategies();
      await renderStatistics();
      await renderInsights();
      await renderStrategyDetails();
      await renderLeadership();
    } catch (error) {
      console.error('Failed to render dynamic content:', error);
    } finally {
      if (window.Giantfuse && window.Giantfuse.ScrollEffects) {
        window.Giantfuse.ScrollEffects.init();
      }
      scrollToHash();
    }
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
