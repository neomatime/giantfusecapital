# Investment Approach Page Media Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "In the Media" section to `strategies.html` embedding a YouTube interview with Sibonelo Nkosi (Partner, Giantfuse Capital Partners) from Mining Indaba 2025.

**Architecture:** A plain `<iframe>` embed (YouTube's privacy-enhanced `youtube-nocookie.com` domain), no JS, no build step — mirrors the existing Google Maps iframe pattern on the Contact page. Two files: `strategies.html` (new section markup) and `assets/css/pages/strategies.css` (new page-specific CSS rule).

**Tech Stack:** Plain HTML/CSS. No build tool, no npm dependency, no JavaScript.

**Branch:** `feat/strategies-media-video`, created from `main`.

## Global Constraints

- No build tool, bundler, framework, or npm dependency — a hand-written `<iframe>`, not a library.
- Embed domain must be `youtube-nocookie.com`, not `youtube.com`.
- No `?start=` parameter on the embed URL — plays from the beginning.
- Reuses existing tokens only: `--radius-md`, the existing `0 4px 16px rgba(13, 27, 42, 0.1)` shadow value already used elsewhere on this site, and the existing `.section` / `.container` / `.section-heading` / `.text-teal` classes.
- The new `.video-embed` CSS rule lives only in `assets/css/pages/strategies.css` (page-specific — this is the first video embed on the site, so per this project's "duplicate until a third use" convention it does not go in a shared stylesheet).

---

### Task 1: Add the "In the Media" section

**Files:**
- Modify: `strategies.html`
- Modify: `assets/css/pages/strategies.css`

- [ ] **Step 1: Insert the new section markup**

In `strategies.html`, find:

```html
    </section>

    <section class="closing-cta" data-reveal>
```

Replace it with:

```html
    </section>

    <section class="section" data-reveal>
      <div class="container">
        <div class="section-heading">
          <h2>In the <span class="text-teal">Media</span></h2>
          <p>Sibonelo Nkosi, Partner at Giantfuse Capital Partners, speaks with Assay TV at Mining Indaba 2025 about our focus on battery metals and the role of ESG in evaluating opportunities.</p>
        </div>
        <div class="video-embed">
          <iframe src="https://www.youtube-nocookie.com/embed/tTkAxtqkTtY" title="Sibonelo Nkosi, Giantfuse Capital Partners — 121 Mining Investment Cape Town, February 2025" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" loading="lazy" allowfullscreen></iframe>
        </div>
      </div>
    </section>

    <section class="closing-cta" data-reveal>
```

(This is the only occurrence of `<section class="closing-cta" data-reveal>` in the file, so the find/replace is unambiguous.)

- [ ] **Step 2: Add the video-embed CSS**

In `assets/css/pages/strategies.css`, find the end of the file:

```css
.strategy-detail-card[id] {
  scroll-margin-top: calc(var(--navbar-height) + var(--space-16));
}
```

Replace it with:

```css
.strategy-detail-card[id] {
  scroll-margin-top: calc(var(--navbar-height) + var(--space-16));
}

.video-embed {
  max-width: 800px;
  margin: 0 auto;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(13, 27, 42, 0.1);
}
.video-embed iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
```

- [ ] **Step 3: Verify in the browser**

Start the dev server (`preview_start` name `giantfuse`), navigate to `strategies.html`. Confirm:
- The "In the Media" section renders between the "Our Investment Approach" timeline and the closing CTA, in that position (not before the timeline, not after the closing CTA).
- The video iframe loads and is visibly the correct video (title bar inside the YouTube player should read "Sibonelo Nkosi, Giantfuse Capital Partners - 121 Mining Investment Cape Town February 2025" once loaded, or can be confirmed via the iframe's `src` attribute pointing at `https://www.youtube-nocookie.com/embed/tTkAxtqkTtY`).
- The embed is centered, capped at 800px wide, with rounded corners and a soft shadow — not full-bleed edge-to-edge.
- Resize to mobile width (375×812) and confirm the embed scales down responsively (stays 16:9, no overflow/horizontal scroll).
- No console errors.
- Confirm the rest of the page (platform stats, strategy cards, timeline, closing CTA) is unaffected — nothing shifted or broke above/below the new section.

- [ ] **Step 4: Commit**

```bash
git add strategies.html assets/css/pages/strategies.css
git commit -m "feat: add media video section to Investment Approach page"
```

---

### Task 2: Regression check and merge

**Files:** none (verification only, plus whatever Step 2 below needs if problems are found).

- [ ] **Step 1: Quick regression check**

Confirm the other 4 pages (`index.html`, `about.html`, `leadership.html`, `contact.html`) are unaffected — this branch only touches `strategies.html` and its page-specific stylesheet, so a quick spot-check (each page loads, zero console errors) is sufficient, not a full walkthrough.

- [ ] **Step 2: Fix any problems found**

Only if Step 1 surfaces an issue. Commit any fix with a message describing the problem and the fix.

- [ ] **Step 3: Merge to main**

```bash
git checkout main
git pull
git merge feat/strategies-media-video
git push origin main
git branch -d feat/strategies-media-video
```
