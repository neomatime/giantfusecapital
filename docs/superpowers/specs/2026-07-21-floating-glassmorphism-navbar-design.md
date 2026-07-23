# Floating Glassmorphism Navbar Design Spec

Date: 2026-07-21
Status: Approved for planning

## Purpose

Redesign the navbar into a premium floating glass pill — centered, inset from the viewport edges, rounded, translucent-blurred — rather than the current edge-to-edge bar. Requested by the user with an extremely detailed brief (exact dimensions, glass values, animation timing, hover states). The user confirmed the visual result should be implemented in this project's existing plain HTML/CSS/JS stack, not React/Tailwind — this project has no build tool, no framework, and no npm dependencies, and that constraint holds here too.

## Architecture

No new files. `.navbar` (currently the full-width, fixed, edge-to-edge visible bar) becomes an invisible full-width positioning wrapper only — `position: fixed; top:0; left:0; right:0; padding-top: 28px;` with no background/border/shadow of its own. `.navbar-inner` (currently just a max-width content wrapper with no visual styling) becomes the actual floating glass pill — it gets the background, blur, border, radius, shadow, and sizing. This split lets `.navbar` keep doing its existing job (full-width positioning context, `is-scrolled` class holder) while `.navbar-inner` does the new visual work, with zero changes to `components/navbar.html`'s markup structure.

`assets/js/navigation.js` needs exactly one change: the existing scroll listener's threshold changes from `window.scrollY > 24` to `window.scrollY > 40`, per the brief's explicit "after scrolling 40px" behavior. No other JS changes — the `is-scrolled` class mechanism is reused exactly as-is, same as every prior navbar feature this session.

## Layout

- Floating pill: `width: 90%`, `max-width: 1400px`, centered (`margin: 0 auto`), `height: 76px`, `border-radius: 22px`.
- Positioned `28px` from the viewport top (`.navbar`'s `padding-top`).
- `--navbar-height` (the self-adjusting custom property already driving body padding and the mobile drawer's top offset) automatically picks up the new total footprint (28px gap + 76px pill = 104px) via the existing `ResizeObserver` in `main.js` — confirmed live, no changes needed there.

## Styling

- Background: `rgba(255, 255, 255, 0.08)` at rest, `rgba(255, 255, 255, 0.16)` once scrolled (`.is-scrolled`).
- `backdrop-filter: blur(20px)` at rest, `blur(26px)` once scrolled (with `-webkit-backdrop-filter` for Safari).
- Border: `1px solid rgba(255, 255, 255, 0.15)`.
- Shadow: `0 10px 40px rgba(0,0,0,.18), 0 2px 8px rgba(255,255,255,.05) inset` at rest; `0 14px 48px rgba(0,0,0,.24), 0 2px 8px rgba(255,255,255,.05) inset` once scrolled (deepens slightly, per the brief's "slightly stronger shadow" scroll behavior).
- Hover: background brightens to `rgba(255,255,255,0.14)` at rest / `rgba(255,255,255,0.20)` once scrolled, transition `250ms`.

## Logo

- Stays the existing transparent PNG (`assets/images/logo/logo-horizontal.png`) at its already-fixed `52px` height (unchanged from the prior navbar work — still exempted from the site's global `img { max-width: 100% }` reset via `max-width: none`, still un-stretched via `justify-self: start`, both already-established fixes that must be preserved).
- White while at rest (`filter: brightness(0) invert(1)`), full color once scrolled (`filter: none`) — see the Contrast Fix section below for why.
- Vertically centered via the existing grid `align-items: center`.
- The pill's own `padding: 0 var(--space-32)` already gives the logo generous left clearance — no separate padding needed on `.navbar-logo` itself.

## Navigation

- Centered via the existing `grid-template-columns: 1fr auto 1fr` technique (already established, including each item's explicit `grid-column` — the fix for the "hamburger lands in the wrong column when nav-links is display:none" bug from a prior session task, which must be preserved).
- Link gap increases from the current `24px` to `40px` (a deliberate literal value, not an existing spacing token, since none of `--space-*` falls in the requested 36–44px range — same precedent as other deliberate literal values already used elsewhere in this codebase, e.g. `#007A82`).
- White at rest, navy once scrolled (see Contrast Fix below). Active link stays teal (`--color-teal`) regardless of scroll state — already reads clearly against both.
- Hover transitions to teal, `250ms` ease.

## CTA Button

Scoped entirely to `.navbar-actions .navbar-cta` — the shared `.btn`/`.btn-solid` classes (used by buttons elsewhere on the site) are never touched, matching this project's established "more specific selector, don't touch shared component classes" convention.
- `border-radius: 15px` (overriding the shared `.btn`'s `var(--radius-sm)`).
- `background: linear-gradient(135deg, var(--color-teal), #00838C)`.
- Resting glow: `box-shadow: 0 4px 16px rgba(0,163,173,.35)`.
- Hover: `transform: translateY(-2px)`, `box-shadow: 0 10px 30px rgba(0,180,220,.35)`, `250ms` ease.

## Animations

- Load-in: `.navbar-inner` gets `opacity: 0; transform: translateY(-10px);` plus `animation: navbar-fade-in 500ms ease-out forwards;`, animating to `opacity:1; transform:translateY(0);`. Pure CSS, no JS — the animation fires automatically on paint, `forwards` keeps the end state permanent.
- Scroll transition: background/blur/shadow changes on `.is-scrolled` use the existing `transition` property (`0.3s ease`), consistent with how every other scroll-triggered visual change on this navbar already animates.

## Contrast Fix (real, load-bearing deviation from the literal brief)

The brief's implicit assumption — logo/text stay white at all times — breaks down once the page is scrolled past the hero into any of this site's light `--color-off-white` content sections (which is most of the scroll depth on every page). Verified with the actual math: `rgba(255,255,255,0.16)` (the scrolled-state glass) composited over `rgb(248,250,252)` (this site's off-white body background) resolves to `rgb(249,251,252)` — visually indistinguishable from the page background itself. White text on that is functionally invisible.

**Fix, confirmed with the user:** keep the glass background values exactly as specified (never change the glass itself), but reuse the site's already-established scroll-conditional color pattern — logo/nav-links/hamburger are white while `.navbar` does not have `.is-scrolled`, and switch to navy once it does. This means once scrolled, the pill is a light, slightly-more-opaque glass with dark navy content — reads clearly whether the glass is sitting over the light body background or (on a shorter page) still partially over the hero.

## Global Constraints

- No build tool, bundler, framework, or npm dependency — plain HTML/CSS/JS only. This was an explicit, confirmed decision (the user's original brief asked for React + Tailwind; confirmed to implement in the existing stack instead).
- `.navbar-inner` holds all the new visual styling; `.navbar` stays a bare positioning wrapper.
- The `is-scrolled` scroll-listener threshold in `navigation.js` changes from `24` to `40` — the only JS change in this entire feature.
- Logo stays exempted from the global `img { max-width: 100% }` reset and un-stretched in its grid cell (both pre-existing fixes, must not regress).
- Nav items keep their explicit `grid-column` assignments (pre-existing fix for the display:none auto-placement bug, must not regress).
- CTA styling is scoped to `.navbar-actions .navbar-cta` only — never modifies the shared `.btn`/`.btn-solid` classes used elsewhere on the site.
- Logo/nav-links/hamburger must switch from white to navy on `.is-scrolled` (the confirmed contrast fix) — this is a deliberate, approved deviation from the literal "keep the logo white" line in the brief, not an oversight.
- `--navbar-height` must continue to self-adjust correctly (verify, don't just assume) so the mobile drawer's top offset stays correct.
- Mobile drawer (`.navbar-backdrop`, `.navbar-mobile-menu`, and everything inside it) is completely unchanged — only the top bar (now a floating pill) is redesigned.

## Testing

Consistent with the rest of the project: no test framework.
- Live browser checks: floating pill renders at the correct size/position/radius on Home and at least one interior page; load-in animation plays; hover states (pill background brighten, nav-link teal, CTA lift+glow) render correctly; scroll past 40px triggers the `.is-scrolled` transition (glass opacity/blur/shadow increase, logo/links/hamburger switch to navy); confirm navy text reads clearly once scrolled into a light content section specifically (the contrast fix's whole reason for existing) — verify via computed `color` after manually dispatching a `scroll` event, not by relying on `window.scrollTo()` alone, since this tooling environment's `scrollTo()` does not reliably fire a native `scroll` event on its own (a real user's mouse/trackpad scrolling does not have this limitation — this is a test-methodology note only, not a product concern). Mobile: pill renders correctly, hamburger toggles the drawer, drawer itself is visually unchanged. `--navbar-height` matches the pill's actual rendered footprint. Zero console errors.
- **Known tooling caveat, not a product bug**: `computer` screenshots taken on a browser tab that has already done substantial scrolling/navigation in the same session can render stale or blank, independently confirmed via `elementFromPoint`/`getBoundingClientRect` returning correct values while the screenshot does not. When a screenshot looks wrong but DOM-based checks say otherwise, open a fresh tab and re-verify there before treating it as a real defect.

## Out of Scope

- Migrating any part of the site to React/Tailwind or any build tool.
- Redesigning the hero section, its typography, spacing, or background image.
- Any change to the mobile nav drawer's own visual design.
- Changing the shared `.btn`/`.btn-solid` classes used by buttons elsewhere on the site.
