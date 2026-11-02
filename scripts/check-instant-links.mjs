#!/usr/bin/env node
/**
 * Optional live link checker for the Instant Play catalogue.
 *
 * `npm run check` is deliberately offline: this sandbox has no outbound access
 * to archive.org / game hosts. Run `npm run links:instant` from a machine with
 * normal internet access to re-verify every playable URL, embed URL, artwork
 * URL, repository and research reference in one pass.
 *
 * It changes no files. It prints a summary and exits non-zero on failures.
 */
import fs from 'node:fs';

const db = JSON.parse(fs.readFileSync('instant-play.json', 'utf8'));
const targets = new Map(); // url -> Set of descriptions

function add(url, why) {
  if (!url || !url.startsWith('https://')) return;
  if (!targets.has(url)) targets.set(url, new Set());
  targets.get(url).add(why);
}
for (const g of db.games) {
  add(g.url, `play: ${g.title}`);
  add(g.embed, `embed: ${g.title}`);
  add(g.cover, `art: ${g.title}`);
  add(g.repo, `repo: ${g.title}`);
}
for (const s of db.sources) add(s.url, `source: ${s.id}`);
for (const r of db.research) {
  add(r.url, `research: ${r.title}`);
  add(r.repo, `research repo: ${r.title}`);
  add(r.reference, `reference: ${r.title}`);
}

const urls = [...targets.keys()];
const limit = 8;
let index = 0;
const results = [];

async function probe(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
      headers: { 'user-agent': 'TabulousGames-link-check/1.0' },
    });
    // Some hosts reject HEAD or bot UAs but are fine in a real browser; only
    // hard 4xx/5xx are treated as broken.
    return { url, status: res.status, ok: res.status < 400 };
  } catch (error) {
    return { url, status: 0, ok: false, error: error.message };
  }
}

async function worker() {
  while (index < urls.length) {
    const i = index++;
    results.push(await probe(urls[i]));
  }
}
await Promise.all(Array.from({ length: Math.min(limit, urls.length) }, worker));

const failures = results.filter((r) => !r.ok).sort((a, b) => a.url.localeCompare(b.url));
console.log(`checked ${results.length} distinct HTTPS destinations from ${db.games.length} games + ${db.research.length} research entries`);
for (const f of failures) {
  console.error(`  ${f.status || 'ERR'} ${f.url}${f.error ? ' — ' + f.error : ''} (${[...targets.get(f.url)].join(', ')})`);
}
if (failures.length) {
  console.error(`${failures.length} destination(s) need attention`);
  process.exit(1);
}
console.log('all destinations reachable');
