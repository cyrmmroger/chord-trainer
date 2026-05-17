const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./helpers');

test('chords: buildChordPool(["triads"]) returns 12 roots × 6 qualities', () => {
  const { window } = loadPage();
  const pool = window.buildChordPool(['triads']);
  assert.equal(pool.length, 72);
});

test('chords: every pool entry has the expected shape', () => {
  const { window } = loadPage();
  const pool = window.buildChordPool(['triads', 'sevenths', 'extensions']);
  for (const c of pool) {
    assert.equal(typeof c.display, 'string');
    assert.equal(typeof c.label, 'string');
    assert.ok(c.root >= 0 && c.root <= 11, `root in 0..11, got ${c.root}`);
    assert.ok(Array.isArray(c.intervals) && c.intervals.length > 0);
    assert.ok(c.intervals.includes(0), 'intervals should include the root (0)');
  }
});

test('chords: unknown category is silently skipped', () => {
  const { window } = loadPage();
  const pool = window.buildChordPool(['nope']);
  assert.equal(pool.length, 0);
});

test('chords: getRandomChord returns an element of the pool', () => {
  const { window } = loadPage();
  const pool = window.buildChordPool(['triads']);
  for (let i = 0; i < 20; i++) {
    const c = window.getRandomChord(pool);
    assert.ok(pool.includes(c));
  }
});
