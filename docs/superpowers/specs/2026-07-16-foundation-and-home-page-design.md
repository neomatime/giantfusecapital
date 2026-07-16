# Giantfuse Capital Partners — Foundation + Home Page Design

## Purpose

The project is a fully-scaffolded but unimplemented static site (every HTML/CSS/JS/JSON file is empty). This spec covers building the shared foundation — design tokens, base styles, shared components, and a lightweight include/data mechanism — and implementing the Home page against `docs/wireframes/home.png`. Other pages (About, Strategies, Leadership, Insights, Contact) are follow-on work that reuses this foundation; each gets its own spec once this one ships.

## Non-goals

- Not building About/Strategies/Leadership/Insights/Contact pages in this pass.
- Not sourcing or generating real photography — image-dependent sections use clearly marked placeholders until real photos are supplied.
- Not adding a build tool, bundler, or framework — the site stays plain HTML/CSS/JS, matching the existing scaffold.
- Not setting up git for this project (it currently has none) — flagged separately, not part of this spec.

## Architecture

**No build step.** All pages live at the project root, so relative paths (`components/x.html`, `data/x.json`) resolve the same from any page. Components are reused via a small runtime include mechanism (fetch + inject), which requires the site to be viewed through a local server or static host — not opened directly as `file://`.

### Design tokens (`assets/css/global.css`)
CSS custom properties on `:root`:
- Colors: `--color-teal:#00A3AD`, `--color-navy:#0D1B2A`, `--color-slate:#24323F`, `--color-light-gray:#E6EBEF`, `--color-off-white:#F8FAFC`, `--color-gold:#C8A961`, `--color-steel-teal:#5F7F8C`, `--color-sea-glass:#B7D7DB`
- Spacing scale: 4px base (4, 8, 12, 16, 24, 32, 48, 64, 96)
- Breakpoints: mobile `<640px`, tablet `641–1024px`, desktop `>1024px`
- Also: CSS reset/normalize basics, box-sizing, base `body` styles

### Typography (`assets/css/typography.css`)
- Headings: **Fraunces** (Google Fonts), serif display
- Body: **Inter** (Google Fonts), sans
- Type scale for h1–h4, body, small/caption, defined as custom properties or utility classes

### Shared component styles
- `navigation.css` — navbar layout, logo, links, mobile menu, "Investor Enquiry" button, scroll-shrink state
- `footer.css` — dark footer, 3-column links, legal bar
- `components.css` — buttons (solid teal / outline), strategy cards, stat tiles, insight cards, section headings, icon badges
- `animationa.css` — fade/slide-in keyframes for scroll-reveal

### Include mechanism (`assets/js/main.js`)
- On page load, find all `<div data-include="name">` placeholders, `fetch('components/name.html')`, inject the HTML via `innerHTML`
- After includes resolve, run page-specific init (data fetch + render, counters, scroll effects, nav toggle)
- `navigation.js` — mobile menu open/close, header scroll-shrink (depends on navbar markup existing, so runs after include resolves)
- `counters.js` — animates numeric stats (26.9%, 50.1%, 10.1%) counting up when scrolled into view
- `scroll-effects.js` — adds a reveal class to sections as they enter the viewport
- `forms.js` — left as-is (empty), not used on Home

### Data-driven content
Three JSON files feed Home; `leadership.json` is untouched this round.

`data/strategies.json` — array, one object per strategy card:
```json
{ "icon": "chart", "title": "Private Equity", "description": "Partnering with exceptional businesses to unlock value and drive sustainable growth across sectors.", "link": "strategies.html" }
```
Icons are one of a fixed set (`chart`, `pie`, `building`, `bridge`) rendered as inline SVG by a small icon lookup in `main.js` — not image files.

`data/statistics.json` — array, one object per stat tile:
```json
{ "value": "26.9%", "numeric": true, "label": "3-Year Average NAV Return" }
```
`numeric: true` tiles animate via `counters.js`; `numeric: false` tiles (e.g. "Disciplined", "Institutional Grade") render as static text.

`data/insights.json` — array, one object per teaser card (Home shows the 3 most recent):
```json
{ "category": "MARKET OUTLOOK", "title": "Global Markets: Navigating Change with Discipline", "date": "2024-05-20", "readTime": "5 min read", "link": "insights.html" }
```

## Home page sections (top to bottom)

1. **Navbar** — logo (wordmark, using existing brand teal/navy), nav links: Home, About Us, Our Business, Investment Approach, Leadership, Insights, Contact Us — solid teal "Investor Enquiry" button on the right. (Leadership added per user decision; mockup itself omits it.)
2. **Hero** — "The Age of Possibilities" (teal on "Possibilities"), supporting paragraph, two CTAs (solid "Explore Our Strategies", outline "Contact Us"), hero image placeholder (glass tower photo, pending real photography) with a decorative inline-SVG ring/dot pattern overlay in teal.
3. **Value strip** — dark navy band, 4 items with icon + label: Alternative Investments, Institutional Solutions, Risk-Adjusted Returns, Long-Term Value Creation.
4. **Strategies grid** — heading "Our Investment Strategies", subheading "Diversified. Disciplined. Aligned with your ambition.", 4 cards rendered from `strategies.json` (Private Equity, Hedge Fund Solutions, Real Estate, Credit & Insurance), each with image placeholder, teal circular icon badge, title, description, "Learn More →".
5. **Performance stats** — heading "A Track Record of Performance", 5 tiles rendered from `statistics.json`, animated counters on the numeric ones, disclaimer line below ("Performance metrics are based on composite returns across strategies. Past performance is not indicative of future results.").
6. **CTA band** — dark, "Built on Expertise. Focused on Your Future.", supporting text, "Partner With Us" button, skyline photo placeholder background.
7. **Insights teasers** — heading "Insights That Matter" + "View All Insights →", 3 cards rendered from `insights.json`.
8. **Closing CTA strip** — logo mark icon, "Let's Build What's Next, Together.", "Contact Investor Relations →" outline button.
9. **Footer** — logo, short legal blurb, 3 link columns (Quick Links, Our Strategies, Contact), social icons (LinkedIn, email), bottom legal bar (copyright, Privacy Policy, Terms of Use, PAIA, Disclaimer — these link targets don't exist yet, so they point to `#` placeholders this round).

## Images

Every section that needs photography (hero, strategy cards, CTA band) gets a placeholder: a CSS gradient in brand colors with a centered label (e.g. "Photo: hero-building") so it's visually obvious and easy to find/replace once real photography lands in `assets/images/`.

## Testing / verification

- Open Home through a local static server (not `file://`) and visually compare against `docs/wireframes/home.png` section by section.
- Verify responsive behavior at mobile/tablet/desktop breakpoints.
- Verify counters animate once on scroll-into-view (not repeatedly).
- Verify nav mobile menu opens/closes and links resolve.
- Verify JSON fetch failures don't break the page silently — check browser console for errors during manual testing.

## Open items carried forward (not blocking this spec)

- Real photography and leadership/insights/strategy imagery still need to be supplied.
- Privacy Policy / Terms of Use / PAIA / Disclaimer pages don't exist yet — footer links are placeholders.
- This project folder has no git repository, so this spec (and subsequent work) isn't being committed to version control. Separate decision for the user, not resolved here.
