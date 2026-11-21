// The three scenes of The Curious Attic, painted in vector shapes on a canvas.
// Each painter draws one picture in panel coordinates (600 x 560). It takes
// `applied`, the set of difference ids to apply: the left panel passes an
// empty set (the original), the right panel passes every difference of the
// level — so the two pictures differ only where the differences table says
// they do. Nothing here rolls dice: the same timeMs paints the same picture
// on both panels, every frame.

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function plankWall(ctx, base, dark, floorY) {
  const grad = ctx.createLinearGradient(0, 0, 0, floorY);
  grad.addColorStop(0, base);
  grad.addColorStop(1, dark);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, floorY);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 2;
  for (let x = 60; x < 600; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, floorY);
    ctx.stroke();
  }
  ctx.fillStyle = '#5d3f27';
  ctx.fillRect(0, floorY, 600, 560 - floorY);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  for (let y = floorY + 24; y < 560; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(600, y);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------- attic
function drawAttic(ctx, applied, timeMs) {
  plankWall(ctx, '#7a5230', '#5d3f27', 470);
  const flicker = 0.85 + 0.1 * Math.sin(timeMs / 240);

  // Round window with night sky, stars and (usually) the moon.
  ctx.fillStyle = '#1b2b4a';
  circle(ctx, 118, 108, 64);
  ctx.fillStyle = '#233a63';
  circle(ctx, 118, 108, 56);
  ctx.fillStyle = '#ffe9a8';
  star(ctx, 92, 82, 5);
  star(ctx, 142, 74, 4);
  star(ctx, 148, 128, 5);
  star(ctx, 88, 132, 4);
  if (!applied.has('moon')) {
    ctx.fillStyle = '#f7ead0';
    circle(ctx, 118, 108, 26);
    ctx.fillStyle = '#e0cda6';
    circle(ctx, 108, 100, 6);
    circle(ctx, 128, 116, 5);
    circle(ctx, 124, 96, 4);
  }
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(118, 108, 64, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(54, 108);
  ctx.lineTo(182, 108);
  ctx.moveTo(118, 44);
  ctx.lineTo(118, 172);
  ctx.stroke();

  // Hanging lamp: cord, shade, warm glow. The shade changes colour.
  ctx.strokeStyle = '#2c1f14';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(300, 0);
  ctx.lineTo(300, 66);
  ctx.stroke();
  ctx.fillStyle = applied.has('lamp-colour') ? '#1f8a8a' : '#c0392b';
  ctx.beginPath();
  ctx.moveTo(272, 66);
  ctx.lineTo(328, 66);
  ctx.lineTo(340, 104);
  ctx.lineTo(260, 104);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `rgba(255, 214, 130, ${0.22 * flicker})`;
  ellipse(ctx, 300, 116, 62, 26);
  ctx.fillStyle = '#ffe6a3';
  circle(ctx, 300, 110, 9);

  // Wall clock. The hands show 10:10, or 4:40 when the difference applies.
  ctx.fillStyle = '#f5eeda';
  circle(ctx, 448, 92, 32);
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(448, 92, 32, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#2c1f14';
  for (let i = 0; i < 12; i += 1) {
    const a = (i * Math.PI) / 6;
    circle(ctx, 448 + Math.cos(a) * 25, 92 + Math.sin(a) * 25, 2);
  }
  const hands = applied.has('clock-hands')
    ? [[4.6, 20], [7.9, 15]]
    : [[5.2, 20], [1.9, 15]];
  ctx.strokeStyle = '#2c1f14';
  ctx.lineWidth = 4;
  for (const [angle, len] of hands) {
    ctx.beginPath();
    ctx.moveTo(448, 92);
    ctx.lineTo(448 + Math.cos(angle) * len, 92 + Math.sin(angle) * len);
    ctx.stroke();
  }
  circle(ctx, 448, 92, 3);

  // Framed painting: mountains, or a sun when the difference applies.
  ctx.fillStyle = '#8a6a3b';
  roundRect(ctx, 138, 176, 80, 100, 6);
  ctx.fillStyle = '#bfe3f0';
  ctx.fillRect(146, 184, 64, 84);
  if (applied.has('frame-picture')) {
    ctx.fillStyle = '#ffb03a';
    circle(ctx, 178, 226, 20);
    ctx.strokeStyle = '#ffb03a';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(178 + Math.cos(a) * 26, 226 + Math.sin(a) * 26);
      ctx.lineTo(178 + Math.cos(a) * 34, 226 + Math.sin(a) * 34);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#7fae7a';
    ctx.beginPath();
    ctx.moveTo(146, 268);
    ctx.lineTo(168, 214);
    ctx.lineTo(190, 268);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5d8a5a';
    ctx.beginPath();
    ctx.moveTo(178, 268);
    ctx.lineTo(200, 206);
    ctx.lineTo(210, 268);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    circle(ctx, 196, 198, 8);
  }

  // Bookshelf with three shelves of books.
  ctx.fillStyle = '#6b4a2f';
  roundRect(ctx, 448, 178, 124, 206, 6);
  ctx.fillStyle = '#4a3220';
  ctx.fillRect(456, 196, 108, 4);
  ctx.fillRect(456, 262, 108, 4);
  ctx.fillRect(456, 328, 108, 4);
  const shelfBooks = [
    ['#a8442f', '#3f6d8e', '#c9a227', '#5d8a5a'],
    ['#7a4a8e', '#c0392b', '#2f7a5d', '#b07830'],
    ['#3f6d8e', '#a8442f', '#5d8a5a'],
  ];
  shelfBooks.forEach((row, shelf) => {
    const count = shelf === 1 && applied.has('books-count') ? row.length - 1 : row.length;
    row.slice(0, count).forEach((colour, i) => {
      ctx.fillStyle = colour;
      ctx.fillRect(460 + i * 26, 168 + shelf * 66, 20, 28);
    });
  });

  // Wooden chest and a stack of books beside it.
  ctx.fillStyle = '#7a5230';
  roundRect(ctx, 56, 440, 140, 66, 8);
  ctx.fillStyle = '#8a6238';
  roundRect(ctx, 56, 440, 140, 22, 8);
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 3;
  ctx.strokeRect(56, 440, 140, 66);
  ctx.fillStyle = '#3f6d8e';
  ctx.fillRect(216, 478, 52, 12);
  ctx.fillStyle = '#a8442f';
  ctx.fillRect(220, 466, 46, 12);
  ctx.fillStyle = '#c9a227';
  ctx.fillRect(224, 454, 40, 12);

  // Rug and the sleeping cat.
  ctx.fillStyle = '#8e3b46';
  ellipse(ctx, 300, 508, 150, 22);
  ctx.fillStyle = '#b0525e';
  ellipse(ctx, 300, 508, 118, 16);
  ctx.fillStyle = '#e8a04c';
  ellipse(ctx, 300, 486, 46, 18);
  circle(ctx, 262, 478, 15);
  ctx.fillStyle = '#e8a04c';
  ctx.beginPath();
  ctx.moveTo(252, 468);
  ctx.lineTo(256, 452);
  ctx.lineTo(264, 466);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(266, 466);
  ctx.lineTo(272, 450);
  ctx.lineTo(276, 466);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#e8a04c';
  ctx.lineWidth = 6;
  ctx.beginPath();
  if (applied.has('cat-tail')) {
    ctx.moveTo(340, 492);
    ctx.quadraticCurveTo(372, 496, 384, 486);
  } else {
    ctx.moveTo(338, 488);
    ctx.quadraticCurveTo(352, 462, 336, 448);
  }
  ctx.stroke();
  ctx.strokeStyle = '#2c1f14';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(254, 478);
  ctx.lineTo(260, 478);
  ctx.stroke();

  // Potted plant: leaves always, a red flower only when the difference applies.
  ctx.fillStyle = '#b06a3b';
  ctx.beginPath();
  ctx.moveTo(512, 436);
  ctx.lineTo(544, 436);
  ctx.lineTo(538, 472);
  ctx.lineTo(518, 472);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3f7a3a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(528, 436);
  ctx.lineTo(528, 402);
  ctx.moveTo(528, 420);
  ctx.quadraticCurveTo(506, 408, 500, 392);
  ctx.moveTo(528, 420);
  ctx.quadraticCurveTo(550, 408, 556, 392);
  ctx.stroke();
  if (applied.has('plant-flower')) {
    ctx.fillStyle = '#e84c6f';
    circle(ctx, 528, 396, 10);
    ctx.fillStyle = '#ffd94d';
    circle(ctx, 528, 396, 4);
  }

  // Cobweb in the top-right corner.
  ctx.strokeStyle = 'rgba(245, 238, 218, 0.5)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(600, 0);
    ctx.lineTo(600 - 60 - i * 8, 60 + i * 8);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(600, 0, 30, Math.PI / 2, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(600, 0, 52, Math.PI / 2, Math.PI);
  ctx.stroke();
}

// ---------------------------------------------------------------- garden
function drawGarden(ctx, applied, timeMs) {
  const sky = ctx.createLinearGradient(0, 0, 0, 560);
  sky.addColorStop(0, '#0e1230');
  sky.addColorStop(0.6, '#1d2b52');
  sky.addColorStop(1, '#2c4a3a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 560);
  ctx.fillStyle = '#ffe9a8';
  star(ctx, 60, 60, 5);
  star(ctx, 180, 40, 4);
  star(ctx, 300, 70, 5);
  star(ctx, 420, 44, 4);
  star(ctx, 250, 120, 4);

  // The moon: cratered, or plain when the difference applies.
  ctx.fillStyle = '#f7ead0';
  circle(ctx, 512, 88, 36);
  if (!applied.has('moon-craters')) {
    ctx.fillStyle = '#dcc99e';
    circle(ctx, 500, 78, 7);
    circle(ctx, 524, 96, 6);
    circle(ctx, 512, 104, 4);
  }

  // Old tree with the owl on its branch.
  ctx.fillStyle = '#4a3220';
  ctx.beginPath();
  ctx.moveTo(84, 380);
  ctx.quadraticCurveTo(78, 260, 96, 190);
  ctx.quadraticCurveTo(104, 260, 112, 380);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(96, 240);
  ctx.lineTo(150, 200);
  ctx.stroke();
  ctx.fillStyle = '#2c5a34';
  circle(ctx, 96, 160, 52);
  circle(ctx, 60, 190, 36);
  circle(ctx, 132, 190, 38);
  ctx.fillStyle = '#3a7046';
  circle(ctx, 80, 150, 30);
  circle(ctx, 118, 140, 28);
  if (!applied.has('owl')) {
    ctx.fillStyle = '#8a6a4b';
    ellipse(ctx, 96, 150, 16, 22);
    ctx.fillStyle = '#f5eeda';
    circle(ctx, 88, 142, 7);
    circle(ctx, 104, 142, 7);
    ctx.fillStyle = '#1d1830';
    circle(ctx, 88, 142, 3);
    circle(ctx, 104, 142, 3);
    ctx.fillStyle = '#ffb03a';
    ctx.beginPath();
    ctx.moveTo(92, 150);
    ctx.lineTo(100, 150);
    ctx.lineTo(96, 156);
    ctx.closePath();
    ctx.fill();
  }

  // Lawn.
  ctx.fillStyle = '#2c5a34';
  ctx.fillRect(0, 380, 600, 180);
  ctx.fillStyle = '#356b3f';
  for (let x = 20; x < 600; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, 560);
    ctx.lineTo(x + 8, 540);
    ctx.lineTo(x + 16, 560);
    ctx.closePath();
    ctx.fill();
  }

  // Fountain: basin, column and jets of water.
  ctx.fillStyle = '#8a8f96';
  ellipse(ctx, 300, 330, 92, 26);
  ctx.fillStyle = '#7fb3d5';
  ellipse(ctx, 300, 326, 80, 20);
  ctx.fillStyle = '#8a8f96';
  ctx.fillRect(290, 250, 20, 76);
  ctx.fillStyle = '#aab0b8';
  ellipse(ctx, 300, 250, 30, 10);
  ctx.strokeStyle = 'rgba(160, 210, 245, 0.9)';
  ctx.lineWidth = 4;
  const jets = applied.has('fountain-jets') ? [0, 1] : [0, 1, 2];
  for (const j of jets) {
    const x0 = 300 + (j - 1) * 26;
    ctx.beginPath();
    ctx.moveTo(x0, 248);
    ctx.quadraticCurveTo(x0, 210 + (j === 1 ? -14 : 0), x0 + (j === 1 ? 0 : (j === 0 ? -34 : 34)), 236);
    ctx.stroke();
  }

  // Lantern post: lit warm, or dark when the difference applies.
  ctx.fillStyle = '#2c2c34';
  ctx.fillRect(480, 176, 8, 190);
  ctx.fillStyle = '#2c2c34';
  roundRect(ctx, 468, 140, 36, 44, 6);
  if (!applied.has('lantern-flame')) {
    ctx.fillStyle = `rgba(255, 214, 130, ${0.35 + 0.1 * Math.sin(timeMs / 300)})`;
    ellipse(ctx, 486, 162, 46, 40);
    ctx.fillStyle = '#ffe6a3';
    circle(ctx, 486, 162, 8);
  } else {
    ctx.fillStyle = '#5a5a66';
    ctx.fillRect(476, 150, 20, 24);
  }

  // Bench with a cushion, or bare when the difference applies.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(84, 428, 96, 12);
  ctx.fillRect(88, 440, 8, 30);
  ctx.fillRect(168, 440, 8, 30);
  ctx.fillRect(84, 396, 8, 34);
  ctx.fillRect(84, 396, 96, 10);
  if (!applied.has('bench-cushion')) {
    ctx.fillStyle = '#c96a5e';
    roundRect(ctx, 88, 414, 88, 12, 5);
    ctx.fillStyle = '#e8a04c';
    ctx.fillRect(100, 414, 6, 12);
    ctx.fillRect(124, 414, 6, 12);
    ctx.fillRect(148, 414, 6, 12);
  }

  // Flower beds: tulips, one of which changes colour.
  const tulips = [
    [140, 496, '#e84c6f'], [168, 496, '#e84c6f'], [196, 496, '#e84c6f'],
    [420, 500, '#ffb03a'], [448, 500, '#c96a9e'], [476, 500, '#e84c6f'],
  ];
  for (const [x, y, colour] of tulips) {
    ctx.strokeStyle = '#3f7a3a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y + 22);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = x === 168 && applied.has('tulip-colour') ? '#ffd94d' : colour;
    circle(ctx, x, y, 9);
    ctx.beginPath();
    ctx.moveTo(x - 9, y - 2);
    ctx.lineTo(x - 5, y - 12);
    ctx.lineTo(x, y - 4);
    ctx.lineTo(x + 5, y - 12);
    ctx.lineTo(x + 9, y - 2);
    ctx.closePath();
    ctx.fill();
  }

  // Stepping stones: four, or three when the difference applies.
  const stones = applied.has('stepping-stone')
    ? [[280, 512], [300, 470], [320, 428]]
    : [[280, 512], [330, 512], [300, 470], [320, 428]];
  ctx.fillStyle = '#9aa0a8';
  for (const [x, y] of stones) ellipse(ctx, x, y, 26, 12);

  // Fireflies: five drifting lights, or four when one flew away.
  const flies = [
    [120, 300], [402, 176], [240, 220], [500, 320], [360, 90],
  ];
  const shown = applied.has('firefly') ? flies.filter(([x]) => x !== 402) : flies;
  for (const [x, y] of shown) {
    const dx = Math.sin(timeMs / 900 + x) * 8;
    const dy = Math.cos(timeMs / 700 + y) * 6;
    ctx.fillStyle = `rgba(220, 255, 140, ${0.55 + 0.35 * Math.sin(timeMs / 260 + x)})`;
    circle(ctx, x + dx, y + dy, 4);
    ctx.fillStyle = 'rgba(220, 255, 140, 0.2)';
    circle(ctx, x + dx, y + dy, 10);
  }
}

// ---------------------------------------------------------------- bookshop
function drawBookshop(ctx, applied, timeMs) {
  plankWall(ctx, '#6b4a2f', '#54371f', 470);

  // Long shelves of books across the back wall.
  ctx.fillStyle = '#4a3220';
  ctx.fillRect(30, 110, 540, 150);
  const spineColours = ['#a8442f', '#3f6d8e', '#c9a227', '#5d8a5a', '#7a4a8e', '#b07830', '#2f7a5d'];
  for (let shelf = 0; shelf < 3; shelf += 1) {
    const y = 128 + shelf * 48;
    for (let i = 0; i < 17; i += 1) {
      const x = 38 + i * 31;
      let colour = spineColours[(i + shelf * 3) % spineColours.length];
      if (shelf === 1 && i === 6) colour = applied.has('book-spine') ? '#2f7a5d' : '#a8442f';
      ctx.fillStyle = colour;
      const h = 34 + ((i * 7 + shelf * 5) % 8);
      ctx.fillRect(x, y + 40 - h, 24, h);
    }
    ctx.fillStyle = '#6b4a2f';
    ctx.fillRect(30, y + 42, 540, 6);
  }

  // The little shop sign: it hangs only when the difference applies.
  if (applied.has('shop-sign')) {
    ctx.strokeStyle = '#2c1f14';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(78, 56);
    ctx.lineTo(78, 76);
    ctx.moveTo(98, 56);
    ctx.lineTo(98, 76);
    ctx.stroke();
    ctx.fillStyle = '#c9a227';
    roundRect(ctx, 62, 76, 52, 30, 5);
    ctx.fillStyle = '#2c1f14';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('OPEN', 88, 96);
  }

  // Window with rain, or clear glass when the difference applies.
  ctx.fillStyle = '#3a2a18';
  roundRect(ctx, 392, 60, 120, 140, 6);
  ctx.fillStyle = '#1b2b4a';
  ctx.fillRect(400, 68, 104, 124);
  ctx.fillStyle = '#233a63';
  ctx.fillRect(400, 68, 104, 60);
  ctx.fillStyle = '#ffe9a8';
  star(ctx, 420, 88, 4);
  star(ctx, 480, 96, 5);
  star(ctx, 452, 78, 3);
  if (!applied.has('window-rain')) {
    ctx.strokeStyle = 'rgba(180, 210, 240, 0.75)';
    ctx.lineWidth = 2;
    const fall = (timeMs / 40) % 120;
    for (let i = 0; i < 8; i += 1) {
      const x = 408 + i * 12;
      const y = 68 + ((fall + i * 23) % 120);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 3, y + 10);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(452, 68);
  ctx.lineTo(452, 192);
  ctx.moveTo(400, 130);
  ctx.lineTo(504, 130);
  ctx.stroke();

  // Reading lamp: plain shade, or striped when the difference applies.
  ctx.strokeStyle = '#2c1f14';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(300, 0);
  ctx.lineTo(300, 66);
  ctx.stroke();
  ctx.fillStyle = '#2f7a5d';
  ctx.beginPath();
  ctx.moveTo(272, 66);
  ctx.lineTo(328, 66);
  ctx.lineTo(340, 104);
  ctx.lineTo(260, 104);
  ctx.closePath();
  ctx.fill();
  if (applied.has('lamp-stripes')) {
    ctx.strokeStyle = '#ffd94d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(282, 68);
    ctx.lineTo(274, 102);
    ctx.moveTo(300, 66);
    ctx.lineTo(300, 104);
    ctx.moveTo(318, 68);
    ctx.lineTo(326, 102);
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(255, 214, 130, ${0.2 + 0.08 * Math.sin(timeMs / 240)})`;
  ellipse(ctx, 300, 116, 60, 24);
  ctx.fillStyle = '#ffe6a3';
  circle(ctx, 300, 110, 9);

  // The desk and the globe on it.
  ctx.fillStyle = '#7a5230';
  roundRect(ctx, 90, 420, 420, 18, 6);
  ctx.fillRect(110, 438, 14, 60);
  ctx.fillRect(476, 438, 14, 60);
  ctx.fillStyle = '#b06a3b';
  ctx.fillRect(140, 404, 18, 16);
  ctx.fillStyle = '#3f6d8e';
  circle(ctx, 148, 384, 30);
  ctx.fillStyle = '#5d8a5a';
  if (!applied.has('globe')) {
    ellipse(ctx, 140, 376, 12, 8);
    ellipse(ctx, 158, 392, 10, 7);
  } else {
    ellipse(ctx, 158, 374, 11, 8);
    ellipse(ctx, 138, 392, 9, 6);
  }
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(148, 384, 30, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // Teacup with steam, or without it when the difference applies.
  ctx.fillStyle = '#f5eeda';
  ellipse(ctx, 462, 420, 26, 6);
  roundRect(ctx, 444, 392, 36, 26, 6);
  ctx.strokeStyle = '#f5eeda';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(482, 404, 8, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  if (!applied.has('teacup-steam')) {
    ctx.strokeStyle = 'rgba(245, 238, 218, 0.7)';
    ctx.lineWidth = 3;
    const wobble = Math.sin(timeMs / 500) * 3;
    ctx.beginPath();
    ctx.moveTo(456 + wobble, 388);
    ctx.quadraticCurveTo(450, 372, 458, 358);
    ctx.moveTo(468 + wobble, 388);
    ctx.quadraticCurveTo(474, 372, 466, 358);
    ctx.stroke();
  }

  // Ladder leaning on the shelves: five rungs, or four.
  ctx.strokeStyle = '#8a6238';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(520, 200);
  ctx.lineTo(552, 420);
  ctx.moveTo(500, 200);
  ctx.lineTo(532, 420);
  ctx.stroke();
  ctx.lineWidth = 5;
  const rungYs = [230, 275, 320, 365, 405];
  const shownRungs = applied.has('ladder-rung') ? rungYs.filter((y) => y !== 320) : rungYs;
  for (const y of shownRungs) {
    const t = (y - 200) / 220;
    ctx.beginPath();
    ctx.moveTo(502 + t * 32, y);
    ctx.lineTo(522 + t * 30, y);
    ctx.stroke();
  }

  // The cat asleep on the desk: both ears up, or one flopped.
  ctx.fillStyle = '#5a5a66';
  ellipse(ctx, 368, 462, 40, 15);
  circle(ctx, 336, 452, 13);
  ctx.beginPath();
  ctx.moveTo(326, 444);
  ctx.lineTo(330, 430);
  ctx.lineTo(338, 442);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  if (applied.has('cat-ear')) {
    ctx.moveTo(342, 442);
    ctx.quadraticCurveTo(352, 436, 356, 448);
    ctx.lineTo(348, 448);
    ctx.closePath();
  } else {
    ctx.moveTo(342, 442);
    ctx.lineTo(348, 428);
    ctx.lineTo(352, 442);
    ctx.closePath();
  }
  ctx.fill();
  ctx.strokeStyle = '#5a5a66';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(404, 466);
  ctx.quadraticCurveTo(420, 452, 412, 440);
  ctx.stroke();

  // A stack of books: four, or three when the top one is gone.
  const stack = applied.has('stack-books')
    ? [['#a8442f', 48], ['#3f6d8e', 44], ['#c9a227', 40]]
    : [['#a8442f', 48], ['#3f6d8e', 44], ['#c9a227', 40], ['#5d8a5a', 36]];
  let sy = 470;
  for (const [colour, w] of stack) {
    ctx.fillStyle = colour;
    ctx.fillRect(238 - w / 2, sy - 12, w, 12);
    sy -= 12;
  }

  // Rug, candle and ink pot for warmth.
  ctx.fillStyle = '#3f6d8e';
  ellipse(ctx, 300, 528, 130, 16);
  ctx.fillStyle = '#f5eeda';
  roundRect(ctx, 540, 452, 12, 30, 3);
  ctx.fillStyle = '#ffb03a';
  ellipse(ctx, 546, 446, 5, 9);
  ctx.fillStyle = '#2c1f14';
  roundRect(ctx, 200, 456, 18, 22, 3);
}

export const SCENES = {
  attic: drawAttic,
  garden: drawGarden,
  bookshop: drawBookshop,
};

export function drawScene(ctx, levelId, applied, timeMs) {
  const painter = SCENES[levelId];
  if (painter) painter(ctx, applied, timeMs);
}
