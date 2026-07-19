# Atlas Chatbot Widget — Design Spec

Date: 2026-07-18
Status: Approved for planning

## Purpose

Add a persistent floating chat widget, branded "Atlas," to every page of the Giantfuse Capital Partners site (Home, About, Strategies, Leadership, Contact). Per user decision, this is front-end only — no backend, no AI API — using a keyword-matching reply engine that points visitors to real content already on the site. This is the site's second interactive/stateful component after the Contact page's enquiry wizard, and its first feature that's site-wide rather than page-specific.

## Architecture

Follows the established shared-component pattern (matching how `navbar.html`/`footer.html` work) plus the established "big interactive feature gets its own file" pattern (matching `contact-form.js`):

- **`components/atlas-widget.html`** (new) — the launcher button + chat panel markup, fetched via the existing `fetchInclude`/`includeStatic` mechanism already used for the navbar and footer. No new fetch infrastructure needed.
- **`assets/css/atlas-widget.css`** (new) — dedicated stylesheet, parallel to how `navigation.css`/`footer.css` are separate site-wide component stylesheets rather than folded into `components.css`. Linked in every page's `<head>`.
- **`assets/js/atlas-widget.js`** (new) — open/close state, message rendering, and the keyword reply engine. Follows the standard file pattern (IIFE, `window.Giantfuse.AtlasWidget` namespace with an `init()`, `module.exports` guard for Node-testing the pure reply-matching logic). Unlike `preloader.js`, this file has no reason to self-initialize early — it only needs the DOM to exist, so it follows the normal pattern: `main.js`'s `init()` calls `window.Giantfuse.AtlasWidget.init()` after the shared includes resolve, guarded the same way `ContactForm.init()` is (safe no-op check, though in this case the widget will exist on every page so the guard is more about defensive consistency than an actual page-without-it case).
- **Every one of the 5 existing pages** (`index.html`, `about.html`, `strategies.html`, `leadership.html`, `contact.html`) gets 3 line additions: one `<link rel="stylesheet" href="assets/css/atlas-widget.css">` in `<head>`, one `<div data-include="atlas-widget"></div>` before `</body>` (alongside the existing navbar/footer include divs), one `<script src="assets/js/atlas-widget.js"></script>` after the existing script tags.

**3 new icons for the shared `ICONS` map** in `main.js`: `chatBubble` (launcher icon), `send` (input send button), `close` (panel header close button — a proper SVG X, consistent with the site's icon-badge treatment; distinct from the nav drawer's plain `✕` text-glyph swap, which suits that different context but wouldn't match this panel's icon-driven visual language).

**Pure vs. DOM-coupled logic**, matching the precedent set by `contact-form.js`'s `isValidEmailFormat`/`isPhase1Valid`/`isPhase2Valid`: the keyword-matching function (`matchReply(message: string): string` — takes raw user input, returns the reply text) is written as a pure function with no DOM access, so it can get real `node -e` unit tests. Rendering the message into the panel, handling the input/send button, and the typing-indicator timing are DOM-coupled and browser-verified only, same as the rest of the site's DOM logic.

## Visual Design

**Launcher:** 56px circular button, `background: var(--color-teal)`, white `chatBubble` icon centered, `position: fixed; bottom: 24px; right: 24px;`, box-shadow matching the site's existing card-shadow convention (`0 4px 16px rgba(13, 27, 42, 0.1)`, same value used on `.office-card`). Own z-index tier: `150` — below the mobile nav drawer's `200`/`201`/`202` range (established in the previous feature), so if a user somehow has both open, the drawer visually takes precedence. Stays a chat-bubble icon at all times; does not morph into a close icon like the nav hamburger does, because unlike the hamburger the panel has its own dedicated header where a close button lives.

**Panel** (desktop, ≥641px — matching the site's existing small-viewport breakpoint used elsewhere, e.g. `.contact-info-grid`): floating card, `width: 360px; height: 480px;` (capped, not viewport-relative), anchored above the launcher (`bottom: 92px; right: 24px;`), `background: var(--color-white)`, `border-radius: var(--radius-md)`, same shadow as the launcher. Structure top to bottom:
- Header: "Atlas" (bold, navy) + a subtitle "Investor Assistant" (small, slate) + close button (top-right, X icon)
- Scrollable message list (flexible height, fills remaining space)
- Input row: text `<input>` + send button (teal, `send` icon)

**Panel** (mobile, <641px): expands to a near-full-screen panel instead of a small floating card — a fixed 360px card doesn't work well on a phone viewport. `inset: var(--space-16)` (16px margins on all sides) rather than the fixed desktop dimensions.

**Messages:** bot messages left-aligned, `background: var(--color-light-gray)`, navy text, rounded corners (rounded on all corners except bottom-left, standard chat-bubble convention). User messages right-aligned, `background: var(--color-teal)`, white text, rounded on all corners except bottom-right. A typing-indicator bubble (three animated dots, reusing the light-gray bot-message styling) shows for ~600ms before each Atlas reply renders, replacing an instant lookup-table feel with something closer to a real conversation.

**Animation:** panel opens via `opacity`/`transform: translateY(12px) → translateY(0)` over ~250ms ease, matching the transition durations used elsewhere on the site (0.2–0.3s ease is the established convention, e.g. `.navbar-mobile-menu`'s slide, `.btn` hover states).

## Behavior

- Clicking the launcher toggles the panel open/closed. Clicking the header's close button also closes it. `Escape` closes it too, matching the nav drawer's established convention — but only the widget's own `Escape` listener should act when the widget is open; if the nav drawer is also open (edge case), the drawer's own `Escape` handler already closes the drawer independently, and both listeners existing side-by-side is fine since they check their own element's open state before acting.
- On first open (each page load — no cross-page/session state persistence, matching the nav drawer's "starts fresh every load" precedent, not requested here either), Atlas's greeting message renders automatically: *"Hi, I'm Atlas — I can help you learn about our investment strategies, leadership team, or how to get in touch. What would you like to know?"*
- User types a message, hits Enter or clicks Send. Their message renders immediately (right-aligned, teal). The typing indicator shows, then after ~600ms is replaced by Atlas's matched reply (left-aligned, light gray), which includes an inline link to a relevant page where applicable.
- **Reply engine** (`matchReply`), checked in this priority order (first match wins, case-insensitive substring matching against the user's raw message):
  1. Contains any of `strateg`, `invest`, `private equity`, `hedge fund`, `real estate`, `credit` → *"We focus on four core strategies — Private Equity, Hedge Fund Solutions, Real Estate, and Credit & Insurance. You can explore each in detail on our [Investment Approach](strategies.html) page."*
  2. Contains any of `contact`, `enquir`, `talk to someone`, `human`, `call`, `email`, `reach` → *"You can reach our team directly through our [Investor Enquiry](contact.html) form, or call us on +27 72 416 6083."*
  3. Contains any of `leadership`, `team`, `who runs`, `ceo`, `management` → *"Our leadership team is led by Tebogo Mkhize (CEO) and Michael van der Merwe (CIO), along with heads of Real Assets and Credit & Insurance. You can meet the full team on our [Leadership](leadership.html) page."*
  4. Contains any of `about`, `company`, `who are you`, `history`, `based` → *"Giantfuse Capital Partners is a South African alternative investment and asset management firm based in Sandton, Johannesburg. Read more on our [About](about.html) page."*
  5. No match → *"I'm not able to answer that directly, but our team can help — reach out through our [Investor Enquiry](contact.html) form and we'll get back to you."*
- Links inside replies are real `<a>` tags (rendered from the reply text, not escaped-away) — this is the one place on this site where a render function intentionally inserts a link into `innerHTML`-driven content. Per the precedent already established on the Contact page's `escapeHtml()` fix, *user*-supplied text must never be written unescaped into `innerHTML` — but reply text is never user-supplied here, it's one of a small fixed set of developer-authored strings, so the XSS concern that applied to the Contact page's review summary doesn't apply to Atlas's own replies. The **user's own message**, when rendered into the message list, must still go through `.textContent` (or an equivalent escaping treatment), never raw interpolation — this is Global Constraint, not optional.

## Global Constraints

- No build tool, bundler, framework, or npm dependency.
- No backend, no AI API, no network calls of any kind for this feature.
- The user's own typed message must be rendered via `.textContent`/escaped — never raw `innerHTML` interpolation of user input (same XSS-prevention precedent established on the Contact page).
- Reply text (developer-authored, fixed strings) may contain real `<a href>` markup since it's never user-influenced.
- z-index `150` for the widget, staying below the mobile nav drawer's `200`–`202` range.
- Reuses existing tokens throughout: `--color-teal`, `--color-navy`, `--color-white`, `--color-light-gray`, `--color-slate`, `--radius-md`, `--space-*` scale.
- All 5 existing pages must get identical additions (link/div/script) — no page-specific variation.

## Testing

Consistent with the rest of the project: no test framework.
- `node --check` on `assets/js/atlas-widget.js`.
- `node -e` unit tests for `matchReply()` — one assertion per keyword category plus the fallback case, following the same pattern as `contact-form.js`'s Task 3.
- Live browser checks: launcher renders and is clickable, panel opens/closes via launcher/close-button/Escape, greeting appears on first open, typing a message and sending renders both the user's message and (after the typing-indicator delay) Atlas's reply, each of the 5 keyword categories produces its expected reply, the fallback triggers for an unmatched message, links inside replies are real clickable `<a>` tags pointing to the right pages, mobile-width panel expands near-full-screen instead of the small floating card, no console errors, regression-check all 5 pages for the widget's presence and zero interference with existing page content (especially the Contact page's own form and the mobile nav drawer).

## Out of scope

- Real AI/backend integration — explicitly deferred per user decision; `matchReply()` is intentionally isolated so swapping it for a real API call later doesn't require touching the rendering/open-close logic.
- Cross-page or cross-session conversation history — starts fresh on every page load.
- Insights page — doesn't exist yet; when it's built, it should get the same 3 additions as the other 5 pages.
