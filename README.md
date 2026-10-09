# 🎮 Tabulous Games — The Curated Browser Gaming Vault

[![Live Games](https://img.shields.io/badge/Verified%20Games-23%20Playable-00f0ff?style=for-the-badge&logo=gamepad)](index.html)
[![Sister Project](https://img.shields.io/badge/Sister%20Repo-Retro%20Arcade%20Vault-a855f7?style=for-the-badge&logo=github)](https://github.com/LIN4CRE/retro-arcade-vault)
[![Tech Stack](https://img.shields.io/badge/Engine-WebAssembly%20%7C%20WebGL-ff0077?style=for-the-badge)](https://webassembly.org/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

> **Classic PC masterpieces, iconic shooters, zombies co-op, and 3D open-world adventures running natively inside your browser tab.** Zero launchers, zero installs, pure WebAssembly & WebGL acceleration.

<p align="center">
  <img src="assets/banner.svg" alt="Tabulous Games Banner" width="100%">
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
*   **Tabulous Games**: Dedicated to **3D PC ports, legendary shooters, Zombies survival, and WebAssembly reconstructions**.

Together, they form the ultimate browser-based retro gaming suite!

---

## 🚀 The Curated Library (23 Verified Working Games)

Every single link in Tabulous Games was tested and verified live with working audio, pointer-lock mouse controls, and instant playability:

| Game Title | Platform / Tech | Genre | Status |
| :--- | :--- | :--- | :--- |
| **Call of Duty: Black Ops — Zombies** | WebGL / Canvas | Zombies & Co-op | ⚡ Instant Play |
| **Call of Duty: Black Ops — Moon** | WebGL / Cloudflare Pages | Zombies & Co-op | ⚡ Instant Play |
| **Call of Duty: Black Ops — Kino der Toten** | WebGL / Cloudflare Pages | Zombies & Co-op | ⚡ Instant Play |
| **Call of Duty: Black Ops III — Cheese Cube** | WebGL / Cloudflare Pages | Zombies & Co-op | ⚡ Instant Play |
| **Call of Duty: Black Ops II (Vibe Slops II)** | WebGL / WebSockets | Shooters & FPS | 🌐 Multiplayer |
| **Counter-Strike Surf (Surfd.net)** | WebGL / Source Physics | Shooters & FPS | ⚡ Instant Play |
| **Halo: Combat Evolved (Web Port)** | WebGL / Mitchell Hynes | Shooters & FPS | ⚡ Instant Play |
| **Halo: Combat Evolved Mobile / Web** | WebAssembly / Gamepad API | Shooters & FPS | 📁 Custom Files |
| **Skate 3 (Web Fan Project)** | WebGL / Canvas | Sports & Arcade | ⚡ Instant Play |
| **Pro Evolution Soccer 6 (PES 6 Web)** | PPSSPP WebAssembly | Sports & Arcade | ⚡ Instant Play |
| **Grand Theft Auto: Vice City (reVC WASM)** | reVC / WebGL | Open World & Action | ⚡ Instant Play |
| **Grand Theft Auto III (re3 WASM)** | re3 / WASM Arcade | Open World & Action | ⚡ Instant Play |
| **The Simpsons: Hit & Run (SHAR WASM)** | WebAssembly / Worker | Open World & Action | ⚡ Instant Play |
| **The Simpsons: Hit & Run (WASM Arcade)** | WebAssembly Mirror | Open World & Action | ⚡ Instant Play |
| **Minecraft Java 1.8.8 (Eaglercraft)** | TeaVM / WASM Java | Open World & Action | ⚡ Instant Play |
| **Quake (QuakeWorld Online)** | WebQuake / WebSockets | Classic Id / Retro PC | 🌐 Multiplayer |
| **Quake II (JSQuake II)** | WebGL / WebAssembly | Classic Id / Retro PC | 🌐 Multiplayer |
| **Quake III Arena (ioquake3 Web)** | ioquake3 / WebGL | Classic Id / Retro PC | 🌐 Multiplayer |
| **Return to Castle Wolfenstein (iortcw)** | iortcw / WebAssembly | Classic Id / Retro PC | 🌐 Multiplayer |
| **Urban Terror** | ioquake3 WebAssembly | Shooters & FPS | ⚡ Instant Play |
| **Half-Life (Pixelsuft WebXash)** | Xash3D FWGS WASM | Classic Id / Retro PC | ⚡ Instant Play |
| **Counter-Strike 1.6 & Half-Life (webXash)**| Xash3D Framework | Shooters & FPS | 📁 Shareware / Custom |
| **Diablo 1 (DiabloWeb / DevilutionX)** | DevilutionX WASM | Classic Id / Retro PC | ⚡ Instant Play |

---

## 🔍 Transparency Audit: Excluded Links

The following links from the raw request were rigorously checked and excluded to maintain a high-quality, working catalog:

1. **Modern Warfare 2** (`ovz-game-production.up.railway.app`): Responded with HTTP 429 Cloudflare bot-check gate; inaccessible for direct browser play.
2. **Skate Rust** (`global-terror.net`): Commercial apparel store & lore merchandise website; does not contain a playable game.
3. **GTA 5** (`web.archive.org/web/2026100605…`): Truncated address pointing only to the Wayback Machine home page.
4. **Hedgewars** (`webwars.link`): Django `DisallowedHost` 400 Bad Request server crash.

---

## 📁 Project Structure

```text
tabulous-games/
├── index.html                  # Main responsive web portal with live search & filters
├── README.md                   # Documentation & Sister repo links
├── LICENSE                     # MIT Open Source License
├── games.json                  # Complete game database with controls, tech & metadata
└── assets/
    ├── banner.svg              # Holographic vector header banner
    ├── retro-arcade-sticker.svg# Sister repo clickable sticker badge
    └── covers/                 # High-res local cover art for all 23 games
        ├── bo1.jpg
        ├── bo2.jpg
        ├── bo3.jpg
        ├── cheesecube.svg
        ├── cs16.jpg
        ├── cssurf.jpg
        ├── diablo.png
        ├── gta3.webp
        ├── gtavc.webp
        ├── haloce.jpg
        ├── halomcc.jpg
        ├── hl1.jpg
        ├── kino.svg
        ├── minecraft.webp
        ├── moon.svg
        ├── pes6.jpg
        ├── q1.jpg
        ├── q2.jpg
        ├── q3.jpg
        ├── rtcw.jpg
        ├── simpsons.webp
        ├── skate3.jpg
        └── urbanterror.svg
```

---

## 🛠️ How to Run

### Direct Local Play
Double-click `index.html` in File Explorer. Because all cover art and vector assets are bundled locally, the entire dashboard functions 100% offline or online with zero configuration!

### Hosting on GitHub Pages
1. Push this folder to a GitHub repository (e.g. `LIN4CRE/tabulous-games`).
2. Go to **Settings** > **Pages** and set the source branch to `main`.
3. Your site will be live instantly!

---

## 📄 License
MIT License. Created with passion for retro preservation and web technologies.
