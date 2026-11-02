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
const ipdb = JSON.parse(fs.readFileSync('instant-play.json', 'utf8'));
const ipGames = ipdb.games;
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
for (const marker of ['INSTANT', 'HERO', 'GAMES', 'CATEGORY-PILLS', 'STATUS-PILLS', 'SOURCE-PILLS']) {
  assert(html.includes(`<!-- ${marker}:START -->`) && html.includes(`<!-- ${marker}:END -->`), `missing ${marker} markers`);
}
const readme = fs.readFileSync('README.md', 'utf8');
assert(readme.includes('<!-- INSTANT-README:START -->') && readme.includes('<!-- INSTANT-README:END -->'), 'missing INSTANT-README markers in README.md');
const report = fs.readFileSync('RESEARCH-REPORT.md', 'utf8');
assert(report.includes('<!-- REPORT:START -->') && report.includes('<!-- REPORT:END -->'), 'missing REPORT markers in RESEARCH-REPORT.md');
assert(report.includes(`## 3. Verified instant-play catalogue — all ${ipGames.length} games`), 'report catalogue heading is stale');
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

/* 7. Instant Play: position, honesty and completeness of the generated section. */
const instantStart = html.indexOf('<!-- INSTANT:START -->');
const intro = html.indexOf('<section class="container intro">');
const library = html.indexOf('id="library"');
const gamesStart = html.indexOf('<!-- GAMES:START -->');
assert(instantStart > 0 && instantStart < intro && intro < library && library < gamesStart,
  '⚡ INSTANT PLAY is not above the intro, library and all existing games');
assert(html.includes('Classic games. No downloads. Just click and play.'), 'missing the exact Instant Play tagline');
assert(html.includes('>⚡ INSTANT PLAY<'), 'missing the ⚡ INSTANT PLAY heading');
const instantBlock = html.slice(instantStart, html.indexOf('<!-- INSTANT:END -->'));
const ipCards = [...instantBlock.matchAll(/<article class="ip-card"([^>]*)>/g)].map((m) => m[1]);
assert(ipCards.length === ipGames.length, `instant grid has ${ipCards.length} cards, instant-play.json has ${ipGames.length}`);
for (const attr of ['data-id', 'data-genre', 'data-platform', 'data-tech', 'data-year', 'data-title', 'data-tags', 'data-url']) {
  const missing = ipCards.filter((c) => !c.includes(`${attr}="`)).length;
  assert(missing === 0, `${missing} instant cards are missing ${attr}`);
}
const ipLinks = [...instantBlock.matchAll(/<a class="ip-play" href="([^"]+)"/g)].map((m) => m[1]);
assert(ipLinks.length === ipGames.length, `expected ${ipGames.length} instant play links, found ${ipLinks.length}`);
assert(ipLinks.every((l) => l.startsWith('https://')), 'an instant play link is not HTTPS');
assert(new Set(ipLinks).size === ipLinks.length, 'instant play links are not unique');
const banned = /vel\.gg|ported2browser|wasm\.rip|aaddpp\.lol|cjoseph\.workers\.dev|playgta5|justplayweb\.com\/game/;
assert(!ipGames.some((g) => banned.test(g.url)), 'an unlicensed AAA asset-streaming host leaked into the playable grid');
assert((instantBlock.match(/loading="lazy"/g) || []).length >= ipGames.filter((g) => g.cover).length,
  'instant-play artwork is not lazy-loaded');
assert((instantBlock.match(/data-ip-quick=/g) || []).length >= 8, 'named collection quick filters are missing');
assert(instantBlock.includes('>⚠ Call of Duty &amp; Zombies'), 'Call of Duty category is honestly routed to research');
assert(instantBlock.includes('href="instant-play.json"'), 'structured database is linked from the site');
const researchRows = [...instantBlock.matchAll(/<span class="ip-status /g)].length;
assert(researchRows >= ipdb.research.length, `research table has ${researchRows} classifications for ${ipdb.research.length} entries`);
assert(new Set(ipGames.map((g) => g.id)).size === ipGames.length, 'duplicate instant-play ids');
for (const g of ipGames) {
  assert(g.verification === 'link-verified' && g.lastVerified === ipdb.lastVerified, `${g.id}: missing verification metadata`);
  assert(g.classification === 'INSTANT PLAY', `${g.id}: non-playable classification`);
}

if (problems.length) {
  console.error(`site check: ${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`site check: ${games.length} ports + ${ipGames.length} instant games, ${queriedIds.size} script ids, ${repos} repos — all consistent`);
