// SVG mockup helpers for game-idea documents. Every drawing uses the design-system tokens
// (docs/DESIGN_SYSTEM.md) at the document's scale: TV mockups are 960x540 (1080p / 2, so every
// TV size below is half the real pixel size), phones are 360x780 (1:1 CSS px).
// Pure string builders — no DOM, no dependencies. Used by _tools/build.mjs and _src/*.mjs.

export const T = {
  bg: '#0f1020',
  surface: '#1c1e3a',
  surface2: '#272a52',
  text: '#f5f6ff',
  muted: '#b3b7d9',
  accent: '#ff5d8f',
  accent2: '#ffd166',
  accent3: '#06d6a0',
  danger: '#ef476f',
  info: '#4cc9f0',
  players: ['#ff5d8f', '#ffd166', '#06d6a0', '#4cc9f0', '#b388ff', '#ff9f43', '#48dbfb', '#f368e0'],
  font: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
};

/** TV type scale at 960x540 (half of 1080p). */
export const TV = {
  display: 64,
  h1: 36,
  h2: 24,
  body: 18,
  caption: 14,
  W: 960,
  H: 540,
  padX: 48,
  padY: 27,
};
/** Phone type scale at 360x780. */
export const PH = {
  display: 48,
  h1: 28,
  h2: 22,
  body: 18,
  caption: 14,
  button: 20,
  W: 360,
  H: 780,
  pad: 16,
};

export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function text(x, y, str, o = {}) {
  const {
    size = 18,
    weight = 400,
    fill = T.text,
    anchor = 'start',
    italic = false,
    opacity = 1,
    family = T.font,
  } = o;
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${italic ? ' font-style="italic"' : ''}${opacity !== 1 ? ` opacity="${opacity}"` : ''}>${esc(str)}</text>`;
}

/** Multi-line text: lines[] stacked with lineHeight = size*1.3. */
export function lines(x, y, arr, o = {}) {
  const lh = (o.size ?? 18) * (o.lh ?? 1.3);
  return arr.map((s, i) => text(x, y + i * lh, s, o)).join('');
}

export function rect(x, y, w, h, o = {}) {
  const { fill = T.surface, r = 12, stroke = null, sw = 2, opacity = 1, dash = null } = o;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}${dash ? ` stroke-dasharray="${dash}"` : ''}${opacity !== 1 ? ` opacity="${opacity}"` : ''}/>`;
}

export function circle(cx, cy, r, o = {}) {
  const { fill = T.surface2, stroke = null, sw = 2, opacity = 1 } = o;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}${opacity !== 1 ? ` opacity="${opacity}"` : ''}/>`;
}

export function line(x1, y1, x2, y2, o = {}) {
  const { stroke = T.muted, sw = 2, dash = null, opacity = 1 } = o;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"${dash ? ` stroke-dasharray="${dash}"` : ''}${opacity !== 1 ? ` opacity="${opacity}"` : ''} stroke-linecap="round"/>`;
}

export function playerColor(i) {
  return T.players[i % 8];
}

/** Avatar disc: player colour by index, initial letter, optional ring. */
export function avatar(cx, cy, r, i, name, o = {}) {
  const { ring = null, dim = false } = o;
  const initial = (name || '?').trim()[0]?.toUpperCase() ?? '?';
  return (
    circle(cx, cy, r, { fill: playerColor(i), stroke: ring, sw: 3, opacity: dim ? 0.4 : 1 }) +
    text(cx, cy + r * 0.36, initial, {
      size: r * 1.05,
      weight: 800,
      fill: T.bg,
      anchor: 'middle',
      opacity: dim ? 0.6 : 1,
    })
  );
}

/**
 * Player chip (as the shells render it): avatar + name + status glyph.
 * status: 'active' | 'submitted' (✓) | 'waiting' (·) | 'spectator' (👁) | 'reconnecting' (⟳)
 */
export function chip(x, y, i, name, status = 'active', o = {}) {
  const { scale = 1, score = null, vip = false } = o;
  const h = 36 * scale;
  const glyph =
    { submitted: '✓', waiting: '·', spectator: '◎', reconnecting: '⟳', active: '' }[status] ?? '';
  const w = (name.length * 9 + 60 + (score !== null ? 34 : 0) + (glyph ? 18 : 0)) * scale;
  const stroke = status === 'submitted' ? T.accent3 : status === 'reconnecting' ? T.accent2 : null;
  const dim = status === 'reconnecting' || status === 'spectator';
  return (
    `<g opacity="${dim ? 0.6 : 1}">` +
    rect(x, y, w, h, { fill: T.surface2, r: h / 2, stroke, sw: 2 }) +
    avatar(x + h / 2, y + h / 2, h / 2 - 4 * scale, i, name) +
    text(x + h + 4 * scale, y + h * 0.66, name, { size: 15 * scale, weight: 600 }) +
    (glyph
      ? text(x + w - 12 * scale, y + h * 0.68, glyph, {
          size: 16 * scale,
          weight: 800,
          anchor: 'end',
          fill: status === 'submitted' ? T.accent3 : T.muted,
        })
      : '') +
    (score !== null
      ? text(x + w - (glyph ? 30 : 12) * scale, y + h * 0.66, String(score), {
          size: 14 * scale,
          weight: 700,
          anchor: 'end',
          fill: T.accent2,
        })
      : '') +
    (vip
      ? text(x + w - 4 * scale, y - 4 * scale, '★', {
          size: 14 * scale,
          fill: T.accent2,
          anchor: 'end',
        })
      : '') +
    `</g>`
  );
}

/** Row of chips, wrapping if needed. players: [{name, status, score}] */
export function chipRow(x, y, players, o = {}) {
  const { scale = 1, gap = 8, maxW = 860 } = o;
  let cx = x;
  let cy = y;
  let out = '';
  players.forEach((p, i) => {
    const w =
      (p.name.length * 9 +
        60 +
        (p.score != null ? 34 : 0) +
        (p.status && p.status !== 'active' ? 18 : 0)) *
      scale;
    if (cx + w > x + maxW) {
      cx = x;
      cy += 36 * scale + gap;
    }
    out += chip(cx, cy, p.i ?? i, p.name, p.status ?? 'active', {
      scale,
      score: p.score ?? null,
      vip: !!p.vip,
    });
    cx += w + gap;
  });
  return out;
}

/** Big stage timer (top-right of the TV). urgent = last 5 s styling. */
export function tvTimer(seconds, o = {}) {
  const { urgent = false, paused = false, x = TV.W - TV.padX, y = TV.padY + 58 } = o;
  const fill = urgent ? T.danger : T.accent2;
  const label = paused ? '⏸' : String(seconds);
  return (
    text(x, y, label, {
      size: urgent ? TV.display * 1.1 : TV.display,
      weight: 800,
      fill,
      anchor: 'end',
    }) +
    text(x, y + 18, paused ? 'paused' : 'seconds', {
      size: TV.caption,
      fill: T.muted,
      anchor: 'end',
    })
  );
}

/** Phone timer pill (top-right). */
export function phoneTimer(seconds, o = {}) {
  const { urgent = false, x = PH.W - PH.pad, y = 52 } = o;
  const fill = urgent ? T.danger : T.accent2;
  return (
    rect(x - 64, y - 24, 64, 34, { fill: T.surface2, r: 17 }) +
    text(x - 32, y, `${seconds}s`, { size: 18, weight: 800, fill, anchor: 'middle' })
  );
}

/** Numbered callout marker. */
export function callout(x, y, n, o = {}) {
  const { r = 13 } = o;
  return (
    circle(x, y, r, { fill: T.accent2, stroke: T.bg, sw: 2 }) +
    text(x, y + 5, String(n), { size: 15, weight: 800, fill: T.bg, anchor: 'middle' })
  );
}

/** Phone primary button (≥ 56 px tall, full width by default). */
export function button(x, y, w, label, o = {}) {
  const { h = 56, variant = 'primary', done = false, disabled = false } = o;
  const fills = {
    primary: T.accent,
    secondary: T.surface2,
    success: T.accent3,
    danger: T.danger,
    ghost: 'transparent',
  };
  const fill = done ? T.accent3 : (fills[variant] ?? T.accent);
  const textFill = variant === 'secondary' || variant === 'ghost' ? T.text : T.bg;
  return (
    `<g opacity="${disabled ? 0.45 : 1}">` +
    rect(x, y, w, h, { fill, r: 14, stroke: variant === 'ghost' ? T.muted : null }) +
    text(x + w / 2, y + h / 2 + 7, (done ? '✓  ' : '') + label, {
      size: PH.button,
      weight: 700,
      fill: textFill,
      anchor: 'middle',
    }) +
    `</g>`
  );
}

/** A small badge / tag. */
export function tag(x, y, label, o = {}) {
  const { fill = T.surface2, color = T.text, size = 13 } = o;
  const w = label.length * size * 0.62 + 18;
  return (
    rect(x, y, w, size + 12, { fill, r: (size + 12) / 2 }) +
    text(x + w / 2, y + size + 2, label, { size, weight: 700, fill: color, anchor: 'middle' })
  );
}

/**
 * TV frame: 960x540 stage with overscan-safe padding guides. `body` is drawn inside.
 * Options: timer {seconds,urgent,paused}, chips [{name,status,score}], kicker (top-left small text),
 * title (h1 under kicker), phaseLabel (bottom-right caption).
 */
export function tv(body, o = {}) {
  const {
    timer = null,
    chips = null,
    kicker = null,
    title = null,
    phaseLabel = null,
    chipsY = TV.H - TV.padY - 40,
    showGuides = true,
  } = o;
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TV.W} ${TV.H}" width="100%" role="img" aria-label="TV mockup">`;
  out += rect(0, 0, TV.W, TV.H, { fill: T.bg, r: 0 });
  if (showGuides)
    out += rect(TV.padX, TV.padY, TV.W - 2 * TV.padX, TV.H - 2 * TV.padY, {
      fill: 'none',
      r: 0,
      stroke: '#2a2d55',
      sw: 1,
      dash: '6 6',
    });
  if (kicker)
    out += text(TV.padX, TV.padY + 22, kicker, { size: TV.caption, weight: 700, fill: T.muted });
  if (title)
    out += text(TV.padX, TV.padY + 22 + (kicker ? 44 : 30), title, { size: TV.h1, weight: 800 });
  if (timer) out += tvTimer(timer.seconds, { urgent: timer.urgent, paused: timer.paused });
  out += body;
  if (chips) out += chipRow(TV.padX, chipsY, chips, { scale: 1 });
  if (phaseLabel)
    out += text(TV.W - TV.padX, TV.H - TV.padY + 4, phaseLabel, {
      size: 11,
      fill: '#5b5f8a',
      anchor: 'end',
    });
  out += `</svg>`;
  return out;
}

/**
 * Phone frame: 360x780. `body` drawn inside the content area (y from 88 to footerTop).
 * Options: kicker/title in the header, timer {seconds,urgent}, footer (svg string drawn in the
 * sticky bottom bar, 96 px tall), banner ('reconnecting' | 'paused' | string), footerH.
 */
export function phone(body, o = {}) {
  const {
    kicker = null,
    title = null,
    timer = null,
    footer = null,
    banner = null,
    footerH = 96,
  } = o;
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PH.W} ${PH.H}" width="100%" role="img" aria-label="Phone mockup">`;
  out += rect(0, 0, PH.W, PH.H, { fill: T.bg, r: 28 });
  // status bar
  out += text(20, 26, '9:41', { size: 13, weight: 700, fill: T.muted });
  out += text(PH.W - 20, 26, '▮▮▮ ◔', { size: 12, fill: T.muted, anchor: 'end' });
  let y = 60;
  if (banner) {
    const isRec = banner === 'reconnecting';
    const isPaused = banner === 'paused';
    const msg = isRec
      ? '⟳  Reconnecting… your answer is safe'
      : isPaused
        ? '⏸  Paused by the VIP'
        : banner;
    out += rect(0, 36, PH.W, 34, { fill: isRec ? T.accent2 : T.info, r: 0, opacity: 0.9 });
    out += text(PH.W / 2, 58, msg, { size: 14, weight: 700, fill: T.bg, anchor: 'middle' });
    y = 96;
  }
  if (kicker) out += text(PH.pad, y, kicker, { size: PH.caption, weight: 700, fill: T.muted });
  if (title) out += text(PH.pad, y + (kicker ? 34 : 24), title, { size: PH.h2, weight: 800 });
  if (timer) out += phoneTimer(timer.seconds, { urgent: timer.urgent, y: y - 4 });
  out += body;
  if (footer) {
    const top = PH.H - footerH;
    out += rect(0, top, PH.W, footerH, { fill: T.surface, r: 0 });
    out += line(0, top, PH.W, top, { stroke: '#2a2d55', sw: 1 });
    out += footer;
  }
  // home indicator
  out += rect(PH.W / 2 - 60, PH.H - 10, 120, 4, { fill: T.muted, r: 2, opacity: 0.6 });
  out += `</svg>`;
  return out;
}

/** Horizontal bar (for spreads / progress). */
export function bar(x, y, w, h, fraction, o = {}) {
  const { fill = T.accent, track = T.surface2 } = o;
  return (
    rect(x, y, w, h, { fill: track, r: h / 2 }) +
    (fraction > 0 ? rect(x, y, Math.max(h, w * fraction), h, { fill, r: h / 2 }) : '')
  );
}

/** A rounded arrow (for state diagrams). */
export function arrow(x1, y1, x2, y2, label = null, o = {}) {
  const { stroke = T.muted, curve = 0, dy = 0 } = o;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + curve + dy;
  const path = curve ? `M${x1},${y1} Q${mx},${my} ${x2},${y2}` : `M${x1},${y1} L${x2},${y2}`;
  return (
    `<path d="${path}" fill="none" stroke="${stroke}" stroke-width="2" marker-end="url(#arrowhead)"/>` +
    (label
      ? rect(mx - label.length * 3.6 - 6, my - 10, label.length * 7.2 + 12, 20, {
          fill: T.bg,
          r: 10,
        }) + text(mx, my + 4, label, { size: 12, fill: T.muted, anchor: 'middle' })
      : '')
  );
}

export const ARROW_DEFS = `<defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${T.muted}"/></marker></defs>`;

/** State-diagram node. */
export function node(x, y, w, h, label, o = {}) {
  const { fill = T.surface, stroke = T.accent, sub = null, terminal = false } = o;
  return (
    rect(x, y, w, h, { fill, r: terminal ? h / 2 : 12, stroke, sw: 2 }) +
    text(x + w / 2, y + h / 2 + (sub ? 0 : 6), label, { size: 16, weight: 800, anchor: 'middle' }) +
    (sub ? text(x + w / 2, y + h / 2 + 18, sub, { size: 12, fill: T.muted, anchor: 'middle' }) : '')
  );
}

/** Wrap a plain SVG string for a free-form diagram. */
export function svg(w, h, body, o = {}) {
  const { label = 'diagram' } = o;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${esc(label)}">${rect(0, 0, w, h, { fill: T.bg, r: 12 })}${ARROW_DEFS}${body}</svg>`;
}

// ─── Document helpers (figures with callouts) ──────────────────────────────────────────────────
export function fig(svgStr, caption, callouts = [], cls = 'tv') {
  const co = callouts.length
    ? `<ol class="callouts">${callouts.map((c, i) => `<li><b class="n">${i + 1}</b>${c}</li>`).join('')}</ol>`
    : '';
  return `<figure class="${cls}">${svgStr}<figcaption>${caption}</figcaption>${co}</figure>`;
}
export function phones(items) {
  return `<div class="phones">${items.map(([s, cap]) => `<figure>${s}<figcaption>${cap}</figcaption></figure>`).join('')}</div>`;
}
export function contentList(items) {
  return `<ol class="content-list">${items.map((s) => `<li>${s}</li>`).join('')}</ol>`;
}
/** Polyline stroke in canvas units (0..256) scaled into a box at (x,y,size). */
export function doodle(x, y, size, strokes) {
  const k = size / 256;
  return strokes
    .map(
      (s) =>
        `<polyline points="${s.pts.map(([px, py]) => `${(x + px * k).toFixed(1)},${(y + py * k).toFixed(1)}`).join(' ')}" fill="none" stroke="${s.color}" stroke-width="${(s.w ?? 4) * k}" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join('');
}
