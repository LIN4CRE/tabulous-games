#!/usr/bin/env node
/**
 * Optional DOM/integration test for the ⚡ Instant Play section.
 * jsdom is NOT a project dependency (the site ships zero runtime JS deps).
 * Run:  npm i --no-save jsdom && npm run test:dom
 * If jsdom is absent the test is skipped with a note rather than failing.
 */
import fs from 'node:fs';

let JSDOM;
try {
  ({ JSDOM } = await import('jsdom'));
} catch {
  console.log('SKIP: jsdom is not installed. Run `npm i --no-save jsdom` then `npm run test:dom`.');
  process.exit(0);
}

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, {
  url: 'https://lin4cre.github.io/tabulous-games/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  beforeParse(w) {
    if (!w.CSS) w.CSS = {};
    if (!w.CSS.escape) w.CSS.escape = (s) => String(s).replace(/[^a-zA-Z0-9_-]/g, (c) => '\\' + c);
    w.Element.prototype.scrollIntoView = function () {};
    w.HTMLElement.prototype.focus = w.HTMLElement.prototype.focus || function () {};
  },
});
const { window: w } = dom;
const doc = w.document;
const $ = (s) => doc.querySelector(s);
const $$ = (s) => Array.from(doc.querySelectorAll(s));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; } else { fail++; console.error('FAIL: ' + m); } };
const visible = (sel) => $$(sel).filter((e) => !e.hidden).length;

/* 1. Structure and position */
ok(!!$('#instant'), '#instant section exists');
ok($('#instant').compareDocumentPosition($('.intro')) & w.Node.DOCUMENT_POSITION_FOLLOWING, 'instant section is above intro');
ok($('#instant').compareDocumentPosition($('#library')) & w.Node.DOCUMENT_POSITION_FOLLOWING, 'instant section is above library');
ok(html.indexOf('<!-- INSTANT:START -->') < html.indexOf('<!-- GAMES:START -->'), 'INSTANT block precedes all existing games');
ok($('#instant h1').textContent.includes('⚡ INSTANT PLAY'), 'heading is ⚡ INSTANT PLAY');
ok($('.ip-tagline').textContent.trim() === 'Classic games. No downloads. Just click and play.', 'tagline is exact');
ok($$('.ip-card').length === 176, `176 instant cards (got ${$$('.ip-card').length})`);
ok($$('.game-card').length === 79, '79 original port cards preserved');
ok($$('.ip-play').length === 176, 'one Instant Play button per card');
ok($$('.ip-play').every((a) => a.href.startsWith('https://')), 'all play links are HTTPS');
ok($$('.ip-play').every((a) => a.target === '_blank' && a.rel.includes('noopener')), 'external launches are safely opened');
const ipdb = JSON.parse(fs.readFileSync('instant-play.json', 'utf8'));
ok($$('.ip-cover img').length === ipdb.games.filter((g) => g.cover).length && $$('.ip-cover img').every((i) => i.getAttribute('loading') === 'lazy'), 'all artwork is lazy-loaded');
ok($$('.ip-embed').length === $$('.ip-card[data-embed]').length, 'in-page button only where embedding is permitted');
ok($$('.ip-status').length >= 33, 'research classifications rendered');
ok($$('.ip-pill[data-genre]').length >= 13, 'genre filters rendered');

/* 2. Instant Play search */
$('#ipSearch').value = 'doom';
$('#ipSearch').dispatchEvent(new w.Event('input', { bubbles: true }));
const doomVisible = visible('.ip-card');
ok(doomVisible > 3 && doomVisible < 40, `search "doom" narrows the grid (got ${doomVisible})`);
ok($('#ipResults').textContent.includes(String(doomVisible)), 'results count matches visible cards');
ok(w.location.search.includes('ipq=doom'), 'instant search reflected in URL');
ok(visible('.game-card') === 79, 'instant search does not affect the original port grid');

/* 3. Genre / platform / technology filters */
$('#ipReset').click();
ok(visible('.ip-card') === 176, 'reset restores all instant games');
$$('.ip-pill[data-genre="fps"]')[0].click();
const fps = visible('.ip-card');
ok(fps > 5 && fps < 30, `FPS genre filter works (got ${fps})`);
ok($$('.ip-card:not([hidden])').every((c) => c.dataset.genre === 'fps'), 'only FPS cards visible');
ok(w.location.search.includes('ipgenre=fps'), 'genre filter reflected in URL');
$('#ipReset').click();
$('#ipPlatform').value = 'arcade';
$('#ipPlatform').dispatchEvent(new w.Event('change', { bubbles: true }));
const arcade = visible('.ip-card');
ok(arcade === 25, `arcade platform filter (got ${arcade})`);
ok($$('.ip-card:not([hidden])').every((c) => c.dataset.platform === 'arcade'), 'only arcade cards visible');
$('#ipReset').click();
$('#ipTech').value = 'scummvm';
$('#ipTech').dispatchEvent(new w.Event('change', { bubbles: true }));
ok(visible('.ip-card') === 7, 'ScummVM technology filter finds the 7 freeware adventures');
$('#ipReset').click();

/* 4. Sorting */
$('#ipSort').value = 'title-asc';
$('#ipSort').dispatchEvent(new w.Event('change', { bubbles: true }));
const first = $$('.ip-card')[0];
ok(first.dataset.title <= $$('.ip-card')[1].dataset.title, 'title A–Z sorting works');
ok(w.location.search.includes('ipsort=title-asc'), 'sort reflected in URL');
$('#ipReset').click();

/* 5. Both filter systems share the URL without clobbering each other */
$('#searchInput').value = 'mario';
$('#searchInput').dispatchEvent(new w.Event('input', { bubbles: true }));
$('#ipSearch').value = 'pinball';
$('#ipSearch').dispatchEvent(new w.Event('input', { bubbles: true }));
const q = new w.URLSearchParams(w.location.search);
ok(q.get('q') === 'mario' && q.get('ipq') === 'pinball', 'port and instant query params coexist');
ok(visible('.game-card') < 79 && visible('.game-card') > 0, 'original port search still works');
ok(visible('.ip-card') < 176 && visible('.ip-card') > 0, 'instant search still works with port filter active');
$('#resetFilters').click();
ok(w.location.search.includes('ipq=pinball'), 'port reset preserves instant state');
$('#ipReset').click();
ok(w.location.search === '', 'both resets clear the URL');
ok(visible('.game-card') === 79 && visible('.ip-card') === 176, 'both grids fully restored');

/* 6. In-page player modal */
const embedded = $('.ip-card[data-embed]');
embedded.querySelector('.ip-embed').click();
const modal = $('#ipPlayer');
ok(modal.classList.contains('is-open'), 'modal opens on ▣ Here');
ok(modal.getAttribute('aria-hidden') === 'false', 'modal aria-hidden is false when open');
ok($('#ipPlayerFrame').src === embedded.dataset.embed, 'iframe points at the host player');
ok($('#ipPlayerExternal').href === embedded.dataset.url, 'external fallback points at the host');
ok($('#ipPlayerTitle').textContent.includes(embedded.dataset.title), 'modal shows the game name');
ok(doc.activeElement === $('#ipPlayerClose'), 'focus moves to the close button');
ok(doc.body.style.overflow === 'hidden', 'background scrolling is locked');
w.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
ok(!modal.classList.contains('is-open'), 'Escape closes the modal');
ok($('#ipPlayerFrame').getAttribute('src') === 'about:blank', 'iframe is cleared so the game stops');
ok(doc.body.style.overflow === '', 'background scrolling is restored');
embedded.querySelector('.ip-embed').click();
$('#ipPlayerClose').click();
ok(!modal.classList.contains('is-open'), 'close button closes the modal');

/* 7. Accessibility basics */
ok($$('.ip-pill[data-genre]').every((b) => b.hasAttribute('aria-pressed')), 'genre pills expose pressed state');
ok($('#ipSearch').hasAttribute('aria-label') && $('#ipPlatform').hasAttribute('aria-label'), 'controls are labelled');
ok($('#ipPlayer').getAttribute('role') === 'dialog' && $('#ipPlayer').getAttribute('aria-modal') === 'true', 'modal is an accessible dialog');
ok($$('.ip-card').every((c) => c.querySelector('.ip-play').hasAttribute('aria-label')), 'play buttons have accessible names');
ok($$('.ip-card').every((c) => c.id.startsWith('ip-')), 'every instant card is deep-linkable');

/* 7b. Named collections and research jump */
const quick = (label) => $$('[data-ip-quick]').find((b) => b.textContent.includes(label));
quick('Classic PC Games').click();
ok(visible('.ip-card') === 137 && $$('.ip-card:not([hidden])').every((c) => c.dataset.platform === 'ms-dos'), 'Classic PC Games collection filters to MS-DOS titles');
ok(w.location.search.includes('ipplatform=ms-dos'), 'collection filter reflected in URL');
quick('Racing & Driving').click();
ok($$('.ip-card:not([hidden])').every((c) => c.dataset.genre === 'racing'), 'Racing & Driving collection filters by genre');
ok(w.location.search.includes('ipgenre=racing') && !w.location.search.includes('ipplatform='), 'collection filter resets the previous platform filter');
$('#ipReset').click();
$('#ipResearchJump').click();
ok($('#ipResearch').open === true, 'Call of Duty research jump opens the details panel');
ok($$('.ip-pill[data-genre]').length >= 13, 'genre pills still present alongside collections');

/* 8. Honesty guardrails */
const allHrefs = $$('a').map((a) => a.getAttribute('href') || '').join(' ');
ok(!allHrefs.includes('vel.gg'), 'no link to the unlicensed Zombies host');
ok(!allHrefs.includes('playgta5'), 'no link to the GTA V leak host');
ok(!allHrefs.includes('ported2browser') && !allHrefs.includes('wasm.rip'), 'no link to unlicensed AAA port hosts');
ok(html.includes('no game files, ROMs, BIOS images or assets'), 'legal notice present');
ok(html.includes('Mobile untested'), 'mobile compatibility is not overclaimed');
ok(html.includes('could not be launched end-to-end'), 'verification limits disclosed');

console.log(`\nDOM tests: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
