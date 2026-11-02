#!/usr/bin/env node
/**
 * Validates the committed cover artwork. The directory uses the games' real
 * box/key art (see assets/covers/ARTWORK.md) — there are no generated covers.
 *
 * Usage: node scripts/check-artwork.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'games.json'), 'utf8'));
const dir = path.join(ROOT, 'assets/covers');
const problems = [];
const referenced = new Set();

for (const g of db.games) {
  const file = path.join(ROOT, g.cover);
  referenced.add(path.basename(g.cover));
  if (!fs.existsSync(file)) { problems.push(`missing artwork: ${g.cover}`); continue; }
  const buf = fs.readFileSync(file);
  if (buf.length < 4096) problems.push(`artwork too small: ${g.cover} (${buf.length} bytes)`);
  if (buf[0] !== 0xff || buf[1] !== 0xd8) problems.push(`not a JPEG: ${g.cover}`);
}

for (const f of fs.readdirSync(dir)) {
  if (f.endsWith('.md')) continue; // attribution notes
  if (!f.endsWith('.jpg')) problems.push(`unexpected file in assets/covers: ${f}`);
  else if (!referenced.has(f)) problems.push(`orphaned artwork (no card): ${f}`);
}

if (problems.length) {
  console.error('Artwork check failed:\n  ' + problems.join('\n  '));
  process.exit(1);
}
console.log(`cover art: ${db.games.length} original covers, all JPEG and all referenced`);
