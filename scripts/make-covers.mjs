#!/usr/bin/env node
/**
 * Generates the vector cover art used by cards that do not ship a raster cover.
 *
 * Design goals: 1280x720 (16:9, matches the card crop), no external fonts or
 * images, readable at thumbnail size, and a distinct palette per category so the
 * grid still scans quickly. Existing .jpg/.webp/.png covers are left untouched.
 *
 * Usage: node scripts/make-covers.mjs [--force]
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DB = JSON.parse(fs.readFileSync(path.join(ROOT, 'games.json'), 'utf8'));
const FORCE = process.argv.includes('--force');
const CHECK = process.argv.includes('--check');

const PALETTES = {
  survivors: [
    { a: '#f59e0b', b: '#7c2d12', bg: '#160b05', ink: '#fde68a' },
    { a: '#fb923c', b: '#5c1a0c', bg: '#140806', ink: '#fed7aa' },
    { a: '#eab308', b: '#4a2c05', bg: '#12100a', ink: '#fef08a' },
    { a: '#f97316', b: '#3f1d12', bg: '#120b09', ink: '#ffedd5' },
  ],
  zombies: [
    { a: '#22c55e', b: '#052e16', bg: '#04120a', ink: '#bbf7d0' },
    { a: '#4ade80', b: '#134e2a', bg: '#06140d', ink: '#d9f99d' },
    { a: '#84cc16', b: '#1a2e05', bg: '#0b1204', ink: '#ecfccb' },
  ],
  shooters: [
    { a: '#ef4444', b: '#450a0a', bg: '#120607', ink: '#fecaca' },
    { a: '#f43f5e', b: '#3b0a1e', bg: '#14060c', ink: '#fecdd3' },
    { a: '#fb7185', b: '#4c0519', bg: '#12060a', ink: '#ffe4e6' },
  ],
  'classic-pc': [
    { a: '#38bdf8', b: '#082f49', bg: '#050f1a', ink: '#bae6fd' },
    { a: '#22d3ee', b: '#083344', bg: '#04121a', ink: '#a5f3fc' },
    { a: '#60a5fa', b: '#0b2149', bg: '#050b18', ink: '#bfdbfe' },
  ],
  openworld: [
    { a: '#a855f7', b: '#2e1065', bg: '#0c0618', ink: '#e9d5ff' },
    { a: '#d946ef', b: '#3b0764', bg: '#120618', ink: '#f5d0fe' },
    { a: '#818cf8', b: '#1e1b4b', bg: '#07081a', ink: '#e0e7ff' },
  ],
  strategy: [
    { a: '#14b8a6', b: '#042f2e', bg: '#04120f', ink: '#99f6e4' },
    { a: '#2dd4bf', b: '#0b3b36', bg: '#04140f', ink: '#ccfbf1' },
    { a: '#34d399', b: '#064e3b', bg: '#041310', ink: '#a7f3d0' },
  ],
  sports: [
    { a: '#f472b6', b: '#4a044e', bg: '#140614', ink: '#fbcfe8' },
    { a: '#fb923c', b: '#431407', bg: '#130806', ink: '#fed7aa' },
    { a: '#facc15', b: '#422006', bg: '#120f05', ink: '#fef9c3' },
  ],
  default: [
    { a: '#00f0ff', b: '#0f172a', bg: '#05070f', ink: '#cffafe' },
    { a: '#8fd6ff', b: '#111c30', bg: '#06080d', ink: '#e0f2fe' },
  ],
};

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Wrap a title into at most 3 short lines. */
function wrap(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length <= 3) return lines;
  return [lines[0], lines[1], lines.slice(2).join(' ')].map((l, i) => (i === 2 && l.length > maxChars + 4 ? `${l.slice(0, maxChars + 1)}…` : l));
}

/** Decorative background art — three motifs, mirrored per game. */
function art(p, variant, mirrored) {
  const a = p.a;
  const ink = p.ink;
  const x = mirrored ? 210 : 1070;

  if (variant === 1) {
    // Diagonal light beams
    return `  <g>
    <path d="M${x - 340} -80 L${x + 210} 680" stroke="${a}" stroke-opacity="0.34" stroke-width="56" stroke-linecap="round"/>
    <path d="M${x - 470} -80 L${x + 80} 680" stroke="${a}" stroke-opacity="0.16" stroke-width="2"/>
    <path d="M${x - 200} -80 L${x + 350} 680" stroke="${ink}" stroke-opacity="0.12" stroke-width="2"/>
    <circle cx="${x + 30}" cy="120" r="7" fill="${ink}" fill-opacity="0.7"/>
    <rect x="${x - 260}" y="512" width="250" height="2" fill="${a}" fill-opacity="0.5"/>
  </g>`;
  }

  if (variant === 2) {
    // Concentric target
    return `  <g>
${Array.from({ length: 5 }, (_, i) => `    <circle cx="${x}" cy="196" r="${70 + i * 52}" fill="none" stroke="${a}" stroke-opacity="${(0.5 - i * 0.08).toFixed(2)}" stroke-width="${i === 0 ? 40 : 1.5}"${i % 2 ? ' stroke-dasharray="10 16"' : ''}/>`).join('\n')}
    <circle cx="${x + 84}" cy="112" r="8" fill="${ink}" fill-opacity="0.8"/>
    <circle cx="${x - 132}" cy="266" r="4.5" fill="${ink}" fill-opacity="0.55"/>
  </g>`;
  }

  // Crosshair rings with axis ticks
  return `  <g fill="none" stroke="${a}">
    <circle cx="${x}" cy="192" r="188" stroke-opacity="0.5" stroke-width="1.5"/>
    <circle cx="${x}" cy="192" r="118" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="4 12"/>
    <circle cx="${x}" cy="192" r="196" stroke-opacity="0.16" stroke-width="26"/>
    <path d="M${x} 8 V120 M${x} 264 V376 M${x - 184} 192 H${x - 96} M${x + 96} 192 H${x + 184}" stroke-opacity="0.35" stroke-width="1.5"/>
    <circle cx="${x + 132}" cy="70" r="5" fill="${ink}" fill-opacity="0.7"/>
  </g>`;
}

function cover(g) {
  const title = g.shortTitle || g.title;
  const lines = wrap(title, 13).map((l) => l.toUpperCase());
  const size = lines.length === 1 ? 118 : lines.length === 2 ? 96 : 76;
  const lineHeight = Math.round(size * 1.02);

  // Keep the title block optically centred but clear of the 96px top safe area
  // (the card paints its status pill there) and the 72px bottom edge.
  const blockHeight = (lines.length - 1) * lineHeight + size;
  const firstY = Math.max(200, Math.round(400 - blockHeight / 2 + size * 0.78));
  const underlineY = firstY + (lines.length - 1) * lineHeight + 44;

  // One large ghost initial gives each poster a recognisable silhouette at
  // thumbnail size without competing with the title.
  const monogram = title.replace(/[^A-Za-z0-9]/g, '').slice(0, 1).toUpperCase() || 'T';

  // Deterministic per-game variation so a grid of posters never reads as one
  // repeated template. Same id always yields the same composition.
  let hash = 0;
  for (const ch of g.id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const variant = hash % 3;
  const mirrored = hash % 2 === 1;
  const palette = PALETTES[g.category] || PALETTES.default;
  const p = palette[hash % palette.length];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720" role="img" aria-label="${esc(title)} cover art">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.bg}"/>
      <stop offset="58%" stop-color="${p.b}"/>
      <stop offset="100%" stop-color="${p.bg}"/>
    </linearGradient>
    <radialGradient id="glow" cx="${mirrored ? '18%' : '82%'}" cy="12%" r="70%">
      <stop offset="0%" stop-color="${p.a}" stop-opacity="0.42"/>
      <stop offset="55%" stop-color="${p.a}" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="${p.a}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${p.a}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${p.a}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="52%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.55"/>
    </linearGradient>
    <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="rotate(14)">
      <path d="M0 0H64M0 0V64" stroke="${p.ink}" stroke-opacity="0.055" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect width="1280" height="720" fill="url(#grid)"/>
  <rect width="1280" height="720" fill="url(#glow)"/>

${art(p, variant, mirrored)}

  <text x="1268" y="640" text-anchor="end" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-weight="900"
        font-size="600" fill="${p.a}" fill-opacity="0.07" letter-spacing="-20">${esc(monogram)}</text>

  <rect width="1280" height="720" fill="url(#shade)"/>

  <g font-family="Segoe UI, Arial Black, Helvetica, Arial, sans-serif" font-weight="900" font-size="${size}" letter-spacing="-1">
${lines
  .map(
    (line, i) =>
      `    <text x="84" y="${firstY + i * lineHeight}" fill="#ffffff" fill-opacity="0.97">${esc(line)}</text>`
  )
  .join('\n')}
  </g>

  <rect x="86" y="${underlineY}" width="132" height="7" rx="3.5" fill="url(#rule)"/>
</svg>
`;
}

let made = 0;
for (const g of DB.games) {
  if (!g.cover.endsWith('.svg')) continue;
  const target = path.join(ROOT, g.cover);
  if (fs.existsSync(target) && !FORCE) continue;
  if (CHECK) {
    console.error(`missing cover: ${g.cover}`);
    made++;
    continue;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, cover(g));
  made++;
}
if (CHECK && made) process.exit(1);
console.log(`cover art: ${made} written, ${DB.games.filter((g) => g.cover.endsWith('.svg')).length} svg covers total`);
