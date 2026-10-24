#!/usr/bin/env node
/**
 * Tabulous Games — automated discovery of browser-playable games.
 *
 * What it does
 *   1. Crawls a configurable list of sources (data/discovery-sources.json) that
 *      track browser ports and browser-native games.
 *   2. Extracts a title, play URL and status hints for each new candidate.
 *   3. De-duplicates against games.json, the audit/excluded list and previous
 *      scan output (so "first seen" dates survive between runs).
 *   4. Re-checks every URL already in the catalogue and reports dead links,
 *      including domains that now redirect somewhere unrelated.
 *   5. Writes data/discoveries.json + data/discoveries.md for humans and for
 *      the weekly GitHub Action, which opens an issue with the findings.
 *
 * No dependencies: Node 20+ (global fetch) only.
 *
 *   node scripts/discover-games.mjs              # live scan
 *   node scripts/discover-games.mjs --fixtures   # offline parser self-test
 *   node scripts/discover-games.mjs --check-links# only verify known URLs
 *   node scripts/discover-games.mjs --fail-on-dead
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = new Set(process.argv.slice(2));
const FIXTURES = args.has('--fixtures');
const ONLY_LINKS = args.has('--check-links');
const FAIL_ON_DEAD = args.has('--fail-on-dead');

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/discovery-sources.json'), 'utf8'));
const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'games.json'), 'utf8'));
const REPORT_JSON = path.join(ROOT, FIXTURES ? 'data/discoveries.fixture.json' : 'data/discoveries.json');
const REPORT_MD = path.join(ROOT, FIXTURES ? 'data/discoveries.fixture.md' : 'data/discoveries.md');
const PREVIOUS = fs.existsSync(REPORT_JSON) ? JSON.parse(fs.readFileSync(REPORT_JSON, 'utf8')) : {};
const TODAY = new Date().toISOString().slice(0, 10);
const LIMITS = config.limits || {};
const TIMEOUT = LIMITS.timeoutMs || 20000;
const UA = config.userAgent || 'TabulousGamesDiscovery/1.0';

const stats = { sources: 0, fetched: 0, errors: 0, skippedKnown: 0, candidates: 0, dead: 0 };
const warnings = [];

// ---------------------------------------------------------------------------
// small helpers
// ---------------------------------------------------------------------------
const log = (...a) => console.log(...a);
const uniqBy = (arr, key) => {
  const seen = new Map();
  for (const item of arr) if (!seen.has(key(item))) seen.set(key(item), item);
  return [...seen.values()];
};

function normaliseUrl(raw) {
  try {
    const u = new URL(raw, 'https://example.invalid');
    if (!/^https?:$/.test(u.protocol)) return null;
    const host = u.host.toLowerCase().replace(/^www\./, '');
    const pathname = u.pathname.replace(/\/+$/, '');
    return `${host}${pathname}${u.search}`;
  } catch {
    return null;
  }
}

const KNOWN = new Set(db.games.map((g) => normaliseUrl(g.url)));
for (const e of db.excluded || []) {
  const n = normaliseUrl(e.url);
  if (n) KNOWN.add(n);
}
const PREVIOUS_BY_URL = new Map((PREVIOUS.candidates || []).map((c) => [normaliseUrl(c.url), c]));
// slug -> ISO date of the last detailed scan, so the bot can revisit pages
// instead of treating "seen once" as "checked forever".
const SLUG_SCANS = new Map(
  FIXTURES ? [] : Object.entries(PREVIOUS.portedSlugScans || {})
);
for (const slug of FIXTURES ? [] : PREVIOUS.portedSlugs || []) {
  if (!SLUG_SCANS.has(slug)) SLUG_SCANS.set(slug, PREVIOUS.generatedAt || new Date(0).toISOString());
}

function decodeEntities(text = '') {
  return text
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&times;/g, '×')
    .replace(/&hellip;/g, '…');
}

const stripTags = (html = '') =>
  decodeEntities(html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

async function fetchText(url, { fixturesFile, timeout = TIMEOUT } = {}) {
  if (FIXTURES) {
    const file = path.join(ROOT, 'fixtures', fixturesFile);
    if (!fs.existsSync(file)) throw new Error(`fixture missing: ${fixturesFile}`);
    return fs.readFileSync(file, 'utf8');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    stats.fetched++;
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': UA, accept: 'text/html,application/json;q=0.9,*/*;q=0.8' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/** Parse anchors from HTML (and markdown links, for flexibility). */
function anchors(html) {
  const out = [];
  const re = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    out.push({ href: decodeEntities(m[1]), text: stripTags(m[2]) });
  }
  const md = /\[([^\]]+)\]\((https?:[^)\s]+)\)/g;
  while ((m = md.exec(html))) out.push({ href: decodeEntities(m[2]), text: stripTags(m[1]) });
  return out;
}

function meta(html, name) {
  const patterns = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return decodeEntities(m[1]).trim();
  }
  return '';
}

function pageTitle(html) {
  // Prefer the page's own <h1>; fall back to <title> with the site suffix removed.
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    const text = stripTags(h1[1]);
    if (text) return text;
  }
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return t ? stripTags(t[1]).replace(/\s*[|·-]\s*PortedGames\s*$/i, '').trim() : '';
}

function statusHint(text) {
  if (/no game files needed|no own files|free, no game files|nothing to import|streams the game/i.test(text)) return 'instant';
  if (/needs your own copy|needs files from your own|own files needed|requires? your own|from your own copy|own installation|needs the original/i.test(text)) return 'files';
  return 'unknown';
}

/** Sequential map with a small concurrency pool. */
async function pool(items, limit, worker) {
  const results = [];
  let index = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const i = index++;
      results[i] = await worker(items[i], i);
    }
  });
  await Promise.all(runners);
  return results;
}

// ---------------------------------------------------------------------------
// source adapters
// ---------------------------------------------------------------------------
function candidateId(title, url) {
  const fromTitle = slugify(title);
  if (fromTitle.length >= 3) return fromTitle;
  try {
    const u = new URL(url);
    return slugify(`${u.host.replace(/^www\./, '').replace(/\./g, '-')}-${u.pathname}`);
  } catch {
    return slugify(url);
  }
}

function makeCandidate({ title, url, source, sourceUrl, description = '', genres = [], status = 'unknown', phones = null }) {
  const key = normaliseUrl(url);
  if (!key) return null;
  // Directory/search pages are not games.
  if (/\/search\b|\/games\?|google\.com\/search|bing\.com\/search|duckduckgo\.com/i.test(url)) return null;
  const prev = PREVIOUS_BY_URL.get(key);
  return {
    id: candidateId(title || prev?.title, url),
    title: title || prev?.title || key,
    url,
    source,
    sourceUrl,
    description: description || prev?.description || '',
    genres,
    category: guessCategory(`${title} ${description} ${genres.join(' ')}`),
    statusHint: status,
    phones,
    firstSeen: prev?.firstSeen || TODAY,
    lastSeen: TODAY,
    known: KNOWN.has(key),
  };
}

function guessCategory(text) {
  const t = text.toLowerCase();
  if (/survivor|bullet heaven|roguelite|roguelike/.test(t)) return 'survivors';
  if (/zombie|undead|co-op/.test(t)) return 'zombies';
  if (/shooter|fps|doom|quake|halo|wolfenstein|counter-strike/.test(t)) return 'shooters';
  if (/strategy|rts|tycoon|simcity|city builder|red alert|command & conquer/.test(t)) return 'strategy';
  if (/racing|race|sports|cricket|skate|football|soccer/.test(t)) return 'sports';
  if (/open world|adventure|lego island|lugaru|gta/.test(t)) return 'openworld';
  return 'classic-pc';
}

const NAV_SLUGS = new Set([
  'browser', 'new', 'how-it-works', 'recompiled-games', 'about', 'search', 'privacy', 'terms',
  'all', 'blog', 'rss', 'sitemap', 'contact', 'donate', 'faq',
]);

async function scanPortedGames(source) {
  const file = FIXTURES ? `${source.id}.html` : null;
  const html = await fetchText(source.url, { fixturesFile: file });
  const links = uniqBy(
    anchors(html)
      .map((a) => {
        let abs = a.href;
        try {
          abs = new URL(a.href, source.url).href;
        } catch {}
        const slug = (abs.match(/^https?:\/\/portedgames\.com\/([a-z0-9-]+)\/?$/i) || [])[1];
        return { ...a, href: abs, slug };
      })
      .filter((a) => a.slug && !NAV_SLUGS.has(a.slug) && a.text.length > 2),
    (a) => a.slug
  );
  log(`  ${source.id}: ${links.length} port pages listed`);

  const budget = LIMITS.portedgamesDetails || 20;
  const revisitMs = (LIMITS.revisitDays ?? 7) * 86400000;
  const now = Date.now();
  const todo = links
    .filter((a) => {
      const last = SLUG_SCANS.get(a.slug);
      return !last || now - new Date(last).getTime() > revisitMs;
    })
    .sort((a, b) => {
      const la = SLUG_SCANS.get(a.slug) || '';
      const lb = SLUG_SCANS.get(b.slug) || '';
      return la.localeCompare(lb); // never-scanned first, then oldest
    })
    .slice(0, budget);
  if (!todo.length) log(`  ${source.id}: nothing due for a re-check (revisit window ${revisitMs / 86400000}d)`);
  const found = [];

  await pool(todo, 4, async (link) => {
    SLUG_SCANS.set(link.slug, new Date().toISOString());
    try {
      const detailUrl = `https://portedgames.com/${link.slug}/`;
      const detail = await fetchText(detailUrl, { fixturesFile: `${source.id}-${link.slug}.html` });
      const candidates = anchors(detail).filter((a) => /^https?:/i.test(a.href) && !/portedgames\.com/i.test(a.href));
      const play =
        candidates.find((a) => /^▶?\s*play\b/i.test(a.text) && !/multiplayer/i.test(a.text)) ||
        candidates.find((a) => /^▶?\s*play\b/i.test(a.text)) ||
        candidates.find((a) => /open on the original site|fullscreen/i.test(a.text)) ||
        candidates.find((a) => /play/i.test(a.text));
      if (!play) {
        warnings.push(`${link.slug}: no outbound play link found`);
        return;
      }
      const title = pageTitle(detail) || link.text;
      const description = meta(detail, 'description') || link.text;
      const text = stripTags(detail);
      const status = statusHint(text);
      const cand = makeCandidate({
        title,
        url: play.href,
        source: 'portedgames',
        sourceUrl: detailUrl,
        description,
        genres: [],
        status,
        phones: /works on phones/i.test(text) ? true : null,
      });
      if (cand) found.push(cand);
    } catch (err) {
      stats.errors++;
      warnings.push(`${link.slug}: ${err.message}`);
    }
  });

  return found;
}

async function scanSpawn(source) {
  const file = FIXTURES ? `${source.id}.json` : null;
  const raw = await fetchText(source.url, { fixturesFile: file });
  const data = JSON.parse(raw);
  const games = data.games || [];
  const wanted = new Set((source.genres || []).map((g) => g.toLowerCase()));
  const found = [];
  for (const g of games) {
    const tags = (g.genre_tags || g.ai_genre_tags || []).map((t) => String(t).toLowerCase());
    if (wanted.size && !tags.some((t) => wanted.has(t))) continue;
    if ((g.play_count || 0) < (LIMITS.minSpawnPlays || 0)) continue;
    const username = g.profiles?.username;
    const adventure = g.games?.adventure_name;
    if (!username || !adventure) continue;
    const url = `https://www.spawn.co/@${username}/${adventure}`;
    const cand = makeCandidate({
      title: g.games?.name || adventure,
      url,
      source: 'spawn',
      sourceUrl: source.url,
      description: g.box_copy?.blurb || '',
      genres: tags,
      status: 'instant', // Spawn worlds always run in the browser
      phones: g.mobile_playable ?? null,
    });
    if (cand) found.push(cand);
  }
  log(`  ${source.id}: ${found.length} matching worlds of ${games.length}`);
  return found;
}

async function scanCurated(entries = []) {
  const found = [];
  for (const entry of entries) {
    if (!entry.url) continue;
    const cand = makeCandidate({
      title: entry.title,
      url: entry.url,
      source: 'curated',
      sourceUrl: 'data/discovery-sources.json',
      description: entry.note || '',
      genres: entry.genres || [],
      status: 'unknown',
    });
    if (cand) found.push(cand);
  }
  log(`  curated: ${found.length} watchlist entries`);
  return found;
}

async function scanGithub(cfg) {
  if (!cfg?.enabled) return [];
  const found = [];
  for (const query of cfg.queries || []) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=updated&per_page=15`;
    try {
      const res = await fetch(url, {
        headers: {
          'user-agent': UA,
          accept: 'application/vnd.github+json',
          ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
        },
        signal: AbortSignal.timeout(TIMEOUT),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      for (const repo of data.items || []) {
        if (!repo.homepage) continue;
        const cand = makeCandidate({
          title: repo.full_name,
          url: repo.homepage,
          source: 'github',
          sourceUrl: repo.html_url,
          description: repo.description || '',
          genres: repo.topics || [],
          status: 'unknown',
        });
        if (cand) found.push(cand);
      }
    } catch (err) {
      stats.errors++;
      warnings.push(`github "${query}": ${err.message}`);
    }
  }
  return found;
}

// ---------------------------------------------------------------------------
// verification
// ---------------------------------------------------------------------------
const FIXTURE_LINKS = FIXTURES && fs.existsSync(path.join(ROOT, 'fixtures/link-status.json'))
  ? JSON.parse(fs.readFileSync(path.join(ROOT, 'fixtures/link-status.json'), 'utf8'))
  : {};

async function verify(url) {
  if (FIXTURES) {
    const f = FIXTURE_LINKS[url] || { status: 200 };
    const finalUrl = f.finalUrl || url;
    const originalHost = new URL(url).host.replace(/^www\./, '');
    const finalHost = new URL(finalUrl).host.replace(/^www\./, '');
    let note = f.note || '';
    if (!note && finalHost !== originalHost) note = `redirects to ${finalHost}`;
    if (/casino|betting|porn|parking|sedo|dan\.com|hugedomains/i.test(finalHost)) note = `redirects to unrelated host ${finalHost}`;
    return { ok: f.status < 400 && !/unrelated host/.test(note), status: f.status, finalUrl, note };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    stats.fetched++;
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': UA, accept: 'text/html,*/*;q=0.8' },
      signal: controller.signal,
    });
    const finalUrl = res.url || url;
    await res.body?.cancel().catch(() => {});
    const originalHost = new URL(url).host.replace(/^www\./, '');
    const finalHost = new URL(finalUrl).host.replace(/^www\./, '');
    let note = '';
    if (finalHost !== originalHost) {
      if (/casino|betting|bet\d|porn|xxx|parking|sedo|dan\.com|hugedomains|afternic/i.test(finalHost + finalUrl)) {
        note = `redirects to unrelated host ${finalHost}`;
      } else {
        note = `redirects to ${finalHost}`;
      }
    }
    return { ok: res.status < 400 && !/unrelated host/.test(note), status: res.status, finalUrl, note };
  } catch (err) {
    return { ok: false, status: 0, finalUrl: url, note: err.name === 'AbortError' ? 'timeout' : err.message };
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function main() {
  log(`discover-games · mode=${FIXTURES ? 'fixtures' : ONLY_LINKS ? 'links-only' : 'live'}`);
  let candidates = [];

  if (!ONLY_LINKS) {
    const sources = config.sources || {};
    for (const source of sources.portedgames || []) {
      if (!source.enabled) continue;
      stats.sources++;
      try {
        candidates.push(...(await scanPortedGames(source)));
      } catch (err) {
        stats.errors++;
        warnings.push(`${source.id}: ${err.message}`);
      }
    }
    for (const source of sources.spawn || []) {
      if (!source.enabled) continue;
      stats.sources++;
      try {
        candidates.push(...(await scanSpawn(source)));
      } catch (err) {
        stats.errors++;
        warnings.push(`${source.id}: ${err.message}`);
      }
    }
    if ((sources.curated || []).length) {
      stats.sources++;
      candidates.push(...(await scanCurated(sources.curated)));
    }
    if (sources.github) {
      stats.sources++;
      try {
        candidates.push(...(await scanGithub(sources.github)));
      } catch (err) {
        stats.errors++;
        warnings.push(`github: ${err.message}`);
      }
    }
  }

  // Merge duplicates and drop anything already in the catalogue.
  const bySource = candidates.reduce((acc, c) => {
    acc[c.source] = (acc[c.source] || 0) + 1;
    return acc;
  }, {});
  log(`  candidates by source: ${JSON.stringify(bySource)}`);
  const merged = uniqBy(candidates, (c) => normaliseUrl(c.url));
  const fresh = [];
  for (const c of merged) {
    if (!c) continue;
    if (c.known) {
      stats.skippedKnown++;
      continue;
    }
    fresh.push(c);
  }

  // Verify fresh candidates (skip the ones the source already vouched for in fixtures).
  await pool(fresh, LIMITS.concurrency || 4, async (c) => {
    if (/portedgames\.com/i.test(c.url)) {
      c.verified = { ok: false, status: 0, finalUrl: c.url, note: 'directory page, not a play link' };
      return;
    }
    c.verified = await verify(c.url);
  });

  const usable = fresh.filter((c) => c.verified?.ok);
  for (const c of usable) c.category = c.category || guessCategory(c.title);
  // Titles can collide (same game, different host); keep ids unique.
  const usedIds = new Set();
  for (const c of usable) {
    let id = c.id || 'game';
    let n = 2;
    while (usedIds.has(id)) id = `${c.id}-${n++}`;
    c.id = id;
    usedIds.add(id);
  }
  stats.candidates = usable.length;

  // Re-check the catalogue for dead links.
  const deadLinks = [];
  const checked = [];
  await pool(db.games, LIMITS.concurrency || 4, async (g) => {
    const v = await verify(g.url);
    checked.push({ id: g.id, title: g.title, url: g.url, ...v });
    if (!v.ok) {
      // 401/403/429 usually means bot protection, not a dead game.
      if (/HTTP (401|403|429)\b/.test(v.note || '')) {
        warnings.push(`${g.title}: HTTP ${v.status} — possible bot protection, check manually (${g.url})`);
      } else {
        deadLinks.push({ id: g.id, title: g.title, url: g.url, ...v });
      }
    }
  });
  stats.dead = deadLinks.length;

  const report = {
    generatedAt: new Date().toISOString(),
    mode: FIXTURES ? 'fixtures' : ONLY_LINKS ? 'links-only' : 'live',
    stats,
    warnings,
    candidates: usable.sort((a, b) => a.title.localeCompare(b.title)),
    deadLinks: deadLinks.sort((a, b) => a.title.localeCompare(b.title)),
    catalogueChecked: checked.length,
    portedSlugs: [...SLUG_SCANS.keys()].sort(),
    portedSlugScans: Object.fromEntries([...SLUG_SCANS.entries()].sort()),
  };

  fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(REPORT_MD, renderMarkdown(report));

  log(
    `done: ${usable.length} new candidate(s), ${deadLinks.length} dead link(s), ${checked.length} catalogue links checked, ${stats.errors} error(s)`
  );
  if (warnings.length) log(`warnings:\n  - ${warnings.join('\n  - ')}`);

  if (FAIL_ON_DEAD && deadLinks.length) process.exit(2);
}

function renderMarkdown(report) {
  const rows = (items) =>
    items
      .map((c) => `| ${c.title.replace(/\|/g, '\\|')} | ${(c.genres || []).join(', ') || c.category || '—'} | ${c.statusHint} | [play](${c.url}) |`)
      .join('\n');

  return `# Browser game discovery report

Generated: **${report.generatedAt}** · mode: \`${report.mode}\`

| Metric | Value |
| :--- | :--- |
| Sources scanned | ${report.stats.sources} |
| Pages fetched | ${report.stats.fetched} |
| New candidates | ${report.stats.candidates} |
| Already in catalogue (skipped) | ${report.stats.skippedKnown} |
| Catalogue links checked | ${report.catalogueChecked} |
| Dead or broken links | ${report.stats.dead} |
| Errors | ${report.stats.errors} |

## New candidates

${report.candidates.length ? `| Title | Genres | Status hint | Link |\n| :--- | :--- | :--- | :--- |\n${rows(report.candidates)}` : '_No new playable candidates this run._'}

## Dead or suspicious links in the catalogue

${report.deadLinks.length ? report.deadLinks.map((d) => `- **${d.title}** — [${d.url}](${d.url}) — ${d.note || `HTTP ${d.status}`}`).join('\n') : '_All catalogue links responded._'}

${report.warnings.length ? `## Warnings\n\n${report.warnings.map((w) => `- ${w}`).join('\n')}` : ''}

---

To publish a candidate, run \`node scripts/finalise-games.mjs --id <candidate-id>\` to draft the entry, fill in the description, controls and "good to know" copy, then \`node scripts/make-covers.mjs && node scripts/build.mjs\`.
`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
