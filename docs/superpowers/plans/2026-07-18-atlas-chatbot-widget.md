# Atlas Chatbot Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent floating "Atlas" chat widget to all 5 pages of the Giantfuse Capital Partners site, front-end only, with a keyword-matching reply engine.

**Architecture:** A new shared partial (`components/atlas-widget.html`, fetched via the existing `data-include` mechanism), a new dedicated stylesheet (`assets/css/atlas-widget.css`), and a new dedicated script (`assets/js/atlas-widget.js`) that starts with a pure, unit-tested `matchReply()` function and grows to include the full open/close/message-rendering behavior, called from `main.js`'s `init()` the same way `ContactForm.init()` is.

**Tech Stack:** Plain HTML/CSS/JS. No build tool, no new dependencies. No test framework — `node --check`/`node -e` for JS syntax and pure-logic checks, live browser checks for everything DOM-related.

## Global Constraints

- No build tool, bundler, framework, or npm dependency may be introduced.
- No backend, no AI API, no network calls of any kind for this feature.
- The user's own typed message must be rendered via `.textContent` — never raw `innerHTML` interpolation of user input. Bot messages (the greeting and `matchReply()`'s output) MAY use `innerHTML` since they are always one of a small fixed set of developer-authored strings, never user-influenced — this mirrors the reasoning already established on the Contact page's `escapeHtml()` fix, applied in the opposite direction (here, `innerHTML` for a fixed string is safe; interpolating *user* text into `innerHTML` is what would be unsafe).
- z-index `150` for the widget (launcher + panel) — stays below the mobile nav drawer's `200`–`202` range established in a previous feature.
- Reuses existing tokens throughout: `--color-teal`, `--color-navy`, `--color-white`, `--color-light-gray`, `--color-slate`, `--radius-md`, `--radius-full`, `--radius-sm`, `--space-*` scale, the box-shadow value `0 4px 16px rgba(13, 27, 42, 0.1)` already used on `.office-card`.
- All 5 existing pages (`index.html`, `about.html`, `strategies.html`, `leadership.html`, `contact.html`) must end up with identical additions (one `<link>`, one `<div data-include="atlas-widget">`, one `<script>` tag) — no page-specific variation.
- Spec reference: `docs/superpowers/specs/2026-07-18-atlas-chatbot-widget-design.md`.

---

## Task 1: New icons for the shared ICONS map

**Files:**
- Modify: `assets/js/main.js` (the `ICONS` map, immediately after the existing `lock` entry)

**Interfaces:**
- Produces: `ICONS.chatBubble`, `ICONS.send`, `ICONS.close` — each an inline SVG string, same style as the existing entries (`viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`). Consumed as static HTML copies (not JS-bound) by Task 3.

- [ ] **Step 1: Add the 3 new icons**

In `assets/js/main.js`, find the last entry in the `ICONS` object (currently `lock`, with no trailing comma):

```js
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11 V7.5 C8 5 9.8 3.5 12 3.5 C14.2 3.5 16 5 16 7.5 V11"/></svg>'
  };
```

Replace with:

```js
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11 V7.5 C8 5 9.8 3.5 12 3.5 C14.2 3.5 16 5 16 7.5 V11"/></svg>',
    chatBubble: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="3"/><path d="M8 17 L8 20.5 L12 17"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12 L20 4 L14 20 L11 13 L4 12 Z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>'
  };
```

- [ ] **Step 2: Verify syntax**

```bash
node --check assets/js/main.js
```

Expected: no output (success).

- [ ] **Step 3: Verify the 3 icons are present and well-formed**

```bash
node -e "const { ICONS } = require('./assets/js/main.js'); ['chatBubble','send','close'].forEach((k) => { if (!ICONS[k] || !ICONS[k].includes('<svg')) throw new Error('missing or malformed icon: ' + k); }); console.log('OK: 3 new icons present');"
```

Expected: `OK: 3 new icons present`

- [ ] **Step 4: Create the git branch and commit**

```bash
cd "C:\Users\Neo\OneDrive\Documents\HIMARK SGC\Giantfuse\giantfusecapital-site"
git checkout -b feat/atlas-chatbot-widget
git add assets/js/main.js
git commit -m "feat: add chatBubble/send/close icons to shared ICONS map"
```

---

## Task 2: Pure reply-matching logic (TDD)

**Files:**
- Create: `assets/js/atlas-widget.js`

**Interfaces:**
- Produces: `window.Giantfuse.AtlasWidget.matchReply(message: string): string`. Task 4 extends this same file (same IIFE) with DOM-wiring functions and an `init()` — it does not create a second file or a second IIFE.

- [ ] **Step 1: Write the failing test**

```bash
node -e "
const { matchReply } = require('./assets/js/atlas-widget.js');
const assert = require('assert');
assert.ok(matchReply('Tell me about your investment strategies').includes('strategies.html'), 'strategy category');
assert.ok(matchReply('How can I contact you?').includes('contact.html'), 'contact category');
assert.ok(matchReply('Who is on your leadership team?').includes('leadership.html'), 'leadership category');
assert.ok(matchReply('What is your company about?').includes('about.html'), 'about category');
assert.ok(matchReply('asdkjaslkdj random gibberish').includes('contact.html'), 'fallback category');
assert.strictEqual(matchReply(''), matchReply('   '), 'empty and whitespace-only input both hit the same fallback path');
console.log('OK: matchReply covers all 5 categories and the fallback correctly');
"
```

- [ ] **Step 2: Run it to verify it fails**

Run the command from Step 1.
Expected: FAIL — `Error: Cannot find module './assets/js/atlas-widget.js'` (the file doesn't exist yet).

- [ ] **Step 3: Write `assets/js/atlas-widget.js`**

```js
(function () {
  'use strict';

  function matchReply(message) {
    const text = String(message || '').toLowerCase();
    if (/strateg|invest|private equity|hedge fund|real estate|credit/.test(text)) {
      return 'We focus on four core strategies — Private Equity, Hedge Fund Solutions, Real Estate, and Credit &amp; Insurance. You can explore each in detail on our <a href="strategies.html">Investment Approach</a> page.';
    }
    if (/contact|enquir|talk to someone|human|call|email|reach/.test(text)) {
      return 'You can reach our team directly through our <a href="contact.html">Investor Enquiry</a> form, or call us on +27 72 416 6083.';
    }
    if (/leadership|team|who runs|ceo|management/.test(text)) {
      return 'Our leadership team is led by Tebogo Mkhize (CEO) and Michael van der Merwe (CIO), along with heads of Real Assets and Credit &amp; Insurance. You can meet the full team on our <a href="leadership.html">Leadership</a> page.';
    }
    if (/about|company|who are you|history|based/.test(text)) {
      return 'Giantfuse Capital Partners is a South African alternative investment and asset management firm based in Sandton, Johannesburg. Read more on our <a href="about.html">About</a> page.';
    }
    return 'I\'m not able to answer that directly, but our team can help — reach out through our <a href="contact.html">Investor Enquiry</a> form and we\'ll get back to you.';
  }

  const api = { matchReply };

  if (typeof window !== 'undefined') {
    window.Giantfuse = window.Giantfuse || {};
    window.Giantfuse.AtlasWidget = window.Giantfuse.AtlasWidget || {};
    Object.assign(window.Giantfuse.AtlasWidget, api);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
```

- [ ] **Step 4: Run the test again to verify it passes**

Run the command from Step 1.
Expected: `OK: matchReply covers all 5 categories and the fallback correctly`

- [ ] **Step 5: Verify syntax**

```bash
node --check assets/js/atlas-widget.js
```

Expected: no output (success).

- [ ] **Step 6: Commit**

```bash
git add assets/js/atlas-widget.js
git commit -m "feat: add Atlas keyword reply-matching logic"
```

---

## Task 3: Widget markup + CSS, wired into the Home page only

**Files:**
- Create: `components/atlas-widget.html`
- Create: `assets/css/atlas-widget.css`
- Modify: `index.html` (add the CSS `<link>` and the `data-include` div — NOT the `<script>` tag yet, that's Task 4)

**Interfaces:**
- Consumes: `ICONS.chatBubble`, `ICONS.close`, `ICONS.send` (Task 1, copied as static HTML).
- Produces: `#atlas-launcher`, `#atlas-panel`, `#atlas-close-btn`, `#atlas-messages`, `#atlas-input-form`, `#atlas-input` — all the element IDs Task 4's DOM behavior will query. The panel is not yet interactive (no JS behavior exists until Task 4) — clicking the launcher does nothing at this point, which is expected.

- [ ] **Step 1: Write `components/atlas-widget.html`**

```html
<div class="atlas-widget">
  <button class="atlas-launcher" id="atlas-launcher" aria-label="Open chat with Atlas" aria-expanded="false" aria-controls="atlas-panel">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="3"/><path d="M8 17 L8 20.5 L12 17"/></svg>
  </button>
  <div class="atlas-panel" id="atlas-panel" role="dialog" aria-label="Chat with Atlas" aria-hidden="true">
    <div class="atlas-panel-header">
      <div>
        <strong>Atlas</strong>
        <span>Investor Assistant</span>
      </div>
      <button type="button" class="atlas-close" id="atlas-close-btn" aria-label="Close chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
      </button>
    </div>
    <div class="atlas-messages" id="atlas-messages"></div>
    <form class="atlas-input-row" id="atlas-input-form">
      <input type="text" id="atlas-input" placeholder="Type a message..." autocomplete="off" aria-label="Message">
      <button type="submit" class="atlas-send" aria-label="Send message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12 L20 4 L14 20 L11 13 L4 12 Z"/></svg>
      </button>
    </form>
  </div>
</div>
```

- [ ] **Step 2: Write `assets/css/atlas-widget.css`**

```css
.atlas-widget { position: fixed; z-index: 150; bottom: 24px; right: 24px; }

.atlas-launcher {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--color-teal);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(13, 27, 42, 0.1);
}
.atlas-launcher svg { width: 26px; height: 26px; }

.atlas-panel {
  position: fixed;
  bottom: 92px;
  right: 24px;
  width: 360px;
  height: 480px;
  background: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 16px rgba(13, 27, 42, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  transform: translateY(12px);
  transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s ease;
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
  border-bottom: 1px solid var(--color-light-gray);
  flex-shrink: 0;
}
.atlas-panel-header strong { display: block; color: var(--color-navy); }
.atlas-panel-header span { font-size: 0.8rem; color: var(--color-slate); }
.atlas-close { color: var(--color-slate); width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
.atlas-close svg { width: 18px; height: 18px; }

.atlas-messages { flex: 1; overflow-y: auto; padding: var(--space-16); display: flex; flex-direction: column; gap: var(--space-12); }

.atlas-message { max-width: 85%; padding: var(--space-8) var(--space-12); font-size: 0.9rem; line-height: 1.5; }
.atlas-message a { color: inherit; text-decoration: underline; font-weight: 600; }
.atlas-message-bot { align-self: flex-start; background: var(--color-light-gray); color: var(--color-navy); border-radius: var(--radius-md) var(--radius-md) var(--radius-md) 0; }
.atlas-message-user { align-self: flex-end; background: var(--color-teal); color: var(--color-white); border-radius: var(--radius-md) var(--radius-md) 0 var(--radius-md); }

.atlas-typing { align-self: flex-start; background: var(--color-light-gray); border-radius: var(--radius-md) var(--radius-md) var(--radius-md) 0; padding: var(--space-8) var(--space-12); display: flex; gap: 4px; }
.atlas-typing span { width: 6px; height: 6px; border-radius: var(--radius-full); background: var(--color-slate); opacity: 0.5; animation: atlas-typing-bounce 1s infinite; }
.atlas-typing span:nth-child(2) { animation-delay: 0.15s; }
.atlas-typing span:nth-child(3) { animation-delay: 0.3s; }
@keyframes atlas-typing-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-4px); opacity: 1; } }

.atlas-input-row { display: flex; gap: var(--space-8); padding: var(--space-16); border-top: 1px solid var(--color-light-gray); flex-shrink: 0; }
.atlas-input-row input {
  flex: 1;
  padding: var(--space-8) var(--space-12);
  border: 1.5px solid var(--color-light-gray);
  border-radius: var(--radius-sm);
  font-family: 'Lato', sans-serif;
  font-size: 0.9rem;
  color: var(--color-navy);
}
.atlas-input-row input:focus { outline: none; border-color: var(--color-teal); }
.atlas-send {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-teal);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.atlas-send svg { width: 16px; height: 16px; }

@media (prefers-reduced-motion: reduce) {
  .atlas-panel { transition: opacity 0.25s ease, visibility 0.25s ease; transform: none; }
  .atlas-typing span { animation: none; }
}
```

- [ ] **Step 3: Wire the widget into `index.html`**

Find:

```html
  <link rel="stylesheet" href="assets/css/shared-sections.css">
  <link rel="stylesheet" href="assets/css/pages/home.css">
</head>
```

Replace with:

```html
  <link rel="stylesheet" href="assets/css/shared-sections.css">
  <link rel="stylesheet" href="assets/css/atlas-widget.css">
  <link rel="stylesheet" href="assets/css/pages/home.css">
</head>
```

Then find:

```html
  <div data-include="footer"></div>

  <script src="assets/js/counters.js"></script>
```

Replace with:

```html
  <div data-include="footer"></div>
  <div data-include="atlas-widget"></div>

  <script src="assets/js/counters.js"></script>
```

- [ ] **Step 4: Verify in the browser**

Using the Claude Browser MCP tools: `preview_start` with `{name: "giantfuse"}`, navigate to `index.html`, then:

1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. `javascript_tool`, evaluate:
   ```js
   JSON.stringify({
     launcherExists: !!document.getElementById('atlas-launcher'),
     panelExists: !!document.getElementById('atlas-panel'),
     panelIsOpen: document.getElementById('atlas-panel').classList.contains('is-open'),
     launcherZIndex: getComputedStyle(document.querySelector('.atlas-widget')).zIndex
   })
   ```
   Expected: `launcherExists` and `panelExists` both `true`, `panelIsOpen` is `false` (nothing opens it yet — Task 4's job), `launcherZIndex` is `"150"`.
3. Take a screenshot — confirm a teal circular button with a chat-bubble icon appears fixed in the bottom-right corner of the page, floating above the page content.

- [ ] **Step 5: Commit**

```bash
git add components/atlas-widget.html assets/css/atlas-widget.css index.html
git commit -m "feat: add Atlas widget markup and styles, wired into Home page"
```

---

## Task 4: Widget behavior, completed on the Home page

**Files:**
- Modify: `assets/js/atlas-widget.js` (extend the existing IIFE from Task 2 — do not create a second IIFE or duplicate `matchReply`)
- Modify: `assets/js/main.js` (add the `AtlasWidget.init()` call)
- Modify: `index.html` (add the `<script>` tag)

**Interfaces:**
- Consumes: `matchReply` (Task 2, same file); the DOM structure from Task 3 (`#atlas-launcher`, `#atlas-panel`, `#atlas-close-btn`, `#atlas-messages`, `#atlas-input-form`, `#atlas-input`).
- Produces: `window.Giantfuse.AtlasWidget.init(): void` — safe no-op if `#atlas-launcher` doesn't exist on the current page (matches the guard pattern used by `ContactForm.init()`/`renderLeadership()` etc.).

- [ ] **Step 1: Replace the entire contents of `assets/js/atlas-widget.js`**

```js
(function () {
  'use strict';

  function matchReply(message) {
    const text = String(message || '').toLowerCase();
    if (/strateg|invest|private equity|hedge fund|real estate|credit/.test(text)) {
      return 'We focus on four core strategies — Private Equity, Hedge Fund Solutions, Real Estate, and Credit &amp; Insurance. You can explore each in detail on our <a href="strategies.html">Investment Approach</a> page.';
    }
    if (/contact|enquir|talk to someone|human|call|email|reach/.test(text)) {
      return 'You can reach our team directly through our <a href="contact.html">Investor Enquiry</a> form, or call us on +27 72 416 6083.';
    }
    if (/leadership|team|who runs|ceo|management/.test(text)) {
      return 'Our leadership team is led by Tebogo Mkhize (CEO) and Michael van der Merwe (CIO), along with heads of Real Assets and Credit &amp; Insurance. You can meet the full team on our <a href="leadership.html">Leadership</a> page.';
    }
    if (/about|company|who are you|history|based/.test(text)) {
      return 'Giantfuse Capital Partners is a South African alternative investment and asset management firm based in Sandton, Johannesburg. Read more on our <a href="about.html">About</a> page.';
    }
    return 'I\'m not able to answer that directly, but our team can help — reach out through our <a href="contact.html">Investor Enquiry</a> form and we\'ll get back to you.';
  }

  const GREETING = 'Hi, I\'m Atlas — I can help you learn about our investment strategies, leadership team, or how to get in touch. What would you like to know?';
  const TYPING_DELAY_MS = 600;

  function init() {
    if (typeof document === 'undefined') return;
    const launcher = document.querySelector('#atlas-launcher');
    const panel = document.querySelector('#atlas-panel');
    const closeBtn = document.querySelector('#atlas-close-btn');
    const messages = document.querySelector('#atlas-messages');
    const form = document.querySelector('#atlas-input-form');
    const input = document.querySelector('#atlas-input');
    if (!launcher || !panel || !messages || !form || !input) return;

    let greeted = false;

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

    function showTyping() {
      const el = document.createElement('div');
      el.className = 'atlas-typing';
      el.id = 'atlas-typing-indicator';
      el.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
    }

    function hideTyping() {
      const el = document.querySelector('#atlas-typing-indicator');
      if (el) el.remove();
    }

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

    launcher.addEventListener('click', () => {
      setOpen(!panel.classList.contains('is-open'));
    });
    if (closeBtn) {
      closeBtn.addEventListener('click', () => setOpen(false));
    }
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) {
        setOpen(false);
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      addMessage(value, 'user');
      input.value = '';
      showTyping();
      setTimeout(() => {
        hideTyping();
        addMessage(matchReply(value), 'bot');
      }, TYPING_DELAY_MS);
    });
  }

  const api = { matchReply, init };

  if (typeof window !== 'undefined') {
    window.Giantfuse = window.Giantfuse || {};
    window.Giantfuse.AtlasWidget = window.Giantfuse.AtlasWidget || {};
    Object.assign(window.Giantfuse.AtlasWidget, api);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
```

- [ ] **Step 2: Wire `AtlasWidget.init()` into `main.js`**

In `assets/js/main.js`, find this block inside `init()`:

```js
    syncNavbarHeight();
    if (window.Giantfuse && window.Giantfuse.Nav) window.Giantfuse.Nav.init();
    if (window.Giantfuse && window.Giantfuse.ContactForm) window.Giantfuse.ContactForm.init();
```

Replace with:

```js
    syncNavbarHeight();
    if (window.Giantfuse && window.Giantfuse.Nav) window.Giantfuse.Nav.init();
    if (window.Giantfuse && window.Giantfuse.ContactForm) window.Giantfuse.ContactForm.init();
    if (window.Giantfuse && window.Giantfuse.AtlasWidget) window.Giantfuse.AtlasWidget.init();
```

(If `contact.html` isn't the page being viewed, `ContactForm` won't be defined and that line is already a no-op per its own guard — this new line follows the identical pattern.)

- [ ] **Step 3: Add the script tag to `index.html`**

Find:

```html
  <script src="assets/js/main.js"></script>
  <script src="assets/js/preloader.js"></script>
```

Replace with:

```html
  <script src="assets/js/main.js"></script>
  <script src="assets/js/atlas-widget.js"></script>
  <script src="assets/js/preloader.js"></script>
```

- [ ] **Step 4: Re-run the Task 2 validation tests to confirm they still pass**

```bash
node -e "
const { matchReply } = require('./assets/js/atlas-widget.js');
const assert = require('assert');
assert.ok(matchReply('Tell me about your investment strategies').includes('strategies.html'));
console.log('OK: matchReply unchanged after DOM wiring added');
"
node --check assets/js/atlas-widget.js
node --check assets/js/main.js
```

Expected: `OK: matchReply unchanged after DOM wiring added`, then no output from either `node --check`.

- [ ] **Step 5: Verify the full happy path in the browser**

Navigate to `index.html` (refresh if already open):

1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. Using `computer` (click): click the launcher button.
3. `javascript_tool`, evaluate: `JSON.stringify({panelOpen: document.getElementById('atlas-panel').classList.contains('is-open'), greetingText: document.querySelector('.atlas-message-bot')?.textContent})` — expected `panelOpen: true`, `greetingText` contains "Hi, I'm Atlas".
4. Using `computer`/`javascript_tool`, type a message into `#atlas-input` (e.g. "Tell me about your strategies") and submit the form (click the send button, or dispatch the form's `submit` event).
5. Immediately after sending, `javascript_tool`, evaluate: `!!document.getElementById('atlas-typing-indicator')` — expected `true` (typing indicator visible before the delay elapses).
6. Wait at least 700ms (longer than `TYPING_DELAY_MS`), then `javascript_tool`, evaluate:
   ```js
   JSON.stringify({
     typingGone: !document.getElementById('atlas-typing-indicator'),
     userMsgText: document.querySelector('.atlas-message-user')?.textContent,
     botReplyHasLink: document.querySelectorAll('.atlas-message-bot')[1]?.querySelector('a')?.getAttribute('href')
   })
   ```
   Expected: `typingGone: true`, `userMsgText` is `"Tell me about your strategies"`, `botReplyHasLink` is `"strategies.html"`.
7. Click the close button (`#atlas-close-btn`); `javascript_tool`, evaluate `document.getElementById('atlas-panel').classList.contains('is-open')` — expected `false`.
8. Reopen via the launcher, then press `Escape` (`computer` `key` action); evaluate the same check — expected `false` again.
9. `resize_window` to `preset: "mobile"`, reload, open the panel, screenshot — confirm the panel now spans nearly the full viewport (not the small 360px floating card).

- [ ] **Step 6: Commit**

```bash
git add assets/js/atlas-widget.js assets/js/main.js index.html
git commit -m "feat: add Atlas widget open/close, message send, and typing indicator behavior"
```

---

## Task 5: Wire the widget into the remaining 4 pages

**Files:**
- Modify: `about.html`, `strategies.html`, `leadership.html`, `contact.html`

**Interfaces:**
- Consumes: `assets/css/atlas-widget.css`, `components/atlas-widget.html`, `assets/js/atlas-widget.js` (all complete as of Task 4) — no code changes in this task, purely mechanical repetition of the same 3 additions Task 3/4 already made to `index.html`.

- [ ] **Step 1: Wire `about.html`**

Find:

```html
  <link rel="stylesheet" href="assets/css/shared-sections.css">
  <link rel="stylesheet" href="assets/css/pages/about.css">
</head>
```

Replace with:

```html
  <link rel="stylesheet" href="assets/css/shared-sections.css">
  <link rel="stylesheet" href="assets/css/atlas-widget.css">
  <link rel="stylesheet" href="assets/css/pages/about.css">
</head>
```

Find:

```html
  <div data-include="footer"></div>

  <script src="assets/js/counters.js"></script>
  <script src="assets/js/scroll-effects.js"></script>
  <script src="assets/js/navigation.js"></script>
  <script src="assets/js/main.js"></script>
</body>
```

Replace with:

```html
  <div data-include="footer"></div>
  <div data-include="atlas-widget"></div>

  <script src="assets/js/counters.js"></script>
  <script src="assets/js/scroll-effects.js"></script>
  <script src="assets/js/navigation.js"></script>
  <script src="assets/js/main.js"></script>
  <script src="assets/js/atlas-widget.js"></script>
</body>
```

- [ ] **Step 2: Wire `strategies.html`**

Find:

```html
  <link rel="stylesheet" href="assets/css/shared-sections.css">
  <link rel="stylesheet" href="assets/css/pages/strategies.css">
</head>
```

Replace with:

```html
  <link rel="stylesheet" href="assets/css/shared-sections.css">
  <link rel="stylesheet" href="assets/css/atlas-widget.css">
  <link rel="stylesheet" href="assets/css/pages/strategies.css">
</head>
```

Find:

```html
  <div data-include="footer"></div>

  <script src="assets/js/counters.js"></script>
  <script src="assets/js/scroll-effects.js"></script>
  <script src="assets/js/navigation.js"></script>
  <script src="assets/js/main.js"></script>
</body>
```

Replace with:

```html
  <div data-include="footer"></div>
  <div data-include="atlas-widget"></div>

  <script src="assets/js/counters.js"></script>
  <script src="assets/js/scroll-effects.js"></script>
  <script src="assets/js/navigation.js"></script>
  <script src="assets/js/main.js"></script>
  <script src="assets/js/atlas-widget.js"></script>
</body>
```

- [ ] **Step 3: Wire `leadership.html`**

Find:

```html
  <link rel="stylesheet" href="assets/css/shared-sections.css">
  <link rel="stylesheet" href="assets/css/pages/leadership.css">
</head>
```

Replace with:

```html
  <link rel="stylesheet" href="assets/css/shared-sections.css">
  <link rel="stylesheet" href="assets/css/atlas-widget.css">
  <link rel="stylesheet" href="assets/css/pages/leadership.css">
</head>
```

Find:

```html
  <div data-include="footer"></div>

  <script src="assets/js/counters.js"></script>
  <script src="assets/js/scroll-effects.js"></script>
  <script src="assets/js/navigation.js"></script>
  <script src="assets/js/main.js"></script>
</body>
```

Replace with:

```html
  <div data-include="footer"></div>
  <div data-include="atlas-widget"></div>

  <script src="assets/js/counters.js"></script>
  <script src="assets/js/scroll-effects.js"></script>
  <script src="assets/js/navigation.js"></script>
  <script src="assets/js/main.js"></script>
  <script src="assets/js/atlas-widget.js"></script>
</body>
```

- [ ] **Step 4: Wire `contact.html`**

Find:

```html
  <link rel="stylesheet" href="assets/css/shared-sections.css">
  <link rel="stylesheet" href="assets/css/pages/contact.css">
</head>
```

Replace with:

```html
  <link rel="stylesheet" href="assets/css/shared-sections.css">
  <link rel="stylesheet" href="assets/css/atlas-widget.css">
  <link rel="stylesheet" href="assets/css/pages/contact.css">
</head>
```

Find:

```html
  <div data-include="footer"></div>

  <script src="assets/js/counters.js"></script>
  <script src="assets/js/scroll-effects.js"></script>
  <script src="assets/js/navigation.js"></script>
  <script src="assets/js/main.js"></script>
  <script src="assets/js/contact-form.js"></script>
</body>
```

Replace with:

```html
  <div data-include="footer"></div>
  <div data-include="atlas-widget"></div>

  <script src="assets/js/counters.js"></script>
  <script src="assets/js/scroll-effects.js"></script>
  <script src="assets/js/navigation.js"></script>
  <script src="assets/js/main.js"></script>
  <script src="assets/js/atlas-widget.js"></script>
  <script src="assets/js/contact-form.js"></script>
</body>
```

- [ ] **Step 5: Verify each of the 4 pages in the browser**

For each of `about.html`, `strategies.html`, `leadership.html`, `contact.html`:

1. Navigate to the page. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. `javascript_tool`, evaluate: `!!document.getElementById('atlas-launcher')` — expected `true`.
3. Using `computer`, click the launcher, then evaluate `document.getElementById('atlas-panel').classList.contains('is-open')` — expected `true`, and `document.querySelector('.atlas-message-bot')?.textContent` should contain "Hi, I'm Atlas" (confirms `init()` ran correctly on this page too, not just `index.html`).

On `contact.html` specifically, additionally confirm the widget doesn't interfere with the existing enquiry form: `javascript_tool`, evaluate `!!document.getElementById('enquiry-form')` — expected `true` (the form is still present and, from prior work, still functional — this task didn't touch anything inside it).

- [ ] **Step 6: Commit**

```bash
git add about.html strategies.html leadership.html contact.html
git commit -m "feat: wire Atlas widget into About, Strategies, Leadership, and Contact pages"
```

---

## Task 6: Full-site regression check and merge

**Files:** None expected — this task verifies the finished feature and fixes anything the checks below surface.

**Interfaces:**
- Consumes: the fully wired widget across all 5 pages from Tasks 1–5.
- Produces: the branch merged into `main` and pushed to `origin`.

- [ ] **Step 1: Full regression pass**

Using the Claude Browser MCP tools:

1. On `index.html`, repeat the full happy-path click-through from Task 4 Step 5 once more end-to-end (confirms Task 5's additions to other pages didn't break anything on the original page).
2. On `contact.html`: open the enquiry wizard (the feature built in an earlier plan) and confirm it still works end-to-end (Phase 1 → Phase 2 → Phase 3 → submit → confirmation) — this confirms the Atlas widget's shared `Escape` keydown listener and the enquiry wizard's own `Escape` listener don't interfere with each other. Also open the Atlas widget on the same page and confirm both can be open at once without visual overlap breaking either (the widget's `z-index: 150` should render below the wizard's own in-page content, which isn't a fixed overlay, so there should be no conflict — screenshot to confirm).
3. `resize_window` to `preset: "mobile"`, open the mobile nav drawer (built in an earlier plan) AND the Atlas widget's launcher on the same page — confirm both can coexist without either blocking the other's controls (the drawer's z-index 200s should render above the widget's 150 if both happen to be open, per the design's stacking decision) — screenshot to confirm.
4. Confirm zero console errors on all 5 pages at both mobile and desktop widths.

If any check fails, fix the underlying file and re-run the failing check before proceeding.

- [ ] **Step 2: Final commit for any fixes**

Only if Step 1 required changes:

```bash
git add -A
git commit -m "fix: address Atlas widget regression check findings"
```

- [ ] **Step 3: Merge to main and push**

```bash
cd "C:\Users\Neo\OneDrive\Documents\HIMARK SGC\Giantfuse\giantfusecapital-site"
git checkout main
git pull
git merge --no-edit feat/atlas-chatbot-widget
node --check assets/js/atlas-widget.js
node --check assets/js/main.js
git push origin main
git branch -d feat/atlas-chatbot-widget
```

Expected: merge succeeds (resolve any conflict with `origin/main` if it has moved since the branch was created — check what changed before resolving), both `node --check` commands produce no output, push succeeds, branch deleted locally.
