# Contact Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `contact.html` — a 3-step investor-enquiry form wizard, the site's first interactive/stateful page.

**Architecture:** Static HTML page reusing the existing fetch-include navbar/footer and `.hero.hero-banner` convention. A new dedicated `assets/js/contact-form.js` owns all wizard state (current step, validation, review rendering, submit) as an IIFE exposing `window.Giantfuse.ContactForm`, called from `main.js`'s `init()`. Validation logic is written as pure functions (no DOM) so it can be unit-tested with `node -e`, unlike the rest of the site's DOM-coupled render functions. No backend — submitting shows a client-side confirmation state only.

**Tech Stack:** Plain HTML/CSS/JS. Google Fonts (Space Grotesk + Lato, already loaded project-wide). No test framework — `node --check`/`node -e` for JS syntax and pure-logic checks, live browser checks (Claude Browser MCP tools) for everything DOM/interaction-related.

## Global Constraints

- No build tool, bundler, framework, or npm dependency may be introduced.
- Headings use Space Grotesk, body text uses Lato — no serif fonts.
- Interior-page heroes use `.hero.hero-banner` (not full `100vh` like Home).
- No real form submission — front-end only. Submitting shows a client-side "thank you" confirmation; nothing is sent over the network.
- Map is a real `<iframe>` Google Maps embed (`https://www.google.com/maps?q=...&output=embed`), not an abstract graphic — no API key required.
- `--color-gold` (`#C8A961`, currently unused anywhere in the CSS) is the validation/error-attention color — do not introduce a new red/error color.
- Every change must be committed to git; the final task pushes to `origin/main` at `https://github.com/neomatime/giantfusecapital.git` (standing project instruction).
- Reuse existing CSS classes/patterns wherever they already cover the need (`.icon-badge`/`.icon-badge-outline`, `.btn`/`.btn-solid`/`.btn-outline`, `.section-heading`, `.eyebrow`, `.container`, `.hero`/`.hero-banner`) — only add new CSS for things genuinely new to this page (form fields, wizard steps, persona/solution selectors).
- Spec reference: `docs/superpowers/specs/2026-07-18-contact-page-design.md`.

---

## Task 1: New icons for the shared ICONS map

**Files:**
- Modify: `assets/js/main.js:20` (the `ICONS` map, immediately after the existing `locationPin` entry)

**Interfaces:**
- Produces: `ICONS.phone`, `ICONS.mail`, `ICONS.clock`, `ICONS.lock` — each an inline SVG string, same style as the existing 16 entries (`viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`). Consumed as static HTML copies (not JS-bound) by Tasks 2 and 8.

- [ ] **Step 1: Add the 4 new icons**

In `assets/js/main.js`, find this line (the last entry in the `ICONS` object, currently with no trailing comma):

```js
    locationPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21 C12 21 5 14 5 9 C5 5.5 8.1 3 12 3 C15.9 3 19 5.5 19 9 C19 14 12 21 12 21 Z"/><circle cx="12" cy="9" r="2.3"/></svg>'
  };
```

Replace with:

```js
    locationPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21 C12 21 5 14 5 9 C5 5.5 8.1 3 12 3 C15.9 3 19 5.5 19 9 C19 14 12 21 12 21 Z"/><circle cx="12" cy="9" r="2.3"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 3.5 C7.5 3.5 8 4 8.5 5.5 L9.5 8 C9.8 8.8 9.6 9.5 9 10 L7.8 11 C8.5 13 10.9 15.4 13 16.2 L14 15 C14.5 14.4 15.2 14.2 16 14.5 L18.5 15.5 C20 16 20.5 16.5 20.5 17.5 C20.5 19.5 18.8 21 17 21 C11.5 21 3 12.5 3 7 C3 5.2 4.5 3.5 6.5 3.5 Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M4 6.5 L12 13 L20 6.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7 L12 12 L15.5 14"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11 V7.5 C8 5 9.8 3.5 12 3.5 C14.2 3.5 16 5 16 7.5 V11"/></svg>'
  };
```

- [ ] **Step 2: Verify syntax**

```bash
node --check assets/js/main.js
```

Expected: no output (success).

- [ ] **Step 3: Verify the 4 icons are present and well-formed**

```bash
node -e "const { ICONS } = require('./assets/js/main.js'); ['phone','mail','clock','lock'].forEach((k) => { if (!ICONS[k] || !ICONS[k].includes('<svg')) throw new Error('missing or malformed icon: ' + k); }); console.log('OK: 4 new icons present');"
```

Expected: `OK: 4 new icons present`

- [ ] **Step 4: Create the git branch and commit**

```bash
cd "C:\Users\Neo\OneDrive\Documents\HIMARK SGC\Giantfuse\giantfusecapital-site"
git checkout -b feat/contact-page
git add assets/js/main.js
git commit -m "feat: add phone/mail/clock/lock icons to shared ICONS map"
```

---

## Task 2: Page shell — hero + quick info bar

**Files:**
- Create: `contact.html`
- Create: `assets/css/pages/contact.css`

**Interfaces:**
- Consumes: `ICONS.building`, `ICONS.phone`, `ICONS.mail`, `ICONS.clock` (Task 1, copied as static HTML — this page has no JS-bound icon rendering here).
- Produces: `contact.html` with an HTML comment marker `<!-- TASK 4: Investor Enquiry wizard -->` inside `<main>`, after the quick info bar, for Task 4 to replace.

- [ ] **Step 1: Write `contact.html`**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Us | Giantfuse Capital Partners</title>
  <link rel="icon" type="image/png" href="assets/images/icons/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Lato:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/global.css">
  <link rel="stylesheet" href="assets/css/typography.css">
  <link rel="stylesheet" href="assets/css/navigation.css">
  <link rel="stylesheet" href="assets/css/footer.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <link rel="stylesheet" href="assets/css/animationa.css">
  <link rel="stylesheet" href="assets/css/shared-sections.css">
  <link rel="stylesheet" href="assets/css/pages/contact.css">
</head>
<body>
  <div data-include="navbar"></div>

  <section class="hero hero-banner" data-reveal>
    <div class="hero-media">
      <img src="assets/images/pexels-kathan-modi-261434930-16876265.jpg" alt="Tall glass office tower viewed from below at dusk" loading="eager">
    </div>
    <div class="hero-overlay"></div>
    <div class="hero-copy">
      <span class="eyebrow">Contact Us</span>
      <h1>Let's Build What's Next, <span class="text-teal">Together.</span></h1>
      <p>We partner with institutions, family offices and qualified investors to deliver disciplined investment solutions that create long-term value.</p>
    </div>
  </section>

  <main>
    <section class="contact-info-bar" data-reveal>
      <div class="container contact-info-grid">
        <div class="contact-info-item">
          <div class="icon-badge icon-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="3" width="12" height="18"/><line x1="9" y1="7" x2="9" y2="7.01"/><line x1="12" y1="7" x2="12" y2="7.01"/><line x1="15" y1="7" x2="15" y2="7.01"/><line x1="9" y1="11" x2="9" y2="11.01"/><line x1="12" y1="11" x2="12" y2="11.01"/><line x1="15" y1="11" x2="15" y2="11.01"/><line x1="9" y1="15" x2="9" y2="15.01"/><line x1="12" y1="15" x2="12" y2="15.01"/><line x1="15" y1="15" x2="15" y2="15.01"/></svg></div>
          <div>
            <h4>Our Office</h4>
            <p>155 West Street, Sandton, Johannesburg, South Africa</p>
          </div>
        </div>
        <div class="contact-info-item">
          <div class="icon-badge icon-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 3.5 C7.5 3.5 8 4 8.5 5.5 L9.5 8 C9.8 8.8 9.6 9.5 9 10 L7.8 11 C8.5 13 10.9 15.4 13 16.2 L14 15 C14.5 14.4 15.2 14.2 16 14.5 L18.5 15.5 C20 16 20.5 16.5 20.5 17.5 C20.5 19.5 18.8 21 17 21 C11.5 21 3 12.5 3 7 C3 5.2 4.5 3.5 6.5 3.5 Z"/></svg></div>
          <div>
            <h4>Call Us</h4>
            <p>+27 72 416 6083</p>
          </div>
        </div>
        <div class="contact-info-item">
          <div class="icon-badge icon-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M4 6.5 L12 13 L20 6.5"/></svg></div>
          <div>
            <h4>Email Us</h4>
            <p>info@gcapitalpartners.co.za</p>
          </div>
        </div>
        <div class="contact-info-item">
          <div class="icon-badge icon-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7 L12 12 L15.5 14"/></svg></div>
          <div>
            <h4>Office Hours</h4>
            <p>Monday &ndash; Friday<br>08:30 &ndash; 17:00 SAST</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TASK 4: Investor Enquiry wizard -->
  </main>

  <div data-include="footer"></div>

  <script src="assets/js/counters.js"></script>
  <script src="assets/js/scroll-effects.js"></script>
  <script src="assets/js/navigation.js"></script>
  <script src="assets/js/main.js"></script>
</body>
</html>
```

Note: the `<script src="assets/js/contact-form.js">` tag is deliberately not added yet — that file doesn't exist until Task 3. Task 3 adds the script tag when it creates the file.

- [ ] **Step 2: Write `assets/css/pages/contact.css`**

```css
.contact-info-bar { background: var(--color-off-white); padding: var(--space-48) 0; border-bottom: 1px solid var(--color-light-gray); }
.contact-info-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-32); }
@media (min-width: 641px) { .contact-info-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1025px) { .contact-info-grid { grid-template-columns: repeat(4, 1fr); } }
.contact-info-item { display: flex; gap: var(--space-16); align-items: flex-start; }
.contact-info-item h4 { margin-bottom: var(--space-4); }
.contact-info-item p { font-size: 0.9rem; }
```

- [ ] **Step 3: Verify in the browser**

Using the Claude Browser MCP tools: `preview_start` with `{name: "giantfuse"}`, navigate to `contact.html`, then:

1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. `javascript_tool`, evaluate:
   ```js
   JSON.stringify({
     title: document.title,
     eyebrow: document.querySelector('.hero .eyebrow')?.textContent,
     h1: document.querySelector('.hero h1')?.textContent.trim(),
     infoItemCount: document.querySelectorAll('.contact-info-item').length,
     navActive: document.querySelector('.navbar-links a.active')?.textContent
   })
   ```
   Expected: `title` is `"Contact Us | Giantfuse Capital Partners"`, `eyebrow` is `"Contact Us"`, `h1` contains `"Let's Build What's Next, Together."`, `infoItemCount` is `4`, `navActive` is `"Contact Us"`.

- [ ] **Step 4: Commit**

```bash
git add contact.html assets/css/pages/contact.css
git commit -m "feat: add Contact page shell with hero and quick info bar"
```

---

## Task 3: Pure validation logic (TDD)

**Files:**
- Create: `assets/js/contact-form.js`

**Interfaces:**
- Produces: `window.Giantfuse.ContactForm.isValidEmailFormat(value: string): boolean`, `window.Giantfuse.ContactForm.isPhase1Valid(data: {persona, solutions, purpose}): boolean`, `window.Giantfuse.ContactForm.isPhase2Valid(data: {fullName, workEmail, company}): boolean`. Task 7 extends this same file (same IIFE) with DOM-wiring functions and an `init()` — it does not create a second file or a second IIFE.

- [ ] **Step 1: Write the failing test**

```bash
node -e "
const { isValidEmailFormat, isPhase1Valid, isPhase2Valid } = require('./assets/js/contact-form.js');
const assert = require('assert');
assert.strictEqual(isValidEmailFormat('jane@acme.com'), true);
assert.strictEqual(isValidEmailFormat('jane@acme'), false);
assert.strictEqual(isValidEmailFormat('aceme.com'), false);
assert.strictEqual(isValidEmailFormat(''), false);
assert.strictEqual(isPhase1Valid({ persona: 'institutional', solutions: ['private-equity'], purpose: 'investment-opportunity' }), true);
assert.strictEqual(isPhase1Valid({ persona: null, solutions: ['private-equity'], purpose: 'investment-opportunity' }), false);
assert.strictEqual(isPhase1Valid({ persona: 'institutional', solutions: [], purpose: 'investment-opportunity' }), false);
assert.strictEqual(isPhase1Valid({ persona: 'institutional', solutions: ['private-equity'], purpose: '' }), false);
assert.strictEqual(isPhase2Valid({ fullName: 'Jane Doe', workEmail: 'jane@acme.com', company: 'Acme' }), true);
assert.strictEqual(isPhase2Valid({ fullName: '', workEmail: 'jane@acme.com', company: 'Acme' }), false);
assert.strictEqual(isPhase2Valid({ fullName: '  ', workEmail: 'jane@acme.com', company: 'Acme' }), false);
assert.strictEqual(isPhase2Valid({ fullName: 'Jane Doe', workEmail: 'not-an-email', company: 'Acme' }), false);
assert.strictEqual(isPhase2Valid({ fullName: 'Jane Doe', workEmail: 'jane@acme.com', company: '' }), false);
console.log('OK: all validation tests passed');
"
```

- [ ] **Step 2: Run it to verify it fails**

Run the command from Step 1.
Expected: FAIL — `Error: Cannot find module './assets/js/contact-form.js'` (the file doesn't exist yet).

- [ ] **Step 3: Write `assets/js/contact-form.js`**

```js
(function () {
  'use strict';

  function isValidEmailFormat(value) {
    if (typeof value !== 'string') return false;
    const at = value.indexOf('@');
    if (at < 1) return false;
    const afterAt = value.slice(at + 1);
    const dot = afterAt.indexOf('.');
    return dot > 0 && dot < afterAt.length - 1;
  }

  function isPhase1Valid(data) {
    return Boolean(data.persona) &&
      Array.isArray(data.solutions) && data.solutions.length > 0 &&
      Boolean(data.purpose);
  }

  function isPhase2Valid(data) {
    return Boolean(data.fullName && data.fullName.trim()) &&
      isValidEmailFormat(data.workEmail) &&
      Boolean(data.company && data.company.trim());
  }

  const api = { isValidEmailFormat, isPhase1Valid, isPhase2Valid };

  if (typeof window !== 'undefined') {
    window.Giantfuse = window.Giantfuse || {};
    window.Giantfuse.ContactForm = window.Giantfuse.ContactForm || {};
    Object.assign(window.Giantfuse.ContactForm, api);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
```

- [ ] **Step 4: Run the test again to verify it passes**

Run the command from Step 1.
Expected: `OK: all validation tests passed`

- [ ] **Step 5: Verify syntax and add the script tag to `contact.html`**

```bash
node --check assets/js/contact-form.js
```

Expected: no output (success).

In `contact.html`, find:

```html
  <script src="assets/js/main.js"></script>
</body>
```

Replace with:

```html
  <script src="assets/js/main.js"></script>
  <script src="assets/js/contact-form.js"></script>
</body>
```

- [ ] **Step 6: Commit**

```bash
git add assets/js/contact-form.js contact.html
git commit -m "feat: add pure validation logic for the enquiry wizard"
```

---

## Task 4: Step indicator + Phase 1 markup

**Files:**
- Modify: `contact.html` (replace the `<!-- TASK 4: Investor Enquiry wizard -->` comment)
- Modify: `assets/css/pages/contact.css` (append)

**Interfaces:**
- Produces: `#enquiry-steps` (step indicator, steps 2 and 3 rendered inert/unstyled-active for now — Task 7 wires their interactive state), `#enquiry-form`, `#enquiry-phase-1` containing `#persona-grid` and `#solution-checklist` as **empty containers** (Task 7's JS populates them from config — this is intentional and matches the project's established pattern of shipping empty JS-rendered containers ahead of the task that fills them, e.g. Leadership Task 2/3), a `purpose` `<select>`, an `enquiry-notes` `<textarea>`, and a "Next" button (`data-action="next"`, inert until Task 7 adds its click handler).
- Consumes: nothing from earlier tasks beyond the page shell (Task 2).

- [ ] **Step 1: Replace the Task 4 marker in `contact.html`**

Replace this line:

```html
    <!-- TASK 4: Investor Enquiry wizard -->
```

with:

```html
    <section class="section" data-reveal>
      <div class="container">
        <div class="section-heading">
          <h2>Investor <span class="text-teal">Enquiry</span></h2>
          <p>To ensure we connect you with the right information and team, please complete our two-step enquiry process.</p>
        </div>

        <ol class="enquiry-steps" id="enquiry-steps">
          <li class="enquiry-step is-active" data-step="1">
            <button type="button" class="enquiry-step-marker" disabled><span class="enquiry-step-number">1</span></button>
            <div>
              <strong>Your Enquiry</strong>
              <span>Tell us what you are looking for</span>
            </div>
          </li>
          <li class="enquiry-step" data-step="2">
            <button type="button" class="enquiry-step-marker" disabled><span class="enquiry-step-number">2</span></button>
            <div>
              <strong>Contact Details</strong>
              <span>Share your details so we can reach you</span>
            </div>
          </li>
          <li class="enquiry-step" data-step="3">
            <button type="button" class="enquiry-step-marker" disabled><span class="enquiry-step-number">3</span></button>
            <div>
              <strong>Review &amp; Submit</strong>
              <span>We'll be in touch shortly</span>
            </div>
          </li>
        </ol>

        <form id="enquiry-form" novalidate>
          <div class="enquiry-phase is-active" data-phase="1" id="enquiry-phase-1">
            <div class="phase-card">
              <span class="phase-badge">Phase 1 of 2</span>
              <h3>What are you enquiring about?</h3>
              <p class="phase-intro">This helps us route your enquiry to the right team.</p>

              <div class="field-group">
                <label class="field-label">Which best describes you?</label>
                <div class="persona-grid" id="persona-grid"></div>
                <p class="field-error" data-error-for="persona" hidden>Please select one option.</p>
              </div>

              <div class="field-group">
                <label class="field-label">What type of solution are you interested in?</label>
                <p class="field-hint">Select all that apply.</p>
                <div class="solution-checklist" id="solution-checklist"></div>
                <p class="field-error" data-error-for="solutions" hidden>Please select at least one option.</p>
              </div>

              <div class="field-group">
                <label class="field-label" for="purpose">What is the purpose of your enquiry?</label>
                <select id="purpose" name="purpose" required>
                  <option value="" selected disabled>Please select...</option>
                  <option value="investment-opportunity">Investment Opportunity</option>
                  <option value="partnership">Partnership Enquiry</option>
                  <option value="media-press">Media &amp; Press</option>
                  <option value="careers">Careers</option>
                  <option value="general-question">General Question</option>
                  <option value="other">Other</option>
                </select>
                <p class="field-error" data-error-for="purpose" hidden>Please select the purpose of your enquiry.</p>
              </div>

              <div class="field-group">
                <label class="field-label" for="enquiry-notes">Tell us more about your enquiry (optional)</label>
                <textarea id="enquiry-notes" name="enquiryNotes" rows="4" placeholder="Provide any additional detail that will help us understand how we can assist."></textarea>
              </div>

              <div class="phase-actions">
                <button type="button" class="btn btn-solid" data-action="next">Next: Contact Details &rarr;</button>
              </div>
            </div>
          </div>

          <!-- TASK 5: Phase 2 -->

          <!-- TASK 6: Phase 3 + success panel -->
        </form>
      </div>
    </section>
```

- [ ] **Step 2: Append to `assets/css/pages/contact.css`**

```css
.enquiry-steps { list-style: none; margin: 0 0 var(--space-48); padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-16); position: relative; }
.enquiry-steps::before {
  content: '';
  position: absolute;
  top: 20px;
  left: calc(100% / 6);
  right: calc(100% / 6);
  height: 1px;
  border-top: 1px dashed var(--color-steel-teal);
  z-index: 0;
}
.enquiry-step { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; text-align: center; gap: var(--space-8); }
.enquiry-step-marker {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--color-steel-teal);
  background: var(--color-off-white);
  color: var(--color-slate);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
}
.enquiry-step-number { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.9rem; }
.enquiry-step.is-active .enquiry-step-marker { background: var(--color-teal); border-color: var(--color-teal); color: var(--color-white); }
.enquiry-step.is-complete .enquiry-step-marker { background: var(--color-teal); border-color: var(--color-teal); color: var(--color-white); cursor: pointer; }
.enquiry-step strong { display: block; font-size: 0.9rem; color: var(--color-navy); }
.enquiry-step span { font-size: 0.78rem; color: var(--color-slate); }

.enquiry-phase { display: none; }
.enquiry-phase.is-active { display: block; }
.phase-card { background: var(--color-white); border: 1px solid var(--color-light-gray); border-radius: var(--radius-md); padding: var(--space-32); max-width: 760px; margin: 0 auto; }
.phase-badge {
  display: inline-block;
  background: var(--color-teal);
  color: var(--color-white);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: var(--space-4) var(--space-12);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-16);
}
.phase-card h3 { margin-bottom: var(--space-8); }
.phase-intro { margin-bottom: var(--space-24); font-size: 0.9rem; }

.field-group { margin-bottom: var(--space-24); }
.field-label { display: block; font-weight: 600; color: var(--color-navy); margin-bottom: var(--space-8); font-size: 0.9rem; }
.field-hint { font-size: 0.8rem; color: var(--color-slate); margin-bottom: var(--space-12); }
.field-error { color: var(--color-gold); font-size: 0.8rem; margin-top: var(--space-8); }

select, textarea, input[type="text"], input[type="email"], input[type="tel"] {
  width: 100%;
  padding: var(--space-12);
  border: 1.5px solid var(--color-light-gray);
  border-radius: var(--radius-sm);
  font-family: 'Lato', sans-serif;
  font-size: 0.95rem;
  color: var(--color-navy);
  background: var(--color-white);
}
select:focus, textarea:focus, input:focus { outline: none; border-color: var(--color-teal); }
.field-group.has-error select,
.field-group.has-error textarea,
.field-group.has-error input,
.field-group.has-error .persona-grid,
.field-group.has-error .solution-checklist {
  border-color: var(--color-gold);
}
textarea { resize: vertical; }

.persona-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-12); }
@media (min-width: 641px) { .persona-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1025px) { .persona-grid { grid-template-columns: repeat(5, 1fr); } }
.persona-option { position: relative; }
.persona-option input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.persona-option label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8);
  text-align: center;
  padding: var(--space-16) var(--space-12);
  border: 1.5px solid var(--color-light-gray);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.82rem;
  color: var(--color-slate);
}
.persona-option input:checked + label { border-color: var(--color-teal); color: var(--color-navy); background: var(--color-off-white); }
.persona-option input:focus-visible + label { outline: 2px solid var(--color-teal); outline-offset: 2px; }
.persona-option .icon-badge { width: 40px; height: 40px; }
.persona-option .icon-badge svg { width: 20px; height: 20px; }

.solution-checklist { display: grid; grid-template-columns: 1fr; gap: var(--space-12); }
@media (min-width: 641px) { .solution-checklist { grid-template-columns: repeat(2, 1fr); } }
.solution-option { position: relative; }
.solution-option input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.solution-option label {
  display: flex;
  align-items: center;
  gap: var(--space-12);
  padding: var(--space-12);
  border: 1.5px solid var(--color-light-gray);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.88rem;
  color: var(--color-slate);
}
.solution-option input:checked + label { border-color: var(--color-teal); color: var(--color-navy); background: var(--color-off-white); }
.solution-option input:focus-visible + label { outline: 2px solid var(--color-teal); outline-offset: 2px; }
.solution-option .check-mark {
  width: 18px;
  height: 18px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--color-light-gray);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
}
.solution-option input:checked + label .check-mark { border-color: var(--color-teal); background: var(--color-teal); color: var(--color-white); }
.solution-option .check-mark svg { width: 12px; height: 12px; }

.phase-actions { display: flex; justify-content: flex-end; gap: var(--space-16); margin-top: var(--space-32); }
.phase-actions.has-back { justify-content: space-between; }
```

- [ ] **Step 3: Verify in the browser**

Navigate to `contact.html` (refresh if already open), then:

1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. `javascript_tool`, evaluate:
   ```js
   JSON.stringify({
     stepCount: document.querySelectorAll('.enquiry-step').length,
     phaseCount: document.querySelectorAll('.enquiry-phase').length,
     purposeOptionCount: document.querySelectorAll('#purpose option').length,
     personaGridEmpty: document.querySelectorAll('#persona-grid > *').length === 0,
     solutionListEmpty: document.querySelectorAll('#solution-checklist > *').length === 0
   })
   ```
   Expected: `stepCount` is `3`, `phaseCount` is `1` (only Phase 1 exists so far), `purposeOptionCount` is `7` (6 real options + the disabled placeholder), `personaGridEmpty` and `solutionListEmpty` are both `true` — **this is expected at this point in the build**, Task 7 populates them.
3. Take a screenshot to visually confirm the step indicator and Phase 1 card render sensibly even with the two empty grids (there should be visible empty space where the cards/checkboxes will go — not broken layout).

- [ ] **Step 4: Commit**

```bash
git add contact.html assets/css/pages/contact.css
git commit -m "feat: add enquiry step indicator and Phase 1 markup"
```

---

## Task 5: Phase 2 markup

**Files:**
- Modify: `contact.html` (replace the `<!-- TASK 5: Phase 2 -->` comment)
- Modify: `assets/css/pages/contact.css` (append)

**Interfaces:**
- Produces: `#enquiry-phase-2` containing all Contact Details fields, a "Back" button (`data-action="back"`) and "Review & Submit" button (`data-action="next"`), both inert until Task 7.

- [ ] **Step 1: Replace the Task 5 marker in `contact.html`**

Replace this line:

```html
          <!-- TASK 5: Phase 2 -->
```

with:

```html
          <div class="enquiry-phase" data-phase="2" id="enquiry-phase-2">
            <div class="phase-card">
              <span class="phase-badge">Phase 2 of 2</span>
              <h3>Contact Details</h3>
              <p class="phase-intro">Please provide your details below so we can respond.</p>

              <div class="field-grid">
                <div class="field-group">
                  <label class="field-label" for="full-name">Full Name</label>
                  <input type="text" id="full-name" name="fullName" placeholder="Enter your full name" required>
                  <p class="field-error" data-error-for="fullName" hidden>Please enter your full name.</p>
                </div>
                <div class="field-group">
                  <label class="field-label" for="work-email">Work Email</label>
                  <input type="email" id="work-email" name="workEmail" placeholder="name@company.com" required>
                  <p class="field-error" data-error-for="workEmail" hidden>Please enter a valid work email.</p>
                </div>
                <div class="field-group">
                  <label class="field-label" for="company">Company / Organisation</label>
                  <input type="text" id="company" name="company" placeholder="Enter company name" required>
                  <p class="field-error" data-error-for="company" hidden>Please enter your company or organisation.</p>
                </div>
                <div class="field-group">
                  <label class="field-label" for="job-title">Job Title</label>
                  <input type="text" id="job-title" name="jobTitle" placeholder="Your job title">
                </div>
                <div class="field-group">
                  <label class="field-label" for="country">Country</label>
                  <select id="country" name="country" required>
                    <option value="" selected disabled>Select country...</option>
                    <option value="za">South Africa</option>
                    <option value="bw">Botswana</option>
                    <option value="ke">Kenya</option>
                    <option value="mu">Mauritius</option>
                    <option value="ng">Nigeria</option>
                    <option value="uk">United Kingdom</option>
                    <option value="us">United States</option>
                    <option value="ae">United Arab Emirates</option>
                    <option value="other">Other</option>
                  </select>
                  <p class="field-error" data-error-for="country" hidden>Please select your country.</p>
                </div>
                <div class="field-group">
                  <label class="field-label" for="phone">Phone Number</label>
                  <div class="phone-field">
                    <span class="phone-prefix">+27</span>
                    <input type="tel" id="phone" name="phone" placeholder="82 123 4567">
                  </div>
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">How would you prefer to be contacted?</label>
                <div class="contact-pref-group">
                  <div class="pref-option">
                    <input type="radio" id="pref-email" name="contactPreference" value="email" checked>
                    <label for="pref-email">Email</label>
                  </div>
                  <div class="pref-option">
                    <input type="radio" id="pref-phone" name="contactPreference" value="phone">
                    <label for="pref-phone">Phone</label>
                  </div>
                  <div class="pref-option">
                    <input type="radio" id="pref-either" name="contactPreference" value="either">
                    <label for="pref-either">Either</label>
                  </div>
                </div>
              </div>

              <div class="field-group">
                <label class="field-label" for="best-time">Best time to contact you</label>
                <select id="best-time" name="bestTime">
                  <option value="" selected>Select time preference...</option>
                  <option value="morning">Morning (08:00 &ndash; 12:00)</option>
                  <option value="afternoon">Afternoon (12:00 &ndash; 17:00)</option>
                  <option value="evening">Evening (after 17:00)</option>
                  <option value="anytime">Anytime</option>
                </select>
              </div>

              <div class="field-group">
                <label class="field-label" for="additional-info">Any additional information (optional)</label>
                <textarea id="additional-info" name="additionalInfo" rows="3" placeholder="Add any information that may help us respond better."></textarea>
              </div>

              <div class="phase-actions has-back">
                <button type="button" class="btn btn-outline" data-action="back">&larr; Back</button>
                <button type="button" class="btn btn-solid" data-action="next">Review &amp; Submit &rarr;</button>
              </div>
            </div>
          </div>
```

- [ ] **Step 2: Append to `assets/css/pages/contact.css`**

```css
.field-grid { display: grid; grid-template-columns: 1fr; gap: 0 var(--space-24); }
@media (min-width: 641px) { .field-grid { grid-template-columns: repeat(2, 1fr); } }

.phone-field { display: flex; align-items: center; gap: var(--space-8); }
.phone-prefix {
  flex-shrink: 0;
  padding: var(--space-12);
  border: 1.5px solid var(--color-light-gray);
  border-radius: var(--radius-sm);
  background: var(--color-off-white);
  color: var(--color-slate);
  font-size: 0.95rem;
}
.phone-field input { flex: 1; }

.contact-pref-group { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-12); }
.pref-option input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.pref-option label {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  border: 1.5px solid var(--color-light-gray);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.88rem;
  color: var(--color-slate);
  text-align: center;
}
.pref-option input:checked + label { border-color: var(--color-teal); color: var(--color-navy); background: var(--color-off-white); }
.pref-option input:focus-visible + label { outline: 2px solid var(--color-teal); outline-offset: 2px; }
```

- [ ] **Step 3: Verify in the browser**

Navigate to `contact.html` (refresh if already open). Phase 2 is not visible yet (no `.is-active` class, and step-switching JS doesn't exist until Task 7) — verify its markup directly via JS instead of visually:

1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. `javascript_tool`, evaluate:
   ```js
   JSON.stringify({
     phaseCount: document.querySelectorAll('.enquiry-phase').length,
     countryOptionCount: document.querySelectorAll('#country option').length,
     prefCheckedDefault: document.querySelector('input[name="contactPreference"]:checked')?.value,
     requiredFieldIds: [...document.querySelectorAll('#enquiry-phase-2 [required]')].map((el) => el.id)
   })
   ```
   Expected: `phaseCount` is `2`, `countryOptionCount` is `10` (9 real country options + the disabled placeholder), `prefCheckedDefault` is `"email"`, `requiredFieldIds` is `["full-name","work-email","company","country"]`.

- [ ] **Step 4: Commit**

```bash
git add contact.html assets/css/pages/contact.css
git commit -m "feat: add Phase 2 (Contact Details) markup"
```

---

## Task 6: Phase 3 review markup + success panel

**Files:**
- Modify: `contact.html` (replace the `<!-- TASK 6: Phase 3 + success panel -->` comment)
- Modify: `assets/css/pages/contact.css` (append)

**Interfaces:**
- Produces: `#enquiry-phase-3` containing an empty `#enquiry-review` container (populated by Task 7's `renderReview()`), a "Back" button and a `type="submit"` "Submit Enquiry" button; `#enquiry-success` (a `hidden` confirmation panel with a "Submit another enquiry" reset link, `data-action="reset"`) as a sibling of `#enquiry-form` (not inside the `<form>`, since Task 7 replaces the whole form's visibility, not its content).

- [ ] **Step 1: Replace the Task 6 marker in `contact.html`**

Replace this line:

```html
          <!-- TASK 6: Phase 3 + success panel -->
```

with:

```html
          <div class="enquiry-phase" data-phase="3" id="enquiry-phase-3">
            <div class="phase-card">
              <h3>Review Your Enquiry</h3>
              <p class="phase-intro">Please confirm your details before submitting.</p>

              <div class="enquiry-review" id="enquiry-review"></div>

              <div class="phase-actions has-back">
                <button type="button" class="btn btn-outline" data-action="back">&larr; Back</button>
                <button type="submit" class="btn btn-solid">Submit Enquiry &rarr;</button>
              </div>
            </div>
          </div>
```

Then, immediately after the closing `</form>` tag (which currently reads `</form>` right before `</div>` and `</section>`), add the success panel as a sibling of the form. Find:

```html
        </form>
      </div>
    </section>
```

Replace with:

```html
        </form>

        <div class="enquiry-success" id="enquiry-success" hidden>
          <div class="icon-badge enquiry-success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4,13 9,18 20,6"/></svg></div>
          <h3>Thank you &mdash; your enquiry has been received.</h3>
          <p>A member of our team will be in touch within 1 business day.</p>
          <button type="button" class="btn btn-outline" data-action="reset">Submit another enquiry</button>
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Append to `assets/css/pages/contact.css`**

```css
.enquiry-review { margin-bottom: var(--space-32); }
.review-group { margin-bottom: var(--space-24); }
.review-group h4 { margin-bottom: var(--space-12); font-size: 1rem; }
.review-row { display: flex; justify-content: space-between; gap: var(--space-16); padding: var(--space-8) 0; border-bottom: 1px solid var(--color-light-gray); font-size: 0.9rem; }
.review-row:last-child { border-bottom: none; }
.review-row dt { color: var(--color-slate); }
.review-row dd { margin: 0; color: var(--color-navy); font-weight: 600; text-align: right; }

.enquiry-success { max-width: 560px; margin: 0 auto; text-align: center; padding: var(--space-48) var(--space-24); }
.enquiry-success-icon { width: 64px; height: 64px; margin: 0 auto var(--space-24); }
.enquiry-success-icon svg { width: 30px; height: 30px; }
.enquiry-success h3 { margin-bottom: var(--space-12); }
.enquiry-success p { margin-bottom: var(--space-24); }
```

- [ ] **Step 3: Verify in the browser**

Navigate to `contact.html` (refresh if already open):

1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. `javascript_tool`, evaluate:
   ```js
   JSON.stringify({
     phaseCount: document.querySelectorAll('.enquiry-phase').length,
     reviewContainerExists: !!document.getElementById('enquiry-review'),
     successPanelHidden: document.getElementById('enquiry-success')?.hasAttribute('hidden'),
     submitButtonType: document.querySelector('#enquiry-phase-3 button[type="submit"]')?.type
   })
   ```
   Expected: `phaseCount` is `3`, `reviewContainerExists` is `true`, `successPanelHidden` is `true`, `submitButtonType` is `"submit"`.

- [ ] **Step 4: Commit**

```bash
git add contact.html assets/css/pages/contact.css
git commit -m "feat: add Phase 3 review markup and success confirmation panel"
```

---

## Task 7: Wizard interactivity (contact-form.js DOM wiring)

**Files:**
- Modify: `assets/js/contact-form.js` (extend the existing IIFE from Task 3 — do not create a second IIFE or duplicate `isValidEmailFormat`/`isPhase1Valid`/`isPhase2Valid`)
- Modify: `assets/js/main.js:init()` (add the `ContactForm.init()` call)

**Interfaces:**
- Consumes: `isValidEmailFormat`, `isPhase1Valid`, `isPhase2Valid` (Task 3, same file); the DOM structure from Tasks 4–6 (`#enquiry-steps`, `#enquiry-form`, `#enquiry-phase-1/2/3`, `#persona-grid`, `#solution-checklist`, `#enquiry-review`, `#enquiry-success`, and every field `id`/`name` listed in Tasks 4–6).
- Produces: `window.Giantfuse.ContactForm.init(): void` — safe no-op if `#enquiry-form` doesn't exist on the current page (matches the existing guard pattern used by `renderLeadership()` etc. in `main.js`).

- [ ] **Step 1: Replace the entire contents of `assets/js/contact-form.js`**

```js
(function () {
  'use strict';

  function isValidEmailFormat(value) {
    if (typeof value !== 'string') return false;
    const at = value.indexOf('@');
    if (at < 1) return false;
    const afterAt = value.slice(at + 1);
    const dot = afterAt.indexOf('.');
    return dot > 0 && dot < afterAt.length - 1;
  }

  function isPhase1Valid(data) {
    return Boolean(data.persona) &&
      Array.isArray(data.solutions) && data.solutions.length > 0 &&
      Boolean(data.purpose);
  }

  function isPhase2Valid(data) {
    return Boolean(data.fullName && data.fullName.trim()) &&
      isValidEmailFormat(data.workEmail) &&
      Boolean(data.company && data.company.trim());
  }

  const PERSONAS = [
    { value: 'institutional', label: 'Institutional Investor', icon: 'building' },
    { value: 'family-office', label: 'Family Office / Investment Group', icon: 'people' },
    { value: 'hnwi', label: 'High-Net-Worth Individual', icon: 'target' },
    { value: 'intermediary', label: 'Intermediary / Advisor', icon: 'magnifyingGlass' },
    { value: 'other', label: 'Other', icon: 'lightbulb' }
  ];

  const SOLUTIONS = [
    { value: 'private-equity', label: 'Private Equity' },
    { value: 'hedge-fund-solutions', label: 'Hedge Fund Solutions' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'credit-insurance', label: 'Credit & Insurance' },
    { value: 'multi-strategy', label: 'Multi-Strategy Solutions' },
    { value: 'other', label: 'Other' }
  ];

  const PURPOSE_LABELS = {
    'investment-opportunity': 'Investment Opportunity',
    'partnership': 'Partnership Enquiry',
    'media-press': 'Media & Press',
    'careers': 'Careers',
    'general-question': 'General Question',
    'other': 'Other'
  };

  const COUNTRY_LABELS = {
    za: 'South Africa', bw: 'Botswana', ke: 'Kenya', mu: 'Mauritius',
    ng: 'Nigeria', uk: 'United Kingdom', us: 'United States', ae: 'United Arab Emirates', other: 'Other'
  };

  const CONTACT_PREF_LABELS = { email: 'Email', phone: 'Phone', either: 'Either' };
  const BEST_TIME_LABELS = {
    morning: 'Morning (08:00 – 12:00)', afternoon: 'Afternoon (12:00 – 17:00)',
    evening: 'Evening (after 17:00)', anytime: 'Anytime'
  };

  function renderPersonaGrid(container, icons) {
    PERSONAS.forEach((persona) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'persona-option';
      const inputId = `persona-${persona.value}`;
      wrapper.innerHTML = `
        <input type="radio" id="${inputId}" name="persona" value="${persona.value}">
        <label for="${inputId}">
          <span class="icon-badge icon-badge-outline">${(icons && icons[persona.icon]) || ''}</span>
          <span>${persona.label}</span>
        </label>
      `;
      container.appendChild(wrapper);
    });
  }

  function renderSolutionChecklist(container, icons) {
    const checkSvg = (icons && icons.checkmark) || '';
    SOLUTIONS.forEach((solution) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'solution-option';
      const inputId = `solution-${solution.value}`;
      wrapper.innerHTML = `
        <input type="checkbox" id="${inputId}" name="solutions" value="${solution.value}">
        <label for="${inputId}">
          <span class="check-mark">${checkSvg}</span>
          <span>${solution.label}</span>
        </label>
      `;
      container.appendChild(wrapper);
    });
  }

  function readFormData(form) {
    const fd = new FormData(form);
    return {
      persona: fd.get('persona'),
      solutions: fd.getAll('solutions'),
      purpose: fd.get('purpose') || '',
      enquiryNotes: fd.get('enquiryNotes') || '',
      fullName: fd.get('fullName') || '',
      workEmail: fd.get('workEmail') || '',
      company: fd.get('company') || '',
      jobTitle: fd.get('jobTitle') || '',
      country: fd.get('country') || '',
      phone: fd.get('phone') || '',
      contactPreference: fd.get('contactPreference') || 'email',
      bestTime: fd.get('bestTime') || '',
      additionalInfo: fd.get('additionalInfo') || ''
    };
  }

  function setFieldError(form, fieldName, hasError) {
    const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
    if (errorEl) errorEl.hidden = !hasError;
    const group = errorEl ? errorEl.closest('.field-group') : null;
    if (group) group.classList.toggle('has-error', hasError);
  }

  function validatePhase1(form) {
    const data = readFormData(form);
    setFieldError(form, 'persona', !data.persona);
    setFieldError(form, 'solutions', data.solutions.length === 0);
    setFieldError(form, 'purpose', !data.purpose);
    return isPhase1Valid(data);
  }

  function validatePhase2(form) {
    const data = readFormData(form);
    setFieldError(form, 'fullName', !(data.fullName && data.fullName.trim()));
    setFieldError(form, 'workEmail', !isValidEmailFormat(data.workEmail));
    setFieldError(form, 'company', !(data.company && data.company.trim()));
    setFieldError(form, 'country', !data.country);
    return isPhase2Valid(data) && Boolean(data.country);
  }

  function reviewRow(label, value) {
    return `<div class="review-row"><dt>${label}</dt><dd>${value}</dd></div>`;
  }

  function renderReview(data, container) {
    const personaLabel = (PERSONAS.find((p) => p.value === data.persona) || {}).label || '—';
    const solutionLabels = data.solutions.map((v) => (SOLUTIONS.find((s) => s.value === v) || {}).label || v).join(', ');
    let html = '<dl class="review-group"><h4>Your Enquiry</h4>';
    html += reviewRow('I am a(n)', personaLabel);
    html += reviewRow('Interested in', solutionLabels || '—');
    html += reviewRow('Purpose', PURPOSE_LABELS[data.purpose] || '—');
    if (data.enquiryNotes) html += reviewRow('Notes', data.enquiryNotes);
    html += '</dl><dl class="review-group"><h4>Contact Details</h4>';
    html += reviewRow('Full Name', data.fullName);
    html += reviewRow('Work Email', data.workEmail);
    html += reviewRow('Company', data.company);
    if (data.jobTitle) html += reviewRow('Job Title', data.jobTitle);
    html += reviewRow('Country', COUNTRY_LABELS[data.country] || '—');
    if (data.phone) html += reviewRow('Phone', `+27 ${data.phone}`);
    html += reviewRow('Contact Preference', CONTACT_PREF_LABELS[data.contactPreference] || '—');
    if (data.bestTime) html += reviewRow('Best Time', BEST_TIME_LABELS[data.bestTime] || data.bestTime);
    if (data.additionalInfo) html += reviewRow('Additional Info', data.additionalInfo);
    html += '</dl>';
    container.innerHTML = html;
  }

  function init() {
    if (typeof document === 'undefined') return;
    const form = document.querySelector('#enquiry-form');
    if (!form) return;

    const icons = (window.Giantfuse && window.Giantfuse.Icons) || {};
    const personaGrid = document.querySelector('#persona-grid');
    const solutionList = document.querySelector('#solution-checklist');
    if (personaGrid) renderPersonaGrid(personaGrid, icons);
    if (solutionList) renderSolutionChecklist(solutionList, icons);

    const steps = [...document.querySelectorAll('.enquiry-step')];
    const phases = [...document.querySelectorAll('.enquiry-phase')];
    const reviewContainer = document.querySelector('#enquiry-review');
    const successPanel = document.querySelector('#enquiry-success');
    let currentStep = 1;
    let maxCompletedStep = 0;

    function goToStep(n) {
      if (n > maxCompletedStep + 1) return;
      currentStep = n;
      phases.forEach((phase) => {
        phase.classList.toggle('is-active', Number(phase.dataset.phase) === n);
      });
      steps.forEach((step) => {
        const stepNum = Number(step.dataset.step);
        step.classList.toggle('is-active', stepNum === n);
        step.classList.toggle('is-complete', stepNum <= maxCompletedStep && stepNum !== n);
        const marker = step.querySelector('.enquiry-step-marker');
        if (marker) marker.disabled = stepNum > maxCompletedStep;
      });
      if (n === 3 && reviewContainer) {
        renderReview(readFormData(form), reviewContainer);
      }
    }

    form.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]');
      if (!action) return;
      if (action.dataset.action === 'next') {
        if (currentStep === 1 && !validatePhase1(form)) return;
        if (currentStep === 2 && !validatePhase2(form)) return;
        maxCompletedStep = Math.max(maxCompletedStep, currentStep);
        goToStep(currentStep + 1);
      } else if (action.dataset.action === 'back') {
        goToStep(currentStep - 1);
      }
    });

    steps.forEach((step) => {
      const marker = step.querySelector('.enquiry-step-marker');
      if (!marker) return;
      marker.addEventListener('click', () => goToStep(Number(step.dataset.step)));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      form.hidden = true;
      if (successPanel) successPanel.hidden = false;
    });

    if (successPanel) {
      const resetBtn = successPanel.querySelector('[data-action="reset"]');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          form.reset();
          form.hidden = false;
          successPanel.hidden = true;
          document.querySelectorAll('.field-group.has-error').forEach((g) => g.classList.remove('has-error'));
          document.querySelectorAll('.field-error').forEach((e) => { e.hidden = true; });
          maxCompletedStep = 0;
          goToStep(1);
        });
      }
    }

    goToStep(1);
  }

  const api = { isValidEmailFormat, isPhase1Valid, isPhase2Valid, init };

  if (typeof window !== 'undefined') {
    window.Giantfuse = window.Giantfuse || {};
    window.Giantfuse.ContactForm = window.Giantfuse.ContactForm || {};
    Object.assign(window.Giantfuse.ContactForm, api);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})();
```

- [ ] **Step 2: Wire `ContactForm.init()` into `main.js`**

In `assets/js/main.js`, find this block inside `init()`:

```js
    syncNavbarHeight();
    if (window.Giantfuse && window.Giantfuse.Nav) window.Giantfuse.Nav.init();
```

Replace with:

```js
    syncNavbarHeight();
    if (window.Giantfuse && window.Giantfuse.Nav) window.Giantfuse.Nav.init();
    if (window.Giantfuse && window.Giantfuse.ContactForm) window.Giantfuse.ContactForm.init();
```

- [ ] **Step 3: Re-run the Task 3 validation tests to confirm they still pass**

```bash
node -e "
const { isValidEmailFormat, isPhase1Valid, isPhase2Valid } = require('./assets/js/contact-form.js');
const assert = require('assert');
assert.strictEqual(isValidEmailFormat('jane@acme.com'), true);
assert.strictEqual(isPhase1Valid({ persona: 'institutional', solutions: ['private-equity'], purpose: 'investment-opportunity' }), true);
assert.strictEqual(isPhase2Valid({ fullName: 'Jane Doe', workEmail: 'jane@acme.com', company: 'Acme' }), true);
console.log('OK: validation logic unchanged after DOM wiring added');
"
node --check assets/js/contact-form.js
node --check assets/js/main.js
```

Expected: `OK: validation logic unchanged after DOM wiring added`, then no output from either `node --check`.

- [ ] **Step 4: Verify the full happy path in the browser**

Navigate to `contact.html` (refresh if already open):

1. `javascript_tool`, evaluate: `JSON.stringify({personaCount: document.querySelectorAll('#persona-grid .persona-option').length, solutionCount: document.querySelectorAll('#solution-checklist .solution-option').length})` — expected `{"personaCount":5,"solutionCount":6}`.
2. Using `computer` (click/type): select the "Institutional Investor" persona card, check "Private Equity" and "Real Estate", select "Investment Opportunity" in the purpose dropdown, click "Next: Contact Details →".
3. `javascript_tool`, evaluate: `document.querySelector('#enquiry-phase-2').classList.contains('is-active')` — expected `true`.
4. Fill Full Name, Work Email (valid format), Company, select a Country, click "Review & Submit →".
5. `javascript_tool`, evaluate: `document.querySelector('#enquiry-phase-3').classList.contains('is-active')` — expected `true`. Screenshot the review screen — confirm it shows "Institutional Investor", "Private Equity, Real Estate", "Investment Opportunity", and the Phase 2 details entered.
6. Click "Submit Enquiry →".
7. `javascript_tool`, evaluate: `JSON.stringify({formHidden: document.querySelector('#enquiry-form').hidden, successHidden: document.querySelector('#enquiry-success').hidden})` — expected `{"formHidden":true,"successHidden":false}`.
8. `read_console_messages` with `onlyErrors: true` — expect no errors throughout.

- [ ] **Step 5: Verify the validation-blocking path in the browser**

Reload `contact.html` fresh, then:

1. Click "Next: Contact Details →" on Phase 1 without selecting anything.
2. `javascript_tool`, evaluate: `document.querySelector('#enquiry-phase-1').classList.contains('is-active')` — expected `true` (still blocked, did not advance). Screenshot — confirm the 3 error messages (persona/solutions/purpose) are now visible with gold-colored styling.

- [ ] **Step 6: Commit**

```bash
git add assets/js/contact-form.js assets/js/main.js
git commit -m "feat: wire up enquiry wizard step navigation, validation, review and submit"
```

---

## Task 8: Trust bar + office/map panel

**Files:**
- Modify: `contact.html` (append after the Investor Enquiry `</section>`, before `</main>`)
- Modify: `assets/css/pages/contact.css` (append)

**Interfaces:**
- Consumes: `ICONS.lock`, `ICONS.locationPin`, `ICONS.phone`, `ICONS.mail`, `ICONS.clock` (Task 1, static copies).
- Produces: the page's final two sections; no further tasks depend on this one.

- [ ] **Step 1: Append the two sections in `contact.html`**

Find:

```html
        </form>

        <div class="enquiry-success" id="enquiry-success" hidden>
          <div class="icon-badge enquiry-success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4,13 9,18 20,6"/></svg></div>
          <h3>Thank you &mdash; your enquiry has been received.</h3>
          <p>A member of our team will be in touch within 1 business day.</p>
          <button type="button" class="btn btn-outline" data-action="reset">Submit another enquiry</button>
        </div>
      </div>
    </section>
  </main>
```

Replace with:

```html
        </form>

        <div class="enquiry-success" id="enquiry-success" hidden>
          <div class="icon-badge enquiry-success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4,13 9,18 20,6"/></svg></div>
          <h3>Thank you &mdash; your enquiry has been received.</h3>
          <p>A member of our team will be in touch within 1 business day.</p>
          <button type="button" class="btn btn-outline" data-action="reset">Submit another enquiry</button>
        </div>
      </div>
    </section>

    <section class="trust-bar" data-reveal>
      <div class="container trust-bar-grid">
        <div class="trust-item">
          <div class="icon-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11 V7.5 C8 5 9.8 3.5 12 3.5 C14.2 3.5 16 5 16 7.5 V11"/></svg></div>
          <div>
            <h4>Your information is secure and confidential.</h4>
            <p>We respect your privacy and will only use your information to respond to your enquiry.</p>
          </div>
        </div>
        <div class="trust-item">
          <div>
            <h4>Have a general question?</h4>
            <p>Reach us directly at <a href="mailto:info@gcapitalpartners.co.za">info@gcapitalpartners.co.za</a> or +27 72 416 6083.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="office-section" data-reveal>
      <div class="office-grid">
        <div class="office-panel">
          <h3>Sandton Office</h3>
          <p class="office-line"><span class="icon-badge icon-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21 C12 21 5 14 5 9 C5 5.5 8.1 3 12 3 C15.9 3 19 5.5 19 9 C19 14 12 21 12 21 Z"/><circle cx="12" cy="9" r="2.3"/></svg></span>155 West Street<br>Sandton, Johannesburg, 2196<br>South Africa</p>
          <p class="office-line"><span class="icon-badge icon-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 3.5 C7.5 3.5 8 4 8.5 5.5 L9.5 8 C9.8 8.8 9.6 9.5 9 10 L7.8 11 C8.5 13 10.9 15.4 13 16.2 L14 15 C14.5 14.4 15.2 14.2 16 14.5 L18.5 15.5 C20 16 20.5 16.5 20.5 17.5 C20.5 19.5 18.8 21 17 21 C11.5 21 3 12.5 3 7 C3 5.2 4.5 3.5 6.5 3.5 Z"/></svg></span>+27 72 416 6083</p>
          <p class="office-line"><span class="icon-badge icon-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M4 6.5 L12 13 L20 6.5"/></svg></span>info@gcapitalpartners.co.za</p>
          <p class="office-line"><span class="icon-badge icon-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7 L12 12 L15.5 14"/></svg></span>Monday &ndash; Friday<br>08:30 &ndash; 17:00 SAST</p>
        </div>
        <div class="office-map">
          <iframe
            src="https://www.google.com/maps?q=155+West+Street,+Sandton,+Johannesburg,+South+Africa&output=embed"
            loading="lazy"
            title="Map showing Giantfuse Capital Partners' Sandton office location"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>
    </section>
  </main>
```

- [ ] **Step 2: Append to `assets/css/pages/contact.css`**

```css
.trust-bar { background: var(--color-light-gray); padding: var(--space-48) 0; }
.trust-bar-grid { display: grid; grid-template-columns: 1fr; gap: var(--space-32); }
@media (min-width: 641px) { .trust-bar-grid { grid-template-columns: 1fr 1fr; } }
.trust-item { display: flex; gap: var(--space-16); align-items: flex-start; }
.trust-item h4 { margin-bottom: var(--space-8); font-size: 1rem; }
.trust-item p { font-size: 0.9rem; }
.trust-item a { color: var(--color-teal); font-weight: 600; }

.office-section { display: block; }
.office-grid { display: grid; grid-template-columns: 1fr; }
@media (min-width: 768px) { .office-grid { grid-template-columns: 1fr 1.3fr; min-height: 360px; } }
.office-panel { background: var(--color-navy); color: var(--color-white); padding: var(--space-48) var(--space-32); }
.office-panel h3 { color: var(--color-white); margin-bottom: var(--space-24); }
.office-line { display: flex; align-items: flex-start; gap: var(--space-12); color: var(--color-light-gray); margin-bottom: var(--space-20); font-size: 0.9rem; }
.office-line .icon-badge { flex-shrink: 0; width: 32px; height: 32px; border-color: var(--color-steel-teal); color: var(--color-sea-glass); }
.office-line .icon-badge svg { width: 16px; height: 16px; }
.office-map { min-height: 280px; }
@media (min-width: 768px) { .office-map { min-height: 100%; } }
.office-map iframe { width: 100%; height: 100%; min-height: 280px; border: 0; display: block; }
```

- [ ] **Step 3: Verify in the browser**

Navigate to `contact.html` (refresh if already open), then:

1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. `javascript_tool`, evaluate:
   ```js
   JSON.stringify({
     trustItemCount: document.querySelectorAll('.trust-item').length,
     mailtoHref: document.querySelector('.trust-item a')?.getAttribute('href'),
     officeLineCount: document.querySelectorAll('.office-line').length,
     mapSrc: document.querySelector('.office-map iframe')?.getAttribute('src')
   })
   ```
   Expected: `trustItemCount` is `2`, `mailtoHref` is `"mailto:info@gcapitalpartners.co.za"`, `officeLineCount` is `4`, `mapSrc` starts with `"https://www.google.com/maps?q="`.
3. Take a screenshot to confirm the dark office panel and map render side-by-side (desktop) and the map iframe actually loads a visible map (not a blank/error frame).

- [ ] **Step 4: Commit**

```bash
git add contact.html assets/css/pages/contact.css
git commit -m "feat: add trust bar and office/map panel"
```

---

## Task 9: Full-page regression check and merge

**Files:** None expected — this task verifies the finished page and fixes anything the checks below surface.

**Interfaces:**
- Consumes: the fully assembled `contact.html` from Tasks 1–8.
- Produces: `contact.html` merged into `main` and pushed to `origin`.

- [ ] **Step 1: Full click-through and responsive check**

Using the Claude Browser MCP tools on `contact.html`:

1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. Repeat the full happy-path click-through from Task 7 Step 4 once more end-to-end (this confirms Task 8's additions didn't break anything above them in the DOM/JS).
3. `resize_window` to `preset: "mobile"` — screenshot the persona grid (should stack to 1 column), the solution checklist, the step indicator, and the office/map panel (should stack vertically). Confirm no horizontal overflow.
4. `resize_window` back to `preset: "desktop"`.
5. Navigate to `index.html`, `about.html`, `strategies.html`, and `leadership.html` in turn, running `read_console_messages` with `onlyErrors: true` on each — confirm the shared `main.js` change (the new `ContactForm.init()` call) doesn't throw or interfere on pages without an enquiry form (expect no errors, since `init()` returns early when `#enquiry-form` is absent).

If any check fails, fix the underlying file and re-run the failing check before proceeding.

- [ ] **Step 2: Final commit for any fixes**

Only if Step 1 required changes:

```bash
git add -A
git commit -m "fix: address Contact page regression check findings"
```

- [ ] **Step 3: Merge to main and push**

```bash
cd "C:\Users\Neo\OneDrive\Documents\HIMARK SGC\Giantfuse\giantfusecapital-site"
git checkout main
git pull
git merge --no-edit feat/contact-page
node --check assets/js/main.js
node --check assets/js/contact-form.js
git push origin main
git branch -d feat/contact-page
```

Expected: merge succeeds (resolve any conflict with `origin/main` if it has moved since the branch was created — check what changed before resolving, same as done for the Leadership branch), both `node --check` commands produce no output, push succeeds, branch deleted locally.
