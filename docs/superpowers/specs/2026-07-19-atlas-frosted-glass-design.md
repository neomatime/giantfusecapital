# Atlas Frosted Glass Restyle — Design Spec

Date: 2026-07-19
Status: Approved for planning

## Purpose

Restyle the existing Atlas chat widget to feel "futuristic and premium" instead of the current flat white panel. Direction chosen (via visual companion comparison of three options — frosted glass, dark command console, gradient-accent) is **Frosted Glass**: a translucent, blurred panel with soft teal glow accents, described by the user as "elegant and understated" rather than flashy. This is a pure visual restyle — no new behavior, no new interactive features.

## Architecture

No new files. This touches exactly two existing files:
- `components/atlas-widget.html` — one small markup addition: a decorative status-dot `<span>` in the header (purely visual, `aria-hidden="true"`, no behavior).
- `assets/css/atlas-widget.css` — full visual restyle of every existing rule (panel, header, messages, typing indicator, input row, launcher).

`assets/js/atlas-widget.js` is **not touched at all** — every existing behavior (open/close, message send, typing indicator timing, voice toggle, reply matching) is unchanged; only appearance changes.

## Visual Design

**Panel** (`.atlas-panel`): translucent frosted background instead of solid white —
`background: rgba(255,255,255,0.55); backdrop-filter: blur(18px) saturate(140%);` (with the `-webkit-` prefix for Safari), `border: 1px solid rgba(255,255,255,0.6)`, and a two-layer shadow — `box-shadow: 0 8px 32px rgba(13,27,42,0.14), 0 0 0 1px rgba(0,163,173,0.08);` (a soft drop shadow plus a hairline teal glow ring). Corner radius, width/height, and the mobile `inset` breakpoint are unchanged from the current implementation.

**Fallback for browsers without `backdrop-filter` support**: wrapped in `@supports not (backdrop-filter: blur(1px))` — falls back to a solid near-opaque `background: rgba(255,255,255,0.96)` with no blur. Never renders as a see-through, unreadable panel.

**Header** (`.atlas-panel-header`): background goes transparent (the panel's own frosted background shows through), border-bottom becomes `rgba(255,255,255,0.5)`. A new small status dot (7px circle, `background: var(--color-teal)`) sits beside the "Atlas" title, with a soft pulsing glow (`box-shadow` animation, ~2.2s cycle) signaling "available" — subtle, not a badge or counter.

**Header icon buttons** (voice toggle, close): each gets a circular translucent chip background — `background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.6);` — instead of the current bare icon-only treatment. The SVG icons themselves (paths, sizes) are unchanged.

**Message bubbles**: bot bubbles become translucent — `background: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.6);` with a soft shadow, still navy text. User bubbles become a teal gradient — `background: linear-gradient(135deg, var(--color-teal), #007A82);` white text, with a matching soft teal glow shadow. Corner-radius asymmetry (chat-bubble convention) is unchanged. The typing indicator reuses the same translucent-bubble treatment as bot messages.

**Input row**: the text input becomes a translucent pill — `background: rgba(255,255,255,0.55); border: 1.5px solid rgba(0,163,173,0.25);` (was solid white with a light-gray border). The send button becomes the same teal gradient as user bubbles, with a soft glow shadow.

**Launcher** (`.atlas-launcher`): stays a **solid** teal gradient (`linear-gradient(135deg, var(--color-teal), #007A82)`), deliberately **not** given the glass treatment — a fixed floating action button needs to stay reliably visible against whatever page content is behind it (hero photos, light sections, the dark navy footer), and a translucent launcher risks disappearing on some backgrounds. Gets a slow "breathing" glow animation instead: the existing box-shadow's spread/opacity gently pulses on a ~2.6s cycle, matching the header dot's restrained, non-flashy character.

**Animations respect `prefers-reduced-motion: reduce`**: the status-dot pulse and the launcher's breathing glow both get a reduced-motion override (static glow, no animation) — extends the existing pattern already used for the panel-open transition and the typing indicator.

## Cross-page consideration (real risk unique to this feature)

Because the panel is genuinely translucent, its appearance will vary depending on what's currently behind it on the page — a light content section, a hero photo, or the dark navy footer. This is treated as an intentional, expected part of the glass effect (frosted glass "picking up" ambient context is the whole point) rather than a bug to normalize away — but it must be checked across all 5 pages during regression to confirm it reads as premium everywhere, not muddy or illegible over any specific background (particularly the darker hero/footer sections, where white text inside a light frosted panel needs to keep reading clearly, since the panel's own background doesn't change per-context — only the page behind it does).

## Global Constraints

- No build tool, bundler, framework, or npm dependency.
- No JavaScript changes of any kind — this is a CSS + one decorative markup element only.
- Only derived (rgba/gradient) versions of existing tokens are used — `--color-teal` (`#00A3AD`), `--color-navy` (`#0D1B2A`), `--color-white`. No brand-new hex colors introduced. (`#007A82` is a manually-darkened teal used only inside gradients for depth, not a new standalone token — record it as a literal in the CSS, not a new custom property, since it's never used standalone.)
- The launcher must remain solid/opaque, never glass — deliberate exception to the panel-wide translucency, for floating-button visibility.
- `backdrop-filter` must have a working `@supports` fallback to a solid, readable panel — never partially-transparent-and-broken.
- All new animations must respect `prefers-reduced-motion: reduce`.
- No layout/sizing/positioning changes — panel dimensions, mobile breakpoint, z-index (`150`), and DOM structure (aside from the one new status-dot span) are all unchanged from the current implementation.

## Testing

Consistent with the rest of the project: no test framework, no JS changed so no `node --check` needed for this feature.
- Live browser checks: visual comparison against the approved mockup on `index.html`; status dot renders and pulses; header icon buttons show the translucent chip background; both bubble types and the typing indicator show the new glass/gradient treatment; input row and send button restyled correctly; launcher stays solid with the breathing glow.
- Regression-check the glass panel's readability across all 5 pages (particularly over the darker hero-banner and footer sections, per the cross-page consideration above) — confirm text stays legible and the effect reads intentional, not muddy.
- Confirm existing behavior is completely unaffected: open/close, voice toggle, message send, typing delay, reply matching all still work exactly as before (this task changes zero JS).
- The `backdrop-filter` `@supports` fallback path is verified by CSS inspection (confirming the fallback rule exists and is correctly scoped), not by disabling the feature live — consistent with how the voice feature's own browser-support fallback was verified in the prior branch, since this tooling environment can't easily simulate an unsupported browser.
- `prefers-reduced-motion` override verified by CSS inspection (confirming the media query exists and disables both animations), matching the same reasoning.

## Out of Scope

- The other two visual directions considered (Dark Command Console, Gradient-Accent Premium) — not being built now; could be revisited later as alternate themes if ever wanted.
- Any new interactive behavior, layout change, or content change.
- A literal "online/available" status system — the pulsing dot is purely decorative, not tied to any real presence/connectivity state (there is none; Atlas has no backend).
