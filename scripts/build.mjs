#!/usr/bin/env node
/**
 * Rebuilds index.html and README.md from games.json.
 *
 * games.json is the single source of truth: cards, filter counts, the audit
 * section and the README table are all generated. Anything between the marker
 * comments is replaced; everything else in the HTML is left alone.
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
  files: { label: 'Custom Files', color: '#a855f7' },
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
  const urls = new Set();
  const catIds = new Set(categories.map((c) => c.id));
  for (const g of games) {
    if (ids.has(g.id)) problems.push(`duplicate id: ${g.id}`);
    ids.add(g.id);
    if (urls.has(g.url)) problems.push(`duplicate url: ${g.url}`);
    urls.add(g.url);
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
  const text = (
    game.title +
    ' ' +
    game.engine +
    ' ' +
    (game.tags || []).join(' ') +
    ' ' +
    (game.alsoKnownAs || []).join(' ')
  ).toLowerCase();
  if (
    text.includes('nintendo 64') ||
    text.includes('n64') ||
    text.includes('sm64') ||
    text.includes('zelda 64') ||
    text.includes('banjo') ||
    text.includes('kart 64') ||
    text.includes('star fox 64') ||
    text.includes('donkey kong 64') ||
    text.includes('conker') ||
    text.includes('snap 64') ||
    text.includes('f-zero x') ||
    text.includes('paper mario') ||
    text.includes('perfect dark') ||
    text.includes('goldeneye') ||
    text.includes('diddy kong')
  )
    return 'N64';
  if (
    text.includes('playstation 2') ||
    text.includes('ps2') ||
    text.includes('dobiestation') ||
    text.includes('burnout 3') ||
    text.includes('pes 6') ||
    text.includes('jak and daxter') ||
    text.includes('sly cooper') ||
    text.includes('ratchet')
  )
    return 'PS2';
  if (
    text.includes('playstation 3') ||
    text.includes('ps3') ||
    text.includes('rpcs3') ||
    text.includes('skate 3') ||
    text.includes('sonic unleashed') ||
    text.includes('red dead redemption') ||
    text.includes('the last of us') ||
    text.includes('infamous') ||
    text.includes('god of war 3') ||
    text.includes('killzone') ||
    text.includes('uncharted')
  )
    return 'PS3';
  if (
    text.includes('playstation 4') ||
    text.includes('ps4') ||
    text.includes('shadps4') ||
    text.includes('bloodborne') ||
    text.includes('driveclub') ||
    text.includes('gravity rush') ||
    text.includes('order 1886') ||
    text.includes('pt ') ||
    text.includes('p.t.')
  )
    return 'PS4';
  if (
    text.includes('playstation') ||
    text.includes('ps1') ||
    text.includes('psx') ||
    text.includes('duckstation') ||
    text.includes('silent hill') ||
    text.includes('metal gear solid') ||
    text.includes('crash bandicoot') ||
    text.includes('spyro') ||
    text.includes('xenogears') ||
    text.includes('castlevania: symphony') ||
    text.includes('tony hawk') ||
    text.includes('ridge racer') ||
    text.includes('gran turismo') ||
    text.includes('legaia') ||
    text.includes('wipeout')
  )
    return 'PS1';
  if (
    text.includes('xbox 360') ||
    text.includes('x360') ||
    text.includes('xenia') ||
    text.includes('halo 3') ||
    text.includes('halo: reach') ||
    text.includes('gears of war') ||
    text.includes('forza')
  )
    return 'Xbox 360';
  if (
    text.includes('xbox') ||
    text.includes('halo: combat evolved') ||
    text.includes('halo ce') ||
    text.includes('jet set radio future')
  )
    return 'Xbox';
  if (
    text.includes('gamecube') ||
    text.includes('wii') ||
    text.includes('dolphin') ||
    text.includes('twilight princess') ||
    text.includes('wind waker') ||
    text.includes('super smash bros. melee') ||
    text.includes('super mario sunshine') ||
    text.includes('metroid prime')
  )
    return 'GC / Wii';
  if (
    text.includes('game boy advance') ||
    text.includes('gba') ||
    text.includes('pokemon emerald') ||
    text.includes('mother 3') ||
    text.includes('minish cap') ||
    text.includes('golden sun')
  )
    return 'GBA';
  if (text.includes('nintendo ds') || text.includes('nds') || text.includes('melonds')) return 'NDS';
  if (
    text.includes('dreamcast') ||
    text.includes('flycast') ||
    text.includes('shenmue') ||
    text.includes('sonic adventure') ||
    text.includes('crazy taxi') ||
    text.includes('skies of arcadia')
  )
    return 'Dreamcast';
  if (
    text.includes('saturn') ||
    text.includes('sega saturn') ||
    text.includes('panzer dragoon') ||
    text.includes('nights into dreams')
  )
    return 'Saturn';
  if (text.includes('pico-8') || text.includes('celeste classic')) return 'PICO-8';
  if (
    text.includes('ms-dos') ||
    text.includes('dosbox') ||
    text.includes('doom') ||
    text.includes('quake') ||
    text.includes('duke nukem') ||
    text.includes('wolfenstein') ||
    text.includes('daggerfall') ||
    text.includes('diablo')
  )
    return 'Classic PC';
  if (text.includes('webgpu') || text.includes('most wanted')) return 'WebGPU';
  if (text.includes('webassembly') || text.includes('wasm')) return 'WASM';
  if (text.includes('webgl')) return 'WebGL';
  if (text.includes('recomp') || text.includes('pc port') || text.includes('native')) return 'PC Port';
  return 'Web / Indie';
}

function card(g) {
  const tagText = lower(
    uniq([g.title, ...g.tags, g.dev, g.engine, g.categoryLabel, ...(g.alsoKnownAs || [])]).join(' ')
  );
  const url = esc(g.url);
  const ext = 'target="_blank" rel="noopener noreferrer"';

  const platform = getPlatform(g);
  return `        <article class="game-card" id="game-${esc(g.id)}" data-id="${esc(g.id)}" data-category="${esc(g.category)}" data-status="${esc(g.status)}" data-platform="${esc(platform)}" data-title="${esc(lower(g.title))}" data-year="${g.year}" data-tags="${esc(tagText)}">
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
              <p class="card-dev">${esc(g.dev)} · ${esc(g.engine)}</p>
            </div>
            <div class="card-actions">
              <a class="btn-play" href="${url}" ${ext}>Play</a>
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
    ...Object.keys(STATUS_META).map(
      (id) =>
        `          <button class="seg" data-status="${id}" title="${esc(STATUS_META[id].label)}">${STATUS_SHORT[id]} <span>${countByStatus(id)}</span></button>`
    ),
  ].join('\n');
}

function auditSection() {
  const items = db.excluded || [];
  const rows = items
    .map((e) => `            <li><b>${esc(e.name)}</b> — ${esc(e.reason)} <code>${esc(e.url)}</code></li>`)
    .join('\n');

  return `        <details class="audit" id="audit">
          <summary>Removed &amp; excluded links <span>${items.length}</span></summary>
          <ul>
${rows}
          </ul>
        </details>`;
}

function readmeTable() {
  const rows = games.map((g) => {
    const status = STATUS_META[g.status];
    const icon = g.status === 'instant' ? '⚡' : g.status === 'multiplayer' ? '🌐' : '📁';
    const marker = g.isNew ? ' 🆕' : '';
    return `| **${esc(g.title)}**${marker} | ${esc(g.engine)} | ${esc(g.categoryLabel)} | ${icon} ${status.label} |`;
  });
  return [
    '| Game Title | Platform / Tech | Genre | Status |',
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
    .replaceAll('{{COUNT_INSTANT}}', String(countByStatus('instant')))
    .replaceAll('{{COUNT_MULTIPLAYER}}', String(countByStatus('multiplayer')))
    .replaceAll('{{COUNT_FILES}}', String(countByStatus('files')))
    .replaceAll('{{COUNT_SURVIVORS}}', String(countByCategory('survivors')))
    .replaceAll('{{EXCLUDED_COUNT}}', String((db.excluded || []).length))
    .replaceAll('{{LAST_UPDATED}}', db.lastUpdated || '');
}

function scanFallback() {
  const file = path.join(ROOT, 'data/status.json');
  const status = fs.existsSync(file)
    ? JSON.parse(fs.readFileSync(file, 'utf8'))
    : { lastScan: null, mode: 'not-run', stats: {} };
  // Keep the payload safe to embed inside a <script type="application/json"> block.
  return JSON.stringify(status).replace(/</g, '\\u003c');
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
  out = replaceBlock(out, 'GAMES', games.map(card).join('\n\n'));
  out = replaceBlock(out, 'CATEGORY-PILLS', categoryPills());
  out = replaceBlock(out, 'STATUS-PILLS', statusPills());
  out = replaceBlock(out, 'AUDIT', auditSection());
  const fallback = scanFallback();
  out = out.replace(
    /(<script type="application\/json" id="scanFallback">)[\s\S]*?(<\/script>)/,
    `$1${fallback}$2`
  );
  out = out.replaceAll('{{SCAN_FALLBACK}}', fallback);
  return patchIndexCounts(tokens(out));
}

function renderReadme(md) {
  let out = replaceBlock(md, 'GAMES-TABLE', readmeTable());
  out = out.replace(/Verified%20Games-[0-9]+%20Playable/g, `Verified%20Games-${games.length}%20Playable`);
  out = out.replace(
    /(## 🚀 The Curated Library \()[0-9]+ entries, [0-9]+ instant-play(\))/,
    `$1${games.length} entries, ${countByStatus('instant')} instant-play$2`
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
