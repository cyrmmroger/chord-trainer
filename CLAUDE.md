# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project shape

Browser-only piano chord trainer. Plain HTML / CSS / vanilla JS — **no build step, no package manager, no test suite, no dependencies.** Don't add npm/bundler infrastructure unless explicitly asked.

## Running locally

Open `index.html` directly in a browser, or serve it via VS Code's Live Server extension (the dev console will show `Live reload enabled` when Live Server is active — that's expected, not an error).

## Deployment

`main` is auto-deployed to GitHub Pages at https://cyrmmroger.github.io/chord-trainer/. Anything merged to `main` ships immediately — there is no staging environment.

## Architecture

Two scripts loaded as classic globals (not ES modules) from `index.html`, **in this order**:

1. `chords.js` — pure data + helpers. Exports two globals: `buildChordPool(enabledCategories)` and `getRandomChord(pool)`. Each chord is `{ display, label }` where `display` is the big glyph string (uses Unicode ♯ ♭ ° ø, not ASCII) and `label` is the spoken-form description.
2. `app.js` — UI, timer, and session state. Single global `state` object holds everything (running/paused flags, interval handle, current chord, pool, counters, settings). All DOM nodes are looked up once at top of file.

**The load order is load-bearing**: `app.js` calls `buildChordPool` / `getRandomChord` at boot via `init()`. Reversing the order, or duplicating top-level `const` declarations across the two files, breaks the page (this exact bug shipped once and was fixed in PR #1).

If you add a new module, follow the same pattern — a new `<script>` tag in `index.html` before `app.js`, exposing functions as globals.

## Conventions worth preserving

- Theme is persisted to `localStorage` under the key `chord-trainer-theme` (`'light'` | `'dark'`); the `light` class is toggled on `<body>`.
- Chord categories live in `QUALITIES` in `chords.js` keyed by the same strings used in `data-category` attributes on the HTML toggles (`triads`, `sevenths`, `extensions`). Adding a category means updating both.
- Timer ring is an SVG `stroke-dashoffset` animation driven from JS — see `startTimerAnimation` / `stopTimerAnimation` in `app.js`. The dasharray total is `283` (≈ 2π·45).
