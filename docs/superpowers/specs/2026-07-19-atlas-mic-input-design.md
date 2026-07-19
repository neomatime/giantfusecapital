# Atlas Microphone Input — Design Spec

Date: 2026-07-19
Status: Approved for planning

## Purpose

Let visitors dictate their message to Atlas instead of typing, using the browser's native speech recognition. A mic button sits in the input row; tapping it starts listening, and once the visitor stops speaking, the recognized text fills the input box — it is never auto-sent, so the visitor can review or correct it before pressing Send (explicit user decision, since speech recognition commonly mishears names/numbers/jargon).

**This is a deliberate, disclosed exception to the widget's established "no network calls" rule.** The only practical way to do speech-to-text without building the site's first real backend is the browser's native `SpeechRecognition` API, which — on Chrome/Edge, the majority of visitors — streams the recorded audio to the browser vendor's own speech service for transcription, not on-device. The user explicitly accepted this tradeoff rather than build backend infrastructure. Atlas's existing text-to-speech (`speechSynthesis`) remains fully on-device and network-free; only this new mic-input feature makes an external call, and only for the few seconds the mic is actively listening. This must be disclosed to the visitor (see Behavior below), not silently shipped as if it were private.

## Architecture

Extends the existing three widget files — no new files:
- `components/atlas-widget.html` — a new mic `<button>` added to the input row, before the text input; the input itself gets wrapped in a small container so a "Listening..." overlay can sit on top of it during dictation.
- `assets/css/atlas-widget.css` — idle/listening states for the mic button (translucent chip → glowing pulsing teal circle, matching the launcher's existing "breathing" language), plus the listening overlay and its animated waveform bars.
- `assets/js/atlas-widget.js` — feature-detects `window.SpeechRecognition || window.webkitSpeechRecognition`; if present, wires the mic button to a single-utterance recognition session (`continuous = false`, `interimResults = false`) that fills `#atlas-input` with the final transcript on success, hides the button if unsupported (same fallback pattern already used for the voice-output toggle).

## Visual Design

**Mic button** (`.atlas-mic`): 36px circle, positioned first in the input row (mic → input → send), matching `.atlas-send`'s size. Idle state matches the header's translucent icon-chip treatment (`background: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.6); color: var(--color-slate);`). **Listening state** (`.atlas-mic.is-listening`): swaps to the same teal gradient as the send button and launcher, with a pulsing glow (`box-shadow` animation, ~1.4s cycle) — the same "breathing" visual language already established, not a new animation style.

**Listening overlay**: the text input is wrapped in `.atlas-input-wrap` (`position: relative`). While listening, an absolutely-positioned overlay (`.atlas-mic-wave`, same pill shape/background as the input, teal border) covers the input and shows the word "Listening" plus four small animated bars (a simple live-waveform cue, bars bouncing at staggered delays) — the input's own text becomes invisible underneath (`color: transparent`) so there's no visual clash, and reappears once the transcript fills it after recognition ends.

**Disclosure**: the first time the visitor starts listening (once per page load — matches the widget's existing "no cross-page/session persistence" convention, so this is not a permanent, naggy notice, and not something that needs localStorage), a small centered "system note" appears in the message transcript — visually distinct from a normal chat bubble (`.atlas-message-system`: no bubble background, small muted-gray centered text) — reading: *"Voice input uses your browser's built-in speech recognition, which sends your recording to your browser's speech service to transcribe it."* This is plain, factual, not alarmist, and satisfies the disclosure requirement without persistent clutter.

## Behavior

- Clicking the mic button (while idle) starts a recognition session: sets `.atlas-mic.is-listening` and `.atlas-input-wrap.is-listening`, shows the disclosure system-note if this is the first time listening has started this page load, and begins listening.
- Clicking the mic button again while listening stops the session early (`recognition.stop()`).
- On a successful result, the recognized transcript fills `#atlas-input`'s value (does **not** submit the form), listening state clears, and the visitor can edit before pressing Send — exactly like typed input from this point on.
- On `no-speech` (timeout with nothing heard) or any other non-permission error, listening state simply clears with no transcript — no message, no disruption, matches the idle state's normal appearance.
- On `not-allowed` (the visitor denied microphone permission, or the browser blocks it), listening state clears **and** a second, similarly-styled system note appears: *"Microphone access was blocked. You can still type your message."* — a clear, actionable explanation rather than a silent no-op.
- If `SpeechRecognition`/`webkitSpeechRecognition` doesn't exist on `window` (feature-detected once, mirroring the existing `voiceSupported` pattern for text-to-speech), the mic button is hidden entirely (`hidden = true`) — no broken/dead control shown.
- The mic button's own state and any in-progress recognition session are stopped/reset when the panel closes (`setOpen(false)`, covering the close button, Escape, and the launcher toggle) — consistent with how in-progress speech output is already cancelled on close.

## Global Constraints

- No build tool, bundler, framework, or npm dependency.
- **This feature alone is a disclosed exception to the widget's "no network calls" rule** — the audio recording is sent to the browser vendor's speech service while actively listening. Text-to-speech (`speechSynthesis`) remains fully on-device and unaffected.
- Recognized speech always fills the input box; it is never auto-submitted.
- The mic button must not render as interactive/visible when `SpeechRecognition`/`webkitSpeechRecognition` is unavailable.
- A one-time (per page load, not persisted) disclosure note must appear in the chat transcript the first time listening starts.
- A `not-allowed` permission error must show a clear, one-time-per-occurrence explanatory note; other errors fail silently back to idle.
- All new animations (mic pulse, waveform bars) must be disabled under `prefers-reduced-motion: reduce`.
- Reuses existing tokens only: `--color-teal`, `--color-slate`, `--color-white`, `--radius-full`, `--space-*`. Mic button matches `.atlas-send`'s existing 36px sizing.
- The panel's own open/close/z-index/layout behavior is unchanged — this only adds to the existing input row.

## Testing

Consistent with the rest of the project: no test framework, and this feature is inherently impossible to fully exercise headlessly (speech recognition requires real audio input and a real permission prompt, neither of which this project's browser-automation tooling can produce).
- `node --check` on the updated `assets/js/atlas-widget.js`.
- Live browser checks: mic button renders in idle state; clicking it sets the listening visual state (button glow/pulse, input overlay with waveform) — this can be verified by manually invoking the wiring's state-setting code path even without real microphone audio, since the actual `SpeechRecognition.start()` call itself can't be exercised by tooling; the recognized-transcript-fills-input path can be verified by manually invoking the `onresult` handler with a synthetic event shape; the `not-allowed` error path can be verified by manually invoking `onerror` with a synthetic `{error: 'not-allowed'}` event; confirm the disclosure note appears exactly once per page load, not on a second listening session; confirm the mic button is absent when `window.SpeechRecognition`/`window.webkitSpeechRecognition` are stubbed to `undefined` before `init()` runs; confirm listening state and the mic button both reset when the panel is closed mid-listen.
- Regression: confirm typing still works exactly as before, confirm the voice-output toggle and existing reply-matching are unaffected, confirm zero console errors across all 5 pages.

## Out of Scope

- Live interim/partial transcription appearing word-by-word while speaking (only the final transcript, once recognition ends, fills the box) — explicitly ruled out by the "review before sending" decision.
- Auto-submitting recognized speech.
- Any language/locale picker for recognition — uses the browser's default recognition language, not hardcoded.
- A real backend-based transcription service — explicitly ruled out; this feature exists specifically because building one was rejected as too large an undertaking for this static site.
- Persisting the disclosure note's "already shown" state across page loads (resets every load, matching the widget's existing no-persistence convention).
