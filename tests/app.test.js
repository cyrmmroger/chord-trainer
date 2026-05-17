const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage, startTestSession, clickReveal, flush } = require('./helpers');

test('app: page boot does not fetch the soundfont', async () => {
  const { soundfontMock } = loadPage();
  await flush();
  assert.equal(soundfontMock.instrument.calls.length, 0);
});

test('app: clicking reveal plays the chord — one play call per interval', async () => {
  const { window, document, instrumentMock } = loadPage();
  startTestSession(window);
  await flush();

  const chord = window.state.currentChord;
  assert.ok(chord, 'a chord should be displayed after startSession');
  const expectedNoteCount = chord.intervals.length;

  clickReveal(document);
  await flush();

  assert.equal(instrumentMock.play.calls.length, expectedNoteCount);
  const midis = instrumentMock.play.calls.map(args => args[0]);
  // Array.from converts the jsdom-realm intervals to a Node-realm array so
  // deepEqual doesn't fail on cross-realm prototype mismatch.
  const expected = Array.from(chord.intervals).map(iv => 60 + chord.root + iv);
  assert.deepEqual(midis, expected);
});

test('app: clicking reveal a second time (hide) does not replay', async () => {
  const { window, document, instrumentMock } = loadPage();
  startTestSession(window);
  await flush();

  clickReveal(document); // show + play
  await flush();
  const firstCount = instrumentMock.play.calls.length;

  clickReveal(document); // hide — no new play
  await flush();
  assert.equal(instrumentMock.play.calls.length, firstCount);
});

test('app: selecting arpeggio mode → reveal schedules notes with ascending times', async () => {
  const { window, document, instrumentMock } = loadPage();
  const arpRadio = document.getElementById('playback-arpeggio');
  assert.ok(arpRadio, 'playback-arpeggio radio should exist in the DOM');
  arpRadio.checked = true;
  arpRadio.dispatchEvent(new window.Event('change'));

  startTestSession(window);
  await flush();
  clickReveal(document);
  await flush();

  const times = instrumentMock.play.calls.map(args => args[1]);
  assert.ok(times.length >= 2);
  for (let i = 1; i < times.length; i++) {
    assert.ok(times[i] > times[i - 1], `arpeggio times should ascend, got ${times}`);
  }
});

test('app: chord (block) mode is selected by default — all notes same time', async () => {
  const { window, document, instrumentMock } = loadPage();
  startTestSession(window);
  await flush();
  clickReveal(document);
  await flush();

  const times = instrumentMock.play.calls.map(args => args[1]);
  assert.equal(new Set(times).size, 1, `block mode should schedule all notes at one time, got ${times}`);
});

test('app: advancing to the next chord stops in-flight notes', async () => {
  const { window, document, instrumentMock } = loadPage();
  startTestSession(window);
  await flush();
  clickReveal(document);
  await flush();
  assert.ok(instrumentMock.play.calls.length > 0);

  window.showNextChord();
  await flush();

  assert.ok(instrumentMock.stop.calls.length >= 1, 'stopAllNotes should fire on chord change');
});

test('app: clicking Stop cuts in-flight notes', async () => {
  const { window, document, instrumentMock } = loadPage();
  startTestSession(window);
  await flush();
  clickReveal(document);
  await flush();

  document.getElementById('btn-stop').click();
  await flush();

  assert.ok(instrumentMock.stop.calls.length >= 1);
});

// ── Playback-mode segmented control ────────────────────────────────────────

test('app: playback mode defaults to chord (block) — block radio is checked', async () => {
  const { document } = loadPage();
  const blockRadio = document.getElementById('playback-block');
  const arpRadio = document.getElementById('playback-arpeggio');
  assert.ok(blockRadio && arpRadio, 'both playback-mode radios should exist');
  assert.equal(blockRadio.checked, true);
  assert.equal(arpRadio.checked, false);
});

test('app: switching back from arpeggio to chord clears state.arpeggio', async () => {
  const { window, document } = loadPage();
  const blockRadio = document.getElementById('playback-block');
  const arpRadio = document.getElementById('playback-arpeggio');

  arpRadio.checked = true;
  arpRadio.dispatchEvent(new window.Event('change'));
  assert.equal(window.state.arpeggio, true);

  blockRadio.checked = true;
  blockRadio.dispatchEvent(new window.Event('change'));
  assert.equal(window.state.arpeggio, false);
});

// ── Replay button ───────────────────────────────────────────────────────────

test('app: replay button is hidden at boot', async () => {
  const { document } = loadPage();
  const replayBtn = document.getElementById('btn-replay-chord');
  assert.ok(replayBtn, 'btn-replay-chord element should exist');
  assert.ok(replayBtn.classList.contains('hidden'));
});

test('app: replay button shows when reveal opens the keyboard, hides when reveal closes it', async () => {
  const { window, document } = loadPage();
  startTestSession(window);
  await flush();
  const replayBtn = document.getElementById('btn-replay-chord');

  assert.ok(replayBtn.classList.contains('hidden'), 'hidden before reveal');
  clickReveal(document);
  await flush();
  assert.ok(!replayBtn.classList.contains('hidden'), 'visible after reveal opens keyboard');
  clickReveal(document);
  await flush();
  assert.ok(replayBtn.classList.contains('hidden'), 'hidden again after reveal closes keyboard');
});

test('app: clicking replay plays the current chord — MIDI numbers match state.currentChord', async () => {
  const { window, document, instrumentMock } = loadPage();
  startTestSession(window);
  await flush();
  clickReveal(document);
  await flush();
  const playsAfterReveal = instrumentMock.play.calls.length;

  const chord = window.state.currentChord;
  const expected = Array.from(chord.intervals).map(iv => 60 + chord.root + iv);

  document.getElementById('btn-replay-chord').click();
  await flush();

  const replayPlays = instrumentMock.play.calls.slice(playsAfterReveal);
  const midis = replayPlays.map(args => args[0]);
  assert.deepEqual(midis, expected);
});

test('app: clicking replay multiple times triggers play each time', async () => {
  const { window, document, instrumentMock } = loadPage();
  startTestSession(window);
  await flush();
  clickReveal(document);
  await flush();

  const noteCount = window.state.currentChord.intervals.length;
  const after1 = instrumentMock.play.calls.length;

  const replayBtn = document.getElementById('btn-replay-chord');
  replayBtn.click();
  await flush();
  replayBtn.click();
  await flush();
  replayBtn.click();
  await flush();

  assert.equal(instrumentMock.play.calls.length, after1 + noteCount * 3);
});

test('app: replay respects the playback mode (arpeggio → ascending times)', async () => {
  const { window, document, instrumentMock } = loadPage();
  const arpRadio = document.getElementById('playback-arpeggio');
  arpRadio.checked = true;
  arpRadio.dispatchEvent(new window.Event('change'));

  startTestSession(window);
  await flush();
  clickReveal(document);
  await flush();
  const playsBefore = instrumentMock.play.calls.length;

  document.getElementById('btn-replay-chord').click();
  await flush();

  const replayPlays = instrumentMock.play.calls.slice(playsBefore);
  const times = replayPlays.map(args => args[1]);
  assert.ok(times.length >= 2);
  for (let i = 1; i < times.length; i++) {
    assert.ok(times[i] > times[i - 1], `arpeggio replay times should ascend, got ${times}`);
  }
});

test('app: replay calls stopAllNotes before playChord so notes do not pile up', async () => {
  const { window, document, instrumentMock } = loadPage();
  startTestSession(window);
  await flush();
  clickReveal(document);
  await flush();

  const stopBefore = instrumentMock.stop.calls.length;

  document.getElementById('btn-replay-chord').click();
  await flush();

  assert.equal(
    instrumentMock.stop.calls.length,
    stopBefore + 1,
    'each replay should trigger exactly one stop',
  );
});

test('app: replay hides when advancing to the next chord', async () => {
  const { window, document } = loadPage();
  startTestSession(window);
  await flush();
  clickReveal(document);
  await flush();
  const replayBtn = document.getElementById('btn-replay-chord');
  assert.ok(!replayBtn.classList.contains('hidden'), 'visible while keyboard open');

  window.showNextChord();
  await flush();

  assert.ok(replayBtn.classList.contains('hidden'), 'hidden after chord advance');
});
