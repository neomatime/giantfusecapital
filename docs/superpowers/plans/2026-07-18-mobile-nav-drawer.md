# Mobile Navigation Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current below-navbar dropdown mobile menu with a full-height panel that slides in from the right edge of the screen, and move "Investor Enquiry" into that panel so it's no longer squeezed into the collapsed top bar.

**Architecture:** Shared-component change — `components/navbar.html`, `assets/css/navigation.css`, `assets/js/navigation.js` are fetched/loaded on every page via `data-include`, so this single change applies site-wide. Task 1 restructures the markup and ships the panel/backdrop CSS (transform-based slide, `visibility` transitions); the *existing* JS toggle logic already works with the new CSS as-is (it just toggles an `.is-open` class), so the panel is functionally slidable after Task 1 alone. Task 2 adds the remaining behavior: backdrop-click-to-close, Escape-to-close, body scroll lock, and the icon swap.

**Tech Stack:** Plain HTML/CSS/JS. No build tool, no new dependencies. No test framework — `node --check` for JS syntax, live browser checks for everything else.

## Global Constraints

- No build tool, bundler, framework, or npm dependency may be introduced.
- Desktop behavior (≥1025px) must be completely unchanged: full horizontal nav, visible CTA in the bar, no hamburger, no visible drawer/backdrop.
- **Root-cause fix, must not be skipped:** the desktop-only CTA visibility rule must use `.navbar-actions .navbar-cta` (two classes, specificity 0-2-0), not the bare `.navbar-cta` (0-1-0) — the single-class version is currently losing a cascade tie against `.btn { display: inline-flex; }` (defined in `components.css`, which loads after `navigation.css`), which is why the CTA has been incorrectly visible on mobile. This must be fixed as part of this change, not left as a follow-up.
- **`setActiveLink()`'s selector must exclude the CTA links in both nav contexts** — desktop already does (`.navbar-cta` lives in `.navbar-actions`, a sibling of `.navbar-links`, so `.navbar-links a` never matches it), but the new mobile structure nests the CTA *inside* `.navbar-mobile-menu` alongside the real nav links. If `setActiveLink()` keeps querying `.navbar-mobile-menu a` (as it does today), it will also match the new mobile CTA link and apply `.active`'s `color: var(--color-teal)` to it whenever the CTA's own `href` matches the current page (i.e. on `contact.html`) — since that rule (specificity 0-2-1) is more specific than `.btn-solid`'s `color: var(--color-white)` (0-1-0), it would win and render invisible teal-on-teal button text. Fix: query `.navbar-mobile-links a` (the new inner wrapper around just the real links), not `.navbar-mobile-menu a`.
- z-index for the new backdrop/panel must use a dedicated high range (200+) clearly separated from the rest of the site's z-index usage (which tops out at 50, the navbar bar). The toggle button must get its own `z-index: 202` (higher than both) with `position: relative` (z-index has no effect without a positioned element) so it stays clickable to close the panel even though the panel is a full-height overlay covering the same screen region.
- The "Insights" nav link stays commented out in both the desktop and new mobile link lists — this is an existing, deliberate site-wide state (confirmed with the user previously), not something to touch here.
- Spec reference: `docs/superpowers/specs/2026-07-18-mobile-nav-drawer-design.md`.

---

## Task 1: Drawer markup + CSS

**Files:**
- Modify: `components/navbar.html`
- Modify: `assets/css/navigation.css`

**Interfaces:**
- Produces: `#navbar-backdrop` (new element), `#navbar-mobile-menu` restructured to contain `.navbar-mobile-cta`, `.navbar-mobile-divider`, and `.navbar-mobile-links` (the real nav links, previously direct children of `#navbar-mobile-menu`), `.navbar-toggle.is-open` class hook (not yet applied by anything — Task 2's job), `body.nav-open` class hook (not yet applied by anything — Task 2's job).
- Consumes: nothing new. The *existing* `navigation.js` (unchanged in this task) already does `menu.classList.toggle('is-open')` on click, which is enough to make the panel visually slide in and out with this task's CSS alone — verify this in Step 4 below.

- [ ] **Step 1: Create the git branch**

```bash
cd "C:\Users\Neo\OneDrive\Documents\HIMARK SGC\Giantfuse\giantfusecapital-site"
git checkout -b feat/mobile-nav-drawer
```

Expected: `Switched to a new branch 'feat/mobile-nav-drawer'`

- [ ] **Step 2: Replace `components/navbar.html`**

Find the entire file content:

```html
<div class="navbar">
  <div class="navbar-inner">
    <a href="index.html" class="navbar-logo">
      <img src="assets/images/logo/logo-horizontal.png" alt="Giantfuse Capital Partners" width="180" height="90">
    </a>
    <nav class="navbar-links">
      <a href="index.html">Home</a>
      <a href="about.html">About Us</a>
      <a href="strategies.html">Investment Approach</a>
      <a href="leadership.html">Leadership</a>
      <!-- <a href="insights.html">Insights</a> -->
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
    <a href="strategies.html">Investment Approach</a>
    <a href="leadership.html">Leadership</a>
    <!-- <a href="insights.html">Insights</a> -->
    <a href="contact.html">Contact Us</a>
  </div>
</div>
```

Replace with:

```html
<div class="navbar">
  <div class="navbar-inner">
    <a href="index.html" class="navbar-logo">
      <img src="assets/images/logo/logo-horizontal.png" alt="Giantfuse Capital Partners" width="180" height="90">
    </a>
    <nav class="navbar-links">
      <a href="index.html">Home</a>
      <a href="about.html">About Us</a>
      <a href="strategies.html">Investment Approach</a>
      <a href="leadership.html">Leadership</a>
      <!-- <a href="insights.html">Insights</a> -->
      <a href="contact.html">Contact Us</a>
    </nav>
    <div class="navbar-actions">
      <a href="contact.html" class="btn btn-solid navbar-cta">Investor Enquiry</a>
      <button class="navbar-toggle" id="navbar-toggle-btn" aria-label="Toggle menu" aria-expanded="false" aria-controls="navbar-mobile-menu">&#9776;</button>
    </div>
  </div>
  <div class="navbar-backdrop" id="navbar-backdrop"></div>
  <div class="navbar-mobile-menu" id="navbar-mobile-menu">
    <a href="contact.html" class="btn btn-solid navbar-mobile-cta">Investor Enquiry</a>
    <div class="navbar-mobile-divider"></div>
    <nav class="navbar-mobile-links">
      <a href="index.html">Home</a>
      <a href="about.html">About Us</a>
      <a href="strategies.html">Investment Approach</a>
      <a href="leadership.html">Leadership</a>
      <!-- <a href="insights.html">Insights</a> -->
      <a href="contact.html">Contact Us</a>
    </nav>
  </div>
</div>
```

- [ ] **Step 3: Update `assets/css/navigation.css`**

Find:

```css
.navbar-cta { display: none; }
@media (min-width: 1025px) { .navbar-cta { display: inline-flex; } }
.navbar-toggle { display: inline-flex; font-size: 1.4rem; color: var(--color-navy); }
@media (min-width: 1025px) { .navbar-toggle { display: none; } }
.navbar-mobile-menu { display: none; flex-direction: column; gap: var(--space-16); padding: 0 var(--space-24) var(--space-24); }
.navbar-mobile-menu.is-open { display: flex; }
@media (min-width: 1025px) { .navbar-mobile-menu { display: none !important; } }
```

Replace with:

```css
.navbar-actions .navbar-cta { display: none; }
@media (min-width: 1025px) { .navbar-actions .navbar-cta { display: inline-flex; } }
.navbar-toggle { display: inline-flex; position: relative; z-index: 202; font-size: 1.4rem; color: var(--color-navy); }
@media (min-width: 1025px) { .navbar-toggle { display: none; } }

.navbar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(13, 27, 42, 0.6);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
.navbar-backdrop.is-open { opacity: 1; visibility: visible; }
@media (min-width: 1025px) { .navbar-backdrop { display: none !important; } }

.navbar-mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 201;
  width: 85%;
  max-width: 340px;
  background: var(--color-navy);
  display: flex;
  flex-direction: column;
  padding: calc(var(--navbar-height) + var(--space-24)) var(--space-24) var(--space-24);
  overflow-y: auto;
  transform: translateX(100%);
  visibility: hidden;
  transition: transform 0.3s ease, visibility 0.3s ease;
}
.navbar-mobile-menu.is-open { transform: translateX(0); visibility: visible; }
@media (min-width: 1025px) { .navbar-mobile-menu { display: none !important; } }

.navbar-mobile-cta { justify-content: center; width: 100%; }
.navbar-mobile-divider { height: 1px; background: rgba(255, 255, 255, 0.12); margin: var(--space-24) 0; }
.navbar-mobile-links { display: flex; flex-direction: column; gap: var(--space-16); }
.navbar-mobile-links a { font-size: 1rem; font-weight: 500; color: var(--color-light-gray); padding: var(--space-8) 0; }
```

Then find this line (still in `navigation.css`, the shared active-link color rule):

```css
.navbar-links a.active, .navbar-mobile-menu a.active { color: var(--color-teal); }
```

Replace with:

```css
.navbar-links a.active, .navbar-mobile-links a.active { color: var(--color-teal); }
```

(This is the `setActiveLink()`-selector fix from Global Constraints, applied on the CSS side — the JS-side fix that actually stops the CTA from being queried at all is in Task 2.)

- [ ] **Step 4: Verify in the browser**

Using the Claude Browser MCP tools: `preview_start` with `{name: "giantfuse"}`, `resize_window` to `preset: "mobile"`, navigate to `index.html`, then:

1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. `javascript_tool`, evaluate:
   ```js
   JSON.stringify({
     ctaDisplayMobile: getComputedStyle(document.querySelector('.navbar-actions .navbar-cta')).display,
     logoRenderedRatio: (() => { const r = document.querySelector('.navbar-logo img').getBoundingClientRect(); return (r.width / r.height).toFixed(2); })(),
     backdropExists: !!document.getElementById('navbar-backdrop'),
     mobileCtaExists: !!document.querySelector('.navbar-mobile-cta'),
     mobileLinksExist: document.querySelectorAll('.navbar-mobile-links a').length
   })
   ```
   Expected: `ctaDisplayMobile` is `"none"` (confirms the root-cause bug is fixed — this was `"flex"` before this change), `logoRenderedRatio` is close to `"1.99"` (the source image's natural ~2:1 aspect ratio — confirms the logo is no longer being squished now that the CTA isn't fighting it for space), `backdropExists` is `true`, `mobileCtaExists` is `true`, `mobileLinksExist` is `5`.
3. Using `computer`, click the hamburger toggle button.
4. Screenshot — confirm a dark navy panel has slid in from the right edge, with the "Investor Enquiry" button visible near the top, a divider, then the nav links. (The backdrop won't visibly dim yet, the icon won't have swapped to ✕, and background scroll won't be locked — that's all expected, Task 2's job. Only the slide-in panel itself should work at this point, via the existing `menu.classList.toggle('is-open')` logic in the not-yet-modified `navigation.js`.)
5. `javascript_tool`, evaluate: `document.getElementById('navbar-mobile-menu').classList.contains('is-open')` — expected `true`.

- [ ] **Step 5: Commit**

```bash
git add components/navbar.html assets/css/navigation.css
git commit -m "feat: restructure mobile nav into a right-side sliding drawer"
```

---

## Task 2: Drawer behavior + regression check

**Files:**
- Modify: `assets/js/navigation.js`

**Interfaces:**
- Consumes: `#navbar-backdrop`, `#navbar-mobile-menu`, `.navbar-mobile-links a` (Task 1).
- Produces: nothing consumed by other files — `navigation.js`'s `init`/`setActiveLink` remain the same exported shape as before (`window.Giantfuse.Nav = { init, setActiveLink }`), just with updated internals.

- [ ] **Step 1: Replace the entire contents of `assets/js/navigation.js`**

```js
(function () {
  'use strict';

  const TOGGLE_ICON_CLOSED = '☰';
  const TOGGLE_ICON_OPEN = '✕';

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
    const backdrop = document.querySelector('#navbar-backdrop');

    function setOpen(isOpen) {
      if (menu) menu.classList.toggle('is-open', isOpen);
      if (backdrop) backdrop.classList.toggle('is-open', isOpen);
      if (toggleBtn) {
        toggleBtn.classList.toggle('is-open', isOpen);
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
        toggleBtn.textContent = isOpen ? TOGGLE_ICON_OPEN : TOGGLE_ICON_CLOSED;
      }
      document.body.classList.toggle('nav-open', isOpen);
    }

    if (toggleBtn && menu) {
      toggleBtn.addEventListener('click', () => {
        setOpen(!menu.classList.contains('is-open'));
      });
    }
    if (backdrop) {
      backdrop.addEventListener('click', () => setOpen(false));
    }
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu && menu.classList.contains('is-open')) {
        setOpen(false);
      }
    });

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
```

- [ ] **Step 2: Add the body scroll lock CSS**

Add this rule to `assets/css/navigation.css` (append at the end of the file):

```css
body.nav-open { overflow: hidden; }
```

- [ ] **Step 3: Verify syntax**

```bash
node --check assets/js/navigation.js
```

Expected: no output (success).

- [ ] **Step 4: Verify full drawer behavior in the browser**

Using the Claude Browser MCP tools, `resize_window` to `preset: "mobile"`, navigate to `index.html` (or reload if already open):

1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. Using `computer`, click the hamburger toggle button.
3. `javascript_tool`, evaluate:
   ```js
   JSON.stringify({
     menuOpen: document.getElementById('navbar-mobile-menu').classList.contains('is-open'),
     backdropOpen: document.getElementById('navbar-backdrop').classList.contains('is-open'),
     toggleIcon: document.getElementById('navbar-toggle-btn').textContent,
     ariaExpanded: document.getElementById('navbar-toggle-btn').getAttribute('aria-expanded'),
     bodyLocked: document.body.classList.contains('nav-open'),
     bodyOverflow: getComputedStyle(document.body).overflow
   })
   ```
   Expected: `menuOpen` and `backdropOpen` both `true`, `toggleIcon` is `"✕"`, `ariaExpanded` is `"true"`, `bodyLocked` is `true`, `bodyOverflow` is `"hidden"`.
4. Screenshot — confirm the backdrop is now visibly dimming the page behind the drawer.
5. Using `computer`, click on the backdrop (a point clearly outside the drawer panel, e.g. near the left edge of the viewport).
6. `javascript_tool`, evaluate the same JSON block as step 3 — expected: `menuOpen` and `backdropOpen` both `false`, `toggleIcon` is `"☰"`, `ariaExpanded` is `"false"`, `bodyLocked` is `false`, `bodyOverflow` is not `"hidden"`.
7. Reopen the drawer (click the toggle button again), then use `computer`'s `key` action to press `Escape`.
8. `javascript_tool`, evaluate `document.getElementById('navbar-mobile-menu').classList.contains('is-open')` — expected `false` (confirms Escape closes it too).
9. Reopen the drawer once more, navigate to `contact.html` while it's still tracked as "open" conceptually (actual navigation will naturally reset everything — this step is really just confirming the CTA-active-link bug is fixed): after navigating, `javascript_tool`, evaluate:
   ```js
   JSON.stringify({
     ctaHasActiveClass: document.querySelector('.navbar-mobile-cta').classList.contains('active'),
     ctaComputedColor: getComputedStyle(document.querySelector('.navbar-mobile-cta')).color
   })
   ```
   Expected: `ctaHasActiveClass` is `false`, `ctaComputedColor` is the white color the `.btn-solid` class sets (not teal) — confirms the CTA-link active-class bug described in Global Constraints does not occur.

- [ ] **Step 5: Full regression check across all pages, desktop and mobile**

Still at mobile viewport width, navigate to `about.html`, `strategies.html`, `leadership.html`, and `contact.html` in turn. On each:
1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. Click the hamburger, confirm the drawer opens (screenshot one of them to confirm visually), click it again to close.

Then `resize_window` to `preset: "desktop"` and navigate to `index.html`:
1. `javascript_tool`, evaluate:
   ```js
   JSON.stringify({
     ctaVisible: getComputedStyle(document.querySelector('.navbar-actions .navbar-cta')).display,
     toggleVisible: getComputedStyle(document.querySelector('.navbar-toggle')).display,
     backdropVisible: getComputedStyle(document.querySelector('.navbar-backdrop')).display,
     mobileMenuVisible: getComputedStyle(document.querySelector('.navbar-mobile-menu')).display
   })
   ```
   Expected: `ctaVisible` is `"inline-flex"`, `toggleVisible` is `"none"`, `backdropVisible` is `"none"`, `mobileMenuVisible` is `"none"` — confirms desktop is completely unaffected.

If any check fails, fix the underlying file and re-run the failing check before proceeding.

- [ ] **Step 6: Commit**

```bash
git add assets/js/navigation.js assets/css/navigation.css
git commit -m "feat: add mobile drawer interactivity (backdrop, escape key, scroll lock, icon swap)"
```

- [ ] **Step 7: Merge to main and push**

```bash
cd "C:\Users\Neo\OneDrive\Documents\HIMARK SGC\Giantfuse\giantfusecapital-site"
git checkout main
git pull
git merge --no-edit feat/mobile-nav-drawer
node --check assets/js/navigation.js
git push origin main
git branch -d feat/mobile-nav-drawer
```

Expected: merge succeeds (resolve any conflict with `origin/main` if it has moved since the branch was created — check what changed before resolving), `node --check` produces no output, push succeeds, branch deleted locally.
