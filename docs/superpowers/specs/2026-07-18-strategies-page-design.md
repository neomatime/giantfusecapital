# Strategies Page Design

## Purpose

Build `strategies.html` against `docs/wireframes/Stratefgies.png`, the third real page on the site after Home and About. Closes the loop on links that already exist: Home's hero CTA ("Explore Our Strategies"), Home's 4 strategy cards' "Learn More" links, and the footer's "Our Strategies" column all point to `strategies.html` and `strategies.html#<slug>` already.

## Non-goals

- Not building Leadership, Insights, Philosophies, or Contact in this pass.
- Not sourcing new photography for the 4 "Core Strategies" cards — only one strategies-category photo exists project-wide, not enough for 4 distinct card images, so those stay as gradient placeholders (same reasoning as Home's original placeholder decision).
- Not building a per-strategy detail page — each card's "Learn More" links to its own anchor on this same page (`#private-equity` etc.), not a separate page.
- Not building `philosophies.html` — the "Our Investment Approach" section's button links there, but the target page is out of scope here (matches the existing pattern of Home/About already linking to not-yet-built pages).

## Architecture

Extends the existing `data/strategies.json` (already consumed by Home) with two new fields — `subtitle` and `highlights` — rather than creating a parallel data file. Home's `renderStrategies()` only reads `icon`/`title`/`description`/`link`, so the additive fields don't affect it. This page gets its own render function, `renderStrategyDetails()`, and its own inline card template in `strategies.html` (not `components/strategy-card.html`, which Home's simpler cards use) — keeping Home's already-shipped rendering untouched while reusing the underlying data.

No new icons needed: `target`, `globe`, `shield`, `growth`, `pie`, `building`, `checkmark` all already exist in `main.js`'s `ICONS` map.

**Shared CSS extraction (confirmed with the user):** Home and About each currently duplicate `.hero`/`.hero-media`/`.hero-overlay`/`.hero-copy`/`.closing-cta*` verbatim in their own `pages/*.css` file, a known tradeoff accepted during About's build and flagged by that build's final review as worth fixing once a third page needs the same pattern. This is that third page. Rather than duplicate a third time, this page's build extracts those rules — plus `.hero-banner`/`.hero-banner .hero-copy` (used by both About and Strategies, never by Home) and `.hero .eyebrow` (added during About's build, applies to any page's hero) — into a new `assets/css/shared-sections.css`, loaded via `<link>` by all three pages (`index.html`, `about.html`, `strategies.html`). `home.css` and `about.css` lose their duplicated copies of these rules; `strategies.css` never gets one in the first place. This touches two already-shipped files (`home.css`, `about.css`) and both existing page `<head>`s, so it's an explicit, reviewed task in the plan, not an incidental side effect.

New file: `assets/css/pages/strategies.css` — everything specific to this page only (platform-stats row, Core Strategies cards, Investment Approach timeline).

## Page sections (top to bottom)

1. **Navbar** — existing component, unchanged. "Our Business" resolves as active via the existing dynamic active-link logic (no changes needed there).

2. **Hero** — banner height (~480px, matching About's `.hero-banner` pattern, not Home's full 100vh). Photo: `assets/images/strategies/pexels-constanze-marie-3872134-17879690.jpg` (its first use anywhere — thematically named for exactly this page). No eyebrow, no CTAs (wireframe shows neither for this hero).
   - H1: "Our Investment **Strategies**"
   - Paragraph: "Diversified. Disciplined. Aligned with our ambition. We invest across a focused set of alternative asset classes to deliver long-term value and sustainable, risk-adjusted returns."

3. **A Diversified Investment Platform** — two columns. Left: heading + paragraph. Right: a horizontal 4-item stat row with vertical dividers (new pattern — not About's 2×2 box).
   - H2: "A Diversified **Investment Platform**"
   - Paragraph: "Our strategies are designed to capture attractive risk-adjusted returns across economic cycles, with a focus on capital preservation, income generation and long-term growth."
   - Stats (icon + value + label): `target` / "4" / Core Strategies — `globe` / "Diverse" / Market Exposure — `shield` / "Risk-Managed" / Approach — `growth` / "Long-Term" / Value Creation

4. **Our Core Strategies** — centered heading + subheading, 4 cards (each `id`'d for the existing anchor links to resolve):
   - H2: "Our Core **Strategies**"; subheading: "Focused strategies. Deep expertise. Measurable outcomes."
   - Each card: placeholder photo, icon badge, title, subtitle, description, 4-item checkmark checklist, "Learn More" (self-anchor link)
   - **Private Equity** (`id="private-equity"`, icon `growth`) — subtitle "Building value in private businesses"; description "We invest in high-quality companies with strong fundamentals and growth potential. Our approach focuses on active value creation, operational improvement and strategic growth."; highlights: Control and minority investments / Sector-focused approach / Active involvement / Long-term partnerships
   - **Hedge Fund Solutions** (`id="hedge-fund-solutions"`, icon `pie`) — subtitle "Access to exceptional talent"; description "We provide access to a curated selection of best-in-class hedge fund managers across a range of strategies designed to deliver uncorrelated returns and portfolio diversification."; highlights: Global manager network / Multi-strategy solutions / Risk-managed allocations / Enhanced diversification
   - **Real Estate** (`id="real-estate"`, icon `building`) — subtitle "Investing in quality assets"; description "We invest across the real estate value chain to generate stable income and long-term capital appreciation in high-quality properties and developments."; highlights: Income-generating assets / Strategic locations / Active asset management / Sustainable developments
   - **Credit & Insurance** (`id="credit-insurance"`, icon `shield`) — subtitle "Providing capital with conviction"; description "We deploy capital across private credit and insurance solutions, providing attractive yields through disciplined underwriting and strong risk management."; highlights: Private credit solutions / Insurance-linked investments / Strong risk discipline / Attractive risk-adjusted yields

5. **Our Investment Approach** — light background, two columns. Left: heading + paragraph + outline button. Right: 5-step numbered timeline connected by a dashed line (new pattern — numbered circles, not About's icon-bearing bordered cards).
   - H2: "Our Investment **Approach**"
   - Paragraph: "A disciplined and repeatable process to identify opportunities, manage risk and drive long-term value."
   - Button: "Our Investment Approach →" → `philosophies.html`
   - Steps: 01 Opportunity Sourcing — "We identify attractive investment opportunities across our target markets and sectors." / 02 Rigorous Due Diligence — "Deep analysis of financials, operations, management and market dynamics." / 03 Investment Committee — "Disciplined evaluation and approval by our experienced investment committee." / 04 Active Value Creation — "We work closely with management to drive growth, efficiency and strategic advancement." / 05 Monitoring & Realisation — "Ongoing monitoring and proactive risk management to protect and realise value."

6. **Closing CTA** — exact reuse of the established `.closing-cta` pattern, page-specific copy:
   - "Partner with Us **for Long-Term Value**"
   - "We welcome conversations with institutions, family offices and qualified investors seeking differentiated opportunities."
   - Button: "Contact Investor Relations →" → `contact.html`

7. **Footer** — existing component, unchanged.

## Testing / verification

- Open Strategies through the local dev server, visually compare against `docs/wireframes/Stratefgies.png` section by section.
- Verify "Our Business" shows as active in the nav; regression-check Home and About still show their own correct active link.
- **Verify the cross-page anchor links actually work**: from Home, click a strategy card's "Learn More" link (or navigate directly to `strategies.html#private-equity` etc.) and confirm the browser scrolls to the matching card.
- Verify `renderStrategies()` on Home still works correctly after `data/strategies.json`'s schema gains `subtitle`/`highlights` fields — confirm Home's strategy-card grid is visually unchanged.
- Regression-check Home and About after the shared-CSS extraction: confirm Home's hero is still full 100vh, About's hero is still banner-height, and both closing-CTAs still render identically to before — the extraction must be a pure refactor with zero visual change on the two already-shipped pages.
- Verify responsive behavior at mobile/tablet/desktop for every new grid (platform-stats row, Core Strategies cards, Investment Approach timeline).
- Check browser console for zero errors, zero 404s.

## Open items carried forward (not blocking this spec)

- `philosophies.html` (Investment Approach) still has no wireframe and remains unbuilt.
- Core Strategies card photos remain placeholders pending additional photography.
