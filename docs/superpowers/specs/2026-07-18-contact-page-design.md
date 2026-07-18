# Contact Page — Design Spec

Date: 2026-07-18
Status: Approved for planning

## Purpose

Build `contact.html`, the fifth marketing page for Giantfuse Capital Partners, per `docs/wireframes/contact.png`. Unlike every prior page (read-only content rendered from JSON), this page is the site's first interactive component: a 3-step investor-enquiry form wizard. Follows the same architecture established by Home/About/Strategies/Leadership wherever it applies (plain HTML/CSS/JS, fetch-include navbar/footer, `.hero.hero-banner` convention), plus new patterns specific to a stateful form.

## Architecture decisions

**No backend exists yet — front-end only.** Per user decision, this page builds the complete multi-step wizard UI/UX (step transitions, validation, a review screen that reads back everything entered) but the final "Submit" does not transmit data anywhere. It swaps the form area for a client-side confirmation state. Real submission (a form-backend service, or a custom API) is out of scope for this build and can be wired in later without changing the wizard's structure — only the submit handler's implementation changes.

**Map: real embedded Google Maps `<iframe>`.** Per user decision, unlike About's abstract "Geographic Footprint" placeholder, the office-location map uses a plain `<iframe src="https://www.google.com/maps?q=...&output=embed">` pointed at the office address. This requires no API key and stays within the "no build tool / no dependencies" constraint (it's a static embed URL, not a JS SDK).

**New dedicated JS file: `assets/js/contact-form.js`.** This is the first stateful, interactive component on the site — every other page only renders read-only JSON into templates via `main.js`. A 3-step wizard (shared state across steps, per-step validation, a review step that reads back prior input, a submit handler) is a single cohesive unit and doesn't fit `main.js` (already 5 render functions across 4 pages) or split cleanly across files (the steps are too tightly coupled). Matches the project's existing one-concern-per-file convention (`counters.js`, `navigation.js`, `scroll-effects.js`).

`contact-form.js` follows the established file pattern: an IIFE exposing `window.Giantfuse.ContactForm = { init, ... }`, plus a `module.exports` branch for Node-testability. Its `init()` is called explicitly from `main.js`'s `init()` (same pattern as `window.Giantfuse.Nav.init()`), guarded so it's a no-op on every other page:

```js
if (window.Giantfuse && window.Giantfuse.ContactForm) window.Giantfuse.ContactForm.init();
```

**Validation logic is pure and unit-testable.** Unlike the rest of the site's JS (mostly DOM-coupled render functions), the wizard's per-step validation rules are written as plain functions that take a data object and return a boolean/error list — no DOM access. This lets them be tested with `node -e` (the project's established pattern for pure logic, e.g. `counters.js`'s `formatAtProgress`) instead of only via live-browser interaction. DOM-reading (turning form inputs into that plain data object) is a separate, thin function.

**Form state lives in the native DOM elements — no parallel JS state object.** Persona/solutions/contact-preference use real `<input type="radio">`/`<input type="checkbox">` (visually styled as cards/buttons via a sibling-selector CSS pattern, native elements kept accessible but visually hidden), so the form's own elements are the single source of truth. The review step reads current values directly (via `FormData` / direct element reads) rather than syncing a separate state object — avoids two-way-sync bugs. The only piece of controller state needed is the current step number and which steps have been completed (for the clickable step indicator).

**No JSON data file.** The wizard's configuration (persona options, solution options, dropdown option lists) is page-specific UI configuration, not content reused elsewhere or content awaiting real data later — per the project's established data-approach convention, this stays as static arrays inside `contact-form.js`, not `/data/`.

**4 new icons added to `main.js`'s shared `ICONS` map:** `phone`, `mail`, `clock`, `lock` — none of the existing 16 icons cover "Call Us", "Email Us", "Office Hours", or the trust-bar's security lock. Same visual style as the existing set (24×24 viewBox, `stroke="currentColor"`, `stroke-width="1.5"`, round caps/joins).

## Page structure

### 1. Hero (`.hero.hero-banner`)
- Eyebrow: "Contact Us"
- Headline: `Let's Build What's Next, <span class="text-teal">Together.</span>`
- Paragraph: "We partner with institutions, family offices and qualified investors to deliver disciplined investment solutions that create long-term value."
- Photo: `assets/images/pexels-kathan-modi-261434930-16876265.jpg` — the darker, dramatic tall-tower shot, distinct from every hero used on prior pages and a better tonal fit for a "closing a partnership" page than the remaining brighter option (`pexels-blackphant-20884565.jpg`, left unused).

### 2. Quick info bar
Reuses the `.platform-stats`-style horizontal-band visual language (new page-specific CSS, not a literal reuse since the content shape differs — icon + label + value, not icon + big-number + label) — 4 items:
- Icon `building` — "Our Office" — "155 West Street, Sandton, Johannesburg, South Africa" (matches footer's existing address exactly)
- Icon `phone` (new) — "Call Us" — "+27 72 416 6083" (matches footer's existing number)
- Icon `mail` (new) — "Email Us" — "info@gcapitalpartners.co.za" (matches footer's existing address)
- Icon `clock` (new) — "Office Hours" — "Monday – Friday, 08:30 – 17:00 SAST" (new info, not established elsewhere on the site)

### 3. Investor Enquiry wizard
Section heading: "Investor **Enquiry**" + intro paragraph: "To ensure we connect you with the right information and team, please complete our two-step enquiry process." (matches wireframe copy, despite there being 3 visible steps — "two-step" refers to the two data-entry phases before review, matching the wireframe's own wording).

**Step indicator** (`.enquiry-steps`, new component — visually similar to Strategies' `.approach-timeline` numbered-circles-on-a-line, but interactive): 3 steps — "1 Your Enquiry" / "2 Contact Details" / "3 Review & Submit" — each with a caption line matching the wireframe ("Tell us what you are looking for" / "Share your details so we can reach you" / "We'll be in touch shortly"). Current step: filled teal circle with white number. Completed steps: filled teal circle with `ICONS.checkmark`, clickable to jump back. Upcoming steps: outline circle, not clickable.

**`<form id="enquiry-form" novalidate>`** wraps all 3 phases. Phase containers are toggled via a `.is-active` class driven by the current-step state; only one phase is visible at a time. "Next"/"Back" are `<button type="button">`; the final submit is `<button type="submit">`, intercepted with `event.preventDefault()`.

**Phase 1 — "What are you enquiring about?"** (`PHASE 1 OF 2` badge, per wireframe)
- "Which best describes you?" — 5 persona cards, single-select radio group `name="persona"`: Institutional Investor (`institutional`, icon `building`), Family Office / Investment Group (`family-office`, icon `people`), High-Net-Worth Individual (`hnwi`, icon `target`), Intermediary / Advisor (`intermediary`, icon `magnifyingGlass`), Other (`other`, icon `lightbulb`).
- "What type of solution are you interested in?" — 6 checkboxes, multi-select `name="solutions"`: Private Equity (`private-equity`), Hedge Fund Solutions (`hedge-fund-solutions`), Real Estate (`real-estate`), Credit & Insurance (`credit-insurance`), Multi-Strategy Solutions (`multi-strategy`), Other (`other`).
- "What is the purpose of your enquiry?" — `<select id="purpose" name="purpose" required>`: Investment Opportunity (`investment-opportunity`), Partnership Enquiry (`partnership`), Media & Press (`media-press`), Careers (`careers`), General Question (`general-question`), Other (`other`).
- "Tell us more about your enquiry (optional)" — `<textarea id="enquiry-notes" name="enquiryNotes">`.
- Button: "Next: Contact Details →".
- **Validation to advance:** at least one persona selected, at least one solution selected, a purpose selected. Missing fields get a `--color-gold` error state (border + inline message) — the palette's one otherwise-unused token, repurposed as the site's validation-attention color since no error/red color exists in the current palette.

**Phase 2 — "Contact Details"** (`PHASE 2 OF 2` badge)
- Full Name* (`fullName`), Work Email* (`workEmail`, `type="email"`), Company / Organisation* (`company`), Job Title (`jobTitle`) — two-column field grid.
- Country* (`country`, `<select>`): South Africa (`za`), Botswana (`bw`), Kenya (`ke`), Mauritius (`mu`), Nigeria (`ng`), United Kingdom (`uk`), United States (`us`), United Arab Emirates (`ae`), Other (`other`).
- Phone Number (`phone`, `type="tel"`, optional) — static "+27" prefix label beside the input (visual only, not editable — matches the wireframe's fixed country-code display without building a full country-code picker).
- "How would you prefer to be contacted?" — 3-button radio group `name="contactPreference"`: Email (`email`, **default checked**, matches the wireframe's pre-highlighted state), Phone (`phone`), Either (`either`).
- "Best time to contact you" (`bestTime`, `<select>`, optional): Morning (08:00–12:00) (`morning`), Afternoon (12:00–17:00) (`afternoon`), Evening (after 17:00) (`evening`), Anytime (`anytime`).
- "Any additional information (optional)" — `<textarea id="additional-info" name="additionalInfo">`.
- Buttons: "← Back" (`btn-outline`, returns to Phase 1, preserves all entered data) and "Review & Submit →" (`btn-solid`).
- **Validation to advance:** Full Name, Work Email (basic format check — contains `@` and a `.` after it, not a full RFC regex), Company all non-empty. Same `--color-gold` error treatment as Phase 1.

**Phase 3 — "Review & Submit"** (no badge in wireframe, but same phase-card shell)
- Read-only summary of everything entered across Phase 1 and Phase 2, grouped under "Your Enquiry" and "Contact Details" sub-headings — label/value rows built by reading the form's current values when this phase becomes active (not by tracking a separate state object). Optional fields left empty are simply omitted from the summary (no "N/A" clutter).
- Buttons: "← Back" (`btn-outline`, returns to Phase 2) and "Submit Enquiry →" (`btn-solid`).
- **On submit:** the entire `#enquiry-form` (step indicator + all 3 phases) is replaced with a confirmation panel — checkmark icon, "Thank you — your enquiry has been received.", "A member of our team will be in touch within 1 business day.", and a "Submit another enquiry" link that resets all form fields and returns to Phase 1. Nothing is sent over the network; this is purely a client-side state change.

### 4. Trust bar
Simple 2-column band, light background, matching the site's existing simple icon+text band convention (e.g. About's purpose band):
- Left: icon `lock` (new) + "Your information is secure and confidential." + "We respect your privacy and will only use your information to respond to your enquiry."
- Right: "Have a general question?" + "Reach us directly at [info@gcapitalpartners.co.za](mailto:info@gcapitalpartners.co.za) or +27 72 416 6083." (mailto link matches the footer's existing `mailto:` convention for the email address).

### 5. Office + map panel
Two-column split section (matches wireframe's dark-panel-beside-map layout):
- Left (`.office-panel`, dark navy background matching `.closing-cta`'s tone): "Sandton Office" heading + address/phone/email/hours lines with icons (`locationPin`, `phone`, `mail`, `clock` — reusing the same 4 icons as the quick info bar), same values as established elsewhere on the site.
- Right (`.office-map`): `<iframe>` embedding `https://www.google.com/maps?q=155+West+Street,+Sandton,+Johannesburg,+South+Africa&output=embed`, `loading="lazy"`, with a descriptive `title` attribute for accessibility.

No closing-CTA band on this page — the enquiry form and office panel together already serve that role; a third "contact us" prompt after a page that *is* the contact form would be redundant.

## New CSS

New file `assets/css/pages/contact.css`, covering (all new — no prior page needed form/wizard styling):
- `.contact-info-bar` / `.contact-info-item` (quick info bar band)
- `.enquiry-steps` / `.enquiry-step` (+ `.is-active`/`.is-complete` states, connecting line)
- `.enquiry-phase` (+ `.is-active` visibility toggle), `.phase-badge`
- `.persona-grid` / `.persona-card` (visually-hidden radio + styled sibling label, `:checked` sibling-selector highlight)
- `.solution-checklist` (visually-hidden checkboxes + styled sibling labels)
- Generic form-field styling: `.field-group`, `.field-grid` (2-column on desktop), labeled `input`/`select`/`textarea` base styles (none exist anywhere on the site yet), `.field-error` (`--color-gold` treatment)
- `.contact-pref-group` (3-button radio row, same visually-hidden-input pattern)
- `.phone-field` (prefix label + input)
- `.enquiry-review` (label/value summary rows)
- `.enquiry-success` (confirmation panel, hidden by default)
- `.trust-bar`
- `.office-panel` / `.office-map` (split layout)

## Data flow

No JSON file. `contact-form.js` defines the option lists (persona, solutions, purpose, country, best-time) as local constants, renders Phase 1's persona cards and solution checkboxes from them at `init()` time (so the option lists exist in one place, not duplicated between JS and hand-written HTML) using the same `<template>`-clone approach as the rest of the site where practical — though given the small, fixed size of these lists (5 and 6 items) and the need for exact icon/value pairing, plain DOM construction (`document.createElement` in a loop) is acceptable here rather than forcing the fetch-a-template-partial pattern built for larger, page-spanning JSON collections.

Pure, unit-testable functions in `contact-form.js`:
- `isPhase1Valid(data)` — `data: {persona: string|null, solutions: string[], purpose: string}` → `boolean`
- `isPhase2Valid(data)` — `data: {fullName: string, workEmail: string, company: string}` → `boolean`
- `isValidEmailFormat(value)` — basic `@`/`.` check, `string` → `boolean`

DOM-coupled functions (not unit-tested, verified via live browser only, per project convention):
- `readFormData(form)` — `HTMLFormElement` → plain data object (used by both validation and the review step)
- `renderReview(data, container)` — populates the Phase 3 summary
- `goToStep(n)`, `advance()`, `back()`, `handleSubmit(event)`, `init()`

## Testing

Consistent with the rest of the project: no test framework.
- `node --check` on `contact-form.js` and the modified `main.js`.
- `node -e` one-liners exercising `isPhase1Valid`/`isPhase2Valid`/`isValidEmailFormat` against both passing and failing inputs (the project's first page to get real pure-logic unit coverage for its interactive behavior, not just static-content checks).
- Live browser checks for everything DOM-related: full click-through of both happy path (fill everything, advance through all 3 phases, submit, see confirmation) and validation path (try to advance with required fields empty, confirm it's blocked and error styling appears), responsive check, map iframe loads, no console errors.

## Out of scope

- Real form submission (backend/service integration) — front-end only per user decision; the submit handler is a clearly-isolated function so wiring in a real endpoint later doesn't require touching the wizard's step/validation logic.
- Full international phone-number formatting/country-code picker — a fixed "+27" prefix label only.
- Persisting form state across page reloads (e.g. `localStorage`) — not requested, not needed for a front-end-only demo flow.
- Server-side or even client-side rate-limiting/spam protection (e.g. CAPTCHA) — not applicable until real submission exists.
