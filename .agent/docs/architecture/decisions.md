# Architecture Decision Records (ADR)

## ADR-001: Deskrawl Flush Bottom-of-Screen Road & Overlay HUD
- **Date:** 2026-10-20
- **Status:** Accepted
- **Context:** Earlier iterations used a separate solid bar below the road, pushing characters up and making the UI feel disconnected from *Deskrawl: Idle ARPG*.
- **Decision:** Set `playH = H` and `groundY = H - 20` in `pixelOverlayRenderer.js` so the road sits flush at the bottom of the screen, and overlay the 3 HUD clusters (Left Split Globe + Skills, Center Boss HP Bar, Right Skull/Crown Bar + Icon Tray) directly over the road edges.
- **Consequences:** Matches Deskrawl's exact visual layout and maximizes battlefield visibility.

## ADR-002: 4-Checkpoint Boss Wave Structure (`💀 ━━ 💀 ━━ 💀 ━━ 👑`)
- **Date:** 2026-10-20
- **Status:** Accepted
- **Context:** Fighting 10 waves of nameless soldiers before seeing a Boss felt repetitive and lacked immediate ARPG excitement.
- **Decision:** Every stage in `CAMPAIGN_STAGES` now has `wavesPerBoss: 4`. Waves 1–3 spawn a giant named Sub-Boss General (`💀 [TIÊN PHONG] / [TẢ QUÂN] / [HỮU QUÂN]`) right on screen (`x = 477`), and Wave 4 spawns the Stage Chief Boss (`👑 [CHỦ SOÁI]`). Players can click any `💀` or `👑` node on the progress bar to jump directly to that Boss wave.
- **Consequences:** A named Boss with a center-bottom Diablo HP bar is always on screen within 1 second.

## ADR-003: Diablo Paperdoll + Side-by-Side Item Comparison + Skull Gambling
- **Date:** 2026-10-20
- **Status:** Accepted
- **Context:** Players needed an intuitive way to compare dropped loot with equipped items and spend Boss Skulls (`💀`).
- **Decision:** Implemented a 2-panel Gear window matching Deskrawl Screenshots #6 & #7: Left side displays side-by-side `Equipped` vs `Selected` item tooltip cards with green/red stat diffs (`+X ▲ / -X ▼`), Blacksmith `+1..+15` enhancement, and Skull Gambling (`3💀 / 8💀 / 15💀`); Right side displays the 6-slot Character Paperdoll above an 8×3 square inventory grid.
- **Consequences:** Zero-friction item inspection, upgrading, and gambling.

## ADR-004: 15-Node Circular Combat Talent Tree & 8 Hero Bonds
- **Date:** 2026-10-20
- **Status:** Accepted
- **Context:** Deep RPG progression requires both active point allocation on level-up and collection synergies across the 60 Three Kingdoms generals.
- **Decision:** Added `COMBAT_TALENTS` (5 tiers at Commander `Lv.1, 5, 10, 15, 20` × 3 circular nodes, `0/5` ranks each) and `HERO_BONDS` (8 historical Three Kingdoms synergies) directly into `computeTotalBonuses()`.
- **Consequences:** Every Commander level-up, Boss kill, and General recruitment meaningfully increases army power.
