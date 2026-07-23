# Mobile/Tablet Dropdown Navigation Design Spec

Date: 2026-07-23
Status: Approved for planning

## Purpose

Replace the current mobile navigation pattern — a full-height, right-side sliding drawer with a dark navy background and a dimmed full-screen backdrop — with a compact dropdown that expands directly out of the floating glass navbar pill, matching its glassmorphism styling. Applies below the existing `1025px` breakpoint (both tablet and phone widths — the brief explicitly wants both to get this treatment, and the existing single breakpoint already covers that range, so no new breakpoint is needed). Desktop (≥1025px, the existing horizontal nav-links row) is completely unaffected.

## Architecture

No new files. `components/navbar.html`, `assets/css/navigation.css`, and `assets/js/navigation.js` are all modified.

- `#navbar-mobile-menu` moves from being a sibling of `.navbar-inner` (the pill) to being nested *inside* it, so it can be `position: absolute` relative to the pill (`.navbar-inner` gains `position: relative`) and inherit the pill's exact width/centering — "the dropdown should match the width of the floating navbar" falls out of this structurally, not by duplicating the pill's sizing values.
- `.navbar-backdrop` (the dark full-screen dimmed overlay used by the old drawer) is removed entirely — the brief's dropdown is a lightweight contextual popover, not a modal takeover. "Clicking outside closes it" is handled by a `document` click listener instead of a visible backdrop element.
- The hamburger icon changes from a crude text-glyph swap (`☰`/`✕` via `textContent`) to three CSS-animated `<span>` bars that rotate/fade into an X — this is what makes "smoothly animate into an X" actually smooth; the old approach had no transition at all, just an instant character swap.
- `assets/js/navigation.js`'s `setOpen()` function loses its `backdrop` handling, gains a `document` click listener (closes the menu on any click outside both the menu and the toggle button) and a per-link click listener inside the menu (closes the menu when any nav link or the CTA is clicked).

## Layout

- Dropdown position: `top: calc(100% + 12px)` relative to `.navbar-inner`, `left: 0; right: 0` (spans the pill's exact width).
- Vertically stacked nav items, each `padding: 18px var(--space-8)` (within the requested 16–20px range).
- "Investor Enquiry" CTA sits last, full-width, with `margin-top: var(--space-24)` separating it from the links above (no divider line — the brief only asked for "additional top margin," and the current drawer's divider line is dropped along with everything else about the old drawer's visual language).

## Styling

Reuses the exact same glassmorphism values already established for the pill itself, including its scroll-state behavior — this is deliberate, not just visual consistency for its own sake: the dropdown can be opened at any scroll position, meaning it can sit over the dark hero photo (unscrolled) or this site's light `--color-off-white` page sections (scrolled), the identical contrast problem already solved for the pill.

- Background: `rgba(255, 255, 255, 0.08)` at rest, `rgba(255, 255, 255, 0.16)` once `.navbar` has `.is-scrolled` (same values, same trigger, as the pill).
- `backdrop-filter: blur(20px)` at rest, `blur(26px)` scrolled.
- Border: `1px solid rgba(255, 255, 255, 0.15)`, `border-radius: 22px` (matching the pill).
- Shadow: `0 10px 40px rgba(0,0,0,.18), 0 2px 8px rgba(255,255,255,.05) inset` (matching the pill's resting shadow).
- Nav link text: white at rest, navy once `.is-scrolled` — identical rule and trigger to the pill's own nav links, for the identical reason (contrast).
- CTA: reuses the same premium teal-gradient treatment already built for the desktop CTA (`border-radius: 15px`, gradient background, glow shadow, hover lift) — extended to also apply to `.navbar-mobile-cta`, so both CTAs look the same, just scoped so neither touches the shared `.btn`/`.btn-solid` classes used elsewhere on the site.

## Animation

- Dropdown: `opacity` + `transform: translateY(-8px) → translateY(0)`, `280ms ease` (within the requested 250–300ms fade + slide-down range). `visibility` toggles alongside `opacity` so the closed dropdown isn't focusable/hoverable.
- Hamburger → X: three `.navbar-toggle-bar` spans, `250ms ease` transform/opacity transitions. Open state: bar 1 `translateY(7px) rotate(45deg)`, bar 2 `opacity: 0`, bar 3 `translateY(-7px) rotate(-45deg)` — the standard three-bar hamburger-to-X pattern. Bars are colored via `background: currentColor`, so they automatically follow the toggle button's own existing white/navy scroll-state color swap with no extra rules needed.

## Interaction

- Tapping the hamburger toggles the dropdown open/closed (existing mechanism, reused).
- Clicking anywhere outside the dropdown AND outside the toggle button closes it (new: a `document` click listener, since the old dark backdrop element — which used to serve this purpose via its own click handler — no longer exists).
- Clicking any nav link, or the CTA, inside the dropdown closes it (new: every `<a>` inside `#navbar-mobile-menu` gets a click listener that calls `setOpen(false)` — real links, so the browser also navigates normally; closing the menu doesn't interfere with that).
- `Escape` closes it (existing mechanism, reused, unchanged).
- Body scroll locks while open (existing `body.nav-open { overflow: hidden }` mechanism, reused, unchanged — including its existing desktop-width override, which stays relevant since the mobile menu can theoretically still be markup-open if a window is resized past 1025px while it was open).

## Global Constraints

- No build tool, bundler, framework, or npm dependency.
- Desktop (≥1025px) navbar is completely unaffected — same horizontal `.navbar-links` row, same CTA, no dropdown/hamburger rendered at all (`display: none` on both, unchanged from today).
- The existing `1025px` breakpoint is reused as-is for the mobile/tablet-vs-desktop split — no new breakpoint tier, since the brief's "tablet" and "mobile" both want the same dropdown treatment, which is exactly what the current single breakpoint already produces.
- `.navbar-backdrop` and everything related to it (the CSS rule, the JS reference, the HTML element) is removed — not deprecated, not left dead in place.
- The dropdown must reuse the pill's exact glass values and the exact same `.is-scrolled`-triggered white/navy text swap — not a separate, independently-tuned color scheme, since the underlying contrast reasoning is identical.
- CTA premium styling (gradient, glow, hover lift) must apply to both `.navbar-actions .navbar-cta` (desktop) and `.navbar-mobile-cta` (dropdown) without touching the shared `.btn`/`.btn-solid` classes.
- The Investor Enquiry CTA must always be present in the dropdown — never conditionally hidden or removed.
- `aria-expanded` and `aria-controls` on the toggle button are preserved (already correct, must not regress). Focus states on links/CTA must not be suppressed.

## Testing

Consistent with the rest of the project: no test framework.
- Live browser checks: dropdown opens/closes via the hamburger; the hamburger visibly and smoothly animates into an X (verify via the bars' computed `transform` matrices, not just a screenshot, since this environment's screenshot tool can crop near viewport edges); dropdown matches the pill's width and sits directly below it; all 5 links plus the CTA render in the correct order with correct spacing; clicking a link or the CTA closes the menu (and still navigates, since these remain real `<a>` elements); clicking outside the dropdown closes it; `Escape` closes it; body scroll is locked while open. Confirm the scroll-state contrast fix applies identically to the dropdown as to the pill (white at top, navy once scrolled) — verify both states, not just one. Confirm desktop width (1280px) is pixel-for-pixel unaffected — no dropdown/hamburger markup visible, horizontal links unchanged. Confirm tablet width (e.g. 800px) gets the dropdown treatment, not the old drawer and not the desktop row. Zero console errors.
- Known environment caveats to route around, not treat as product bugs: `window.scrollTo()` via this tooling doesn't reliably fire a native `scroll` event on its own (dispatch one manually before checking `is-scrolled`-dependent state); screenshots and occasionally `getComputedStyle` can go stale on a heavily-reused browser tab (open a fresh tab to double-check before concluding something is actually broken).

## Out of Scope

- Any change to the desktop horizontal nav (already covered by "unaffected," stated for clarity).
- A true ARIA `menu`/`menuitem` roving-tabindex pattern — the brief asks for standard accessibility (keyboard nav, focus states, ARIA attributes), which the existing `<nav>` + real `<a>` links + `aria-expanded`/`aria-controls` pattern already satisfies; not upgrading to a more elaborate ARIA widget pattern that wasn't requested.
- A distinct tablet-only visual treatment — tablet and mobile share the exact same dropdown design per the brief.
