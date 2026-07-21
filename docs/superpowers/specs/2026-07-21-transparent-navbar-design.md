# Transparent Navbar Design Spec

Date: 2026-07-21
Status: Approved for planning

## Purpose

Make the site navbar transparent while at the top of the page (over each page's hero photo), fading to the current solid off-white background once the visitor scrolls. Applies to all 5 pages — every page already uses a hero (Home's full-height hero, every interior page's `.hero-banner`), so the pattern is consistent site-wide.

## Behavior

Reuses the existing `.navbar.is-scrolled` class exactly as-is — it already toggles via `assets/js/navigation.js` at `window.scrollY > 24`, with no JavaScript changes needed for this feature:
- **Default (not scrolled, i.e. at the very top of any page):** `.navbar` has a transparent background and transparent border — the hero photo shows through underneath it. The logo, nav links, and mobile hamburger icon render in white so they stay readable against the dark hero photos/overlays.
- **`.is-scrolled` (any scroll past 24px):** `.navbar` returns to today's exact look — solid `--color-off-white` background, `--color-light-gray` border, drop shadow. The logo, nav links, and hamburger icon return to their current navy color.
- All color/background changes transition smoothly (`0.2s`–`0.3s` ease), matching the transition duration already used elsewhere on this site.
- The "Investor Enquiry" CTA button (`.navbar-cta`) is unchanged in both states — it already has its own solid teal background with white text, so it reads clearly against the hero photo and the solid navbar alike.
- The active-page link color (`.navbar-links a.active`, currently teal) is unchanged — teal reads clearly against both a dark hero photo and the light scrolled navbar.
- The mobile nav drawer itself (`.navbar-mobile-menu`, its dark-navy panel) is entirely unaffected — this feature only touches the top bar's own background/logo/link colors before the drawer opens.

## The Logo Problem (discovered during preview, not part of the original ask)

The navbar's current logo file (`assets/images/logo/logo-horizontal.png`) has **no real transparency** — it has a solid white background baked into the PNG itself. This was invisible before because it happened to match the navbar's own off-white background, but it would render as a stark white rectangle over a transparent navbar sitting on a photo.

**Fix:** the project already contains a properly transparent version of the same logo at `docs/assets/logo-horizontal-transparent.png` (confirmed via pixel sampling — alpha channel is genuinely 0 in the background, not just visually similar). This file replaces the content of `assets/images/logo/logo-horizontal.png` (same filename — `components/navbar.html` needs no change, and this is the *only* place this file is referenced anywhere in the project, confirmed via search). This is a strict improvement independent of the transparency feature — the logo was always fragile (relying on the two off-white shades matching by coincidence) and is now genuinely correct.

**Consequence:** the new file's proportions are very different from the old one (1536×291 vs. the old 1772×888) — much wider relative to its height. At the old fixed `height: 120px`, it would render roughly 2.6× wider than before, crowding the nav links into wrapping. `.navbar-logo img`'s height must drop to `52px` to keep its rendered width comparable to today's footprint. `--navbar-height` is a self-adjusting CSS custom property (via a `ResizeObserver` in `main.js`), so nothing else needs to be manually resized to account for this — confirmed live, the rest of the page's top padding adjusts automatically.

**White-state logo color:** `filter: brightness(0) invert(1)` applied to the logo `<img>` while `.navbar` is not `.is-scrolled` — turns every opaque pixel white (transparent pixels stay transparent), producing a clean white silhouette with no new asset needed. Removed (`filter: none`) once `.is-scrolled`, restoring the logo's normal teal/navy color.

## Known Cosmetic Tradeoff (accepted)

The "capital partners" tagline under the "Giantfuse" wordmark is a dark navy color baked into the logo image. While the navbar is transparent over a dark hero photo, this tagline reads faintly — legible, but noticeably weaker than the crisp white ring mark and "Giantfuse" wordmark next to it. This was shown to and accepted by the user as-is; no further fix (e.g., a separately-recolored tagline) is in scope for this change.

## Global Constraints

- No build tool, bundler, framework, or npm dependency.
- No JavaScript changes — reuses the existing `is-scrolled` class and scroll listener in `assets/js/navigation.js` exactly as they already exist.
- `assets/images/logo/logo-horizontal.png` is replaced in place with the content of `docs/assets/logo-horizontal-transparent.png` (byte-for-byte copy, same destination filename — no markup change needed in `components/navbar.html`).
- `.navbar-logo img`'s height changes from `120px` to `52px` to compensate for the new file's different aspect ratio.
- The "Investor Enquiry" CTA button, the active-link teal color, and the entire mobile nav drawer are unchanged.
- Reuses existing tokens only: `--color-white`, `--color-navy`, `--color-off-white`, `--color-light-gray`, existing transition durations already used in this file.

## Testing

Consistent with the rest of the project: no test framework, no JS changed.
- Live browser checks (already dry-run once during design, to be formally re-verified during implementation): navbar is transparent with white logo/links/hamburger at the top of all 5 pages; smoothly transitions to the solid off-white look with navy logo/links past 24px of scroll; no nav-link wrapping at desktop width; mobile hamburger icon and drawer both work correctly and are visually unaffected; zero console errors.
- Regression: confirm the existing scroll-shadow behavior, active-link highlighting, and mobile drawer open/close are all unaffected (this touches the same CSS file as several of those features, so a full regression pass across all 5 pages at mobile and desktop widths is warranted).

## Out of Scope

- Recoloring the "capital partners" tagline specifically (accepted tradeoff, see above).
- Any change to the mobile nav drawer's own appearance or behavior.
- Any change to the "Investor Enquiry" CTA button's styling.
- Replacing/redesigning the logo itself beyond swapping in the already-existing transparent version.
