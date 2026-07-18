# Mobile Navigation Drawer — Design Spec

Date: 2026-07-18
Status: Approved for planning

## Purpose

Replace the current below-navbar dropdown mobile menu with a full-height panel that slides in from the right edge of the screen, and move the "Investor Enquiry" CTA into that panel instead of the collapsed top bar. This is a shared-component change (`components/navbar.html`, `assets/css/navigation.css`, `assets/js/navigation.js`) — it affects every page on the site, since the navbar is fetched via `data-include` everywhere.

## Root cause found during investigation

The reported symptom ("logo looks compressed on mobile") isn't purely cosmetic — it traces to a real CSS specificity bug. `navigation.css` sets `.navbar-cta { display: none; }` to hide the CTA button below the desktop breakpoint (1025px), re-enabling it only via `@media (min-width: 1025px) { .navbar-cta { display: inline-flex; } }`. But `components.css` (which defines `.btn { display: inline-flex; ... }`) is linked *after* `navigation.css` in every page's `<head>`, and `.btn` and `.navbar-cta` are both single-class selectors — equal specificity. When specificity ties, cascade order (not source position within a single file) decides, and the later-loaded stylesheet wins. So `.btn`'s `display: inline-flex` overrides `.navbar-cta`'s `display: none` on every screen size, and the CTA button has actually been visible on mobile all along, fighting the logo and hamburger for space in a cramped row and forcing the logo image to render narrower than its natural aspect ratio (measured live: renders at ~1.59:1 instead of the source image's ~2:1).

This redesign fixes it as a side effect (the CTA moves out of the top bar entirely on mobile), but the fix also needs its own defensive specificity bump so the same trap can't resurface — see Global Constraints.

## Architecture

**Markup** (`components/navbar.html`): the mobile drawer becomes two new elements, both direct children of `.navbar`, siblings of the existing `.navbar-inner`:
- `#navbar-backdrop` — a dimming overlay behind the panel.
- `#navbar-mobile-menu` — the panel itself, restructured to contain (top to bottom): the "Investor Enquiry" CTA (duplicated here, same as the existing desktop/mobile link duplication pattern already used for nav links), a divider, then the nav links list.

The toggle button (`#navbar-toggle-btn`) stays exactly where it is today, inside `.navbar-inner`, top-right of the bar.

**Visuals:** the panel is `position: fixed`, full viewport height, anchored to the right edge, `width: 85%` capped at `max-width: 340px`, `background: var(--color-navy)`. It's off-screen by default via `transform: translateX(100%)` and slides to `translateX(0)` over ~300ms ease when opened. The backdrop fades `opacity` between `0` and `1` over the same duration, `background: rgba(13, 27, 42, 0.6)` (matches the existing hero-overlay's navy-tint convention). Both panel and backdrop also toggle `visibility` alongside `transform`/`opacity` — CSS's built-in transition behavior for `visibility` switches to `visible` immediately when transitioning *to* visible and only switches to `hidden` at the *end* of the transition when transitioning away, which is exactly the "stay interactive/paintable while animating, but truly hidden (not tab-reachable) once fully closed" behavior needed, with no extra JS timing logic required.

**Stacking:** the toggle button needs to stay clickable (to close the panel) even though the panel is a full-height overlay that would otherwise cover the same screen region. Give the backdrop and panel z-index values in a dedicated high range (200/201) clearly separated from the rest of the site's z-index usage (which tops out at 50, the navbar bar itself), and give `.navbar-toggle` its own `position: relative; z-index: 202;` so it always renders above both.

**Behavior** (`assets/js/navigation.js`, extending the existing `init()`/toggle logic — not a new file, this is the same shared concern):
- Click toggle button → toggle `.is-open` class on the panel, the backdrop, and the toggle button itself (the last one purely as a styling hook, e.g. for future affordance changes); toggle `aria-expanded`; swap the toggle button's icon character between `☰` and `✕` directly via `textContent` (simplest approach — this codebase already manipulates the DOM directly rather than through a templating layer for small state changes like this).
- Click backdrop → close (same toggle-closed path as clicking the button again).
- `Escape` key → close, only when currently open.
- While open: add a class to `<body>` that sets `overflow: hidden`, preventing the page behind the drawer from scrolling; remove it on close.
- Clicking a nav link inside the panel needs no special handling — it's a normal `<a href>`, the browser navigates away and unloads the page, which naturally "closes" everything.

## Global Constraints

- Desktop behavior (≥1025px) is completely unchanged: full horizontal nav, visible CTA in the bar, no hamburger, no drawer/backdrop markup rendered differently (they can exist in the DOM but must have no visual effect at desktop widths — enforced the same way the current `.navbar-mobile-menu { @media (min-width: 1025px) { display: none !important; } }` rule already works, extended to the backdrop too).
- The desktop-only CTA visibility rule must be scoped with higher specificity than a single class, so it can't be silently overridden by `.btn`'s cascade position again: use `.navbar-actions .navbar-cta` (two classes, specificity 0-2-0) instead of the bare `.navbar-cta` (0-1-0) for both the `display: none` default and the `@media (min-width: 1025px)` override.
- Reuse existing tokens throughout: `--color-navy`, `--space-*` scale, the existing `.btn`/`.btn-solid` classes for the CTA duplicated inside the panel (add a modifier class only for the full-width/centered treatment it needs in that context, don't redefine the button's core look).
- The "Insights" nav link stays commented out in both the desktop and the new mobile panel link lists, matching its current site-wide intentional-hidden state (see project memory — this was a deliberate out-of-band decision, not something to touch here).
- No build tool, bundler, framework, or npm dependency may be introduced.

## Testing

Consistent with the rest of the project: no test framework.
- `node --check` on `assets/js/navigation.js`.
- Live browser checks at mobile width: confirm the panel slides in from the right with the CTA at the top, confirm the backdrop dims the page and closes the panel when tapped, confirm Escape closes it, confirm body scroll is locked while open and restored on close, confirm the toggle icon swaps between ☰ and ✕, confirm the CTA button in the panel is genuinely absent from the collapsed top bar at mobile widths (this is the regression check for the root-cause bug — computed `display` on `.navbar-actions .navbar-cta` should be `none` below 1025px), confirm the logo renders at its correct ~2:1 aspect ratio on mobile now that the row isn't overcrowded.
- Confirm desktop (≥1025px) is pixel-for-pixel unchanged: full nav visible, CTA visible in the bar, no hamburger, drawer/backdrop have no visual presence.
- Regression-check all 6 pages (Home/About/Strategies/Leadership/Contact — Insights doesn't exist yet) since `navbar.html` is a shared component fetched everywhere.

## Out of scope

- Any change to the desktop nav layout or breakpoint value (stays at 1025px).
- Animating the hamburger icon itself into an X shape (three lines morphing) — a simple character swap (☰ ↔ ✕) is used instead; a CSS-animated icon transform would be a nice-to-have but wasn't requested and adds complexity for a purely cosmetic upgrade.
- Focus-trapping (preventing Tab from cycling focus outside the open panel) — the `visibility` toggle already prevents the closed panel's links from being tab-reachable; a full focus trap while open is a further accessibility enhancement not requested here.
