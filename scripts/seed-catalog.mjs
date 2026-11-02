#!/usr/bin/env node
/**
 * Rebuilds games.json from the curated port list.
 *
 * The catalogue is deliberately small: it contains ONLY the unofficial PC ports
 * named in the DSOGaming round-up "Super Mario Odyssey Unofficial PC Port
 * Available for Download" (2 November 2026). PORTS is the hand-curated list of
 * games (with original platform, year, studio and an extra search alias), and
 * LINKS maps each game to the download / announcement link used in that article.
 *
 *   node scripts/seed-catalog.mjs     # rewrite games.json from this list
 *
 * games.json stays the single source of truth for the site; this file is just
 * the reproducible seed for the curation.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

const PORTS = [
  {
    "i": "super-mario-odyssey",
    "t": "Super Mario Odyssey",
    "s": "Mario Odyssey",
    "y": 2017,
    "p": "Switch",
    "c": "nintendo",
    "d": "Nintendo EPD",
    "g": "3D platformer",
    "b": "Mario's globe-trotting 3D platform adventure across the kingdoms with Cappy.",
    "l": "here",
    "k": "Featured port",
    "a": [
      "Power Moon Recomp",
      "Super Mario Odyssey PC Port"
    ]
  },
  {
    "i": "mario-kart-wii",
    "t": "Mario Kart Wii",
    "s": "Mario Kart Wii",
    "y": 2008,
    "p": "Wii",
    "c": "nintendo",
    "d": "Nintendo EAD",
    "g": "Kart racer",
    "b": "The Wii kart racer with bikes, tricks and 32 tracks.",
    "l": "Mario Kart Wii",
    "k": "Super Mario ports",
    "a": [
      "Mario Kart Wii PC Port"
    ]
  },
  {
    "i": "super-mario-64",
    "t": "Super Mario 64",
    "s": "Super Mario 64",
    "y": 1996,
    "p": "N64",
    "c": "nintendo",
    "d": "Nintendo EAD",
    "g": "3D platformer",
    "b": "The Nintendo 64 launch platformer that defined 3D camera and movement.",
    "l": "Super Mario 64",
    "k": "Super Mario ports",
    "a": [
      "SM64",
      "Super Mario 64 PC Port"
    ]
  },
  {
    "i": "mario-kart-64",
    "t": "Mario Kart 64",
    "s": "Mario Kart 64",
    "y": 1996,
    "p": "N64",
    "c": "nintendo",
    "d": "Nintendo EAD",
    "g": "Kart racer",
    "b": "Four-player split-screen kart racing with items and rainbow road.",
    "l": "Mario Kart 64",
    "k": "Super Mario ports",
    "a": [
      "SpaghettiKart",
      "MK64"
    ]
  },
  {
    "i": "super-mario-sunshine",
    "t": "Super Mario Sunshine",
    "s": "Mario Sunshine",
    "y": 2002,
    "p": "GameCube",
    "c": "nintendo",
    "d": "Nintendo EAD",
    "g": "3D platformer",
    "b": "Mario's tropical GameCube adventure with the FLUDD water pack.",
    "l": "Super Mario Sunshine",
    "k": "Super Mario ports",
    "a": [
      "SMS Launcher",
      "Super Mario Sunshine PC Port"
    ]
  },
  {
    "i": "super-mario-galaxy",
    "t": "Super Mario Galaxy",
    "s": "Mario Galaxy",
    "y": 2007,
    "p": "Wii",
    "c": "nintendo",
    "d": "Nintendo EAD",
    "g": "3D platformer",
    "b": "Gravity-bending planetary platforming set in orbit.",
    "l": "Super Mario Galaxy",
    "k": "Super Mario ports",
    "a": [
      "Nebula",
      "Super Mario Galaxy PC Port"
    ]
  },
  {
    "i": "super-mario-strikers",
    "t": "Super Mario Strikers",
    "s": "Mario Strikers",
    "y": 2005,
    "p": "GameCube",
    "c": "nintendo",
    "d": "Next Level Games",
    "g": "Sports",
    "b": "Five-a-side arcade football with the Mario cast and no rules.",
    "l": "Super Mario Strikers",
    "k": "Super Mario ports",
    "a": [
      "Mario Strikers",
      "Super Mario Strikers PC Port"
    ]
  },
  {
    "i": "crash-team-racing",
    "t": "Crash Team Racing",
    "s": "Crash Team Racing",
    "y": 1999,
    "p": "PS1",
    "c": "playstation",
    "d": "Naughty Dog",
    "g": "Kart racer",
    "b": "Crash Bandicoot's kart racer with turbo boosts and adventure mode.",
    "l": "Crash Team Racing",
    "k": "Other console ports",
    "a": [
      "CTR",
      "Crash Team Racing PC Port"
    ]
  },
  {
    "i": "forza-horizon-2",
    "t": "Forza Horizon 2",
    "s": "Forza Horizon 2",
    "y": 2014,
    "p": "Xbox 360",
    "c": "xbox",
    "d": "Playground Games",
    "g": "Open-world racer",
    "b": "The open-world Horizon festival racer set in southern Europe.",
    "l": "Forza Horizon 2",
    "k": "Other console ports",
    "a": [
      "Forza Horizon 2 PC Port"
    ]
  },
  {
    "i": "duke-nukem-zero-hour",
    "t": "Duke Nukem: Zero Hour",
    "s": "Duke: Zero Hour",
    "y": 1999,
    "p": "N64",
    "c": "nintendo",
    "d": "Eurocom",
    "g": "First-person shooter",
    "b": "Duke's time-travelling Nintendo 64 shooter.",
    "l": "Duke Nukem: Zero Hour",
    "k": "Other console ports",
    "a": [
      "Duke Nukem Zero Hour PC Port"
    ]
  },
  {
    "i": "ocarina-of-time",
    "t": "The Legend of Zelda: Ocarina of Time",
    "s": "Ocarina of Time",
    "y": 1998,
    "p": "N64",
    "c": "nintendo",
    "d": "Nintendo EAD",
    "g": "Action-adventure",
    "b": "Link's first 3D quest through Hyrule across two time periods.",
    "l": "The Legend of Zelda: Ocarina of Time",
    "k": "Other console ports",
    "a": [
      "Ship of Harkinian",
      "OoT",
      "Zelda 64"
    ]
  },
  {
    "i": "the-wind-waker",
    "t": "The Legend of Zelda: Wind Waker",
    "s": "The Wind Waker",
    "y": 2002,
    "p": "GameCube",
    "c": "nintendo",
    "d": "Nintendo EAD",
    "g": "Action-adventure",
    "b": "The cel-shaded Zelda sailing adventure across the Great Sea.",
    "l": "The Legend of Zelda: Wind Waker",
    "k": "Other console ports",
    "a": [
      "Wind Waker",
      "The Wind Waker PC Port"
    ]
  },
  {
    "i": "majoras-mask",
    "t": "Majora’s Mask",
    "s": "Majora's Mask",
    "y": 2000,
    "p": "N64",
    "c": "nintendo",
    "d": "Nintendo EAD",
    "g": "Action-adventure",
    "b": "Link's dark three-day time-loop adventure in Termina.",
    "l": "Majora’s Mask",
    "k": "Other console ports",
    "a": [
      "The Legend of Zelda: Majora's Mask",
      "Zelda 64: Recompiled",
      "Majora's Mask"
    ]
  },
  {
    "i": "perfect-dark",
    "t": "Perfect Dark",
    "s": "Perfect Dark",
    "y": 2000,
    "p": "N64",
    "c": "nintendo",
    "d": "Rare",
    "g": "First-person shooter",
    "b": "Joanna Dark's sci-fi spy shooter and GoldenEye successor.",
    "l": "Perfect Dark",
    "k": "Other console ports",
    "a": [
      "Perfect Dark PC Port"
    ]
  },
  {
    "i": "call-of-duty-3",
    "t": "Call of Duty 3",
    "s": "Call of Duty 3",
    "y": 2006,
    "p": "Multi",
    "c": "multi",
    "d": "Treyarch",
    "g": "First-person shooter",
    "b": "The console-only WWII campaign through Normandy.",
    "l": "Call of Duty 3",
    "k": "Other console ports",
    "a": [
      "CoD3",
      "Call of Duty 3 PC Port"
    ]
  },
  {
    "i": "jak-and-daxter",
    "t": "Jak & Daxter",
    "s": "Jak & Daxter",
    "y": 2001,
    "p": "PS2",
    "c": "playstation",
    "d": "Naughty Dog",
    "g": "3D platformer",
    "b": "Jak and Daxter's eco-powered platform adventure on the Precursor Legacy.",
    "l": "Jak & Daxter",
    "k": "Other console ports",
    "a": [
      "Jak and Daxter: The Precursor Legacy",
      "OpenGOAL"
    ]
  },
  {
    "i": "the-simpsons-game",
    "t": "The Simpsons Game",
    "s": "The Simpsons Game",
    "y": 2007,
    "p": "Multi",
    "c": "multi",
    "d": "EA Redwood Shores",
    "g": "Action platformer",
    "b": "The self-aware Springfield action game with co-op powers.",
    "l": "The Simpsons Game",
    "k": "Recent months",
    "a": [
      "The Simpsons Game PC Port"
    ]
  },
  {
    "i": "peter-jacksons-king-kong",
    "t": "Peter Jackson’s King Kong",
    "s": "King Kong",
    "y": 2005,
    "p": "Xbox 360",
    "c": "xbox",
    "d": "Ubisoft Montpellier",
    "g": "Action-adventure",
    "b": "The movie tie-in adventure on Skull Island, played as Jack and Kong.",
    "l": "Peter Jackson’s King Kong",
    "k": "Recent months",
    "a": [
      "King Kong Recompiled",
      "King Kong PC Port"
    ]
  },
  {
    "i": "gears-of-war-3",
    "t": "Gears of War 3",
    "s": "Gears of War 3",
    "y": 2011,
    "p": "Xbox 360",
    "c": "xbox",
    "d": "Epic Games",
    "g": "Third-person shooter",
    "b": "The conclusion of the original Gears trilogy against the Lambent.",
    "l": "Gears of War 3",
    "k": "Recent months",
    "a": [
      "Azura",
      "Gears 3 PC Port"
    ]
  },
  {
    "i": "bloodborne",
    "t": "Bloodborne",
    "s": "Bloodborne",
    "y": 2015,
    "p": "PS4",
    "c": "playstation",
    "d": "FromSoftware",
    "g": "Action RPG",
    "b": "The gothic, fast-paced hunter adventure through Yharnam.",
    "l": "Bloodborne",
    "k": "Recent months",
    "a": [
      "Bloodborne PC",
      "bbport",
      "ShadPS4"
    ]
  },
  {
    "i": "virtua-fighter-arcade",
    "t": "Virtua Fighter Arcade",
    "s": "Virtua Fighter",
    "y": 1993,
    "p": "Arcade",
    "c": "arcade",
    "d": "Sega AM2",
    "g": "Fighting",
    "b": "Sega's pioneering 3D arcade fighting game.",
    "l": "Virtua Fighter Arcade",
    "k": "Recent months",
    "a": [
      "Virtua Fighter",
      "VF1 Recomp"
    ]
  },
  {
    "i": "splinter-cell-double-agent",
    "t": "Splinter Cell: Double Agent",
    "s": "Double Agent",
    "y": 2006,
    "p": "Xbox",
    "c": "xbox",
    "d": "Ubisoft",
    "g": "Stealth",
    "b": "Sam Fisher's double-agent stealth thriller.",
    "l": "Splinter Cell: Double Agent",
    "k": "Recent months",
    "a": [
      "SCDA XBE Recomp",
      "Tom Clancy's Splinter Cell: Double Agent"
    ]
  },
  {
    "i": "tekken-6",
    "t": "Tekken 6",
    "s": "Tekken 6",
    "y": 2009,
    "p": "Multi",
    "c": "multi",
    "d": "Bandai Namco",
    "g": "Fighting",
    "b": "The sixth King of Iron Fist tournament with rollback netcode in the port.",
    "l": "Tekken 6",
    "k": "Recent months",
    "a": [
      "Tekken 6 PC Port"
    ]
  },
  {
    "i": "wind-waker-hd",
    "t": "The Legend of Zelda: Wind Waker HD",
    "s": "Wind Waker HD",
    "y": 2013,
    "p": "Wii U",
    "c": "nintendo",
    "d": "Nintendo EAD",
    "g": "Action-adventure",
    "b": "The high-definition Wii U remaster of the Great Sea adventure.",
    "l": "The Legend of Zelda: Wind Waker HD",
    "k": "Recent months",
    "a": [
      "Wind Waker HD Recomp",
      "TWWHD"
    ]
  },
  {
    "i": "breath-of-the-wild",
    "t": "The Legend of Zelda: Breath of the Wild",
    "s": "Breath of the Wild",
    "y": 2017,
    "p": "Wii U",
    "c": "nintendo",
    "d": "Nintendo EPD",
    "g": "Open-world adventure",
    "b": "The open-air Hyrule sandbox that reinvented the series.",
    "l": "The Legend of Zelda: Breath of the Wild",
    "k": "Recent months",
    "a": [
      "BotW",
      "Savage Wind Recomp"
    ]
  },
  {
    "i": "bayonetta-2",
    "t": "Bayonetta 2",
    "s": "Bayonetta 2",
    "y": 2014,
    "p": "Wii U",
    "c": "nintendo",
    "d": "PlatinumGames",
    "g": "Action",
    "b": "The witch's high-speed, combo-heaven sequel.",
    "l": "Bayonetta 2",
    "k": "Recent months",
    "a": [
      "B2 Recomp",
      "Bayonetta 2 PC Port"
    ]
  },
  {
    "i": "metroid-dread",
    "t": "Metroid Dread",
    "s": "Metroid Dread",
    "y": 2021,
    "p": "Switch",
    "c": "nintendo",
    "d": "MercurySteam",
    "g": "Action-adventure",
    "b": "Samus's tense 2D hunt pursued by the E.M.M.I. robots.",
    "l": "Metroid Dread",
    "k": "Recent months",
    "a": [
      "Metroid Dread PC Port"
    ]
  },
  {
    "i": "metroid-prime",
    "t": "Metroid Prime",
    "s": "Metroid Prime",
    "y": 2002,
    "p": "GameCube",
    "c": "nintendo",
    "d": "Retro Studios",
    "g": "First-person adventure",
    "b": "Samus's first-person exploration of Tallon IV.",
    "l": "Metroid Prime",
    "k": "Recent months",
    "a": [
      "MetroidPrimePort",
      "Metroid Prime PC Port"
    ]
  },
  {
    "i": "star-fox",
    "t": "Star Fox",
    "s": "Star Fox",
    "y": 1993,
    "p": "SNES",
    "c": "nintendo",
    "d": "Nintendo EAD / Argonaut",
    "g": "Rail shooter",
    "b": "The Super FX-powered SNES space rail shooter.",
    "l": "PC port of Star Fox",
    "k": "SNES classics",
    "a": [
      "Starwing",
      "Star Fox PC Port"
    ]
  },
  {
    "i": "f-zero",
    "t": "F-Zero",
    "s": "F-Zero",
    "y": 1990,
    "p": "SNES",
    "c": "nintendo",
    "d": "Nintendo EAD",
    "g": "Racing",
    "b": "The ultra-fast futuristic SNES anti-gravity racer.",
    "l": "F-Zero",
    "k": "SNES classics",
    "a": [
      "FZeroRecomp",
      "F-Zero PC Port"
    ]
  },
  {
    "i": "donkey-kong-country",
    "t": "Donkey Kong Country",
    "s": "Donkey Kong Country",
    "y": 1994,
    "p": "SNES",
    "c": "nintendo",
    "d": "Rare",
    "g": "Platformer",
    "b": "The first of the three pre-rendered SNES DK platformers.",
    "l": "three classic SNES Donkey Kong Country games to PC",
    "k": "SNES classics",
    "a": [
      "DKC1 Recomp",
      "DKC"
    ]
  },
  {
    "i": "donkey-kong-country-2",
    "t": "Donkey Kong Country 2: Diddy’s Kong Quest",
    "s": "DKC 2",
    "y": 1995,
    "p": "SNES",
    "c": "nintendo",
    "d": "Rare",
    "g": "Platformer",
    "b": "Diddy and Dixie's rescue mission to Crocodile Isle.",
    "l": "three classic SNES Donkey Kong Country games to PC",
    "k": "SNES classics",
    "a": [
      "DKC2",
      "Diddy's Kong Quest"
    ]
  },
  {
    "i": "donkey-kong-country-3",
    "t": "Donkey Kong Country 3: Dixie Kong’s Double Trouble!",
    "s": "DKC 3",
    "y": 1996,
    "p": "SNES",
    "c": "nintendo",
    "d": "Rare",
    "g": "Platformer",
    "b": "Dixie and Kiddy's third SNES adventure in the Northern Kremisphere.",
    "l": "three classic SNES Donkey Kong Country games to PC",
    "k": "SNES classics",
    "a": [
      "DKC3",
      "Dixie Kong's Double Trouble"
    ]
  },
  {
    "i": "mother-2-earthbound",
    "t": "Mother 2/EarthBound",
    "s": "EarthBound",
    "y": 1994,
    "p": "SNES",
    "c": "nintendo",
    "d": "Ape / HAL Laboratory",
    "g": "RPG",
    "b": "The quirky modern-day SNES role-playing classic.",
    "l": "Mother 2/EarthBound",
    "k": "SNES classics",
    "a": [
      "EarthBound",
      "Mother 2"
    ]
  },
  {
    "i": "scud-race",
    "t": "SCUD RACE",
    "s": "SCUD RACE",
    "y": 1996,
    "p": "Arcade",
    "c": "arcade",
    "d": "Sega AM2",
    "g": "Racing",
    "b": "Sega Model 3 arcade racer, also known as Sega GT Scud Race.",
    "l": "SCUD RACE",
    "k": "Arcade classics",
    "a": [
      "Sega GT Scud Race",
      "Scud Race PC Port"
    ]
  },
  {
    "i": "the-lost-world-jurassic-park",
    "t": "The Lost World: Jurassic Park",
    "s": "The Lost World",
    "y": 1997,
    "p": "Arcade",
    "c": "arcade",
    "d": "Sega AM3",
    "g": "Light-gun shooter",
    "b": "The Model 3 dinosaur light-gun arcade cabinet.",
    "l": "The Lost World: Jurassic Park",
    "k": "Arcade classics",
    "a": [
      "Lost World Jurassic Park PC Port"
    ]
  },
  {
    "i": "time-crisis",
    "t": "Time Crisis",
    "s": "Time Crisis",
    "y": 1995,
    "p": "Arcade",
    "c": "arcade",
    "d": "Namco",
    "g": "Light-gun shooter",
    "b": "Namco's pedal-and-cover arcade shooter.",
    "l": "Time Crisis",
    "k": "Arcade classics",
    "a": [
      "Time Crisis PC Port"
    ]
  },
  {
    "i": "rave-racer",
    "t": "Rave Racer",
    "s": "Rave Racer",
    "y": 1995,
    "p": "Arcade",
    "c": "arcade",
    "d": "Namco",
    "g": "Racing",
    "b": "The Ridge Racer arcade sequel with linked-cabinet racing.",
    "l": "Rave Racer",
    "k": "Arcade classics",
    "a": [
      "Rave Racer PC Port"
    ]
  },
  {
    "i": "time-crisis-2",
    "t": "Time Crisis 2",
    "s": "Time Crisis 2",
    "y": 1997,
    "p": "Arcade",
    "c": "arcade",
    "d": "Namco",
    "g": "Light-gun shooter",
    "b": "Two-player arcade-perfect light-gun action.",
    "l": "Time Crisis 2, and Virtua Fighter 2",
    "k": "Arcade classics",
    "a": [
      "Time Crisis 2 PC Port"
    ]
  },
  {
    "i": "virtua-fighter-2",
    "t": "Virtua Fighter 2",
    "s": "Virtua Fighter 2",
    "y": 1994,
    "p": "Arcade",
    "c": "arcade",
    "d": "Sega AM2",
    "g": "Fighting",
    "b": "Sega's Model 2 texture-mapped 3D fighting sequel.",
    "l": "Time Crisis 2, and Virtua Fighter 2",
    "k": "Arcade classics",
    "a": [
      "VF2",
      "Virtua Fighter 2 PC Port"
    ]
  },
  {
    "i": "gears-of-war",
    "t": "Gears of War",
    "s": "Gears of War",
    "y": 2006,
    "p": "Xbox 360",
    "c": "xbox",
    "d": "Epic Games",
    "g": "Third-person shooter",
    "b": "The cover-based shooter that started the Xbox 360 saga.",
    "l": "Gears of War games from the Xbox 360 era",
    "k": "Xbox 360 era",
    "a": [
      "Gears of War 1",
      "Gears PC Port"
    ]
  },
  {
    "i": "gears-of-war-judgment",
    "t": "Gears of War: Judgment",
    "s": "Gears: Judgment",
    "y": 2013,
    "p": "Xbox 360",
    "c": "xbox",
    "d": "Epic Games / People Can Fly",
    "g": "Third-person shooter",
    "b": "The Baird-focused prequel to the Gears trilogy.",
    "l": "Gears of War games from the Xbox 360 era",
    "k": "Xbox 360 era",
    "a": [
      "Gears Judgment Recomp",
      "Gears of War Judgment PC Port"
    ]
  },
  {
    "i": "god-of-war",
    "t": "God of War",
    "s": "God of War",
    "y": 2005,
    "p": "PS2",
    "c": "playstation",
    "d": "Santa Monica Studio",
    "g": "Action",
    "b": "Kratos's first Greek-mythology revenge epic.",
    "l": "first God of War game",
    "k": "Xbox 360 era",
    "a": [
      "God of War 1",
      "GoW PC Port"
    ]
  },
  {
    "i": "super-smash-bros-brawl",
    "t": "Super Smash Bros. Brawl",
    "s": "Smash Brawl",
    "y": 2008,
    "p": "Wii",
    "c": "nintendo",
    "d": "Sora Ltd. / Nintendo",
    "g": "Fighting",
    "b": "The Wii crossover brawler with Subspace Emissary.",
    "l": "Super Smash Bros. Brawl",
    "k": "Xbox 360 era",
    "a": [
      "Super Smash Decomp",
      "Brawl PC Port"
    ]
  },
  {
    "i": "xenoblade-chronicles-x",
    "t": "Xenoblade Chronicles X: Definitive Edition",
    "s": "Xenoblade X",
    "y": 2025,
    "p": "Switch",
    "c": "nintendo",
    "d": "Monolith Soft",
    "g": "RPG",
    "b": "The giant-mech open-world RPG on planet Mira, remastered for Switch.",
    "l": "Xenoblade Chronicles X: Definitive Edition",
    "k": "Xbox 360 era",
    "a": [
      "Xenoblade X DE",
      "XCX PC Port"
    ]
  },
  {
    "i": "shadow-of-the-colossus",
    "t": "Shadow of the Colossus",
    "s": "Shadow of the Colossus",
    "y": 2018,
    "p": "PS4",
    "c": "playstation",
    "d": "Team Ico / Bluepoint",
    "g": "Action-adventure",
    "b": "The PS4 remake of Wander's quest to fell sixteen colossi.",
    "l": "Shadow of the Colossus",
    "k": "PS4 ports",
    "a": [
      "Shadow of the Colossus PC Port",
      "SotC"
    ]
  },
  {
    "i": "medievil",
    "t": "MediEvil",
    "s": "MediEvil",
    "y": 2019,
    "p": "PS4",
    "c": "playstation",
    "d": "Other Ocean Emeryville",
    "g": "Action-adventure",
    "b": "Sir Dan Fortesque's PS4 remake of the skeleton adventure.",
    "l": "MediEvil",
    "k": "PS4 ports",
    "a": [
      "MediEvil PC Port",
      "MediEvil 2019"
    ]
  },
  {
    "i": "killzone-shadow-fall",
    "t": "Killzone Shadow Fall",
    "s": "Killzone Shadow Fall",
    "y": 2013,
    "p": "PS4",
    "c": "playstation",
    "d": "Guerrilla Games",
    "g": "First-person shooter",
    "b": "The PS4 launch shooter set on a divided Vekta.",
    "l": "Killzone Shadow Fall",
    "k": "PS4 ports",
    "a": [
      "Killzone Shadow Fall PC Port"
    ]
  },
  {
    "i": "driveclub",
    "t": "Driveclub",
    "s": "Driveclub",
    "y": 2014,
    "p": "PS4",
    "c": "playstation",
    "d": "Evolution Studios",
    "g": "Racing",
    "b": "The club-focused PS4 racing game with dynamic weather.",
    "l": "Driveclub",
    "k": "PS4 ports",
    "a": [
      "Driveclub Recomp",
      "Driveclub PC Port"
    ]
  },
  {
    "i": "god-of-war-3-remastered",
    "t": "God of War 3 Remastered",
    "s": "God of War 3",
    "y": 2015,
    "p": "PS4",
    "c": "playstation",
    "d": "Santa Monica Studio",
    "g": "Action",
    "b": "Kratos's PS4-remastered finale against the Greek gods.",
    "l": "God of War 3 Remastered",
    "k": "PS4 ports",
    "a": [
      "SpartanPort",
      "God of War III Remastered"
    ]
  },
  {
    "i": "gran-turismo-sport",
    "t": "Gran Turismo Sport",
    "s": "GT Sport",
    "y": 2017,
    "p": "PS4",
    "c": "playstation",
    "d": "Polyphony Digital",
    "g": "Racing",
    "b": "The esports-focused PS4 driving simulator.",
    "l": "Gran Turismo Sport",
    "k": "PS4 ports",
    "a": [
      "GT Sport PC Port"
    ]
  },
  {
    "i": "uncharted-nathan-drake-collection",
    "t": "Uncharted: The Nathan Drake Collection",
    "s": "Nathan Drake Collection",
    "y": 2015,
    "p": "PS4",
    "c": "playstation",
    "d": "Naughty Dog / Bluepoint",
    "g": "Action-adventure",
    "b": "The remastered first three Nathan Drake adventures.",
    "l": "Uncharted: The Nathan Drake Collection",
    "k": "PS4 ports",
    "a": [
      "Uncharted PC Port",
      "NDC"
    ]
  },
  {
    "i": "the-order-1886",
    "t": "The Order: 1886",
    "s": "The Order 1886",
    "y": 2015,
    "p": "PS4",
    "c": "playstation",
    "d": "Ready at Dawn",
    "g": "Third-person shooter",
    "b": "The alternate-history Victorian PS4 exclusive.",
    "l": "The Order: 1886",
    "k": "PS4 ports",
    "a": [
      "The Order 1886 PC Port"
    ]
  },
  {
    "i": "the-last-guardian",
    "t": "The Last Guardian",
    "s": "The Last Guardian",
    "y": 2016,
    "p": "PS4",
    "c": "playstation",
    "d": "genDESIGN / Team Ico",
    "g": "Action-adventure",
    "b": "The boy-and-Trico puzzle adventure from Team Ico.",
    "l": "The Last Guardian",
    "k": "PS4 ports",
    "a": [
      "TLG PC",
      "The Last Guardian PC Port"
    ]
  },
  {
    "i": "zelda-2-adventure-of-link",
    "t": "Zelda 2: The Adventure of Link",
    "s": "Zelda 2",
    "y": 1987,
    "p": "NES",
    "c": "nintendo",
    "d": "Nintendo EAD",
    "g": "Action RPG",
    "b": "The side-scrolling second Zelda adventure on the NES.",
    "l": "Zelda 2: The Adventure of Link",
    "k": "September 2026",
    "a": [
      "Zelda II: The Adventure of Link",
      "The Adventure of Link"
    ]
  },
  {
    "i": "wet",
    "t": "WET",
    "s": "WET",
    "y": 2009,
    "p": "Multi",
    "c": "multi",
    "d": "Artificial Mind & Movement",
    "g": "Action",
    "b": "Rubi Malone's acrobatic, gun-slinging grindhouse shooter.",
    "l": "WET",
    "k": "September 2026",
    "a": [
      "WET Recomp",
      "WET PC Port"
    ]
  },
  {
    "i": "the-darkness",
    "t": "The Darkness",
    "s": "The Darkness",
    "y": 2007,
    "p": "Multi",
    "c": "multi",
    "d": "Starbreeze Studios",
    "g": "First-person shooter",
    "b": "Jackie Estacado's supernatural mobster shooter.",
    "l": "The Darkness",
    "k": "September 2026",
    "a": [
      "Estacado",
      "The Darkness PC Port"
    ]
  },
  {
    "i": "spider-man-edge-of-time",
    "t": "Spider-Man: Edge of Time",
    "s": "Spider-Man: Edge of Time",
    "y": 2011,
    "p": "Multi",
    "c": "multi",
    "d": "Beenox",
    "g": "Action-adventure",
    "b": "Two Spider-Men, two timelines and one broken continuum.",
    "l": "Spider-Man: Edge of Time",
    "k": "September 2026",
    "a": [
      "Edge of Time Recomp"
    ]
  },
  {
    "i": "mercenaries",
    "t": "Mercenaries",
    "s": "Mercenaries",
    "y": 2005,
    "p": "Multi",
    "c": "multi",
    "d": "Pandemic Studios",
    "g": "Open-world action",
    "b": "The open-world mercenary sandbox in a fictional North Korea.",
    "l": "Mercenaries",
    "k": "September 2026",
    "a": [
      "Mercenaries: Playground of Destruction",
      "Mercenaries Recompiled"
    ]
  },
  {
    "i": "gta-liberty-city-stories",
    "t": "GTA: Liberty City Stories",
    "s": "Liberty City Stories",
    "y": 2005,
    "p": "PS2",
    "c": "playstation",
    "d": "Rockstar Leeds",
    "g": "Open-world action",
    "b": "Toni Cipriani's prequel story in Liberty City.",
    "l": "GTA: Liberty City Stories",
    "k": "September 2026",
    "a": [
      "Grand Theft Auto: Liberty City Stories",
      "LCS PC Port"
    ]
  },
  {
    "i": "fable-2",
    "t": "Fable 2",
    "s": "Fable 2",
    "y": 2008,
    "p": "Xbox 360",
    "c": "xbox",
    "d": "Lionhead Studios",
    "g": "RPG",
    "b": "The Albion role-playing sequel with a canine companion.",
    "l": "Fable 2",
    "k": "September 2026",
    "a": [
      "Fable II",
      "Fable 2 Recomp"
    ]
  },
  {
    "i": "burnout-revenge",
    "t": "Burnout Revenge",
    "s": "Burnout Revenge",
    "y": 2005,
    "p": "Multi",
    "c": "multi",
    "d": "Criterion Games",
    "g": "Racing",
    "b": "Aggressive takedown racing with traffic checking.",
    "l": "Burnout Revenge",
    "k": "September 2026",
    "a": [
      "Xerenge",
      "Burnout Revenge PC Port"
    ]
  },
  {
    "i": "lost-odyssey",
    "t": "Lost Odyssey",
    "s": "Lost Odyssey",
    "y": 2007,
    "p": "Xbox 360",
    "c": "xbox",
    "d": "Mistwalker / Feelplus",
    "g": "RPG",
    "b": "Hironobu Sakaguchi's turn-based RPG about an immortal king.",
    "l": "Lost Odyssey",
    "k": "September 2026",
    "a": [
      "Lost Odyssey Recomp",
      "Lost Odyssey PC Port"
    ]
  },
  {
    "i": "mario-party-4",
    "t": "Mario Party 4",
    "s": "Mario Party 4",
    "y": 2002,
    "p": "GameCube",
    "c": "nintendo",
    "d": "Hudson Soft",
    "g": "Party",
    "b": "The first GameCube Mario Party board-game collection.",
    "l": "Mario Party 4",
    "k": "2026 round-up",
    "a": [
      "Mario Party 4 PC Port"
    ]
  },
  {
    "i": "sonic-unleashed",
    "t": "Sonic Unleashed",
    "s": "Sonic Unleashed",
    "y": 2008,
    "p": "Multi",
    "c": "multi",
    "d": "Sonic Team",
    "g": "Platformer",
    "b": "Daytime speed stages and night-time Werehog brawling.",
    "l": "Sonic Unleashed",
    "k": "2026 round-up",
    "a": [
      "Unleashed Recompiled",
      "Sonic Unleashed PC Port"
    ]
  },
  {
    "i": "goldeneye-007",
    "t": "GoldenEye 007",
    "s": "GoldenEye 007",
    "y": 1997,
    "p": "N64",
    "c": "nintendo",
    "d": "Rare",
    "g": "First-person shooter",
    "b": "The Nintendo 64 Bond shooter that defined console multiplayer.",
    "l": "GoldenEye 007",
    "k": "2026 round-up",
    "a": [
      "Project Midas",
      "GoldenEye 007 PC Port"
    ]
  },
  {
    "i": "twilight-princess",
    "t": "The Legend of Zelda: Twilight Princess",
    "s": "Twilight Princess",
    "y": 2006,
    "p": "GameCube",
    "c": "nintendo",
    "d": "Nintendo EAD",
    "g": "Action-adventure",
    "b": "Link's darker, wolf-shaped adventure across a twilit Hyrule.",
    "l": "The Legend of Zelda: Twilight Princess",
    "k": "2026 round-up",
    "a": [
      "Dusklight",
      "Twilight Princess PC Port"
    ]
  },
  {
    "i": "silent-hill",
    "t": "Silent Hill",
    "s": "Silent Hill",
    "y": 1999,
    "p": "PS1",
    "c": "playstation",
    "d": "Team Silent / Konami",
    "g": "Survival horror",
    "b": "The fog-bound PS1 survival horror classic.",
    "l": "Silent Hill",
    "k": "2026 round-up",
    "a": [
      "Silent Hill Decomp",
      "Silent Hill 1 PC Port"
    ]
  },
  {
    "i": "gears-of-war-2",
    "t": "Gears of War 2",
    "s": "Gears of War 2",
    "y": 2008,
    "p": "Xbox 360",
    "c": "xbox",
    "d": "Epic Games",
    "g": "Third-person shooter",
    "b": "The Locust Horde sequel with the giant worm and horde mode roots.",
    "l": "Gears of War 2",
    "k": "July 2026",
    "a": [
      "Gears 2 PC Port"
    ]
  },
  {
    "i": "syphon-filter",
    "t": "Syphon Filter",
    "s": "Syphon Filter",
    "y": 1999,
    "p": "PS1",
    "c": "playstation",
    "d": "Eidetic",
    "g": "Third-person shooter",
    "b": "Gabe Logan's stealth-action PS1 classic.",
    "l": "Syphon Filter",
    "k": "July 2026",
    "a": [
      "Syphon Filter PC Port"
    ]
  },
  {
    "i": "diddy-kong-racing",
    "t": "Diddy Kong Racing",
    "s": "Diddy Kong Racing",
    "y": 1997,
    "p": "N64",
    "c": "nintendo",
    "d": "Rare",
    "g": "Kart racer",
    "b": "Rare's adventure-style kart racer with planes and hovercrafts.",
    "l": "Diddy Kong Racing",
    "k": "August 2026",
    "a": [
      "DKR-R",
      "Diddy Kong Racing PC Port"
    ]
  },
  {
    "i": "ace-combat-6",
    "t": "Ace Combat 6",
    "s": "Ace Combat 6",
    "y": 2007,
    "p": "Xbox 360",
    "c": "xbox",
    "d": "Project Aces",
    "g": "Flight combat",
    "b": "The Xbox 360 aerial combat epic, Fires of Liberation.",
    "l": "Ace Combat 6",
    "k": "August 2026",
    "a": [
      "AC6 Recomp",
      "Ace Combat 6: Fires of Liberation"
    ]
  },
  {
    "i": "wave-race-64",
    "t": "Wave Race 64",
    "s": "Wave Race 64",
    "y": 1996,
    "p": "N64",
    "c": "nintendo",
    "d": "Nintendo EAD",
    "g": "Racing",
    "b": "Jet-ski racing with wave physics on the Nintendo 64.",
    "l": "Wave Race 64",
    "k": "2026 round-up",
    "a": [
      "Wave Race 64 PC Port"
    ]
  },
  {
    "i": "blue-dragon",
    "t": "Blue Dragon",
    "s": "Blue Dragon",
    "y": 2006,
    "p": "Xbox 360",
    "c": "xbox",
    "d": "Mistwalker / Artoon",
    "g": "RPG",
    "b": "Hironobu Sakaguchi and Akira Toriyama's turn-based Xbox 360 RPG.",
    "l": "Blue Dragon",
    "k": "2026 round-up",
    "a": [
      "reblue",
      "Blue Dragon PC Port"
    ]
  },
  {
    "i": "pikmin",
    "t": "Pikmin",
    "s": "Pikmin",
    "y": 2001,
    "p": "GameCube",
    "c": "nintendo",
    "d": "Nintendo EAD",
    "g": "Strategy",
    "b": "Captain Olimar's real-time plant-creature puzzle adventure.",
    "l": "Pikmin",
    "k": "2026 round-up",
    "a": [
      "Open Nectar",
      "Pikmin PC Port"
    ]
  },
  {
    "i": "ninja-gaiden-2",
    "t": "Ninja Gaiden 2",
    "s": "Ninja Gaiden 2",
    "y": 2008,
    "p": "Xbox 360",
    "c": "xbox",
    "d": "Team Ninja",
    "g": "Action",
    "b": "Ryu Hayabusa's brutal, high-speed Xbox 360 ninja sequel.",
    "l": "Ninja Gaiden 2",
    "k": "2026 round-up",
    "a": [
      "Ninja Gaiden II",
      "Ninja Gaiden 2 PC Port"
    ]
  },
  {
    "i": "super-smash-bros-ultimate",
    "t": "Super Smash Bros. Ultimate",
    "s": "Smash Ultimate",
    "y": 2018,
    "p": "Switch",
    "c": "nintendo",
    "d": "Bandai Namco / Sora Ltd.",
    "g": "Fighting",
    "b": "The everyone-is-here Switch crossover fighter.",
    "l": "Super Smash Bros. Ultimate",
    "k": "2026 round-up",
    "a": [
      "SSBU Recomp",
      "Smash Ultimate PC Port"
    ]
  },
  {
    "i": "super-paper-mario",
    "t": "Super Paper Mario",
    "s": "Super Paper Mario",
    "y": 2007,
    "p": "Wii",
    "c": "nintendo",
    "d": "Intelligent Systems",
    "g": "RPG",
    "b": "The dimension-flipping Wii Paper Mario adventure.",
    "l": "Super Paper Mario",
    "k": "2026 round-up",
    "a": [
      "New Super Paper Bros",
      "Super Paper Mario PC Port"
    ]
  },
  {
    "i": "tekken-3",
    "t": "Tekken 3",
    "s": "Tekken 3",
    "y": 1997,
    "p": "PS1",
    "c": "playstation",
    "d": "Namco",
    "g": "Fighting",
    "b": "The arcade-to-PS1 fighting classic with Tekken Force.",
    "l": "Tekken 3",
    "k": "2026 round-up",
    "a": [
      "Tekken 3 PC Port"
    ]
  }
];

const LINKS = {
  "here": "https://gitlab.com/zzzarathustra-dev/power-moon-recomp",
  "Mario Kart Wii": "https://www.dsogaming.com/news/unofficial-native-pc-versions-of-tekken-3-mario-kart-wii-and-pokemon-crystal-released/",
  "Super Mario 64": "https://www.dsogaming.com/news/super-mario-64-pc-with-ray-tracing-is-now-available-for-download/",
  "Mario Kart 64": "https://www.dsogaming.com/news/an-unofficial-pc-port-of-mario-kart-64-is-now-available-for-download/",
  "Super Mario Sunshine": "https://www.dsogaming.com/news/super-mario-sunshine-unofficial-native-pc-port-released/",
  "Super Mario Galaxy": "https://www.dsogaming.com/news/super-mario-galaxy-unofficial-pc-port-available-for-download/",
  "Super Mario Strikers": "https://www.dsogaming.com/news/unofficial-pc-version-of-nintendo-gamecubes-super-mario-strikers-released/",
  "Crash Team Racing": "https://www.dsogaming.com/news/modders-bring-crash-team-racing-to-pc-with-60fps-and-online-multiplayer-support/",
  "Forza Horizon 2": "https://www.dsogaming.com/news/forza-horizon-2-pc-port-is-here-and-it-looks-absolutely-gorgeous/",
  "Duke Nukem: Zero Hour": "https://www.dsogaming.com/news/duke-nukem-zero-hour-unofficial-pc-port-released/",
  "The Legend of Zelda: Ocarina of Time": "https://www.dsogaming.com/news/the-second-unofficial-pc-port-of-the-legend-of-zelda-ocarina-of-time-is-available-for-download/",
  "The Legend of Zelda: Wind Waker": "https://www.dsogaming.com/news/the-legend-of-zelda-wind-waker-unofficial-pc-port-released/",
  "Majora’s Mask": "https://www.dsogaming.com/news/the-second-unofficial-pc-port-for-the-legend-of-zelda-majoras-mask-has-been-released-for-free/",
  "Perfect Dark": "https://www.dsogaming.com/news/an-unofficial-pc-port-of-nintendo-64s-perfect-dark-is-available-for-download-featuring-mouselook-widescreen-fov-60fps-support/",
  "Call of Duty 3": "https://www.dsogaming.com/news/console-exclusive-call-of-duty-3-has-been-ported-to-pc/",
  "Jak & Daxter": "https://www.dsogaming.com/news/the-unofficial-pc-port-of-jak-daxter-now-supports-online-and-local-multiplayer/",
  "The Simpsons Game": "https://www.dsogaming.com/news/the-simpsons-game-unofficial-pc-port-released/",
  "Peter Jackson’s King Kong": "https://www.dsogaming.com/news/peter-jacksons-king-kong-xbox-360-version-gets-an-unofficial-native-pc-port/",
  "Gears of War 3": "https://www.dsogaming.com/news/gears-of-war-3-gets-unofficial-pc-port-available-for-download/",
  "Bloodborne": "https://www.dsogaming.com/news/bloodborne-unofficial-native-pc-port-available-now-for-download/",
  "Virtua Fighter Arcade": "https://www.dsogaming.com/news/virtua-fighter-arcade-perfect-pc-port-available-for-download/",
  "Splinter Cell: Double Agent": "https://www.dsogaming.com/news/splinter-cell-double-agent-xbox-version-gets-an-unofficial-native-pc-port/",
  "Tekken 6": "https://www.dsogaming.com/news/tekken-6-gets-unofficial-pc-port-with-online-multiplayer-rollback-netcode/",
  "The Legend of Zelda: Wind Waker HD": "https://github.com/ZeldaWWHDRecomp/ZeldaWWHDRecomp",
  "The Legend of Zelda: Breath of the Wild": "https://www.dsogaming.com/news/the-legend-of-zelda-breath-of-the-wild-unofficial-pc-port-released/",
  "Bayonetta 2": "https://www.dsogaming.com/news/bayonetta-2-unofficial-pc-port-available-for-download/",
  "Metroid Dread": "https://www.dsogaming.com/news/metroid-dread-unofficial-pc-port-available-for-download/",
  "Metroid Prime": "https://www.dsogaming.com/news/metroid-prime-unofficial-native-pc-port-available-for-download/",
  "PC port of Star Fox": "https://www.dsogaming.com/news/unofficial-pc-version-of-classic-snes-game-star-fox-released/",
  "F-Zero": "https://github.com/craigshaw/FZeroRecomp",
  "three classic SNES Donkey Kong Country games to PC": "https://www.dsogaming.com/news/classic-snes-donkey-kong-country-trilogy-gets-unofficial-pc-ports/",
  "Mother 2/EarthBound": "https://www.dsogaming.com/news/snes-classic-earthbound-gets-unofficial-pc-port/",
  "SCUD RACE": "https://www.dsogaming.com/news/classic-model-3-arcade-racer-scud-race-gets-unofficial-pc-port/",
  "The Lost World: Jurassic Park": "https://www.dsogaming.com/news/the-lost-world-jurassic-park-arcade-gets-unofficial-pc-port-featuring-ray-tracing-new-weather-dlaa-and-new-game-modes/",
  "Time Crisis": "https://www.dsogaming.com/news/time-crisis-arcade-perfect-pc-port-is-now-available-for-download/",
  "Rave Racer": "https://www.dsogaming.com/news/rave-racer-arcade-perfect-pc-port-is-now-available-for-download/",
  "Time Crisis 2, and Virtua Fighter 2": "https://www.dsogaming.com/news/time-crisis-2-virtua-fighter-2-arcade-perfect-pc-ports-released/",
  "Gears of War games from the Xbox 360 era": "https://www.dsogaming.com/news/all-xbox-360-classic-gears-of-war-games-have-been-ported-to-pc/",
  "first God of War game": "https://www.dsogaming.com/news/the-first-classic-god-of-war-game-has-been-ported-to-pc/",
  "Super Smash Bros. Brawl": "https://www.dsogaming.com/news/super-smash-bros-brawl-unofficial-pc-port-released/",
  "Xenoblade Chronicles X: Definitive Edition": "https://www.dsogaming.com/news/xenoblade-chronicles-x-definitive-edition-gets-unofficial-pc-port/",
  "Shadow of the Colossus": "https://www.dsogaming.com/news/shadow-of-the-colossus-ps4-remake-gets-unofficial-pc-port/",
  "MediEvil": "https://www.dsogaming.com/news/medievil-ps4-remake-gets-unofficial-pc-port/",
  "Killzone Shadow Fall": "https://www.dsogaming.com/news/killzone-shadowfall-unofficial-pc-port-available-for-download/",
  "Driveclub": "https://www.dsogaming.com/news/ps4-exclusive-driveclub-gets-an-unofficial-pc-port/",
  "God of War 3 Remastered": "https://www.dsogaming.com/news/god-of-war-3-remastered-unofficial-pc-port-released/",
  "Gran Turismo Sport": "https://www.dsogaming.com/news/gran-turismo-sport-unofficial-pc-port-available-for-download/",
  "Uncharted: The Nathan Drake Collection": "https://www.dsogaming.com/news/uncharted-the-nathan-drake-collection-unofficial-pc-port-released/",
  "The Order: 1886": "https://www.dsogaming.com/news/ps4-exclusive-the-order-1886-gets-an-unofficial-pc-port/",
  "The Last Guardian": "https://www.dsogaming.com/news/the-last-guardian-just-got-an-unofficial-pc-port/",
  "Zelda 2: The Adventure of Link": "https://www.dsogaming.com/news/zelda-ii-the-adventure-of-link-unofficial-pc-hd-remake-released/",
  "WET": "https://www.dsogaming.com/news/console-exclusive-wet-gets-unofficial-pc-port/",
  "The Darkness": "https://www.dsogaming.com/news/the-darkness-unofficial-pc-port-released/",
  "Spider-Man: Edge of Time": "https://www.dsogaming.com/news/unofficial-pc-version-of-spider-man-edge-of-time-released/",
  "Mercenaries": "https://www.dsogaming.com/news/console-exclusive-mercenaries-unofficial-pc-port-released/",
  "GTA: Liberty City Stories": "https://www.dsogaming.com/news/gta-liberty-city-stories-unofficial-pc-port-released/",
  "Fable 2": "https://www.dsogaming.com/news/fable-2-unofficial-native-pc-port-available-for-download/",
  "Burnout Revenge": "https://www.dsogaming.com/news/burnout-revenge-ace-combat-5-and-midnight-club-los-angeles-get-unofficial-pc-ports/",
  "Lost Odyssey": "https://www.dsogaming.com/news/unofficial-pc-version-of-xbox-360-classic-lost-odyssey-released/",
  "Mario Party 4": "https://www.dsogaming.com/news/mario-party-4-unofficial-native-pc-port-released/",
  "Sonic Unleashed": "https://www.dsogaming.com/news/download-and-play-an-unofficial-pc-port-of-sonic-unleashed/",
  "GoldenEye 007": "https://www.dsogaming.com/news/unofficial-pc-version-for-goldeneye-007-remaster-released/",
  "The Legend of Zelda: Twilight Princess": "https://www.dsogaming.com/mods/the-legend-of-zelda-twilight-princess-pc-update-1-4-0-released/",
  "Silent Hill": "https://www.dsogaming.com/news/unofficial-native-pc-version-of-silent-hill-1999-released/",
  "Gears of War 2": "https://www.dsogaming.com/news/gears-of-war-2-gets-unofficial-pc-port-available-for-download/",
  "Syphon Filter": "https://www.dsogaming.com/news/ps1-classic-syphon-filter-gets-an-unofficial-pc-port/",
  "Diddy Kong Racing": "https://www.dsogaming.com/news/diddy-kong-racing-gets-unofficial-pc-port-available-for-download/",
  "Ace Combat 6": "https://www.dsogaming.com/news/unofficial-native-pc-version-of-ace-combat-6-released/",
  "Wave Race 64": "https://www.dsogaming.com/news/unofficial-pc-version-of-wave-race-64-available-for-download/",
  "Blue Dragon": "https://www.dsogaming.com/news/unofficial-native-pc-version-of-blue-dragon-available-for-download/",
  "Pikmin": "https://www.dsogaming.com/news/nintendo-gamecube-classic-pikmin-gets-an-unofficial-pc-version/",
  "Ninja Gaiden 2": "https://www.dsogaming.com/news/unofficial-pc-version-of-ninja-gaiden-2-released/",
  "Super Smash Bros. Ultimate": "https://www.dsogaming.com/news/super-smash-bros-ultimate-unofficial-pc-port-released/",
  "Super Paper Mario": "https://github.com/josiahg2502-glitch/NewSuperPaperBros",
  "Tekken 3": "https://www.dsogaming.com/news/unofficial-native-pc-versions-of-tekken-3-mario-kart-wii-and-pokemon-crystal-released/"
};

const CATEGORIES = [
  { id: 'nintendo', label: 'Nintendo Consoles', emoji: '🎮' },
  { id: 'playstation', label: 'PlayStation Consoles', emoji: '💙' },
  { id: 'xbox', label: 'Xbox Consoles', emoji: '🟢' },
  { id: 'arcade', label: 'Arcade & Sega', emoji: '🕹️' },
  { id: 'multi', label: 'Multi-platform', emoji: '🌐' },
];

const LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

function sourceName(url) {
  if (url.startsWith('https://gitlab.com/')) return 'GitLab';
  if (url.startsWith('https://github.com/')) return 'GitHub';
  return 'DSOGaming';
}

function sourceLabel(url) {
  if (url.startsWith('https://gitlab.com/')) return 'the GitLab project page';
  if (url.startsWith('https://github.com/')) return 'the GitHub project page';
  return 'the DSOGaming port announcement';
}

/** Extra, searchable words for the card filter. */
function tagsFor(p) {
  return [
    p.t,
    p.g,
    p.p,
    p.c === 'nintendo' ? 'Nintendo' : p.c === 'playstation' ? 'PlayStation' : p.c === 'xbox' ? 'Xbox' : p.c === 'arcade' ? 'Arcade Sega Namco' : 'Multi-platform',
    p.k,
    'Unofficial PC Port',
    'Native Port',
    'Decompilation',
    'Recompilation',
    'Own Game Files',
    '2026 Port Round-up',
    ...(p.a || []),
  ];
}

/** Varied, factual closing lines so 79 cards don't all read the same. */
const DESC_CLOSERS = [
  (p) => `A ${p.y} ${p.p} release, rebuilt to run as a native desktop program rather than under an emulator.`,
  (p) => `Originally released for ${p.p} in ${p.y}; the PC build runs the game's code directly on your machine.`,
  (p) => `The ${p.p} classic is recompiled for PC, with display and input options handled by the port itself.`,
  (p) => `One of the round-up's ${p.p} ports: community-built code, with the game data supplied by you.`,
  (p) => `A fan-built native port of the ${p.y} ${p.p} original, with no emulation layer.`,
  (p) => `${p.p} owners get a desktop build that runs the original game logic natively.`,
];

/** Platform-specific, honestly hedged control notes. */
function controlsFor(p) {
  if (p.c === 'arcade') return 'Arcade inputs are usually mapped to keyboard, mouse and gamepads; on light-gun titles the mouse handles aiming. The linked page lists the exact bindings and supported hardware.';
  if (['Wii', 'Switch', 'GameCube', 'Wii U'].includes(p.p)) return 'Keyboard/mouse and common gamepads are typically supported, with pointer-style controls mapped to the mouse or right stick. Check the linked page for exact bindings.';
  if (['N64', 'SNES', 'NES'].includes(p.p)) return 'Keyboard/mouse and gamepad support replace the original controller, with remappable bindings and PC-side display options. The linked page lists the exact controls.';
  if (['PS1', 'PS2', 'PS4', 'Xbox', 'Xbox 360'].includes(p.p)) return 'Gamepads and keyboard/mouse are generally supported with remappable bindings, plus PC display and graphics options. The linked page lists the exact controls.';
  return 'Controls, display and graphics options are configured in the port itself; the linked page lists the exact key bindings and supported hardware.';
}

function game(p, i) {
  const url = LINKS[p.l];
  if (!url) throw new Error(`no source link for ${p.t}`);
  const source = sourceLabel(url);
  const entry = {
    id: p.i,
    title: p.t,
    shortTitle: p.s,
    url,
    source,
    sourceLabel: sourceName(url),
    cover: `assets/covers/${p.i}.jpg`,
    category: p.c,
    categoryLabel: LABELS[p.c],
    year: p.y,
    platform: p.p,
    section: p.k,
    dev: `Original: ${p.d} · Port: community project`,
    engine: 'Native PC port / static recompilation',
    status: 'files',
    statusLabel: 'Own game files',
    statusColor: '#a855f7',
    badge: 'UNOFFICIAL PC PORT',
    desc: `${p.b} ${DESC_CLOSERS[i % DESC_CLOSERS.length](p)}`,
    controls: controlsFor(p),
    goodToKnow: `Unofficial fan project, not affiliated with or endorsed by the rights holders. You need your own legally dumped copy of ${p.t} — no game data is bundled with the port or this site, and there is no workaround: without the original assets the port cannot start. The link opens ${source}, where the download and setup requirements are published.`,
    tags: tagsFor(p),
    alsoKnownAs: p.a || [],
    added: '2026-11-02',
  };

  // The round-up opens with the full setup walkthrough for this one port.
  if (p.i === 'super-mario-odyssey') {
    entry.title = 'Super Mario Odyssey';
    entry.desc = "Mario's globe-trotting 3D platform adventure now runs natively on PC through Power Moon Recomp: the full campaign at up to 60 FPS, internal resolution up to 4x, FSR, keyboard/mouse and controller support, and a built-in Mods tab.";
    entry.controls = 'Keyboard and mouse with remappable bindings, or a controller with right-stick camera. F1 / Esc (or Home / Guide on a pad) opens the built-in menu; F11 or Alt+Enter toggles fullscreen.';
    entry.goodToKnow = 'Requires your own copy of Super Mario Odyssey, version 1.0.0 only — no updates. On the first run you point the setup at your dumped game files; it validates them, copies what it needs and builds the PC version once. After that the game starts straight away. Saves, settings and the shader cache live in the port’s own files. Unofficial project, not affiliated with Nintendo.';
  }
  return entry;
}

const db = {
  games: PORTS.map(game),
  categories: CATEGORIES,
  excluded: [],
  featured: 'super-mario-odyssey',
  lastUpdated: '2026-11-02',
  provenance: {
    title: 'Super Mario Odyssey Unofficial PC Port Available for Download',
    publisher: 'DSOGaming',
    published: '2026-11-02',
    url: 'https://www.dsogaming.com/news/super-mario-odyssey-unofficial-pc-port-available-for-download/',
    note: 'The catalogue contains only the games named in this round-up. A few articles cover more than one port, so some links legitimately repeat. Every link was checked on 2026-11-02; where the round-up linked to the wrong game or to a follow-up patch article, the port project page or the original port announcement is used instead.',
  },
};

fs.writeFileSync(
  path.join(ROOT, 'games.json'),
  JSON.stringify(db, null, 2) + '\n'
);
console.log(`wrote games.json — ${db.games.length} games`);
