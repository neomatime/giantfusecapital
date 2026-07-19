# Atlas Microphone Input Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a microphone button to the Atlas chat widget so visitors can dictate their message using the browser's native speech recognition, with the recognized text filling the input box for review before sending.

**Architecture:** Extends the existing three widget files. `components/atlas-widget.html` gets a mic button and an input-wrap container. `assets/css/atlas-widget.css` gets idle/listening visual states for the mic button plus a listening overlay. `assets/js/atlas-widget.js` gets `SpeechRecognition`/`webkitSpeechRecognition` wiring, feature-detected the same way the existing voice-output toggle detects `speechSynthesis`.

**Tech Stack:** Plain HTML/CSS/JS. Browser-native `SpeechRecognition` (`window.SpeechRecognition || window.webkitSpeechRecognition`) — not a service you set up, but a real browser API with real network behavior on most browsers (see Global Constraints).

**Branch:** `feat/atlas-mic-input`, created from `main`.

## Global Constraints

- No build tool, bundler, framework, or npm dependency.
- **This feature is a disclosed, approved exception to the widget's "no network calls" rule.** While actively listening, the browser sends the recording to its own speech service to transcribe it. This must never be silent — see the disclosure requirement below.
- Recognized speech always fills `#atlas-input`'s value; it is never auto-submitted.
- The mic button (`#atlas-mic-btn`) must not render as interactive/visible when neither `window.SpeechRecognition` nor `window.webkitSpeechRecognition` exists.
- The first time listening starts on a given page load, a one-time system note must appear in the chat transcript disclosing the network behavior. It must not repeat on subsequent listen sessions during the same page load.
- A `not-allowed` recognition error must produce a second, distinct system note explaining that mic access was blocked. Any other error resets to idle silently.
- All new animations (mic pulse, waveform bars) must be disabled under `prefers-reduced-motion: reduce`.
- Reuses existing tokens only: `--color-teal`, `--color-slate`, `--color-white`, `--radius-full`, `--space-*`. The mic button matches `.atlas-send`'s existing 36px sizing.
- No existing behavior (typing, send, voice-output toggle, open/close, reply matching) may change.

---

### Task 1: Mic button markup and styling

**Files:**
- Modify: `components/atlas-widget.html`
- Modify: `assets/css/atlas-widget.css`

**Interfaces:**
- Produces: `#atlas-mic-btn` (button, starts visible, not yet interactive), `#atlas-input-wrap` (new wrapper div around the existing `#atlas-input`), `.atlas-mic-wave` (the listening overlay span inside the wrap, hidden by default via CSS not markup), `.atlas-message-system` (a new message-bubble variant class, styling only — no markup instance yet, Task 2's JS will create these dynamically via the existing `addMessage()` function). Task 2's JS will query `#atlas-mic-btn` and `#atlas-input-wrap` by these exact IDs.

- [ ] **Step 1: Replace the input-row markup**

In `components/atlas-widget.html`, find:

```html
    <form class="atlas-input-row" id="atlas-input-form">
      <input type="text" id="atlas-input" placeholder="Type a message..." autocomplete="off" aria-label="Message">
      <button type="submit" class="atlas-send" aria-label="Send message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12 L20 4 L14 20 L11 13 L4 12 Z"/></svg>
      </button>
    </form>
```

Replace it with:

```html
    <form class="atlas-input-row" id="atlas-input-form">
      <button type="button" class="atlas-mic" id="atlas-mic-btn" aria-pressed="false" aria-label="Speak your message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4M9 21h6"/></svg>
      </button>
      <div class="atlas-input-wrap" id="atlas-input-wrap">
        <input type="text" id="atlas-input" placeholder="Type a message..." autocomplete="off" aria-label="Message">
        <span class="atlas-mic-wave" aria-hidden="true">Listening<span class="atlas-wave-bars"><span></span><span></span><span></span><span></span></span></span>
      </div>
      <button type="submit" class="atlas-send" aria-label="Send message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12 L20 4 L14 20 L11 13 L4 12 Z"/></svg>
      </button>
    </form>
```

- [ ] **Step 2: Update the input-row CSS and add the mic/wave/system-message rules**

In `assets/css/atlas-widget.css`, find:

```css
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
```

Replace it with:

```css
.atlas-input-row { display: flex; align-items: center; gap: var(--space-8); padding: var(--space-16); border-top: 1px solid rgba(255, 255, 255, 0.5); flex-shrink: 0; }

.atlas-input-wrap { position: relative; flex: 1; }
.atlas-input-wrap input {
  width: 100%;
  padding: var(--space-8) var(--space-12);
  background: rgba(255, 255, 255, 0.55);
  border: 1.5px solid rgba(0, 163, 173, 0.25);
  border-radius: var(--radius-full);
  font-family: 'Lato', sans-serif;
  font-size: 0.9rem;
  color: var(--color-navy);
}
.atlas-input-wrap input:focus { outline: none; border-color: var(--color-teal); }

.atlas-mic {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: var(--color-slate);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.atlas-mic svg { width: 16px; height: 16px; }
.atlas-mic[hidden] { display: none; }
.atlas-mic.is-listening {
  background: linear-gradient(135deg, var(--color-teal), #007A82);
  border: none;
  color: var(--color-white);
  box-shadow: 0 0 0 4px rgba(0, 163, 173, 0.15), 0 4px 14px rgba(0, 163, 173, 0.4);
  animation: atlas-mic-pulse 1.4s ease-in-out infinite;
}
@keyframes atlas-mic-pulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(0, 163, 173, 0.15), 0 4px 14px rgba(0, 163, 173, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(0, 163, 173, 0.05), 0 4px 18px rgba(0, 163, 173, 0.55); }
}

.atlas-mic-wave {
  position: absolute;
  inset: 0;
  display: none;
  align-items: center;
  gap: var(--space-4);
  padding: 0 var(--space-12);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.55);
  border: 1.5px solid var(--color-teal);
  color: #00838C;
  font-style: italic;
  font-size: 0.9rem;
  font-family: 'Lato', sans-serif;
  pointer-events: none;
}
.atlas-input-wrap.is-listening .atlas-mic-wave { display: flex; }
.atlas-input-wrap.is-listening input { color: transparent; }
.atlas-wave-bars { display: inline-flex; align-items: center; gap: 2px; margin-left: var(--space-4); }
.atlas-wave-bars span { width: 2.5px; border-radius: 2px; background: var(--color-teal); animation: atlas-wave-bounce 0.9s ease-in-out infinite; }
.atlas-wave-bars span:nth-child(1) { height: 6px; animation-delay: 0s; }
.atlas-wave-bars span:nth-child(2) { height: 12px; animation-delay: 0.15s; }
.atlas-wave-bars span:nth-child(3) { height: 8px; animation-delay: 0.3s; }
.atlas-wave-bars span:nth-child(4) { height: 14px; animation-delay: 0.45s; }
@keyframes atlas-wave-bounce { 0%, 100% { transform: scaleY(0.5); } 50% { transform: scaleY(1); } }

.atlas-message-system { align-self: center; text-align: center; font-size: 0.75rem; color: var(--color-slate); max-width: 90%; }
```

- [ ] **Step 3: Add the new animations to the reduced-motion block**

In the same file, find:

```css
@media (prefers-reduced-motion: reduce) {
  .atlas-panel { transition: opacity 0.25s ease, visibility 0.25s ease; transform: none; }
  .atlas-typing span { animation: none; }
  .atlas-status-dot { animation: none; }
  .atlas-launcher { animation: none; }
}
```

Replace it with:

```css
@media (prefers-reduced-motion: reduce) {
  .atlas-panel { transition: opacity 0.25s ease, visibility 0.25s ease; transform: none; }
  .atlas-typing span { animation: none; }
  .atlas-status-dot { animation: none; }
  .atlas-launcher { animation: none; }
  .atlas-mic.is-listening { animation: none; }
  .atlas-wave-bars span { animation: none; }
}
```

- [ ] **Step 4: Verify visually**

Start the dev server (`preview_start` name `giantfuse`), navigate to `index.html`, open the Atlas panel. Confirm:
- The mic button renders first in the input row (mic → input → send), matching the send button's 36px size, translucent chip styling.
- Clicking it does nothing yet (no JS wired — expected at this point).
- No console errors, no layout shift/overlap in the input row.

- [ ] **Step 5: Commit**

```bash
git add components/atlas-widget.html assets/css/atlas-widget.css
git commit -m "feat: add Atlas mic button markup and styling"
```

---

### Task 2: Wire speech recognition into atlas-widget.js

**Files:**
- Modify: `assets/js/atlas-widget.js`

**Interfaces:**
- Consumes: `#atlas-mic-btn`, `#atlas-input-wrap` (from Task 1's markup).
- Produces: nothing new exported — `recognition`, `micSupported`, `setListening`, `MIC_DISCLOSURE`, `MIC_BLOCKED` are all internal to `init()`'s closure, matching the existing pattern where `stripHtml`/`speak` are also internal-only.
- Note: `addMessage(text, sender)` already supports arbitrary `sender` values without modification — its `className` is built as `'atlas-message atlas-message-' + sender`, and its `if (sender === 'bot') { ...speak... } else { el.textContent = text; }` branch already routes any non-`'bot'` sender (including a new `'system'` sender) through the safe `textContent` path with no speech output. No changes to `addMessage` itself are needed.

- [ ] **Step 1: Add element queries and mic-related state**

In `assets/js/atlas-widget.js`, inside `init()`, find:

```javascript
    const voiceToggle = document.querySelector('#atlas-voice-toggle');
    if (!launcher || !panel || !messages || !form || !input) return;

    let greeted = false;
    let voiceOn = false;
    const voiceSupported = typeof window !== 'undefined' && !!window.speechSynthesis;
```

Replace it with:

```javascript
    const voiceToggle = document.querySelector('#atlas-voice-toggle');
    const micBtn = document.querySelector('#atlas-mic-btn');
    const inputWrap = document.querySelector('#atlas-input-wrap');
    if (!launcher || !panel || !messages || !form || !input) return;

    let greeted = false;
    let voiceOn = false;
    let micDisclosureShown = false;
    let recognition = null;
    const voiceSupported = typeof window !== 'undefined' && !!window.speechSynthesis;
    const SpeechRecognitionCtor = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : undefined;
    const micSupported = !!SpeechRecognitionCtor;

    const MIC_DISCLOSURE = 'Voice input uses your browser\'s built-in speech recognition, which sends your recording to your browser\'s speech service to transcribe it.';
    const MIC_BLOCKED = 'Microphone access was blocked. You can still type your message.';
```

- [ ] **Step 2: Stop any in-progress recognition when the panel closes**

Find:

```javascript
      } else if (voiceSupported) {
        window.speechSynthesis.cancel();
      }
    }
```

Replace it with:

```javascript
      } else {
        if (voiceSupported) {
          window.speechSynthesis.cancel();
        }
        if (recognition && micBtn && micBtn.classList.contains('is-listening')) {
          recognition.stop();
        }
      }
    }
```

- [ ] **Step 3: Wire the mic button**

Find:

```javascript
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) {
        setOpen(false);
      }
    });
```

Replace it with:

```javascript
    if (micBtn) {
      if (!micSupported || !inputWrap) {
        micBtn.hidden = true;
      } else {
        recognition = new SpeechRecognitionCtor();
        recognition.continuous = false;
        recognition.interimResults = false;

        const setListening = (isListening) => {
          micBtn.classList.toggle('is-listening', isListening);
          micBtn.setAttribute('aria-pressed', String(isListening));
          inputWrap.classList.toggle('is-listening', isListening);
        };

        recognition.addEventListener('result', (event) => {
          input.value = event.results[0][0].transcript;
        });
        recognition.addEventListener('end', () => setListening(false));
        recognition.addEventListener('error', (event) => {
          setListening(false);
          if (event.error === 'not-allowed') {
            addMessage(MIC_BLOCKED, 'system');
          }
        });

        micBtn.addEventListener('click', () => {
          if (micBtn.classList.contains('is-listening')) {
            recognition.stop();
            return;
          }
          if (!micDisclosureShown) {
            micDisclosureShown = true;
            addMessage(MIC_DISCLOSURE, 'system');
          }
          setListening(true);
          recognition.start();
        });
      }
    }
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) {
        setOpen(false);
      }
    });
```

- [ ] **Step 4: Syntax check**

Run: `node --check assets/js/atlas-widget.js`
Expected: no output (valid syntax).

- [ ] **Step 5: Browser-verify**

Using the Claude Browser MCP tools against the running `giantfuse` dev server, on `index.html`:

1. Open the Atlas panel. Confirm `#atlas-mic-btn` is visible (this browser implements `webkitSpeechRecognition`), idle styling, `aria-pressed="false"`.
2. Click the mic button. Immediately (synchronously, before any real recognition event can fire) confirm: `#atlas-mic-btn` has class `is-listening` and `aria-pressed="true"`; `#atlas-input-wrap` has class `is-listening`; the waveform overlay is visible via computed style (`display: flex`). This part of the behavior does not depend on whether the browser's real microphone/permission flow succeeds — it's driven entirely by this codebase's own click handler running before `recognition.start()` is even called.
3. Confirm exactly one `.atlas-message-system` element now exists in `#atlas-messages`, with text matching `MIC_DISCLOSURE`.
4. This real browser will very likely auto-resolve the recognition attempt quickly (no real microphone permission can be granted in this tooling environment) — wait ~1 second, then re-check `#atlas-mic-btn`'s classes. If it has returned to idle (no `is-listening`), that confirms the `end`/`error` listener correctly reset the UI state on its own, without needing to click the button again. If an `error` event fired with `error: 'not-allowed'` specifically, confirm a second `.atlas-message-system` element now exists with text matching `MIC_BLOCKED`; if some other error/no-error path occurred instead, that's fine too — just record in the report exactly what was observed, since real recognition behavior in an automated browser context isn't fully deterministic and the important thing is that the UI settled back to a sane idle state either way.
5. Click the mic button a second time (now that it should be idle again per Step 4). Confirm the disclosure system-note count in `#atlas-messages` is still exactly 1 — it must not repeat on a second listen-start within the same page load.
6. Confirm sending a normal typed message still works exactly as before (type text, submit, confirm bot reply renders) — regression check that Task 2's changes didn't disturb the existing form-submit flow.
7. Confirm the existing user-input XSS guard is unaffected: send `<b>test</b>` as a typed message, confirm it renders as literal text via `.textContent`, not as bold.
8. Close the panel via the close button while confirming no errors are thrown even if a recognition session was mid-flight.
9. Confirm no console errors after all of the above.
10. The `!micSupported` fallback branch (`micBtn.hidden = true`) cannot be exercised live in this environment for the same reason the equivalent `speechSynthesis` fallback couldn't in the prior voice-output feature — `window.SpeechRecognition`/`window.webkitSpeechRecognition` can't be undefined-out after `init()` has already run. Verify this branch by code inspection instead: confirm `micSupported` is computed once before any listener attachment, and that the `hidden = true` assignment is the only statement in that branch.

- [ ] **Step 6: Commit**

```bash
git add assets/js/atlas-widget.js
git commit -m "feat: wire Atlas mic button to browser speech recognition"
```

---

### Task 3: Full regression pass and merge

**Files:** none (verification only, plus whatever Step 2 below needs if problems are found).

- [ ] **Step 1: Regression pass across all 5 pages**

For each of `index.html`, `about.html`, `strategies.html`, `leadership.html`, `contact.html`, at both a desktop width (1280×900) and a mobile width (375×812):
- Open the Atlas panel, confirm the mic button renders correctly alongside the input and send button, no overlap or cramped layout at either width.
- Confirm zero console errors.

On `contact.html`: confirm the existing enquiry wizard is unaffected by this branch (this branch touches nothing related to the wizard, so a brief sanity check — open the wizard, confirm it renders — is sufficient, not a full end-to-end run).

- [ ] **Step 2: Fix any problems found**

Only if Step 1 surfaces an issue. Commit any fix with a message describing the problem and the fix.

- [ ] **Step 3: Merge to main**

```bash
git checkout main
git pull
git merge feat/atlas-mic-input
node --check assets/js/atlas-widget.js
git push origin main
git branch -d feat/atlas-mic-input
```
