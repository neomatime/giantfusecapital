# Foundation + Home Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the shared design-system foundation (tokens, typography, shared components, include mechanism) and a fully working Home page (`index.html`) matching `docs/wireframes/home.png`, per the approved spec at `docs/superpowers/specs/2026-07-16-foundation-and-home-page-design.md`.

**Architecture:** Plain HTML/CSS/JS, no build tool. Every page lives at the project root so relative paths (`components/x.html`, `data/x.json`) resolve identically everywhere. Shared markup (navbar, footer) is injected at runtime via `fetch` + `innerHTML`. Repeating content (strategy cards, stat tiles, insight teasers) is rendered from `<template>` elements cloned per JSON data item. Each plain `<script>` file attaches its public API to a shared `window.Giantfuse` namespace object (no ES modules, no bundler) and also guards a `module.exports` so pure logic can be sanity-checked with plain `node -e` one-liners — there is no test framework in this project and none is being added.

**Tech Stack:** HTML5, CSS3 (custom properties, Grid, Flexbox), vanilla JS (fetch, IntersectionObserver, `<template>`), Google Fonts (Fraunces + Inter), Node v24 (already installed) used only for one-off verification scripts, `npx serve` as a dev-only static server (not a project dependency).

## Global Constraints

- No build tool, bundler, or framework — plain HTML/CSS/JS only (spec non-goal).
- Real photography has arrived for 5 categories, one file each: `assets/images/hero/pexels-willianjusten-35568066.jpg`, `assets/images/office/pexels-startup-stock-photos-7070.jpg`, `assets/images/architecture/pexels-vladimirsrajber-17555545.jpg`, `assets/images/strategies/pexels-constanze-marie-3872134-17879690.jpg`, `assets/images/insights/pexels-justamaki-16473129.jpg`. Per user decision ("Single-use only"): the hero photo goes in the hero section and the office photo goes in the CTA band — the only two single-instance photo slots on Home. The architecture/strategies/insights photos are held back (not used this round) because Home's repeating grids need 4 distinct strategy-card images and 3 distinct insight-card images, and only one photo per category exists — those cards keep the gradient-placeholder treatment (e.g. "Photo: strategy-background") until more photography is supplied.
- Content is data-driven from JSON for strategies, statistics, and insights (spec decision: "Data-driven JSON").
- Component reuse via runtime `fetch`-include, not a build-time step (spec decision: "JS fetch-include").
- Leadership is included as a primary nav item even though the mockup omits it (spec decision).
- Fonts: **Fraunces** (headings) + **Inter** (body) (spec decision).
- Colors (exact hex from `docs/assets/Color palette.png`): `--color-teal:#00A3AD`, `--color-navy:#0D1B2A`, `--color-slate:#24323F`, `--color-light-gray:#E6EBEF`, `--color-off-white:#F8FAFC`, `--color-gold:#C8A961`, `--color-steel-teal:#5F7F8C`, `--color-sea-glass:#B7D7DB`.
- Footer legal links (Privacy Policy, Terms of Use, PAIA, Disclaimer) point to `#` — those pages don't exist yet.
- Only `index.html` and its dependencies are in scope. Do not touch `about.html`, `strategies.html`, `leadership.html`, `insights.html`, `philosophies.html`, `contact.html`, `components/cta.html`, `components/contact-form.html`, `components/leadership-card.html`, `data/leadership.json`, or `assets/js/forms.js` — they're follow-on work.

---

## Task 1: Dev server for verification

Static `fetch()` calls require HTTP — opening `index.html` via `file://` will fail with CORS errors. This task wires up a throwaway dev server so every later task can verify in a real browser.

**Files:**
- Create: `.claude/launch.json`

- [ ] **Step 1: Create the launch config**

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "giantfuse-static",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["serve", "-l", "5500", "."],
      "port": 5500
    }
  ]
}
```

- [ ] **Step 2: Verify the server starts and responds**

Run: `npx --yes serve -l 5511 "C:\Users\Neo\OneDrive\Documents\HIMARK SGC\Giantfuse\giantfusecapital-site"` in the background, then in another shell: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5511/`
Expected: `200`
Stop the background server afterward. (In actual implementation, use the `preview_start` tool with `{name: "giantfuse-static"}` instead of Bash, per project convention — this step is just proving the config works.)

- [ ] **Step 3: Commit**

```bash
git add .claude/launch.json
git commit -m "chore: add dev server config for local static preview"
```

(Skip commit if the user has not initialized git in this folder — check with `git status` first; if it fails with "not a git repository," leave the file staged-in-place and note it in the task's final report instead of committing.)

---

## Task 2: Design tokens & reset

**Files:**
- Modify: `assets/css/global.css` (currently empty)
- Test: none automated — verified by the Node check in Step 2

**Interfaces:**
- Produces: CSS custom properties consumed by every other CSS file: `--color-teal`, `--color-navy`, `--color-slate`, `--color-light-gray`, `--color-off-white`, `--color-gold`, `--color-steel-teal`, `--color-sea-glass`, `--color-white`, `--space-4/8/12/16/24/32/48/64/96`, `--radius-sm/md/full`. Also produces the `.container` layout utility class.

- [ ] **Step 1: Write global.css**

```css
:root {
  --color-teal: #00A3AD;
  --color-navy: #0D1B2A;
  --color-slate: #24323F;
  --color-light-gray: #E6EBEF;
  --color-off-white: #F8FAFC;
  --color-gold: #C8A961;
  --color-steel-teal: #5F7F8C;
  --color-sea-glass: #B7D7DB;
  --color-white: #FFFFFF;

  --space-4: 4px;
  --space-8: 8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-24: 24px;
  --space-32: 32px;
  --space-48: 48px;
  --space-64: 64px;
  --space-96: 96px;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-full: 999px;
}

*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--color-off-white);
  color: var(--color-navy);
  -webkit-font-smoothing: antialiased;
}
img { max-width: 100%; display: block; }
a { color: inherit; text-decoration: none; }
ul { list-style: none; margin: 0; padding: 0; }
button { font: inherit; cursor: pointer; background: none; border: none; }

.container { max-width: 1280px; margin: 0 auto; padding: 0 var(--space-24); }
.section { padding: var(--space-64) 0; }
.text-teal { color: var(--color-teal); }
```

- [ ] **Step 2: Verify token values are present and correct**

Run:
```bash
node -e "
const fs = require('fs');
const css = fs.readFileSync('assets/css/global.css', 'utf8');
const required = ['--color-teal: #00A3AD', '--color-navy: #0D1B2A', '--color-slate: #24323F', '--color-light-gray: #E6EBEF', '--color-off-white: #F8FAFC', '--color-gold: #C8A961', '--color-steel-teal: #5F7F8C', '--color-sea-glass: #B7D7DB'];
required.forEach((token) => { if (!css.includes(token)) throw new Error('Missing token: ' + token); });
console.log('global.css tokens OK');
"
```
Expected: `global.css tokens OK`

- [ ] **Step 3: Commit**

```bash
git add assets/css/global.css
git commit -m "feat: add design tokens and base reset to global.css"
```

---

## Task 3: Typography system

**Files:**
- Modify: `assets/css/typography.css` (currently empty)

**Interfaces:**
- Consumes: `--color-navy`, `--color-slate`, `--color-teal`, `--space-8/16/48` from `global.css` (Task 2).
- Produces: heading/body font rules and the `.eyebrow` and `.section-heading` utility classes used by every content section.

- [ ] **Step 1: Write typography.css**

```css
h1, h2, h3, h4 {
  font-family: 'Fraunces', serif;
  color: var(--color-navy);
  line-height: 1.15;
  margin: 0;
  font-weight: 500;
}
body, p, a, li, button, input, textarea, span {
  font-family: 'Inter', sans-serif;
}
h1 { font-size: clamp(2.25rem, 4vw, 3.5rem); }
h2 { font-size: clamp(1.75rem, 3vw, 2.5rem); }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.125rem; font-weight: 600; }
p {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-slate);
  margin: 0;
}
.eyebrow {
  display: inline-block;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-teal);
  font-weight: 600;
}
.section-heading { text-align: center; margin-bottom: var(--space-48); }
.section-heading h2 { margin-bottom: var(--space-8); }
.section-heading p { color: var(--color-slate); }
```

- [ ] **Step 2: Verify font rules are present**

```bash
node -e "
const fs = require('fs');
const css = fs.readFileSync('assets/css/typography.css', 'utf8');
if (!css.includes(\"font-family: 'Fraunces'\")) throw new Error('Missing Fraunces on headings');
if (!css.includes(\"font-family: 'Inter'\")) throw new Error('Missing Inter on body');
console.log('typography.css OK');
"
```
Expected: `typography.css OK`

- [ ] **Step 3: Commit**

```bash
git add assets/css/typography.css
git commit -m "feat: add Fraunces/Inter typography system"
```

---

## Task 4: Icon library

Simple line icons used across the value strip, strategy cards, and stat tiles — hand-coded inline SVG, no image files, no icon font.

**Files:**
- Modify: `assets/js/main.js` (currently empty — this task only adds the `ICONS` map and the Node/browser export guard; rendering logic comes in Task 7)
- Test: inline via `node -e` (Step 2)

**Interfaces:**
- Produces: `window.Giantfuse.Icons` (browser) and `module.exports.ICONS` (Node), an object keyed by `bank | people | shield | growth | trend | pie | building`, each value a complete `<svg>...</svg>` string using `stroke="currentColor"`.

- [ ] **Step 1: Write the ICONS map in main.js**

```js
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

  if (typeof window !== 'undefined') {
    window.Giantfuse = window.Giantfuse || {};
    window.Giantfuse.Icons = ICONS;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ICONS };
  }
})();
```

- [ ] **Step 2: Verify all 7 icon keys exist and are valid SVG strings**

```bash
node -e "
const { ICONS } = require('./assets/js/main.js');
const assert = require('assert');
const required = ['bank', 'people', 'shield', 'growth', 'trend', 'pie', 'building'];
required.forEach((key) => {
  assert.ok(ICONS[key], 'Missing icon: ' + key);
  assert.ok(ICONS[key].startsWith('<svg'), key + ' is not an svg string');
  assert.ok(ICONS[key].endsWith('</svg>'), key + ' svg string not closed');
});
console.log('ICONS OK:', Object.keys(ICONS).length, 'icons');
"
```
Expected: `ICONS OK: 7 icons`

- [ ] **Step 3: Commit**

```bash
git add assets/js/main.js
git commit -m "feat: add inline SVG icon library"
```

---

## Task 5: Navbar component

**Files:**
- Modify: `components/navbar.html` (currently empty)
- Modify: `assets/css/navigation.css` (currently empty)
- Modify: `assets/js/navigation.js` (currently empty)

**Interfaces:**
- Consumes: `.btn`/`.btn-solid` classes (defined in Task 8's `components.css`, but the navbar's CTA button only needs those classes to *exist by the time the page renders* — since this task ships the markup/CSS/JS in isolation, style it minimally now and it will pick up `.btn-solid` automatically once Task 8 lands, no rework needed).
- Produces: `#navbar-toggle-btn`, `#navbar-mobile-menu` DOM ids consumed by `navigation.js`'s `init()`. Produces `window.Giantfuse.Nav.init()`.

- [ ] **Step 1: Write the navbar markup**

```html
<div class="navbar">
  <div class="navbar-inner">
    <a href="index.html" class="navbar-logo">Giantfuse <span class="navbar-logo-sub">Capital Partners</span></a>
    <nav class="navbar-links">
      <a href="index.html" class="active">Home</a>
      <a href="about.html">About Us</a>
      <a href="strategies.html">Our Business</a>
      <a href="philosophies.html">Investment Approach</a>
      <a href="leadership.html">Leadership</a>
      <a href="insights.html">Insights</a>
      <a href="contact.html">Contact Us</a>
    </nav>
    <div class="navbar-actions">
      <a href="contact.html" class="btn btn-solid navbar-cta">Investor Enquiry</a>
      <button class="navbar-toggle" id="navbar-toggle-btn" aria-label="Toggle menu" aria-expanded="false">&#9776;</button>
    </div>
  </div>
  <div class="navbar-mobile-menu" id="navbar-mobile-menu">
    <a href="index.html">Home</a>
    <a href="about.html">About Us</a>
    <a href="strategies.html">Our Business</a>
    <a href="philosophies.html">Investment Approach</a>
    <a href="leadership.html">Leadership</a>
    <a href="insights.html">Insights</a>
    <a href="contact.html">Contact Us</a>
  </div>
</div>
```

- [ ] **Step 2: Write navigation.css**

```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid var(--color-light-gray);
  transition: box-shadow 0.2s ease;
}
.navbar.is-scrolled { box-shadow: 0 2px 8px rgba(13, 27, 42, 0.08); }
.navbar-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-16) var(--space-24);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.navbar-logo { display: flex; align-items: baseline; gap: var(--space-8); font-weight: 700; color: var(--color-teal); font-size: 1.1rem; }
.navbar-logo-sub { color: var(--color-navy); font-weight: 400; font-size: 0.9rem; }
.navbar-links { display: none; align-items: center; gap: var(--space-24); }
@media (min-width: 1025px) { .navbar-links { display: flex; } }
.navbar-links a { font-size: 0.9rem; font-weight: 500; color: var(--color-navy); }
.navbar-links a.active { color: var(--color-teal); border-bottom: 2px solid var(--color-teal); padding-bottom: var(--space-4); }
.navbar-actions { display: flex; align-items: center; gap: var(--space-16); }
.navbar-cta { display: none; }
@media (min-width: 1025px) { .navbar-cta { display: inline-flex; } }
.navbar-toggle { display: inline-flex; font-size: 1.4rem; color: var(--color-navy); }
@media (min-width: 1025px) { .navbar-toggle { display: none; } }
.navbar-mobile-menu { display: none; flex-direction: column; gap: var(--space-16); padding: 0 var(--space-24) var(--space-24); }
.navbar-mobile-menu.is-open { display: flex; }
@media (min-width: 1025px) { .navbar-mobile-menu { display: none !important; } }
```

- [ ] **Step 3: Write navigation.js**

```js
(function () {
  'use strict';

  function init() {
    if (typeof document === 'undefined') return;
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

  const api = { init };

  if (typeof window !== 'undefined') {
    window.Giantfuse = window.Giantfuse || {};
    window.Giantfuse.Nav = api;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
```

- [ ] **Step 4: Verify navigation.js loads without syntax errors**

```bash
node -e "const nav = require('./assets/js/navigation.js'); if (typeof nav.init !== 'function') throw new Error('init missing'); console.log('navigation.js OK');"
```
Expected: `navigation.js OK`
(Full interactive behavior — menu open/close, scroll shrink — is verified visually in Task 7 once the navbar is actually included in a page.)

- [ ] **Step 5: Commit**

```bash
git add components/navbar.html assets/css/navigation.css assets/js/navigation.js
git commit -m "feat: build navbar component with mobile menu and scroll-shrink"
```

---

## Task 6: Footer component

**Files:**
- Modify: `components/footer.html` (currently empty)
- Modify: `assets/css/footer.css` (currently empty)

**Interfaces:**
- Produces: static footer markup injected by the include mechanism (Task 7). No JS behavior.

- [ ] **Step 1: Write the footer markup**

```html
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-logo">Giantfuse <span>Capital Partners</span></div>
        <p class="footer-legal-blurb">Giantfuse Capital Partners (Pty) Ltd is an alternative investment and asset management firm authorised and regulated in accordance with applicable South African legislation.</p>
        <div class="footer-social">
          <a href="#" aria-label="LinkedIn">in</a>
          <a href="mailto:info@gcapitalpartners.co.za" aria-label="Email">&#9993;</a>
        </div>
      </div>
      <div>
        <h4>Quick Links</h4>
        <a href="about.html">About Us</a>
        <a href="strategies.html">Our Business</a>
        <a href="philosophies.html">Investment Approach</a>
        <a href="insights.html">Insights</a>
        <a href="contact.html">Contact Us</a>
      </div>
      <div>
        <h4>Our Strategies</h4>
        <a href="strategies.html#private-equity">Private Equity</a>
        <a href="strategies.html#hedge-fund-solutions">Hedge Fund Solutions</a>
        <a href="strategies.html#real-estate">Real Estate</a>
        <a href="strategies.html#credit-insurance">Credit &amp; Insurance</a>
      </div>
      <div>
        <h4>Contact</h4>
        <p class="footer-contact-line">155 West Street<br>Sandton, Johannesburg<br>South Africa</p>
        <p class="footer-contact-line">+27 72 416 6083<br>info@gcapitalpartners.co.za</p>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2026 Giantfuse Capital Partners (Pty) Ltd. All rights reserved.</span>
      <div class="footer-bottom-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Use</a>
        <a href="#">PAIA</a>
        <a href="#">Disclaimer</a>
      </div>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Write footer.css**

```css
.site-footer { background: var(--color-navy); color: var(--color-light-gray); padding: var(--space-64) 0 var(--space-24); }
.footer-logo { font-weight: 700; color: var(--color-teal); font-size: 1.1rem; }
.footer-logo span { color: var(--color-white); font-weight: 400; font-size: 0.9rem; margin-left: var(--space-8); }
.footer-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-32); margin-bottom: var(--space-48); }
@media (min-width: 641px) { .footer-grid { grid-template-columns: 1.5fr 1fr 1fr 1fr; } }
.footer-grid h4 { color: var(--color-white); margin-bottom: var(--space-16); font-size: 0.95rem; }
.footer-grid a { display: block; color: var(--color-light-gray); font-size: 0.9rem; margin-bottom: var(--space-8); opacity: 0.85; }
.footer-grid a:hover { color: var(--color-teal); opacity: 1; }
.footer-legal-blurb { font-size: 0.85rem; opacity: 0.75; margin-top: var(--space-16); line-height: 1.6; color: var(--color-light-gray); }
.footer-contact-line { font-size: 0.9rem; opacity: 0.85; color: var(--color-light-gray); margin-bottom: var(--space-8); }
.footer-social { display: flex; gap: var(--space-16); margin-top: var(--space-16); }
.footer-social a { color: var(--color-white); }
.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding-top: var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
  font-size: 0.8rem;
  opacity: 0.7;
}
@media (min-width: 641px) { .footer-bottom { flex-direction: row; justify-content: space-between; } }
.footer-bottom-links { display: flex; gap: var(--space-16); flex-wrap: wrap; }
```

- [ ] **Step 3: Commit**

```bash
git add components/footer.html assets/css/footer.css
git commit -m "feat: build footer component"
```

---

## Task 7: Include engine + page shell

Wires the navbar/footer components into an actual page for the first time — this is the first fully browser-verifiable task.

**Files:**
- Modify: `assets/js/main.js` (add to the file from Task 4)
- Modify: `index.html` (currently empty)

**Interfaces:**
- Consumes: `components/navbar.html`, `components/footer.html` (Tasks 5–6); `window.Giantfuse.Nav.init()` (Task 5).
- Produces: `fetchInclude(name)`, `includeStatic(name, targetSelector)`, `loadCardTemplate(name)`, `renderCards(template, items, container, fill)` — all consumed by Tasks 8–10. Also produces the `init()` DOMContentLoaded orchestration entrypoint.

- [ ] **Step 1: Add the include engine to main.js**

Insert into the existing IIFE in `assets/js/main.js`, after the `ICONS` declaration:

```js
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

  async function init() {
    await Promise.all([
      includeStatic('navbar', '[data-include="navbar"]'),
      includeStatic('footer', '[data-include="footer"]'),
    ]);
    if (window.Giantfuse && window.Giantfuse.Nav) window.Giantfuse.Nav.init();
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
  }
```

Update the bottom export block to also expose the new functions:

```js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ICONS, fetchInclude, includeStatic, loadCardTemplate, renderCards };
  }
```

- [ ] **Step 2: Write the index.html shell**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Giantfuse Capital Partners | Alternative Investment &amp; Asset Management</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/global.css">
  <link rel="stylesheet" href="assets/css/typography.css">
  <link rel="stylesheet" href="assets/css/navigation.css">
  <link rel="stylesheet" href="assets/css/footer.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <link rel="stylesheet" href="assets/css/animationa.css">
  <link rel="stylesheet" href="assets/css/pages/home.css">
</head>
<body>
  <div data-include="navbar"></div>

  <main></main>

  <div data-include="footer"></div>

  <script src="assets/js/counters.js"></script>
  <script src="assets/js/scroll-effects.js"></script>
  <script src="assets/js/navigation.js"></script>
  <script src="assets/js/main.js"></script>
</body>
</html>
```

(`assets/css/components.css`, `assets/css/pages/home.css`, `assets/js/counters.js`, and `assets/js/scroll-effects.js` are still empty at this point — that's fine, empty stylesheets/scripts don't error. They're filled in Tasks 8–13.)

- [ ] **Step 3: Verify in browser**

Start the server (`preview_start` with `{name: "giantfuse-static"}`, or `npx serve -l 5500 .` from the project root) and open `http://localhost:5500/index.html`.
Expected, via `read_page` or `get_page_text`: the navbar renders with 7 links (Home, About Us, Our Business, Investment Approach, Leadership, Insights, Contact Us) and an "Investor Enquiry" button; the footer renders with 4 columns and the copyright line. `read_console_messages` shows no errors.
Resize to mobile width (375px): the nav links collapse behind the toggle button; clicking the toggle (`computer` click on `#navbar-toggle-btn`) reveals the mobile menu.

- [ ] **Step 4: Commit**

```bash
git add assets/js/main.js index.html
git commit -m "feat: wire up include engine and page shell with navbar/footer"
```

---

## Task 8: Card render engine + Strategy cards

**Files:**
- Modify: `assets/js/main.js` (add `renderStrategies`)
- Modify: `components/strategy-card.html` (currently empty)
- Modify: `assets/css/components.css` (currently empty — buttons, icon badge, card, grid utilities)
- Modify: `data/strategies.json` (currently empty)
- Modify: `index.html` (add the strategies section)

**Interfaces:**
- Consumes: `loadCardTemplate`, `renderCards`, `ICONS` (Tasks 4, 7).
- Produces: `renderStrategies()`, called from `init()`. Establishes the `data-field` attribute convention (`icon`, `title`, `description`, `link`) that Task 9's stat cards reuse.

- [ ] **Step 1: Write data/strategies.json**

```json
[
  { "icon": "growth", "title": "Private Equity", "description": "Partnering with exceptional businesses to unlock value and drive sustainable growth across sectors.", "link": "strategies.html#private-equity" },
  { "icon": "pie", "title": "Hedge Fund Solutions", "description": "Access to a range of hedge fund strategies designed to deliver consistent, risk-adjusted returns.", "link": "strategies.html#hedge-fund-solutions" },
  { "icon": "building", "title": "Real Estate", "description": "Investing in high-quality assets that generate stable income and long-term capital appreciation.", "link": "strategies.html#real-estate" },
  { "icon": "shield", "title": "Credit & Insurance", "description": "Delivering attractive yield opportunities through private credit and insurance solutions.", "link": "strategies.html#credit-insurance" }
]
```

- [ ] **Step 2: Verify JSON parses**

```bash
node -e "JSON.parse(require('fs').readFileSync('data/strategies.json', 'utf8')); console.log('strategies.json valid');"
```
Expected: `strategies.json valid`

- [ ] **Step 3: Write the strategy card template**

```html
<template>
  <div class="card strategy-card" data-reveal>
    <div class="card-media">Photo: strategy-background</div>
    <div class="card-body">
      <div class="icon-badge" data-field="icon"></div>
      <h3 data-field="title"></h3>
      <p data-field="description"></p>
      <a href="#" class="card-link" data-field="link">Learn More &rarr;</a>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Write components.css**

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-12) var(--space-24);
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.95rem;
  border: 1.5px solid transparent;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
.btn-solid { background: var(--color-teal); color: var(--color-white); }
.btn-solid:hover { background: #00848c; }
.btn-outline { background: transparent; border-color: var(--color-teal); color: var(--color-teal); }
.btn-outline:hover { background: var(--color-teal); color: var(--color-white); }

.icon-badge {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--color-teal);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.icon-badge svg { width: 24px; height: 24px; }

.card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(13, 27, 42, 0.08);
}
.card-media {
  height: 160px;
  background: linear-gradient(135deg, var(--color-sea-glass), var(--color-steel-teal));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-align: center;
  padding: var(--space-8);
}
.card-body { padding: var(--space-24); }
.strategy-card .icon-badge { margin-top: -32px; border: 3px solid var(--color-white); }
.card h3 { margin: var(--space-16) 0 var(--space-8); }
.card p { margin-bottom: var(--space-16); font-size: 0.9rem; }
.card-link { color: var(--color-teal); font-weight: 600; font-size: 0.9rem; }

.grid-4 { display: grid; grid-template-columns: 1fr; gap: var(--space-24); }
@media (min-width: 641px) { .grid-4 { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1025px) { .grid-4 { grid-template-columns: repeat(4, 1fr); } }
```

- [ ] **Step 5: Add renderStrategies to main.js**

Insert after `renderCards`:

```js
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
```

Update `init()` to call it after the includes resolve:

```js
  async function init() {
    await Promise.all([
      includeStatic('navbar', '[data-include="navbar"]'),
      includeStatic('footer', '[data-include="footer"]'),
    ]);
    if (window.Giantfuse && window.Giantfuse.Nav) window.Giantfuse.Nav.init();
    await renderStrategies();
  }
```

- [ ] **Step 6: Add the strategies section to index.html**

Replace `<main></main>` with:

```html
  <main>
    <section class="section" data-reveal>
      <div class="container">
        <div class="section-heading">
          <h2>Our Investment <span class="text-teal">Strategies</span></h2>
          <p>Diversified. Disciplined. Aligned with your ambition.</p>
        </div>
        <div class="grid-4" id="strategies-grid"></div>
      </div>
    </section>
  </main>
```

- [ ] **Step 7: Verify in browser**

Reload `http://localhost:5500/index.html`. Expected via `read_page`: 4 cards under "Our Investment Strategies" titled Private Equity, Hedge Fund Solutions, Real Estate, Credit & Insurance, each with a "Learn More →" link and a visible circular icon badge. `read_console_messages` shows no errors. Resize to mobile (375px): cards stack to 1 column; tablet (768px): 2 columns; desktop (1280px): 4 columns.

- [ ] **Step 8: Commit**

```bash
git add assets/js/main.js components/strategy-card.html assets/css/components.css data/strategies.json index.html
git commit -m "feat: render data-driven strategy cards"
```

---

## Task 9: Stat tiles + animated counters

**Files:**
- Modify: `assets/js/main.js` (add `renderStatistics`)
- Modify: `assets/js/counters.js` (currently empty)
- Modify: `components/stat-card.html` (currently empty)
- Modify: `assets/css/components.css` (add stat-tile + grid-5 styles)
- Modify: `data/statistics.json` (currently empty)
- Modify: `index.html` (add the stats section)

**Interfaces:**
- Consumes: `renderCards`, `loadCardTemplate` (Task 7).
- Produces: `window.Giantfuse.Counters.init(selector)`, `parseNumeric(value)`, `formatAtProgress(value, progress)` (pure, Node-tested). `renderStatistics()` called from `init()`.

- [ ] **Step 1: Write data/statistics.json**

```json
[
  { "icon": "growth", "value": "26.9%", "numeric": true, "label": "3-Year Average NAV Return" },
  { "icon": "trend", "value": "50.1%", "numeric": true, "label": "3-Year Annualised NAV Return" },
  { "icon": "pie", "value": "10.1%", "numeric": true, "label": "Average Dividend Yield" },
  { "icon": "shield", "value": "Disciplined", "numeric": false, "label": "Risk Management Framework" },
  { "icon": "people", "value": "Institutional Grade", "numeric": false, "label": "Governance & Transparency" }
]
```

- [ ] **Step 2: Verify JSON parses**

```bash
node -e "JSON.parse(require('fs').readFileSync('data/statistics.json', 'utf8')); console.log('statistics.json valid');"
```
Expected: `statistics.json valid`

- [ ] **Step 3: Write counters.js**

```js
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
```

- [ ] **Step 4: Verify the pure counter math**

```bash
node -e "
const { parseNumeric, formatAtProgress } = require('./assets/js/counters.js');
const assert = require('assert');
assert.deepStrictEqual(parseNumeric('26.9%'), { number: 26.9, suffix: '%' });
assert.strictEqual(formatAtProgress('26.9%', 0.5), '13.4%');
assert.strictEqual(formatAtProgress('26.9%', 1), '26.9%');
assert.strictEqual(formatAtProgress('Disciplined', 0.5), 'Disciplined');
console.log('counters.js pure logic OK');
"
```
Expected: `counters.js pure logic OK`

- [ ] **Step 5: Write the stat card template**

```html
<template>
  <div class="stat-tile" data-reveal>
    <div class="icon-badge icon-badge-outline" data-field="icon"></div>
    <div class="stat-value" data-field="value"></div>
    <div class="stat-label" data-field="label"></div>
  </div>
</template>
```

- [ ] **Step 6: Add stat-tile styles to components.css**

Append:

```css
.icon-badge-outline { background: transparent; color: var(--color-teal); border: 1.5px solid var(--color-teal); }
.stat-tile { text-align: center; display: flex; flex-direction: column; align-items: center; }
.stat-tile .stat-value { font-family: 'Fraunces', serif; font-size: 2rem; color: var(--color-navy); margin-top: var(--space-16); }
.stat-tile .stat-label { font-size: 0.85rem; color: var(--color-slate); margin-top: var(--space-4); }
.stats-disclaimer { text-align: center; font-size: 0.8rem; color: var(--color-slate); opacity: 0.75; margin-top: var(--space-32); }

.grid-5 { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-24); }
@media (min-width: 641px) { .grid-5 { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1025px) { .grid-5 { grid-template-columns: repeat(5, 1fr); } }
```

- [ ] **Step 7: Add renderStatistics to main.js**

Insert after `renderStrategies`:

```js
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
```

Update `init()`:

```js
    await renderStrategies();
    await renderStatistics();
```

- [ ] **Step 8: Add the stats section to index.html**

Append inside `<main>`, after the strategies section:

```html
    <section class="section" data-reveal>
      <div class="container">
        <div class="section-heading">
          <h2>A Track Record of <span class="text-teal">Performance</span></h2>
        </div>
        <div class="grid-5" id="stats-grid"></div>
        <p class="stats-disclaimer">Performance metrics are based on composite returns across strategies. Past performance is not indicative of future results.</p>
      </div>
    </section>
```

Add `<script src="assets/js/counters.js"></script>` is already present in the shell from Task 7 — no change needed to the script tag list.

- [ ] **Step 9: Verify in browser**

Reload the page. Expected via `read_page`: 5 stat tiles (26.9%/50.1%/10.1%/Disciplined/Institutional Grade) with their labels. Scroll the section into view and check via `read_page` after a short pause that the three percentage values have animated to their final text (not stuck at "0"). `read_console_messages` shows no errors.

- [ ] **Step 10: Commit**

```bash
git add assets/js/main.js assets/js/counters.js components/stat-card.html assets/css/components.css data/statistics.json index.html
git commit -m "feat: render performance stats with animated counters"
```

---

## Task 10: Insight teasers

**Files:**
- Modify: `assets/js/main.js` (add `renderInsights`)
- Modify: `data/insights.json` (currently empty)
- Modify: `assets/css/components.css` (add insight-card + grid-3 styles)
- Modify: `index.html` (add the insights section, including the inline `<template>`)

**Interfaces:**
- Consumes: `renderCards` (Task 7). Unlike strategies/stats, the template lives inline in `index.html` (`#insight-card-template`) rather than in `components/`, since it's used nowhere else yet.
- Produces: `renderInsights()`, called from `init()`.

- [ ] **Step 1: Write data/insights.json**

```json
[
  { "category": "MARKET OUTLOOK", "title": "Global Markets: Navigating Change with Discipline", "date": "2024-05-20", "readTime": "5 min read", "link": "insights.html#global-markets-navigating-change" },
  { "category": "INVESTMENT PERSPECTIVE", "title": "Private Credit: A Compelling Opportunity", "date": "2024-05-08", "readTime": "4 min read", "link": "insights.html#private-credit-opportunity" },
  { "category": "FIRM NEWS", "title": "Giantfuse Capital Partners Expands Investment Team", "date": "2024-04-25", "readTime": "3 min read", "link": "insights.html#firm-expands-investment-team" }
]
```

- [ ] **Step 2: Verify JSON parses**

```bash
node -e "JSON.parse(require('fs').readFileSync('data/insights.json', 'utf8')); console.log('insights.json valid');"
```
Expected: `insights.json valid`

- [ ] **Step 3: Add insight-card styles to components.css**

Append:

```css
.insight-card .card-media { background: linear-gradient(135deg, var(--color-navy), var(--color-steel-teal)); height: 140px; }
.insight-card .meta { font-size: 0.8rem; color: var(--color-slate); margin: var(--space-8) 0; }

.grid-3 { display: grid; grid-template-columns: 1fr; gap: var(--space-24); }
@media (min-width: 641px) { .grid-3 { grid-template-columns: repeat(3, 1fr); } }

.section-heading-row { display: flex; justify-content: space-between; align-items: baseline; text-align: left; margin-bottom: var(--space-48); }
.section-heading-row h2 { margin-bottom: 0; }
```

- [ ] **Step 4: Add renderInsights to main.js**

Insert after `renderStatistics`:

```js
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
```

Update `init()`:

```js
    await renderStatistics();
    await renderInsights();
```

- [ ] **Step 5: Add the insights section to index.html**

Append inside `<main>`, after the stats section:

```html
    <section class="section" data-reveal>
      <div class="container">
        <div class="section-heading-row">
          <h2>Insights That <span class="text-teal">Matter</span></h2>
          <a href="insights.html" class="card-link">View All Insights &rarr;</a>
        </div>
        <div class="grid-3" id="insights-grid"></div>
      </div>
      <template id="insight-card-template">
        <div class="card insight-card" data-reveal>
          <div class="card-media">Photo: insight-thumbnail</div>
          <div class="card-body">
            <span class="eyebrow" data-field="category"></span>
            <h3 data-field="title"></h3>
            <div class="meta" data-field="meta"></div>
            <a href="#" class="card-link" data-field="link">Read More &rarr;</a>
          </div>
        </div>
      </template>
    </section>
```

- [ ] **Step 6: Verify in browser**

Reload the page. Expected via `read_page`: 3 insight cards with categories MARKET OUTLOOK / INVESTMENT PERSPECTIVE / FIRM NEWS, their titles, a formatted date + read time, and "Read More →" links. `read_console_messages` shows no errors.

- [ ] **Step 7: Commit**

```bash
git add assets/js/main.js data/insights.json assets/css/components.css index.html
git commit -m "feat: render insight teaser cards"
```

---

## Task 11: Hero + value strip

**Files:**
- Modify: `assets/css/pages/home.css` (currently empty)
- Modify: `index.html` (add hero + value strip before the strategies section)

**Interfaces:**
- Consumes: `.btn`, `.btn-solid`, `.btn-outline`, `.text-teal` (Tasks 8, 2). Static markup only, no JS.

- [ ] **Step 1: Write home.css**

```css
.hero {
  display: grid;
  gap: var(--space-32);
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-48) var(--space-24);
}
@media (min-width: 1025px) {
  .hero { grid-template-columns: 1fr 1fr; align-items: center; gap: var(--space-48); }
}
.hero h1 { margin-bottom: var(--space-16); }
.hero p { max-width: 480px; margin-bottom: var(--space-24); }
.hero-actions { display: flex; flex-wrap: wrap; gap: var(--space-16); }
.hero-media {
  aspect-ratio: 4 / 5;
  border-radius: var(--radius-md);
  overflow: hidden;
}
.hero-media img { width: 100%; height: 100%; object-fit: cover; }

.value-strip { background: var(--color-navy); color: var(--color-white); padding: var(--space-32) 0; }
.value-strip-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-24); text-align: center; }
@media (min-width: 641px) { .value-strip-grid { grid-template-columns: repeat(4, 1fr); } }
.value-item { display: flex; flex-direction: column; align-items: center; gap: var(--space-8); }
.value-item svg { width: 28px; height: 28px; color: var(--color-teal); }
.value-item span { font-size: 0.85rem; }
```

- [ ] **Step 2: Add the hero and value strip to index.html**

Insert immediately after `<div data-include="navbar"></div>` and before `<main>`:

```html
  <section class="hero" data-reveal>
    <div class="hero-copy">
      <h1>The Age of<br><span class="text-teal">Possibilities</span></h1>
      <p>Giantfuse Capital Partners is an alternative investment and asset management firm delivering long-term value through disciplined strategies across private markets.</p>
      <div class="hero-actions">
        <a href="strategies.html" class="btn btn-solid">Explore Our Strategies &rarr;</a>
        <a href="contact.html" class="btn btn-outline">Contact Us</a>
      </div>
    </div>
    <div class="hero-media">
      <img src="assets/images/hero/pexels-willianjusten-35568066.jpg" alt="Modern glass office tower, viewed from below" width="640" height="800" loading="eager">
    </div>
  </section>

  <section class="value-strip" data-reveal>
    <div class="container value-strip-grid">
      <div class="value-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10 L12 4 L21 10 Z"/><line x1="5" y1="10" x2="5" y2="19"/><line x1="9.5" y1="10" x2="9.5" y2="19"/><line x1="14.5" y1="10" x2="14.5" y2="19"/><line x1="19" y1="10" x2="19" y2="19"/><line x1="3" y1="21" x2="21" y2="21"/></svg>
        <span>Alternative Investments</span>
      </div>
      <div class="value-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><circle cx="17" cy="9" r="2.3"/><path d="M15.8 14.2c2.6.2 4.7 2.1 4.7 4.8"/></svg>
        <span>Institutional Solutions</span>
      </div>
      <div class="value-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 L20 6 V11 C20 16 16.5 19.5 12 21 C7.5 19.5 4 16 4 11 V6 Z"/><path d="M8.5 12 L11 14.5 L16 9"/></svg>
        <span>Risk-Adjusted Returns</span>
      </div>
      <div class="value-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="19" x2="5" y2="13"/><line x1="12" y1="19" x2="12" y2="9"/><line x1="19" y1="19" x2="19" y2="5"/><line x1="3" y1="19" x2="21" y2="19"/></svg>
        <span>Long-Term Value Creation</span>
      </div>
    </div>
  </section>
```

- [ ] **Step 3: Verify in browser**

Reload the page. Expected: hero heading "The Age of Possibilities" with "Possibilities" in teal, both CTA buttons visible, the real hero photo displayed to the right (desktop) or below (mobile), cropped to fill its frame without distortion. Dark value strip with 4 icon+label pairs beneath the hero. Check at 375px and 1280px widths via `computer {action: "screenshot"}`.

- [ ] **Step 4: Commit**

```bash
git add assets/css/pages/home.css index.html
git commit -m "feat: build hero and value-strip sections"
```

---

## Task 12: CTA band + closing CTA

**Files:**
- Modify: `assets/css/pages/home.css` (append)
- Modify: `index.html` (insert CTA band between stats and insights sections; append closing CTA after insights)

- [ ] **Step 1: Append CTA styles to home.css**

```css
.cta-band {
  background:
    linear-gradient(rgba(13, 27, 42, 0.82), rgba(13, 27, 42, 0.9)),
    url('../../images/office/pexels-startup-stock-photos-7070.jpg') center / cover no-repeat;
  color: var(--color-white);
  padding: var(--space-64) 0;
}
.cta-band p { color: var(--color-light-gray); max-width: 480px; margin: var(--space-16) 0 var(--space-24); }
.cta-band h2 { color: var(--color-white); }

.closing-cta { padding: var(--space-48) 0; }
.closing-cta-inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  align-items: flex-start;
}
@media (min-width: 1025px) {
  .closing-cta-inner { flex-direction: row; align-items: center; justify-content: space-between; }
}
.closing-cta-mark { font-size: 2rem; color: var(--color-teal); }
```

- [ ] **Step 2: Insert the CTA band into index.html**

Between the stats `</section>` and the insights `<section>`:

```html
    <section class="cta-band" data-reveal>
      <div class="container">
        <h2>Built on Expertise.<br>Focused on <span class="text-teal">Your Future</span>.</h2>
        <p>We partner with institutions, family offices and qualified investors to navigate complexity and capture opportunity in global and local markets.</p>
        <a href="contact.html" class="btn btn-solid">Partner With Us &rarr;</a>
      </div>
    </section>
```

- [ ] **Step 3: Append the closing CTA to index.html**

After the insights `</section>` and before `</main>`:

```html
    <section class="closing-cta" data-reveal>
      <div class="container closing-cta-inner">
        <div class="closing-cta-mark">&#9686;</div>
        <div>
          <h3>Let's Build What's Next, Together.</h3>
          <p>Speak with our team to explore how we can support your investment goals.</p>
        </div>
        <a href="contact.html" class="btn btn-outline">Contact Investor Relations &rarr;</a>
      </div>
    </section>
```

- [ ] **Step 4: Verify in browser**

Reload the page. Expected: dark "Built on Expertise. Focused on Your Future." band with a "Partner With Us" button between the stats and insights sections; a closing "Let's Build What's Next, Together." strip with a "Contact Investor Relations" outline button just before the footer.

- [ ] **Step 5: Commit**

```bash
git add assets/css/pages/home.css index.html
git commit -m "feat: add CTA band and closing CTA sections"
```

---

## Task 13: Scroll reveal + final responsive/wireframe QA

**Files:**
- Modify: `assets/js/scroll-effects.js` (currently empty)
- Modify: `assets/css/animationa.css` (currently empty)
- Modify: `assets/js/main.js` (call `ScrollEffects.init()` at the end of `init()`)

**Interfaces:**
- Consumes: `[data-reveal]` attribute already present on every section from Tasks 7–12.
- Produces: `window.Giantfuse.ScrollEffects.init(selector)`.

- [ ] **Step 1: Write scroll-effects.js**

```js
(function () {
  'use strict';

  function init(selector) {
    selector = selector || '[data-reveal]';
    if (typeof document === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    elements.forEach((el) => observer.observe(el));
  }

  const api = { init };

  if (typeof window !== 'undefined') {
    window.Giantfuse = window.Giantfuse || {};
    window.Giantfuse.ScrollEffects = api;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
```

- [ ] **Step 2: Verify it loads without errors**

```bash
node -e "const se = require('./assets/js/scroll-effects.js'); if (typeof se.init !== 'function') throw new Error('init missing'); console.log('scroll-effects.js OK');"
```
Expected: `scroll-effects.js OK`

- [ ] **Step 3: Write animationa.css**

```css
[data-reveal] {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
[data-reveal].is-revealed {
  opacity: 1;
  transform: translateY(0);
}
```

- [ ] **Step 4: Wire ScrollEffects into main.js**

Update the end of `init()`:

```js
    await renderInsights();
    if (window.Giantfuse && window.Giantfuse.ScrollEffects) {
      window.Giantfuse.ScrollEffects.init();
    }
```

- [ ] **Step 5: Full-page verification against the wireframe**

Reload `http://localhost:5500/index.html`. Scroll top to bottom slowly and confirm via `read_page`/screenshots that each section fades/slides in as it enters the viewport, then stays visible (not re-hiding on scroll-up). Compare section-by-section against `docs/wireframes/home.png`: nav → hero → value strip → strategies grid → stats → CTA band → insights → closing CTA → footer, in that order, with matching copy. Check `read_console_messages` for zero errors. Check responsive layout at 375px, 768px, and 1280px via `resize_window` + screenshots.

- [ ] **Step 6: Commit**

```bash
git add assets/js/scroll-effects.js assets/css/animationa.css assets/js/main.js
git commit -m "feat: add scroll-reveal animation and complete Home page"
```

---

## Self-review notes

- **Spec coverage:** every section listed in the spec's "Home page sections" is implemented in Tasks 7, 8, 9, 10, 11, 12 (navbar/footer, strategies, stats, insights, hero/value-strip, CTA bands). Design tokens (Task 2), typography (Task 3), icons (Task 4), include mechanism (Task 7), and scroll reveal (Task 13) all map to spec sections. Image placeholders (spec decision, refined once real photos arrived) appear in Tasks 8 and 10; Task 11 and Task 12 use the real hero and office photos per the "Single-use only" mapping decision. Leadership-in-nav and font-pairing decisions are in Task 5 and Task 3 respectively. Footer legal links point to `#` per spec, in Task 6.
- **Placeholder scan:** no TBD/TODO — every step has runnable code and an exact expected result.
- **Type/name consistency:** `data-field` attribute names (`icon`, `title`, `description`, `link`, `value`, `label`, `category`, `meta`) are used identically between each `<template>` and its corresponding `render*` function. `window.Giantfuse.*` namespace keys (`Icons`, `Nav`, `Counters`, `ScrollEffects`) are consistent across every file that produces or consumes them.
- **Scope:** limited to foundation + Home, matching the approved spec's non-goals. Other pages are explicitly out of scope (see Global Constraints).
