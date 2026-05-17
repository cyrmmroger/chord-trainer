const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage, flush } = require('./helpers');

test('audio: no soundfont fetch at boot — only on first playChord', async () => {
  const { soundfontMock } = loadPage();
  assert.equal(soundfontMock.instrument.calls.length, 0);
});

test('audio: playChord(0, [0,4,7], block) triggers play at MIDI 60/64/67 simultaneously', async () => {
  const { window, soundfontMock, instrumentMock } = loadPage();
  window.playChord(0, [0, 4, 7], { mode: 'block' });
  await flush();
  assert.equal(soundfontMock.instrument.calls.length, 1, 'initAudio called exactly once');
  assert.equal(instrumentMock.play.calls.length, 3);
  const midis = instrumentMock.play.calls.map(args => args[0]);
  assert.deepEqual(midis, [60, 64, 67]);
  const times = instrumentMock.play.calls.map(args => args[1]);
  assert.equal(new Set(times).size, 1, 'all three notes share the same scheduled time');
});

test('audio: playChord(2, [0,3,7], arpeggio) triggers play at MIDI 62/65/69 with ascending times', async () => {
  const { window, instrumentMock } = loadPage();
  window.playChord(2, [0, 3, 7], { mode: 'arpeggio' });
  await flush();
  const midis = instrumentMock.play.calls.map(args => args[0]);
  assert.deepEqual(midis, [62, 65, 69]);
  const times = instrumentMock.play.calls.map(args => args[1]);
  assert.ok(times[0] < times[1] && times[1] < times[2], `arpeggio times should ascend, got ${times}`);
});

test('audio: initAudio is memoised across multiple playChord calls', async () => {
  const { window, soundfontMock } = loadPage();
  window.playChord(0, [0, 4, 7], { mode: 'block' });
  await flush();
  window.playChord(7, [0, 4, 7], { mode: 'block' });
  await flush();
  window.playChord(5, [0, 3, 7], { mode: 'arpeggio' });
  await flush();
  assert.equal(soundfontMock.instrument.calls.length, 1);
});

test('audio: stopAllNotes calls instrument.stop', async () => {
  const { window, instrumentMock } = loadPage();
  window.playChord(0, [0, 4, 7], { mode: 'block' });
  await flush();
  window.stopAllNotes();
  await flush();
  assert.equal(instrumentMock.stop.calls.length, 1);
});

test('audio: soundfont load failure → subsequent playChord calls do not throw', async () => {
  const { window } = loadPage({ soundfontFails: true });
  // No throw, even after the rejection.
  window.playChord(0, [0, 4, 7], { mode: 'block' });
  await flush();
  window.playChord(0, [0, 4, 7], { mode: 'arpeggio' });
  await flush();
  // If we got here without throwing, the test passes.
  assert.ok(true);
});

test('audio: default mode (no opts) is block', async () => {
  const { window, instrumentMock } = loadPage();
  window.playChord(0, [0, 4, 7]);
  await flush();
  const times = instrumentMock.play.calls.map(args => args[1]);
  assert.equal(new Set(times).size, 1);
});
