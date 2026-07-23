# Mobile/Tablet Dropdown Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the full-height sliding side-drawer mobile nav with a compact dropdown that expands directly from the floating glass navbar pill, matching its glassmorphism styling, with an animated hamburger-to-X icon.

**Architecture:** `#navbar-mobile-menu` moves inside `.navbar-inner` (so it inherits the pill's exact width via `position: absolute` + `position: relative` on the parent). `.navbar-backdrop` is removed entirely — "click outside closes" becomes a `document` click listener instead. The hamburger becomes three CSS-animated bars instead of a text-glyph swap. Three files: `components/navbar.html`, `assets/css/navigation.css`, `assets/js/navigation.js`.

**Tech Stack:** Plain HTML/CSS/JS. CSS `transform`/`transition` for the hamburger and dropdown animations — no build tool, no npm dependency.

**Branch:** `feat/mobile-dropdown-nav`, created from `main`.

## Global Constraints

- No build tool, bundler, framework, or npm dependency.
- Desktop (≥1025px) is completely unaffected — same horizontal nav-links row, same CTA, dropdown/hamburger both stay `display: none`.
- Reuses the existing `1025px` breakpoint as-is — no new breakpoint tier.
- `.navbar-backdrop` (CSS rule, JS reference, HTML element) is removed entirely, not left dead in place.
- The dropdown reuses the pill's exact glass values (`rgba(255,255,255,0.08)` → `rgba(255,255,255,0.16)` on `.is-scrolled`, same blur/border/shadow) and the exact same white→navy text-color swap on `.is-scrolled`.
- CTA premium styling (gradient, glow, hover lift) applies to both `.navbar-actions .navbar-cta` and `.navbar-mobile-cta`, without modifying the shared `.btn`/`.btn-solid` classes.
- The Investor Enquiry CTA is always present in the dropdown, never conditionally hidden.
- `aria-expanded`/`aria-controls` on the toggle button are preserved.

---

### Task 1: Dropdown navigation (markup + CSS + JS)

**Files:**
- Modify: `components/navbar.html`
- Modify: `assets/css/navigation.css`
- Modify: `assets/js/navigation.js`

- [ ] **Step 1: Replace the navbar markup**

Replace the full contents of `components/navbar.html` with:

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
      <button class="navbar-toggle" id="navbar-toggle-btn" aria-label="Toggle menu" aria-expanded="false" aria-controls="navbar-mobile-menu">
        <span class="navbar-toggle-bar"></span>
        <span class="navbar-toggle-bar"></span>
        <span class="navbar-toggle-bar"></span>
      </button>
    </div>
    <div class="navbar-mobile-menu" id="navbar-mobile-menu">
      <nav class="navbar-mobile-links">
        <a href="index.html">Home</a>
        <a href="about.html">About Us</a>
        <a href="strategies.html">Investment Approach</a>
        <a href="leadership.html">Leadership</a>
        <!-- <a href="insights.html">Insights</a> -->
        <a href="contact.html">Contact Us</a>
      </nav>
      <a href="contact.html" class="btn btn-solid navbar-mobile-cta">Investor Enquiry</a>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Replace the navigation CSS**

Replace the full contents of `assets/css/navigation.css` with:

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  padding-top: 28px;
}
.navbar-inner {
  position: relative;
  max-width: 1400px;
  width: 90%;
  margin: 0 auto;
  height: 76px;
  padding: 0 var(--space-32);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(255, 255, 255, 0.05) inset;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  opacity: 0;
  transform: translateY(-10px);
  animation: navbar-fade-in 500ms ease-out forwards;
  transition: background 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease;
}
@keyframes navbar-fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.navbar-inner:hover { background: rgba(255, 255, 255, 0.14); }
.navbar.is-scrolled .navbar-inner {
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(26px);
  -webkit-backdrop-filter: blur(26px);
  box-shadow: 0 14px 48px rgba(0, 0, 0, 0.24), 0 2px 8px rgba(255, 255, 255, 0.05) inset;
}
.navbar.is-scrolled .navbar-inner:hover { background: rgba(255, 255, 255, 0.20); }

.navbar-logo { display: flex; align-items: center; grid-column: 1; justify-self: start; }
.navbar-logo img { height: 52px; width: auto; max-width: none; filter: brightness(0) invert(1); transition: filter 0.3s ease; }
.navbar.is-scrolled .navbar-logo img { filter: none; }
.navbar-links { display: none; align-items: center; gap: 40px; grid-column: 2; }
@media (min-width: 1025px) { .navbar-links { display: flex; } }
.navbar-links a { font-size: 0.9rem; font-weight: 500; color: var(--color-white); transition: color 250ms ease; }
.navbar.is-scrolled .navbar-links a { color: var(--color-navy); }
.navbar-links a:hover { color: var(--color-teal); }
.navbar-links a.active, .navbar-mobile-links a.active { color: var(--color-teal); }
.navbar-links a.active { border-bottom: 2px solid var(--color-teal); padding-bottom: var(--space-4); }
.navbar-actions { display: flex; align-items: center; gap: var(--space-16); grid-column: 3; justify-self: end; }
.navbar-actions .navbar-cta { display: none; }
@media (min-width: 1025px) { .navbar-actions .navbar-cta { display: inline-flex; } }
.navbar-actions .navbar-cta,
.navbar-mobile-cta {
  border-radius: 15px;
  background: linear-gradient(135deg, var(--color-teal), #00838C);
  box-shadow: 0 4px 16px rgba(0, 163, 173, 0.35);
  transition: transform 250ms ease, box-shadow 250ms ease;
}
.navbar-actions .navbar-cta:hover,
.navbar-mobile-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 180, 220, 0.35);
}

/* Animated hamburger — three bars that rotate/fade into an X via CSS transforms,
   colored with currentColor so it reuses the same white/navy scroll-state swap
   already applied to .navbar-toggle's own color. */
.navbar-toggle {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 32px;
  height: 32px;
  color: var(--color-white);
  transition: color 0.3s ease;
}
.navbar.is-scrolled .navbar-toggle { color: var(--color-navy); }
@media (min-width: 1025px) { .navbar-toggle { display: none; } }
.navbar-toggle-bar {
  display: block;
  width: 20px;
  height: 2px;
  border-radius: 2px;
  background: currentColor;
  transition: transform 250ms ease, opacity 250ms ease;
}
.navbar-toggle.is-open .navbar-toggle-bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.navbar-toggle.is-open .navbar-toggle-bar:nth-child(2) { opacity: 0; }
.navbar-toggle.is-open .navbar-toggle-bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* Mobile/tablet dropdown — an extension of the floating pill itself (nested inside
   .navbar-inner, absolutely positioned relative to it), not a full-height side drawer.
   Reuses the exact same glass values + scroll-state text-color swap as the pill, since
   the same contrast math applies: this panel can sit over either the dark hero photo
   (unscrolled) or light page content (scrolled), same as the pill above it. */
.navbar-mobile-menu {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  right: 0;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(255, 255, 255, 0.05) inset;
  padding: var(--space-16);
  display: flex;
  flex-direction: column;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: opacity 280ms ease, transform 280ms ease, visibility 280ms ease, background 0.3s ease, backdrop-filter 0.3s ease;
}
.navbar-mobile-menu.is-open { opacity: 1; visibility: visible; transform: translateY(0); }
.navbar.is-scrolled .navbar-mobile-menu {
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(26px);
  -webkit-backdrop-filter: blur(26px);
}
@media (min-width: 1025px) { .navbar-mobile-menu { display: none !important; } }

.navbar-mobile-links { display: flex; flex-direction: column; }
.navbar-mobile-links a {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-white);
  padding: 18px var(--space-8);
  transition: color 0.3s ease;
}
.navbar.is-scrolled .navbar-mobile-links a { color: var(--color-navy); }
.navbar-mobile-cta { justify-content: center; width: 100%; margin-top: var(--space-24); }

body.nav-open { overflow: hidden; }
@media (min-width: 1025px) { body.nav-open { overflow: auto; } }
```

- [ ] **Step 3: Replace the navigation JS**

Replace the full contents of `assets/js/navigation.js` with:

```javascript
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
```

- [ ] **Step 4: Confirm no dangling references to the removed backdrop**

Run: `grep -rn "navbar-backdrop" assets components`
Expected: no matches (the element, its CSS, and its JS reference are all gone — confirm nothing else in the codebase still references it).

- [ ] **Step 5: Verify in the browser**

Start the dev server (`preview_start` name `giantfuse`). Two environment notes before you start: (1) `window.scrollTo()` via this tooling doesn't reliably fire a native `scroll` event on its own — manually dispatch one (`window.dispatchEvent(new Event('scroll'))`) after scrolling, before checking `is-scrolled`-dependent state; (2) screenshots (and occasionally `getComputedStyle`) can return stale results on a browser tab that's done a lot of scrolling/navigating already — if something looks wrong, open a fresh tab before concluding it's a real defect.

On `index.html` at mobile width (375×812):
- Click the hamburger. Confirm `#navbar-mobile-menu` gets `is-open`, `#navbar-toggle-btn` gets `aria-expanded="true"`, and `document.body` gets `nav-open` (check `getComputedStyle(document.body).overflow === 'hidden'`).
- Confirm the hamburger visibly forms an X: read each `.navbar-toggle-bar`'s computed `transform` — bar 1 should show a 45° rotation + `translateY(7px)`, bar 2 should have `opacity: 0`, bar 3 should show a -45° rotation + `translateY(-7px)`.
- Confirm the dropdown's `getBoundingClientRect()` matches `.navbar-inner`'s width and sits directly below it (`top` roughly `.navbar-inner`'s `bottom + 12`).
- Confirm all 5 links render in order, then the "Investor Enquiry" CTA last, with a visible top margin separating it from the links.
- Click a non-active link (e.g. "About Us") and confirm the menu closes (`is-open` removed) — note this will also navigate the page, which is expected (it's a real link).
- Reopen the menu, click the CTA, confirm it also closes the menu.
- Reopen the menu, dispatch a click on an element outside the menu and the toggle (e.g. the hero section), confirm the menu closes.
- Reopen the menu, dispatch an `Escape` keydown, confirm the menu closes.
- Scroll past 40px (remembering to manually dispatch the `scroll` event per the note above), confirm `.navbar` gets `is-scrolled`, then open the menu and confirm the dropdown's background is `rgba(255, 255, 255, 0.16)` and a plain nav link's color is `rgb(13, 27, 42)` (navy) — this is the same contrast fix already proven for the pill, now verify it applies to the dropdown too.
- At tablet width (e.g. 800×1024): confirm `.navbar-links` computed `display` is `none` and the toggle's computed `display` is `flex` — same dropdown treatment as mobile, not the old drawer, not the desktop row.
- At desktop width (1280×900): confirm `.navbar-links` computed `display` is `flex`, the toggle's computed `display` is `none`, and `#navbar-mobile-menu`'s computed `display` is `none` — completely unaffected by this branch.
- Confirm zero console errors throughout.

- [ ] **Step 6: Commit**

```bash
git add components/navbar.html assets/css/navigation.css assets/js/navigation.js
git commit -m "feat: replace mobile side-drawer with a dropdown extending from the floating navbar"
```

---

### Task 2: Full regression pass and merge

**Files:** none (verification only, plus whatever Step 2 below needs if problems are found).

- [ ] **Step 1: Regression pass across all 5 pages**

For each of `index.html`, `about.html`, `strategies.html`, `leadership.html`, `contact.html`, at mobile (375×812) and tablet (800×1024) widths:
- Open the dropdown, confirm it renders correctly (correct width/position, all links + CTA present, correct active-link highlighting for that page).
- Confirm clicking a link or the CTA, clicking outside, and pressing Escape all still close it.
- Confirm zero console errors.

At desktop width (1280×900) on `index.html`: confirm the navbar is pixel-for-pixel the same as before this branch (horizontal links, no dropdown/hamburger markup visible).

On `contact.html` specifically at mobile width: confirm the Atlas chat widget (bottom-right) and the enquiry wizard are both unaffected by this branch — this branch only touches navbar files, but confirm the removal of `.navbar-backdrop` didn't have any unexpected z-index/stacking interaction with either of them.

- [ ] **Step 2: Fix any problems found**

Only if Step 1 surfaces an issue. Commit any fix with a message describing the problem and the fix.

- [ ] **Step 3: Merge to main**

```bash
git checkout main
git pull
git merge feat/mobile-dropdown-nav
git push origin main
git branch -d feat/mobile-dropdown-nav
```
