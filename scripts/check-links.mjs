#!/usr/bin/env node
/**
 * Checks every outbound port link in games.json. Needs internet access.
 * Prints a status report; exits non-zero only for definite failures (4xx/5xx).
 *
 * Usage: npm run links
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const db = JSON.parse(fs.readFileSync(path.join(ROOT, 'games.json'), 'utf8'));
const urls = [...new Set(db.games.map((g) => g.url))].sort();
const UA = 'Mozilla/5.0 (compatible; TabulousGamesLinkCheck/1.0)';
const results = [];

async function check(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
    });
    return { url, status: res.status, ok: res.ok, final: res.url };
  } catch (err) {
    return { url, status: 0, ok: false, error: err.message };
  }
}

// A little concurrency, but gentle on the source sites.
const queue = [...urls];
const workers = Array.from({ length: 5 }, async () => {
  while (queue.length) results.push(await check(queue.shift()));
});
await Promise.all(workers);

for (const r of results.sort((a, b) => a.url.localeCompare(b.url))) {
  const label = r.ok ? 'OK  ' : r.status === 0 ? 'ERR ' : 'DEAD';
  console.log(`${label} ${String(r.status).padStart(3)}  ${r.url}${r.error ? ` — ${r.error}` : ''}`);
}
const bad = results.filter((r) => !r.ok && r.status !== 0);
const errors = results.filter((r) => r.status === 0);
console.log(`\n${urls.length} distinct links · ${results.length - bad.length - errors.length} OK · ${bad.length} dead · ${errors.length} unreachable`);
if (bad.length) process.exitCode = 1;
