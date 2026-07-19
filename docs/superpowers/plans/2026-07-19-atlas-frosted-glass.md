# Atlas Frosted Glass Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the existing Atlas chat widget with a translucent "frosted glass" look — blurred panel, gradient message bubbles, a pulsing status dot, and a "breathing" launcher glow — with zero behavior changes.

**Architecture:** Pure visual restyle touching exactly two files: one small markup addition (`components/atlas-widget.html`, a decorative status dot) and a full CSS rewrite (`assets/css/atlas-widget.css`). `assets/js/atlas-widget.js` is not touched.

**Tech Stack:** Plain HTML/CSS. `backdrop-filter` (with `@supports` fallback), CSS gradients, CSS animations gated by `prefers-reduced-motion`.

**Branch:** `feat/atlas-frosted-glass`, created from `main`.

## Global Constraints

- No build tool, bundler, framework, or npm dependency.
- No JavaScript changes of any kind.
- Only derived (rgba/gradient) versions of existing tokens are used — `--color-teal` (`#00A3AD`), `--color-navy` (`#0D1B2A`), `--color-white`. `#007A82` (a manually-darkened teal used only inside gradients) is a literal, not a new custom property.
- The launcher (`.atlas-launcher`) must remain solid/opaque, never glass.
- `backdrop-filter` must have a working `@supports not (...)` fallback to a solid, readable panel.
- All new animations (`atlas-dot-pulse`, `atlas-launcher-breathe`) must be disabled under `prefers-reduced-motion: reduce`.
- No layout/sizing/positioning changes — panel dimensions, mobile breakpoint, z-index (`150`), and existing DOM structure are unchanged except for the one new status-dot span.

---

### Task 1: Frosted glass restyle (markup + CSS)

**Files:**
- Modify: `components/atlas-widget.html`
- Modify: `assets/css/atlas-widget.css`

**Interfaces:**
- Produces: `.atlas-panel-header-title` (new wrapper div), `.atlas-status-dot` (new decorative span) — purely presentational, no JS depends on these selectors.

- [ ] **Step 1: Add the status-dot markup**

In `components/atlas-widget.html`, find:

```html
    <div class="atlas-panel-header">
      <div>
        <strong>Atlas</strong>
        <span>Investor Assistant</span>
      </div>
      <div class="atlas-panel-header-actions">
```

Replace it with:

```html
    <div class="atlas-panel-header">
      <div class="atlas-panel-header-title">
        <span class="atlas-status-dot" aria-hidden="true"></span>
        <div>
          <strong>Atlas</strong>
          <span>Investor Assistant</span>
        </div>
      </div>
      <div class="atlas-panel-header-actions">
```

(Everything after `.atlas-panel-header-actions` — the voice toggle and close buttons — is unchanged.)

- [ ] **Step 2: Replace the full CSS file**

Replace the entire contents of `assets/css/atlas-widget.css` with:

```css
.atlas-widget { position: fixed; z-index: 150; bottom: 24px; right: 24px; }

.atlas-launcher {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-teal), #007A82);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 5px rgba(0, 163, 173, 0.12), 0 8px 20px rgba(0, 163, 173, 0.35);
  animation: atlas-launcher-breathe 2.6s ease-in-out infinite;
}
.atlas-launcher svg { width: 26px; height: 26px; }
@keyframes atlas-launcher-breathe {
  0%, 100% { box-shadow: 0 0 0 5px rgba(0, 163, 173, 0.12), 0 8px 20px rgba(0, 163, 173, 0.35); }
  50% { box-shadow: 0 0 0 8px rgba(0, 163, 173, 0.06), 0 8px 26px rgba(0, 163, 173, 0.5); }
}

.atlas-panel {
  position: fixed;
  bottom: 92px;
  right: 24px;
  width: 360px;
  height: 480px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 32px rgba(13, 27, 42, 0.14), 0 0 0 1px rgba(0, 163, 173, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  transform: translateY(12px);
  transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s ease;
}
@supports not (backdrop-filter: blur(1px)) {
  .atlas-panel { background: rgba(255, 255, 255, 0.96); }
}
.atlas-panel.is-open { opacity: 1; visibility: visible; transform: translateY(0); }

@media (max-width: 640px) {
  .atlas-panel { inset: var(--space-16); bottom: var(--space-16); width: auto; height: auto; }
}

.atlas-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-16);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}
.atlas-panel-header-title { display: flex; align-items: center; gap: var(--space-8); }
.atlas-status-dot {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  background: var(--color-teal);
  flex-shrink: 0;
  animation: atlas-dot-pulse 2.2s infinite;
}
@keyframes atlas-dot-pulse {
  0% { box-shadow: 0 0 0 0 rgba(0, 163, 173, 0.5); }
  70% { box-shadow: 0 0 0 8px rgba(0, 163, 173, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 163, 173, 0); }
}
.atlas-panel-header strong { display: block; color: var(--color-navy); }
.atlas-panel-header span { font-size: 0.8rem; color: var(--color-slate); }
.atlas-panel-header-actions { display: flex; align-items: center; gap: var(--space-8); }
.atlas-close {
  color: var(--color-slate);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.6);
}
.atlas-close svg { width: 18px; height: 18px; }
.atlas-voice-toggle {
  color: var(--color-slate);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.6);
}
.atlas-voice-toggle svg { width: 18px; height: 18px; }
.atlas-voice-toggle[hidden] { display: none; }
.atlas-voice-toggle svg[hidden] { display: none; }

.atlas-messages { flex: 1; overflow-y: auto; padding: var(--space-16); display: flex; flex-direction: column; gap: var(--space-12); }

.atlas-message { max-width: 85%; padding: var(--space-8) var(--space-12); font-size: 0.9rem; line-height: 1.5; }
.atlas-message a { color: inherit; text-decoration: underline; font-weight: 600; }
.atlas-message-bot {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: var(--color-navy);
  border-radius: var(--radius-md) var(--radius-md) var(--radius-md) 0;
  box-shadow: 0 3px 10px rgba(13, 27, 42, 0.05);
}
.atlas-message-user {
  align-self: flex-end;
  background: linear-gradient(135deg, var(--color-teal), #007A82);
  color: var(--color-white);
  border-radius: var(--radius-md) var(--radius-md) 0 var(--radius-md);
  box-shadow: 0 4px 14px rgba(0, 163, 173, 0.25);
}

.atlas-typing {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-md) var(--radius-md) var(--radius-md) 0;
  padding: var(--space-8) var(--space-12);
  display: flex;
  gap: 4px;
}
.atlas-typing span { width: 6px; height: 6px; border-radius: var(--radius-full); background: var(--color-teal); opacity: 0.5; animation: atlas-typing-bounce 1s infinite; }
.atlas-typing span:nth-child(2) { animation-delay: 0.15s; }
.atlas-typing span:nth-child(3) { animation-delay: 0.3s; }
@keyframes atlas-typing-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-4px); opacity: 1; } }

.atlas-input-row { display: flex; gap: var(--space-8); padding: var(--space-16); border-top: 1px solid rgba(255, 255, 255, 0.5); flex-shrink: 0; }
.atlas-input-row input {
  flex: 1;
  padding: var(--space-8) var(--space-12);
  background: rgba(255, 255, 255, 0.55);
  border: 1.5px solid rgba(0, 163, 173, 0.25);
  border-radius: var(--radius-full);
  font-family: 'Lato', sans-serif;
  font-size: 0.9rem;
  color: var(--color-navy);
}
.atlas-input-row input:focus { outline: none; border-color: var(--color-teal); }
.atlas-send {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-teal), #007A82);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 163, 173, 0.3);
}
.atlas-send svg { width: 16px; height: 16px; }

@media (prefers-reduced-motion: reduce) {
  .atlas-panel { transition: opacity 0.25s ease, visibility 0.25s ease; transform: none; }
  .atlas-typing span { animation: none; }
  .atlas-status-dot { animation: none; }
  .atlas-launcher { animation: none; }
}
```

Note the typing indicator's dots change from `var(--color-slate)` to `var(--color-teal)` (line `.atlas-typing span { ... background: var(--color-teal); ... }`) — this is intentional, matching the approved mockup, not a leftover from a copy-paste.

- [ ] **Step 3: Verify against the approved mockup**

Start the dev server (`preview_start` name `giantfuse`), navigate to `index.html`, open the Atlas panel. Confirm, comparing against the approved mockup (`.superpowers/brainstorm/666-1784474490/content/glass-detail.html` if still present, otherwise the description below):
- Panel is visibly translucent/blurred, showing a soft hint of the page behind it.
- A small pulsing teal dot sits to the left of "Atlas" in the header.
- The voice-toggle and close buttons show a translucent circular chip background, not bare icons.
- Bot messages are a soft translucent white bubble; user messages are a teal gradient bubble.
- Sending a message shows the typing indicator with teal (not gray) bouncing dots, then the reply.
- The input field is pill-shaped and translucent; the send button is a teal gradient circle.
- The launcher stays a solid teal gradient circle (not glass) with a slow, subtle breathing glow — confirm it does NOT look transparent/glassy.
- Inspect (don't need to fully disable the feature) that `assets/css/atlas-widget.css` contains an `@supports not (backdrop-filter: blur(1px))` block with a solid fallback background, and a `@media (prefers-reduced-motion: reduce)` block that sets `animation: none` on `.atlas-status-dot` and `.atlas-launcher` in addition to the pre-existing `.atlas-panel` and `.atlas-typing span` overrides.
- No console errors.

- [ ] **Step 4: Commit**

```bash
git add components/atlas-widget.html assets/css/atlas-widget.css
git commit -m "feat: restyle Atlas widget with frosted-glass look"
```

---

### Task 2: Cross-page regression and merge

**Files:** none (verification only, plus whatever Step 2 below needs if problems are found).

- [ ] **Step 1: Cross-page glass-readability check**

The panel's background is genuinely translucent, so its appearance depends on what's behind it on each page — this must be checked deliberately, not assumed. For each of `index.html`, `about.html`, `strategies.html`, `leadership.html`, `contact.html`, at desktop width (1280×900):
- Open the Atlas panel while scrolled to a **light** section of the page and confirm the glass panel reads clearly — navy/white text stays legible, the effect looks intentional (premium), not muddy.
- Scroll so a **darker** section (a hero-banner photo, or the dark navy footer) is behind the panel and re-check the same panel — confirm text inside the panel is still fully legible and the glass effect still reads as premium rather than illegible or low-contrast. If any darker-background case is genuinely illegible, that's a real problem — flag it as a finding rather than adjusting the panel's own opacity without checking with the user first, since the spec deliberately chose to let the glass "pick up" ambient page color rather than normalizing it away.

Also, at mobile width (375×812) on `index.html`: open the panel and confirm the near-full-screen glass panel still looks correct (blur still applies, no layout breakage from the restyle).

- [ ] **Step 2: Existing-behavior regression (confirm zero JS/behavior change)**

On `index.html`: open the panel, toggle voice on and off (confirm icon swap + aria state still work exactly as before — this task did not touch the JS, so this should be unaffected, but confirm it), send a message and confirm the typing indicator appears then the reply renders with a working link, close via the X button, reopen via the launcher, close via Escape.

On `contact.html`: confirm the Atlas widget and the existing enquiry wizard still coexist without interference (open the widget, confirm the wizard's own elements are unaffected).

Confirm zero console errors across all of the above.

- [ ] **Step 3: Fix any problems found**

Only if Step 1 or Step 2 surfaces an issue. Commit any fix with a message describing the problem and the fix.

- [ ] **Step 4: Merge to main**

```bash
git checkout main
git pull
git merge feat/atlas-frosted-glass
git push origin main
git branch -d feat/atlas-frosted-glass
```
