# Leadership Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `leadership.html` — the Leadership Team + Investment Committee marketing page for Giantfuse Capital Partners — per the approved design spec.

**Architecture:** Static HTML page reusing the existing fetch-include navbar/footer, shared hero/closing-cta CSS, and a new `data/leadership.json` rendered via a new `renderLeadership()` function in `main.js` using the project's existing `<template>` + `renderCards()` pattern. No build tool, no new dependencies.

**Tech Stack:** Plain HTML/CSS/JS. Google Fonts (Space Grotesk + Lato, already loaded project-wide). No test framework — verification is `node --check`/`node -e` for JS syntax and pure-logic checks, plus live browser checks via the Claude Browser MCP tools for everything DOM-related.

## Global Constraints

- No build tool, bundler, framework, or npm dependency may be introduced.
- Headings use Space Grotesk, body text uses Lato — no serif fonts.
- Every interior page's hero uses `.hero.hero-banner` (not full `100vh` like Home).
- Every change must be committed to git; the final task pushes to `origin/main` at `https://github.com/neomatime/giantfusecapital.git` (standing project instruction).
- Reuse existing CSS classes/patterns wherever they already cover the need (`.card`, `.grid-4`, `.platform-stats`, `.closing-cta`, `.section-heading`/`.section-heading-row`, `.eyebrow`, `.btn`) — only add new CSS for things genuinely new to this page (avatar placeholders, committee row layout).
- Spec reference: `docs/superpowers/specs/2026-07-18-leadership-page-design.md`.

---

## Task 1: Leadership content data

**Files:**
- Create: `data/leadership.json`

**Interfaces:**
- Produces: a JSON object `{ team: Array<{name, title, bio, initials, linkedin}>, committee: Array<{name, title, bio, initials}> }`, 4 entries in each array. This exact shape is consumed by `renderLeadership()` in Task 3.

- [ ] **Step 1: Create the git branch**

```bash
cd "C:\Users\Neo\OneDrive\Documents\HIMARK SGC\Giantfuse\giantfusecapital-site"
git checkout -b feat/leadership-page
```

Expected: `Switched to a new branch 'feat/leadership-page'`

- [ ] **Step 2: Write `data/leadership.json`**

```json
{
  "team": [
    {
      "name": "Tebogo Mkhize",
      "title": "Chief Executive Officer",
      "bio": "Over 20 years of experience in private equity and investment management. Previously held senior roles at leading investment firms in South Africa.",
      "initials": "TM",
      "linkedin": "#"
    },
    {
      "name": "Michael van der Merwe",
      "title": "Chief Investment Officer",
      "bio": "25+ years' experience in portfolio management, alternative investments and capital allocation across global markets.",
      "initials": "MM",
      "linkedin": "#"
    },
    {
      "name": "Nolitha Dlamini",
      "title": "Head: Real Assets",
      "bio": "Specialist in real estate and infrastructure investments with extensive experience in asset acquisition and development.",
      "initials": "ND",
      "linkedin": "#"
    },
    {
      "name": "David Rossouw",
      "title": "Head: Credit & Insurance",
      "bio": "Expert in private credit and insurance investments with a focus on risk management and capital preservation.",
      "initials": "DR",
      "linkedin": "#"
    }
  ],
  "committee": [
    {
      "name": "John Mayers",
      "title": "Chairman",
      "bio": "Former CEO with extensive experience in financial services and governance.",
      "initials": "JM"
    },
    {
      "name": "Karen Combrinck",
      "title": "Independent Member",
      "bio": "Corporate governance specialist and former non-executive director.",
      "initials": "KC"
    },
    {
      "name": "Sipho Maseko",
      "title": "Independent Member",
      "bio": "Expert in risk management and financial regulation with 30+ years' experience.",
      "initials": "SM"
    },
    {
      "name": "James Patel",
      "title": "Independent Member",
      "bio": "Investment banking veteran with deep expertise in capital markets.",
      "initials": "JP"
    }
  ]
}
```

- [ ] **Step 3: Verify the JSON is valid and complete**

Run (from the project root):

```bash
node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync('data/leadership.json','utf8')); if(data.team.length!==4) throw new Error('expected 4 team members, got '+data.team.length); if(data.committee.length!==4) throw new Error('expected 4 committee members, got '+data.committee.length); ['name','title','bio','initials','linkedin'].forEach(f=>{data.team.forEach(m=>{if(!(f in m)) throw new Error('team member missing field '+f);});}); ['name','title','bio','initials'].forEach(f=>{data.committee.forEach(m=>{if(!(f in m)) throw new Error('committee member missing field '+f);});}); console.log('OK: leadership.json valid');"
```

Expected: `OK: leadership.json valid`

- [ ] **Step 4: Commit**

```bash
git add data/leadership.json
git commit -m "feat: add leadership page content data"
```

---

## Task 2: Page shell — hero, stats band, closing CTA

**Files:**
- Create: `leadership.html`

**Interfaces:**
- Consumes: existing shared CSS (`global.css`, `typography.css`, `navigation.css`, `footer.css`, `components.css`, `animationa.css`, `shared-sections.css`), existing shared JS (`counters.js`, `scroll-effects.js`, `navigation.js`, `main.js`), existing `fetchInclude`/`includeStatic` via `data-include` divs.
- Produces: `leadership.html` with two HTML comment markers (`<!-- TASK 3: Leadership Team section -->` and `<!-- TASK 4: Investment Committee section -->`) inside `<main>` that Tasks 3 and 4 will replace with real markup.

- [ ] **Step 1: Write `leadership.html`**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leadership | Giantfuse Capital Partners</title>
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
  <link rel="stylesheet" href="assets/css/pages/leadership.css">
</head>
<body>
  <div data-include="navbar"></div>

  <section class="hero hero-banner" data-reveal>
    <div class="hero-media">
      <img src="assets/images/pexels-teyi-528835508-17351599.jpg" alt="Glass office towers converging upward against a cloudy sky" loading="eager">
    </div>
    <div class="hero-overlay"></div>
    <div class="hero-copy">
      <span class="eyebrow">Leadership</span>
      <h1>Experience. Expertise. <span class="text-teal">Alignment.</span></h1>
      <p>Our leadership team brings together decades of investment experience, deep sector knowledge and a shared commitment to delivering long-term value for our investors.</p>
    </div>
  </section>

  <main>
    <!-- TASK 3: Leadership Team section -->

    <section class="section" data-reveal>
      <div class="container">
        <div class="section-heading">
          <h2>Leadership Backed by <span class="text-teal">Deep Experience</span></h2>
          <p>Our team combines investment expertise with strong governance and a culture of accountability to deliver consistent results.</p>
        </div>
        <div class="platform-stats">
          <div class="platform-stat">
            <div class="icon-badge icon-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><circle cx="17" cy="9" r="2.3"/><path d="M15.8 14.2c2.6.2 4.7 2.1 4.7 4.8"/></svg></div>
            <strong>80+</strong>
            <span>Years of Combined Investment Experience</span>
          </div>
          <div class="platform-stat">
            <div class="icon-badge icon-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="19" x2="5" y2="13"/><line x1="12" y1="19" x2="12" y2="9"/><line x1="19" y1="19" x2="19" y2="5"/><line x1="3" y1="19" x2="21" y2="19"/></svg></div>
            <strong>100+</strong>
            <span>Combined Transactions Executed</span>
          </div>
          <div class="platform-stat">
            <div class="icon-badge icon-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg></div>
            <strong>4</strong>
            <span>Core Investment Strategies</span>
          </div>
          <div class="platform-stat">
            <div class="icon-badge icon-badge-outline"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 L20 6 V11 C20 16 16.5 19.5 12 21 C7.5 19.5 4 16 4 11 V6 Z"/><path d="M8.5 12 L11 14.5 L16 9"/></svg></div>
            <strong>Aligned</strong>
            <span>Invested Alongside Our Clients</span>
          </div>
        </div>
      </div>
    </section>

    <!-- TASK 4: Investment Committee section -->

    <section class="closing-cta" data-reveal>
      <div class="container closing-cta-inner">
        <div class="closing-cta-mark">&#9686;</div>
        <div>
          <h3>Strong Leadership. Disciplined Approach. <span class="text-teal">Sustainable Outcomes.</span></h3>
          <p>Our leadership team is committed to disciplined governance and sustainable, long-term outcomes for our investors and partners.</p>
        </div>
        <a href="contact.html" class="btn btn-outline">Contact Investor Relations &rarr;</a>
      </div>
    </section>
  </main>

  <div data-include="footer"></div>

  <script src="assets/js/counters.js"></script>
  <script src="assets/js/scroll-effects.js"></script>
  <script src="assets/js/navigation.js"></script>
  <script src="assets/js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create an empty page-specific stylesheet so the `<link>` in Step 1 doesn't 404**

Create `assets/css/pages/leadership.css` with no content yet (Task 3 will populate it):

```css
/* Leadership page styles — populated in Task 3 and Task 4 */
```

- [ ] **Step 3: Verify the page loads cleanly in the browser**

Using the Claude Browser MCP tools: `preview_start` with `{name: "giantfuse"}` (or navigate the existing tab to the dev server's `leadership.html`), then:

1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. `javascript_tool`, evaluate:
   ```js
   JSON.stringify({
     title: document.title,
     eyebrow: document.querySelector('.hero .eyebrow')?.textContent,
     h1: document.querySelector('.hero h1')?.textContent.trim(),
     statCount: document.querySelectorAll('.platform-stat').length,
     ctaHref: document.querySelector('.closing-cta a')?.getAttribute('href'),
     navActive: document.querySelector('.navbar-links a.active')?.textContent
   })
   ```
   Expected: `title` is `"Leadership | Giantfuse Capital Partners"`, `eyebrow` is `"Leadership"`, `h1` contains `"Experience. Expertise. Alignment."`, `statCount` is `4`, `ctaHref` is `"contact.html"`, `navActive` is `"Leadership"`.

- [ ] **Step 4: Commit**

```bash
git add leadership.html assets/css/pages/leadership.css
git commit -m "feat: add Leadership page shell with hero, stats band and closing CTA"
```

---

## Task 3: Leadership Team section (data-driven cards)

**Files:**
- Modify: `leadership.html` (replace the `<!-- TASK 3: Leadership Team section -->` comment)
- Modify: `assets/js/main.js` (add `renderLeadership()`, call it from `init()`)
- Modify: `assets/css/pages/leadership.css` (add avatar/card styles)

**Interfaces:**
- Consumes: `data/leadership.json` (Task 1), `renderCards(template, items, container, fill)` (existing, in `main.js`).
- Produces: `renderLeadership()` in `main.js`, exported via `window.Giantfuse` is not required (it's only called from `init()` internally, matching `renderStrategies`/`renderStatistics`/`renderInsights`/`renderStrategyDetails` which are also not separately exported). This function already contains the Investment Committee rendering branch (guarded so it's a safe no-op until Task 4 adds `#committee-grid`/`#committee-member-template` to the HTML) — Task 4 does **not** need to touch `main.js`.

- [ ] **Step 1: Replace the Task 3 marker in `leadership.html`**

Replace this line:

```html
    <!-- TASK 3: Leadership Team section -->
```

with:

```html
    <section class="section" data-reveal>
      <div class="container">
        <div class="section-heading-row">
          <div>
            <h2>Our <span class="text-teal">Leadership</span> Team</h2>
            <p>A hands-on leadership team with a proven track record across private markets and alternative investments.</p>
          </div>
          <a href="#investment-committee" class="btn btn-outline">View Investment Committee &rarr;</a>
        </div>
        <div class="grid-4" id="leader-grid"></div>
      </div>
      <template id="leader-card-template">
        <div class="card leader-card" data-reveal>
          <div class="card-media avatar-placeholder"><span data-field="initials"></span></div>
          <div class="card-body">
            <h3 data-field="name"></h3>
            <p class="leader-title" data-field="title"></p>
            <p data-field="bio"></p>
            <a href="#" class="card-link leader-linkedin" data-field="linkedin" aria-label="LinkedIn profile">in</a>
          </div>
        </div>
      </template>
    </section>
```

- [ ] **Step 2: Add `renderLeadership()` to `assets/js/main.js`**

Add this function after `renderStrategyDetails()` (around line 150, right before `scrollToHash()`):

```js
  async function renderLeadership() {
    const teamContainer = document.querySelector('#leader-grid');
    const teamTemplate = document.querySelector('#leader-card-template');
    const committeeContainer = document.querySelector('#committee-grid');
    const committeeTemplate = document.querySelector('#committee-member-template');
    if (!teamContainer && !committeeContainer) return;
    const response = await fetch('data/leadership.json');
    if (!response.ok) throw new Error('Failed to load data: data/leadership.json');
    const data = await response.json();
    if (teamContainer && teamTemplate) {
      renderCards(teamTemplate, data.team, teamContainer, (node, item) => {
        node.querySelector('[data-field="initials"]').textContent = item.initials;
        node.querySelector('[data-field="name"]').textContent = item.name;
        node.querySelector('[data-field="title"]').textContent = item.title;
        node.querySelector('[data-field="bio"]').textContent = item.bio;
        node.querySelector('[data-field="linkedin"]').setAttribute('href', item.linkedin);
      });
    }
    if (committeeContainer && committeeTemplate) {
      renderCards(committeeTemplate, data.committee, committeeContainer, (node, item) => {
        node.querySelector('[data-field="initials"]').textContent = item.initials;
        node.querySelector('[data-field="name"]').textContent = item.name;
        node.querySelector('[data-field="title"]').textContent = item.title;
        node.querySelector('[data-field="bio"]').textContent = item.bio;
      });
    }
  }
```

- [ ] **Step 3: Wire `renderLeadership()` into `init()`**

In `assets/js/main.js`, find this block inside `init()`:

```js
    try {
      await renderStrategies();
      await renderStatistics();
      await renderInsights();
      await renderStrategyDetails();
    } catch (error) {
```

Replace with:

```js
    try {
      await renderStrategies();
      await renderStatistics();
      await renderInsights();
      await renderStrategyDetails();
      await renderLeadership();
    } catch (error) {
```

- [ ] **Step 4: Verify JS syntax**

```bash
node --check assets/js/main.js
```

Expected: no output (success).

- [ ] **Step 5: Write `assets/css/pages/leadership.css`**

Replace the file's placeholder comment with:

```css
.section-heading-row > div:first-child p { margin-top: var(--space-8); max-width: 520px; }

.avatar-placeholder span {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 2.5rem;
  color: var(--color-white);
  text-transform: none;
  letter-spacing: normal;
}

.leader-title {
  font-size: 0.85rem;
  color: var(--color-teal);
  font-weight: 600;
  margin-bottom: var(--space-12);
}

.leader-card .leader-linkedin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--color-teal);
  margin-top: var(--space-8);
}
```

- [ ] **Step 6: Verify in the browser**

Navigate to `leadership.html` (or refresh if already open), then:

1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. `javascript_tool`, evaluate:
   ```js
   JSON.stringify([...document.querySelectorAll('#leader-grid .leader-card')].map(card => ({
     initials: card.querySelector('[data-field="initials"]').textContent,
     name: card.querySelector('[data-field="name"]').textContent,
     title: card.querySelector('[data-field="title"]').textContent,
     linkedinHref: card.querySelector('[data-field="linkedin"]').getAttribute('href')
   })))
   ```
   Expected: 4 entries, first is `{"initials":"TM","name":"Tebogo Mkhize","title":"Chief Executive Officer","linkedinHref":"#"}`, and the other 3 match the Task 1 data (Michael van der Merwe/MM, Nolitha Dlamini/ND, David Rossouw/DR).
3. Click the "View Investment Committee" button (`computer` tool) — confirm it doesn't throw a JS error (the target section doesn't exist until Task 4, so the browser will just not scroll; this is expected and acceptable at this point in the build).

- [ ] **Step 7: Commit**

```bash
git add leadership.html assets/js/main.js assets/css/pages/leadership.css
git commit -m "feat: add data-driven Leadership Team section"
```

---

## Task 4: Investment Committee section

**Files:**
- Modify: `leadership.html` (replace the `<!-- TASK 4: Investment Committee section -->` comment)
- Modify: `assets/css/pages/leadership.css` (add committee row styles)

**Interfaces:**
- Consumes: `renderLeadership()`'s existing committee-rendering branch from Task 3 (already handles `#committee-grid`/`#committee-member-template` — no `main.js` changes needed here), `data/leadership.json`'s `committee` array (Task 1).
- Produces: a fully populated `#investment-committee` section that the "View Investment Committee" button (Task 3) scrolls to.

- [ ] **Step 1: Replace the Task 4 marker in `leadership.html`**

Replace this line:

```html
    <!-- TASK 4: Investment Committee section -->
```

with:

```html
    <section class="section" id="investment-committee" data-reveal>
      <div class="container">
        <div class="section-heading">
          <h2>Investment <span class="text-teal">Committee</span></h2>
          <p>The Investment Committee provides oversight and guidance on all investment activities, ensuring disciplined decision-making and strong governance.</p>
        </div>
        <div class="grid-4" id="committee-grid"></div>
      </div>
      <template id="committee-member-template">
        <div class="committee-member" data-reveal>
          <div class="committee-member-header">
            <div class="committee-avatar"><span data-field="initials"></span></div>
            <div>
              <h4 data-field="name"></h4>
              <p class="leader-title" data-field="title"></p>
            </div>
          </div>
          <p data-field="bio"></p>
        </div>
      </template>
    </section>
```

- [ ] **Step 2: Add committee styles to `assets/css/pages/leadership.css`**

Append:

```css
#investment-committee {
  scroll-margin-top: calc(var(--navbar-height) + var(--space-16));
}

.committee-member-header {
  display: flex;
  align-items: center;
  gap: var(--space-12);
  margin-bottom: var(--space-12);
}

.committee-avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-sea-glass), var(--color-steel-teal));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.committee-avatar span {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-white);
}

.committee-member h4 { margin-bottom: var(--space-4); }
.committee-member .leader-title { margin-bottom: 0; }
.committee-member p { font-size: 0.85rem; }
```

- [ ] **Step 3: Verify in the browser**

Navigate to `leadership.html` (refresh if already open), then:

1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. `javascript_tool`, evaluate:
   ```js
   JSON.stringify([...document.querySelectorAll('#committee-grid .committee-member')].map(m => ({
     initials: m.querySelector('[data-field="initials"]').textContent,
     name: m.querySelector('[data-field="name"]').textContent,
     title: m.querySelector('[data-field="title"]').textContent
   })))
   ```
   Expected: 4 entries matching Task 1's committee data (John Mayers/Chairman/JM, Karen Combrinck/Independent Member/KC, Sipho Maseko/Independent Member/SM, James Patel/Independent Member/JP).
3. Click the "View Investment Committee" button (`computer` tool) and confirm the page scrolls so the `#investment-committee` heading is visible below the navbar (not hidden underneath it).

- [ ] **Step 4: Commit**

```bash
git add leadership.html assets/css/pages/leadership.css
git commit -m "feat: add Investment Committee section"
```

---

## Task 5: Full-page regression check and merge

**Files:** None expected — this task verifies the finished page and fixes anything the checks below surface.

**Interfaces:**
- Consumes: the fully assembled `leadership.html` from Tasks 1–4.
- Produces: `leadership.html` merged into `main` and pushed to `origin`.

- [ ] **Step 1: Full click-through and responsive check**

Using the Claude Browser MCP tools on `leadership.html`:

1. `read_console_messages` with `onlyErrors: true` — expect no errors.
2. `javascript_tool`, evaluate to confirm no other page's nav/footer regressed:
   ```js
   JSON.stringify({
     navCount: document.querySelectorAll('.navbar-links a').length,
     footerLinkCount: document.querySelectorAll('.footer-grid a').length,
     leaderCount: document.querySelectorAll('#leader-grid .leader-card').length,
     committeeCount: document.querySelectorAll('#committee-grid .committee-member').length
   })
   ```
   Expected: `navCount: 6`, `footerLinkCount: 10`, `leaderCount: 4`, `committeeCount: 4`.
3. `resize_window` to `preset: "mobile"` and take a `computer` screenshot of the Leadership Team grid and Investment Committee section — confirm cards/rows stack to a single column and remain readable (no overflow/clipping).
4. `resize_window` back to `preset: "desktop"`.
5. Navigate to `index.html` and `about.html` in turn, run `read_console_messages` with `onlyErrors: true` on each — confirm the shared navbar/footer changes from this branch didn't regress either page (expect no errors, `Leadership` nav link present and pointing to `leadership.html`).

If any check fails, fix the underlying file and re-run the failing check before proceeding.

- [ ] **Step 2: Final commit for any fixes**

Only if Step 1 required changes:

```bash
git add -A
git commit -m "fix: address Leadership page regression check findings"
```

- [ ] **Step 3: Merge to main and push**

```bash
cd "C:\Users\Neo\OneDrive\Documents\HIMARK SGC\Giantfuse\giantfusecapital-site"
git checkout main
git merge --ff-only feat/leadership-page
git push origin main
git branch -d feat/leadership-page
```

Expected: fast-forward merge succeeds (no conflicts, since `feat/leadership-page` branched directly off `main` and `main` hasn't moved), push succeeds, branch deleted locally.
