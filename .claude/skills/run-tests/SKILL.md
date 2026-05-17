---
name: run-tests
description: Run the project's automated test suite via `npm test`. Use BEFORE implementing any feature that touches app.js / chords.js / audio.js / keyboard.js / index.html — write the failing test first, confirm the failure is the expected one, then implement until green. Encodes the repo's TDD gate.
---

# Run tests

The chord-trainer repo has a small Node-based test suite (`node --test` + `jsdom`) that runs against the same vanilla JS files the browser loads. Production code stays zero-dep; tests live in `tests/` and only `devDependencies` are added.

This skill is the TDD gate. Always run it twice per feature: once red (before implementation), once green (after).

## Setup (once per clone)

```
npm install
```

Installs `jsdom` only. No browsers, no bundler.

## The loop

### 1. RED — write the failing test first

Before changing any production code, add a test in `tests/<area>.test.js` that asserts the new behavior. Then run:

```
npm test
```

Confirm the failure is the one you expect — e.g. `playChord is not defined`, `expected 60, received undefined`, an assertion on a value your code doesn't yet produce. **If the failure is a syntax error, a wrong import path, or an unrelated assertion, the test is broken — fix the test, not the production code.** A test that fails for the wrong reason gives you no signal when you implement.

### 2. GREEN — implement until tests pass

Make the smallest production change that turns the failing test green. Re-run `npm test` after each edit. All suites must pass before the task is done — never mark a feature complete with red tests.

### 3. Refactor (optional)

With tests green, you can safely simplify or rename. Run `npm test` after each refactor to confirm nothing regressed.

## File layout

```
tests/
  helpers.js        # loadPage(), shared stubs for Soundfont/AudioContext
  chords.test.js    # pure logic on buildChordPool / getRandomChord
  audio.test.js     # MIDI math, scheduling, mocked Soundfont
  app.test.js       # jsdom integration — reveal click → playChord wiring
```

## Mocking conventions

- **Never** load the real soundfont (the MP3 samples) in tests. `tests/helpers.js` exposes a `Soundfont` mock whose `.instrument()` resolves to `{ play: spy, stop: spy }`. Use it via `loadPage()`.
- **Never** instantiate a real `AudioContext` — jsdom doesn't have Web Audio. `helpers.js` stubs `window.AudioContext` with a minimal shape (`currentTime`, `state`, `resume()`).
- Assert on calls to the mock (`spy.calls`, `spy.callCount`), not on actual audio output.

## What NOT to do

- Don't skip a failing test to "fix later" — fix it or revert the change.
- Don't add a bundler, Vite, Webpack, or a browser test runner (Karma, Mocha-in-browser). `node --test` + `jsdom` is enough for this app's surface area.
- Don't add tests that depend on real network calls or real audio playback — they're flaky and they're not what these tests are for.
- Don't commit `node_modules/` (already in `.gitignore`).
- Don't add `devDependencies` casually — every new one is a maintenance cost on a project that was zero-dep until tests landed.
