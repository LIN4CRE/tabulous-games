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

function card(g) {
  const status = STATUS_META[g.status];
  const tagText = lower(
    uniq([...g.tags, g.dev, g.engine, g.categoryLabel, ...(g.alsoKnownAs || [])]).join(' ')
  );
  const searchTitle = lower(g.title);
  const chip = (t) => `<span class="tag-chip">#${esc(t)}</span>`;
  const newBadge = g.isNew ? `<span class="badge-new">NEW</span>` : '';

  return `        <article class="game-card" 
          data-id="${esc(g.id)}"
          data-category="${esc(g.category)}"
          data-status="${esc(g.status)}"
          data-title="${esc(searchTitle)}"
          data-year="${g.year}"
          data-tags="${esc(tagText)}">
          
          <a href="${esc(g.url)}" target="_blank" rel="noopener noreferrer" class="cover-link-wrapper" title="Launch ${esc(g.title)} in a new tab">
            <img src="${esc(g.cover)}" alt="${esc(g.title)} Artwork" class="cover-img" loading="lazy" onerror="this.src='assets/banner.svg'">
            <div class="floating-badges">
              <span class="badge-status" style="background: ${status.color}22; color: ${status.color}; border: 1px solid ${status.color}66;">
                ${esc(status.label)}
              </span>
              <span class="floating-right">
                ${newBadge}
                <span class="badge-year">${g.year}</span>
              </span>
            </div>
            <div class="cover-overlay">
              <span style="font-size: 0.75rem; font-weight: 800; color: #fff; background: rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
                ${esc(g.badge)}
              </span>
            </div>
            <div class="play-hover-badge">
              <div class="play-pill">
                <span>PLAY IN TAB</span>
                <span>↗</span>
              </div>
            </div>
          </a>

          <div class="card-body">
            <div class="card-header-row">
              <h2 class="game-title">
                <a href="${esc(g.url)}" target="_blank" rel="noopener noreferrer">${esc(g.title)}</a>
              </h2>
              <div class="game-meta-subtitle">
                <span>${esc(g.dev)}</span>
                <span>•</span>
                <span style="color: var(--text-dim);">${esc(g.engine)}</span>
              </div>
            </div>

            <p class="game-desc">${esc(g.desc)}</p>

            <div class="info-box">
              <div class="info-label">💡 Good to Know</div>
              <div class="info-text">${esc(g.goodToKnow)}</div>
              <div class="controls-snippet">🎮 ${esc(g.controls)}</div>
            </div>

            <div class="tags-row">
              ${g.tags.map(chip).join('')}
            </div>

            <a href="${esc(g.url)}" target="_blank" rel="noopener noreferrer" class="btn-launch">
              <span>Launch ${esc(g.shortTitle)}</span>
              <span>↗</span>
            </a>
          </div>

        </article>`;
}

function categoryPills() {
  const rows = [
    `        <button class="pill-btn active" data-category="all">All Games (${games.length})</button>`,
    ...categories
      .filter((c) => countByCategory(c.id) > 0)
      .map(
        (c) =>
          `        <button class="pill-btn" data-category="${c.id}">${c.emoji} ${esc(c.label)} (${countByCategory(c.id)})</button>`
      ),
  ];
  return rows.join('\n');
}

function statusPills() {
  return [
    `        <button class="pill-btn active" data-status="all">All Statuses</button>`,
    `        <button class="pill-btn" data-status="instant">⚡ Instant Play (${countByStatus('instant')})</button>`,
    `        <button class="pill-btn" data-status="multiplayer">🌐 Multiplayer (${countByStatus('multiplayer')})</button>`,
    `        <button class="pill-btn" data-status="files">📁 Custom Files / Addons (${countByStatus('files')})</button>`,
  ].join('\n');
}

function auditSection() {
  const items = db.excluded || [];
  const cards = items
    .map(
      (e) => `          <div class="audit-item">
            <div class="audit-item-title">
              <span>✕</span>
              <span>${esc(e.name)}</span>
            </div>
            <div class="audit-item-reason">
              <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #cbd5e1; margin-bottom: 4px; word-break: break-all;">${esc(e.url)}</div>
              <div>${esc(e.reason)}</div>
            </div>
          </div>`
    )
    .join('\n        \n');

  return `    <section class="audit-section" id="audit-section">
      <div class="audit-header">
        <h3 class="audit-title">
          <span>🔍 Transparency Audit: Excluded, Offline or Unverified</span>
        </h3>
        <span style="font-size: 0.85rem; color: var(--text-dim);">${items.length} links tested &amp; filtered out</span>
      </div>
      <p style="color: var(--text-muted); font-size: 0.9rem;">
        Every entry below was independently checked and kept out of the live grid — dead hosts, takedowns, storefronts with no game, or titles that could not be verified. The catalogue shows only links that resolved.
      </p>
      <div class="audit-grid">
        
${cards}
        
      </div>
    </section>`;
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

function renderIndex(html) {
  let out = html;
  out = replaceBlock(out, 'GAMES', games.map(card).join('\n\n'));
  out = replaceBlock(out, 'CATEGORY-PILLS', categoryPills());
  out = replaceBlock(out, 'STATUS-PILLS', statusPills());
  out = replaceBlock(out, 'AUDIT', auditSection());
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
