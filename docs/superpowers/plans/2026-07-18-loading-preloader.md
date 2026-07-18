# Home Page Preloader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a branded loading overlay to `index.html` that shows the site's favicon spinning while the page finishes loading, then fades away to reveal the Home page.

**Architecture:** Overlay markup lives directly in `index.html` (visible instantly via plain HTML/CSS, no JS required to show it). A new, fully self-contained `assets/js/preloader.js` hides it once the page has loaded, self-initializing at parse time rather than waiting to be called by `main.js`'s async-gated `init()` — see Global Constraints for why.

**Tech Stack:** Plain HTML/CSS/JS. No build tool, no new dependencies. No test framework — `node --check` for JS syntax, live browser checks for everything else.

## Global Constraints

- No build tool, bundler, framework, or npm dependency may be introduced.
- This feature is Home-page-only (`index.html`) — do not add it to `about.html`, `strategies.html`, `leadership.html`, or `contact.html`.
- `preloader.js` MUST self-initialize immediately when the script executes — it must NOT expose a `window.Giantfuse.Preloader.init()` waiting to be called by `main.js`. Reason: `main.js`'s `init()` only runs after an async `fetchInclude` chain resolves; on a fast/cached page load, the browser's `window.load` event can fire before that chain resolves, so a listener attached that late would be attached after the event already fired and would never run, leaving the overlay stuck on screen. Do not "fix" this by wiring a `Preloader.init()` call into `main.js` — that reintroduces the exact race this design avoids.
- `--color-off-white` is the overlay's background (matches the body background — no color flash if hide-timing is imperfect).
- `.visually-hidden` doesn't exist anywhere in this codebase yet and must be added as part of this feature (a standard screen-reader-only clip pattern), in `assets/css/pages/home.css` alongside the rest of the preloader's styles.
- The spin animation must be disabled under `@media (prefers-reduced-motion: reduce)` — the overlay itself still appears/disappears normally under that preference, only the continuous rotation is skipped.
- Spec reference: `docs/superpowers/specs/2026-07-18-loading-preloader-design.md`.

---

## Task 1: Preloader markup + CSS

**Files:**
- Modify: `index.html:20-21` (insert the overlay as the first element inside `<body>`, before the navbar `data-include` div)
- Modify: `assets/css/pages/home.css` (append)

**Interfaces:**
- Produces: `#preloader` element with class `.preloader-mark` on its `<img>`, an `.is-hidden` class (not yet applied by anything — Task 2 adds the JS that applies it) that CSS-transitions opacity to 0, and a `.visually-hidden` utility class. This task's CSS makes `.is-hidden` behave correctly if applied, but nothing applies it yet — the overlay will show and spin indefinitely until Task 2 lands. This is expected, matching the project's established pattern of shipping static markup/CSS before the JS that drives it.

- [ ] **Step 1: Create the git branch**

```bash
cd "C:\Users\Neo\OneDrive\Documents\HIMARK SGC\Giantfuse\giantfusecapital-site"
git checkout -b feat/home-preloader
```

Expected: `Switched to a new branch 'feat/home-preloader'`

- [ ] **Step 2: Insert the overlay markup in `index.html`**

Find:

```html
<body>
  <div data-include="navbar"></div>
```

Replace with:

```html
<body>
  <div id="preloader" role="status" aria-live="polite">
    <img src="assets/images/icons/favicon.png" alt="" class="preloader-mark">
    <span class="visually-hidden">Loading Giantfuse Capital Partners...</span>
  </div>

  <div data-include="navbar"></div>
```

- [ ] **Step 3: Append the preloader styles to `assets/css/pages/home.css`**

```css
#preloader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-off-white);
  transition: opacity 0.4s ease;
}
#preloader.is-hidden {
  opacity: 0;
  pointer-events: none;
}
.preloader-mark {
  width: 72px;
  height: 72px;
  animation: preloader-spin 1.5s linear infinite;
}
@keyframes preloader-spin {
  to { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .preloader-mark { animation: none; }
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 4: Verify in the browser**

Using the Claude Browser MCP tools: `preview_start` with `{name: "giantfuse"}`, navigate to `index.html`, then:

1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. `javascript_tool`, evaluate:
   ```js
   JSON.stringify({
     preloaderExists: !!document.getElementById('preloader'),
     markSrc: document.querySelector('.preloader-mark')?.getAttribute('src'),
     computedAnimationName: getComputedStyle(document.querySelector('.preloader-mark')).animationName,
     computedZIndex: getComputedStyle(document.getElementById('preloader')).zIndex,
     computedBg: getComputedStyle(document.getElementById('preloader')).backgroundColor
   })
   ```
   Expected: `preloaderExists` is `true`, `markSrc` is `"assets/images/icons/favicon.png"`, `computedAnimationName` is `"preloader-spin"` (confirms the spin is active), `computedZIndex` is `"9999"`, `computedBg` is the off-white color (rendered as an `rgb(...)` value — confirm it's not transparent/`rgba(0, 0, 0, 0)`).
3. Take a screenshot — confirm the favicon mark is visible, centered, over a light background, covering the whole viewport (the navbar/hero underneath should not be visible through it).
4. Note: the overlay will stay visible indefinitely at this point since nothing hides it yet — that's expected. Don't try to "fix" this in this task.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/css/pages/home.css
git commit -m "feat: add preloader overlay markup and styles to Home page"
```

---

## Task 2: Preloader hide logic

**Files:**
- Create: `assets/js/preloader.js`
- Modify: `index.html` (add the script tag)

**Interfaces:**
- Consumes: `#preloader` (Task 1), `.is-hidden` class (Task 1, defined but unused until now).
- Produces: nothing consumed by any other file. This script is intentionally self-contained and does NOT expose anything via `window.Giantfuse` — see Global Constraints for why (exposing a callable `init()` would invite exactly the race condition this design avoids).

- [ ] **Step 1: Write `assets/js/preloader.js`**

```js
(function () {
  'use strict';

  if (typeof document === 'undefined') return;

  const preloader = document.querySelector('#preloader');
  if (!preloader) return;

  const MIN_VISIBLE_MS = 600;
  const MAX_WAIT_MS = 5000;
  const startTime = performance.now();
  let hidden = false;

  function hide() {
    if (hidden) return;
    hidden = true;
    const elapsed = performance.now() - startTime;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    setTimeout(() => {
      preloader.classList.add('is-hidden');
      const remove = () => {
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
      };
      preloader.addEventListener('transitionend', remove, { once: true });
      setTimeout(remove, 500);
    }, remaining);
  }

  window.addEventListener('load', hide, { once: true });
  setTimeout(hide, MAX_WAIT_MS);
})();
```

- [ ] **Step 2: Add the script tag to `index.html`**

Find:

```html
  <script src="assets/js/main.js"></script>
</body>
```

Replace with:

```html
  <script src="assets/js/main.js"></script>
  <script src="assets/js/preloader.js"></script>
</body>
```

- [ ] **Step 3: Verify syntax**

```bash
node --check assets/js/preloader.js
```

Expected: no output (success).

- [ ] **Step 4: Verify hide behavior in the browser**

Navigate to `index.html` (or reload if already open):

1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. Take a screenshot immediately after navigating — best effort to catch the overlay mid-spin (timing-dependent; if the page loads too fast to catch it, that's fine, proceed to the next check).
3. `javascript_tool`, evaluate this to wait for the overlay to finish hiding, then report its final state:
   ```js
   new Promise((resolve) => {
     const check = () => {
       const el = document.getElementById('preloader');
       if (!el) { resolve('removed'); return; }
       if (el.classList.contains('is-hidden')) { resolve('hidden-class-applied'); return; }
       setTimeout(check, 200);
     };
     setTimeout(check, 1000);
   })
   ```
   Expected: resolves to `"removed"` within a few seconds (confirms the overlay was hidden and then removed from the DOM — if it resolves to `"hidden-class-applied"` instead, wait a bit longer and re-check, since `removeChild` happens shortly after the `is-hidden` class via the transition/timeout).
4. `javascript_tool`, evaluate: `document.getElementById('preloader')` — expected `null` (confirms full removal, not just visual hiding, so it can't block clicks or linger in the accessibility tree).
5. Screenshot again — confirm the Home page (navbar, hero) is now fully visible with nothing overlaying it.

- [ ] **Step 5: Verify `prefers-reduced-motion` is respected**

Using `resize_window` isn't the right tool for this (it controls viewport, not media-feature emulation) — instead, confirm via direct CSS inspection that the reduced-motion rule is present and correctly scoped:

```bash
node -e "const fs = require('fs'); const css = fs.readFileSync('assets/css/pages/home.css', 'utf8'); if (!css.includes('prefers-reduced-motion: reduce')) throw new Error('reduced-motion rule missing'); if (!/prefers-reduced-motion:\s*reduce\)\s*\{\s*\.preloader-mark\s*\{\s*animation:\s*none/.test(css.replace(/\n/g, ' '))) throw new Error('reduced-motion rule does not target .preloader-mark animation'); console.log('OK: reduced-motion rule present and correctly scoped');"
```

Expected: `OK: reduced-motion rule present and correctly scoped`

- [ ] **Step 6: Full regression check on the other 4 pages**

Navigate to `about.html`, `strategies.html`, `leadership.html`, and `contact.html` in turn. On each:
1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. `javascript_tool`, evaluate: `!!document.getElementById('preloader')` — expected `false` on all 4 (confirms this feature is genuinely Home-page-only, not accidentally linked elsewhere).

- [ ] **Step 7: Commit**

```bash
git add assets/js/preloader.js index.html
git commit -m "feat: add preloader hide logic"
```

- [ ] **Step 8: Merge to main and push**

```bash
cd "C:\Users\Neo\OneDrive\Documents\HIMARK SGC\Giantfuse\giantfusecapital-site"
git checkout main
git pull
git merge --no-edit feat/home-preloader
node --check assets/js/preloader.js
git push origin main
git branch -d feat/home-preloader
```

Expected: merge succeeds (resolve any conflict with `origin/main` if it has moved since the branch was created — check what changed before resolving), `node --check` produces no output, push succeeds, branch deleted locally.
