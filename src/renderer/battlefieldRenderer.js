// ============================================================================
// HD THREE KINGDOMS BATTLEFIELD RENDERER (REAL PARALLAX BACKGROUNDS & SPRITES)
// ============================================================================

import {
  drawPixelUnit,
  drawSupplyCartAndHaulers,
  drawGroundLoot,
} from './pixelSprites.js';
import { assetManager } from './assetManager.js';
import { FACTIONS, MINION_TROOPS } from '../data/threeKingdomsData.js';

export function renderBattlefield(ctx, canvas, engine) {
  const w = canvas.width;
  const h = canvas.height; // 210px height
  const time = engine.time;
  const stage = engine.getCurrentStage();
  const groundY = h - 22; // Feet stand on the stone war road

  ctx.save();
  ctx.imageSmoothingEnabled = true;

  // Screen shake when skills / Combo Ultimates hit
  if (engine.screenShake > 0) {
    const sx = (Math.random() - 0.5) * engine.screenShake * 1.3;
    const sy = (Math.random() - 0.5) * engine.screenShake * 1.3;
    ctx.translate(sx, sy);
  }

  // 1. SEAMLESS SCROLLING HD PARALLAX BACKGROUND ART (bg_hulao_gate / bg_red_cliffs)
  const bgImg =
    stage.id === 5 || stage.id === 6
      ? assetManager.backgrounds.bg_red_cliffs || assetManager.backgrounds.bg_hulao
      : assetManager.backgrounds.bg_hulao;

  if (bgImg) {
    const bgAspect = bgImg.width / Math.max(1, bgImg.height);
    // Draw slightly taller so we crop into the rich fortress & stone road area
    const drawH = Math.max(h * 1.55, 320);
    const drawW = drawH * bgAspect;
    const srcYOffset = -(drawH - h) * 0.58;
    const scrollX = (engine.scrollOffset * 0.65) % drawW;

    for (let x = -scrollX; x < w + drawW; x += drawW) {
      ctx.drawImage(bgImg, x, srcYOffset, drawW, drawH);
    }

    // Subtle dark vignette at top & bottom to blend with HUD
    const vigGrad = ctx.createLinearGradient(0, 0, 0, h);
    vigGrad.addColorStop(0, 'rgba(5, 8, 14, 0.48)');
    vigGrad.addColorStop(0.25, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(0.82, 'rgba(0, 0, 0, 0.12)');
    vigGrad.addColorStop(1, 'rgba(5, 8, 14, 0.72)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);
  }

  // 2. GROUND LOOT DROPS & CAPTURE SOULS
  engine.groundDrops.forEach((drop) => {
    drawGroundLoot(ctx, { ...drop, y: groundY - 4 }, time);
  });

  // 3. DESKRAWL SUPPLY CART (MỘC NGƯU LƯU MÃ HD SPRITE) & CAPTURED MINION HAULERS
  if (engine.mainUnit) {
    const mainHeroFaction = FACTIONS[engine.mainUnit.heroConfig.faction] || FACTIONS.QUN;
    const activeHaulerTroops = [];
    MINION_TROOPS.forEach((t) => {
      const cnt = engine.state.capturedTroops[t.id] || 0;
      for (let i = 0; i < Math.min(2, cnt); i++) {
        activeHaulerTroops.push(t);
      }
    });

    drawSupplyCartAndHaulers(
      ctx,
      {
        x: engine.mainUnit.x - 165,
        y: groundY - 2,
        level: engine.state.buildings.supply_workshop || 1,
        lootCount: engine.state.inventory.length,
        capacity: engine.getCartCapacity(),
        factionChar: mainHeroFaction.bannerChar,
        factionColor: mainHeroFaction.color,
        haulers: activeHaulerTroops,
      },
      time
    );
  }

  // 4. SORT & DRAW ALL UNITS BY Y-DEPTH (Squad Generals, Main Hero, Enemies, Boss)
  const renderQueue = [
    ...engine.squadUnits.map((u) => ({ ...u, y: groundY - 6 + u.offsetY * 0.45 })),
    ...(engine.mainUnit ? [{ ...engine.mainUnit, y: groundY }] : []),
    ...engine.enemies
      .filter((e) => e.hp > 0)
      .map((e) => ({ ...e, y: groundY + (e.isBoss ? 2 : (e.y - 136) * 0.4) })),
  ];
  renderQueue.sort((a, b) => a.y - b.y);

  renderQueue.forEach((u) => {
    drawPixelUnit(ctx, u, time);
  });

  // 5. FLOATING BATTLEFIELD EMBERS & SPARKS
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 20; i++) {
    const px = ((i * 137 - time * 70 * (1 + (i % 3) * 0.3)) % w + w) % w;
    const py = (i * 53 + Math.sin(time * 3 + i) * 24) % h;
    ctx.fillStyle = i % 2 === 0 ? '#f97316' : '#fde047';
    ctx.globalAlpha = 0.45 + Math.sin(time * 6 + i) * 0.3;
    ctx.beginPath();
    ctx.arc(px, py, (i % 2) + 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 6. RENDER SKILL VFX & META 3Q COMBO ULTIMATES USING HD DRAGON SLASH SPRITE
  const vfxSlashSprite = assetManager.sprites.vfx_slash;
  engine.vfxEffects.forEach((vfx) => {
    const progress = 1 - vfx.timer / vfx.maxTimer;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    if (vfx.type === 'slash') {
      if (vfxSlashSprite) {
        const size = 90 + progress * 45;
        ctx.globalAlpha = Math.max(0, 1 - progress);
        ctx.translate(vfx.x, groundY - 48);
        ctx.rotate(progress * 0.45);
        ctx.drawImage(vfxSlashSprite, -size / 2, -size / 2, size, size);
      }
    } else if (vfx.type === 'combo_ultimate') {
      // Full-screen Three Kingdoms Combo Ultimate Dragon Storm!
      ctx.fillStyle = vfx.color || '#f59e0b';
      ctx.globalAlpha = Math.max(0, 0.3 * (1 - progress));
      ctx.fillRect(0, 0, w, h);

      ctx.globalAlpha = Math.max(0, 1 - progress * 0.75);
      for (let i = 0; i < 6; i++) {
        const pxX = 260 + i * 160 + Math.sin(progress * 10 + i) * 30;
        if (vfxSlashSprite) {
          const sSize = 165;
          ctx.drawImage(vfxSlashSprite, pxX - sSize / 2, groundY - sSize * 0.85, sSize, sSize);
        }
        const beamGrad = ctx.createLinearGradient(pxX - 24, 0, pxX + 24, 0);
        beamGrad.addColorStop(0, 'rgba(0,0,0,0)');
        beamGrad.addColorStop(0.5, vfx.color);
        beamGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(pxX - 28, 0, 56, h);
      }
    } else {
      // Hero Active Skill Burst + Dragon Wave
      if (vfxSlashSprite) {
        const sSize = 135 + progress * 55;
        ctx.globalAlpha = Math.max(0, 1 - progress * 0.85);
        ctx.drawImage(vfxSlashSprite, vfx.x - sSize / 2, groundY - sSize * 0.8, sSize, sSize);
      }
      const colGrad = ctx.createLinearGradient(vfx.x - 32, 0, vfx.x + 32, 0);
      colGrad.addColorStop(0, 'rgba(0,0,0,0)');
      colGrad.addColorStop(0.5, vfx.color || '#fde047');
      colGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = colGrad;
      ctx.globalAlpha = 0.7 * (1 - progress);
      ctx.fillRect(vfx.x - 32, 0, 64, h);
    }

    ctx.restore();
  });

  // 7. STYLIZED GAME DAMAGE NUMBERS & CRITICAL CALLOUTS
  engine.floatingTexts.forEach((ft) => {
    ctx.save();
    ctx.font = `900 ${ft.size || 14}px "Cinzel", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.globalAlpha = Math.min(1, ft.timer * 1.4);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  });

  // 8. IMPERIAL WUXIA CALLOUT BANNER (TOP CENTER)
  if (engine.activeBanner) {
    ctx.save();
    const bannerW = 640;
    const bannerX = (w - bannerW) / 2;
    const bGrad = ctx.createLinearGradient(bannerX, 0, bannerX + bannerW, 0);
    bGrad.addColorStop(0, 'rgba(9, 13, 22, 0)');
    bGrad.addColorStop(0.15, 'rgba(15, 23, 42, 0.95)');
    bGrad.addColorStop(0.85, 'rgba(15, 23, 42, 0.95)');
    bGrad.addColorStop(1, 'rgba(9, 13, 22, 0)');
    ctx.fillStyle = bGrad;
    ctx.fillRect(bannerX, 6, bannerW, 30);

    ctx.fillStyle = engine.activeBanner.color;
    ctx.fillRect(bannerX + 60, 6, bannerW - 120, 2);
    ctx.fillRect(bannerX + 60, 34, bannerW - 120, 2);

    ctx.font = 'bold 13.5px "Cinzel", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = engine.activeBanner.color;
    ctx.fillText(engine.activeBanner.text, w / 2, 26);
    ctx.restore();
  }

  // Ornate top gold frame rim of the battlefield
  const rimGrad = ctx.createLinearGradient(0, 0, w, 0);
  rimGrad.addColorStop(0, '#78350f');
  rimGrad.addColorStop(0.25, '#f59e0b');
  rimGrad.addColorStop(0.5, '#fde047');
  rimGrad.addColorStop(0.75, '#f59e0b');
  rimGrad.addColorStop(1, '#78350f');
  ctx.fillStyle = rimGrad;
  ctx.fillRect(0, 0, w, 3);

  ctx.restore();
}
