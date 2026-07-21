# Transparent Navbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the navbar transparent at the top of every page (over the hero photo), fading to the existing solid off-white look once scrolled, with white logo/nav-text/hamburger-icon while transparent.

**Architecture:** One binary asset swap (the navbar logo, replaced in place with an already-existing transparent version from `docs/assets/`) plus a CSS-only change to `assets/css/navigation.css`. No JavaScript changes — reuses the existing `.is-scrolled` class and scroll listener in `assets/js/navigation.js` exactly as they already work today.

**Tech Stack:** Plain CSS. No build tool, no npm dependency.

**Branch:** `feat/transparent-navbar`, created from `main`.

## Global Constraints

- No build tool, bundler, framework, or npm dependency.
- No JavaScript changes of any kind — `assets/js/navigation.js` is not touched.
- `assets/images/logo/logo-horizontal.png` is replaced in place with the exact content of `docs/assets/logo-horizontal-transparent.png` — same destination filename, so `components/navbar.html` needs no markup change.
- `.navbar-logo img`'s height changes from `120px` to `52px` (the new logo file's aspect ratio is much wider/shorter than the old one; at the old height it would overflow and wrap the nav links).
- The "Investor Enquiry" CTA button (`.navbar-cta`), the active-link teal color, and the entire mobile nav drawer (`.navbar-backdrop`, `.navbar-mobile-menu`, and everything inside it) are unchanged.
- Reuses existing tokens only: `--color-white`, `--color-navy`, `--color-off-white`, `--color-light-gray`.

---

### Task 1: Replace the logo asset and make the navbar transparent

**Files:**
- Modify (binary replace): `assets/images/logo/logo-horizontal.png`
- Modify: `assets/css/navigation.css`

- [ ] **Step 1: Replace the logo file**

```bash
cp docs/assets/logo-horizontal-transparent.png assets/images/logo/logo-horizontal.png
```

- [ ] **Step 2: Update the navbar CSS**

In `assets/css/navigation.css`, find:

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--color-off-white);
  border-bottom: 1px solid var(--color-light-gray);
  transition: box-shadow 0.2s ease;
}
.navbar.is-scrolled { box-shadow: 0 2px 8px rgba(13, 27, 42, 0.08); }
.navbar-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-12) var(--space-24);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.navbar-logo { display: flex; align-items: center; }
.navbar-logo img { height: 120px; width: auto; }
.navbar-links { display: none; align-items: center; gap: var(--space-24); }
@media (min-width: 1025px) { .navbar-links { display: flex; } }
.navbar-links a { font-size: 0.9rem; font-weight: 500; color: var(--color-navy); }
.navbar-links a.active, .navbar-mobile-links a.active { color: var(--color-teal); }
.navbar-links a.active { border-bottom: 2px solid var(--color-teal); padding-bottom: var(--space-4); }
.navbar-actions { display: flex; align-items: center; gap: var(--space-16); }
.navbar-actions .navbar-cta { display: none; }
@media (min-width: 1025px) { .navbar-actions .navbar-cta { display: inline-flex; } }
.navbar-toggle { display: inline-flex; position: relative; z-index: 202; font-size: 1.4rem; color: var(--color-navy); }
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.navbar-logo { display: flex; align-items: center; }
.navbar-logo img { height: 52px; width: auto; filter: brightness(0) invert(1); transition: filter 0.3s ease; }
.navbar.is-scrolled .navbar-logo img { filter: none; }
.navbar-links { display: none; align-items: center; gap: var(--space-24); }
@media (min-width: 1025px) { .navbar-links { display: flex; } }
.navbar-links a { font-size: 0.9rem; font-weight: 500; color: var(--color-white); transition: color 0.3s ease; }
.navbar.is-scrolled .navbar-links a { color: var(--color-navy); }
.navbar-links a.active, .navbar-mobile-links a.active { color: var(--color-teal); }
.navbar-links a.active { border-bottom: 2px solid var(--color-teal); padding-bottom: var(--space-4); }
.navbar-actions { display: flex; align-items: center; gap: var(--space-16); }
.navbar-actions .navbar-cta { display: none; }
@media (min-width: 1025px) { .navbar-actions .navbar-cta { display: inline-flex; } }
.navbar-toggle { display: inline-flex; position: relative; z-index: 202; font-size: 1.4rem; color: var(--color-white); transition: color 0.3s ease; }
.navbar.is-scrolled .navbar-toggle { color: var(--color-navy); }
@media (min-width: 1025px) { .navbar-toggle { display: none; } }
```

- [ ] **Step 3: Verify in the browser**

Start the dev server (`preview_start` name `giantfuse`), navigate to `index.html`. Confirm:
- At the top of the page (not scrolled): navbar background is transparent (hero photo visible through it), logo renders as a clean white silhouette (not a white box — this confirms the new logo file's transparency actually took effect), nav links and the hamburger icon (on mobile width) are white, no nav-link wrapping at desktop width (1280×900).
- Scroll down past ~24px: navbar transitions smoothly to the solid off-white background with a shadow, logo returns to full color, nav links and hamburger icon return to navy.
- Repeat the top-of-page check on `about.html` (or any interior page) to confirm the `.hero-banner` case looks correct too.
- Resize to mobile (375×812): logo/hamburger render correctly white while transparent; open the mobile drawer and confirm it is completely unaffected (still solid dark navy, unrelated to this change).
- No console errors.

- [ ] **Step 4: Commit**

```bash
git add assets/images/logo/logo-horizontal.png assets/css/navigation.css
git commit -m "feat: make navbar transparent over the hero, solid on scroll"
```

---

### Task 2: Full regression pass and merge

**Files:** none (verification only, plus whatever Step 2 below needs if problems are found).

- [ ] **Step 1: Regression pass across all 5 pages**

For each of `index.html`, `about.html`, `strategies.html`, `leadership.html`, `contact.html`, at both desktop (1280×900) and mobile (375×812) widths:
- Confirm the navbar is transparent at the top with a white logo/links/hamburger, and transitions to solid/navy on scroll.
- Confirm the active nav link (teal) is still correctly highlighted for that page.
- Confirm zero console errors.

On `index.html` and one interior page, at mobile width: open the mobile nav drawer and confirm it still opens/closes correctly (toggle click, backdrop click, Escape key) and looks completely unchanged — this branch touches the same CSS file as the drawer, so this is a real regression risk worth checking explicitly, not just assumed safe.

- [ ] **Step 2: Fix any problems found**

Only if Step 1 surfaces an issue. Commit any fix with a message describing the problem and the fix.

- [ ] **Step 3: Merge to main**

```bash
git checkout main
git pull
git merge feat/transparent-navbar
git push origin main
git branch -d feat/transparent-navbar
```
