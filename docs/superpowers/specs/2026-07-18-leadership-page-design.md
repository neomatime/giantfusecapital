# Leadership Page — Design Spec

Date: 2026-07-18
Status: Approved for planning

## Purpose

Build `leadership.html`, the fourth marketing page for Giantfuse Capital Partners, per `docs/wireframes/leadership.png`. Introduces the leadership team and Investment Committee to build investor trust. Follows the same architecture established by Home, About, and Strategies (plain HTML/CSS/JS, fetch-include navbar/footer, JSON-driven content where content will need future edits).

## Content sourcing decision

`data/leadership.json` and `assets/images/leadership/` currently exist but are empty — no real team photos or bios have been supplied yet. Per user decision, this page is built now with realistic placeholder content transcribed directly from the wireframe (names, titles, bios already drafted there), using initials-avatar placeholders instead of photos. Real photos and bios can be swapped in later by editing `data/leadership.json` and adding files to `assets/images/leadership/` — no HTML/JS changes required at that point.

## Page structure

### 1. Hero (`.hero.hero-banner`)
Matches the About/Strategies interior-page hero convention (not full `100vh` like Home).

- Eyebrow: "LEADERSHIP"
- Headline: `Experience. Expertise. <span class="text-teal">Alignment.</span>`
- Paragraph: "Our leadership team brings together decades of investment experience, deep sector knowledge and a shared commitment to delivering long-term value for our investors."
- Photo: `assets/images/pexels-teyi-528835508-17351599.jpg` (converging glass towers against clouds) — chosen because it's visually distinct from Home's and About's single-tower upward shots and Strategies' wide skyline shot, avoiding repetition across the site, and its "converging paths" composition fits the "Alignment" theme.

### 2. Leadership Team section
- Section heading: "Our **Leadership** Team"
- Intro paragraph: "A hands-on leadership team with a proven track record across private markets and alternative investments."
- Button (top-right, `.btn.btn-outline`): "View Investment Committee →" — in-page anchor link to `#investment-committee` (same page, no new JS needed beyond native anchor scroll since this content isn't dynamically rendered above the fold... see Data Flow note below).
- `.grid-4` of 4 leader cards, data-driven from `data/leadership.json`'s `team` array via a `<template>` + new `renderLeadership()` function in `main.js`, mirroring the existing `renderStrategyDetails()` pattern.

**Card layout** (new `.leader-card` modifier on existing `.card`):
- `.card-media` → initials avatar (new `.avatar-placeholder` class) filling the existing `.card-media` rectangular banner (matches the site's other card-media treatments on Strategies/Insights cards): teal/navy gradient background (`linear-gradient(135deg, var(--color-sea-glass), var(--color-steel-teal))`, matching existing `.card-media` gradient), large centered initials text. This is a rectangular tile, not a circle — see the Investment Committee section below for the distinct circular treatment used there.
- Name (`h3`)
- Title (small teal caption below name — new `.leader-title` rule visually matching the existing `.strategy-subtitle` treatment)
- Bio (one paragraph)
- LinkedIn icon link (`href="#"`, consistent with the footer's existing placeholder LinkedIn link — not a new orphan, matches an established site-wide placeholder pattern)

No separate "View Profile" link (present in the wireframe) — dropped because there's no individual profile page planned and it would duplicate the LinkedIn link with no distinct destination.

**Team data** (transcribed from wireframe):

| name | title | bio | initials |
|---|---|---|---|
| Tebogo Mkhize | Chief Executive Officer | Over 20 years of experience in private equity and investment management. Previously held senior roles at leading investment firms in South Africa. | TM |
| Michael van der Merwe | Chief Investment Officer | 25+ years' experience in portfolio management, alternative investments and capital allocation across global markets. | MM |
| Nolitha Dlamini | Head: Real Assets | Specialist in real estate and infrastructure investments with extensive experience in asset acquisition and development. | ND |
| David Rossouw | Head: Credit & Insurance | Expert in private credit and insurance investments with a focus on risk management and capital preservation. | DR |

### 3. Stats band
Reuses `.platform-stats`/`.platform-stat` verbatim from Strategies (static, non-animated numbers — matches that existing precedent; Home's animated counters are not used here). These rules live in `strategies.css`, a page-specific file `leadership.html` doesn't link, so the declarations are duplicated verbatim into this page's own `assets/css/pages/leadership.css` rather than shared — consistent with the project's established "duplicate CSS until a third page needs it" convention already used for `.hero`/`.closing-cta`.

- Heading: "Leadership Backed by **Deep Experience**"
- Intro: "Our team combines investment expertise with strong governance and a culture of accountability to deliver consistent results."
- 4 stats: "80+ / Years of Combined Investment Experience", "100+ / Combined Transactions Executed", "4 / Core Investment Strategies", "Aligned / Invested Alongside Our Clients"
- Icons: reuse existing `ICONS` map entries (people, trend/growth, target, shield) as inline SVGs, same static-copy convention already used in `strategies.html`'s platform-stats block.

### 4. Investment Committee section (`id="investment-committee"`)
- Heading: "Investment **Committee**"
- Intro: "The Investment Committee provides oversight and guidance on all investment activities, ensuring disciplined decision-making and strong governance."
- 4 compact member rows, data-driven from the same `data/leadership.json`'s `committee` array via a second `<template>` + rendered by the same `renderLeadership()` function (handles both arrays).

**Row layout** (new lightweight `.committee-member` class, no card shell — smaller circular avatar + text, horizontal on desktop):
- Small circular initials avatar (new `.committee-avatar` class, 56px circle) — a distinct, deliberately different treatment from the Leadership Team cards' rectangular `.avatar-placeholder` tile above, not the same component reused. The team cards use a large rectangular banner (matching the site's other card-media treatments); the committee rows use a compact circular badge suited to their smaller, text-forward layout.
- Name + title (role caption, e.g. "Chairman", "Independent Member")
- One-line bio

**"Learn More About Our Governance" button dropped** — no governance page exists or is planned; same treatment as the CTA removed from Strategies for the same reason.

**Committee data** (transcribed from wireframe):

| name | title | bio | initials |
|---|---|---|---|
| John Mayers | Chairman | Former CEO with extensive experience in financial services and governance. | JM |
| Karen Combrinck | Independent Member | Corporate governance specialist and former non-executive director. | KC |
| Sipho Maseko | Independent Member | Expert in risk management and financial regulation with 30+ years' experience. | SM |
| James Patel | Independent Member | Investment banking veteran with deep expertise in capital markets. | JP |

### 5. Closing CTA
Reuses `.closing-cta` verbatim (same as About/Strategies).
- "Strong Leadership. Disciplined Approach. **Sustainable Outcomes.**"
- Button: "Contact Investor Relations →" → `contact.html`

## Data flow

`data/leadership.json`:
```json
{
  "team": [ { "name", "title", "bio", "initials", "linkedin" } ],
  "committee": [ { "name", "title", "bio", "initials" } ]
}
```

`main.js` gains `renderLeadership()`, called from `init()` alongside the existing `renderStrategies`/`renderStatistics`/`renderInsights` calls, gated by checking for the presence of `#leader-grid` / `#committee-grid` containers (same existence-check pattern already used for the other render functions, so this function is a no-op on pages that don't have these containers).

The "View Investment Committee" button is a plain anchor (`href="#investment-committee"`); since both the button and its target section render synchronously as part of the initial page HTML (only the *card contents* within the section are injected by JS, not the section container/heading itself), this does not hit the async cross-page anchor-scroll race that `scrollToHash()` was built for — that helper handles hash links arriving from other pages after a fresh page load, whereas this is a same-page click after the DOM (including the empty grid containers) has already fully loaded. No new JS needed for this button.

## New CSS

New file `assets/css/pages/leadership.css`:
- `.avatar-placeholder` (rectangular, Leadership Team cards) and `.committee-avatar` (circular, Investment Committee rows) — two distinct avatar treatments, not size variants of one class
- `.leader-title`
- `.committee-member` layout (flex row, wraps on mobile)
- `.platform-stats`/`.platform-stat`, duplicated verbatim from `strategies.css` (see Stats band note above), since that file is page-specific and not linked from `leadership.html`

All other sections reuse existing classes (`.hero.hero-banner`, `.closing-cta`, `.grid-4`, `.card`) directly from shared CSS files with no changes needed there.

## Files touched/created

- `leadership.html` (new)
- `data/leadership.json` (populate)
- `assets/css/pages/leadership.css` (new)
- `assets/js/main.js` (add `renderLeadership()`, call it from `init()`)

No changes to `navbar.html`/`footer.html` — both already link to `leadership.html`.

## Testing

Consistent with the rest of the project: no test framework. Verify with `node --check` on `main.js`, plus live browser checks (console clean, both grids render correct card counts, in-page anchor scroll works, responsive check, no broken links).

## Out of scope

- Real leadership photos and bios — user will supply later; JSON + image-folder structure is designed so that's a content edit only, no code changes.
- Individual leadership profile pages ("View Profile" destinations) — not planned; link removed from the design.
- Governance page — not planned; CTA removed from the design.
