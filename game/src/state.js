// The game state: one screen at a time, one level at a time.
// The state machine knows nothing about drawing or sound; it only decides
// what a click means, what the clock says and what the score is.

import { LEVELS, SCORING } from './config.js';
import { differencesFor } from './differences.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAYING = 'playing';
export const SCREEN_LEVEL_COMPLETE = 'level-complete';
export const SCREEN_VICTORY = 'victory';
export const SCREEN_LEVEL_FAILED = 'level-failed';

function distance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

export class GameState {
  constructor() {
    this.screen = SCREEN_TITLE;
    this.levelIndex = 0;
    this.diffs = [];
    this.found = new Set();
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.timeLeft = 0;
    this.hintsLeft = SCORING.hintsPerLevel;
    this.elapsed = 0;
    this.totalFound = 0;
    this.totalDiffs = 0;
    this.totalClicks = 0;
    this.correctClicks = 0;
    this.levelScores = [];
    this.particles = [];
    this.toasts = [];
    this.wrongMarks = [];
    this.hintPulse = null;
    this.muted = false;
    this.lastFindLabel = '';
    this.lastPoints = 0;
    this.levelBonus = 0;
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  get foundCount() {
    return this.found.size;
  }

  get remaining() {
    return this.diffs.length - this.found.size;
  }

  get accuracy() {
    if (this.totalClicks === 0) return 100;
    return Math.round((this.correctClicks / this.totalClicks) * 100);
  }

  get hintActive() {
    return this.hintPulse !== null && this.elapsed < this.hintPulse.until;
  }

  startGame() {
    this.score = 0;
    this.totalFound = 0;
    this.totalClicks = 0;
    this.correctClicks = 0;
    this.levelScores = [];
    this.totalDiffs = LEVELS.reduce((sum, level) => sum + differencesFor(level.id).length, 0);
    this.startLevel(0);
  }

  startLevel(index) {
    this.levelIndex = index;
    this.diffs = differencesFor(this.level.id);
    this.found = new Set();
    this.combo = 0;
    this.comboTimer = 0;
    this.timeLeft = this.level.timeLimitSec;
    this.hintsLeft = SCORING.hintsPerLevel;
    this.particles = [];
    this.toasts = [];
    this.wrongMarks = [];
    this.hintPulse = null;
    this.levelBonus = 0;
    this.screen = SCREEN_PLAYING;
  }

  retryLevel() {
    this.startLevel(this.levelIndex);
  }

  toTitle() {
    this.screen = SCREEN_TITLE;
    this.levelIndex = 0;
    this.diffs = differencesFor(LEVELS[0].id);
    this.found = new Set();
    this.timeLeft = LEVELS[0].timeLimitSec;
  }

  nextLevel() {
    if (this.levelIndex + 1 < LEVELS.length) {
      this.startLevel(this.levelIndex + 1);
    } else {
      this.screen = SCREEN_VICTORY;
    }
  }

  // A click at panel coordinates (the same spot on either picture).
  // Returns 'found', 'wrong' or 'ignored'.
  clickAt(px, py) {
    if (this.screen !== SCREEN_PLAYING) return 'ignored';
    this.totalClicks += 1;
    for (const diff of this.diffs) {
      if (this.found.has(diff.id)) continue;
      if (distance(px, py, diff.x, diff.y) <= diff.r) {
        this.found.add(diff.id);
        this.correctClicks += 1;
        this.totalFound += 1;
        this.combo = this.comboTimer > 0 ? this.combo + 1 : 1;
        this.comboTimer = SCORING.comboWindowSec;
        const points = SCORING.perFind + (this.combo - 1) * SCORING.comboStep;
        this.score += points;
        this.lastFindLabel = diff.label;
        this.lastPoints = points;
        this.toasts = [{ text: `Found ${diff.label}! +${points}`, ttl: 2.2 }];
        this.spawnBurst(diff.x, diff.y);
        if (this.found.size === this.diffs.length) this.completeLevel();
        return 'found';
      }
    }
    this.combo = 0;
    this.comboTimer = 0;
    this.timeLeft = Math.max(0, this.timeLeft - SCORING.wrongClickPenaltySec);
    this.wrongMarks.push({ x: px, y: py, ttl: 0.9 });
    this.toasts = [{ text: `Not a difference — minus ${SCORING.wrongClickPenaltySec}s`, ttl: 1.6 }];
    return 'wrong';
  }

  completeLevel() {
    this.levelBonus = Math.ceil(this.timeLeft) * SCORING.timeBonusPerSec;
    this.score += this.levelBonus;
    this.levelScores.push({
      name: this.level.name,
      found: this.diffs.length,
      bonus: this.levelBonus,
    });
    this.screen = SCREEN_LEVEL_COMPLETE;
  }

  useHint() {
    if (this.screen !== SCREEN_PLAYING || this.hintsLeft <= 0) return null;
    const unfound = this.diffs.filter((diff) => !this.found.has(diff.id));
    if (unfound.length === 0) return null;
    this.hintsLeft -= 1;
    const diff = unfound[Math.floor(Math.random() * unfound.length)];
    this.hintPulse = { id: diff.id, until: this.elapsed + SCORING.hintPulseSec };
    this.toasts = [{ text: 'Hint: look where the gold ring pulses', ttl: 2 }];
    return diff;
  }

  hintTarget() {
    if (!this.hintActive) return null;
    return this.diffs.find((diff) => diff.id === this.hintPulse.id) ?? null;
  }

  spawnBurst(x, y) {
    for (let i = 0; i < 16; i += 1) {
      const angle = (i / 16) * Math.PI * 2;
      const speed = 60 + (i % 5) * 22;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        life: 0,
        maxLife: 0.7 + (i % 3) * 0.15,
        colour: i % 3 === 0 ? '#ffd94d' : i % 3 === 1 ? '#ff8a5c' : '#7ec850',
      });
    }
  }

  update(dt) {
    this.elapsed += dt;
    for (const particle of this.particles) {
      particle.life += dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 140 * dt;
    }
    this.particles = this.particles.filter((p) => p.life < p.maxLife);
    for (const toast of this.toasts) toast.ttl -= dt;
    this.toasts = this.toasts.filter((t) => t.ttl > 0);
    for (const mark of this.wrongMarks) mark.ttl -= dt;
    this.wrongMarks = this.wrongMarks.filter((m) => m.ttl > 0);
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }
    if (this.screen === SCREEN_PLAYING) {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.screen = SCREEN_LEVEL_FAILED;
      }
    }
  }

  // --- Deterministic states for screenshots (?shot=). These stage a real
  // game state through the same fields the live game uses, so a screenshot
  // is a frame the game itself would draw.

  stagePlay(levelIndex, foundIds, timeLeft, score) {
    this.totalFound = foundIds.length;
    this.totalClicks = foundIds.length;
    this.correctClicks = foundIds.length;
    this.totalDiffs = LEVELS.reduce((sum, level) => sum + differencesFor(level.id).length, 0);
    this.startLevel(levelIndex);
    for (const id of foundIds) this.found.add(id);
    this.timeLeft = timeLeft;
    this.score = score;
    this.screen = SCREEN_PLAYING;
  }

  stageVictory(totalScore, found, total, clicks) {
    this.screen = SCREEN_VICTORY;
    this.score = totalScore;
    this.totalFound = found;
    this.totalDiffs = total;
    this.totalClicks = clicks;
    this.correctClicks = found;
    // Behind the overlay, the last level stands complete, every ring on.
    this.levelIndex = LEVELS.length - 1;
    this.diffs = differencesFor(this.level.id);
    this.found = new Set(this.diffs.map((diff) => diff.id));
    this.levelScores = LEVELS.map((level, i) => ({
      name: level.name,
      found: differencesFor(level.id).length,
      bonus: [120, 90, 150][i] ?? 0,
    }));
  }
}
