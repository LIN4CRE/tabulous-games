#!/usr/bin/env node
/**
 * Regenerates every raster brand asset (emblem PNGs, favicons, apple-touch icon,
 * OG card, wordmark banner) from the hand-authored SVGs plus favicon.ico.
 *
 * Dev-only: needs `sharp`, `@resvg/resvg-js` and a Manrope OTF. Run it only when
 * assets/brand/emblem.svg changes, then commit the output.
 *
 *   npm i --no-save sharp @resvg/resvg-js typeface-manrope
 *   node scripts/make-brand.mjs
 */
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';

const REPO = path.resolve(import.meta.dirname, '..');
const emblemSvg = fs.readFileSync(`${REPO}/assets/brand/emblem.svg`, 'utf8');
const fontOtf = path.resolve(
  import.meta.dirname,
  '../node_modules/typeface-manrope/manrope/manrope-extrabold.otf'
);
if (!fs.existsSync(fontOtf)) {
  console.error('Missing Manrope OTF. Run: npm i --no-save sharp @resvg/resvg-js typeface-manrope');
  process.exit(1);
}
const DB = JSON.parse(fs.readFileSync(path.join(REPO, 'games.json'), 'utf8'));
const COUNT = DB.games.length;

const render = (svg, width) => new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { fontFiles: [fontOtf], loadSystemFonts: false, defaultFontFamily: 'Manrope' } }).render().asPng();

// ---- icons / favicons -----------------------------------------------------
const sizes = { 'emblem-64.png': 64, 'emblem-256.png': 256 };
for (const [name, size] of Object.entries(sizes)) {
  fs.writeFileSync(`${REPO}/assets/brand/${name}`, render(emblemSvg, size));
}
fs.writeFileSync(`${REPO}/assets/brand/favicon.svg`, emblemSvg);
const png = (s) => render(emblemSvg, s);
// Hand-rolled ICO container with PNG payloads (16/32/48) — sharp cannot emit .ico.
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach(({ size, data }, i) => {
    const b = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, b);
    dir.writeUInt8(size >= 256 ? 0 : size, b + 1);
    dir.writeUInt8(0, b + 2); dir.writeUInt8(0, b + 3);
    dir.writeUInt16LE(1, b + 4); dir.writeUInt16LE(32, b + 6);
    dir.writeUInt32LE(data.length, b + 8); dir.writeUInt32LE(offset, b + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...pngs.map((p) => p.data)]);
}
fs.writeFileSync(`${REPO}/favicon.ico`, ico([16, 32, 48].map((size) => ({ size, data: png(size) }))));
fs.writeFileSync(`${REPO}/assets/brand/apple-touch-icon.png`, await sharp(png(180)).flatten({ background: '#050506' }).png().toBuffer());

// ---- wordmark band --------------------------------------------------------
function wordmark({ w = 1600, h = 400, tagline = true } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b0d11"/><stop offset="0.55" stop-color="#050506"/><stop offset="1" stop-color="#0a0c10"/>
    </linearGradient>
    <radialGradient id="halo" cx="22%" cy="50%" r="55%">
      <stop offset="0" stop-color="#7dd3fc" stop-opacity="0.18"/><stop offset="1" stop-color="#7dd3fc" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset="0.42" stop-color="#e8edf5"/>
      <stop offset="0.6" stop-color="#a9b3c1"/><stop offset="0.78" stop-color="#f7fafd"/><stop offset="1" stop-color="#c2cad5"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(14)">
      <path d="M0 0H40M0 0V40" stroke="#ffffff" stroke-opacity="0.028" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#grid)"/>
  <rect width="${w}" height="${h}" fill="url(#halo)"/>
  <g transform="translate(96 ${h / 2 - 96}) scale(3)">${emblemSvg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace('</svg>', '')}</g>
  <text x="392" y="${h / 2 - 8}" fill="url(#chrome)" font-family="Manrope" font-weight="800" font-size="96" letter-spacing="-1.5">TABULOUS GAMES</text>
  ${tagline ? `<text x="396" y="${h / 2 + 44}" fill="#8b93a1" font-family="Manrope" font-weight="700" font-size="25" letter-spacing="7">BROWSER GAME VAULT · VERIFIED DAILY</text>` : ''}
  <rect x="96" y="${h - 3}" width="${w - 192}" height="1" fill="#7dd3fc" fill-opacity="0.25"/>
</svg>`;
}

// ---- OG card --------------------------------------------------------------
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0c0e12"/><stop offset="0.5" stop-color="#050506"/><stop offset="1" stop-color="#0b0d12"/></linearGradient>
    <radialGradient id="halo" cx="18%" cy="18%" r="70%"><stop offset="0" stop-color="#7dd3fc" stop-opacity="0.16"/><stop offset="1" stop-color="#7dd3fc" stop-opacity="0"/></radialGradient>
    <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="0.45" stop-color="#e9eef6"/><stop offset="0.62" stop-color="#a8b2c0"/><stop offset="0.8" stop-color="#f6fafe"/><stop offset="1" stop-color="#c4ccd7"/></linearGradient>
    <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(12)"><path d="M0 0H44M0 0V44" stroke="#fff" stroke-opacity="0.03" stroke-width="1"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/><rect width="1200" height="630" fill="url(#grid)"/><rect width="1200" height="630" fill="url(#halo)"/>
  <rect x="0.5" y="0.5" width="1199" height="629" fill="none" stroke="#fff" stroke-opacity="0.08"/>
  <g transform="translate(80 74) scale(1.7)">${emblemSvg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace('</svg>', '')}</g>
  <text x="212" y="112" fill="#7dd3fc" font-family="Manrope" font-weight="800" font-size="19" letter-spacing="5">TABULOUS GAMES</text>
  <text x="80" y="300" fill="url(#chrome)" font-family="Manrope" font-weight="800" font-size="86" letter-spacing="-2">THE CURATED</text>
  <text x="80" y="392" fill="url(#chrome)" font-family="Manrope" font-weight="800" font-size="86" letter-spacing="-2">BROWSER GAME VAULT</text>
  <text x="82" y="452" fill="#98a2b1" font-family="Manrope" font-weight="700" font-size="27" letter-spacing="1">${COUNT} games, re-verified every 24 hours. No installs, no launchers.</text>
  <g font-family="Manrope" font-weight="700" font-size="20">
    <rect x="80" y="500" width="296" height="46" rx="23" fill="#7dd3fc" fill-opacity="0.12" stroke="#7dd3fc" stroke-opacity="0.45"/>
    <text x="106" y="529" fill="#bfe9ff">WEBASSEMBLY · WEBGL</text>
    <rect x="396" y="500" width="252" height="46" rx="23" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.16"/>
    <text x="422" y="529" fill="#d7dee8">BUILT BY ONE DEV</text>
  </g>
</svg>`;

fs.writeFileSync(`${REPO}/assets/brand/banner.svg`, wordmark());
fs.writeFileSync(`${REPO}/assets/brand/og-image.png`, render(og, 1200));
fs.writeFileSync(`${REPO}/assets/brand/banner-1600x400.png`, await sharp(Buffer.from(render(wordmark(), 1600))).png().toBuffer());
console.log('brand assets written');
