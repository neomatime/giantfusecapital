# Floating Glassmorphism Navbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the navbar into a floating, centered, rounded glassmorphism pill (rather than the current edge-to-edge bar), with a load-in animation, hover states, and a scroll-triggered opacity/blur/shadow increase — while keeping the mobile drawer, logo, and existing scroll mechanism untouched.

**Architecture:** All visual styling moves from `.navbar` (which becomes a bare positioning wrapper) to `.navbar-inner` (which becomes the actual floating glass pill). One CSS file rewrite (`assets/css/navigation.css`) plus a one-line JS change (`assets/js/navigation.js`'s scroll threshold, 24→40). No markup changes.

**Tech Stack:** Plain CSS (`backdrop-filter`, CSS `animation`/`keyframes`, CSS Grid — already used elsewhere on this site). No build tool, no npm dependency, no framework.

**Branch:** `feat/floating-glass-navbar`, created from `main`.

## Global Constraints

- No build tool, bundler, framework, or npm dependency — plain HTML/CSS/JS only.
- `.navbar-inner` holds all new visual styling (background, blur, border, radius, shadow, sizing); `.navbar` stays a bare `position: fixed` wrapper with no visible background of its own.
- The `is-scrolled` scroll-listener threshold in `assets/js/navigation.js` changes from `24` to `40` — the only JS change in this feature.
- Logo stays exempted from the global `img { max-width: 100% }` reset (`max-width: none`) and un-stretched in its grid cell (`.navbar-logo { justify-self: start; }`) — both pre-existing fixes from a prior task, must not regress.
- Every navbar-inner child (`.navbar-logo`, `.navbar-links`, `.navbar-actions`) keeps an explicit `grid-column` assignment — a pre-existing fix for a CSS Grid auto-placement bug (a `display:none` sibling gets skipped entirely by auto-placement, not left as an empty slot), must not regress.
- CTA styling is scoped to `.navbar-actions .navbar-cta` only — the shared `.btn`/`.btn-solid` classes (used elsewhere on the site) must not be modified.
- Logo/nav-links/hamburger switch from white to navy on `.is-scrolled` — a deliberate, confirmed fix: white text on the specified white-tinted glass is nearly invisible once scrolled past the hero into this site's light `--color-off-white` page sections (verified via color math: `rgba(255,255,255,0.16)` over `rgb(248,250,252)` ≈ `rgb(249,251,252)`, indistinguishable from the page background).
- `--navbar-height` must continue to self-adjust correctly (it already does, via the existing `ResizeObserver` in `main.js` — verify, don't re-implement).
- Mobile drawer (`.navbar-backdrop`, `.navbar-mobile-menu`, and everything inside it) is completely unchanged.

---

### Task 1: Floating glass navbar (CSS + scroll threshold)

**Files:**
- Modify: `assets/css/navigation.css`
- Modify: `assets/js/navigation.js`

- [ ] **Step 1: Replace the full navbar CSS block**

In `assets/css/navigation.css`, find (this is everything from the top of the file through the `.navbar-toggle` media query, immediately before the `z-index 200/201/202` comment block):

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.2s ease;
}
.navbar.is-scrolled {
  background: var(--color-off-white);
  border-bottom: 1px solid var(--color-light-gray);
  box-shadow: 0 2px 8px rgba(13, 27, 42, 0.08);
}
.navbar-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-12) var(--space-24);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}
.navbar-logo { display: flex; align-items: center; grid-column: 1; justify-self: start; }
.navbar-logo img { height: 52px; width: auto; max-width: none; filter: brightness(0) invert(1); transition: filter 0.3s ease; }
.navbar.is-scrolled .navbar-logo img { filter: none; }
.navbar-links { display: none; align-items: center; gap: var(--space-24); grid-column: 2; }
@media (min-width: 1025px) { .navbar-links { display: flex; } }
.navbar-links a { font-size: 0.9rem; font-weight: 500; color: var(--color-white); transition: color 0.3s ease; }
.navbar.is-scrolled .navbar-links a { color: var(--color-navy); }
.navbar-links a.active, .navbar-mobile-links a.active { color: var(--color-teal); }
.navbar-links a.active { border-bottom: 2px solid var(--color-teal); padding-bottom: var(--space-4); }
.navbar-actions { display: flex; align-items: center; gap: var(--space-16); grid-column: 3; justify-self: end; }
.navbar-actions .navbar-cta { display: none; }
@media (min-width: 1025px) { .navbar-actions .navbar-cta { display: inline-flex; } }
.navbar-toggle { display: inline-flex; position: relative; z-index: 202; font-size: 1.4rem; color: var(--color-white); transition: color 0.3s ease; }
.navbar.is-scrolled .navbar-toggle { color: var(--color-navy); }
@media (min-width: 1025px) { .navbar-toggle { display: none; } }
```

Replace it with:

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
.navbar-actions .navbar-cta {
  border-radius: 15px;
  background: linear-gradient(135deg, var(--color-teal), #00838C);
  box-shadow: 0 4px 16px rgba(0, 163, 173, 0.35);
  transition: transform 250ms ease, box-shadow 250ms ease;
}
.navbar-actions .navbar-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 180, 220, 0.35);
}
.navbar-toggle { display: inline-flex; position: relative; z-index: 202; font-size: 1.4rem; color: var(--color-white); transition: color 0.3s ease; }
.navbar.is-scrolled .navbar-toggle { color: var(--color-navy); }
@media (min-width: 1025px) { .navbar-toggle { display: none; } }
```

Everything below this block (the z-index comment, `.navbar-backdrop`, `.navbar-mobile-menu` and its children, `body.nav-open`) is unchanged — do not touch it.

- [ ] **Step 2: Update the scroll threshold**

In `assets/js/navigation.js`, find:

```javascript
        navbar.classList.toggle('is-scrolled', window.scrollY > 24);
```

Replace it with:

```javascript
        navbar.classList.toggle('is-scrolled', window.scrollY > 40);
```

- [ ] **Step 3: Verify in the browser**

Start the dev server (`preview_start` name `giantfuse`). A note on this environment before you start: `computer` screenshots on a browser tab that has already scrolled/navigated a lot in the same session can render stale or blank — this is a known tooling quirk, not a sign your code is broken. If a screenshot looks wrong, cross-check with `elementFromPoint`/`getBoundingClientRect`/`getComputedStyle` before concluding something's actually broken, and open a fresh tab if you need a clean screenshot. Also note: `window.scrollTo()` calls made via this tooling do not reliably fire a native `scroll` event on their own — after scrolling programmatically, manually dispatch one (`window.dispatchEvent(new Event('scroll'))`) before checking `is-scrolled`-dependent state, or your check will read stale pre-scroll values even though the page really did scroll.

On `index.html` at desktop width (1280×900):
- At the top of the page: the navbar is a centered floating pill (not edge-to-edge), roughly 90% of the viewport width capped at 1400px, ~76px tall, ~28px below the top of the viewport, with visibly rounded corners and the hero photo softly visible through it (glass effect). Logo, "Home"/"About Us"/etc., and "Investor Enquiry" are all white/light except the active "Home" link (teal).
- Confirm the load-in animation exists by checking `getComputedStyle(document.querySelector('.navbar-inner')).animationName === 'navbar-fade-in'` and that after the page has settled, `opacity` is `'1'` and `transform` is the identity matrix (i.e. the animation reached and held its end state).
- Scroll down (`window.scrollTo(0, 1000)` then dispatch a `scroll` event as noted above). Confirm: `.navbar` now has the `is-scrolled` class; `.navbar-inner`'s computed `background-color` is `rgba(255, 255, 255, 0.16)`; the logo's `filter` is `none` (full color); a plain (non-active) nav link's computed `color` is `rgb(13, 27, 42)` (navy) — this specific check is the contrast fix, verify it precisely, this is the most important correctness check in this task; the hamburger toggle's color is also navy.
- Confirm `--navbar-height` (read via `getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')`) equals `.navbar`'s actual `getBoundingClientRect().height` (should both be `104px`, i.e. the 28px top padding plus the 76px pill).
- Confirm no nav-link wrapping and the logo is not visually distorted (`.navbar-logo img`'s rendered `width/height` ratio should match its `naturalWidth/naturalHeight` ratio — this was a real bug in a prior task, re-check it here since this task rewrites the same CSS region).
- Resize to mobile (375×812): confirm the pill renders correctly (smaller, but still floating/rounded/glass), the hamburger is visible and white at the top, and clicking it (`document.getElementById('navbar-toggle-btn').click()`) opens `.navbar-mobile-menu` with `is-open` — confirm the drawer itself still looks completely unchanged (solid dark navy, unaffected by anything in this task).
- Confirm zero console errors throughout.

- [ ] **Step 4: Commit**

```bash
git add assets/css/navigation.css assets/js/navigation.js
git commit -m "feat: redesign navbar as a floating glassmorphism pill"
```

---

### Task 2: Full regression pass and merge

**Files:** none (verification only, plus whatever Step 2 below needs if problems are found).

- [ ] **Step 1: Regression pass across all 5 pages**

For each of `index.html`, `about.html`, `strategies.html`, `leadership.html`, `contact.html`, at both desktop (1280×900) and mobile (375×812) widths:
- Confirm the floating pill renders correctly at the top of the page (no layout breakage, no nav-link wrapping at desktop, logo not distorted).
- Scroll past 40px (remembering to manually dispatch a `scroll` event after `window.scrollTo()`, per the tooling note in Task 1) and confirm the `.is-scrolled` transition works: glass opacity/blur/shadow increase, logo/links/hamburger switch to navy, and — since this is the whole point of the contrast fix — confirm the nav text is genuinely legible against whatever page content is actually behind the pill at that scroll position (a light content section on every one of these pages once scrolled past the hero).
- Confirm zero console errors.

At mobile width on `index.html` and `contact.html`: open the mobile drawer and confirm it still opens/closes correctly (toggle click, backdrop click, Escape key) and is visually unaffected by this branch.

- [ ] **Step 2: Fix any problems found**

Only if Step 1 surfaces an issue. Commit any fix with a message describing the problem and the fix.

- [ ] **Step 3: Merge to main**

```bash
git checkout main
git pull
git merge feat/floating-glass-navbar
git push origin main
git branch -d feat/floating-glass-navbar
```
