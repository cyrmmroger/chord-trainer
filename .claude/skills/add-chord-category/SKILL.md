---
name: add-chord-category
description: Add a new chord category (e.g. altered, quartal) to the trainer. Use when the user asks to add a chord type, category, or quality group. Handles the two-file update — QUALITIES in chords.js plus a matching data-category toggle in index.html — that CLAUDE.md flags as easy to half-update.
---

# Add chord category

Adding a category is a two-file change. Both must land together or the UI and the pool diverge.

## What to gather from the user

Ask once, in a single AskUserQuestion or compact prompt, for:

1. **Key** — the lowercase identifier used in both files (e.g. `altered`). Must match `[a-z][a-z0-9_]*`.
2. **Display label** — shown on the toggle row (e.g. `Altered dominants`).
3. **Count blurb** — the small grey hint under the toggle (e.g. `7♭9, 7♯9, 7♯11, 7♭13…`).
4. **Qualities** — a list of `{ suffix, name }` pairs. `suffix` is appended to the root glyph (use Unicode ♯ ♭ ° ø, **not** ASCII `#` `b`). `name` is the spoken form used in the label.

If the user provides qualities informally, normalize them into the `{ suffix, name }` shape before showing them for confirmation.

## Step 1 — `chords.js`

Add a new key to `QUALITIES` following the existing shape. Place it at the end of the object so diffs stay clean. Example:

```js
altered: [
  { suffix: '7♭9',  name: 'dominant 7 flat 9' },
  { suffix: '7♯9',  name: 'dominant 7 sharp 9' },
],
```

Do not touch `ROOTS`, `buildChordPool`, or `getRandomChord` — they iterate `QUALITIES[category]` generically.

## Step 2 — `index.html`

Add a new `<label class="toggle-row">` inside the `.categories` block, after the existing toggles. Use the same shape as the existing rows — keep `checked` so the category is on by default.

```html
<label class="toggle-row">
  <input type="checkbox" class="category-toggle" data-category="KEY" checked />
  <span class="toggle-pill"></span>
  <span class="toggle-label">DISPLAY LABEL</span>
  <span class="toggle-count">COUNT BLURB</span>
</label>
```

The `data-category` value **must** exactly match the new key from step 1. This wiring is what `app.js` reads via `toggle.dataset.category` and passes through to `buildChordPool`.

## Step 3 — `app.js` (state default)

If the user wants the new category enabled by default at boot (the common case, matching the `checked` attribute), add the key to the `enabledCategories` array on the `state` object near the top of `app.js`. If they want it off by default, leave `state.enabledCategories` alone and remove `checked` from the toggle in step 2 — but keep the two files consistent.

## Step 4 — verify

No build step. Tell the user to refresh the page (or rely on Live Server) and confirm:
- The new toggle appears in the Chord types card.
- Toggling it off and starting a session never produces chords from the new category.
- Toggling it on and starting a session does produce them.

## What NOT to do

- Do not add tests, a build step, or a package.json — the project is intentionally dependency-free (per CLAUDE.md).
- Do not use ASCII `#` or `b` in suffixes — the display uses Unicode ♯ ♭ ° ø.
- Do not edit `buildChordPool` or `getRandomChord`; the generic loop already handles any new key.
