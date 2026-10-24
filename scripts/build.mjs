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

const STATUS_ICON = { instant: 'i-bolt', multiplayer: 'i-globe', files: 'i-folder' };

function icon(name, cls = 'ico ico--sm') {
  return `<svg class="${cls}" aria-hidden="true"><use href="#${name}"></use></svg>`;
}

function card(g) {
  const status = STATUS_META[g.status];
  const tagText = lower(
    uniq([...g.tags, g.dev, g.engine, g.categoryLabel, ...(g.alsoKnownAs || [])]).join(' ')
  );

  return `        <article class="game-card"
          data-id="${esc(g.id)}"
          data-category="${esc(g.category)}"
          data-status="${esc(g.status)}"
          data-title="${esc(lower(g.title))}"
          data-year="${g.year}"
          data-tags="${esc(tagText)}">

          <a href="${esc(g.url)}" target="_blank" rel="noopener noreferrer" class="cover-link-wrapper" title="Play ${esc(g.title)} in a new tab">
            <img src="${esc(g.cover)}" alt="${esc(g.title)} cover art" class="cover-img" loading="lazy" decoding="async" width="640" height="360" onerror="this.src='assets/brand/banner.svg'">
            <div class="floating-badges">
              <span class="badge-status is-${esc(g.status)}">
                ${icon(STATUS_ICON[g.status] || 'i-bolt', 'ico ico--sm')}
                ${esc(status.label)}
              </span>
              <span class="floating-right">
                ${g.isNew ? '<span class="badge-new">NEW</span>' : ''}
                <span class="badge-year">${g.year}</span>
              </span>
            </div>
            <div class="play-hover-badge">
              <span class="play-pill">${icon('i-play', 'ico ico--sm')} Play in tab</span>
            </div>
          </a>

          <div class="card-body">
            <div class="card-header-row">
              <h2 class="game-title">
                <a href="${esc(g.url)}" target="_blank" rel="noopener noreferrer">${esc(g.title)}</a>
              </h2>
              <p class="game-meta-subtitle">
                <span>${esc(g.dev)}</span>
                <span aria-hidden="true">·</span>
                <span>${esc(g.engine)}</span>
              </p>
            </div>

            <p class="game-desc">${esc(g.desc)}</p>

            <div class="info-box">
              <div class="info-label">${icon('i-shield', 'ico ico--sm')} Good to know</div>
              <div class="info-text">${esc(g.goodToKnow)}</div>
              <div class="controls-snippet">${icon('i-terminal', 'ico ico--sm')} ${esc(g.controls)}</div>
            </div>

            <div class="tags-row">
              ${g.tags.map((t) => `<span class="tag-chip">#${esc(t)}</span>`).join('')}
            </div>

            <a href="${esc(g.url)}" target="_blank" rel="noopener noreferrer" class="btn-launch">
              <span>Launch ${esc(g.shortTitle)}</span>
              ${icon('i-external')}
            </a>
          </div>

        </article>`;
}

function featuredSection() {
  const feat = games.find((g) => g.id === db.featured) || games[0];
  if (!feat) return '';
  const status = STATUS_META[feat.status];
  return `      <div class="section-head reveal">
        <div>
          <div class="section-kicker">Editor's pick</div>
          <h2 class="section-title">The one to start with</h2>
        </div>
        <a class="section-link" href="#library">See all ${games.length} ${icon('i-arrow-right')}</a>
      </div>

      <article class="featured reveal">
        <a class="featured-media" href="${esc(feat.url)}" target="_blank" rel="noopener noreferrer" aria-label="Play ${esc(feat.title)}">
          <span class="featured-badge">${icon('i-play', 'ico ico--sm')} Featured</span>
          <img src="${esc(feat.cover)}" alt="${esc(feat.title)} cover art" loading="lazy" decoding="async">
        </a>
        <div class="featured-body">
          <h3 class="featured-title"><a href="${esc(feat.url)}" target="_blank" rel="noopener noreferrer">${esc(feat.title)}</a></h3>
          <p class="featured-meta">${esc(feat.categoryLabel)} · ${esc(feat.dev)} · ${feat.year} · ${esc(status.label)}</p>
          <p class="featured-desc">${esc(feat.desc)}</p>
          <div class="featured-facts">
            <div>${icon('i-shield')}<span>${esc(feat.goodToKnow)}</span></div>
            <div>${icon('i-terminal')}<span>${esc(feat.controls)}</span></div>
          </div>
          <div class="featured-actions">
            <a class="btn btn--primary" href="${esc(feat.url)}" target="_blank" rel="noopener noreferrer">${icon('i-play')} Play ${esc(feat.shortTitle)}</a>
            <a class="btn btn--secondary" href="#library">${icon('i-layers')} Browse the vault</a>
          </div>
        </div>
      </article>`;
}

function categoryPills() {
  const rows = [
    `          <button class="pill-btn active" data-category="all">All games <span style="opacity:.55">${games.length}</span></button>`,
    ...categories
      .filter((c) => countByCategory(c.id) > 0)
      .map(
        (c) =>
          `          <button class="pill-btn" data-category="${c.id}">${esc(c.label)} <span style="opacity:.55">${countByCategory(c.id)}</span></button>`
      ),
  ];
  return rows.join('\n');
}

function statusPills() {
  return [
    `          <button class="pill-btn active" data-status="all">All statuses</button>`,
    `          <button class="pill-btn" data-status="instant">Instant play <span style="opacity:.55">${countByStatus('instant')}</span></button>`,
    `          <button class="pill-btn" data-status="multiplayer">Multiplayer <span style="opacity:.55">${countByStatus('multiplayer')}</span></button>`,
    `          <button class="pill-btn" data-status="files">Custom files <span style="opacity:.55">${countByStatus('files')}</span></button>`,
  ].join('\n');
}

function auditSection() {
  const items = db.excluded || [];
  const cards = items
    .map(
      (e) => `          <div class="audit-item">
            <div class="audit-item-title">
              ${icon('i-x')}
              <span>${esc(e.name)}</span>
            </div>
            <div class="audit-item-reason">
              <div class="audit-url">${esc(e.url)}</div>
              <div>${esc(e.reason)}</div>
            </div>
          </div>`
    )
    .join('\n');

  return `      <div class="audit-section" id="audit-section">
        <div class="audit-header">
          <h2 class="audit-title">${icon('i-shield')} Transparency log</h2>
          <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--dim);">${items.length} links tested &amp; excluded</span>
        </div>
        <p>
          Nothing is removed silently. Each entry below was checked and kept out of the live grid — dead hosts,
          takedowns, storefronts with no game, or titles that could not be verified. The bot also writes removals here automatically.
        </p>
        <div class="audit-grid">
${cards}
        </div>
      </div>`;
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

function renderIndex(html) {
  let out = html;
  out = replaceBlock(out, 'GAMES', games.map(card).join('\n\n'));
  out = replaceBlock(out, 'CATEGORY-PILLS', categoryPills());
  out = replaceBlock(out, 'STATUS-PILLS', statusPills());
  out = replaceBlock(out, 'FEATURED', featuredSection());
  out = replaceBlock(out, 'AUDIT', auditSection());
  out = out.replaceAll('{{SCAN_FALLBACK}}', scanFallback());
  return tokens(out);
}

function renderReadme(md) {
  let out = replaceBlock(md, 'GAMES-TABLE', readmeTable());
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
