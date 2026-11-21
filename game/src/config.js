// The Curious Attic — Spot the Difference: shared constants.
// One logical frame of 1280 x 800 holds the header and two picture panels.
// Every number here is a design decision the other files read, never guess.

export const VIEW = { width: 1280, height: 800 };

export const PANEL = { width: 600, height: 560, top: 118, gap: 40 };
export const PANEL_LEFT_X = 20;
export const PANEL_RIGHT_X = PANEL_LEFT_X + PANEL.width + PANEL.gap;

export const HEADER = { height: 96 };

export const LEVELS = [
  { id: 'attic', name: 'The Curious Attic', subtitle: 'Level 1 — a dusty attic full of secrets', timeLimitSec: 150, par: 7 },
  { id: 'garden', name: 'The Midnight Garden', subtitle: 'Level 2 — fireflies over the fountain', timeLimitSec: 150, par: 8 },
  { id: 'bookshop', name: 'The Old Bookshop', subtitle: 'Level 3 — rain on the window, books everywhere', timeLimitSec: 180, par: 9 },
];

export const SCORING = {
  perFind: 100,
  comboStep: 25,
  comboWindowSec: 4,
  timeBonusPerSec: 10,
  wrongClickPenaltySec: 5,
  hintsPerLevel: 3,
  hintPulseSec: 2.5,
};

export const COLOURS = {
  page: '#14101d',
  header: '#1d1830',
  panelFrame: '#3a2f5b',
  panelFrameFound: '#7ec850',
  hudText: '#f5eeda',
  hudDim: '#b9aec9',
  accent: '#ffcf5c',
  danger: '#ff5d5d',
  foundRing: '#ff4747',
  foundRingSoft: 'rgba(255, 71, 71, 0.25)',
  hintRing: '#ffd94d',
  timerGood: '#7ec850',
  timerWarn: '#ffb03a',
  timerBad: '#ff5d5d',
};
