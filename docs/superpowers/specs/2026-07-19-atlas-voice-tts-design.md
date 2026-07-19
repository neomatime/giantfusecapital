# Atlas Voice (Text-to-Speech) — Design Spec

Date: 2026-07-19
Status: Approved for planning

## Purpose

Add voice output to the existing Atlas chat widget: Atlas can read its replies aloud using the browser's built-in text-to-speech. Per user decision, this is text-to-speech only (Atlas speaking) — not speech-to-text (the user dictating). Speech-to-text was explicitly ruled out for now because the browser's built-in speech recognition (on Chrome/Edge) sends audio to Google's servers to transcribe, which would violate the widget's existing "no network calls of any kind" constraint. Text-to-speech via `window.speechSynthesis` has no such problem — it runs entirely on-device in every browser that implements it.

## Architecture

No new files. All voice logic is added to the existing `assets/js/atlas-widget.js` — this is a small addition to an existing component's behavior, not a new concern deserving its own file (consistent with the project's "one concern per file, but don't split prematurely" convention).

Uses the native Web Speech API's `SpeechSynthesis` interface (`window.speechSynthesis`, `SpeechSynthesisUtterance`) — no build tool, no npm dependency, no network call. This is the same "zero dependencies, browser-native only" posture the whole Atlas widget already follows.

**Feature detection:** if `window.speechSynthesis` is undefined (older browser, some embedded webviews), the voice toggle button is not rendered at all — no broken/disabled control shown. Checked once during `init()`.

## Visual Design

A new toggle button (`#atlas-voice-toggle`) is added to `.atlas-panel-header` in `components/atlas-widget.html`, positioned between the title block (`Atlas` / `Investor Assistant`) and the existing `#atlas-close-btn`. Same visual treatment as `.atlas-close`: 28px square, `color: var(--color-slate)`, centered icon, flex row alongside the close button (both wrapped in a small flex container so the header's `justify-content: space-between` still puts the title block on the left and both buttons together on the right).

**Two SVG icon states**, swapped via a boolean `voiceOn` flag (no new entries added to the shared `main.js` `ICONS` map — same "inlined directly in the static partial" precedent already used for the rest of `atlas-widget.html`'s icons, since this component is a fetched static partial and can't consume the JS-side `ICONS` map at runtime):
- **Muted (default):** speaker icon with a slash through it.
- **Unmuted:** speaker icon with sound-wave arcs.

`aria-label` swaps between `"Turn Atlas voice on"` / `"Turn Atlas voice off"` to match state, same pattern as `#atlas-close-btn`'s static `aria-label="Close chat"`.

## Behavior

- **Default state:** voice is **off** every page load. No cross-page or cross-session persistence — matches the widget's existing "starts fresh every load" convention (no localStorage, no cookie).
- **Toggling:** clicking `#atlas-voice-toggle` flips a module-level `voiceOn` boolean, swaps the icon and `aria-label`, and if turning voice **off** while a reply is currently being read, immediately calls `speechSynthesis.cancel()` to stop it mid-sentence.
- **What gets spoken:** only Atlas's own bot replies — never the user's typed message (they just typed it; reading it back adds nothing). This includes the greeting message, but only if voice is already on at the moment the greeting is added (turning voice on later does not retroactively speak messages already in the transcript).
- **Speaking a reply:** `matchReply()`'s return value contains an inline `<a href="...">` link (e.g. `...our <a href="strategies.html">Investment Approach</a> page.`). Before speaking, this HTML must be reduced to plain readable text — strip tags, keep the link's visible label as normal words, so speech says "...our Investment Approach page." not literal tag syntax. Implementation: build a detached DOM element, set its `innerHTML` to the reply string, read `.textContent` back out. This is safe here specifically because reply text is always one of the 5 fixed, developer-authored strings from `matchReply()` — never user input — so there's no XSS concern in assigning it to `innerHTML` of a detached (never-appended) element, consistent with the widget's existing rule that only *user*-typed text must avoid raw `innerHTML`.
- **Interruption:** if a new reply arrives while a previous utterance is still speaking (e.g., the visitor sends a second message quickly), the in-progress speech is cut off via `speechSynthesis.cancel()` before the new utterance starts — speech never queues or overlaps. This mirrors the "always show the latest state, don't queue" instinct already used elsewhere in the widget (e.g., a new reply doesn't wait for the typing indicator's minimum display time beyond the fixed `TYPING_DELAY_MS`).
- **Stopping on close:** closing the panel via the Close button, `Escape`, or the launcher toggle immediately calls `speechSynthesis.cancel()` — Atlas must not keep talking after the widget is visually closed. This hooks into the widget's existing `setOpen(false)` path.
- **Voice/rate/pitch:** uses `new SpeechSynthesisUtterance(text)` with no explicit `.voice`, `.rate`, or `.pitch` set — accepts the browser/OS default. No voice-picker UI. Available voices vary wildly by OS and browser; picking a specific one risks picking something unavailable on another visitor's device. This is a deliberate scope cut, not an oversight.

## Global Constraints

- No build tool, bundler, framework, or npm dependency (existing site-wide constraint).
- No network call of any kind — `SpeechSynthesis` must be verified to run on-device only; this is inherent to the API (unlike `SpeechRecognition`, which is out of scope specifically because it isn't).
- Voice starts off by default on every page load; no persistence mechanism.
- Only Atlas's own reply text is ever spoken — never the user's typed input.
- Reply HTML must be reduced to plain text before being passed to `SpeechSynthesisUtterance` — never speak raw tag markup.
- Any in-progress utterance must be cancelled before a new one starts, and on panel close, matching the "no overlapping/orphaned speech" requirement above.
- Toggle button must not render at all when `window.speechSynthesis` is unavailable (feature-detected once in `init()`).
- Reuses existing design tokens: `--color-slate` (icon color, matching `.atlas-close`), same 28px square sizing as `.atlas-close`.

## Testing

Consistent with the rest of the project: no test framework.
- `node --check` on the updated `assets/js/atlas-widget.js`.
- The HTML-to-plain-text stripping helper depends on `document.createElement`, so unlike `matchReply()` it cannot run under plain Node (no `jsdom` in this project) — it is browser-verified only, not `node -e`-tested.
- Live browser checks: toggle button renders and swaps icon/aria-label on click; voice off by default; turning voice on and sending a message speaks the reply aloud with no literal HTML in the speech (verified by inspecting the `SpeechSynthesisUtterance.text` value actually passed to `speechSynthesis.speak()`, since audio output itself can't be asserted programmatically); sending a second message while the first is still speaking cuts off the first (verify via `speechSynthesis.speaking`/cancel call ordering); closing the panel while speaking stops speech immediately; toggle button does not render when `window.speechSynthesis` is stubbed out as undefined; regression-check the existing Atlas behaviors (open/close, typing indicator, reply matching, mobile layout) are unaffected.

## Out of Scope

- Speech-to-text / voice input (explicitly ruled out — see Purpose section).
- Voice/rate/pitch selection UI.
- Persisting the voice on/off preference across page loads or visits.
- Multi-language voice selection (the site and all reply text are English-only; no i18n exists elsewhere on this site either).
