# Tabulous Games — The Unofficial PC Port Directory

<img src="assets/brand/emblem.svg" alt="Tabulous Games emblem" width="72" align="right">

[![Live Site](https://img.shields.io/badge/Live%20Site-lin4cre.github.io-8fd6ff?style=for-the-badge&logo=githubpages)](https://lin4cre.github.io/tabulous-games/)
[![PC Ports](https://img.shields.io/badge/PC%20Ports-79%20Listed-00f0ff?style=for-the-badge&logo=gamepad)](index.html)
[![Source list](https://img.shields.io/badge/List-DSOGaming-a855f7?style=for-the-badge)](https://www.dsogaming.com/news/super-mario-odyssey-unofficial-pc-port-available-for-download/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

> **A fixed, hand-curated directory of unofficial native PC ports.** Every entry is a game from [DSOGaming's *Super Mario Odyssey Unofficial PC Port Available for Download* round-up](https://www.dsogaming.com/news/super-mario-odyssey-unofficial-pc-port-available-for-download/) (2 November 2026) — and nothing else.

<p align="center">
  <img src="assets/brand/banner.svg" alt="Tabulous Games — unofficial PC port directory" width="100%">
</p>

This repo was rebuilt from scratch around that one list. The old 303-game browser catalogue, its daily discovery bot, its survivors-like expansion write-ups and the transparency audit are gone. What remains of the original directory is **79 unofficial PC ports**, each with the game's original box or key art and a checked link to its download or project page. Above it now sits a separate **⚡ INSTANT PLAY** library of rights-cleared browser games (see the next section).

These are *native* PC ports built by community decompilation / recompilation projects. They are not browser games: they run as desktop builds, and **you need your own legally dumped copy of the original game**. This repo hosts no game files, no installers and no ROMs.

---

## ⚡ Instant Play — classic games in Chrome, no downloads

> **Classic games. No downloads. Just click and play.**

The **⚡ INSTANT PLAY** section sits at the very top of the live site, above the 79-port directory. It is a separate, rights-cleared collection of browser games that start on their own host with no installer, no emulator setup, no ROM or game-file download and no account. The two collections are independent: the port directory below is untouched.

<!-- INSTANT-README:START -->
**176 games playable in Chrome with no downloads, no emulator setup, no ROM/game-file download and no account.** The full catalogue — with title, franchise, genre, original platform, browser technology, playable URL, GitHub repository, discovery source, verification status, mobile compatibility, installation requirements, licence and last-verified date for every entry — lives in [`instant-play.json`](instant-play.json). It is the single source of truth: the section above the port directory and this table are generated from it by `scripts/build.mjs`.

| | Count |
| :--- | ---: |
| Playable instant-play games in the main grid | 176 |
| Independent hosts | 16 |
| Research entries (AAA / console candidates) | 33 |
| Research classified INSTANT PLAY | 4 |
| Research classified BROWSER PORT | 14 |
| Research classified STREAMING | 3 |
| Research classified EXPERIMENTAL | 3 |
| Research classified UNAVAILABLE | 9 |
| Unofficial native PC ports preserved below | 79 |

**Sources:** [Internet Archive — Software Library: MS-DOS Games (8,943 items)](https://archive.org/details/softwarelibrary_msdos_games) · [Internet Archive — shareware / freeware DOS titles](https://archive.org/advancedsearch.php?q=collection%3Asoftwarelibrary_msdos_games%20AND%20subject%3Ashareware&output=json) · [Internet Archive — Internet Arcade (JSMESS / Emularity)](https://archive.org/details/internetarcade) · [ScummWEB — freeware ScummVM adventures in the browser](https://scummweb.tsilva.eu/) · [Official rights-holder browser releases](https://classic.minecraft.net/) · [Open-source browser / WebAssembly game projects](https://github.com/) · [Cloudflare / Silent Space Marine WebAssembly Doom experiment](https://silentspacemarine.com/)

**Most impressive playable discoveries:** the Internet Archive's EM-DOSBox MS-DOS library (shareware Doom, Wolfenstein 3D, Duke Nukem 3D, Commander Keen, Raptor, Epic Pinball), its Internet Arcade JSMESS collection (Out Run, Defender, Joust, Q\*bert, Tron, Centipede, Marble Madness), ScummVM compiled to WebAssembly hosting seven publisher-released freeware adventures, Cloudflare's WebAssembly Doom multiplayer experiment, and Mojang's official Minecraft Classic.

**Deliberately excluded:** unlicensed AAA WebAssembly ports that stream retail assets (Skate 3, Black Ops Zombies, The Simpsons Hit & Run, NFS Most Wanted, GTA V / Vice City, Resident Evil 4, Tekken 5). Activision DMCA'd Black Ops II browser ports in October 2026; Take-Two DMCA'd DOS Zone's GTA Vice City in December 2025; GTA V's browser build vanished within hours. Ports built from decompilations are catalogued as BROWSER PORT because they need your own ROM/game files — they are not instant play.

**Verification limit:** all 176 destinations were checked for reachability and attribution on 2026-11-02. The build sandbox has no Chrome binary, so in-browser rendering and mobile/gamepad behaviour could not be launched end-to-end and are marked untested rather than promised.
<!-- INSTANT-README:END -->

### On the site — ⚡ Instant Play

* **At the very top**, before the intro, hero and all 79 existing port cards. Exact heading **⚡ INSTANT PLAY** and tagline **"Classic games. No downloads. Just click and play."**
* **One click to play** — `▶ Instant Play` opens the host in a new tab; `▣ Here` opens that host's own embeddable player in a page overlay with an always-visible *Open on host ↗* fallback for hosts that block framing. No fake loading screens, no downloads, no accounts.
* **Find anything** — full-text search, 13 genre pills, original-platform filter, browser-technology filter, five sort modes, and named collections (Classic PC Games, Arcade & Console Classics, Official & Web-native, FPS, Racing & Driving, Platformers, Fighting, RPG, Sports). All state lives in the URL (`ipq`, `ipgenre`, `ipplatform`, `iptech`, `ipsort`) and coexists with the original port directory's query parameters.
* **Clear compatibility** — every card states its licence class, Chrome-desktop support, "no download / no account", technology, host, year and *mobile untested*. Nothing is claimed as play-tested.
* **Honest research database** — a collapsible table of 33 AAA/console candidates with `INSTANT PLAY`, `BROWSER PORT`, `STREAMING`, `EXPERIMENTAL` and `UNAVAILABLE` classifications, findings, GitHub repos and source articles. **None of them gets a play button.** The full report is [`RESEARCH-REPORT.md`](RESEARCH-REPORT.md).
* **Performance & accessibility** — lazy-loaded artwork, CSS-only fallback tiles, no new JS dependencies, one inline script, keyboard-operable controls, `aria-pressed` filters, an accessible focus-trapped dialog with Escape-to-close (which clears the iframe so the game stops), and responsive 1/2/4-column layouts.

To add a game, add one object to `instant-play.json` and run `npm run build`. To re-verify every destination from a machine with normal internet access, run `npm run links:instant`.

---

## 💿 Why you still need a copy of the game

There is **no legitimate way around it**, and this repo cannot provide one. A decompilation or static recompilation rebuilds the game's *code* — the executable logic — but deliberately ships **none** of its copyrighted content: no art, audio, levels, textures, movies or data. Without those files the port has nothing to load and cannot start.

* **What you must do:** own the original game and dump the files from your own disc, cartridge or console, following the linked project's instructions.
* **What you must not do:** download somebody else's copy. That is piracy, and this directory will never host, mirror or link to game data.
* **What you *can* skip:** the repeated setup. Most launchers ask for your dump once, build the PC version on your machine, and never need the disc again. It's a one-time step, not a way around ownership.
* **Check versions first:** some ports accept only one exact revision (Super Mario Odyssey needs v1.0.0 with no updates).

Every card is labelled **Own files** for exactly this reason.

---

## 🖼️ Original artwork

The 79 covers in `assets/covers/` are the games' real box art, key art and arcade flyers — not generated placeholders. They were recovered from the repo's earlier catalogue where a correct image existed and sourced from public cover-art archives (MobyGames, Spong, Wikimedia/Wikipedia, publisher key art) for the rest. Each is stored as a 960×540 JPEG with a blurred backdrop so portrait box art is shown in full.

Artwork is used **for identification only**; all trademarks, characters and cover art belong to their respective publishers and rights holders. See `assets/covers/ARTWORK.md`.

---

## 🕹️ Sister project

<p align="center">
  <a href="https://github.com/LIN4CRE/retro-arcade-vault">
    <img src="assets/retro-arcade-sticker.svg" alt="Retro Arcade Vault Sticker" width="550">
  </a>
</p>

* **Retro Arcade Vault** — vintage console classics in the browser.
* **Tabulous Games** — this directory of unofficial native PC ports.

---

## 📋 What's on the list

The round-up names 79 games. Two shorthand mentions are expanded so that each game gets its own card:

* *"the three classic SNES Donkey Kong Country games"* → **Donkey Kong Country**, **Donkey Kong Country 2**, **Donkey Kong Country 3**.
* *"all the Gears of War games from the Xbox 360 era"* → **Gears of War**, **Gears of War 2**, **Gears of War 3**, **Gears of War: Judgment**.

Games mentioned twice in the article (for example **Bloodborne**) appear once. A few articles cover more than one port, so some cards intentionally share a source link.

The collection spans five groups: Nintendo consoles, PlayStation consoles, Xbox consoles, arcade/Sega boards, and multi-platform releases. Use the filter pills at the top of the site to jump between them.

### On the site

* **Featured spotlight** — a hero panel generated from the `featured` entry in `games.json`, showing original cover art and an at-a-glance stats strip (ports, groups, verified links, direct repos).
* **Sticky filter bar** — search, category, requirements and link-type filters, plus sorting, stay visible while you scroll through all 79 cards.
* **Link-type filter** — switch between every link, the four direct GitHub / GitLab project repos, or the 75 DSOGaming announcements (`src=repo` / `src=article`).
* **Honest actions** — each card's button is labelled *Project repo ↗* or *Port article ↗* and opens the source in a new tab. Nothing here pretends to launch a game.
* **Shareable views** — `q`, `cat`, `status`, `src` and `sort` live in the URL; `#port-id` deep links open a card's details, and the Share button copies that link.
* **Shortcuts and motion** — `/` focuses search, `Escape` clears it, `r` picks a random port, and a back-to-top button appears after scrolling. Hover/reveal motion collapses under `prefers-reduced-motion`.

Card descriptions are written per title (with platform-specific control notes) instead of repeating one boilerplate sentence 79 times.

---

## 🚀 The Port Directory (79 entries, 79 need your own files)

Every card links to the port's project page or announcement. The **Good to Know** box repeats the one rule that applies to all of them: bring your own game files.

<!-- GAMES-TABLE:START -->
| Game | Port type | Original platform (year) | Requirements |
| :--- | :--- | :--- | :--- |
| **Super Mario Odyssey** | Native PC port / static recompilation | Nintendo Consoles · Switch (2017) | 📁 Own game files |
| **Mario Kart Wii** | Native PC port / static recompilation | Nintendo Consoles · Wii (2008) | 📁 Own game files |
| **Super Mario 64** | Native PC port / static recompilation | Nintendo Consoles · N64 (1996) | 📁 Own game files |
| **Mario Kart 64** | Native PC port / static recompilation | Nintendo Consoles · N64 (1996) | 📁 Own game files |
| **Super Mario Sunshine** | Native PC port / static recompilation | Nintendo Consoles · GameCube (2002) | 📁 Own game files |
| **Super Mario Galaxy** | Native PC port / static recompilation | Nintendo Consoles · Wii (2007) | 📁 Own game files |
| **Super Mario Strikers** | Native PC port / static recompilation | Nintendo Consoles · GameCube (2005) | 📁 Own game files |
| **Crash Team Racing** | Native PC port / static recompilation | PlayStation Consoles · PS1 (1999) | 📁 Own game files |
| **Forza Horizon 2** | Native PC port / static recompilation | Xbox Consoles · Xbox 360 (2014) | 📁 Own game files |
| **Duke Nukem: Zero Hour** | Native PC port / static recompilation | Nintendo Consoles · N64 (1999) | 📁 Own game files |
| **The Legend of Zelda: Ocarina of Time** | Native PC port / static recompilation | Nintendo Consoles · N64 (1998) | 📁 Own game files |
| **The Legend of Zelda: Wind Waker** | Native PC port / static recompilation | Nintendo Consoles · GameCube (2002) | 📁 Own game files |
| **Majora’s Mask** | Native PC port / static recompilation | Nintendo Consoles · N64 (2000) | 📁 Own game files |
| **Perfect Dark** | Native PC port / static recompilation | Nintendo Consoles · N64 (2000) | 📁 Own game files |
| **Call of Duty 3** | Native PC port / static recompilation | Multi-platform · Multi (2006) | 📁 Own game files |
| **Jak &amp; Daxter** | Native PC port / static recompilation | PlayStation Consoles · PS2 (2001) | 📁 Own game files |
| **The Simpsons Game** | Native PC port / static recompilation | Multi-platform · Multi (2007) | 📁 Own game files |
| **Peter Jackson’s King Kong** | Native PC port / static recompilation | Xbox Consoles · Xbox 360 (2005) | 📁 Own game files |
| **Gears of War 3** | Native PC port / static recompilation | Xbox Consoles · Xbox 360 (2011) | 📁 Own game files |
| **Bloodborne** | Native PC port / static recompilation | PlayStation Consoles · PS4 (2015) | 📁 Own game files |
| **Virtua Fighter Arcade** | Native PC port / static recompilation | Arcade &amp; Sega · Arcade (1993) | 📁 Own game files |
| **Splinter Cell: Double Agent** | Native PC port / static recompilation | Xbox Consoles · Xbox (2006) | 📁 Own game files |
| **Tekken 6** | Native PC port / static recompilation | Multi-platform · Multi (2009) | 📁 Own game files |
| **The Legend of Zelda: Wind Waker HD** | Native PC port / static recompilation | Nintendo Consoles · Wii U (2013) | 📁 Own game files |
| **The Legend of Zelda: Breath of the Wild** | Native PC port / static recompilation | Nintendo Consoles · Wii U (2017) | 📁 Own game files |
| **Bayonetta 2** | Native PC port / static recompilation | Nintendo Consoles · Wii U (2014) | 📁 Own game files |
| **Metroid Dread** | Native PC port / static recompilation | Nintendo Consoles · Switch (2021) | 📁 Own game files |
| **Metroid Prime** | Native PC port / static recompilation | Nintendo Consoles · GameCube (2002) | 📁 Own game files |
| **Star Fox** | Native PC port / static recompilation | Nintendo Consoles · SNES (1993) | 📁 Own game files |
| **F-Zero** | Native PC port / static recompilation | Nintendo Consoles · SNES (1990) | 📁 Own game files |
| **Donkey Kong Country** | Native PC port / static recompilation | Nintendo Consoles · SNES (1994) | 📁 Own game files |
| **Donkey Kong Country 2: Diddy’s Kong Quest** | Native PC port / static recompilation | Nintendo Consoles · SNES (1995) | 📁 Own game files |
| **Donkey Kong Country 3: Dixie Kong’s Double Trouble!** | Native PC port / static recompilation | Nintendo Consoles · SNES (1996) | 📁 Own game files |
| **Mother 2/EarthBound** | Native PC port / static recompilation | Nintendo Consoles · SNES (1994) | 📁 Own game files |
| **SCUD RACE** | Native PC port / static recompilation | Arcade &amp; Sega · Arcade (1996) | 📁 Own game files |
| **The Lost World: Jurassic Park** | Native PC port / static recompilation | Arcade &amp; Sega · Arcade (1997) | 📁 Own game files |
| **Time Crisis** | Native PC port / static recompilation | Arcade &amp; Sega · Arcade (1995) | 📁 Own game files |
| **Rave Racer** | Native PC port / static recompilation | Arcade &amp; Sega · Arcade (1995) | 📁 Own game files |
| **Time Crisis 2** | Native PC port / static recompilation | Arcade &amp; Sega · Arcade (1997) | 📁 Own game files |
| **Virtua Fighter 2** | Native PC port / static recompilation | Arcade &amp; Sega · Arcade (1994) | 📁 Own game files |
| **Gears of War** | Native PC port / static recompilation | Xbox Consoles · Xbox 360 (2006) | 📁 Own game files |
| **Gears of War: Judgment** | Native PC port / static recompilation | Xbox Consoles · Xbox 360 (2013) | 📁 Own game files |
| **God of War** | Native PC port / static recompilation | PlayStation Consoles · PS2 (2005) | 📁 Own game files |
| **Super Smash Bros. Brawl** | Native PC port / static recompilation | Nintendo Consoles · Wii (2008) | 📁 Own game files |
| **Xenoblade Chronicles X: Definitive Edition** | Native PC port / static recompilation | Nintendo Consoles · Switch (2025) | 📁 Own game files |
| **Shadow of the Colossus** | Native PC port / static recompilation | PlayStation Consoles · PS4 (2018) | 📁 Own game files |
| **MediEvil** | Native PC port / static recompilation | PlayStation Consoles · PS4 (2019) | 📁 Own game files |
| **Killzone Shadow Fall** | Native PC port / static recompilation | PlayStation Consoles · PS4 (2013) | 📁 Own game files |
| **Driveclub** | Native PC port / static recompilation | PlayStation Consoles · PS4 (2014) | 📁 Own game files |
| **God of War 3 Remastered** | Native PC port / static recompilation | PlayStation Consoles · PS4 (2015) | 📁 Own game files |
| **Gran Turismo Sport** | Native PC port / static recompilation | PlayStation Consoles · PS4 (2017) | 📁 Own game files |
| **Uncharted: The Nathan Drake Collection** | Native PC port / static recompilation | PlayStation Consoles · PS4 (2015) | 📁 Own game files |
| **The Order: 1886** | Native PC port / static recompilation | PlayStation Consoles · PS4 (2015) | 📁 Own game files |
| **The Last Guardian** | Native PC port / static recompilation | PlayStation Consoles · PS4 (2016) | 📁 Own game files |
| **Zelda 2: The Adventure of Link** | Native PC port / static recompilation | Nintendo Consoles · NES (1987) | 📁 Own game files |
| **WET** | Native PC port / static recompilation | Multi-platform · Multi (2009) | 📁 Own game files |
| **The Darkness** | Native PC port / static recompilation | Multi-platform · Multi (2007) | 📁 Own game files |
| **Spider-Man: Edge of Time** | Native PC port / static recompilation | Multi-platform · Multi (2011) | 📁 Own game files |
| **Mercenaries** | Native PC port / static recompilation | Multi-platform · Multi (2005) | 📁 Own game files |
| **GTA: Liberty City Stories** | Native PC port / static recompilation | PlayStation Consoles · PS2 (2005) | 📁 Own game files |
| **Fable 2** | Native PC port / static recompilation | Xbox Consoles · Xbox 360 (2008) | 📁 Own game files |
| **Burnout Revenge** | Native PC port / static recompilation | Multi-platform · Multi (2005) | 📁 Own game files |
| **Lost Odyssey** | Native PC port / static recompilation | Xbox Consoles · Xbox 360 (2007) | 📁 Own game files |
| **Mario Party 4** | Native PC port / static recompilation | Nintendo Consoles · GameCube (2002) | 📁 Own game files |
| **Sonic Unleashed** | Native PC port / static recompilation | Multi-platform · Multi (2008) | 📁 Own game files |
| **GoldenEye 007** | Native PC port / static recompilation | Nintendo Consoles · N64 (1997) | 📁 Own game files |
| **The Legend of Zelda: Twilight Princess** | Native PC port / static recompilation | Nintendo Consoles · GameCube (2006) | 📁 Own game files |
| **Silent Hill** | Native PC port / static recompilation | PlayStation Consoles · PS1 (1999) | 📁 Own game files |
| **Gears of War 2** | Native PC port / static recompilation | Xbox Consoles · Xbox 360 (2008) | 📁 Own game files |
| **Syphon Filter** | Native PC port / static recompilation | PlayStation Consoles · PS1 (1999) | 📁 Own game files |
| **Diddy Kong Racing** | Native PC port / static recompilation | Nintendo Consoles · N64 (1997) | 📁 Own game files |
| **Ace Combat 6** | Native PC port / static recompilation | Xbox Consoles · Xbox 360 (2007) | 📁 Own game files |
| **Wave Race 64** | Native PC port / static recompilation | Nintendo Consoles · N64 (1996) | 📁 Own game files |
| **Blue Dragon** | Native PC port / static recompilation | Xbox Consoles · Xbox 360 (2006) | 📁 Own game files |
| **Pikmin** | Native PC port / static recompilation | Nintendo Consoles · GameCube (2001) | 📁 Own game files |
| **Ninja Gaiden 2** | Native PC port / static recompilation | Xbox Consoles · Xbox 360 (2008) | 📁 Own game files |
| **Super Smash Bros. Ultimate** | Native PC port / static recompilation | Nintendo Consoles · Switch (2018) | 📁 Own game files |
| **Super Paper Mario** | Native PC port / static recompilation | Nintendo Consoles · Wii (2007) | 📁 Own game files |
| **Tekken 3** | Native PC port / static recompilation | PlayStation Consoles · PS1 (1997) | 📁 Own game files |
<!-- GAMES-TABLE:END -->

Legend: 📁 needs your own game files. That is the only status in this directory — none of these ports are instant-play browser games.

---

## 🔗 Where the links point

* **Super Mario Odyssey** → the [Power Moon Recomp GitLab project](https://gitlab.com/zzzarathustra-dev/power-moon-recomp) (the round-up's "download from here" link). Only game version **1.0.0** is supported: on first run you select your dumped files, the setup validates and copies them, then builds the PC version once.
* **F-Zero**, **Super Paper Mario** and **The Wind Waker HD** → their GitHub project pages ([FZeroRecomp](https://github.com/craigshaw/FZeroRecomp), [NewSuperPaperBros](https://github.com/josiahg2502-glitch/NewSuperPaperBros), [ZeldaWWHDRecomp](https://github.com/ZeldaWWHDRecomp/ZeldaWWHDRecomp)).
* **Everything else** → the DSOGaming article announcing that port, taken from the round-up's own links.

Every one of the **74 distinct links** was checked on 2 November 2026: **70 DSOGaming articles** resolved through the site's own post index, and **four GitLab / GitHub project pages** returned HTTP 200. Four cards whose round-up links were wrong or unreliable were repaired:

| Card | Problem | Now points to |
| --- | --- | --- |
| The Wind Waker HD | round-up linked to the *Skyward Sword HD* article | ZeldaWWHDRecomp project |
| Super Paper Mario | article intermittently returned "Page not found" | NewSuperPaperBros project |
| Killzone Shadow Fall | round-up linked to a third-person-camera patch post | the original port announcement |
| Uncharted: The Nathan Drake Collection | round-up linked to an update patch post | the original port announcement |

Links are editorial references, not mirrors, and can move. `npm run links` re-checks all of them (needs internet); if one breaks, open an issue.

---

## 🧱 How the site is built

There are **two independent catalogues**. `games.json` is the single source of truth for the original 79-port directory; `instant-play.json` is the single source of truth for the ⚡ Instant Play grid and the research database. `scripts/build.mjs` regenerates the hero, port card grid, filter pills, the ⚡ Instant Play section, the README table and the `RESEARCH-REPORT.md` tables from those two files. `scripts/seed-catalog.mjs` holds the curated list of ports and can rewrite `games.json` from it. The 79 covers are committed as real JPEGs — there is no cover generator; Instant Play artwork is loaded lazily from its original host.

`npm run check` also runs `scripts/check-site.mjs`, a dependency-free structural audit of the hand-written shell: the inline script parses, every `#id` it queries exists *before* the script tag, the generated blocks and filter hooks are present, every card exposes the data attributes the filters need, ⚡ Instant Play sits above all existing games, and no unlicensed AAA asset-streaming host has leaked into the playable grid.

```bash
npm run check        # build --check + artwork check + site structure check (what CI runs)
npm run build        # regenerate index.html + README + RESEARCH-REPORT from both catalogues
npm run seed         # rebuild games.json from the curated port list
npm run links        # check all 74 outbound port links (needs internet)
npm run links:instant # check every instant-play URL, embed, artwork, repo and reference (needs internet)
npm run test:dom   # 62 DOM assertions (needs: npm i --no-save jsdom)
npm run brand        # regenerate emblem PNGs / favicons / OG card
npm start            # serve the site on :8000
```

To add or change a **port**, edit `PORTS` / `LINKS` in `scripts/seed-catalog.mjs`, add its original cover to `assets/covers/<id>.jpg`, then run `npm run seed && npm run build`. To add or change an **instant-play game or research entry**, edit `instant-play.json` and run `npm run build`.

---

## 📁 Project structure

```text
tabulous-games/
├── index.html                    # The site: ⚡ Instant Play, hero, filters, generated cards
├── README.md                     # This document (tables + counts generated by build.mjs)
├── games.json                    # Source of truth: 79 ports, categories, provenance
├── instant-play.json             # Source of truth: 176 playable games + 33 research entries
├── RESEARCH-REPORT.md            # Full findings report (tables generated by build.mjs)
├── manifest.webmanifest          # PWA metadata
├── robots.txt · sitemap.xml      # Crawler hints for the Pages deployment
├── favicon.ico                   # Legacy icon bundle
├── scripts/
│   ├── seed-catalog.mjs          # Curated port list + source links → games.json
│   ├── build.mjs                 # Regenerates index.html + README + report from both catalogues
│   ├── check-artwork.mjs         # Validates the committed JPEG covers
│   ├── check-site.mjs            # Parses the inline script and audits the HTML shell
│   ├── check-links.mjs           # Checks every outbound port link
│   ├── check-instant-links.mjs   # Checks every instant-play destination (needs internet)
│   ├── check-instant-dom.mjs      # 62 jsdom assertions for both filter systems + player
│   └── make-brand.mjs            # Regenerates emblem PNGs, favicons, OG card, wordmark
└── assets/
    ├── brand/                    # Emblem, favicons, apple-touch icon, OG card
    │   └── banner.svg            # Fallback art for missing covers
    ├── fonts/                    # Self-hosted Manrope 700/800
    ├── retro-arcade-sticker.svg  # Sister-repo badge
    └── covers/                   # 79 original box/key-art JPEGs + ARTWORK.md
```

---

## ✅ Policy

**Port directory (the original 79 entries):**

1. Only the games named in the round-up are listed. No auto-discovery, no scraping, no scheduled additions.
2. Every entry is an **unofficial fan project**; nothing here is affiliated with or endorsed by the rights holders.
3. You must own the original game and dump its files yourself. Ports contain no game assets, so there is no workaround; no game data is bundled or mirrored.
4. Requirements and version caveats are stated on each card, and the linked page is the authority for downloads and setup.

**⚡ Instant Play (the new section):**

5. This repo hosts **no game files, ROMs, BIOS images or assets** for either collection. Every instant-play button opens a third-party host.
6. Only official free releases, publisher-released shareware/freeware, open-source projects and Internet Archive preservation copies hosted by the Archive under its own takedown policy are given play buttons. Unlicensed AAA WebAssembly ports that stream retail assets are documented in the research table **without play buttons**.
7. `STREAMING` (cloud video) is kept distinct from locally browser-executed WebAssembly/WebGL/emulation technology.
8. Verification status, mobile compatibility and installation requirements are recorded for every entry. `link-verified` means the destination was confirmed reachable and correctly attributed — not that gameplay was launched in a browser.
9. Trademarks and game assets belong to their respective owners. If a rights holder objects to a link, it will be removed.

---

## 🛠️ How to run

### Locally
Open `index.html` directly — all covers and fonts are bundled, so the directory works offline. Or run `npm start` and visit `http://localhost:8000`.

### GitHub Pages
The live site is [lin4cre.github.io/tabulous-games](https://lin4cre.github.io/tabulous-games/), served by GitHub Pages from the `main` branch at `/`.

---

## 🎨 Design system

The site is one self-contained HTML file with a small design system: dark chrome surfaces, a sky-blue accent, a purple "own files" status, and each game's original cover art. Type is self-hosted Manrope 700/800; icons are an inline SVG sprite; reveal and hover motion collapse under `prefers-reduced-motion`.

Regenerate brand art after editing `assets/brand/emblem.svg`:

```bash
npm i --no-save sharp @resvg/resvg-js typeface-manrope
node scripts/make-brand.mjs
```

---

## 💚 Support the project

Tabulous Games is the work of one solo developer — no ads, no tracking, no affiliate links. If the directory saved you some searching, you can **Buy Me a Smoke** via [paypal.me/dlinacre16](https://paypal.me/dlinacre16). Entirely optional.

---

## 📄 License

MIT License. Created with passion for game preservation and the people who keep old games playable.
