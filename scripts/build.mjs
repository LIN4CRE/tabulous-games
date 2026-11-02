#!/usr/bin/env node
/**
 * Rebuilds index.html and README.md from games.json.
 *
 * games.json is the single source of truth: cards, filter counts and the
 * README table are all generated. Anything between the marker comments is
 * replaced; everything else in the HTML is left alone.
 *
 *   node scripts/build.mjs           # write
 *   node scripts/build.mjs --check   # fail if generated output is stale
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CHECK = process.argv.includes('--check');
const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'games.json'), 'utf8'));
const games = db.games;
const categories = db.categories;

const STATUS_META = {
  instant: { label: 'Instant Play', color: '#00f0ff' },
  multiplayer: { label: 'Multiplayer', color: '#ff0077' },
  files: { label: 'Own game files', color: '#a855f7' },
};

const esc = (s) =>
  String(s)
    .replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const lower = (s) => String(s).toLowerCase();
const uniq = (arr) => [...new Set(arr)];

function countByCategory(id) {
  return games.filter((g) => g.category === id).length;
}
function countByStatus(id) {
  return games.filter((g) => g.status === id).length;
}

function validate() {
  const problems = [];
  const ids = new Set();
  const catIds = new Set(categories.map((c) => c.id));
  for (const g of games) {
    if (ids.has(g.id)) problems.push(`duplicate id: ${g.id}`);
    ids.add(g.id);
    // NOTE: no duplicate-URL check. One article in the source round-up can
    // cover several ports, so shared links are intentional here.
    if (!catIds.has(g.category)) problems.push(`unknown category "${g.category}" on ${g.id}`);
    if (!STATUS_META[g.status]) problems.push(`unknown status "${g.status}" on ${g.id}`);
    if (!fs.existsSync(path.join(ROOT, g.cover))) problems.push(`missing cover: ${g.cover}`);
    if (!g.tags?.length) problems.push(`no tags on ${g.id}`);
    if (g.needsReview) problems.push(`unreviewed draft still marked needsReview: ${g.id}`);
    if (!g.desc || !g.controls || !g.goodToKnow) problems.push(`missing desc/controls/goodToKnow on ${g.id}`);
  }
  if (problems.length) {
    console.error('Validation failed:\n  ' + problems.join('\n  '));
    process.exit(1);
  }
}

/** Short labels for the compact card badge and the status filter. */
const STATUS_SHORT = { instant: 'Instant', multiplayer: 'Online', files: 'Own files' };

function getPlatform(game) {
  // games.json records the original platform for every port; the badge on each
  // card shows it directly (N64, PS4, Arcade, ...).
  return game.platform || 'PC Port';
}

const sourceType = (g) => (/github\.com|gitlab\.com/.test(g.url) ? 'repo' : 'article');

function firstSentence(text) {
  const m = String(text).match(/^.+?[.!?](?:\s|$)/);
  return m ? m[0].trim() : String(text);
}

/** Landing spotlight, generated from the catalogue's featured port. */
function hero() {
  const g = games.find((x) => x.id === db.featured) || games[0];
  const links = new Set(games.map((x) => x.url)).size;
  const repos = games.filter((x) => sourceType(x) === 'repo').length;
  const url = esc(g.url);
  const ext = 'target="_blank" rel="noopener noreferrer"';
  return `        <section class="container hero" aria-label="Featured port">
          <div class="hero-inner">
            <div class="hero-copy">
              <span class="hero-eyebrow"><i></i> FEATURED PORT · ${esc(g.sourceLabel || 'Project page')}</span>
              <h2>${esc(g.title)}</h2>
              <p class="hero-desc">${esc(firstSentence(g.desc))}</p>
              <div class="hero-meta"><span>${esc(g.platform)} original · ${g.year}</span><span>Own game files required</span></div>
              <div class="hero-actions">
                <a class="btn-hero" href="${url}" ${ext}>Open project page ↗</a>
                <a class="btn-hero-ghost" href="#gamesGrid">Browse all <span data-count-games>${games.length}</span> ports ↓</a>
              </div>
            </div>
            <a class="hero-art" href="${url}" ${ext} aria-label="Open the ${esc(g.title)} port page">
              <img src="${esc(g.cover)}" alt="Original cover art for ${esc(g.title)}" width="640" height="360" fetchpriority="high">
              <span class="hero-art-label">ORIGINAL COVER ART</span>
            </a>
          </div>
          <div class="hero-stats" aria-label="Directory at a glance">
            <div><strong data-count-games>${games.length}</strong><span>ports listed</span></div>
            <div><strong>${categories.length}</strong><span>platform groups</span></div>
            <div><strong>${links}</strong><span>links verified</span></div>
            <div><strong>${repos}</strong><span>direct project repos</span></div>
          </div>
        </section>`;
}

/** Filter cards by the kind of page they link to. */
function sourcePills() {
  const repos = games.filter((g) => sourceType(g) === 'repo').length;
  return [
    `          <button class="seg active" data-source="all">All links <span>${games.length}</span></button>`,
    `          <button class="seg" data-source="repo" title="Direct GitHub / GitLab project repositories">Repos <span>${repos}</span></button>`,
    `          <button class="seg" data-source="article" title="DSOGaming port announcements">Articles <span>${games.length - repos}</span></button>`,
  ].join('\n');
}

function card(g) {
  const tagText = lower(
    uniq([g.title, ...g.tags, g.dev, g.engine, g.categoryLabel, g.sourceLabel, sourceType(g) === 'repo' ? 'project repository' : 'port announcement', ...(g.alsoKnownAs || [])]).join(' ')
  );
  const url = esc(g.url);
  const ext = 'target="_blank" rel="noopener noreferrer"';

  const platform = getPlatform(g);
  const actionLabel = sourceType(g) === 'repo' ? 'Project repo ↗' : 'Port article ↗';
  return `        <article class="game-card" id="game-${esc(g.id)}" data-id="${esc(g.id)}" data-category="${esc(g.category)}" data-status="${esc(g.status)}" data-platform="${esc(platform)}" data-title="${esc(lower(g.title))}" data-year="${g.year}" data-source="${sourceType(g)}" data-tags="${esc(tagText)}">
          <a class="cover" href="${url}" ${ext} tabindex="-1" aria-hidden="true">
            <img src="${esc(g.cover)}" alt="" loading="lazy" decoding="async" width="640" height="360" onerror="this.onerror=null;this.src='assets/brand/banner.svg'">
            <span class="badge is-${esc(g.status)}">${esc(STATUS_SHORT[g.status])}</span>${g.isNew ? '\n            <span class="badge badge--new">New</span>' : ''}
            <span class="badge badge--platform">${esc(platform)}</span>
          </a>
          <div class="card-body">
            <h3 class="game-title"><a href="${url}" ${ext}>${esc(g.title)}</a></h3>
            <p class="game-meta">${esc(g.categoryLabel)} · ${g.year}</p>
            <p class="game-desc">${esc(g.desc)}</p>
            <div class="card-info" hidden>
              <p><b>Good to know</b> ${esc(g.goodToKnow)}</p>
              <p><b>Controls</b> ${esc(g.controls)}</p>
              <p class="card-dev">${esc(g.platform || 'Console')} original (${g.year}) · ${esc(g.engine)} · Source: ${esc(g.sourceLabel || g.source || 'announcement')}</p>
            </div>
            <div class="card-actions">
              <a class="btn-play" href="${url}" ${ext}>${actionLabel}</a>
              <button class="btn-info" type="button" aria-expanded="false">Info</button>
              <button class="btn-share" type="button" data-id="${esc(g.id)}" data-title="${esc(g.title)}" title="Copy direct link to ${esc(g.title)}" aria-label="Copy direct link to ${esc(g.title)}"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
            </div>
          </div>
        </article>`;
}

function categoryPills() {
  const rows = [
    `          <button class="pill active" data-category="all">All <span>${games.length}</span></button>`,
    ...categories
      .filter((c) => countByCategory(c.id) > 0)
      .map(
        (c) =>
          `          <button class="pill" data-category="${c.id}">${esc(c.label)} <span>${countByCategory(c.id)}</span></button>`
      ),
  ];
  return rows.join('\n');
}

function statusPills() {
  return [
    `          <button class="seg active" data-status="all">Any</button>`,
    ...Object.keys(STATUS_META)
      .filter((id) => countByStatus(id) > 0)
      .map(
        (id) =>
          `          <button class="seg" data-status="${id}" title="${esc(STATUS_META[id].label)}">${STATUS_SHORT[id]} <span>${countByStatus(id)}</span></button>`
      ),
  ].join('\n');
}

function readmeTable() {
  const rows = games.map((g) => {
    const status = STATUS_META[g.status];
    const icon = g.status === 'instant' ? '⚡' : g.status === 'multiplayer' ? '🌐' : '📁';
    const marker = g.isNew ? ' 🆕' : '';
    return `| **${esc(g.title)}**${marker} | ${esc(g.engine)} | ${esc(g.categoryLabel)} · ${esc(g.platform || '')} (${g.year}) | ${icon} ${status.label} |`;
  });
  return [
    '| Game | Port type | Original platform (year) | Requirements |',
    '| :--- | :--- | :--- | :--- |',
    ...rows,
  ].join('\n');
}

function replaceBlock(text, name, replacement) {
  const start = `<!-- ${name}:START -->`;
  const end = `<!-- ${name}:END -->`;
  const re = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!re.test(text)) {
    throw new Error(`markers for ${name} not found`);
  }
  return text.replace(re, `${start}\n${replacement}\n${end}`);
}

function tokens(text) {
  return text
    .replaceAll('{{COUNT}}', String(games.length))
    .replaceAll('{{COUNT_FILES}}', String(countByStatus('files')))
    .replaceAll('{{LAST_UPDATED}}', db.lastUpdated || '');
}

function patchIndexCounts(html) {
  const total = String(games.length);
  const instant = String(countByStatus('instant'));
  return html
    .replace(/(data-count-games>)[0-9]+/g, `$1${total}`)
    .replace(/(data-count-instant>)[0-9]+/g, `$1${instant}`)
    .replace(/(<span class="stat-value" data-count=")[0-9]+("><span data-count-games>)/, `$1${total}$2`)
    .replace(/(<span class="stat-value" data-count=")[0-9]+("><span data-count-instant>)/, `$1${instant}$2`)
    .replace(/Showing <strong>[0-9]+<\/strong> of [0-9]+ games/g, `Showing <strong>${total}</strong> of ${total} games`);
}

function renderIndex(html) {
  let out = html;
  out = replaceBlock(out, 'HERO', hero());
  out = replaceBlock(out, 'GAMES', games.map(card).join('\n\n'));
  out = replaceBlock(out, 'CATEGORY-PILLS', categoryPills());
  out = replaceBlock(out, 'STATUS-PILLS', statusPills());
  out = replaceBlock(out, 'SOURCE-PILLS', sourcePills());
  return patchIndexCounts(tokens(out));
}

function renderReadme(md) {
  let out = replaceBlock(md, 'GAMES-TABLE', readmeTable());
  out = out.replace(/PC%20Ports-[0-9]+%20Listed/g, `PC%20Ports-${games.length}%20Listed`);
  out = out.replace(
    /(## 🚀 The Port Directory \()[0-9]+ entries, [0-9]+ need your own files(\))/,
    `$1${games.length} entries, ${countByStatus('files')} need your own files$2`
  );
  return tokens(out);
}

validate();

const indexPath = path.join(ROOT, 'index.html');
const readmePath = path.join(ROOT, 'README.md');
const before = {
  'index.html': fs.readFileSync(indexPath, 'utf8'),
  'README.md': fs.readFileSync(readmePath, 'utf8'),
};
const after = {
  'index.html': renderIndex(before['index.html']),
  'README.md': renderReadme(before['README.md']),
};

/** Every local asset the rendered page points at must exist on disk. */
function checkAssets(html) {
  const refs = new Set(
    [...html.matchAll(/(?:src|href)="((?!https?:|mailto:|javascript:|data:|#)[^"]+)"/g)].map((m) => m[1])
  );
  const missing = [...refs].filter((ref) => !fs.existsSync(path.join(ROOT, ref.split('?')[0])));
  if (missing.length) {
    for (const ref of missing) console.error(`missing local asset: ${ref}`);
    if (CHECK) process.exitCode = 1;
  }
}
checkAssets(after['index.html']);

let stale = 0;
for (const [file, content] of Object.entries(after)) {
  if (content !== before[file]) {
    stale++;
    if (CHECK) {
      console.error(`${file} is stale — run node scripts/build.mjs`);
    } else {
      fs.writeFileSync(path.join(ROOT, file), content);
      console.log(`updated ${file}`);
    }
  } else {
    console.log(`${file} already up to date`);
  }
}
if (CHECK && stale) process.exit(1);
console.log(
  `games: ${games.length} · instant ${countByStatus('instant')} · multiplayer ${countByStatus('multiplayer')} · files ${countByStatus('files')}`
);
