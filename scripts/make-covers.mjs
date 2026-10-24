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
  survivors: { a: '#f59e0b', b: '#7c2d12', bg: '#160b05', ink: '#fde68a' },
  zombies: { a: '#22c55e', b: '#052e16', bg: '#04120a', ink: '#bbf7d0' },
  shooters: { a: '#ef4444', b: '#450a0a', bg: '#120607', ink: '#fecaca' },
  'classic-pc': { a: '#38bdf8', b: '#082f49', bg: '#050f1a', ink: '#bae6fd' },
  openworld: { a: '#a855f7', b: '#2e1065', bg: '#0c0618', ink: '#e9d5ff' },
  strategy: { a: '#14b8a6', b: '#042f2e', bg: '#04120f', ink: '#99f6e4' },
  sports: { a: '#f472b6', b: '#4a044e', bg: '#140614', ink: '#fbcfe8' },
  default: { a: '#00f0ff', b: '#0f172a', bg: '#05070f', ink: '#cffafe' },
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

function cover(g) {
  const p = PALETTES[g.category] || PALETTES.default;
  const title = g.shortTitle || g.title;
  const lines = wrap(title, 13);
  const size = lines.length === 1 ? 112 : lines.length === 2 ? 92 : 74;
  const lineHeight = Math.round(size * 1.04);
  const firstY = 330 - ((lines.length - 1) * lineHeight) / 2;
  const eyebrow = (g.categoryLabel || '').toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720" role="img" aria-label="${esc(title)} cover art">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.bg}"/>
      <stop offset="55%" stop-color="${p.b}"/>
      <stop offset="100%" stop-color="${p.bg}"/>
    </linearGradient>
    <radialGradient id="glow" cx="78%" cy="18%" r="62%">
      <stop offset="0%" stop-color="${p.a}" stop-opacity="0.55"/>
      <stop offset="60%" stop-color="${p.a}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${p.a}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="45%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.65"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
      <path d="M0 0H48M0 0V48" stroke="${p.ink}" stroke-opacity="0.07" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect width="1280" height="720" fill="url(#grid)"/>
  <rect width="1280" height="720" fill="url(#glow)"/>
  <g opacity="0.85">
    <circle cx="1010" cy="205" r="168" fill="none" stroke="${p.a}" stroke-opacity="0.42" stroke-width="2"/>
    <circle cx="1010" cy="205" r="122" fill="none" stroke="${p.ink}" stroke-opacity="0.22" stroke-width="1.5" stroke-dasharray="7 11"/>
    <circle cx="1010" cy="205" r="78" fill="${p.a}" fill-opacity="0.15"/>
    <circle cx="1101" cy="134" r="7" fill="${p.ink}" fill-opacity="0.9"/>
    <circle cx="880" cy="298" r="5" fill="${p.ink}" fill-opacity="0.65"/>
    <path d="M815 470 L1180 470" stroke="${p.a}" stroke-opacity="0.35" stroke-width="2"/>
    <path d="M815 486 L1040 486" stroke="${p.ink}" stroke-opacity="0.18" stroke-width="2"/>
  </g>
  <rect width="1280" height="720" fill="url(#fade)"/>
  <g transform="translate(80 92)">
    <rect x="0" y="0" width="${Math.max(196, eyebrow.length * 15 + 44)}" height="42" rx="21" fill="${p.a}" fill-opacity="0.16" stroke="${p.a}" stroke-opacity="0.6"/>
    <text x="22" y="28" fill="${p.ink}" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="17" font-weight="700" letter-spacing="3">${esc(eyebrow)}</text>
  </g>
  <g font-family="Segoe UI, Arial Black, Helvetica, Arial, sans-serif" font-weight="900" font-size="${size}" letter-spacing="1">
${lines
  .map(
    (line, i) =>
      `    <text x="78" y="${firstY + i * lineHeight}" fill="#ffffff" stroke="#000" stroke-opacity="0.35" stroke-width="1">${esc(line.toUpperCase())}</text>`
  )
  .join('\n')}
  </g>
  <text x="80" y="${firstY + (lines.length - 1) * lineHeight + 62}" fill="${p.ink}" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="26" font-weight="600" opacity="0.9">${esc(g.dev)}</text>
  <g transform="translate(80 610)">
    <rect x="0" y="0" width="238" height="52" rx="26" fill="#ffffff" fill-opacity="0.1" stroke="#ffffff" stroke-opacity="0.22"/>
    <text x="26" y="33" fill="#ffffff" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="3">PLAY IN TAB ↗</text>
    <text x="272" y="34" fill="${p.ink}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="19" opacity="0.85">${esc(g.year)} · ${esc(g.engine)}</text>
  </g>
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
