// Everything the player sees: the header, the two picture panels, the found
// markers, the particles, the toasts and the screens. The left panel is
// always the original picture; the right panel always has every difference
// of the level applied. Found differences get a red ring on both panels.

import { COLOURS, HEADER, LEVELS, PANEL, PANEL_LEFT_X, PANEL_RIGHT_X, VIEW } from './config.js';
import { differencesFor } from './differences.js';
import { drawScene } from './scenes.js';
import {
  SCREEN_LEVEL_COMPLETE,
  SCREEN_LEVEL_FAILED,
  SCREEN_PLAYING,
  SCREEN_TITLE,
  SCREEN_VICTORY,
} from './state.js';

export function fitTransform(canvasWidth, canvasHeight) {
  const scale = Math.min(canvasWidth / VIEW.width, canvasHeight / VIEW.height);
  return {
    scale,
    ox: (canvasWidth - VIEW.width * scale) / 2,
    oy: (canvasHeight - VIEW.height * scale) / 2,
  };
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function timerColour(seconds) {
  if (seconds > 60) return COLOURS.timerGood;
  if (seconds > 25) return COLOURS.timerWarn;
  return COLOURS.timerBad;
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawButton(ctx, x, y, w, h, label, enabled = true) {
  ctx.fillStyle = enabled ? COLOURS.accent : '#5a5470';
  roundRectPath(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.fillStyle = '#241a10';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 + 1);
}

function drawHeader(ctx, state) {
  ctx.fillStyle = COLOURS.header;
  ctx.fillRect(0, 0, VIEW.width, HEADER.height);
  ctx.fillStyle = COLOURS.accent;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('The Curious Attic', 20, 40);
  ctx.fillStyle = COLOURS.hudDim;
  ctx.font = '16px Georgia, serif';
  ctx.fillText('Spot the Difference', 20, 66);

  ctx.textAlign = 'center';
  ctx.fillStyle = COLOURS.hudText;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(state.level.name, 640, 38);
  ctx.fillStyle = COLOURS.hudDim;
  ctx.font = '15px Georgia, serif';
  ctx.fillText(state.level.subtitle, 640, 62);

  ctx.textAlign = 'right';
  const showTimer =
    state.screen === SCREEN_PLAYING ||
    state.screen === SCREEN_LEVEL_COMPLETE ||
    state.screen === SCREEN_LEVEL_FAILED;
  if (showTimer) {
    ctx.fillStyle = timerColour(state.timeLeft);
    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillText(formatTime(state.timeLeft), 1260, 42);
  } else {
    ctx.fillStyle = COLOURS.hudDim;
    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillText('–:––', 1260, 42);
  }
  ctx.fillStyle = COLOURS.hudDim;
  ctx.font = '15px Georgia, serif';
  ctx.fillText(`Score ${state.score}`, 1260, 68);

  // Timer bar under the header.
  const frac = Math.max(0, state.timeLeft / state.level.timeLimitSec);
  ctx.fillStyle = '#332c4d';
  ctx.fillRect(0, HEADER.height - 8, VIEW.width, 8);
  if (showTimer) {
    ctx.fillStyle = timerColour(state.timeLeft);
    ctx.fillRect(0, HEADER.height - 8, VIEW.width * frac, 8);
  }
}

function drawPanelFrame(ctx, x, label, complete) {
  ctx.strokeStyle = complete ? COLOURS.panelFrameFound : COLOURS.panelFrame;
  ctx.lineWidth = 4;
  roundRectPath(ctx, x - 4, PANEL.top - 4, PANEL.width + 8, PANEL.height + 8, 10);
  ctx.stroke();
  ctx.fillStyle = COLOURS.hudDim;
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, x + 2, PANEL.top - 12);
}

function drawFoundMarkers(ctx, state, panelX) {
  for (const diff of state.diffs) {
    if (!state.found.has(diff.id)) continue;
    const x = panelX + diff.x;
    const y = PANEL.top + diff.y;
    ctx.strokeStyle = COLOURS.foundRing;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, diff.r + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = COLOURS.foundRingSoft;
    ctx.beginPath();
    ctx.arc(x, y, diff.r + 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLOURS.foundRing;
    ctx.font = 'bold 20px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓', x, y - diff.r - 12);
  }
}

function drawHintPulse(ctx, state, panelX, timeMs) {
  const target = state.hintTarget();
  if (!target) return;
  const pulse = 1 + 0.18 * Math.sin(timeMs / 160);
  const x = panelX + target.x;
  const y = PANEL.top + target.y;
  ctx.strokeStyle = COLOURS.hintRing;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, (target.r + 8) * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 217, 77, 0.18)';
  ctx.beginPath();
  ctx.arc(x, y, (target.r + 8) * pulse, 0, Math.PI * 2);
  ctx.fill();
}

function drawParticles(ctx, state, panelX) {
  for (const p of state.particles) {
    const alpha = 1 - p.life / p.maxLife;
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = p.colour;
    ctx.beginPath();
    ctx.arc(panelX + p.x, PANEL.top + p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawWrongMarks(ctx, state, panelX) {
  for (const mark of state.wrongMarks) {
    const alpha = Math.max(0, mark.ttl / 0.9);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = COLOURS.danger;
    ctx.lineWidth = 4;
    const x = panelX + mark.x;
    const y = PANEL.top + mark.y;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 10);
    ctx.lineTo(x + 10, y + 10);
    ctx.moveTo(x + 10, y - 10);
    ctx.lineTo(x - 10, y + 10);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawFooter(ctx, state) {
  // Found counter with progress dots.
  ctx.textAlign = 'left';
  ctx.fillStyle = COLOURS.hudText;
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText(`Found ${state.foundCount} / ${state.diffs.length}`, 220, 736);
  state.diffs.forEach((diff, i) => {
    ctx.fillStyle = state.found.has(diff.id) ? COLOURS.foundRing : '#4a4462';
    ctx.beginPath();
    ctx.arc(430 + i * 22, 728, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  // Hint button.
  const enabled = state.screen === SCREEN_PLAYING && state.hintsLeft > 0;
  drawButton(ctx, 20, 706, 170, 44, `💡 Hint (${state.hintsLeft})`, enabled);

  // Combo badge.
  if (state.combo > 1) {
    ctx.fillStyle = COLOURS.accent;
    ctx.font = 'bold 20px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Combo x${state.combo}!`, 1260, 736);
  }

  // Toast: a floating pill in the gap between the panels and the footer.
  const toast = state.toasts[0];
  if (toast) {
    ctx.font = '18px Georgia, serif';
    const w = ctx.measureText(toast.text).width + 36;
    ctx.fillStyle = 'rgba(20, 16, 29, 0.92)';
    roundRectPath(ctx, 640 - w / 2, 682, w, 34, 17);
    ctx.fill();
    ctx.strokeStyle = COLOURS.accent;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = COLOURS.hudText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(toast.text, 640, 700);
    ctx.textBaseline = 'alphabetic';
  }

  ctx.fillStyle = COLOURS.hudDim;
  ctx.font = '14px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('H — hint   ·   R — restart level   ·   M — sound on/off   ·   Click a difference on either picture', 640, 776);
}

function drawOverlay(ctx, title, lines, buttonLabel) {
  ctx.fillStyle = 'rgba(12, 9, 20, 0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#241d3a';
  roundRectPath(ctx, 340, 170, 600, 440, 16);
  ctx.fill();
  ctx.strokeStyle = COLOURS.panelFrame;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = COLOURS.accent;
  ctx.font = 'bold 40px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 640, 240);
  ctx.fillStyle = COLOURS.hudText;
  ctx.font = '19px Georgia, serif';
  lines.forEach((line, i) => ctx.fillText(line, 640, 292 + i * 30));
  if (buttonLabel) drawButton(ctx, 520, 520, 240, 56, buttonLabel);
}

function drawPanels(ctx, state, timeMs) {
  const allIds = new Set(state.diffs.map((d) => d.id));
  const panels = [
    { x: PANEL_LEFT_X, applied: new Set(), label: 'Picture A — the original' },
    { x: PANEL_RIGHT_X, applied: allIds, label: 'Picture B — spot the changes' },
  ];
  for (const panel of panels) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(panel.x, PANEL.top, PANEL.width, PANEL.height);
    ctx.clip();
    ctx.translate(panel.x, PANEL.top);
    drawScene(ctx, state.level.id, panel.applied, timeMs);
    ctx.restore();
    drawPanelFrame(ctx, panel.x, panel.label, state.remaining === 0);
    drawFoundMarkers(ctx, state, panel.x);
    drawHintPulse(ctx, state, panel.x, timeMs);
    drawParticles(ctx, state, panel.x);
    drawWrongMarks(ctx, state, panel.x);
  }
}

export function draw(ctx, state, timeMs) {
  ctx.fillStyle = COLOURS.page;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  drawHeader(ctx, state);
  drawPanels(ctx, state, timeMs);
  drawFooter(ctx, state);

  if (state.screen === SCREEN_TITLE) {
    drawOverlay(
      ctx,
      'The Curious Attic',
      [
        'Two pictures hang side by side. They look the same —',
        'but they are not. Find every difference!',
        '',
        'Click a difference on either picture. A wrong click costs 5 seconds.',
        'Three levels, 24 differences in all.',
        '',
        'Attic · 7 differences — Garden · 8 — Bookshop · 9',
      ],
      '▶  Start the hunt',
    );
  } else if (state.screen === SCREEN_LEVEL_COMPLETE) {
    drawOverlay(
      ctx,
      'Level Complete!',
      [
        `${state.level.name} — all ${state.diffs.length} differences found.`,
        `Time bonus: +${state.levelBonus} points`,
        `Score so far: ${state.score}`,
        '',
        state.levelIndex + 1 < LEVELS.length
          ? `Next: ${LEVELS[state.levelIndex + 1].name}`
          : 'One last level stands between you and the attic key.',
      ],
      state.levelIndex + 1 < LEVELS.length ? 'Next level  ▶' : 'Finish  ▶',
    );
  } else if (state.screen === SCREEN_VICTORY) {
    const lines = [
      `You found all ${state.totalFound} differences!`,
      `Final score: ${state.score}   ·   Accuracy: ${state.accuracy}%`,
      '',
      ...state.levelScores.map((row) => `${row.name}: ${row.found} found, +${row.bonus} time bonus`),
    ];
    drawOverlay(ctx, 'You Found Them All!', lines, '↻  Play again');
  } else if (state.screen === SCREEN_LEVEL_FAILED) {
    drawOverlay(
      ctx,
      'Out of Time!',
      [
        `${state.level.name} still hides ${state.remaining} difference${state.remaining === 1 ? '' : 's'}.`,
        `You found ${state.foundCount} of ${state.diffs.length} before the clock ran out.`,
        '',
        'Take a breath, look closer, and try again.',
      ],
      '↻  Try again',
    );
  }
}

// The clickable rectangles on the current screen, in logical coordinates.
export function getButtons(state) {
  if (state.screen === SCREEN_TITLE) {
    return [{ id: 'start', x: 520, y: 520, w: 240, h: 56 }];
  }
  if (state.screen === SCREEN_LEVEL_COMPLETE) {
    return [{ id: 'next', x: 520, y: 520, w: 240, h: 56 }];
  }
  if (state.screen === SCREEN_VICTORY) {
    return [{ id: 'again', x: 520, y: 520, w: 240, h: 56 }];
  }
  if (state.screen === SCREEN_LEVEL_FAILED) {
    return [{ id: 'retry', x: 520, y: 520, w: 240, h: 56 }];
  }
  return [{ id: 'hint', x: 20, y: 706, w: 170, h: 44 }];
}

export { differencesFor };
