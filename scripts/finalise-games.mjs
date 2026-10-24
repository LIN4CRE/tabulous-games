#!/usr/bin/env node
/**
 * Turns discovery candidates into draft games.json entries.
 *
 * Discovery is deliberately optimistic: it finds links fast but knows little
 * about a game. This script stages a candidate with the fields it *can* infer
 * and flags the rest for review, so publishing stays a conscious action.
 *
 *   node scripts/finalise-games.mjs --list
 *   node scripts/finalise-games.mjs --id swarm-lantern
 *   node scripts/finalise-games.mjs --all
 *   node scripts/finalise-games.mjs --apply     # only fully reviewed drafts
 *
 * Drafts are written to data/pending-games.json. Delete a draft once you have
 * published it (via --apply) or decided against it.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const FIXTURES = args.includes('--fixtures');
const LIST = args.includes('--list');
const APPLY = args.includes('--apply');
const ALL = args.includes('--all');
const ids = args
  .map((a, i) => (a === '--id' ? args[i + 1] : ''))
  .filter(Boolean)
  .flatMap((v) => v.split(','))
  .map((v) => v.trim())
  .filter(Boolean);

const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'games.json'), 'utf8'));
const reportPath = path.join(ROOT, FIXTURES ? 'data/discoveries.fixture.json' : 'data/discoveries.json');
const pendingPath = path.join(ROOT, 'data/pending-games.json');

if (!fs.existsSync(reportPath)) {
  console.error(`No discovery report at ${path.relative(ROOT, reportPath)}. Run: node scripts/discover-games.mjs`);
  process.exit(1);
}
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const candidates = report.candidates || [];
const pending = fs.existsSync(pendingPath) ? JSON.parse(fs.readFileSync(pendingPath, 'utf8')) : { games: [] };
const knownIds = new Set(db.games.map((g) => g.id));
const pendingIds = new Set(pending.games.map((g) => g.id));

const titleCase = (s) =>
  String(s)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const STATUS = {
  instant: { label: 'Instant Play', color: '#00f0ff' },
  multiplayer: { label: 'Multiplayer', color: '#ff0077' },
  files: { label: 'Custom Files', color: '#a855f7' },
};

const CATEGORY_LABELS = Object.fromEntries((db.categories || []).map((c) => [c.id, c.label]));

function draft(c) {
  const status = STATUS[c.statusHint] ? c.statusHint : 'instant';
  const yearMatch = String(c.title).match(/\b(19[5-9]\d|20[0-2]\d)\b/);
  const tags = (c.genres || [])
    .filter((g) => !/^(action|survival|roguelite|roguelike)$/i.test(g))
    .slice(0, 4)
    .map(titleCase);
  return {
    id: c.id,
    title: c.title,
    shortTitle: c.title.length > 28 ? `${c.title.slice(0, 26).trim()}…` : c.title,
    url: c.url,
    cover: `assets/covers/${c.id}.svg`,
    category: c.category || 'classic-pc',
    categoryLabel: CATEGORY_LABELS[c.category] || 'Classic PC & Retro Ports',
    year: yearMatch ? Number(yearMatch[1]) : new Date().getFullYear(),
    dev: 'Needs review',
    engine: 'Browser / Web',
    status,
    statusLabel: STATUS[status].label,
    statusColor: STATUS[status].color,
    badge: 'NEW FIND',
    desc: '',
    controls: '',
    goodToKnow: '',
    tags: tags.length ? tags : ['Browser Game'],
    added: new Date().toISOString().slice(0, 10),
    isNew: true,
    source: c.sourceUrl || c.source,
    needsReview: true,
  };
}

if (LIST) {
  if (!candidates.length) console.log('No candidates in the current report.');
  for (const c of candidates) {
    const mark = knownIds.has(c.id) ? '✓ published' : pendingIds.has(c.id) ? '• staged' : '＋ new';
    console.log(`${mark.padEnd(12)} ${c.id.padEnd(34)} ${c.category.padEnd(12)} ${c.url}`);
  }
  console.log(`\n${candidates.length} candidate(s). Stage one with --id <id>, or stage all with --all.`);
  process.exit(0);
}

if (APPLY) {
  const ready = pending.games.filter((g) => !g.needsReview && !knownIds.has(g.id));
  const blocked = pending.games.filter((g) => g.needsReview || knownIds.has(g.id));
  if (!ready.length) {
    console.error('Nothing to publish: no reviewed drafts in data/pending-games.json.');
    if (blocked.length) {
      console.error('Unreviewed drafts:');
      for (const g of blocked) console.error(`  - ${g.id} (set needsReview:false and fill desc/controls/goodToKnow)`);
    }
    process.exit(1);
  }
  db.games = [...ready, ...db.games];
  fs.writeFileSync(path.join(ROOT, 'games.json'), JSON.stringify(db, null, 2) + '\n');
  const remaining = pending.games.filter((g) => !ready.includes(g));
  fs.writeFileSync(pendingPath, JSON.stringify({ games: remaining }, null, 2) + '\n');
  console.log(`Published ${ready.length} game(s). Run node scripts/make-covers.mjs && node scripts/build.mjs.`);
  process.exit(0);
}

if (!ALL && !ids.length) {
  console.error('Nothing selected. Use --list to inspect, --id <id> or --all to stage, --apply to publish.');
  process.exit(1);
}

const selected = ALL ? candidates : candidates.filter((c) => ids.includes(c.id));
const missing = ids.filter((id) => !candidates.some((c) => c.id === id));
if (missing.length) console.error(`Not in the current report: ${missing.join(', ')}`);

let staged = 0;
for (const c of selected) {
  if (knownIds.has(c.id)) {
    console.log(`skip ${c.id} — already in games.json`);
    continue;
  }
  const existing = pending.games.findIndex((g) => g.id === c.id);
  const entry = draft(c);
  if (existing >= 0) pending.games[existing] = { ...entry, ...pending.games[existing], url: entry.url };
  else pending.games.push(entry);
  staged++;
}
fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2) + '\n');
console.log(`Staged ${staged} draft(s) in data/pending-games.json.`);
console.log('Next: fill desc, controls and goodToKnow, set needsReview:false, then --apply.');
