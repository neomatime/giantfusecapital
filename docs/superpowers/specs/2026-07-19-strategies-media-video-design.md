# Investment Approach Page — Media Video Embed Design Spec

Date: 2026-07-19
Status: Approved for planning

## Purpose

Embed a YouTube video on `strategies.html` (Investment Approach page): an interview with Sibonelo Nkosi, Partner at Giantfuse Capital Partners, recorded by Assay TV at Mining Indaba 2025 (121 Mining Investment, Cape Town, February 2025), discussing the firm's focus on battery metals demand and the role of ESG in evaluating investment opportunities. Source: `https://www.youtube.com/watch?v=tTkAxtqkTtY` (video ID `tTkAxtqkTtY`).

## Placement

A new section, **"In the Media"**, inserted between the existing `.platform-approach` section ("Our Investment Approach" — the 5-step timeline) and the `.closing-cta` section, at the bottom of the page. Matches the established `.section` + `.container` + `.section-heading` pattern already used by the "Our Core Strategies" section on this same page (`<h2>` with a `<span class="text-teal">` accent word, plus a supporting `<p>`).

## Visual Design

- Heading: `In the <span class="text-teal">Media</span>`
- Supporting caption (the `<p>` under the heading, doubling as context since the video itself carries no on-page identification otherwise): *"Sibonelo Nkosi, Partner at Giantfuse Capital Partners, speaks with Assay TV at Mining Indaba 2025 about our focus on battery metals and the role of ESG in evaluating opportunities."*
- The embed itself: a responsive 16:9 video container, `max-width: 800px`, centered, rounded corners (`var(--radius-md)`) and the site's existing card-shadow convention (`0 4px 16px rgba(13, 27, 42, 0.1)` — same value already used by `.atlas-launcher`/`.atlas-panel` and other elevated elements), rather than full container width — matches how other single focal elements on the site (not full-bleed grids) are sized.
- New CSS lives in `assets/css/pages/strategies.css` (page-specific), not a shared file — this is the first video embed anywhere on the site, so per this project's established "duplicate until a third use" convention, it doesn't get extracted to a shared stylesheet yet.

## Technical Approach

A plain `<iframe>` pointing at YouTube's privacy-enhanced embed domain (`https://www.youtube-nocookie.com/embed/tTkAxtqkTtY`) — no tracking cookie is set until the visitor presses play. This mirrors the Contact page's existing Google Maps embed precedent exactly: a real third-party `<iframe>`, no API key, no JS, no build step. `loading="lazy"` on the iframe defers loading until the section is near the viewport. Starts from the beginning (no `?start=` parameter) — the source URL's `&t=12s` was where the visitor happened to pause it, not a deliberate cue point.

Responsive sizing uses CSS `aspect-ratio: 16 / 9` on the container (not the older padding-bottom-percentage hack) — appropriate for this site since it already relies on comparably modern CSS elsewhere (`backdrop-filter`, custom properties throughout).

## Global Constraints

- No build tool, bundler, framework, or npm dependency — a hand-written `<iframe>`, not a library (e.g. no `lite-youtube-embed` package).
- Uses `youtube-nocookie.com`, not `youtube.com`, for the embed domain.
- No `?start=` parameter — plays from the beginning.
- Reuses existing tokens only: `--radius-md`, the existing `0 4px 16px rgba(13, 27, 42, 0.1)` shadow value, the site's established `.section` / `.container` / `.section-heading` / `text-teal` classes.
- New `.video-embed` CSS rule lives in `assets/css/pages/strategies.css` only (page-specific, first use).

## Testing

Consistent with the rest of the project: no test framework, no JS involved.
- Live browser check: section renders in the correct position (after the timeline, before the closing CTA), video loads and is playable, responsive sizing holds correctly at both mobile and desktop widths, no console errors, no layout shift/overlap with adjacent sections.

## Out of Scope

- Any custom lazy-load/click-to-play JS pattern (e.g. a thumbnail-first "lite embed") — deliberately not built; a plain iframe matches the site's existing simplicity precedent (Google Maps on Contact).
- Adding Sibonelo Nkosi to `data/leadership.json` — he isn't currently represented there; that's a separate, unrelated content decision not requested here.
- Embedding additional videos or building a video gallery/list — this is a single, specific video.
