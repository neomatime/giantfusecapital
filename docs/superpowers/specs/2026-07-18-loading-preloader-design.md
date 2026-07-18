# Home Page Preloader — Design Spec

Date: 2026-07-18
Status: Approved for planning

## Purpose

Add a branded loading overlay to `index.html` (Home page only) that shows the site's favicon spinning while the page's real content finishes loading, then fades away to reveal the Home page. This is the site's entry point, so it's the one page where a brief branded loading moment makes sense — not added to any other page.

## Architecture

**Overlay markup lives directly in `index.html`**, as the very first element inside `<body>`, before the navbar `data-include` div:

```html
<div id="preloader" role="status" aria-live="polite">
  <img src="assets/images/icons/favicon.png" alt="" class="preloader-mark">
  <span class="visually-hidden">Loading Giantfuse Capital Partners...</span>
</div>
```

It's visible immediately on paint via plain HTML/CSS — no JavaScript is required to *show* it. `assets/css/pages/home.css` (already linked, already exists) gains the styling: a fixed, full-viewport, centered overlay in `--color-off-white` (matches the body background, so if hide-timing is ever slightly off there's no color flash), with the favicon `<img>` continuously rotating via a CSS `@keyframes` animation (~1.5s per rotation, linear, infinite).

**`.visually-hidden` doesn't exist anywhere in this codebase yet** — it needs to be added as part of this feature (a standard screen-reader-only utility: clipped to 1px, absolutely positioned off the visible layout, not `display:none` so it's still announced by assistive tech). Since no shared utility-class file exists for this kind of single-purpose helper, and only this feature needs it right now, it's added to `home.css` alongside the rest of the preloader styles — if a future page needs the same utility, it can be promoted to a shared file at that point (same duplicate-until-a-third-use reasoning already established elsewhere in this project).

**New file `assets/js/preloader.js` hides it.** Following the established file pattern (IIFE, `window.Giantfuse.Preloader` namespace, `module.exports` guard for Node-testability of any pure logic it contains), but with one deliberate deviation from how every other page-specific script on this site works:

**Why this can't wait to be called by `main.js`'s `init()`, unlike `contact-form.js`:** every other page-specific script exposes an `init()` that `main.js`'s own `init()` calls explicitly, after `main.js` has already awaited fetching the navbar/footer partials. That's fine for scripts that only need the DOM to exist. This script needs to attach a listener to the browser's native `window.load` event — which fires once every resource on the page (including the eagerly-loaded hero image) has finished loading. If `preloader.js` waited to be invoked by `main.js`'s async-gated `init()`, there's a real race: on a fast/cached load, `window.load` could fire *before* `main.js` finishes its await chain and gets around to calling `Preloader.init()`, meaning the listener attaches too late, is never triggered, and the spinner is stuck on screen permanently (only rescued by the timeout fallback below, which is a bad experience — five full seconds of a stuck spinner on every fast load).

**The fix: `preloader.js` self-initializes at parse time**, not via an exported `init()` waiting to be called. It runs its own `document.querySelector('#preloader')` guard (safe no-op if absent — e.g. if this file were ever accidentally linked on another page) and attaches its `window.load` listener immediately when the script executes, independent of `main.js`'s lifecycle entirely. This is called out explicitly in the code as an intentional exception to the site's usual "main.js orchestrates every script's init" convention, with the reasoning above — not an oversight for a future reader to "fix" by wiring it into `main.js`.

## Behavior

- **Hide trigger:** the earlier of (a) the `window.load` event firing, or (b) a 5-second safety timeout — so a hung/slow resource can never leave the overlay stuck indefinitely.
- **Minimum visible duration:** ~600ms from script start. If `window.load` fires sooner than that (very fast/cached loads), the hide is delayed until the minimum has elapsed, so the spin is always actually glimpsed at least once rather than flashing away instantly. This uses `performance.now()` at script start compared against the time the hide condition is met — no dependency on any external timing library.
- **Hide mechanism:** add a `.is-hidden` class that CSS-transitions `opacity` to `0` over ~400ms, then after the transition ends, set `display: none` (via a `transitionend` listener, with a safety `setTimeout` fallback in case the event doesn't fire) so the overlay can't block clicks/scroll after it's visually gone and is removed from the accessibility tree.
- **Reduced motion:** a `@media (prefers-reduced-motion: reduce)` rule disables the spin `animation` on `.preloader-mark` — the overlay itself still appears and fades out normally (that's just an opacity change, not motion that triggers vestibular discomfort), only the continuous rotation is skipped.

## Testing

Consistent with the rest of the project: no test framework.
- `node --check` on `assets/js/preloader.js`.
- Live browser checks: confirm the overlay is visible on initial paint, confirm it fades out and is removed from the DOM after load (check both `opacity` and eventual `display: none` / removal), confirm the minimum-duration behavior is at least plausible (can't reliably assert exact timing in an automated browser check, but can confirm the overlay doesn't disappear on the very first paint), confirm `prefers-reduced-motion` is respected (check computed `animation-name` is `none` under that media condition), confirm no console errors, confirm the other 4 pages (About/Strategies/Leadership/Contact) are completely unaffected (this file isn't linked there).

## Out of scope

- Any other page — this is a Home-page-only feature per explicit request.
- A dedicated standalone loading page/URL with a redirect — explicitly decided against in favor of an overlay.
- Configurable/skippable preloader (e.g., a cookie to only show it once per session) — not requested; it shows on every Home page load.
