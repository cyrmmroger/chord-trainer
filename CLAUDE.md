# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project shape

Browser-only piano chord trainer. Plain HTML / CSS / vanilla JS — **no build step, no package manager, no test suite, no dependencies.** Don't add npm/bundler infrastructure unless explicitly asked.

## Running locally

Open `index.html` directly in a browser, or serve it via VS Code's Live Server extension (the dev console will show `Live reload enabled` when Live Server is active — that's expected, not an error).

## Deployment

`main` is auto-deployed to GitHub Pages at https://cyrmmroger.github.io/chord-trainer/. Anything merged to `main` ships immediately — there is no staging environment.

## Architecture

Three scripts loaded as classic globals (not ES modules) from `index.html`, **in this order**:

1. `chords.js` — pure data + helpers. Exports `buildChordPool(enabledCategories)` and `getRandomChord(pool)`. Each chord is `{ display, label, root, intervals }` where `display` is the big glyph string (uses Unicode ♯ ♭ ° ø, not ASCII), `label` is the spoken-form description, `root` is the chord-root semitone (0–11), and `intervals` is the list of semitones above the root for each chord tone.
2. `keyboard.js` — pure renderer. Exports `renderKeyboard(intervals, root)` which returns the SVG string for a one-octave piano with chord tones highlighted and a small dot on the root key. `app.js` injects this into `#kbd-wrap` on every chord.
3. `app.js` — UI, timer, and session state. Single global `state` object holds everything (running/paused flags, interval handle, current chord, pool, counters, settings). All DOM nodes are looked up once at top of file.

**The load order is load-bearing**: `app.js` calls `buildChordPool` / `getRandomChord` / `renderKeyboard` at boot via `init()` and on each chord change. Reversing the order, or duplicating top-level `const` declarations across the files, breaks the page (this exact bug shipped once and was fixed in PR #1).

If you add a new module, follow the same pattern — a new `<script>` tag in `index.html` before `app.js`, exposing functions as globals.

## Conventions worth preserving

- Theme is persisted to `localStorage` under the key `chord-trainer-theme` (`'light'` | `'dark'`); the `light` class is toggled on `<body>`.
- Chord categories live in `QUALITIES` in `chords.js` keyed by the same strings used in `data-category` attributes on the HTML toggles (`triads`, `sevenths`, `extensions`). Adding a category means updating both. Each quality entry must include `intervals` (semitones above root) so the keyboard renderer can light up the right keys.
- Timer ring is an SVG `stroke-dashoffset` animation driven from JS — see `startTimerAnimation` / `stopTimerAnimation` in `app.js`. The dasharray total is `283` (≈ 2π·45).
- The keyboard reveal resets to hidden on every new chord — flashcard flow expects you to attempt the chord first, then reveal. See `showNextChord` in `app.js`.
