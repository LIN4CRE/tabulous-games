#!/usr/bin/env node
/**
 * Self-maintenance pass for the catalogue.
 *
 *   1. Publishes a small number of *strong* candidates that the daily scan
 *      verified, so the site grows without anyone touching it.
 *   2. Retires games whose host has definitively gone (404/410 or a redirect
 *      to an unrelated domain), recording the reason in the audit list.
 *
 * Deliberately conservative: timeouts, 5xx and bot-check responses are never
 * treated as removals, and only a handful of auto-additions are allowed per
 * run so a noisy source cannot flood the grid.
 *
 *   node scripts/auto-publish.mjs                 # publish up to 3 + repair
 *   node scripts/auto-publish.mjs --max=5
 *   node scripts/auto-publish.mjs --dry-run
 *   node scripts/auto-publish.mjs --no-publish --repair
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const NO_PUBLISH = args.includes('--no-publish');
const NO_REPAIR = args.includes('--no-repair');
const maxArg = args.find((a) => a.startsWith('--max='));
const MAX_PUBLISH = Math.max(0, Number(maxArg ? maxArg.split('=')[1] : 3) || 0);

const DB_PATH = path.join(ROOT, 'games.json');
const FIXTURES = args.includes('--fixtures');
const REPORT_PATH = path.join(ROOT, FIXTURES ? 'data/discoveries.fixture.json' : 'data/discoveries.json');
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const report = fs.existsSync(REPORT_PATH) ? JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8')) : {};
const today = new Date().toISOString().slice(0, 10);

// Guard rail: if the scan says it is degraded, or a large share of the
// catalogue suddenly fails, assume a network/outage problem and change nothing.
const deadCount = (report.deadLinks || []).length;
const outageThreshold = Math.max(3, Math.ceil(db.games.length * 0.15));
const OUTAGE = Boolean(report.degraded) || deadCount > outageThreshold;
if (OUTAGE) {
  console.warn(
    `auto-publish: refusing to act — ${deadCount} dead link(s) of ${db.games.length} games ` +
      `(threshold ${outageThreshold})${report.degraded ? ', run flagged degraded' : ''}. ` +
      'Re-run when the scanner has healthy network access.'
  );
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, 'published=0\nretired=0\n');
  }
  process.exit(0);
}


const STATUS = {
  instant: { label: 'Instant Play', color: '#00f0ff' },
  multiplayer: { label: 'Multiplayer', color: '#ff0077' },
  files: { label: 'Custom Files', color: '#a855f7' },
};
const CATEGORY_LABELS = Object.fromEntries((db.categories || []).map((c) => [c.id, c.label]));

const clean = (text = '') =>
  String(text)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const slugify = (text) =>
  String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'game';

const titleCase = (s) => String(s).replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function truncate(text, limit) {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  return `${(stop > 80 ? cut.slice(0, stop + 1) : cut.trimEnd())}…`;
}

function uniqueId(base, taken) {
  let id = slugify(base);
  let n = 2;
  while (taken.has(id)) id = `${slugify(base)}-${n++}`;
  return id;
}

// ---------------------------------------------------------------------------
// 1. Publish verified discoveries
// ---------------------------------------------------------------------------
const knownUrls = new Set(db.games.map((g) => g.url.replace(/\/+$/, '')));
const takenIds = new Set(db.games.map((g) => g.id));
const published = [];
const skipped = [];

function qualifies(c) {
  if (!c.verified?.ok) return 'link not verified';
  if (c.known) return 'already in catalogue';
  if (!c.title || c.title.length < 3) return 'no usable title';
  if (c.statusHint !== 'instant') return `unclear status (${c.statusHint})`;
  if (!['portedgames', 'spawn', 'itch', 'curated'].includes(c.source)) return `source ${c.source} needs review`;
  let desc = clean(c.description);
  if (desc.length < 60) {
    desc = `${desc ? desc + '. ' : ''}${c.title} is a verified browser game that runs directly in a tab with no separate installer or launcher.`;
    c.description = desc;
  }
  if (!CATEGORY_LABELS[c.category]) {
    c.category = 'classic-pc';
  }
  if (knownUrls.has(c.url.replace(/\/+$/, ''))) return 'duplicate URL';
  return null;
}

if (!NO_PUBLISH && MAX_PUBLISH > 0) {
  for (const c of report.candidates || []) {
    if (published.length >= MAX_PUBLISH) break;
    const reason = qualifies(c);
    if (reason) {
      skipped.push(`${c.title || c.url}: ${reason}`);
      continue;
    }
    const status = STATUS[c.statusHint] || STATUS.instant;
    const genres = (c.genres || []).map(titleCase).filter((g) => !/^(Action|Survival)$/i.test(g));
    const id = uniqueId(c.title, takenIds);
    const host = new URL(c.url).host.replace(/^www\./, '');
    const entry = {
      id,
      title: c.title,
      shortTitle: c.title.length > 30 ? `${c.title.slice(0, 28).trim()}…` : c.title,
      url: c.url,
      cover: `assets/covers/${id}.svg`,
      category: c.category,
      categoryLabel: CATEGORY_LABELS[c.category],
      year: (() => {
        const m = `${c.title} ${c.description}`.match(/\b(19[5-9]\d|20[0-2]\d)\b/);
        return m ? Number(m[1]) : new Date().getFullYear();
      })(),
      dev: c.source === 'spawn' ? 'Community creator (Spawn)' : 'Community fan project',
      engine: c.source === 'spawn' ? 'WebGL / Spawn Engine' : 'Browser / WebAssembly',
      status: 'instant',
      statusLabel: status.label,
      statusColor: status.color,
      badge: 'AUTO-DISCOVERED',
      desc: truncate(clean(c.description), 260),
      controls:
        'Mouse and keyboard — most browser ports use WASD or the arrow keys with the mouse. The in-game help shows the exact bindings.',
      goodToKnow: `Auto-discovered by the daily bot on ${today} from ${host}. The play link was checked automatically; if it stops responding the bot retires it on a later scan. Card details are pending human review.`,
      tags: ['Auto-Discovered', ...genres].slice(0, 5),
      added: today,
      isNew: true,
      autoAdded: true,
      discoveredFrom: c.sourceUrl || c.source,
    };
    if (entry.tags.length === 1) entry.tags.push('Browser Game');

    db.games.unshift(entry);
    takenIds.add(id);
    knownUrls.add(entry.url.replace(/\/+$/, ''));
    published.push(entry);
  }
}

// ---------------------------------------------------------------------------
// 2. Retire games that have definitively gone away
// ---------------------------------------------------------------------------
const retired = [];
if (!NO_REPAIR) {
  const definitive = (d) =>
    /HTTP (404|410)\b/i.test(d.note || '') || /redirects to unrelated host/i.test(d.note || '');

  for (const dead of (report.deadLinks || []).filter(definitive)) {
    const idx = db.games.findIndex((g) => g.id === dead.id || g.url === dead.url);
    if (idx < 0) continue;
    const [gone] = db.games.splice(idx, 1);
    db.excluded = db.excluded || [];
    if (!db.excluded.some((e) => e.url === gone.url)) {
      db.excluded.push({
        name: gone.title,
        url: gone.url,
        reason: `Removed automatically on ${today}: ${dead.note || `HTTP ${dead.status}`}. Restore it if the host recovers.`,
      });
    }
    retired.push(gone);
  }
}

// ---------------------------------------------------------------------------
// Persist + regenerate derived files
// ---------------------------------------------------------------------------
const changed = published.length || retired.length;
if (changed && !DRY) {
  db.lastUpdated = today;
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + '\n');
  const run = (script, extra = []) =>
    execFileSync(process.execPath, [path.join(ROOT, 'scripts', script), ...extra], { stdio: 'inherit' });
  run('make-covers.mjs');
  run('build.mjs');
}

console.log(
  `auto-publish: ${DRY ? '[dry run] ' : ''}${published.length} published, ${retired.length} retired` +
    (skipped.length ? `, ${skipped.length} skipped` : '')
);
for (const p of published) console.log(`  + ${p.title} — ${p.url}`);
for (const r of retired) console.log(`  - ${r.title} — ${r.url}`);
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `published=${published.length}\nretired=${retired.length}\n`);
}
