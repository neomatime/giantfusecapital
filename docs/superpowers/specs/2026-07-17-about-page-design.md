# About Page Design

## Purpose

Build `about.html` against `docs/wireframes/about.png`, the second real page on the site after Home. Reuses the shared foundation built for Home (design tokens, navbar/footer components, `.closing-cta` pattern, the full-bleed hero-with-overlay technique) rather than inventing new infrastructure.

## Non-goals

- Not building Strategies, Leadership, Insights, Philosophies, or Contact in this pass.
- Not sourcing a literal Africa map illustration — the "Geographic Footprint" graphic is an abstract decorative dot pattern, not a geographically accurate silhouette.
- Not making Core Values / Investment Approach data-driven from JSON — this content is About-page-only, unlike strategies/statistics/insights which are genuinely reused elsewhere.

## Architecture

Static HTML, matching the pattern used for Home's hero/value-strip/CTA-band sections (not the JSON-driven pattern used for cards that are reused across views). New file: `assets/css/pages/about.css` (currently empty in the scaffold). No new JS render functions, no new data files.

### Bug fix required: dynamic active nav link

`components/navbar.html` currently hardcodes `class="active"` on the Home link. Since every page fetches the same navbar partial via the include mechanism, About (and every future page) would incorrectly show "Home" as active. Fix: remove the hardcoded class from the markup; `navigation.js`'s `init()` compares `window.location.pathname` (or `pathname.split('/').pop()`) against each nav link's `href` and adds `.active` to the match, for both the desktop `.navbar-links` and the mobile `.navbar-mobile-menu` link sets.

### New icons

Added to the existing `ICONS` map in `assets/js/main.js` (currently: `bank, people, shield, growth, trend, pie, building`), following the same inline-SVG, `stroke="currentColor"`, `aria-hidden="true"` convention:

- `target` — Our Purpose
- `eye` — Our Vision
- `flag` — Our Mission
- `lightbulb` — Expertise (Core Values)
- `leaf` — Responsibility (Core Values); reused for Active Value Creation (Investment Approach)
- `checkmark` — Who We Serve checklist
- `magnifyingGlass` — Opportunity Sourcing (Investment Approach)
- `globe` — Long-Term Outcomes (Investment Approach)
- `locationPin` — Our Office card

Existing icons reused: `shield` (Integrity), `growth` (Performance; also Rigorous Due Diligence), `people` (Partnership), `pie` (Disciplined Allocation).

Since these icons are used as static inline SVG in `about.html` (not fetched/rendered via JS, matching how Home's value-strip icons are hand-inlined rather than pulled from `ICONS` at runtime), the same SVG markup is written directly into `about.html`, sourced from the `ICONS` map's strings for consistency — not re-derived independently.

## Page sections (top to bottom)

1. **Navbar** — existing component, unchanged markup, now with dynamic active-link (see fix above). "About Us" resolves as active on this page.

2. **Hero** — reuses the full-bleed photo+overlay technique from Home's hero, but capped to a banner height (~450px, not 100vh) per user decision. Photo: `assets/images/pexels-ekam-juneja-61080223-9516077.jpg` (dramatic upward glass-tower shot, no visible third-party branding — `pexels-blackphant-20884565.jpg` was ruled out because it has a readable "OHLA" logo baked into the photo). No CTAs (wireframe doesn't show any, unlike Home's hero).
   - Eyebrow: "ABOUT US"
   - H1: "Built on Discipline. Driven by **Opportunity**." (teal span)
   - Paragraph: "Giantfuse Capital Partners is an alternative investment and asset management firm focused on generating sustainable, long-term value across private markets."

3. **Who We Are** — two columns. Left: heading + 2 paragraphs. Right: light-gray box, 2×2 stat grid with divider lines.
   - H2: "Who **We Are**"
   - Paragraph 1: "Giantfuse Capital Partners is a South African alternative investment firm, committed to delivering superior, risk-adjusted returns for our investors through disciplined capital allocation, deep sector insight and active portfolio management."
   - Paragraph 2: "We invest across a diversified range of private markets, leveraging local expertise and global perspectives to unlock opportunities that create lasting value for our investors and the broader economy."
   - Stats: `2014` / Year Established — `Sandton` / Johannesburg, South Africa — `Institutional` / Investor Focus — `Alternative` / Investment Manager

4. **Purpose / Vision / Mission** — dark navy 3-column band, circular outline icon + heading + description each:
   - Our Purpose (`target`) — "To build enduring value for our investors and stakeholders through disciplined investment and responsible stewardship."
   - Our Vision (`eye`) — "To be the partner of choice for alternative investment solutions in Africa and beyond."
   - Our Mission (`flag`) — "To deliver superior risk-adjusted returns by investing with insight, integrity and long-term conviction."

5. **Our Core Values** — centered heading + subheading, 5 cards:
   - H2: "Our **Core Values**"; subheading: "The principles that guide how we invest, operate and build lasting partnerships."
   - Integrity (`shield`) — "Doing what is right, always."
   - Performance (`growth`) — "Delivering sustainable, risk-adjusted returns."
   - Partnership (`people`) — "Growing with our Investors and stakeholders."
   - Expertise (`lightbulb`) — "Investing with depth, discipline and insight."
   - Responsibility (`leaf`) — "Creating value for future generations."

6. **Who We Serve** — two columns. Left: office photo (`assets/images/office/pexels-startup-stock-photos-7070.jpg`, reused from Home's CTA band per user decision). Right: heading + paragraph + 3-item checklist.
   - H2: "Who **We Serve**"
   - Paragraph: "We partner with sophisticated investors who seek long-term value and strategic access to private market opportunities."
   - Checklist (`checkmark` icon each): Institutional Investors — Family Investment Groups — Qualified High-Net-Worth Investors

7. **Our Investment Approach** — centered heading + subheading, 5 numbered step cards:
   - H2: "Our **Investment Approach**"; subheading: "A structured, disciplined process designed to unlock value and manage risk."
   - 01 Opportunity Sourcing (`magnifyingGlass`) — "Access to high-quality, differentiated opportunities."
   - 02 Rigorous Due Diligence (`growth`) — "Deep analysis, insight and independent thinking."
   - 03 Disciplined Allocation (`pie`) — "Investing with a clear focus on risk-adjusted returns."
   - 04 Active Value Creation (`leaf`) — "Driving growth, resilience and sustainable value."
   - 05 Long-Term Outcomes (`globe`) — "Delivering enduring value for our investors and society."

8. **Our Geographic Footprint** — light section, two columns. Left: heading + paragraph. Right: abstract decorative dot-pattern graphic (not a literal map) + an office-address card.
   - H2: "Our **Geographic Footprint**"
   - Paragraph: "Headquartered in Sandton, Johannesburg, we invest across South Africa with a broader focus on selected opportunities in key African markets."
   - Office card (`locationPin` icon): "Our Office" — "155 West Street, Sandton, Johannesburg, South Africa"

9. **Closing CTA** — exact reuse of Home's `.closing-cta` markup/CSS pattern, same copy structure, page-appropriate heading:
   - "Let's Build What's Next, Together."
   - "Speak with our team to explore how we can support your investment goals."
   - Button: "Contact Investor Relations →" → `contact.html`

10. **Footer** — existing component, unchanged.

## Testing / verification

- Open About through the local dev server, visually compare against `docs/wireframes/about.png` section by section.
- Verify the navbar shows "About Us" as active on this page, and confirm Home still shows "Home" as active when navigating back — proves the dynamic active-link fix works both ways, not just for the new page.
- Verify responsive behavior at mobile/tablet/desktop breakpoints for every new grid (stat box, 3-column Purpose/Vision/Mission, 5-card Core Values, 5-step Investment Approach, 2-column Who We Serve / Geographic Footprint).
- Verify the reused office photo and the new hero photo both load (network 200, no broken images).
- Verify all 9 new icons render (no blank icon badges from a typo'd `ICONS` key).
- Check browser console for zero errors.

## Open items carried forward (not blocking this spec)

- Geographic Footprint's dot-pattern graphic is a simplification pending real design input if the client wants a literal map later.
- No Strategies/Leadership/Insights/Philosophies/Contact pages yet — each gets its own spec.
