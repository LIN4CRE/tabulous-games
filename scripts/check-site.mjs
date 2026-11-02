#!/usr/bin/env node
/**
 * Dependency-free structural checks for the generated site.
 *
 * `build.mjs --check` proves that index.html matches games.json; this file
 * proves that the hand-written *shell* around the generated blocks is still
 * wired up correctly. In particular it catches elements referenced by the
 * inline script that are declared after the script (they do not exist when it
 * runs), and card attributes the filter UI depends on.
 */
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('index.html', 'utf8');
const db = JSON.parse(fs.readFileSync('games.json', 'utf8'));
const games = db.games;
const problems = [];
const fail = (message) => problems.push(message);
const assert = (condition, message) => { if (!condition) fail(message); };

const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
assert(scripts.length === 1, `expected exactly one inline script, found ${scripts.length}`);

/* 1. The inline script must at least parse. */
for (const [i, source] of scripts.entries()) {
  try {
    new vm.Script(source, { filename: `index.html inline script #${i + 1}` });
  } catch (error) {
    fail(`inline script #${i + 1} does not parse: ${error.message}`);
  }
}

/* 2. Every #id the script queries must exist, and must be declared BEFORE the
 *    script tag (the script runs as it is parsed, so later elements are null).
 *    #clearInline is injected into #resultsCount by the script itself. */
const scriptSource = scripts.join('\n');
const declaredIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
const queriedIds = new Set([...scriptSource.matchAll(/\$\('#([A-Za-z0-9_-]+)'\)/g)].map((m) => m[1]));
const injectedIds = new Set(['clearInline']);
const scriptStart = html.indexOf('<script>');
assert(scriptStart > 0, 'could not locate the inline <script> tag');
for (const id of queriedIds) {
  assert(declaredIds.has(id), `script queries #${id}, but no element has that id`);
  if (!injectedIds.has(id) && declaredIds.has(id)) {
    const at = html.indexOf(`id="${id}"`);
    assert(at > -1 && at < scriptStart, `#${id} is declared after <script> — it will be null when the script runs`);
  }
}
assert(html.indexOf('id="backToTop"') < scriptStart, '#backToTop must be parsed before the inline script');
assert(html.indexOf('id="toast"') < scriptStart, '#toast must be parsed before the inline script');

/* 3. Generated blocks and the filter hooks the script needs. */
for (const marker of ['HERO', 'GAMES', 'CATEGORY-PILLS', 'STATUS-PILLS', 'SOURCE-PILLS']) {
  assert(html.includes(`<!-- ${marker}:START -->`) && html.includes(`<!-- ${marker}:END -->`), `missing ${marker} markers`);
}
assert(html.includes('data-filter="status"'), 'missing status filter group');
assert(html.includes('data-filter="source"'), 'missing source filter group');
assert(html.includes('id="clearInline"'), 'missing inline "clear filters" link');

const hero = html.match(/<!-- HERO:START -->([\s\S]*?)<!-- HERO:END -->/)?.[1] || '';
const featured = games.find((g) => g.id === db.featured);
assert(!!featured, 'games.json has no valid featured port');
if (featured) {
  assert(hero.includes(`<h2>${featured.title}</h2>`), 'hero does not feature the featured port');
  assert(hero.includes(featured.cover), 'hero does not use the featured port cover');
  assert(hero.includes(featured.url), 'hero does not link to the featured port');
}
assert((hero.match(/class="hero-stats"/g) || []).length === 1, 'hero stats strip missing');

/* 4. Every card exposes the attributes the filters, sort and deep links use. */
const cards = [...html.matchAll(/<article class="game-card"([^>]*)>/g)].map((m) => m[1]);
assert(cards.length === games.length, `index.html has ${cards.length} cards, games.json has ${games.length}`);
for (const attr of ['data-id', 'data-category', 'data-status', 'data-source', 'data-title', 'data-year', 'data-tags']) {
  const missing = cards.filter((card) => !card.includes(`${attr}="`)).length;
  assert(missing === 0, `${missing} cards are missing ${attr}`);
}
const repos = games.filter((g) => /github\.com|gitlab\.com/.test(g.url)).length;
assert(cards.filter((c) => c.includes('data-source="repo"')).length === repos, 'repo card count does not match games.json');
assert(cards.filter((c) => c.includes('data-source="article"')).length === games.length - repos, 'article card count does not match games.json');

/* 5. Source filter pill counts come from the catalogue. */
const pills = html.match(/<!-- SOURCE-PILLS:START -->([\s\S]*?)<!-- SOURCE-PILLS:END -->/)?.[1] || '';
assert((pills.match(/data-source="/g) || []).length === 3, 'expected three source filter pills');
assert(pills.includes(`data-source="all">All links <span>${games.length}</span>`), 'source pill "all" count is stale');
assert(pills.includes(`data-source="repo"`), 'missing repo source pill');

/* 6. Card links and covers stay honest. */
for (const g of games) {
  assert(g.url.startsWith('https://'), `${g.id}: outbound link is not HTTPS`);
  assert(g.cover.endsWith('.jpg'), `${g.id}: cover is not a JPEG`);
}
const externalLinks = [...html.matchAll(/<a class="btn-play" href="([^"]+)"/g)].map((m) => m[1]);
assert(externalLinks.length === games.length, `expected ${games.length} port links, found ${externalLinks.length}`);
assert(externalLinks.every((link) => link.startsWith('https://')), 'a port link is not HTTPS');

if (problems.length) {
  console.error(`site check: ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`site check: ${games.length} cards, ${queriedIds.size} script ids, ${repos} repos — all consistent`);
