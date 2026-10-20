# Established Code Patterns & Conventions

## 1. Sprite Chroma-Keying & Opaque Silhouette Protection
- All loaded PNG sprites pass through `cleanSpriteImage(img)` in `src/renderer/pixelOverlayRenderer.js`.
- Only edge-connected background pixels (solid black `#000000` or checkerboard grey/white) are Flood-Fill cleared to `alpha = 0`, while interior armor/clothing pixels are forced to `alpha = 255` so characters never appear semi-transparent against bright battlefields.

## 2. Cached Bonus Computation (`computeTotalBonuses`)
- `engine.computeTotalBonuses()` aggregates 10 layers of stats (Buildings, Equipped Gear + Blacksmith `+1..+15`, 6 Diablo Green Sets, 13 Province Governors, Faction Resonance, Lineup Synergy Bonds, Captured Minion Troops, Ascension Tiers, HUD Military Training, 15 Combat Talents, and 8 Hero Bonds) and caches the result for `0.4s` (or until `rebuildPlayerArmy()` forces a refresh) to keep the 60fps loop allocation-free.

## 3. Window Mode Synchronization (`syncWindowMode`)
- Whenever `activeTab` changes between `null` (Battle Mode) and a tab name (`generals`, `gear`, `town`, `provinces`, `roadmap`), `syncWindowMode()` calls `window.desktopAPI.setWindowMode('battle' | 'expanded')` so Electron resizes the overlay window smoothly.
