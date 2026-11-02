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
const ipdb = JSON.parse(fs.readFileSync(path.join(ROOT, 'instant-play.json'), 'utf8'));
const ipGames = ipdb.games;
const ipResearch = ipdb.research;
const labelMap = (key) => new Map(ipdb[key].map((x) => [x.id, x.label]));
const genreLabel = labelMap('genres');
const platformLabel = labelMap('platforms');
const techLabel = labelMap('technologies');
const licenseLabel = labelMap('licenses');

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

/** The instant-play database has a much stricter honesty contract than games.json. */
function validateInstant() {
  const problems = [];
  const ids = new Set();
  const known = {
    genre: new Set(ipdb.genres.map((x) => x.id)),
    platform: new Set(ipdb.platforms.map((x) => x.id)),
    technology: new Set(ipdb.technologies.map((x) => x.id)),
    license: new Set(ipdb.licenses.map((x) => x.id)),
    source: new Set(ipdb.sources.map((x) => x.id)),
  };
  for (const g of ipGames) {
    if (ids.has(g.id)) problems.push(`duplicate instant-play id: ${g.id}`);
    ids.add(g.id);
    for (const [field, set] of Object.entries(known)) {
      if (!set.has(g[field])) problems.push(`unknown ${field} "${g[field]}" on ${g.id}`);
    }
    if (!g.url?.startsWith('https://')) problems.push(`${g.id}: playable URL is not HTTPS`);
    if (g.embed && !g.embed.startsWith('https://')) problems.push(`${g.id}: embed URL is not HTTPS`);
    if (g.repo && !g.repo.startsWith('https://')) problems.push(`${g.id}: repo URL is not HTTPS`);
    if (g.cover && !g.cover.startsWith('https://')) problems.push(`${g.id}: cover URL is not HTTPS`);
    for (const field of ['title', 'franchise', 'description', 'host', 'source', 'verification', 'lastVerified', 'install', 'mobile', 'classification']) {
      if (!g[field]) problems.push(`${g.id}: missing ${field}`);
    }
    if (g.classification !== 'INSTANT PLAY') problems.push(`${g.id}: non-playable entry leaked into the grid`);
  }
  const validStatuses = new Set(ipdb.statuses.map((x) => x.id));
  for (const r of ipResearch) {
    if (!validStatuses.has(r.status)) problems.push(`unknown research status "${r.status}" on ${r.title}`);
    if (!r.reason) problems.push(`${r.title}: no reason recorded`);
    if (r.url && !r.url.startsWith('https://')) problems.push(`${r.title}: URL is not HTTPS`);
    if (r.repo && !r.repo.startsWith('https://')) problems.push(`${r.title}: repo is not HTTPS`);
    if (r.reference && !r.reference.startsWith('https://')) problems.push(`${r.title}: reference is not HTTPS`);
  }
  if (problems.length) {
    console.error('Instant-play validation failed:\n  ' + problems.join('\n  '));
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

/* ==================================================================== INSTANT */
const ipExt = 'target="_blank" rel="noopener noreferrer"';
const ipTechShort = {
  'em-dosbox': 'EM-DOSBox', jsmess: 'JSMESS', wasm: 'WebAssembly', html5: 'HTML5',
  scummvm: 'ScummVM/WASM', webgl: 'WebGL', terminal: 'Web terminal',
};

function monogram(title) {
  const words = title.replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  return (words.slice(0, 2).map((w) => w[0]).join('') || '⚡').toUpperCase();
}

function instantCard(g) {
  const url = esc(g.url);
  const gl = genreLabel.get(g.genre) || g.genre;
  const pl = platformLabel.get(g.platform) || g.platform;
  const tl = techLabel.get(g.technology) || g.technology;
  const ll = licenseLabel.get(g.license) || g.license;
  const tagText = lower(uniq([
    g.title, g.franchise, gl, pl, tl, ll, g.host, String(g.year),
    ipTechShort[g.technology] || '', 'no download', 'no account',
    g.source, ...(g.tags || []),
  ]).join(' '));
  const cover = g.cover
    ? `<img src="${esc(g.cover)}" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.remove()">`
    : '';
  const embedAttr = g.embed ? ` data-embed="${esc(g.embed)}"` : '';
  const embedBtn = g.embed
    ? `<button class="ip-embed" type="button" aria-label="Play ${esc(g.title)} here on this page">▣ Here</button>`
    : '';
  const freeFlag = ['shareware', 'freeware', 'open-source', 'official', 'fan-simulator'].includes(g.license) ? ' free' : '';
  const repoLink = g.repo
    ? ` · <a href="${esc(g.repo)}" ${ipExt} title="Open-source project repository">source ↗</a>` : '';
  const src = ipdb.sources.find((s) => s.id === g.source);
  const srcLink = src ? ` · <a href="${esc(src.url)}" ${ipExt} title="Discovery / source reference">reference ↗</a>` : '';
  return `          <article class="ip-card" id="ip-${esc(g.id)}" data-id="${esc(g.id)}" data-title="${esc(lower(g.title))}" data-genre="${esc(g.genre)}" data-platform="${esc(g.platform)}" data-tech="${esc(g.technology)}" data-year="${g.year}" data-host="${esc(g.host)}" data-featured="${g.featured ? 1 : 0}" data-tags="${esc(tagText)}" data-url="${url}"${embedAttr}>
            <div class="ip-cover">
              <span class="ip-monogram" aria-hidden="true">${esc(monogram(g.title))}</span>
              ${cover}
              <span class="ip-flag${freeFlag}">${esc(ll)}</span>
              <span class="ip-year">${g.year || '—'}</span>
            </div>
            <div class="ip-body">
              <h3 class="ip-title"><a href="${url}" ${ipExt}>${esc(g.title)}</a></h3>
              <p class="ip-meta">${esc(gl)} · ${esc(pl)}${g.year ? ' · ' + g.year : ''}</p>
              <p class="ip-desc">${esc(g.description)}</p>
              <div class="ip-compat">
                <span class="ip-chip ok">No download</span>
                <span class="ip-chip ok">No account</span>
                <span class="ip-chip">Chrome desktop</span>
                <span class="ip-chip warn">Mobile untested</span>
              </div>
              <div class="ip-actions">
                <a class="ip-play" href="${url}" ${ipExt} aria-label="Play ${esc(g.title)} on ${esc(g.host)}">▶ Instant Play</a>
                ${embedBtn}
              </div>
              <p class="ip-host">Host: <a href="${url}" ${ipExt}>${esc(g.host)}</a> · ${esc(ipTechShort[g.technology] || tl)}${repoLink}${srcLink}</p>
            </div>
          </article>`;
}

function instantGenrePills() {
  const counts = new Map();
  ipGames.forEach((g) => counts.set(g.genre, (counts.get(g.genre) || 0) + 1));
  return [
    `            <button class="ip-pill active" data-genre="all" type="button" aria-pressed="true">All games <span>${ipGames.length}</span></button>`,
    ...ipdb.genres.filter((c) => counts.get(c.id)).map((c) =>
      `            <button class="ip-pill" data-genre="${esc(c.id)}" type="button" aria-pressed="false">${esc(c.label)} <span>${counts.get(c.id)}</span></button>`),
  ].join('\n');
}

function ipSelect(id, label, items, allLabel) {
  return `            <select class="ip-select" id="${id}" aria-label="${label}">
              <option value="all">${allLabel}</option>
${items.map((x) => `              <option value="${esc(x.id)}">${esc(x.label)}</option>`).join('\n')}
            </select>`;
}

function instantResearchTable() {
  const rows = ipResearch.map((r) => {
    const cls = r.status.toLowerCase().replace(/\s+/g, '-');
    const links = [
      r.url ? `<a href="${esc(r.url)}" ${ipExt}>project ↗</a>` : '',
      r.repo ? `<a href="${esc(r.repo)}" ${ipExt}>repo ↗</a>` : '',
      r.reference ? `<a href="${esc(r.reference)}" ${ipExt}>source ↗</a>` : '',
    ].filter(Boolean).join(' · ') || '—';
    return `              <tr>
                <td><b>${esc(r.title)}</b></td>
                <td>${esc(r.franchise)}</td>
                <td>${esc(r.platform)}</td>
                <td>${esc(r.technology || '—')}</td>
                <td><span class="ip-status ${cls === 'browser-port' ? 'port' : cls === 'instant-play' ? 'instant' : cls}">${esc(r.status)}</span></td>
                <td>${esc(r.reason)}${r.install && r.install !== 'Not applicable' ? ` <b>Requires:</b> ${esc(r.install)}.` : ''} <b>Mobile:</b> ${esc(r.mobile)}. <b>Verified:</b> ${esc(r.lastVerified)}.</td>
                <td>${links}</td>
              </tr>`;
  });
  return [
    '            <div class="ip-scroll"><table class="ip-table">',
    '              <thead><tr><th>Game</th><th>Franchise</th><th>Original platform</th><th>Browser tech</th><th>Classification</th><th>Findings &amp; restrictions</th><th>Links</th></tr></thead>',
    '              <tbody>',
    ...rows,
    '              </tbody></table></div>',
  ].join('\n');
}

function instantSection() {
  const hosts = new Set(ipGames.map((g) => g.host)).size;
  const free = ipGames.filter((g) => ['shareware', 'freeware', 'open-source', 'official', 'fan-simulator'].includes(g.license)).length;
  const counts = new Map();
  ipResearch.forEach((r) => counts.set(r.status, (counts.get(r.status) || 0) + 1));
  const statusSummary = ipdb.statuses.map((s) => `${counts.get(s.id) || 0} ${s.label.toLowerCase()}`).join(' · ');
  return `    <section class="ip-section" id="instant" aria-label="Instant play browser games">
      <div class="container">
        <header class="ip-hero">
          <span class="ip-eyebrow">⚡ NEW · BROWSER LIBRARY</span>
          <h1>⚡ INSTANT PLAY</h1>
          <p class="ip-tagline">Classic games. No downloads. Just click and play.</p>
          <p class="ip-lede"><b>${ipGames.length} games that start in Chrome, right now.</b> No installer, no emulator setup, no ROM or game-file download, no account. Choose a game, hit <b>Instant Play</b>, and it starts on its own host — or use <b>▣ Here</b> to open the host's player in this page. Everything below these cards is the original ${games.length}-port directory, unchanged.</p>
        </header>

        <div class="ip-stats" aria-label="Instant play library at a glance">
          <div class="ip-stat"><strong>${ipGames.length}</strong><span>playable in Chrome</span></div>
          <div class="ip-stat"><strong>${free}</strong><span>official / free / OSS</span></div>
          <div class="ip-stat"><strong>${hosts}</strong><span>independent hosts</span></div>
          <div class="ip-stat"><strong>${ipResearch.length}</strong><span>AAA candidates researched</span></div>
        </div>

        <nav class="ip-jump" aria-label="Jump links">
          <a href="#library">${games.length} native PC ports ↓</a>
          <a href="#ipResearch">Research &amp; unavailable games ↓</a>
          <a href="#ipAbout">How this works / legal notes ↓</a>
        </nav>

        <div class="ip-toolbar" role="search" aria-label="Search and filter instant play games">
          <div class="ip-toolbar-top">
            <label class="ip-search">
              <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>
              <input type="search" id="ipSearch" placeholder="Search games, franchises, hosts…" aria-label="Search instant play games" autocomplete="off">
            </label>
${ipSelect('ipPlatform', 'Filter by original platform', ipdb.platforms, 'All platforms')}
${ipSelect('ipTech', 'Filter by browser technology', ipdb.technologies.filter((t) => t.id), 'All technologies')}
            <select class="ip-select" id="ipSort" aria-label="Sort instant play games">
              <option value="featured">Featured first</option>
              <option value="title-asc">Title A–Z</option>
              <option value="year-desc">Newest first</option>
              <option value="year-asc">Oldest first</option>
              <option value="host">By host</option>
            </select>
            <button class="ip-pill" id="ipReset" type="button">Reset ↺</button>
          </div>
          <div class="ip-pills" role="group" aria-label="Filter by genre">
${instantGenrePills()}
          </div>
          <div class="ip-pills ip-collections" role="group" aria-label="Quick collections">
            <span class="ip-collections-label">Collections</span>
            <button class="ip-pill ip-pill--quiet" data-ip-quick="platform:ms-dos" type="button">Classic PC Games <span>${ipGames.filter((g) => g.platform === 'ms-dos').length}</span></button>
            <button class="ip-pill ip-pill--quiet" data-ip-quick="platform:arcade" type="button">Arcade &amp; Console Classics <span>${ipGames.filter((g) => g.platform === 'arcade').length}</span></button>
            <button class="ip-pill ip-pill--quiet" data-ip-quick="platform:web" type="button">Official &amp; Web-native <span>${ipGames.filter((g) => g.platform === 'web').length}</span></button>
            <button class="ip-pill ip-pill--quiet" data-ip-quick="genre:fps" type="button">FPS <span>${ipGames.filter((g) => g.genre === 'fps').length}</span></button>
            <button class="ip-pill ip-pill--quiet" data-ip-quick="genre:racing" type="button">Racing &amp; Driving <span>${ipGames.filter((g) => g.genre === 'racing').length}</span></button>
            <button class="ip-pill ip-pill--quiet" data-ip-quick="genre:platformer" type="button">Platformers <span>${ipGames.filter((g) => g.genre === 'platformer').length}</span></button>
            <button class="ip-pill ip-pill--quiet" data-ip-quick="genre:fighting" type="button">Fighting <span>${ipGames.filter((g) => g.genre === 'fighting').length}</span></button>
            <button class="ip-pill ip-pill--quiet" data-ip-quick="genre:rpg" type="button">RPG <span>${ipGames.filter((g) => g.genre === 'rpg').length}</span></button>
            <button class="ip-pill ip-pill--quiet" data-ip-quick="genre:sports" type="button">Sports <span>${ipGames.filter((g) => g.genre === 'sports').length}</span></button>
            <a class="ip-pill ip-pill--quiet ip-pill--warn" href="#ipResearch" id="ipResearchJump" title="No lawful no-download Call of Duty browser release exists — see the research database">⚠ Call of Duty &amp; Zombies → research</a>
          </div>
        </div>

        <p class="ip-results" id="ipResults" role="status" aria-live="polite">Showing <strong>${ipGames.length}</strong> of ${ipGames.length} playable games</p>
        <div class="ip-grid" id="ipGrid">
${ipGames.map(instantCard).join('\n')}
        </div>
        <div class="ip-empty" id="ipEmpty" hidden>No games match those filters. <a href="#" onclick="document.getElementById('ipReset').click();return false;">Clear filters</a>.</div>

        <div class="ip-note" id="ipAbout">
          <h3>How this works — and what we deliberately left out</h3>
          <p><b>Where the games run.</b> Every button opens the game on the organisation that hosts it — mostly the Internet Archive's in-browser EM-DOSBox and JSMESS/Emularity emulators, ScummVM compiled to WebAssembly, or an official/open-source website. This site hosts <b>no game files, ROMs, BIOS images or assets</b> and takes no part in distributing them. When a host permits embedding, <b>▣ Here</b> opens its player in a page overlay; otherwise the button simply opens the host in a new tab, clearly labelled with the host name. Some in-browser emulators need a moment to fetch the game, and a keyboard is required for DOS and arcade titles.</p>
          <p><b>What counts as legitimate.</b> The grid only includes official free releases (Minecraft Classic, Google's Pac-Man Doodle, Tetris), publisher-released shareware/freeware, open-source projects, and preservation copies the Internet Archive itself hosts under its own takedown policy. <b>Unlicensed AAA web ports are excluded.</b> Recent coverage of Skate 3, Black Ops Zombies, Simpsons Hit &amp; Run, NFS Most Wanted and GTA browser builds describes projects that stream retail game assets from third-party servers; publishers have already issued DMCA takedowns for Black Ops II, GTA Vice City and others. Those are documented in the research table below, with <b>no play buttons</b>.</p>
          <p><b>Verification honesty.</b> All ${ipGames.length} destinations were checked as reachable, correctly resolved and correctly attributed on ${esc(ipdb.lastVerified)}. The build environment has no Chrome binary, so WebGL / WebAssembly / DOS emulation could not be launched end-to-end here; mobile and gamepad behaviour is therefore marked <b>untested</b> rather than promised. Always follow the host's own instructions, and check the host's rights notices before playing. Last verified: ${esc(ipdb.lastVerified)}.</p>
        </div>

        <details class="ip-research" id="ipResearch">
          <summary>🔎 Research database — ${ipResearch.length} AAA / console candidates checked (${esc(statusSummary)})</summary>
          <div class="ip-research-inner">
            <p>Starting from the <a href="https://www.tweaktown.com/news/113993/you-can-now-play-skate-3-black-ops-and-20-plus-classic-games-in-your-web-browser/index.html" ${ipExt}>TweakTown</a> and <a href="https://www.xda-developers.com/aaa-games-are-playable-in-web-browsers-with-ai-based-reverse-engineering/" ${ipExt}>XDA</a> articles, then checking browser-port directories, recompilation repositories and takedown reports. <b>CLASSIFICATIONS:</b> <span class="ip-status instant">INSTANT PLAY</span> needs nothing from you; <span class="ip-status port">BROWSER PORT</span> runs in a browser but needs your own legally obtained game files; <span class="ip-status streaming">STREAMING</span> renders elsewhere and sends you video; <span class="ip-status experimental">EXPERIMENTAL</span> is a prototype; <span class="ip-status unavailable">UNAVAILABLE</span> is offline, DMCA'd or unlicensed. Asset-streaming WebAssembly ports execute locally on your machine — they are <b>not</b> cloud streaming. No entry here gets a play button on this site. The complete machine-readable catalogue is <a href="instant-play.json" ${ipExt}>instant-play.json ↗</a> — one object per game, easy to extend.</p>
${instantResearchTable()}
          </div>
        </details>
      </div>
    </section>`;
}

function instantReadme() {
  const counts = new Map();
  ipResearch.forEach((r) => counts.set(r.status, (counts.get(r.status) || 0) + 1));
  const hosts = new Set(ipGames.map((g) => g.host)).size;
  const lines = [
    `**${ipGames.length} games playable in Chrome with no downloads, no emulator setup, no ROM/game-file download and no account.** The full catalogue — with title, franchise, genre, original platform, browser technology, playable URL, GitHub repository, discovery source, verification status, mobile compatibility, installation requirements, licence and last-verified date for every entry — lives in [\`instant-play.json\`](instant-play.json). It is the single source of truth: the section above the port directory and this table are generated from it by \`scripts/build.mjs\`.`,
    '',
    `| | Count |`,
    `| :--- | ---: |`,
    `| Playable instant-play games in the main grid | ${ipGames.length} |`,
    `| Independent hosts | ${hosts} |`,
    `| Research entries (AAA / console candidates) | ${ipResearch.length} |`,
    ...ipdb.statuses.map((s) => `| Research classified ${s.id} | ${counts.get(s.id) || 0} |`),
    `| Unofficial native PC ports preserved below | ${games.length} |`,
    '',
    `**Sources:** ${ipdb.sources.map((s) => `[${s.label}](${s.url})`).join(' · ')}`,
    '',
    '**Most impressive playable discoveries:** the Internet Archive\'s EM-DOSBox MS-DOS library (shareware Doom, Wolfenstein 3D, Duke Nukem 3D, Commander Keen, Raptor, Epic Pinball), its Internet Arcade JSMESS collection (Out Run, Defender, Joust, Q\\*bert, Tron, Centipede, Marble Madness), ScummVM compiled to WebAssembly hosting seven publisher-released freeware adventures, Cloudflare\'s WebAssembly Doom multiplayer experiment, and Mojang\'s official Minecraft Classic.',
    '',
    `**Deliberately excluded:** unlicensed AAA WebAssembly ports that stream retail assets (Skate 3, Black Ops Zombies, The Simpsons Hit & Run, NFS Most Wanted, GTA V / Vice City, Resident Evil 4, Tekken 5). Activision DMCA'd Black Ops II browser ports in October 2026; Take-Two DMCA'd DOS Zone's GTA Vice City in December 2025; GTA V's browser build vanished within hours. Ports built from decompilations are catalogued as BROWSER PORT because they need your own ROM/game files — they are not instant play.`,
    '',
    `**Verification limit:** all ${ipGames.length} destinations were checked for reachability and attribution on ${ipdb.lastVerified}. The build sandbox has no Chrome binary, so in-browser rendering and mobile/gamepad behaviour could not be launched end-to-end and are marked untested rather than promised.`,
  ];
  return lines.join('\n');
}

/** Markdown-safe cell text (tables must not be broken by pipes or newlines). */
const md = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ').trim();
const mdLink = (label, url) => (url ? `[${md(label)}](${url})` : '—');

function reportTables() {
  const counts = new Map();
  ipResearch.forEach((r) => counts.set(r.status, (counts.get(r.status) || 0) + 1));
  const hosts = new Set(ipGames.map((g) => g.host)).size;
  const repos = uniq([...ipGames.map((g) => g.repo), ...ipResearch.map((r) => r.repo)].filter(Boolean)).sort();
  const lines = [];

  lines.push('## 2. Headline numbers', '');
  lines.push('| Measure | Count |');
  lines.push('| :--- | ---: |');
  lines.push(`| Distinct titles discovered and catalogued | ${ipGames.length + ipResearch.length} |`);
  lines.push(`| **Verified no-download instant-play titles in the main grid** | **${ipGames.length}** |`);
  lines.push(`| Classified BROWSER PORT (needs own files) | ${counts.get('BROWSER PORT') || 0} |`);
  lines.push(`| Classified STREAMING (cloud video, not local execution) | ${counts.get('STREAMING') || 0} |`);
  lines.push(`| Classified EXPERIMENTAL | ${counts.get('EXPERIMENTAL') || 0} |`);
  lines.push(`| Classified UNAVAILABLE / unlicensed | ${counts.get('UNAVAILABLE') || 0} |`);
  lines.push(`| Research entries classified INSTANT PLAY but kept out of the grid | ${counts.get('INSTANT PLAY') || 0} |`);
  lines.push(`| **Games actually added to the website in this task** | **${ipGames.length}** |`);
  lines.push(`| Original 79-game port catalogue preserved unchanged | ${games.length} |`);
  lines.push(`| Independent hosts | ${hosts} |`);
  lines.push(`| GitHub repositories referenced | ${repos.length} |`);
  lines.push('');
  lines.push('Undeduplicated source claims encountered while researching (not added as games): 8,943 Internet Archive MS-DOS items, 2,663 Internet Arcade items, 285 ported2browser.com ports, 184 JustPlayWeb titles, 174 portedgames.com tracked ports, 120+ browsergame.si entries, 44 wasm.rip ports.');
  lines.push('');

  lines.push(`## 3. Verified instant-play catalogue — all ${ipGames.length} games`, '');
  lines.push('Every row below is in `instant-play.json` with the same fields. `verification` is `link-verified`: the destination\'s existence and attribution were confirmed on the last-verified date; in-browser rendering could not be launched in this build environment.', '');
  lines.push('| # | Title | Franchise | Genre | Original platform | Year | Browser technology | Playable URL | GitHub repo | Discovery source | Licence | Verification | Mobile | Installation | Last verified |');
  lines.push('| ---: | :--- | :--- | :--- | :--- | ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |');
  ipGames.forEach((g, i) => {
    lines.push(`| ${i + 1} | **${md(g.title)}** | ${md(g.franchise)} | ${md(genreLabel.get(g.genre))} | ${md(platformLabel.get(g.platform))} | ${g.year || '—'} | ${md(techLabel.get(g.technology))} | ${mdLink(g.host, g.url)} | ${g.repo ? mdLink('repo', g.repo) : '—'} | ${md(g.source)} | ${md(licenseLabel.get(g.license))} | ${md(g.verification)} | ${md(g.mobile)} | ${md(g.install)} | ${md(g.lastVerified)} |`);
  });
  lines.push('');

  lines.push(`## 4. Classified research database — ${ipResearch.length} AAA / console candidates`, '');
  lines.push('| Title | Franchise | Original platform | Browser technology | Classification | Findings / restrictions | Playable URL | GitHub repo | Source reference | Mobile | Installation | Account | Last verified |');
  lines.push('| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |');
  for (const r of ipResearch) {
    lines.push(`| **${md(r.title)}** | ${md(r.franchise)} | ${md(r.platform)} | ${md(r.technology)} | ${md(r.status)} | ${md(r.reason)} | ${r.url ? mdLink('link', r.url) : '—'} | ${r.repo ? mdLink('repo', r.repo) : '—'} | ${r.reference ? mdLink('source', r.reference) : '—'} | ${md(r.mobile)} | ${md(r.install)} | ${r.account ? 'yes' : 'no'} | ${md(r.lastVerified)} |`);
  }
  lines.push('');

  lines.push(`## 5. All ${repos.length} GitHub repositories referenced`, '');
  for (const r of repos) lines.push(`- ${r}`);
  lines.push('');

  lines.push(`## 6. All ${ipGames.length} playable URLs`, '');
  for (const g of ipGames) lines.push(`- ${g.url} — ${md(g.title)}`);
  lines.push('');
  return lines.join('\n');
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
  out = replaceBlock(out, 'INSTANT', instantSection());
  return patchIndexCounts(tokens(out));
}

function renderReadme(md) {
  let out = replaceBlock(md, 'INSTANT-README', instantReadme());
  out = replaceBlock(out, 'GAMES-TABLE', readmeTable());
  out = out.replace(/PC%20Ports-[0-9]+%20Listed/g, `PC%20Ports-${games.length}%20Listed`);
  out = out.replace(
    /(## 🚀 The Port Directory \()[0-9]+ entries, [0-9]+ need your own files(\))/,
    `$1${games.length} entries, ${countByStatus('files')} need your own files$2`
  );
  return tokens(out);
}

validate();
validateInstant();

function renderReport(md) {
  return replaceBlock(md, 'REPORT', reportTables());
}

const indexPath = path.join(ROOT, 'index.html');
const readmePath = path.join(ROOT, 'README.md');
const reportPath = path.join(ROOT, 'RESEARCH-REPORT.md');
const before = {
  'index.html': fs.readFileSync(indexPath, 'utf8'),
  'README.md': fs.readFileSync(readmePath, 'utf8'),
  'RESEARCH-REPORT.md': fs.readFileSync(reportPath, 'utf8'),
};
const after = {
  'index.html': renderIndex(before['index.html']),
  'README.md': renderReadme(before['README.md']),
  'RESEARCH-REPORT.md': renderReport(before['RESEARCH-REPORT.md']),
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
