# Strategies Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `strategies.html` against `docs/wireframes/Stratefgies.png`, reusing and extending the existing `data/strategies.json`, and extract the hero/closing-cta/checklist CSS that Home and About currently duplicate into shared files now that a third page needs the same patterns.

**Architecture:** Plain HTML/CSS/JS, no build tool — matching Home and About. `data/strategies.json` gains three new fields (`subtitle`, `fullDescription`, `highlights`) that Home's existing `renderStrategies()` ignores (additive, non-breaking); Strategies gets its own `renderStrategyDetails()` function and its own inline card template, so nothing about Home's already-shipped card rendering changes. `.hero*`/`.hero-banner`/`.closing-cta*` move from `home.css`+`about.css` into a new `assets/css/shared-sections.css` loaded by all three pages; `.checklist*` moves from `about.css` into `components.css` (it's a reusable UI primitive, not a page section, so it belongs alongside `.btn`/`.icon-badge`/`.card`).

**Tech Stack:** Same as the rest of the site — plain HTML/CSS/JS, no build tool, `node --check` / `node -e` for ad-hoc verification, live browser checks for everything else.

## Global Constraints

- No build tool, bundler, or framework — plain HTML/CSS/JS only.
- Reuse existing shared classes wherever they fit: `.btn`/`.btn-solid`/`.btn-outline`, `.card`, `.icon-badge`/`.icon-badge-outline`, `.checklist`, `.grid-5`, `.section`/`.section-heading`, `.container`, `.hero`/`.hero-media`/`.hero-overlay`/`.hero-copy`/`.hero-banner`, `.closing-cta`. Do not redefine these in `strategies.css`.
- No new icons needed: `target`, `globe`, `shield`, `growth`, `pie`, `building`, `checkmark` all already exist in `main.js`'s `ICONS` map.
- Hero photo: `assets/images/strategies/pexels-constanze-marie-3872134-17879690.jpg` (its first use anywhere — a city-skyline shot, wide/landscape, suitable for a full-bleed banner hero).
- `--navbar-height` is self-adjusting via `main.js`'s `syncNavbarHeight()` — never hardcode a navbar height.
- Current typography: headings `'Space Grotesk', sans-serif`, body `'Lato', sans-serif`. `strategies.html`'s `<head>` must load the same Google Fonts link as `index.html`/`about.html`.
- `strategies.html`'s `<head>` must include the favicon link (`<link rel="icon" type="image/png" href="assets/images/icons/favicon.png">`), matching Home and About.
- The 4 strategy slugs — `private-equity`, `hedge-fund-solutions`, `real-estate`, `credit-insurance` — are already load-bearing: Home's strategy cards and the footer's "Our Strategies" column both link to `strategies.html#<slug>` today. Each Core Strategies card on this page must carry a matching `id` so those existing links resolve to the right card, not just to the top of the page.
- Only `strategies.html`, `assets/css/pages/strategies.css`, `assets/css/shared-sections.css`, `assets/css/components.css`, `assets/css/pages/home.css`, `assets/css/pages/about.css`, `data/strategies.json`, `assets/js/main.js`, `index.html`, and `about.html` are in scope (the last four only for the Task 1 refactor). Do not touch `leadership.html`, `insights.html`, `philosophies.html`, or `contact.html`.

---

## Task 1: Extract shared hero/closing-cta/checklist CSS

Home and About each currently duplicate `.hero`/`.hero-media`/`.hero-overlay`/`.hero-copy`/`.closing-cta*` verbatim (confirmed with the user during this page's design that a third page needing the same pattern is the trigger to stop duplicating). Separately, About's `.checklist*` rules will now also be needed by this page — moving them to `components.css` (where `.btn`/`.icon-badge`/`.card` already live) avoids a third duplication of a different kind. This task is a pure refactor: after it, Home and About must look and behave identically to before.

**Files:**
- Create: `assets/css/shared-sections.css`
- Modify: `assets/css/pages/home.css`
- Modify: `assets/css/pages/about.css`
- Modify: `assets/css/components.css`
- Modify: `index.html`
- Modify: `about.html`

**Interfaces:**
- Produces: `.hero`, `.hero-media`, `.hero-overlay`, `.hero-copy`, `.hero h1`, `.hero p`, `.hero .eyebrow`, `.hero-actions`, `.hero-banner`, `.hero-banner .hero-copy`, `.closing-cta`, `.closing-cta-inner`, `.closing-cta-mark` in `shared-sections.css`. Produces `.checklist`, `.checklist li`, `.checklist .icon-badge`, `.checklist .icon-badge svg` in `components.css`. Task 2 (this page's hero) and Task 4 (this page's checklist) consume these directly with no further changes needed to them.

- [ ] **Step 1: Create assets/css/shared-sections.css**

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
.hero-actions { display: flex; flex-wrap: wrap; gap: var(--space-16); }

.hero-banner {
  min-height: 480px;
  padding-bottom: var(--space-32);
}
.hero-banner .hero-copy { padding-bottom: var(--space-32); }

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

- [ ] **Step 2: Remove the now-duplicated rules from home.css**

Read the current `assets/css/pages/home.css` first. Delete these two blocks (they now live in `shared-sections.css`):

The `.hero` block at the top of the file (from `.hero {` through the end of `.hero-actions { display: flex; flex-wrap: wrap; gap: var(--space-16); }`) — 29 lines.

The `.closing-cta` block near the bottom (from `.closing-cta { padding: var(--space-48) 0; }` through `.closing-cta-mark { font-size: 2rem; color: var(--color-teal); }`) — 11 lines, including the `@media (min-width: 1025px)` block in between.

`home.css` should end up containing only `.value-strip*` and `.cta-band*` rules — nothing else. Do not change those rules themselves.

- [ ] **Step 3: Remove the now-duplicated rules from about.css**

Read the current `assets/css/pages/about.css` first. Delete:

The `.hero` block at the top (same content as home.css's, through `.hero .eyebrow { margin-bottom: var(--space-16); }`) AND the `.hero-banner`/`.hero-banner .hero-copy` block immediately after it (both are now in `shared-sections.css`) — 35 lines total.

The `.closing-cta` block near the bottom (same 11-line block as in home.css).

Also delete the `.checklist` block (4 rules: `.checklist { display: flex; flex-direction: column; gap: var(--space-16); margin-top: var(--space-24); }`, `.checklist li { display: flex; align-items: center; gap: var(--space-12); font-weight: 600; color: var(--color-navy); }`, `.checklist .icon-badge { width: 28px; height: 28px; }`, `.checklist .icon-badge svg { width: 16px; height: 16px; }`) — these move to `components.css` in Step 4.

`about.css` should end up containing: `.about-who-we-are*`, `.stat-box*`, `.purpose-band*`/`.purpose-grid*`/`.purpose-item*`, `.value-card*`, `.about-who-we-serve*`, `.about-image*`, `.approach-step*`/`.approach-number`, `.geo-footprint*`/`.geo-grid*`/`.geo-visual`/`.geo-dots`/`.office-card*` — nothing else.

- [ ] **Step 4: Add the checklist rules to components.css**

Append to the end of `assets/css/components.css`:

```css
.checklist { display: flex; flex-direction: column; gap: var(--space-16); margin-top: var(--space-24); }
.checklist li { display: flex; align-items: center; gap: var(--space-12); font-weight: 600; color: var(--color-navy); }
.checklist .icon-badge { width: 28px; height: 28px; }
.checklist .icon-badge svg { width: 16px; height: 16px; }
```

(This is the exact same content removed from about.css in Step 3 — a pure move, not a rewrite.)

- [ ] **Step 5: Add the shared-sections.css link to index.html and about.html**

In `index.html`, insert a new `<link>` immediately before the existing `<link rel="stylesheet" href="assets/css/pages/home.css">` line:

```html
  <link rel="stylesheet" href="assets/css/shared-sections.css">
  <link rel="stylesheet" href="assets/css/pages/home.css">
```

In `about.html`, insert the same new `<link>` immediately before the existing `<link rel="stylesheet" href="assets/css/pages/about.css">` line:

```html
  <link rel="stylesheet" href="assets/css/shared-sections.css">
  <link rel="stylesheet" href="assets/css/pages/about.css">
```

- [ ] **Step 6: Verify the refactor is byte-preserving**

```bash
node -e "
const fs = require('fs');
const shared = fs.readFileSync('assets/css/shared-sections.css', 'utf8');
['--navbar-height', 'min-height: 100vh', 'min-height: 480px', 'closing-cta-mark'].forEach((s) => {
  if (!shared.includes(s)) throw new Error('shared-sections.css missing: ' + s);
});
const components = fs.readFileSync('assets/css/components.css', 'utf8');
if (!components.includes('.checklist {')) throw new Error('components.css missing .checklist');
const home = fs.readFileSync('assets/css/pages/home.css', 'utf8');
if (home.includes('.hero {') || home.includes('.closing-cta {')) throw new Error('home.css still has duplicated rules');
const about = fs.readFileSync('assets/css/pages/about.css', 'utf8');
if (about.includes('.hero {') || about.includes('.closing-cta {') || about.includes('.checklist {')) throw new Error('about.css still has duplicated rules');
console.log('CSS extraction OK');
"
```
Expected: `CSS extraction OK`

- [ ] **Step 7: Verify Home and About are visually unchanged in the browser**

Open `http://localhost:8796/index.html`. Confirm: hero is still full-viewport height (`document.querySelector('.hero').getBoundingClientRect().height` close to `window.innerHeight`), value-strip and cta-band still render, closing CTA still renders with the ring mark and "Contact Investor Relations" button. Zero console errors, zero 404s.

Open `http://localhost:8796/about.html`. Confirm: hero is still banner height (~480px, not full viewport), all 7 content sections still render (Who We Are through closing CTA), the checklist under "Who We Serve" still shows 3 items with checkmark icons. Zero console errors, zero 404s.

- [ ] **Step 8: Commit**

```bash
git add assets/css/shared-sections.css assets/css/pages/home.css assets/css/pages/about.css assets/css/components.css index.html about.html
git commit -m "refactor: extract shared hero/closing-cta/checklist CSS

Home and About each duplicated .hero/.closing-cta verbatim; a third
page (Strategies) needing the same patterns is the trigger point
agreed during that page's design to stop duplicating. .checklist
moves to components.css since it's a reusable UI primitive, not a
page section."
```

---

## Task 2: Strategies page shell + hero

**Files:**
- Create: `strategies.html`
- Create: `assets/css/pages/strategies.css` (empty at this point — later tasks populate it)

**Interfaces:**
- Consumes: `.hero`, `.hero-banner`, `.hero-media`, `.hero-overlay`, `.hero-copy` from `shared-sections.css` (Task 1).
- Produces: the page shell later tasks insert sections into (`<main>` placement, script tags), matching how Home's and About's tasks incrementally built out `<main>`.

- [ ] **Step 1: Write strategies.html**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Our Business | Giantfuse Capital Partners</title>
  <link rel="icon" type="image/png" href="assets/images/icons/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Lato:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/global.css">
  <link rel="stylesheet" href="assets/css/typography.css">
  <link rel="stylesheet" href="assets/css/navigation.css">
  <link rel="stylesheet" href="assets/css/footer.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <link rel="stylesheet" href="assets/css/animationa.css">
  <link rel="stylesheet" href="assets/css/shared-sections.css">
  <link rel="stylesheet" href="assets/css/pages/strategies.css">
</head>
<body>
  <div data-include="navbar"></div>

  <section class="hero hero-banner" data-reveal>
    <div class="hero-media">
      <img src="assets/images/strategies/pexels-constanze-marie-3872134-17879690.jpg" alt="City skyline of financial district towers against a dramatic sky" loading="eager">
    </div>
    <div class="hero-overlay"></div>
    <div class="hero-copy">
      <h1>Our Investment <span class="text-teal">Strategies</span></h1>
      <p>Diversified. Disciplined. Aligned with our ambition. We invest across a focused set of alternative asset classes to deliver long-term value and sustainable, risk-adjusted returns.</p>
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

- [ ] **Step 2: Create an empty assets/css/pages/strategies.css**

Create the file with no content (0 bytes is fine — later tasks add rules; an empty stylesheet link causes no error).

- [ ] **Step 3: Verify structure**

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('strategies.html', 'utf8');
if (!html.includes('data-include=\"navbar\"')) throw new Error('missing navbar include');
if (!html.includes('data-include=\"footer\"')) throw new Error('missing footer include');
if (!html.includes('hero-banner')) throw new Error('missing hero-banner class');
if (!html.includes('assets/css/shared-sections.css')) throw new Error('missing shared-sections.css link');
if (!html.includes('assets/css/pages/strategies.css')) throw new Error('missing strategies.css link');
console.log('strategies.html structure OK');
"
```
Expected: `strategies.html structure OK`

- [ ] **Step 4: Verify in browser**

Open `http://localhost:8796/strategies.html`. Expected: navbar renders with "Our Business" showing as the active link. Hero renders at banner height (~480px, not full viewport) with the city-skyline photo, "Our Investment Strategies" heading (Strategies in teal), and the paragraph — no CTAs. Footer renders. Zero console errors, zero 404s.

- [ ] **Step 5: Commit**

```bash
git add strategies.html assets/css/pages/strategies.css
git commit -m "feat: add Strategies page shell with banner-height hero"
```

---

## Task 3: A Diversified Investment Platform section

**Files:**
- Modify: `strategies.html`
- Modify: `assets/css/pages/strategies.css`

**Interfaces:**
- Consumes: `.icon-badge`, `.icon-badge-outline` from `components.css`; `target`/`globe`/`shield`/`growth` icons from `main.js`'s `ICONS` map (already exist, no changes needed there).

- [ ] **Step 1: Write strategies.css**

```css
.platform-section { display: grid; grid-template-columns: 1fr; gap: var(--space-32); align-items: center; }
@media (min-width: 1025px) { .platform-section { grid-template-columns: 1fr 1.4fr; gap: var(--space-48); } }
.platform-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-32) var(--space-16); }
@media (min-width: 641px) { .platform-stats { grid-template-columns: repeat(4, 1fr); } }
.platform-stat { text-align: center; padding: 0 var(--space-16); border-left: 1px solid var(--color-light-gray); }
.platform-stat:first-child { border-left: none; }
@media (max-width: 640px) { .platform-stat { border-left: none; } }
.platform-stat .icon-badge { margin: 0 auto var(--space-12); width: 44px; height: 44px; }
.platform-stat .icon-badge svg { width: 22px; height: 22px; }
.platform-stat strong { display: block; font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; color: var(--color-navy); margin-bottom: var(--space-4); }
.platform-stat span { font-size: 0.8rem; color: var(--color-slate); }
```

- [ ] **Step 2: Insert the section into strategies.html's `<main>`**

Replace `<main>\n  </main>` with:

```html
  <main>
    <section class="section" data-reveal>
      <div class="container platform-section">
        <div>
          <h2>A Diversified <span class="text-teal">Investment Platform</span></h2>
          <p>Our strategies are designed to capture attractive risk-adjusted returns across economic cycles, with a focus on capital preservation, income generation and long-term growth.</p>
        </div>
        <div class="platform-stats">
          <div class="platform-stat">
            <div class="icon-badge icon-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg></div>
            <strong>4</strong>
            <span>Core Strategies</span>
          </div>
          <div class="platform-stat">
            <div class="icon-badge icon-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><line x1="3" y1="12" x2="21" y2="12"/></svg></div>
            <strong>Diverse</strong>
            <span>Market Exposure</span>
          </div>
          <div class="platform-stat">
            <div class="icon-badge icon-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 L20 6 V11 C20 16 16.5 19.5 12 21 C7.5 19.5 4 16 4 11 V6 Z"/><path d="M8.5 12 L11 14.5 L16 9"/></svg></div>
            <strong>Risk-Managed</strong>
            <span>Approach</span>
          </div>
          <div class="platform-stat">
            <div class="icon-badge icon-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="19" x2="5" y2="13"/><line x1="12" y1="19" x2="12" y2="9"/><line x1="19" y1="19" x2="19" y2="5"/><line x1="3" y1="19" x2="21" y2="19"/></svg></div>
            <strong>Long-Term</strong>
            <span>Value Creation</span>
          </div>
        </div>
      </div>
    </section>
  </main>
```

- [ ] **Step 3: Verify in browser**

Reload `http://localhost:8796/strategies.html`. Expected: "A Diversified Investment Platform" heading + paragraph on the left, 4 stats (4/Core Strategies, Diverse/Market Exposure, Risk-Managed/Approach, Long-Term/Value Creation) in a row on the right, each with a teal-outlined circular icon. Check responsive: 4 columns at desktop, 4 columns with no dividers below 641px (2×2 layout). Zero console errors.

- [ ] **Step 4: Commit**

```bash
git add strategies.html assets/css/pages/strategies.css
git commit -m "feat: add Diversified Investment Platform section to Strategies page"
```

---

## Task 4: Our Core Strategies section

**Files:**
- Modify: `data/strategies.json`
- Modify: `assets/js/main.js`
- Modify: `strategies.html`
- Modify: `assets/css/pages/strategies.css`

**Interfaces:**
- Consumes: `renderCards`, `loadCardTemplate`... actually this task does NOT use `loadCardTemplate` (that fetches from `components/`) — the card template lives inline in `strategies.html`, matching the pattern About used for its insight-card-template. Consumes `renderCards`, `ICONS` from `main.js` (existing); `.card`, `.icon-badge`, `.checklist` (now in `components.css` after Task 1), `.grid-4` from `components.css`.
- Produces: `renderStrategyDetails()`, added to `init()`'s existing try block alongside `renderStrategies()`/`renderStatistics()`/`renderInsights()`. Follows the exact same silent-no-op-if-container-missing pattern those functions already use, so it's safe to call unconditionally on every page.

- [ ] **Step 1: Extend data/strategies.json with three new fields**

Read the current file first (it has 4 entries already, consumed by Home). Add `subtitle`, `fullDescription`, and `highlights` to each entry — do NOT change the existing `icon`/`title`/`description`/`link` fields, Home's `renderStrategies()` depends on those exactly as they are:

```json
[
  {
    "icon": "growth",
    "title": "Private Equity",
    "description": "Partnering with exceptional businesses to unlock value and drive sustainable growth across sectors.",
    "link": "strategies.html#private-equity",
    "subtitle": "Building value in private businesses",
    "fullDescription": "We invest in high-quality companies with strong fundamentals and growth potential. Our approach focuses on active value creation, operational improvement and strategic growth.",
    "highlights": ["Control and minority investments", "Sector-focused approach", "Active involvement", "Long-term partnerships"]
  },
  {
    "icon": "pie",
    "title": "Hedge Fund Solutions",
    "description": "Access to a range of hedge fund strategies designed to deliver consistent, risk-adjusted returns.",
    "link": "strategies.html#hedge-fund-solutions",
    "subtitle": "Access to exceptional talent",
    "fullDescription": "We provide access to a curated selection of best-in-class hedge fund managers across a range of strategies designed to deliver uncorrelated returns and portfolio diversification.",
    "highlights": ["Global manager network", "Multi-strategy solutions", "Risk-managed allocations", "Enhanced diversification"]
  },
  {
    "icon": "building",
    "title": "Real Estate",
    "description": "Investing in high-quality assets that generate stable income and long-term capital appreciation.",
    "link": "strategies.html#real-estate",
    "subtitle": "Investing in quality assets",
    "fullDescription": "We invest across the real estate value chain to generate stable income and long-term capital appreciation in high-quality properties and developments.",
    "highlights": ["Income-generating assets", "Strategic locations", "Active asset management", "Sustainable developments"]
  },
  {
    "icon": "shield",
    "title": "Credit & Insurance",
    "description": "Delivering attractive yield opportunities through private credit and insurance solutions.",
    "link": "strategies.html#credit-insurance",
    "subtitle": "Providing capital with conviction",
    "fullDescription": "We deploy capital across private credit and insurance solutions, providing attractive yields through disciplined underwriting and strong risk management.",
    "highlights": ["Private credit solutions", "Insurance-linked investments", "Strong risk discipline", "Attractive risk-adjusted yields"]
  }
]
```

- [ ] **Step 2: Verify JSON is still valid and Home's fields are untouched**

```bash
node -e "
const fs = require('fs');
const items = JSON.parse(fs.readFileSync('data/strategies.json', 'utf8'));
const assert = require('assert');
assert.strictEqual(items.length, 4);
items.forEach((item) => {
  assert.ok(item.icon && item.title && item.description && item.link, 'missing original field');
  assert.ok(item.subtitle && item.fullDescription && Array.isArray(item.highlights) && item.highlights.length === 4, 'missing new field');
});
console.log('strategies.json OK: 4 items, original + new fields present');
"
```
Expected: `strategies.json OK: 4 items, original + new fields present`

- [ ] **Step 3: Add renderStrategyDetails to main.js**

Read the current `assets/js/main.js` first. Insert this new function after `renderInsights()` and before `init()`:

```js
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
```

Update `init()`'s existing try block to also call it, as the last render call:

```js
    try {
      await renderStrategies();
      await renderStatistics();
      await renderInsights();
      await renderStrategyDetails();
    } catch (error) {
      console.error('Failed to render dynamic content:', error);
    } finally {
```

(Only that one line — `await renderStrategyDetails();` — is new inside the try block. Everything else in `init()` stays exactly as it is.)

- [ ] **Step 4: Verify main.js syntax and that existing exports/functions are unaffected**

```bash
node --check assets/js/main.js
node -e "
const m = require('./assets/js/main.js');
const assert = require('assert');
assert.ok(m.ICONS && m.ICONS.checkmark, 'ICONS.checkmark missing');
assert.strictEqual(typeof m.renderCards, 'function');
console.log('main.js OK');
"
```
Expected: no syntax errors, `main.js OK`

- [ ] **Step 5: Append strategy-detail-card CSS to strategies.css**

```css
.strategy-detail-card .icon-badge { margin-top: -32px; border: 3px solid var(--color-white); }
.strategy-subtitle { font-size: 0.85rem; color: var(--color-slate); font-style: italic; margin-bottom: var(--space-12); }
.strategy-detail-card .checklist { margin: var(--space-16) 0; gap: var(--space-8); }
.strategy-detail-card .checklist li { font-weight: 400; font-size: 0.85rem; color: var(--color-slate); }
.strategy-detail-card .checklist .icon-badge { width: 20px; height: 20px; background: transparent; color: var(--color-teal); }
.strategy-detail-card .checklist .icon-badge svg { width: 12px; height: 12px; }
```

- [ ] **Step 6: Insert the section and inline template into strategies.html**

Append inside `<main>`, after the platform-section's closing `</section>`:

```html
    <section class="section" data-reveal>
      <div class="container">
        <div class="section-heading">
          <h2>Our Core <span class="text-teal">Strategies</span></h2>
          <p>Focused strategies. Deep expertise. Measurable outcomes.</p>
        </div>
        <div class="grid-4" id="strategy-details-grid"></div>
      </div>
      <template id="strategy-detail-template">
        <div class="card strategy-detail-card" data-reveal>
          <div class="card-media">Photo: strategy-background</div>
          <div class="card-body">
            <div class="icon-badge" data-field="icon"></div>
            <h3 data-field="title"></h3>
            <p class="strategy-subtitle" data-field="subtitle"></p>
            <p data-field="description"></p>
            <ul class="checklist" data-field="highlights"></ul>
            <a href="#" class="card-link" data-field="link">Learn More &rarr;</a>
          </div>
        </div>
      </template>
    </section>
```

- [ ] **Step 7: Verify in browser**

Reload `http://localhost:8796/strategies.html`. Expected: 4 cards (Private Equity, Hedge Fund Solutions, Real Estate, Credit & Insurance), each with an icon badge, title, italic subtitle, full description, a 4-item checkmark checklist, and a "Learn More" link. Each card's outer element has the correct `id` (`private-equity`, `hedge-fund-solutions`, `real-estate`, `credit-insurance`) — verify via `document.querySelectorAll('.strategy-detail-card')` and checking each `.id`. Zero console errors.

Then reload `http://localhost:8796/index.html` and confirm Home's own strategy-card grid (`#strategies-grid`) still renders its 4 cards exactly as before (icon, title, description, Learn More — no subtitle/checklist, since Home's simpler cards don't read those fields) — proves the JSON schema extension didn't break Home.

- [ ] **Step 8: Commit**

```bash
git add data/strategies.json assets/js/main.js strategies.html assets/css/pages/strategies.css
git commit -m "feat: add Core Strategies section with data-driven cards and checklists"
```

---

## Task 5: Our Investment Approach timeline

**Files:**
- Modify: `strategies.html`
- Modify: `assets/css/pages/strategies.css`

**Interfaces:**
- Consumes: `.btn`/`.btn-outline`, `.container`, `.text-teal` from existing shared CSS. No icons, no data — this section is fully static, five numbered steps with no per-step icon (matching the wireframe, which shows plain numbered circles, not icon badges).

- [ ] **Step 1: Append the timeline CSS to strategies.css**

```css
.platform-approach { background: var(--color-light-gray); padding: var(--space-64) 0; }
.approach-layout { display: grid; grid-template-columns: 1fr; gap: var(--space-48); }
@media (min-width: 1025px) { .approach-layout { grid-template-columns: 0.8fr 2fr; align-items: start; } }
.approach-intro p { margin: var(--space-16) 0 var(--space-24); }
.approach-timeline { position: relative; display: grid; grid-template-columns: 1fr; gap: var(--space-32); }
@media (min-width: 768px) { .approach-timeline { grid-template-columns: repeat(5, 1fr); gap: var(--space-16); } }
.approach-timeline::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 1px;
  border-top: 1px dashed var(--color-steel-teal);
  display: none;
}
@media (min-width: 768px) { .approach-timeline::before { display: block; } }
.timeline-step { position: relative; text-align: center; }
.timeline-number {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-off-white);
  border: 1.5px solid var(--color-teal);
  color: var(--color-teal);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: var(--space-16);
}
.timeline-step h4 { font-size: 0.95rem; margin-bottom: var(--space-8); }
.timeline-step p { font-size: 0.8rem; }
```

- [ ] **Step 2: Insert the section into strategies.html, after the Core Strategies section's closing `</section>`**

```html
    <section class="platform-approach" data-reveal>
      <div class="container approach-layout">
        <div class="approach-intro">
          <h2>Our Investment <span class="text-teal">Approach</span></h2>
          <p>A disciplined and repeatable process to identify opportunities, manage risk and drive long-term value.</p>
          <a href="philosophies.html" class="btn btn-outline">Our Investment Approach &rarr;</a>
        </div>
        <div class="approach-timeline">
          <div class="timeline-step">
            <span class="timeline-number">01</span>
            <h4>Opportunity Sourcing</h4>
            <p>We identify attractive investment opportunities across our target markets and sectors.</p>
          </div>
          <div class="timeline-step">
            <span class="timeline-number">02</span>
            <h4>Rigorous Due Diligence</h4>
            <p>Deep analysis of financials, operations, management and market dynamics.</p>
          </div>
          <div class="timeline-step">
            <span class="timeline-number">03</span>
            <h4>Investment Committee</h4>
            <p>Disciplined evaluation and approval by our experienced investment committee.</p>
          </div>
          <div class="timeline-step">
            <span class="timeline-number">04</span>
            <h4>Active Value Creation</h4>
            <p>We work closely with management to drive growth, efficiency and strategic advancement.</p>
          </div>
          <div class="timeline-step">
            <span class="timeline-number">05</span>
            <h4>Monitoring &amp; Realisation</h4>
            <p>Ongoing monitoring and proactive risk management to protect and realise value.</p>
          </div>
        </div>
      </div>
    </section>
```

- [ ] **Step 3: Verify in browser**

Reload `http://localhost:8796/strategies.html`. Expected: "Our Investment Approach" heading + paragraph + outline button on the left (linking to `philosophies.html` — the target page doesn't exist yet, that's expected and out of scope), 5 numbered steps (01–05) on the right with a dashed connecting line visible at tablet/desktop widths and hidden on mobile (single column, no line). Zero console errors.

- [ ] **Step 4: Commit**

```bash
git add strategies.html assets/css/pages/strategies.css
git commit -m "feat: add Investment Approach timeline section to Strategies page"
```

---

## Task 6: Closing CTA + full-page QA

**Files:**
- Modify: `strategies.html`

**Interfaces:**
- Consumes: `.closing-cta`/`.closing-cta-inner`/`.closing-cta-mark` from `shared-sections.css` (Task 1) — no new CSS needed for this task, unlike Home's and About's equivalent final tasks which had to duplicate these rules into their own page CSS.

- [ ] **Step 1: Insert the closing CTA section into strategies.html, after the Investment Approach section's closing `</section>` and before `</main>`**

```html
    <section class="closing-cta" data-reveal>
      <div class="container closing-cta-inner">
        <div class="closing-cta-mark">&#9686;</div>
        <div>
          <h3>Partner with Us <span class="text-teal">for Long-Term Value</span></h3>
          <p>We welcome conversations with institutions, family offices and qualified investors seeking differentiated opportunities.</p>
        </div>
        <a href="contact.html" class="btn btn-outline">Contact Investor Relations &rarr;</a>
      </div>
    </section>
```

- [ ] **Step 2: Verify HTML well-formedness**

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('strategies.html', 'utf8');
const opens = (html.match(/<section/g) || []).length;
const closes = (html.match(/<\/section>/g) || []).length;
if (opens !== closes) throw new Error('unbalanced <section> tags: ' + opens + ' open, ' + closes + ' close');
console.log('strategies.html well-formed:', opens, 'sections');
"
```
Expected: `strategies.html well-formed: 5 sections` (hero, platform, core-strategies, approach, closing-cta)

- [ ] **Step 3: Full-page verification against the wireframe**

Reload `http://localhost:8796/strategies.html`. Scroll top to bottom and confirm section order matches `docs/wireframes/Stratefgies.png`: navbar → hero → A Diversified Investment Platform → Our Core Strategies → Our Investment Approach → closing CTA → footer. Confirm "Our Business" shows as active in the nav. Confirm every network request (CSS, JS, the strategies photo, the logo, component partials, data files) returns 200 — zero 404s. Check responsive layout at 375px, 768px, and 1280px via `resize_window`. Check `read_console_messages` for zero errors.

- [ ] **Step 4: Verify the cross-page anchor links actually work**

Navigate to `http://localhost:8796/index.html`, click the "Private Equity" strategy card's "Learn More" link (or navigate directly to `http://localhost:8796/strategies.html#private-equity`). Confirm the browser lands on `strategies.html` scrolled to the card with `id="private-equity"` — check `window.location.hash === '#private-equity'` and that the element with that id is at or near the top of the viewport. This is the first real proof that Home's and the footer's `strategies.html#<slug>` links — live since Home shipped — actually resolve correctly now that the target page exists.

- [ ] **Step 5: Regression-check Home and About**

Reload `http://localhost:8796/index.html`: confirm "Home" still shows active, hero still full 100vh, value-strip/cta-band/closing-cta all still render. Reload `http://localhost:8796/about.html`: confirm "About Us" still shows active, hero still banner-height, the checklist under "Who We Serve" still renders 3 items (now sourced from `components.css` instead of `about.css`, per Task 1). Zero console errors on either page.

- [ ] **Step 6: Commit**

```bash
git add strategies.html
git commit -m "feat: add closing CTA and complete Strategies page"
```

## Self-review notes

- **Spec coverage:** every section in the spec's "Page sections" list maps to a task — CSS extraction (Task 1), shell+hero (Task 2), platform stats (Task 3), Core Strategies with the JSON extension (Task 4), Investment Approach timeline (Task 5), closing CTA + QA (Task 6). The anchor-link verification (spec's testing section) is explicit in Task 6, Step 4.
- **Placeholder scan:** no TBD/TODO — every step has runnable code and an exact expected result.
- **Type/name consistency:** `renderStrategyDetails` matches between its definition (Task 4, Step 3) and its call site in `init()` (same step). `#strategy-details-grid`/`#strategy-detail-template` IDs match between the JS (Task 4, Step 3) and the HTML (Task 4, Step 6). `data-field` names (`icon`, `title`, `subtitle`, `description`, `highlights`, `link`) are used identically between the template and the fill callback.
- **Scope:** limited to the Strategies page and the one shared-CSS refactor it triggers. Other pages (Leadership, Insights, Philosophies, Contact) remain explicitly out of scope per Global Constraints.
