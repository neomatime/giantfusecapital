# Atlas Voice (Text-to-Speech) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mute/unmute voice toggle to the existing Atlas chat widget so Atlas can read its replies aloud using the browser's built-in text-to-speech, entirely on-device with no network call.

**Architecture:** No new files. A toggle button is added to `.atlas-panel-header` in the existing `components/atlas-widget.html` partial and styled in the existing `assets/css/atlas-widget.css`. All behavior — feature detection, the on/off toggle, stripping HTML out of reply text before speaking, and cancelling speech on close/interruption — is added to the existing `assets/js/atlas-widget.js`, using the native `window.speechSynthesis` / `SpeechSynthesisUtterance` Web Speech API.

**Tech Stack:** Plain HTML/CSS/JS. Browser-native Web Speech API (`SpeechSynthesis` interface only — not `SpeechRecognition`). No build tool, no npm dependency.

**Branch:** `feat/atlas-voice-tts`, created from `main`.

## Global Constraints

- No build tool, bundler, framework, or npm dependency.
- No network call of any kind — `SpeechSynthesis` runs on-device; do not add `SpeechRecognition` or any other API that could send audio off-device.
- Voice starts **off** by default on every page load; no persistence (no localStorage/cookie).
- Only Atlas's own bot reply text is ever spoken — never the user's typed input.
- Reply HTML must be reduced to plain text before being passed to `SpeechSynthesisUtterance` — never speak raw tag markup (e.g. never say "a href equals...").
- Any in-progress utterance must be cancelled (`speechSynthesis.cancel()`) before a new one starts, and immediately when the panel closes.
- The voice toggle button must not be interactive/visible when `window.speechSynthesis` is unavailable (feature-detected once in `init()`).
- Reuses existing design tokens only: `--color-slate`, `--space-8`. Toggle button matches `.atlas-close`'s existing 28px-square sizing exactly.
- No voice/rate/pitch picker UI — use `new SpeechSynthesisUtterance(text)` with all defaults.

---

### Task 1: Voice toggle markup and styling

**Files:**
- Modify: `components/atlas-widget.html`
- Modify: `assets/css/atlas-widget.css`

**Interfaces:**
- Produces: `#atlas-voice-toggle` (button, starts visible, not yet interactive), `.atlas-icon-muted` / `.atlas-icon-unmuted` (the two SVGs inside it — muted visible, unmuted `hidden` by default), `.atlas-panel-header-actions` (new wrapper div around the voice toggle + existing close button). Task 2's JS will query these exact selectors.

- [ ] **Step 1: Replace the panel header markup**

In `components/atlas-widget.html`, find:

```html
    <div class="atlas-panel-header">
      <div>
        <strong>Atlas</strong>
        <span>Investor Assistant</span>
      </div>
      <button type="button" class="atlas-close" id="atlas-close-btn" aria-label="Close chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
      </button>
    </div>
```

Replace it with:

```html
    <div class="atlas-panel-header">
      <div>
        <strong>Atlas</strong>
        <span>Investor Assistant</span>
      </div>
      <div class="atlas-panel-header-actions">
        <button type="button" class="atlas-voice-toggle" id="atlas-voice-toggle" aria-pressed="false" aria-label="Turn Atlas voice on">
          <svg class="atlas-icon-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9 L4 15 L8 15 L13 19 L13 5 L8 9 Z"/><line x1="16" y1="9" x2="21" y2="14"/><line x1="21" y1="9" x2="16" y2="14"/></svg>
          <svg class="atlas-icon-unmuted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" hidden><path d="M4 9 L4 15 L8 15 L13 19 L13 5 L8 9 Z"/><path d="M16 8 a5 5 0 0 1 0 8"/><path d="M18.5 5.5 a9 9 0 0 1 0 13"/></svg>
        </button>
        <button type="button" class="atlas-close" id="atlas-close-btn" aria-label="Close chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
        </button>
      </div>
    </div>
```

- [ ] **Step 2: Add CSS for the new header layout and toggle button**

In `assets/css/atlas-widget.css`, find this line:

```css
.atlas-panel-header strong { display: block; color: var(--color-navy); }
.atlas-panel-header span { font-size: 0.8rem; color: var(--color-slate); }
.atlas-close { color: var(--color-slate); width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
.atlas-close svg { width: 18px; height: 18px; }
```

Replace it with:

```css
.atlas-panel-header strong { display: block; color: var(--color-navy); }
.atlas-panel-header span { font-size: 0.8rem; color: var(--color-slate); }
.atlas-panel-header-actions { display: flex; align-items: center; gap: var(--space-8); }
.atlas-close { color: var(--color-slate); width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
.atlas-close svg { width: 18px; height: 18px; }
.atlas-voice-toggle { color: var(--color-slate); width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
.atlas-voice-toggle svg { width: 18px; height: 18px; }
.atlas-voice-toggle[hidden] { display: none; }
```

The explicit `.atlas-voice-toggle[hidden] { display: none; }` rule is required, not redundant: the browser's default UA stylesheet rule for `[hidden]` is easily beaten by the `display: flex` author rule above it once Task 2's JS sets the `hidden` attribute via `voiceToggle.hidden = true`, so an explicit same-specificity-or-higher override is needed to make hiding actually take effect. This is the same class of specificity bug already fixed once on this site's navbar CTA — don't reintroduce it here.

- [ ] **Step 3: Visually verify in the browser**

Start the dev server (`preview_start` name `giantfuse`), navigate to `index.html`, open the Atlas panel (click `#atlas-launcher`). Confirm:
- A new icon button appears between the "Atlas / Investor Assistant" title and the X close button.
- It shows a speaker-with-slash (muted) icon.
- Clicking it does nothing yet (no JS wired — expected at this point).
- Take a screenshot and visually confirm the header layout looks balanced (title left, both icon buttons together on the right, same size as the close button).

- [ ] **Step 4: Commit**

```bash
git add components/atlas-widget.html assets/css/atlas-widget.css
git commit -m "feat: add Atlas voice toggle markup and styling"
```

---

### Task 2: Wire voice behavior into atlas-widget.js

**Files:**
- Modify: `assets/js/atlas-widget.js`

**Interfaces:**
- Consumes: `#atlas-voice-toggle`, `.atlas-icon-muted`, `.atlas-icon-unmuted` (from Task 1's markup, all inside `#atlas-panel`).
- Produces: two new internal (non-exported) functions inside `init()`'s closure: `stripHtml(html): string` and `speak(html): void`. Neither is added to the `api` object returned via `window.Giantfuse.AtlasWidget` — nothing outside this file needs them, matching the existing pattern where `addMessage`/`showTyping`/`setOpen` are also internal-only.

- [ ] **Step 1: Add the `stripHtml` helper and query the new elements**

In `assets/js/atlas-widget.js`, inside `init()`, find:

```javascript
    const launcher = document.querySelector('#atlas-launcher');
    const panel = document.querySelector('#atlas-panel');
    const closeBtn = document.querySelector('#atlas-close-btn');
    const messages = document.querySelector('#atlas-messages');
    const form = document.querySelector('#atlas-input-form');
    const input = document.querySelector('#atlas-input');
    if (!launcher || !panel || !messages || !form || !input) return;

    let greeted = false;
```

Replace it with:

```javascript
    const launcher = document.querySelector('#atlas-launcher');
    const panel = document.querySelector('#atlas-panel');
    const closeBtn = document.querySelector('#atlas-close-btn');
    const messages = document.querySelector('#atlas-messages');
    const form = document.querySelector('#atlas-input-form');
    const input = document.querySelector('#atlas-input');
    const voiceToggle = document.querySelector('#atlas-voice-toggle');
    if (!launcher || !panel || !messages || !form || !input) return;

    let greeted = false;
    let voiceOn = false;
    const voiceSupported = typeof window !== 'undefined' && !!window.speechSynthesis;

    function stripHtml(html) {
      const el = document.createElement('div');
      el.innerHTML = html;
      return el.textContent;
    }

    function speak(html) {
      if (!voiceSupported || !voiceOn) return;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(stripHtml(html)));
    }
```

- [ ] **Step 2: Speak bot messages from `addMessage`**

Find:

```javascript
    function addMessage(text, sender) {
      const el = document.createElement('div');
      el.className = 'atlas-message atlas-message-' + sender;
      if (sender === 'bot') {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
    }
```

Replace it with:

```javascript
    function addMessage(text, sender) {
      const el = document.createElement('div');
      el.className = 'atlas-message atlas-message-' + sender;
      if (sender === 'bot') {
        el.innerHTML = text;
        speak(text);
      } else {
        el.textContent = text;
      }
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
    }
```

This covers both the greeting (`addMessage(GREETING, 'bot')`, called from `setOpen`) and every `matchReply()` result (`addMessage(matchReply(value), 'bot')`, called from the form submit handler) — neither call site needs to change, since both already route through `addMessage`.

- [ ] **Step 3: Stop speech when the panel closes**

Find:

```javascript
    function setOpen(isOpen) {
      panel.classList.toggle('is-open', isOpen);
      panel.setAttribute('aria-hidden', String(!isOpen));
      launcher.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        input.focus();
        if (!greeted) {
          greeted = true;
          addMessage(GREETING, 'bot');
        }
      }
    }
```

Replace it with:

```javascript
    function setOpen(isOpen) {
      panel.classList.toggle('is-open', isOpen);
      panel.setAttribute('aria-hidden', String(!isOpen));
      launcher.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        input.focus();
        if (!greeted) {
          greeted = true;
          addMessage(GREETING, 'bot');
        }
      } else if (voiceSupported) {
        window.speechSynthesis.cancel();
      }
    }
```

- [ ] **Step 4: Wire the toggle button's click handler and feature-detection fallback**

Find:

```javascript
    launcher.addEventListener('click', () => {
      setOpen(!panel.classList.contains('is-open'));
    });
    if (closeBtn) {
      closeBtn.addEventListener('click', () => setOpen(false));
    }
```

Replace it with:

```javascript
    launcher.addEventListener('click', () => {
      setOpen(!panel.classList.contains('is-open'));
    });
    if (closeBtn) {
      closeBtn.addEventListener('click', () => setOpen(false));
    }
    if (voiceToggle) {
      if (!voiceSupported) {
        voiceToggle.hidden = true;
      } else {
        const iconMuted = voiceToggle.querySelector('.atlas-icon-muted');
        const iconUnmuted = voiceToggle.querySelector('.atlas-icon-unmuted');
        voiceToggle.addEventListener('click', () => {
          voiceOn = !voiceOn;
          voiceToggle.setAttribute('aria-pressed', String(voiceOn));
          voiceToggle.setAttribute('aria-label', voiceOn ? 'Turn Atlas voice off' : 'Turn Atlas voice on');
          if (iconMuted) iconMuted.hidden = voiceOn;
          if (iconUnmuted) iconUnmuted.hidden = !voiceOn;
          if (!voiceOn) {
            window.speechSynthesis.cancel();
          }
        });
      }
    }
```

- [ ] **Step 5: Syntax check**

Run: `node --check assets/js/atlas-widget.js`
Expected: no output (valid syntax).

- [ ] **Step 6: Browser-verify the full behavior**

Using the Claude Browser MCP tools against the running `giantfuse` dev server, on `index.html`:

1. Open the Atlas panel. Confirm `#atlas-voice-toggle` is visible (this browser supports `speechSynthesis`) showing the muted icon, `aria-pressed="false"`.
2. Click the toggle. Confirm the icon swaps to unmuted, `aria-pressed` becomes `"true"`, `aria-label` becomes `"Turn Atlas voice off"`.
3. Send a message that matches the leadership category (e.g. "Tell me about your leadership team"). Before the reply renders, patch `window.speechSynthesis.speak` via `javascript_tool` to capture calls (e.g. wrap it to push each utterance's `.text` into a global array) — reinstall the wrapper right after opening the page and before sending the message. After the reply appears, confirm exactly one call was captured and its `.text` value contains no `<`/`>` characters (i.e. the `<a href="leadership.html">Leadership</a>` link was reduced to plain text "Leadership" with no tag syntax spoken).
4. Send a second message immediately after the first (before the 600ms typing delay elapses) and confirm `window.speechSynthesis.cancel` was called before the second `speak()` call — i.e. speech for the first reply never plays to completion once interrupted.
5. With voice on and a reply currently "speaking" (check `window.speechSynthesis.speaking === true` immediately after a reply renders, before the browser's synthesis finishes), close the panel via the close button and confirm `window.speechSynthesis.cancel` was invoked (or `speaking` becomes `false` shortly after).
6. The unsupported-browser fallback (`if (!voiceSupported) { voiceToggle.hidden = true; }`) can't be exercised live — `window.speechSynthesis` can't be undefined-out after the page (and thus `init()`) has already loaded in this tooling environment. Verify this branch by code inspection instead: confirm `voiceSupported` is computed once, before any listener is attached, and that the `hidden = true` assignment is the only thing that runs when it's false (no listener attached, matching the muted-button's inert appearance). Note in the task report that this path is inspection-verified, not live-tested, and why.
7. Confirm the user's own typed messages are still rendered via `.textContent` (re-run the existing XSS check: send a message containing `<b>test</b>` and confirm it renders as literal text, not bold) — this guards against a regression where `speak()`'s changes might have accidentally altered `addMessage`'s user-branch.
8. Confirm no console errors after all of the above.

- [ ] **Step 7: Commit**

```bash
git add assets/js/atlas-widget.js
git commit -m "feat: add Atlas voice toggle behavior (speak replies, stop on close/interrupt)"
```

---

### Task 3: Full regression pass and merge

**Files:** none (verification only, plus whatever Step 2 below needs if problems are found).

- [ ] **Step 1: Regression pass across all 5 pages**

For each of `index.html`, `about.html`, `strategies.html`, `leadership.html`, `contact.html`, at both a desktop width (1280×900) and a mobile width (375×812):
- Open the Atlas panel, confirm the voice toggle renders correctly alongside the close button and the layout doesn't overlap or look cramped at either width.
- Confirm zero console errors.

On `contact.html` specifically: run the existing enquiry wizard end-to-end (Phase 1 → 2 → 3 → submit → confirmation) with the Atlas panel closed, then re-open the Atlas panel afterward and confirm the widget (including the new voice toggle) still works normally — this confirms the new code didn't regress the wizard/widget coexistence already verified in the prior Atlas widget branch.

On `index.html` at mobile width: open both the mobile nav drawer and the Atlas panel simultaneously (as in the prior branch's regression check) and confirm the voice toggle button is still usable/visible within the Atlas panel in that state (or correctly obscured by the drawer per the existing z-index precedent — not a new failure mode).

- [ ] **Step 2: Fix any problems found**

Only if Step 1 surfaces an issue. Commit any fix with a message describing the regression and the fix.

- [ ] **Step 3: Merge to main**

```bash
git checkout main
git pull
git merge feat/atlas-voice-tts
node --check assets/js/atlas-widget.js
git push origin main
git branch -d feat/atlas-voice-tts
```
