// keyboard.js — Renders a one-octave SVG piano keyboard with chord tones highlighted.
// Exposes a single global: renderKeyboard(intervals, root).
//
//   intervals : semitones above the root for each chord tone (any range; collapsed mod 12)
//   root      : semitone 0..11 of the chord root (marked with a small dot)
//
// Loaded as a classic global script in index.html, between chords.js and app.js.

function renderKeyboard(intervals, root) {
  const WHITE_W = 24, WHITE_H = 96;
  const BLACK_W = 14, BLACK_H = 60;
  const WHITE_SEMITONES = [0, 2, 4, 5, 7, 9, 11, 12];
  const BLACK_KEYS = [
    { semi: 1,  after: 0 },
    { semi: 3,  after: 1 },
    { semi: 6,  after: 3 },
    { semi: 8,  after: 4 },
    { semi: 10, after: 5 },
  ];
  const totalW = WHITE_SEMITONES.length * WHITE_W;

  const tones  = new Set(intervals.map(iv => (root + iv) % 12));
  const isOn   = s => tones.has(s % 12);
  const isRoot = s => (s % 12) === (root % 12);

  let svg  = `<svg class="kbd" viewBox="0 0 ${totalW} ${WHITE_H}" preserveAspectRatio="xMidYMid meet">`;
  let dots = '';

  WHITE_SEMITONES.forEach((semi, i) => {
    const cls = ['key', 'white'];
    if (isOn(semi)) cls.push('on');
    svg += `<rect class="${cls.join(' ')}" x="${i * WHITE_W}" y="0" width="${WHITE_W}" height="${WHITE_H}"/>`;
    if (isOn(semi) && isRoot(semi)) {
      dots += `<circle class="root-dot" cx="${i * WHITE_W + WHITE_W / 2}" cy="${WHITE_H - 12}" r="3"/>`;
    }
  });

  BLACK_KEYS.forEach(({ semi, after }) => {
    const cls = ['key', 'black'];
    if (isOn(semi)) cls.push('on');
    const x = (after + 1) * WHITE_W - BLACK_W / 2;
    svg += `<rect class="${cls.join(' ')}" x="${x}" y="0" width="${BLACK_W}" height="${BLACK_H}"/>`;
    if (isOn(semi) && isRoot(semi)) {
      dots += `<circle class="root-dot" cx="${x + BLACK_W / 2}" cy="${BLACK_H - 9}" r="2.5"/>`;
    }
  });

  return svg + dots + '</svg>';
}
