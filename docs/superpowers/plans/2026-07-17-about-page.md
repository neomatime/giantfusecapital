# About Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `about.html` against `docs/wireframes/about.png`, reusing Home's shared foundation (tokens, navbar/footer, full-bleed hero technique, card/grid/button patterns), plus fix the navbar's hardcoded active-link bug that a second page exposes.

**Architecture:** Static HTML matching the pattern used for Home's hero/value-strip/CTA sections — no new JSON data files, no new render functions, since Core Values and Investment Approach content is About-page-only. New file: `assets/css/pages/about.css`. Extends the existing `ICONS` map in `assets/js/main.js` with 9 new inline-SVG icons, and makes the navbar's active link dynamic (JS-computed from the current URL) instead of hardcoded in the shared `navbar.html` partial.

**Tech Stack:** Same as the rest of the site — plain HTML/CSS/JS, no build tool, `node --check` / `node -e` for ad-hoc verification, live browser checks for everything else.

## Global Constraints

- No build tool, bundler, or framework — plain HTML/CSS/JS only.
- Reuse existing shared classes wherever they fit: `.btn`/`.btn-solid`/`.btn-outline`, `.card`, `.icon-badge`/`.icon-badge-outline`, `.grid-3`/`.grid-4`/`.grid-5`, `.section`/`.section-heading`/`.section-heading-row`, `.eyebrow`, `.container`, `.hero`/`.hero-media`/`.hero-overlay`/`.hero-copy`, `.closing-cta`. Do not redefine these in `about.css`.
- Current typography: headings use `'Space Grotesk', sans-serif` (not Fraunces/Playfair/Bodoni — those were replaced), body uses `'Lato', sans-serif`. `about.html`'s `<head>` must load the same Google Fonts link as `index.html` currently does: `family=Space+Grotesk:wght@400;500;600;700&family=Lato:wght@300;400;500;700`.
- `--navbar-height` is self-adjusting via a `ResizeObserver` already wired in `main.js`'s `syncNavbarHeight()` — do not hardcode a navbar height anywhere in new code.
- New icons follow the exact existing `ICONS` map convention: `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`.
- Hero photo: `assets/images/pexels-ekam-juneja-61080223-9516077.jpg` (already exists on disk at the project root of `assets/images/`, not in a subfolder). Do not use `pexels-blackphant-20884565.jpg` — it has a readable third-party "OHLA" logo baked into the photo.
- "Who We Serve" photo: reuse `assets/images/office/pexels-startup-stock-photos-7070.jpg` (already used once on Home's CTA band).
- Geographic Footprint's map graphic is an abstract decorative dot pattern, not a literal Africa silhouette — this is a deliberate, approved simplification, not a gap to fill later in this plan.
- Only `about.html`, `assets/css/pages/about.css`, `assets/js/main.js`, `components/navbar.html`, `assets/js/navigation.js`, and `assets/css/navigation.css` are in scope. Do not touch `index.html`, `assets/css/pages/home.css`, or any other page's scaffolding.

---

## Task 1: Dynamic active nav link

Fixes the bug where every page shows "Home" highlighted in the nav, because `components/navbar.html` hardcodes `class="active"` on the Home link and every page fetches the same shared partial.

**Files:**
- Modify: `components/navbar.html`
- Modify: `assets/js/navigation.js`
- Modify: `assets/css/navigation.css`

**Interfaces:**
- Produces: active-link behavior that later tasks (and every future page) rely on implicitly — no other task calls this directly, it runs automatically inside `window.Giantfuse.Nav.init()`.

- [ ] **Step 1: Remove the hardcoded active class from navbar.html**

In `components/navbar.html`, change:
```html
      <a href="index.html" class="active">Home</a>
```
to:
```html
      <a href="index.html">Home</a>
```
(This is the only occurrence — the mobile menu's Home link already has no class.)

- [ ] **Step 2: Add setActiveLink to navigation.js**

Insert into the existing IIFE in `assets/js/navigation.js`, as a new function above `init`:

```js
  function setActiveLink() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-links a, .navbar-mobile-menu a').forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === current);
    });
  }
```

Then call it inside the existing `init()` function, as its first line:

```js
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
```

Update the exported API to include the new function for testability:

```js
  const api = { init, setActiveLink };
```

- [ ] **Step 3: Verify navigation.js syntax and exports**

```bash
node --check assets/js/navigation.js
node -e "const nav = require('./assets/js/navigation.js'); if (typeof nav.setActiveLink !== 'function') throw new Error('setActiveLink missing'); console.log('navigation.js OK');"
```
Expected: no syntax errors, `navigation.js OK`.

- [ ] **Step 4: Extend active-link styling in navigation.css**

Find the existing rule:
```css
.navbar-links a.active { color: var(--color-teal); border-bottom: 2px solid var(--color-teal); padding-bottom: var(--space-4); }
```
Replace it with:
```css
.navbar-links a.active, .navbar-mobile-menu a.active { color: var(--color-teal); }
.navbar-links a.active { border-bottom: 2px solid var(--color-teal); padding-bottom: var(--space-4); }
```

- [ ] **Step 5: Verify in browser on the existing Home page**

Since `about.html` doesn't exist yet, verify this doesn't regress Home: open `http://localhost:8796/index.html` (or whatever port `preview_start` with `{name: "giantfuse"}` assigns), confirm via `read_page` or a DOM check that `.navbar-links a[href="index.html"]` has class `active` and no other nav link does. Confirm zero console errors.

- [ ] **Step 6: Commit**

```bash
git add components/navbar.html assets/js/navigation.js assets/css/navigation.css
git commit -m "fix: make navbar active link dynamic instead of hardcoded to Home"
```

---

## Task 2: New icons for the About page

**Files:**
- Modify: `assets/js/main.js`

**Interfaces:**
- Consumes: nothing new.
- Produces: 9 new keys in the existing `ICONS` object — `target`, `eye`, `flag`, `lightbulb`, `leaf`, `checkmark`, `magnifyingGlass`, `globe`, `locationPin` — consumed by Task 3+ as literal inline SVG copied into `about.html` (not fetched at runtime; matching how Home's value-strip icons are hand-inlined rather than rendered from the map).

- [ ] **Step 1: Add the 9 new icons to the ICONS map in main.js**

In `assets/js/main.js`, add these entries to the existing `ICONS` object (after the `building` entry, before the closing `};`):

```js
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12 C5 6 9 4 12 4 C15 4 19 6 22 12 C19 18 15 20 12 20 C9 20 5 18 2 12 Z"/><circle cx="12" cy="12" r="3"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="3" x2="5" y2="21"/><path d="M5 4 L19 4 L15.5 8 L19 12 L5 12 Z"/></svg>',
    lightbulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18 L15 18"/><path d="M10 21 L14 21"/><path d="M12 3 C8 3 6 6 6 9 C6 11.5 7.2 13 8.5 14.5 C9 15 9 16 9 17 L15 17 C15 16 15 15 15.5 14.5 C16.8 13 18 11.5 18 9 C18 6 16 3 12 3 Z"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19 C5 10 10 4 20 4 C20 14 14 19 5 19 Z"/><path d="M5 19 C9 15 12 11 17 7"/></svg>',
    checkmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4,13 9,18 20,6"/></svg>',
    magnifyingGlass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="21" y2="21"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><line x1="3" y1="12" x2="21" y2="12"/></svg>',
    locationPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21 C12 21 5 14 5 9 C5 5.5 8.1 3 12 3 C15.9 3 19 5.5 19 9 C19 14 12 21 12 21 Z"/><circle cx="12" cy="9" r="2.3"/></svg>'
```

Do not modify any existing key (`bank`, `people`, `shield`, `growth`, `trend`, `pie`, `building`) or any other function in the file.

- [ ] **Step 2: Verify all 16 icon keys exist and are well-formed**

```bash
node -e "
const { ICONS } = require('./assets/js/main.js');
const assert = require('assert');
const required = ['bank','people','shield','growth','trend','pie','building','target','eye','flag','lightbulb','leaf','checkmark','magnifyingGlass','globe','locationPin'];
required.forEach((key) => {
  assert.ok(ICONS[key], 'Missing icon: ' + key);
  assert.ok(ICONS[key].startsWith('<svg'), key + ' is not an svg string');
  assert.ok(ICONS[key].endsWith('</svg>'), key + ' svg string not closed');
});
console.log('ICONS OK:', Object.keys(ICONS).length, 'icons');
"
node --check assets/js/main.js
```
Expected: `ICONS OK: 16 icons`, no syntax errors.

- [ ] **Step 3: Commit**

```bash
git add assets/js/main.js
git commit -m "feat: add 9 new icons for the About page (target, eye, flag, lightbulb, leaf, checkmark, magnifyingGlass, globe, locationPin)"
```

---

## Task 3: About page shell + hero

**Files:**
- Create: `about.html`
- Create: `assets/css/pages/about.css`

**Interfaces:**
- Consumes: `.hero`/`.hero-media`/`.hero-overlay`/`.hero-copy` from `assets/css/pages/home.css`... **wait — `about.html` does NOT link `home.css`.** The `.hero` base rules must be duplicated into `about.css` since each page only loads its own `pages/*.css` file. Copy the `.hero`, `.hero-media`, `.hero-overlay`, `.hero-copy` rules from `home.css` verbatim into `about.css`, then add the banner-height override on top.
- Produces: the page shell every later task in this plan adds sections into (`<main>` placement, `<div data-include>` placement, script tags) — later tasks insert markup between the hero and the footer include, matching how Home's tasks incrementally built out `<main>`.

- [ ] **Step 1: Write about.html (head + navbar/footer includes + hero + empty main + scripts)**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About Us | Giantfuse Capital Partners</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Lato:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/global.css">
  <link rel="stylesheet" href="assets/css/typography.css">
  <link rel="stylesheet" href="assets/css/navigation.css">
  <link rel="stylesheet" href="assets/css/footer.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <link rel="stylesheet" href="assets/css/animationa.css">
  <link rel="stylesheet" href="assets/css/pages/about.css">
</head>
<body>
  <div data-include="navbar"></div>

  <section class="hero hero-banner" data-reveal>
    <div class="hero-media">
      <img src="assets/images/pexels-ekam-juneja-61080223-9516077.jpg" alt="Glass office towers viewed from below" loading="eager">
    </div>
    <div class="hero-overlay"></div>
    <div class="hero-copy">
      <span class="eyebrow">About Us</span>
      <h1>Built on Discipline.<br>Driven by <span class="text-teal">Opportunity</span>.</h1>
      <p>Giantfuse Capital Partners is an alternative investment and asset management firm focused on generating sustainable, long-term value across private markets.</p>
    </div>
  </section>

  <main>
  </main>

  <div data-include="footer"></div>

  <script src="assets/js/counters.js"></script>
  <script src="assets/js/scroll-effects.js"></script>
  <script src="assets/js/navigation.js"></script>
  <script src="assets/js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write about.css with the hero rules (copied base + banner override)**

```css
.hero {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  margin-top: calc(-1 * var(--navbar-height));
  padding-top: calc(var(--navbar-height) + var(--space-48));
  display: flex;
  align-items: center;
  overflow: hidden;
}
.hero-media { position: absolute; inset: 0; z-index: 0; }
.hero-media img { width: 100%; height: 100%; object-fit: cover; }
.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(rgba(13, 27, 42, 0.55), rgba(13, 27, 42, 0.78));
}
.hero-copy {
  position: relative;
  z-index: 2;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-24) var(--space-64);
}
.hero h1 { margin-bottom: var(--space-16); color: var(--color-white); }
.hero p { max-width: 480px; margin-bottom: var(--space-24); color: var(--color-light-gray); }
.hero .eyebrow { margin-bottom: var(--space-16); }

.hero-banner {
  min-height: 480px;
  padding-bottom: var(--space-32);
}
.hero-banner .hero-copy { padding-bottom: var(--space-32); }
```

Note: `.hero-banner` overrides `min-height` down from the `100vh`/`100svh` inherited from `.hero`, and trims the bottom padding since there's no room budget for a full-screen section here. `margin-top`/`padding-top` (navbar clearance) stay the same as the base `.hero` rule — both are still needed regardless of section height.

- [ ] **Step 3: Verify HTML/CSS syntax and file structure**

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('about.html', 'utf8');
if (!html.includes('data-include=\"navbar\"')) throw new Error('missing navbar include');
if (!html.includes('data-include=\"footer\"')) throw new Error('missing footer include');
if (!html.includes('hero-banner')) throw new Error('missing hero-banner class');
if (!html.includes('assets/css/pages/about.css')) throw new Error('missing about.css link');
console.log('about.html structure OK');
"
```
Expected: `about.html structure OK`

- [ ] **Step 4: Verify in browser**

Open `http://localhost:8796/about.html` via the dev server. Expected: navbar renders with "About Us" showing as the active link (teal, underlined) — confirming Task 1's fix works for a real second page, not just in theory. Hero renders with the eyebrow "About Us", heading "Built on Discipline. Driven by Opportunity." (Opportunity in teal), paragraph, and the glass-tower photo as a full-bleed background with a dark overlay. Measure `document.querySelector('.hero').getBoundingClientRect().height` — expected to be close to 480px, NOT close to the viewport height (which would indicate the banner override didn't apply). Footer renders (empty `<main>` is fine at this point). Zero console errors.

- [ ] **Step 5: Commit**

```bash
git add about.html assets/css/pages/about.css
git commit -m "feat: add About page shell with banner-height hero"
```

---

## Task 4: Who We Are + Purpose/Vision/Mission

**Files:**
- Modify: `about.html` (add two sections inside `<main>`)
- Modify: `assets/css/pages/about.css` (append)

**Interfaces:**
- Consumes: `.icon-badge`, `.icon-badge-outline` from `components.css` (already loaded via `about.html`'s `<head>`); `target`/`eye`/`flag` icons from Task 2.

- [ ] **Step 1: Append CSS for both sections**

```css
.about-who-we-are { display: grid; grid-template-columns: 1fr; gap: var(--space-32); align-items: center; }
@media (min-width: 1025px) { .about-who-we-are { grid-template-columns: 1.2fr 1fr; gap: var(--space-48); } }
.about-who-we-are p { margin-bottom: var(--space-16); }
.about-who-we-are p:last-child { margin-bottom: 0; }

.stat-box {
  background: var(--color-light-gray);
  border-radius: var(--radius-md);
  padding: var(--space-32);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-24) var(--space-32);
}
.stat-box-item { padding-bottom: var(--space-16); border-bottom: 1px solid rgba(13, 27, 42, 0.12); }
.stat-box-item:nth-child(3), .stat-box-item:nth-child(4) { border-bottom: none; padding-bottom: 0; }
.stat-box-item strong { display: block; font-family: 'Space Grotesk', sans-serif; font-size: 1.5rem; color: var(--color-navy); margin-bottom: var(--space-4); }
.stat-box-item span { font-size: 0.85rem; color: var(--color-slate); }

.purpose-band { background: var(--color-navy); padding: var(--space-64) 0; }
.purpose-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-32); text-align: center; }
@media (min-width: 641px) { .purpose-grid { grid-template-columns: repeat(3, 1fr); } }
.purpose-item .icon-badge { width: 80px; height: 80px; margin: 0 auto var(--space-16); }
.purpose-item .icon-badge svg { width: 36px; height: 36px; }
.purpose-item h3 { color: var(--color-white); margin-bottom: var(--space-8); }
.purpose-item p { color: var(--color-light-gray); max-width: 320px; margin: 0 auto; }
```

- [ ] **Step 2: Insert both sections into about.html's `<main>`**

Replace the empty `<main>\n  </main>` with:

```html
  <main>
    <section class="section" data-reveal>
      <div class="container about-who-we-are">
        <div>
          <h2>Who <span class="text-teal">We Are</span></h2>
          <p>Giantfuse Capital Partners is a South African alternative investment firm, committed to delivering superior, risk-adjusted returns for our investors through disciplined capital allocation, deep sector insight and active portfolio management.</p>
          <p>We invest across a diversified range of private markets, leveraging local expertise and global perspectives to unlock opportunities that create lasting value for our investors and the broader economy.</p>
        </div>
        <div class="stat-box">
          <div class="stat-box-item"><strong>2014</strong><span>Year Established</span></div>
          <div class="stat-box-item"><strong>Sandton</strong><span>Johannesburg, South Africa</span></div>
          <div class="stat-box-item"><strong>Institutional</strong><span>Investor Focus</span></div>
          <div class="stat-box-item"><strong>Alternative</strong><span>Investment Manager</span></div>
        </div>
      </div>
    </section>

    <section class="purpose-band" data-reveal>
      <div class="container purpose-grid">
        <div class="purpose-item">
          <div class="icon-badge icon-badge-outline">${TARGET_ICON}</div>
          <h3>Our Purpose</h3>
          <p>To build enduring value for our investors and stakeholders through disciplined investment and responsible stewardship.</p>
        </div>
        <div class="purpose-item">
          <div class="icon-badge icon-badge-outline">${EYE_ICON}</div>
          <h3>Our Vision</h3>
          <p>To be the partner of choice for alternative investment solutions in Africa and beyond.</p>
        </div>
        <div class="purpose-item">
          <div class="icon-badge icon-badge-outline">${FLAG_ICON}</div>
          <h3>Our Mission</h3>
          <p>To deliver superior risk-adjusted returns by investing with insight, integrity and long-term conviction.</p>
        </div>
      </div>
    </section>
  </main>
```

Replace `${TARGET_ICON}`, `${EYE_ICON}`, `${FLAG_ICON}` with the literal SVG strings from Task 2's `target`, `eye`, and `flag` entries respectively (copy the exact SVG markup, not the JS string — i.e. `<svg viewBox="0 0 24 24" ...>...</svg>` directly as HTML, no quotes/escaping).

- [ ] **Step 3: Verify in browser**

Reload `http://localhost:8796/about.html`. Expected: "Who We Are" section shows two paragraphs left, a light-gray 2×2 stat box right with `2014`/`Sandton`/`Institutional`/`Alternative` and their labels, top row divided from bottom row by a hairline. Below it, a dark navy band with 3 items (Our Purpose/Our Vision/Our Mission), each with a circular teal-outlined icon. Check responsive: stat box and Who We Are stack to one column below 1025px; Purpose/Vision/Mission stacks to one column below 641px. Zero console errors.

- [ ] **Step 4: Commit**

```bash
git add about.html assets/css/pages/about.css
git commit -m "feat: add Who We Are and Purpose/Vision/Mission sections to About page"
```

---

## Task 5: Core Values + Who We Serve

**Files:**
- Modify: `about.html`
- Modify: `assets/css/pages/about.css`

**Interfaces:**
- Consumes: `.grid-5`, `.icon-badge` from `components.css`; `shield`/`growth`/`people`/`lightbulb`/`leaf`/`checkmark` icons (shield/growth/people from the original set, lightbulb/leaf/checkmark from Task 2).

- [ ] **Step 1: Append CSS**

```css
.value-card { background: var(--color-white); border: 1px solid var(--color-light-gray); border-radius: var(--radius-md); padding: var(--space-24); text-align: center; }
.value-card .icon-badge { margin: 0 auto var(--space-16); }
.value-card h3 { font-size: 1.125rem; margin-bottom: var(--space-8); }
.value-card p { font-size: 0.9rem; }

.about-who-we-serve { display: grid; grid-template-columns: 1fr; gap: var(--space-32); align-items: center; }
@media (min-width: 1025px) { .about-who-we-serve { grid-template-columns: 1fr 1.1fr; gap: var(--space-48); } }
.about-image { border-radius: var(--radius-md); overflow: hidden; aspect-ratio: 4 / 3; }
.about-image img { width: 100%; height: 100%; object-fit: cover; }
.checklist { display: flex; flex-direction: column; gap: var(--space-16); margin-top: var(--space-24); }
.checklist li { display: flex; align-items: center; gap: var(--space-12); font-weight: 600; color: var(--color-navy); }
.checklist .icon-badge { width: 28px; height: 28px; }
.checklist .icon-badge svg { width: 16px; height: 16px; }
```

- [ ] **Step 2: Append both sections into about.html's `<main>`, after the purpose-band section's closing `</section>`**

```html
    <section class="section" data-reveal>
      <div class="container">
        <div class="section-heading">
          <h2>Our <span class="text-teal">Core Values</span></h2>
          <p>The principles that guide how we invest, operate and build lasting partnerships.</p>
        </div>
        <div class="grid-5">
          <div class="value-card">
            <div class="icon-badge">${SHIELD_ICON}</div>
            <h3>Integrity</h3>
            <p>Doing what is right, always.</p>
          </div>
          <div class="value-card">
            <div class="icon-badge">${GROWTH_ICON}</div>
            <h3>Performance</h3>
            <p>Delivering sustainable, risk-adjusted returns.</p>
          </div>
          <div class="value-card">
            <div class="icon-badge">${PEOPLE_ICON}</div>
            <h3>Partnership</h3>
            <p>Growing with our Investors and stakeholders.</p>
          </div>
          <div class="value-card">
            <div class="icon-badge">${LIGHTBULB_ICON}</div>
            <h3>Expertise</h3>
            <p>Investing with depth, discipline and insight.</p>
          </div>
          <div class="value-card">
            <div class="icon-badge">${LEAF_ICON}</div>
            <h3>Responsibility</h3>
            <p>Creating value for future generations.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" data-reveal>
      <div class="container about-who-we-serve">
        <div class="about-image">
          <img src="assets/images/office/pexels-startup-stock-photos-7070.jpg" alt="Boardroom overlooking the city skyline" loading="lazy">
        </div>
        <div>
          <h2>Who <span class="text-teal">We Serve</span></h2>
          <p>We partner with sophisticated investors who seek long-term value and strategic access to private market opportunities.</p>
          <ul class="checklist">
            <li><span class="icon-badge">${CHECKMARK_ICON}</span>Institutional Investors</li>
            <li><span class="icon-badge">${CHECKMARK_ICON}</span>Family Investment Groups</li>
            <li><span class="icon-badge">${CHECKMARK_ICON}</span>Qualified High-Net-Worth Investors</li>
          </ul>
        </div>
      </div>
    </section>
```

Replace each `${...}` placeholder with the corresponding literal SVG markup (`shield`, `growth`, `people` from the original `ICONS` set; `lightbulb`, `leaf`, `checkmark` from Task 2).

- [ ] **Step 3: Verify in browser**

Reload. Expected: "Our Core Values" shows 5 cards (Integrity/Performance/Partnership/Expertise/Responsibility) in a row at desktop width, collapsing to fewer columns on smaller screens (via the existing `.grid-5` responsive rules: 2/3/5 columns at mobile/tablet/desktop). "Who We Serve" shows the office photo on the left (desktop) and a 3-item checklist with checkmark icons on the right. Zero console errors, image loads (network 200).

- [ ] **Step 4: Commit**

```bash
git add about.html assets/css/pages/about.css
git commit -m "feat: add Core Values and Who We Serve sections to About page"
```

---

## Task 6: Investment Approach + Geographic Footprint

**Files:**
- Modify: `about.html`
- Modify: `assets/css/pages/about.css`

**Interfaces:**
- Consumes: `.grid-5`, `.icon-badge` from `components.css`; `magnifyingGlass`/`growth`/`pie`/`leaf`/`globe`/`locationPin` icons.

- [ ] **Step 1: Append CSS**

```css
.approach-step { background: var(--color-off-white); border: 1px solid var(--color-light-gray); border-radius: var(--radius-md); padding: var(--space-24); position: relative; }
.approach-number { position: absolute; top: var(--space-16); right: var(--space-16); font-family: 'Space Grotesk', sans-serif; font-size: 0.85rem; font-weight: 700; color: var(--color-sea-glass); }
.approach-step .icon-badge { margin-bottom: var(--space-16); }
.approach-step h3 { font-size: 1.05rem; margin-bottom: var(--space-8); }
.approach-step p { font-size: 0.85rem; }

.geo-footprint { background: var(--color-light-gray); }
.geo-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-32); align-items: center; }
@media (min-width: 1025px) { .geo-grid { grid-template-columns: 1fr 1fr; gap: var(--space-48); } }
.geo-visual { position: relative; min-height: 260px; }
.geo-dots {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-md);
  background-image: radial-gradient(var(--color-steel-teal) 1.5px, transparent 1.5px);
  background-size: 16px 16px;
  opacity: 0.35;
}
.office-card {
  position: relative;
  z-index: 1;
  max-width: 280px;
  margin-left: auto;
  background: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 16px rgba(13, 27, 42, 0.1);
  padding: var(--space-24);
  display: flex;
  gap: var(--space-16);
  align-items: flex-start;
}
.office-card h4 { margin-bottom: var(--space-8); }
.office-card p { font-size: 0.9rem; }
```

- [ ] **Step 2: Append both sections into about.html's `<main>`, after the Who We Serve section's closing `</section>`**

```html
    <section class="section" data-reveal>
      <div class="container">
        <div class="section-heading">
          <h2>Our <span class="text-teal">Investment Approach</span></h2>
          <p>A structured, disciplined process designed to unlock value and manage risk.</p>
        </div>
        <div class="grid-5">
          <div class="approach-step">
            <span class="approach-number">01</span>
            <div class="icon-badge">${MAGNIFYING_GLASS_ICON}</div>
            <h3>Opportunity Sourcing</h3>
            <p>Access to high-quality, differentiated opportunities.</p>
          </div>
          <div class="approach-step">
            <span class="approach-number">02</span>
            <div class="icon-badge">${GROWTH_ICON}</div>
            <h3>Rigorous Due Diligence</h3>
            <p>Deep analysis, insight and independent thinking.</p>
          </div>
          <div class="approach-step">
            <span class="approach-number">03</span>
            <div class="icon-badge">${PIE_ICON}</div>
            <h3>Disciplined Allocation</h3>
            <p>Investing with a clear focus on risk-adjusted returns.</p>
          </div>
          <div class="approach-step">
            <span class="approach-number">04</span>
            <div class="icon-badge">${LEAF_ICON}</div>
            <h3>Active Value Creation</h3>
            <p>Driving growth, resilience and sustainable value.</p>
          </div>
          <div class="approach-step">
            <span class="approach-number">05</span>
            <div class="icon-badge">${GLOBE_ICON}</div>
            <h3>Long-Term Outcomes</h3>
            <p>Delivering enduring value for our investors and society.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section geo-footprint" data-reveal>
      <div class="container geo-grid">
        <div>
          <h2>Our <span class="text-teal">Geographic Footprint</span></h2>
          <p>Headquartered in Sandton, Johannesburg, we invest across South Africa with a broader focus on selected opportunities in key African markets.</p>
        </div>
        <div class="geo-visual">
          <div class="geo-dots" aria-hidden="true"></div>
          <div class="office-card">
            <div class="icon-badge">${LOCATION_PIN_ICON}</div>
            <div>
              <h4>Our Office</h4>
              <p>155 West Street<br>Sandton, Johannesburg<br>South Africa</p>
            </div>
          </div>
        </div>
      </div>
    </section>
```

Replace each `${...}` placeholder with the corresponding literal SVG markup (`magnifyingGlass`, `growth`, `pie`, `leaf`, `globe`, `locationPin` — `leaf` is reused a second time here, same as it was used once already in Core Values' Responsibility card).

- [ ] **Step 3: Verify in browser**

Reload. Expected: "Our Investment Approach" shows 5 numbered cards (01–05) with icons, titles, and descriptions in the established `.grid-5` responsive layout. "Our Geographic Footprint" shows copy on the left and, on the right, a dot-pattern decorative box with an office-address card overlaid (155 West Street, Sandton, Johannesburg, South Africa). Zero console errors.

- [ ] **Step 4: Commit**

```bash
git add about.html assets/css/pages/about.css
git commit -m "feat: add Investment Approach and Geographic Footprint sections to About page"
```

---

## Task 7: Closing CTA + full-page QA

**Files:**
- Modify: `about.html`

**Interfaces:**
- Consumes: `.closing-cta`/`.closing-cta-inner`/`.closing-cta-mark` from `home.css`... **same caveat as Task 3: `about.html` doesn't load `home.css`.** These rules must also be copied into `about.css`.

- [ ] **Step 1: Append the closing-cta rules to about.css**

```css
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

- [ ] **Step 2: Append the closing CTA section into about.html's `<main>`, after the Geographic Footprint section's closing `</section>` and before `</main>`**

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

- [ ] **Step 3: Full-page verification against the wireframe**

Reload `http://localhost:8796/about.html`. Scroll top to bottom and confirm section order matches `docs/wireframes/about.png`: navbar → hero → Who We Are → Purpose/Vision/Mission → Core Values → Who We Serve → Investment Approach → Geographic Footprint → closing CTA → footer. Confirm the navbar shows "About Us" as active. Confirm every network request (CSS, JS, both photos, logo) returns 200 — zero 404s. Check responsive layout at 375px, 768px, and 1280px via `resize_window` + DOM checks. Check `read_console_messages` for zero errors.

- [ ] **Step 4: Regression-check Home**

Reload `http://localhost:8796/index.html`. Confirm "Home" still shows as active in the nav (proves Task 1's dynamic active-link logic works correctly for both pages, not just About). Confirm Home's hero is still full `100vh`/`100svh` (proves About's `.hero-banner` override didn't leak into `home.css` — they're separate files, but worth confirming visually since both define a `.hero` base rule).

- [ ] **Step 5: Commit**

```bash
git add about.html assets/css/pages/about.css
git commit -m "feat: add closing CTA and complete About page"
```

## Self-review notes

- **Spec coverage:** every section in the spec's "Page sections" list maps to a task — navbar fix (Task 1), icons (Task 2), shell+hero (Task 3), Who We Are + Purpose/Vision/Mission (Task 4), Core Values + Who We Serve (Task 5), Investment Approach + Geographic Footprint (Task 6), closing CTA + footer + QA (Task 7). The dynamic active-link fix and the hero photo/hardcoded-image decisions are both covered explicitly.
- **Placeholder scan:** no TBD/TODO. The `${ICON}` placeholders in Tasks 4–6 are explicit copy-paste instructions with the exact source (Task 2's icon strings), not vague gaps — each is named and the source is unambiguous.
- **Type/name consistency:** `.icon-badge`/`.icon-badge-outline`, `.grid-5`, `.card`-adjacent classes (`.value-card`, `.approach-step`) are used consistently with the existing `components.css` conventions. `setActiveLink`/`init` names in `navigation.js` match what Task 1 defines and nothing later contradicts them.
- **Scope:** limited to the About page and the one shared-component bug fix it exposes. Other pages remain explicitly out of scope per Global Constraints.
