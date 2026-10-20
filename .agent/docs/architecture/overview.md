# System Architecture Overview

## 1. High-Level Architecture

```mermaid
flowchart TB
  subgraph ElectronShell["Electron Desktop Overlay Shell (electron/main.cjs)"]
    Win["Frameless Transparent BrowserWindow (Always-On-Top)"]
    IPC["IPC Bridge (preload.cjs: setWindowMode, setIgnoreMouseEvents)"]
  end

  subgraph FrontendUI["Deskrawl HUD & Modal Windows (index.html, src/main.js, src/styles.css)"]
    LeftHUD["Bottom-Left: Split HP/Rage Globe + Potion + 4 Skills + EXP Bar"]
    CenterHUD["Bottom-Center: Diablo Gothic Boss HP Bar"]
    RightHUD["Bottom-Right: T1-T10 Skull/Crown Bar (💀 💀 💀 👑) + Icon Tray"]
    Modals["Floating Windows: 3-Col Generals Book / Diablo Paperdoll & Compare / 5-Tier Talent Tree"]
  end

  subgraph CoreEngine["60FPS Game Engine (src/engine/gameEngine.js)"]
    WaveMgr["4-Wave Boss Spawner & Town Outpost Mode"]
    CombatLoop["Grounded Melee AI, Progressive Cleave, 1v1 Duels & Skill Runes"]
    LootSys["Diablo Loot Fountain, Blacksmith +15, Set Forge, Skull Gamble & Soul Shards"]
    BonusCalc["Unified Stat Calculator (Gear + Sets + 13 Provinces + 15 Talents + 8 Hero Bonds)"]
  end

  subgraph Renderer["2D Pixel Art & VFX Renderer (src/renderer/pixelOverlayRenderer.js)"]
    Chroma["Auto Chroma-Key Sprite Cleaner (cleanSpriteImage)"]
    StageRender["Parallax Battlefield & Interactive Town NPC Stalls"]
    LootRender["Diablo Vertical Light Beams & Stacked Item Labels"]
  end

  Win --> IPC
  IPC --> FrontendUI
  FrontendUI <--> CoreEngine
  CoreEngine --> Renderer
```

## 2. Core Modules

| File | Responsibility |
| :--- | :--- |
| `electron/main.cjs` | Creates the transparent taskbar-docked window, handles `battle` (`215px`) vs `expanded` (`640px`) resizing, and manages click-through hit testing. |
| `src/data/threeKingdomsData.js` | Master database of 60 Generals, 10 Campaign Stages, 6 Equipment Sets, 6 Skill Runes, 13 Provinces, 15 Combat Talents, and 8 Hero Bonds. |
| `src/engine/gameEngine.js` | Complete game state, combat physics, wave spawning, Boss timers, loot generation, Blacksmith crafting, and `localStorage` persistence. |
| `src/renderer/pixelOverlayRenderer.js` | HTML5 Canvas 2D renderer for 4-frame character animations, VFX sprite sheets, Town Outpost stalls, and Diablo loot beams. |
| `src/main.js` | Binds DOM events, updates the 60fps Deskrawl HUD, and renders the 5 modal tabs. |
| `src/styles.css` | Authentic Deskrawl / Diablo dark-bronze and parchment styling. |
