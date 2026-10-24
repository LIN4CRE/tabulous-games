#!/usr/bin/env node
/**
 * Writes data/status.json — the heartbeat the site reads to tell visitors
 * when the catalogue was last scanned.
 *
 * Called at the end of every scan (and after auto-publishing), so the file
 * always reflects the most recent automated run.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const STATUS = path.join(ROOT, 'data/status.json');
const DB = JSON.parse(fs.readFileSync(path.join(ROOT, 'games.json'), 'utf8'));
const REPORT_PATH = path.join(ROOT, 'data/discoveries.json');
const report = fs.existsSync(REPORT_PATH) ? JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8')) : {};

const argValue = (name) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const lastScan = argValue('--last-scan') || new Date().toISOString();
const forcedMode = argValue('--mode');
const daily = 24 * 60 * 60 * 1000;
const nextScan = new Date(new Date(lastScan).getTime() + daily).toISOString();

const autoAdded = DB.games
  .filter((g) => g.autoAdded)
  .map((g) => ({ id: g.id, title: g.title, added: g.added || null }));

const status = {
  lastScan,
  nextScan,
  schedule: 'daily',
  scheduleCron: '17 6 * * *',
  workflow: '.github/workflows/discover-games.yml',
  mode: forcedMode || report.mode || 'unknown',
  runUrl: process.env.GITHUB_RUN_URL || null,
  stats: {
    candidates: (report.candidates || []).length,
    linksChecked: report.catalogueChecked ?? 0,
    deadLinks: (report.deadLinks || []).length,
    corrections: (report.corrections || []).length,
    games: DB.games.length,
    excluded: (DB.excluded || []).length,
  },
  autoAddedTotal: autoAdded.length,
  autoAdded: autoAdded.slice(-10),
  lastUpdated: DB.lastUpdated || null,
};

fs.writeFileSync(STATUS, JSON.stringify(status, null, 2) + '\n');
console.log(
  `status: scanned ${lastScan} · ${status.stats.games} games · ${status.stats.candidates} candidate(s) · ${status.stats.linksChecked} links checked · ${status.stats.deadLinks} dead`
);
