# Tabulous Games — The Curated Browser Gaming Vault

<img src="assets/brand/emblem.svg" alt="Tabulous Games emblem" width="72" align="right">

[![Live Site](https://img.shields.io/badge/Live%20Site-lin4cre.github.io-8fd6ff?style=for-the-badge&logo=githubpages)](https://lin4cre.github.io/tabulous-games/)
[![Live Games](https://img.shields.io/badge/Verified%20Games-45%20Playable-00f0ff?style=for-the-badge&logo=gamepad)](index.html)
[![Sister Project](https://img.shields.io/badge/Sister%20Repo-Retro%20Arcade%20Vault-a855f7?style=for-the-badge&logo=github)](https://github.com/LIN4CRE/retro-arcade-vault)
[![Tech Stack](https://img.shields.io/badge/Engine-WebAssembly%20%7C%20WebGL-ff0077?style=for-the-badge)](https://webassembly.org/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

> **Classic PC masterpieces, iconic shooters, zombies co-op, survivors-likes, and 3D open-world adventures in your browser tab.** No separate game client or launcher; some ports still need your own original files or a substantial first download.

<p align="center">
  <img src="assets/brand/banner.svg" alt="Tabulous Games — browser game vault, verified daily" width="100%">
</p>

<p align="center">
  <b>Designed, built, written and maintained by one solo developer.</b><br>
  No studio, no team, no ad network — just a hand-curated catalogue and a bot that keeps it honest.
</p>

---

## 🕹️ Sister Project: Retro Arcade Vault

Looking for vintage console gems? Check out our companion project [**Retro Arcade Vault**](https://github.com/LIN4CRE/retro-arcade-vault) ([Live Demo](https://lin4cre.github.io/retro-arcade-vault/))!

<p align="center">
  <a href="https://github.com/LIN4CRE/retro-arcade-vault">
    <img src="assets/retro-arcade-sticker.svg" alt="Retro Arcade Vault Sticker" width="550">
  </a>
</p>

*   **Retro Arcade Vault**: Preloaded with **124 console classics** across PlayStation 1, Game Boy Advance, Nintendo DS, Super Nintendo, and Sega Genesis.
*   **Tabulous Games**: Dedicated to **3D PC ports, shooters, zombies, survivors-likes, and WebAssembly reconstructions**.

Together, they form the ultimate browser-based gaming suite!

---

## 🆕 October 2026 expansion — 9 survivors-likes and 12 new ports

This update was driven by a broad search for **survivors-likes playable in a browser tab** and for **new fan ports** of classic games. Two old entries were removed because their hosts no longer serve a game (see the audit below).

**Survivors & roguelite (9):**

| Title | What it is | Play link |
| :--- | :--- | :--- |
| **Azeroth Survivors** | WoW Classic survivors roguelike by Aethus (WebGPU, 9 classes, 12 zones) — the game also searched as *World of Warcraft Survivors* | [wow.aethus.pl](https://wow.aethus.pl/) |
| **Diablo Survivors** | 3D third-person Diablo survivors-like with drop-in co-op, by izkimar on Spawn | [spawn.co/@izkimar](https://www.spawn.co/@izkimar/diablo-survivors) |
| **D2 Survivors** | Diablo II survivors-like with all 7 classes and D2 loot — needs your own D2/D2R files | [d2survivors.lol](https://d2survivors.lol/play/) |
| **PokéBonk** | 3D Megabonk-style Pokémon survivor by Charcher | [pokebonk.com](https://pokebonk.com/) |
| **PokéSurvivor** | 2D bullet-heaven with 966 Pokémon and 4-player co-op | [pokesurvivor.com](https://pokesurvivor.com/) |
| **Pokémon Survivors** | 15-minute runs, 27 starters, megas, rifts and legendary bosses | [pokemonsurvivors.com](https://www.pokemonsurvivors.com/en/) |
| **Bacon Survivor** | The verified pig/pork-themed survivor game by SnoutUp | [poki.com](https://poki.com/en/g/bacon-survivor) |
| **PokeBonk (Touchzada)** | A second, separate PokeBonk with missions, shop and 8-player online runs | [pokebonk.solais.cloud](https://pokebonk.solais.cloud/) |
| **The Browsing of Isaac** | *Repentance+* recompiled to WebAssembly, streamed in a tab | [tboi.online](https://tboi.online/) |

**New ports & classics (12):** Doom (Wasm Doom), Crash Bash Online, Tomb Raider (OpenLara), Transport Tycoon (OpenTTD Online), Red Alert 2 (Chrono Divide), Road Rash, WipEout, LEGO Island, Lugaru, Alley Cat, SimCity Classic and Cricket 07. Full details, controls and caveats are in the cards and in the table below.

> **Search notes:** no game literally titled *Pork Survivors* could be verified — the closest is **Bacon Survivor**. *World of Warcraft Survivors* and *WoW Survivors* resolve to **Azeroth Survivors**. *Diablo II Survivors* is **D2 Survivors**, while **Diablo Survivors** (Spawn) is a separate 3D co-op game.

---

## 🏎️ October 2026 AAA browser-port sweep — 10 additions

A separate manual sweep checked for missing, recognizable PC and console blockbusters that now have browser builds. Requirements and caveats are intentionally explicit; these are unofficial projects unless stated otherwise.

| Game / build | Requirements and caveats |
| :--- | :--- |
| **Need for Speed: Most Wanted (2005 PC)** — [itch.io web port](https://dezm0n.itch.io/nfs-most-wanted-web-port) | Desktop Chrome/Edge with WebGPU and hardware acceleration; streams and caches game data. Experimental; online/LAN is unsupported, and full-career play plus race-end autosaves still need testing. |
| **Need for Speed: Underground 2** — [Underground 2 Revived](https://nfsu2.xyz/) | WebGPU desktop browser; data streams on demand, with an optional ~1.7 GB preload. Online/free roam uses the project's own community service. |
| **Burnout 3: Takedown** — [browser preview](https://burnout3.online/) | PS2 web recompilation; current Chrome/Edge with WebGPU recommended. Profile saving is broken (answer No to the save prompt), the first race has ~3 minutes of unskippable training, and online is experimental. |
| **Midnight Club 3: DUB Edition** — [PSP browser port](https://midnighhtclub3.online/) | This is the PSP release, not the PS2 Remix. Browser storage keeps saves; the host advertises private Ad Hoc rooms, but treat online play as experimental. |
| **Resident Evil Outbreak + File #2** — [OutbreakWeb](https://outbreakweb.com/) | Host loads the game automatically; modern WebAssembly features are required and WebGPU is recommended. Unofficial, not affiliated with Capcom; the host publishes no source/authorization details, and service stability and availability are uncertain. Browser memory-card saves should be exported. |
| **Fallout 1 + 2** — [Rerun Reactor](https://www.rerunreactor.com/) | Bring your own legally purchased game folder, ZIP or disc image. No game content is bundled; imports and saves stay local in browser storage. |
| **StarCraft: Brood War** — [OpenBW Web](https://playscbw.com/) | First play downloads about 90 MB of original data from Internet Archive and caches it. Browser RTS with AI, friend rooms and online matches; non-commercial fan project. |
| **Command & Conquer: Generals — Zero Hour** — [GeneralsX Web](https://generals.wasm.ltd/) | Requires your own Generals and Zero Hour files, selected from an install folder or archive; files remain on your machine. WebGPU-capable desktop browser recommended. |
| **Warcraft III** — [Warsmash](https://warsmash.pages.dev/) | Stage your own Warcraft III install through the asset manager; files stay in private browser storage. Unofficial, in-progress client. |
| **S.T.A.L.K.E.R.: Call of Pripyat / Call of Chernobyl** — [ZoneVM](https://zonevm.btr.pm/) | Requires your own game folder; the client uses browser-private storage and copies saves back. Very WIP, with expected bugs/crashes; Right Shift replaces Esc for in-game menus, and Ctrl+W can close the tab. |

**Not added after checks:** Portal's host returned Cloudflare 521; Half-Life 2 returned 404; Chinatown Wars stalled at 4 MB of 862 MB with 0 FPS; the public Morrowind host was invite-only with its player app missing; and Doom 3's demo raised a runtime exception. They remain in the transparency log rather than being presented as playable.

---

## 🚀 The Curated Library (45 entries, 28 instant-play)

Every card links to the project's own site. Large downloads, WebGPU requirements and "bring your own game files" cases are called out in each card's **Good to Know** box rather than hidden:

<!-- GAMES-TABLE:START -->
| Game Title | Platform / Tech | Genre | Status |
| :--- | :--- | :--- | :--- |
| **Need for Speed: Most Wanted — Web Port** 🆕 | PC Recompilation / WebAssembly / WebGPU | Sports &amp; Arcade | ⚡ Instant Play |
| **Need for Speed: Underground 2 (Web)** 🆕 | PC Recompilation / WebGPU | Sports &amp; Arcade | 🌐 Multiplayer |
| **Burnout 3: Takedown (Web Preview)** 🆕 | PS2 Web Recomp / WebAssembly / WebGPU | Sports &amp; Arcade | 🌐 Multiplayer |
| **Midnight Club 3: DUB Edition (Web)** 🆕 | PSP Web Recomp / WebAssembly / WebGL | Sports &amp; Arcade | 🌐 Multiplayer |
| **Resident Evil Outbreak &amp; File #2 (Web)** 🆕 | WebAssembly / WebGPU Browser Client | Zombies &amp; Co-op | 🌐 Multiplayer |
| **Fallout 1 &amp; 2 (Rerun Reactor)** 🆕 | Fallout Community Edition / WebAssembly | Classic PC &amp; Retro Ports | 📁 Custom Files |
| **StarCraft: Brood War (OpenBW Web)** 🆕 | OpenBW / WebAssembly | Strategy &amp; Sim | 🌐 Multiplayer |
| **Command &amp; Conquer: Generals — Zero Hour (GeneralsX Web)** 🆕 | GeneralsX / WebAssembly Decompilation | Strategy &amp; Sim | 📁 Custom Files |
| **Warcraft III (Warsmash Web)** 🆕 | Warsmash Browser Client / WebGL | Strategy &amp; Sim | 📁 Custom Files |
| **S.T.A.L.K.E.R.: Call of Pripyat (ZoneVM)** 🆕 | OpenXRay / WebAssembly | Shooters &amp; FPS | 📁 Custom Files |
| **Azeroth Survivors (World of Warcraft Survivors)** 🆕 | WebGPU / Rust + Bevy WASM | Survivors &amp; Roguelite | ⚡ Instant Play |
| **Diablo Survivors (3D Multiplayer)** 🆕 | WebGL / Spawn Engine | Survivors &amp; Roguelite | ⚡ Instant Play |
| **D2 Survivors (Diablo II Survivors)** 🆕 | WebAssembly / Own D2 Files | Survivors &amp; Roguelite | 📁 Custom Files |
| **PokéBonk (3D Pokémon Survivors)** 🆕 | WebGL / 3D Megabonk-style | Survivors &amp; Roguelite | ⚡ Instant Play |
| **PokéSurvivor (966 Pokémon)** 🆕 | HTML5 Canvas / WebGL | Survivors &amp; Roguelite | ⚡ Instant Play |
| **Pokémon Survivors (Bullet Heaven)** 🆕 | HTML5 / Canvas | Survivors &amp; Roguelite | ⚡ Instant Play |
| **Bacon Survivor (Pork Survivors-like)** 🆕 | HTML5 / Canvas | Survivors &amp; Roguelite | ⚡ Instant Play |
| **Doom (Wasm Doom)** 🆕 | Chocolate Doom WASM / WebSockets | Classic PC &amp; Retro Ports | ⚡ Instant Play |
| **Crash Bash Online** 🆕 | WebGL / Server-side Game Logic | Sports &amp; Arcade | 🌐 Multiplayer |
| **Tomb Raider (OpenLara)** 🆕 | WebGL / WebAssembly Engine Rewrite | Classic PC &amp; Retro Ports | ⚡ Instant Play |
| **OpenTTD Online (Transport Tycoon)** 🆕 | WebAssembly / OpenGFX | Strategy &amp; Sim | ⚡ Instant Play |
| **Chrono Divide (Red Alert 2)** 🆕 | WebGL / JavaScript Engine Rewrite | Strategy &amp; Sim | 📁 Custom Files |
| **Road Rash (Three.js Port)** 🆕 | Three.js / WebGL | Sports &amp; Arcade | ⚡ Instant Play |
| **WipEout (wipeout-rewrite)** 🆕 | WebAssembly / WebGL | Sports &amp; Arcade | ⚡ Instant Play |
| **LEGO Island (isle.pizza)** 🆕 | WebAssembly / Decompilation | Open World &amp; Action | ⚡ Instant Play |
| **Lugaru (Lugaru-Web)** 🆕 | WebAssembly / OSS Lugaru | Open World &amp; Action | ⚡ Instant Play |
| **Alley Cat (alleycat.exe)** 🆕 | Static Recompilation / WASM | Classic PC &amp; Retro Ports | ⚡ Instant Play |
| **SimCity Classic (micropolisJS)** 🆕 | JavaScript / HTML5 Canvas | Strategy &amp; Sim | ⚡ Instant Play |
| **Cricket 07 (Browser Recompilation)** 🆕 | WebAssembly / WebGPU Recompilation | Sports &amp; Arcade | ⚡ Instant Play |
| **Counter-Strike Surf (Surfd.net)** | WebGL / Source Physics Engine | Shooters &amp; FPS | ⚡ Instant Play |
| **Halo: Combat Evolved (Combat Lab)** | WebGL / WebAssembly Engine | Shooters &amp; FPS | ⚡ Instant Play |
| **Skate 3 (Web Fan Project)** | WebGL / Canvas Physics | Sports &amp; Arcade | ⚡ Instant Play |
| **Pro Evolution Soccer 6 (PES 6 Web)** | PPSSPP WebAssembly Emulation | Sports &amp; Arcade | ⚡ Instant Play |
| **Grand Theft Auto: Vice City (reVC WASM)** | reVC WebAssembly / WebGL | Open World &amp; Action | ⚡ Instant Play |
| **Grand Theft Auto III (re3 WASM)** | re3 WebAssembly / WebGL | Open World &amp; Action | ⚡ Instant Play |
| **The Simpsons: Hit &amp; Run (SHAR WASM)** | WebAssembly / Cloudflare Workers | Open World &amp; Action | ⚡ Instant Play |
| **Minecraft Java 1.8.8 (Eaglercraft WASM)** | TeaVM / WebAssembly Java | Open World &amp; Action | ⚡ Instant Play |
| **Quake (QuakeWorld Online)** | WebQuake / WebGL / WebSockets | Classic PC &amp; Retro Ports | 🌐 Multiplayer |
| **Quake II (JSQuake II)** | WebGL / WebAssembly Netcode | Classic PC &amp; Retro Ports | 🌐 Multiplayer |
| **Quake III Arena (ioquake3 Web)** | ioquake3 WebAssembly / WebGL | Classic PC &amp; Retro Ports | 🌐 Multiplayer |
| **Return to Castle Wolfenstein (iortcw Web)** | iortcw WebAssembly / WebGL | Classic PC &amp; Retro Ports | 🌐 Multiplayer |
| **Urban Terror (ut.pieter.com)** | ioquake3 WebAssembly | Shooters &amp; FPS | ⚡ Instant Play |
| **Half-Life (Pixelsuft WebXash)** | Xash3D FWGS WebAssembly | Classic PC &amp; Retro Ports | ⚡ Instant Play |
| **Counter-Strike 1.6 (webXash)** | Xash3D WebAssembly Framework | Shooters &amp; FPS | 📁 Custom Files |
| **Diablo 1 (DiabloWeb / DevilutionX)** | DevilutionX WebAssembly | Classic PC &amp; Retro Ports | ⚡ Instant Play |
<!-- GAMES-TABLE:END -->

Legend: ⚡ instant play · 🌐 online multiplayer · 📁 needs your own game files / add-ons.

---

## 🤖 The 24-hour discovery bot

The catalogue now looks after itself. A GitHub Action runs **once every 24 hours** (06:17 UTC) and does four things without any input:

1. **Scans** [PortedGames](https://portedgames.com/) (its daily-checked changelog and every browser port it tracks), the public [Spawn](https://www.spawn.co/) feed filtered to survivors/roguelite, and a curated watchlist in `data/discovery-sources.json`.
2. **Verifies** every new link and re-checks all existing catalogue links, spotting 404/410s, timeouts and domains that now redirect somewhere unrelated.
3. **Publishes and repairs safely**: `scripts/auto-publish.mjs` adds up to three strong, fully verified finds per run (marked `AUTO-DISCOVERED` and honest about being machine-found), and retires entries whose host has definitively gone — moving them to the audit list with a reason. Timeouts, 5xx and bot-checks never trigger a removal, and if more than 15% of links fail in one run the bot assumes the scanner lost network access and changes nothing.
4. **Reports**: rewrites `data/status.json` (the site's heartbeat), `data/discoveries.json` / `.md`, commits everything, and opens or refreshes a `discovery` issue when something needs a human.

GitHub Pages redeploys from `main` on that commit, so the live site updates itself.

### "When was this last scanned?"

Every visitor sees it: a small indicator in the header reads `data/status.json` and shows how long ago every link was last tested (green under 3 days, amber to 10, red beyond that), so a stalled check is obvious at a glance. If the file has no real check recorded, it simply says links are tested before listing.

### Running it by hand

```bash
npm run check        # build --check + cover check (what CI runs)
npm run discover     # scan the web now, write data/discoveries.*
npm run auto         # publish verified finds + retire dead links
npm run status       # refresh data/status.json
npm run build        # regenerate index.html + README
npm run covers       # generate any missing SVG covers
npm run pending      # list staged candidates
npm run daily        # the whole daily cycle in one command
npm start            # serve the site on :8000
```

Or trigger the workflow yourself: **Actions → Discover new browser games → Run workflow**.

> **Note:** GitHub currently refuses to start Actions jobs on this account ("The job was not started because your account is locked due to a billing issue"). The workflows are valid and will run on schedule as soon as billing is resolved; until then `npm run discover && npm run auto && npm run status && npm run build` reproduces the entire daily cycle locally.

---

## 🔍 Transparency audit

The full, generated list of excluded links is rendered at the bottom of the site and stored in the `excluded` array of `games.json`. It currently covers **19** entries:

*   **Portal (yikes.pw)** — redirected to an HTTP `:8080` endpoint that returned Cloudflare 521.
*   **Half-Life 2 (slqnt)** — the public host returned a deployment-not-found 404.
*   **GTA: Chinatown Wars** — stalled at 4 MB of 862 MB with 0 FPS; a playable session could not be verified.
*   **The Elder Scrolls III: Morrowind** — the advertised host is invite-only and says its player app is not installed.
*   **Doom 3 Demo (d3wasm)** — the demo page exposed a runtime exception during the direct check.
*   **Call of Duty: Black Ops III — Cheese Cube** — taken down; the old domain now redirects to an unrelated casino site.
*   **Call of Duty: Black Ops II (Vibe Slops II)** — offline after the author reported an Activision DMCA takedown.
*   **Poke World Survivors** — host returned HTTP 500 on the last check.
*   The original four entries (Modern Warfare 2 railway host, Skate Rust storefront, truncated GTA 5 Wayback link and broken Hedgewars host) remain excluded.

Removals and unverified leads are never silent: each stays in `excluded` with its URL and reason.

---

## 📁 Project Structure

```text
tabulous-games/
├── index.html                       # The site: live search, filters, generated cards, heartbeat panel
├── README.md                        # This document (table + counts generated by scripts/build.mjs)
├── LICENSE                          # MIT Open Source License
├── games.json                       # Single source of truth: games, categories, audit list, featured pick
├── manifest.webmanifest             # PWA metadata (installable, themed to the black-chrome palette)
├── robots.txt · sitemap.xml         # Crawler hints for the Pages deployment
├── favicon.ico                      # 16/32/48 icon bundle for older browsers
├── data/
│   ├── discovery-sources.json       # Where the daily scanner looks
│   ├── discoveries.json             # Latest scan output (committed by the bot)
│   ├── discoveries.md               # Human-readable scan report
│   └── status.json                  # Heartbeat shown in the site's status panel
├── fixtures/                        # Offline samples used to test the discovery parsers
├── scripts/
│   ├── discover-games.mjs           # Automated search + link verification
│   ├── auto-publish.mjs             # Publish verified finds, retire dead links
│   ├── finalise-games.mjs           # Turn staged discoveries into games.json drafts
│   ├── write-status.mjs             # Refresh data/status.json after each scan
│   ├── make-covers.mjs              # Vector cover generator (deterministic per game)
│   ├── make-brand.mjs               # Regenerates emblem PNGs, favicons, OG card, wordmark
│   ├── build.mjs                    # Regenerates index.html + README from games.json
│   └── add-2026-10-games.py         # Migration record for the October 2026 batch
└── assets/
    ├── brand/                       # Emblem, favicons, apple-touch icon, OG card, wordmark banner
    ├── fonts/                       # Self-hosted Manrope 700/800 (display type)
    ├── retro-arcade-sticker.svg     # Sister repo clickable sticker badge
    └── covers/                      # Local cover art for every game (raster + generated SVG)
```

---

## ✅ Verification policy

1.  A link only enters the grid if it resolves to a playable client in a desktop browser.
2.  Games that need the original data files are labelled **📁 Custom Files** and say which files are required.
3.  WebGPU-only games and very large first loads are labelled in **Good to Know**.
4.  Links are re-checked daily by the discovery workflow; games that stop serving a client are moved to the audit list with a reason.
5.  Unofficial fan projects are credited as such — trademarks and game data belong to their owners.

---

## 🛠️ How to Run

### Direct Local Play
Double-click `index.html` in File Explorer. Because all cover art and vector assets are bundled locally, the entire dashboard functions 100% offline or online with zero configuration.

### Hosting on GitHub Pages
1. Push this folder to a GitHub repository (e.g. `LIN4CRE/tabulous-games`).
2. Go to **Settings** > **Pages** and set the source branch to `main`.
3. Your site will be live instantly.

---

## 🎨 Design system

The site is built as one self-contained HTML file with a small, deliberate design system:

| Token | Value | Use |
| :--- | :--- | :--- |
| `--ink-0 … --ink-3` | `#050608 → #151821` | Page, panel and card surfaces |
| `--chrome` | white → `#aab3c0` → white gradient | Wordmark, H1 and emblem highlights |
| `--accent` | `#8fd6ff` | Links, kickers, instant-play status |
| `--leaf` | `#7ee2a8` | The Buy Me a Smoke leaf and support card |
| `--ok` / `--warn` / `--bad` | `#5ad19a` / `#e8b25f` / `#f2777a` | Heartbeat states |

* **Type** — Manrope 700/800, self-hosted as two woff2 files (57 KB total), with the system stack as fallback.
* **Icons** — one inline SVG sprite (`#i-*`), so no icon font and no extra requests.
* **Brand** — hand-authored hex emblem, matching favicon.ico, apple-touch icon and a 1200×630 OG card.
* **Covers** — 1280×720 generated posters; palette, motif and composition are hashed from the game id, so each card looks individual yet the grid reads as one set.
* **Motion** — reveal-on-scroll and hover states all collapse under `prefers-reduced-motion`.

Regenerate brand art after editing `assets/brand/emblem.svg`:

```bash
npm i --no-save sharp @resvg/resvg-js typeface-manrope
node scripts/make-brand.mjs
```

---

## 💚 Support the project

Tabulous Games is the work of **one solo developer** — no company behind it, no advertising, no tracking. If the catalogue has saved you a download or two, you can **Buy Me a Smoke** — the button in the header, the support card and the footer all link to [paypal.me/dlinacre16](https://paypal.me/dlinacre16). Entirely optional; every game stays free and unpaywalled.

---

## 📄 License
MIT License. Created with passion for retro preservation and web technologies.
