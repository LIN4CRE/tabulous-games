#!/usr/bin/env python3
"""One-off migration that adds the October 2026 discovery batch to games.json.

Kept in the repo as a record of what was added and why. Running it twice is a
no-op because entries are merged by id.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB = ROOT / "games.json"

SURVIVORS = ("survivors", "Survivors & Roguelite")
CLASSIC = ("classic-pc", "Classic PC & Retro Ports")
STRATEGY = ("strategy", "Strategy & Sim")
SPORTS = ("sports", "Sports & Arcade")
OPENWORLD = ("openworld", "Open World & Action")

ADDED = "2026-10-24"

NEW_GAMES = [
    {
        "id": "azeroth-survivors",
        "title": "Azeroth Survivors (World of Warcraft Survivors)",
        "shortTitle": "Azeroth Survivors",
        "url": "https://wow.aethus.pl/",
        "cover": "assets/covers/azeroth-survivors.svg",
        "category": SURVIVORS[0],
        "year": 2026,
        "dev": "Aethus (fan project)",
        "engine": "WebGPU / Rust + Bevy WASM",
        "status": "instant",
        "badge": "WOW SURVIVORS",
        "desc": "A free fan-made survivors roguelike set in vanilla World of Warcraft 1.12.1. Pick a race, class and zone, then steer through hordes of that zone's real creatures while your spells cast themselves and every level offers three upgrade cards.",
        "controls": "WASD to move • Mouse to aim and steer • 1 / 2 / 3 to pick level-up cards • R to reroll • Space to jump • F for your class movement spell • C to lock the camera • Wheel to zoom • Enter to start • Esc to pause",
        "goodToKnow": "Needs WebGPU: Chrome or Edge 113+, Safari 26+, or Firefox with dom.webgpu.enabled. The first visit streams roughly 140 MB of world data, then the browser caches it. If the host says \"Too many people are playing\", wait a few minutes and reload. Unofficial fan project, not affiliated with Blizzard.",
        "tags": ["Survivors", "World of Warcraft", "Roguelite", "WebGPU", "Fan Project"],
        "alsoKnownAs": ["World of Warcraft Survivors", "WoW Survivors"],
    },
    {
        "id": "diablo-survivors-spawn",
        "title": "Diablo Survivors (3D Multiplayer)",
        "shortTitle": "Diablo Survivors",
        "url": "https://www.spawn.co/@izkimar/diablo-survivors",
        "cover": "assets/covers/diablo-survivors-spawn.svg",
        "category": SURVIVORS[0],
        "year": 2026,
        "dev": "izkimar / Spawn",
        "engine": "WebGL / Spawn Engine",
        "status": "instant",
        "badge": "3D SURVIVORS",
        "desc": "Pick a hero at the camp fire, step through the portal and survive the horde in this 3D third-person Diablo survivors-like. Chests deal reward cards, Horadric runs drop runes and gear, and friends can drop into the same world.",
        "controls": "WASD to move • Mouse to aim and look • Left Click to attack • Skill keys to cast • E to interact • P for Heroes Online • Esc for the menu",
        "goodToKnow": "Opens straight in the browser with no sign-in and no download; multiplayer sessions are hosted on Spawn. Chests, runes and difficulty unlocks persist between runs. Unofficial fan project set in Diablo's world.",
        "tags": ["Survivors", "Diablo", "Action RPG", "3D", "Multiplayer"],
        "alsoKnownAs": ["Diablo Survivors v1699"],
    },
    {
        "id": "d2-survivors",
        "title": "D2 Survivors (Diablo II Survivors)",
        "shortTitle": "D2 Survivors",
        "url": "https://d2survivors.lol/play/",
        "cover": "assets/covers/d2-survivors.svg",
        "category": SURVIVORS[0],
        "year": 2026,
        "dev": "framara (fan project)",
        "engine": "WebAssembly / Own D2 Files",
        "status": "files",
        "badge": "OWN FILES",
        "desc": "Diablo II's world turned into a survivors-like: all seven heroes and their skill trees, D2's own loot from the first drop to a gold-named unique, five acts, then Nightmare and Hell. Your skills cast themselves as you walk.",
        "controls": "WASD to walk • Mouse to aim • Skills cast automatically • 1 / 2 / 3 to choose level-up cards • I for inventory • Esc for menu",
        "goodToKnow": "You must own Diablo II (1.14 with Lord of Destruction) or Diablo II: Resurrected. The browser client reads the .MPQ files from your install once and keeps them in browser storage — nothing is uploaded. Free desktop builds are also offered.",
        "tags": ["Survivors", "Diablo II", "Action RPG", "Own Files", "Fan Project"],
        "alsoKnownAs": ["Diablo II Survivors"],
    },
    {
        "id": "pokebonk",
        "title": "PokéBonk (3D Pokémon Survivors)",
        "shortTitle": "PokéBonk",
        "url": "https://pokebonk.com/",
        "cover": "assets/covers/pokebonk.svg",
        "category": SURVIVORS[0],
        "year": 2026,
        "dev": "Charcher",
        "engine": "WebGL / 3D Megabonk-style",
        "status": "instant",
        "badge": "KANTO HORDE",
        "desc": "A free 3D Pokémon survivor game in the style of Megabonk. Pick Bulbasaur, Charmander or Squirtle, dodge wild hordes, evolve mid-run and fire your Ultimate across classic zones, guardians and an endless Survival mode.",
        "controls": "WASD to move • Mouse to orbit the camera • Space to jump (hold to glide) • Shift to slide • E to interact • R for Ultimate • Right Click to lock on • Q for auto/manual aim • P or Esc to pause",
        "goodToKnow": "Play only at the official pokebonk.com — the look-alike .app, .io, .online and .site domains are not the author's. Play as a guest, or make an account to keep progress, clans and leaderboard entries. Made with AI-assisted assets, as the site's legal page states.",
        "tags": ["Survivors", "Pokémon", "3D", "Roguelite", "Fan Project"],
    },
    {
        "id": "pokesurvivor",
        "title": "PokéSurvivor (966 Pokémon)",
        "shortTitle": "PokéSurvivor",
        "url": "https://pokesurvivor.com/",
        "cover": "assets/covers/pokesurvivor.svg",
        "category": SURVIVORS[0],
        "year": 2026,
        "dev": "JPTER78",
        "engine": "HTML5 Canvas / WebGL",
        "status": "instant",
        "badge": "966 POKÉMON",
        "desc": "A 2D bullet-heaven Pokémon fan game with 966 Pokémon across all nine regions. Pick a partner, clear Mystery Dungeon-style runs, hunt shinies and rift legendaries, and play co-op with up to four friends.",
        "controls": "WASD or arrow keys to move • Tap or click menus • Attacks fire automatically • Pick an upgrade on every level • Esc for menu",
        "goodToKnow": "Play as a guest or link an account or Google login to keep progress across devices; guest progress stays in that browser. Free, with no ads and no purchases. The game is played in landscape, including on phones.",
        "tags": ["Survivors", "Pokémon", "2D", "Co-op", "Fan Project"],
    },
    {
        "id": "pokemon-survivors",
        "title": "Pokémon Survivors (Bullet Heaven)",
        "shortTitle": "Pokémon Survivors",
        "url": "https://www.pokemonsurvivors.com/en/",
        "cover": "assets/covers/pokemon-survivors.svg",
        "category": SURVIVORS[0],
        "year": 2026,
        "dev": "Pokémon Survivors team",
        "engine": "HTML5 / Canvas",
        "status": "instant",
        "badge": "15 MINUTE RUNS",
        "desc": "A full Vampire Survivors-style Pokémon roguelite: 27 starters, mid-run evolutions, 207 moves, 91 abilities, legendary boss fights, rifts and Mega Evolution. Survive 15 minutes, beat Mewtwo, then face endless Arceus.",
        "controls": "WASD to walk, or tap and drag on mobile • Attacks are automatic • 1 / 2 / 3 to choose upgrades • E to talk • Esc to go back",
        "goodToKnow": "No download and no sign-up; progress, eggs and caught legendaries save in your browser. A Halloween 2026 Darkrai event runs from 24 October to 2 November. Unofficial fan game.",
        "tags": ["Survivors", "Pokémon", "Roguelite", "Mega Evolution", "Fan Project"],
    },
    {
        "id": "bacon-survivor",
        "title": "Bacon Survivor (Pork Survivors-like)",
        "shortTitle": "Bacon Survivor",
        "url": "https://poki.com/en/g/bacon-survivor",
        "cover": "assets/covers/bacon-survivor.svg",
        "category": SURVIVORS[0],
        "year": 2025,
        "dev": "SnoutUp Games",
        "engine": "HTML5 / Canvas",
        "status": "instant",
        "badge": "PIG VS HORDE",
        "desc": "The closest thing we could verify to a \"Pork Survivors\" game: SnoutUp's bacon-flavoured bullet-heaven, where a brave pig fights endless waves with guns, abilities and unlockable weapons in a monster-infested kitchen.",
        "controls": "WASD or arrow keys to move • Weapons fire on their own • Gamepad supported • On-screen joystick on phones",
        "goodToKnow": "Official SnoutUp release hosted on Poki, also on Android and iOS. Free and no account needed. We could not find any game literally titled \"Pork Survivors\" — this is the verified pig-themed survivor game.",
        "tags": ["Survivors", "Pig", "Pork", "Bullet Heaven", "Arcade"],
        "alsoKnownAs": ["Pork Survivors"],
    },
    {
        "id": "browsing-of-isaac",
        "title": "The Binding of Isaac: Repentance+ (The Browsing of Isaac)",
        "shortTitle": "The Browsing of Isaac",
        "url": "https://tboi.online/",
        "cover": "assets/covers/browsing-of-isaac.svg",
        "category": SURVIVORS[0],
        "year": 2011,
        "dev": "chiikabu / Nicalis",
        "engine": "WebAssembly / Static Recompilation",
        "status": "instant",
        "badge": "ROGUELITE CLASSIC",
        "desc": "chiikabu's WebAssembly recompile of The Binding of Isaac: Repentance+ running in a tab. Every item, synergy and bug from the PC game, with tboi.online streaming the whole data payload so there are no files to import.",
        "controls": "WASD to move • Arrow keys to shoot • Space for the active item • Q for card or pill • E for bomb • Ctrl to swap items (hold to drop) • Tab for map • Esc to pause • F for fullscreen",
        "goodToKnow": "The first load streams about 740 MB of game data, so give it time and free disk space. Saves stay in browser storage and can be exported. Chromium browsers are recommended. Unofficial fan recompile — own the game to play fair.",
        "tags": ["Roguelite", "Isaac", "WebAssembly", "Fan Port", "Bullet Heaven"],
        "alsoKnownAs": ["The Binding of Isaac in the browser"],
    },
    {
        "id": "wasm-doom",
        "title": "Doom (Wasm Doom)",
        "shortTitle": "Doom Web",
        "url": "https://silentspacemarine.com/",
        "cover": "assets/covers/wasm-doom.svg",
        "category": CLASSIC[0],
        "year": 1993,
        "dev": "Cloudflare / id Software",
        "engine": "Chocolate Doom WASM / WebSockets",
        "status": "instant",
        "badge": "SHAREWARE EP.1",
        "desc": "Cloudflare's Chocolate Doom compiled to WebAssembly: the free shareware episode Knee-Deep in the Dead, played solo or in online deathmatch over WebSockets. The original look and feel, not a remaster.",
        "controls": "Arrow keys to move and turn • Ctrl to fire • Space to open doors and use switches • Shift to run • Alt + Left/Right to strafe • 1–7 for weapons • Tab for map • Esc for menu",
        "goodToKnow": "Only the free shareware episode is included; Doom II and the paid episodes are not. Click the canvas first so the keyboard goes to the game. Choose Start Multiplayer to get a link you can share for deathmatch.",
        "tags": ["Doom", "id Software", "FPS", "WASM", "Multiplayer"],
        "alsoKnownAs": ["Doom in the browser"],
    },
    {
        "id": "crash-bash-online",
        "title": "Crash Bash Online",
        "shortTitle": "Crash Bash",
        "url": "https://crashbash.app/",
        "cover": "assets/covers/crash-bash-online.svg",
        "category": SPORTS[0],
        "year": 2000,
        "dev": "Paolo Furlan (fan port)",
        "engine": "WebGL / Server-side Game Logic",
        "status": "multiplayer",
        "badge": "4-PLAYER PARTY",
        "desc": "An unofficial browser port of the PS1 party classic Crash Bash, with all 28 battle arenas, the full Adventure mode and 2–4 player online rooms. Empty seats are filled by CPU players.",
        "controls": "Arrow keys or WASD to move • Space to jump • X to attack • Z to pick up or throw • C to taunt • Gamepad and on-screen touch pad supported",
        "goodToKnow": "Battle and Tournament need no account; Adventure mode saves to a free account. Rooms are hosted in Europe first, so distant players may see lag. Click the speaker icon once to enable sound.",
        "tags": ["Crash Bandicoot", "Party", "Multiplayer", "PS1", "Fan Port"],
    },
    {
        "id": "openlara",
        "title": "Tomb Raider (OpenLara)",
        "shortTitle": "OpenLara",
        "url": "http://xproger.info/projects/OpenLara/",
        "cover": "assets/covers/openlara.svg",
        "category": CLASSIC[0],
        "year": 1996,
        "dev": "XProger / Core Design",
        "engine": "WebGL / WebAssembly Engine Rewrite",
        "status": "instant",
        "badge": "1996 CLASSIC",
        "desc": "OpenLara, XProger's open-source re-implementation of the original Tomb Raider engine, running in WebGL. The web build streams classic level data, so you can start raiding without importing your own files.",
        "controls": "Arrow keys to move and turn • D to jump • Ctrl to grab, use and shoot • Space to draw weapons • Shift to walk • A to roll • C to look • Tab for inventory",
        "goodToKnow": "The author's server is slow on first load — wait, or reload if it stalls. The web build offers the Caves and City of Vilcabamba demo levels, and can load your own .PHD, .PSX or .TR level files.",
        "tags": ["Tomb Raider", "Adventure", "WebGL", "Open Source", "Retro"],
    },
    {
        "id": "openttd-online",
        "title": "OpenTTD Online (Transport Tycoon)",
        "shortTitle": "OpenTTD Online",
        "url": "https://openttdonline.com/play/",
        "cover": "assets/covers/openttd-online.svg",
        "category": STRATEGY[0],
        "year": 1995,
        "dev": "OpenTTD / Owen Gerke",
        "engine": "WebAssembly / OpenGFX",
        "status": "instant",
        "badge": "TYCOON IN A TAB",
        "desc": "A WebAssembly build of OpenTTD 15.3, the open-source Transport Tycoon Deluxe. Build rail, road, sea and air networks across random maps and scenarios, with the full company, finance and vehicle windows.",
        "controls": "Mouse to build and drag the map • Right-drag to scroll • Wheel to zoom • Use the toolbar to pause • Full manual at the OpenTTD wiki",
        "goodToKnow": "First start downloads about 11 MB of free OpenGFX graphics — keep the tab open while it counts up. If text shows as empty boxes, set Game Options → Language to English. Saves live in browser storage, so export anything important.",
        "tags": ["Transport Tycoon", "Strategy", "Simulation", "Open Source", "WASM"],
    },
    {
        "id": "chrono-divide",
        "title": "Chrono Divide (Red Alert 2)",
        "shortTitle": "Chrono Divide",
        "url": "https://game.chronodivide.com/",
        "cover": "assets/covers/chrono-divide.svg",
        "category": STRATEGY[0],
        "year": 2000,
        "dev": "Chrono Divide team",
        "engine": "WebGL / JavaScript Engine Rewrite",
        "status": "files",
        "badge": "RTS IN A TAB",
        "desc": "A fan-made rewrite of the Red Alert 2 engine in JavaScript and WebGL, with online multiplayer, quick match, skirmish against bots, replays and mod support. The single-player campaigns are not in yet.",
        "controls": "Left and right click to select and command (classic or modern scheme) • Drag to box-select • Pan with the arrow keys, WASD or screen edge • RA2 hotkeys",
        "goodToKnow": "Needs Red Alert 2 data files (ra2.mix, language.mix and multi.mix from v1.006) imported once; the client keeps them in browser storage and uploads nothing. 64-bit Chrome, Edge or Safari recommended.",
        "tags": ["Red Alert 2", "RTS", "Strategy", "Own Files", "Fan Project"],
        "alsoKnownAs": ["Command & Conquer: Red Alert 2 in the browser"],
    },
    {
        "id": "road-rash",
        "title": "Road Rash (Three.js Port)",
        "shortTitle": "Road Rash",
        "url": "https://roadrash.pages.dev/",
        "cover": "assets/covers/road-rash.svg",
        "category": SPORTS[0],
        "year": 1996,
        "dev": "olucurious / Electronic Arts",
        "engine": "Three.js / WebGL",
        "status": "instant",
        "badge": "GRUNGE RACING",
        "desc": "A Three.js remake of the 1996 Windows Road Rash with the original courses, bike stats, rider sprites, cutscenes and grunge soundtrack. Race, punch and kick your way through five California courses.",
        "controls": "Arrow keys or WASD to steer, accelerate and brake • Z / X (or Space / Ctrl) to punch left and right • C / K to kick • N for nitro • V to change view • Esc to pause",
        "goodToKnow": "Click the page once to enable sound. Touch controls and tilt steering work on phones, and Mano-a-Mano has relayed online rooms. Unofficial fan project — EA is not involved.",
        "tags": ["Road Rash", "Racing", "Three.js", "Retro", "Fan Port"],
    },
    {
        "id": "wipeout",
        "title": "WipEout (wipeout-rewrite)",
        "shortTitle": "WipEout",
        "url": "https://phoboslab.org/wipegame/",
        "cover": "assets/covers/wipeout.svg",
        "category": SPORTS[0],
        "year": 1995,
        "dev": "Dominic Szablewski / Psygnosis",
        "engine": "WebAssembly / WebGL",
        "status": "instant",
        "badge": "ANTI-GRAV RACER",
        "desc": "A near-complete C rewrite of the 1995 PlayStation anti-gravity racer, running in WebAssembly. Choose the full build with music and intro, or the 11 MB minimal build for a quick race.",
        "controls": "Arrow keys to steer • X to thrust • Z to fire • C and V for air brakes • A to change view",
        "goodToKnow": "Pick FULL (about 144 MB) or MINIMAL (about 11 MB) on the start screen — the full version streams before play. Click the canvas so the keys reach the game. Unofficial fan rewrite, not endorsed by Sony.",
        "tags": ["WipEout", "Racing", "PlayStation", "WebAssembly", "Retro"],
    },
    {
        "id": "lego-island",
        "title": "LEGO Island (isle.pizza)",
        "shortTitle": "LEGO Island",
        "url": "https://isle.pizza/",
        "cover": "assets/covers/lego-island.svg",
        "category": OPENWORLD[0],
        "year": 1997,
        "dev": "isledecomp / The LEGO Group",
        "engine": "WebAssembly / Decompilation",
        "status": "instant",
        "badge": "BUILD & EXPLORE",
        "desc": "The full 1997 LEGO Island running in a tab from the community decompilation. Explore the island, build vehicles, deliver pizzas as Pepper Roni and stop the Brickster across all three acts.",
        "controls": "Arrow keys or WASD to move • Mouse to interact • Gamepad and touch supported • Configure controls on the site's Configure page",
        "goodToKnow": "Needs a modern browser with WebAssembly threads: Chrome or Edge 95+, Firefox 92+, Safari 15.4+. Game data streams as you play, and an optional offline install of about 550 MB is offered.",
        "tags": ["LEGO", "Adventure", "Open World", "Decompilation", "Retro"],
    },
    {
        "id": "lugaru-web",
        "title": "Lugaru (Lugaru-Web)",
        "shortTitle": "Lugaru",
        "url": "https://loganwalkerdev.github.io/lugaru-web/",
        "cover": "assets/covers/lugaru-web.svg",
        "category": OPENWORLD[0],
        "year": 2005,
        "dev": "Wolfire / loganwalkerdev",
        "engine": "WebAssembly / OSS Lugaru",
        "status": "instant",
        "badge": "RABBIT KUNG-FU",
        "desc": "Wolfire's open-source 3D rabbit brawler compiled to WebAssembly with the open game data included. Play Turner through the campaign with close combat, counters, swords and stealth.",
        "controls": "WASD to move • Mouse to look • Left Click to attack • Space to jump • Shift to sneak or run • Number keys to draw weapons • Gamepad supported",
        "goodToKnow": "Create a player name with a keyboard before starting; progress saves in the browser. This runs the real Lugaru 1.3 engine from the OSS release, not a remake.",
        "tags": ["Lugaru", "Action", "Open Source", "WebAssembly", "Indie"],
    },
    {
        "id": "alley-cat",
        "title": "Alley Cat (alleycat.exe)",
        "shortTitle": "Alley Cat",
        "url": "https://petarov.github.io/alleycat.exe/",
        "cover": "assets/covers/alley-cat.svg",
        "category": CLASSIC[0],
        "year": 1984,
        "dev": "Bill Williams / petarov",
        "engine": "Static Recompilation / WASM",
        "status": "instant",
        "badge": "1984 DOS CLASSIC",
        "desc": "The 1984 IBM PC classic Alley Cat, recompiled from its DOS executable into a browser build. Leap through windows as a stray cat chasing mice, fish bowls, milk and the lady cat.",
        "controls": "Cursor keys to move and jump • Alt (Option on Mac) for the room's special action • K / H / T / A pick difficulty • Ctrl+S toggles sound • Ctrl+R returns to the title screen",
        "goodToKnow": "Press a key or click first so the browser allows sound. The author states that about 99% of the recompiler's code was AI-generated and only lightly reviewed — play at your own comfort level.",
        "tags": ["Alley Cat", "DOS", "Retro", "Recompilation", "1984"],
    },
    {
        "id": "simcity-classic",
        "title": "SimCity Classic (micropolisJS)",
        "shortTitle": "SimCity Classic",
        "url": "https://www.graememcc.co.uk/micropolisJS/",
        "cover": "assets/covers/simcity-classic.svg",
        "category": STRATEGY[0],
        "year": 1989,
        "dev": "Will Wright / Graeme McCutcheon",
        "engine": "JavaScript / HTML5 Canvas",
        "status": "instant",
        "badge": "CITY BUILDER",
        "desc": "micropolisJS is a hand-written JavaScript port of Micropolis, the GPL release of the original 1989 SimCity. Zone land, power it, wire roads and balance the budget through fires, floods and monster attacks.",
        "controls": "Mouse to pick tools and place tiles • Settings for game speed • Budget, Evaluation and Disasters panels on the left • Generate another to reroll the map",
        "goodToKnow": "Free and legal under the GPL, though the SimCity trademark is not licensed. There is one save slot in browser storage. Zones need power before they will grow.",
        "tags": ["SimCity", "City Builder", "Strategy", "Open Source", "Retro"],
    },
    {
        "id": "cricket-07",
        "title": "Cricket 07 (Browser Recompilation)",
        "shortTitle": "Cricket 07",
        "url": "https://cricket07.dhaiwat.com/",
        "cover": "assets/covers/cricket-07.svg",
        "category": SPORTS[0],
        "year": 2006,
        "dev": "Dhaiwat Pandya / EA Sports",
        "engine": "WebAssembly / WebGPU Recompilation",
        "status": "instant",
        "badge": "CRICKET IN A TAB",
        "desc": "EA Sports Cricket 07 statically recompiled to WebAssembly and playable in a desktop tab. Full matches against the CPU, local multiplayer with controllers and online 1v1 room-code games.",
        "controls": "Arrow keys to move, aim a shot and place the ball • S to select, play a normal shot or bowl a stock delivery • W to go back • Hold Shift for lofted shots • D to advance or take a run • A to cancel • Esc to pause • Alt+Enter for fullscreen",
        "goodToKnow": "The first visit downloads about 740 MB (Lite is about 440 MB); the full game needs roughly 1.2 GB of free space and WebGPU, so use Chrome or Edge on a desktop. Saves live in browser storage and have no export yet.",
        "tags": ["Cricket", "Sports", "EA Sports", "WebGPU", "Recompilation"],
    },
    {
        "id": "pokebonk-touchzada",
        "title": "PokeBonk (Touchzada, 8-Player)",
        "shortTitle": "PokeBonk Online",
        "url": "https://pokebonk.solais.cloud/",
        "cover": "assets/covers/pokebonk-touchzada.svg",
        "category": SURVIVORS[0],
        "year": 2026,
        "dev": "Touchzada (Luciano Gomes)",
        "engine": "HTML5 Canvas / Online Rooms",
        "status": "instant",
        "badge": "8-PLAYER HORDE",
        "desc": "A separate fan-made PokeBonk by Touchzada: pick a Pokémon, survive the horde, stack absurd combos and Mega Evolve. Casual, Classic and Challenge presets, missions and a shop, plus online runs for up to eight players.",
        "controls": "WASD or arrow keys to move • Attacks fire automatically • Mouse for menus and the shop • F2 for the balance panel • Esc to go back",
        "goodToKnow": "Guest mode needs no account; logging in keeps missions, BP currency, shop unlocks and leaderboard runs. Not the same project as Charcher's pokebonk.com — this one is built around online play for up to eight.",
        "tags": ["Survivors", "Pokémon", "Online Co-op", "Mega Evolution", "Fan Project"],
        "alsoKnownAs": ["PokeBonk by Touchzada"],
    },
]

CATEGORIES = [
    {"id": "survivors", "label": "Survivors & Roguelite", "emoji": "⚔️"},
    {"id": "zombies", "label": "Zombies & Co-op", "emoji": "🧟"},
    {"id": "shooters", "label": "Shooters & FPS", "emoji": "🎯"},
    {"id": "classic-pc", "label": "Classic PC & Retro Ports", "emoji": "⚡"},
    {"id": "openworld", "label": "Open World & Action", "emoji": "🚗"},
    {"id": "strategy", "label": "Strategy & Sim", "emoji": "🧠"},
    {"id": "sports", "label": "Sports & Arcade", "emoji": "🛹"},
]

STATUS = {
    "instant": ("Instant Play", "#00f0ff"),
    "multiplayer": ("Multiplayer", "#ff0077"),
    "files": ("Custom Files", "#a855f7"),
}

REMOVED = [
    {
        "name": "Call of Duty: Black Ops III — Cheese Cube Unlimited",
        "url": "https://cheese-cube.pages.dev/",
        "reason": "Taken down and the domain now redirects to an unrelated casino site. Removed from the catalogue on 2026-10-24.",
    },
    {
        "name": "Poke World Survivors",
        "url": "https://poke-survivors.vercel.app/",
        "reason": "Host returns HTTP 500 (server error) as of 2026-10-24, so the game could not be verified. Kept on the watchlist in data/discovery-sources.json for a later re-check.",
    },
    {
        "name": "Call of Duty: Black Ops II (Vibe Slops II)",
        "url": "https://vibeslops.luckeysystems.com/",
        "reason": "Offline: the author reports a DMCA takedown from Activision and every game on the site is down. Removed from the catalogue on 2026-10-24.",
    },
]


def main():
    db = json.loads(DB.read_text())
    games = db["games"]

    # Drop entries that are confirmed dead and record why.
    dead_urls = {e["url"] for e in REMOVED}
    games = [g for g in games if g["url"] not in dead_urls]
    excluded = [e for e in db.get("excluded", []) if e["url"] not in dead_urls]

    existing_ids = {g["id"] for g in games}
    by_url = {g["url"].rstrip("/"): g for g in games}
    additions = []
    for raw in NEW_GAMES:
        if raw["id"] in existing_ids or raw["url"].rstrip("/") in by_url:
            continue
        g = dict(raw)
        g["categoryLabel"] = next(c["label"] for c in CATEGORIES if c["id"] == g["category"])
        label, color = STATUS[g["status"]]
        g["statusLabel"] = label
        g["statusColor"] = color
        g["added"] = ADDED
        g["isNew"] = True
        additions.append(g)

    # New finds lead the grid; the curated classics keep their order.
    db["games"] = additions + games
    db["categories"] = CATEGORIES
    db["lastUpdated"] = ADDED
    db["autoDiscovery"] = {
        "script": "scripts/discover-games.mjs",
        "workflow": ".github/workflows/discover-games.yml",
        "report": "data/discoveries.md",
    }
    db["excluded"] = excluded + REMOVED

    DB.write_text(json.dumps(db, indent=2, ensure_ascii=False) + "\n")
    print(f"games: {len(db['games'])} (+{len(additions)}), excluded: {len(db['excluded'])}")


if __name__ == "__main__":
    main()
