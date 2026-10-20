// ============================================================================
// HD SPRITE ANIMATOR & VFX RENDERER (USES REAL GENERATED 32-BIT HD SPRITES)
// ============================================================================

import { assetManager } from './assetManager.js';

/**
 * Draw a Three Kingdoms General, Soldier, or Boss using the real HD generated sprites
 * with 60FPS skeletal squash-and-stretch, gallop rocking, attack lunge, afterimages & hit-flash!
 */
export function drawPixelUnit(ctx, unit, time) {
  const {
    x,
    y,
    facing = 1,
    isMoving = true,
    attackAnim = 0,
    hurtAnim = 0,
    isBoss = false,
    heroConfig = {},
    hp = 100,
    maxHp = 100,
    name = '',
    factionColor = '#f59e0b',
    isPlayerTeam = true,
  } = unit;

  const sprite = assetManager.getUnitSprite(unit);
  const seed = unit.animSeed || 0;
  const runCycle = isMoving ? time * 11.5 + seed : time * 3.0 + seed;

  // Dynamic 60FPS Animation Kinematics
  const bob = isMoving ? Math.abs(Math.sin(runCycle)) * -7 : Math.sin(runCycle) * -2;
  const rockAngle = isMoving ? Math.cos(runCycle) * 0.065 : Math.sin(runCycle) * 0.02;
  const squashX = isMoving ? 1 + Math.sin(runCycle * 2) * 0.045 : 1;
  const stretchY = isMoving ? 1 - Math.sin(runCycle * 2) * 0.045 : 1;

  // Attack Lunge & Strike Rotation
  const attackCurve = attackAnim > 0 ? Math.sin(attackAnim * Math.PI) : 0;
  const lungeX = attackCurve * 26 * facing;
  const strikeAngle = attackCurve * 0.22;

  const targetHeight = isBoss
    ? 128
    : unit.isMainHero
      ? 106
      : unit.isSquadGeneral
        ? 92
        : 82;

  ctx.save();
  ctx.translate(x + lungeX, y);

  // 1. GROUND SHADOW & GLOWING AURA RING
  ctx.save();
  const shadowRx = isBoss ? 46 : unit.isMainHero ? 36 : 26;
  const shadowGrad = ctx.createRadialGradient(0, 2, 4, 0, 2, shadowRx);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.82)');
  shadowGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.38)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(0, 3, shadowRx, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  if (unit.isMainHero || isBoss || unit.isSquadGeneral) {
    ctx.strokeStyle = isBoss ? '#ef4444' : unit.isMainHero ? '#fde047' : factionColor;
    ctx.lineWidth = unit.isMainHero || isBoss ? 2.2 : 1.4;
    ctx.globalAlpha = 0.65 + Math.sin(time * 6) * 0.25;
    ctx.beginPath();
    ctx.ellipse(0, 2, shadowRx * 0.85, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  if (sprite) {
    const aspect = sprite.width / Math.max(1, sprite.height);
    const drawH = targetHeight;
    const drawW = drawH * aspect;

    // Note: Player sprites face RIGHT (+1), Enemy sprites (enemy_soldier / boss_warlord) face LEFT (-1) natively
    const nativeFacing =
      !isPlayerTeam && (!unit.bossHeroId || !assetManager.sprites[unit.bossHeroId]) ? -1 : 1;
    const flipX = facing * nativeFacing;

    // 2. MOTION AFTERIMAGE GHOST TRAIL WHEN ATTACKING OR USING SKILLS
    if (attackCurve > 0.2) {
      ctx.save();
      ctx.translate(-16 * facing, bob);
      ctx.scale(flipX * squashX, stretchY);
      ctx.globalAlpha = 0.42 * attackCurve;
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(sprite, -drawW / 2, -drawH, drawW, drawH);
      ctx.restore();
    }

    // 3. MAIN ANIMATED HD SPRITE
    ctx.save();
    ctx.translate(0, bob);
    ctx.scale(flipX * squashX, stretchY);
    ctx.rotate(rockAngle + strikeAngle);

    if (hurtAnim > 0.08) {
      ctx.filter = 'brightness(2.4) contrast(1.4)';
    }

    ctx.drawImage(sprite, -drawW / 2, -drawH, drawW, drawH);
    ctx.restore();

    // 4. REAL DRAGON SLASH VFX OVERLAY ON ATTACK
    if (attackCurve > 0.15 && assetManager.sprites.vfx_slash) {
      const vfxImg = assetManager.sprites.vfx_slash;
      ctx.save();
      ctx.translate(28 * facing, -drawH * 0.52);
      ctx.scale(facing, 1);
      ctx.rotate((1 - attackCurve) * 0.6 - 0.3);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(1, attackCurve * 1.25);
      const vSize = drawH * 0.95;
      ctx.drawImage(vfxImg, -vSize / 2, -vSize / 2, vSize, vSize);
      ctx.restore();
    }
  }

  ctx.restore();

  // 5. OVERHEAD RPG HEALTH BAR & GENERAL TITLE
  const topY = y - targetHeight - 6;
  const barW = isBoss ? 96 : unit.isMainHero ? 68 : 50;
  const barH = isBoss ? 7 : 5;

  ctx.save();
  if (unit.isMainHero || unit.isSquadGeneral || isBoss) {
    ctx.font = isBoss ? '900 11.5px "Cinzel", Georgia, serif' : 'bold 10.5px "Cinzel", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.92)';
    ctx.strokeText(name, x + lungeX, topY - 7);
    ctx.fillStyle = isBoss ? '#fca5a5' : unit.isMainHero ? '#fde047' : '#93c5fd';
    ctx.fillText(name, x + lungeX, topY - 7);
  }

  const hpRatio = Math.max(0, Math.min(1, hp / Math.max(1, maxHp)));
  ctx.fillStyle = 'rgba(7, 10, 16, 0.92)';
  ctx.strokeStyle = isBoss ? '#f59e0b' : 'rgba(253, 224, 71, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.fillRect(x + lungeX - barW / 2 - 1, topY - 4, barW + 2, barH + 2);
  ctx.strokeRect(x + lungeX - barW / 2 - 1, topY - 4, barW + 2, barH + 2);

  const hpGrad = ctx.createLinearGradient(x + lungeX - barW / 2, 0, x + lungeX + barW / 2, 0);
  if (isPlayerTeam) {
    hpGrad.addColorStop(0, unit.isMainHero ? '#15803d' : '#0369a1');
    hpGrad.addColorStop(1, unit.isMainHero ? '#4ade80' : '#38bdf8');
  } else {
    hpGrad.addColorStop(0, '#7f1d1d');
    hpGrad.addColorStop(1, '#ef4444');
  }
  ctx.fillStyle = hpGrad;
  ctx.fillRect(x + lungeX - barW / 2, topY - 3, barW * hpRatio, barH);
  ctx.restore();
}

/**
 * Draw Deskrawl-style Three Kingdoms Supply Cart (Mộc Ngưu Lưu Mã) using real HD Sprite
 */
export function drawSupplyCartAndHaulers(ctx, cartState, time) {
  const { x, y, level = 1, lootCount = 0, capacity = 20, haulers = [] } = cartState;
  const bounce = Math.sin(time * 10) * -3;
  const rock = Math.cos(time * 10) * 0.03;

  ctx.save();
  ctx.translate(x, y);

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 52, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  const cartSprite = assetManager.sprites.supply_cart;
  if (cartSprite) {
    const aspect = cartSprite.width / Math.max(1, cartSprite.height);
    const drawH = 92;
    const drawW = drawH * aspect;
    ctx.save();
    ctx.translate(0, bounce);
    ctx.rotate(rock);
    ctx.drawImage(cartSprite, -drawW / 2, -drawH + 6, drawW, drawH);
    ctx.restore();
  }

  // Cart Label
  ctx.font = 'bold 10px "Cinzel", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(0,0,0,0.9)';
  ctx.strokeText(`Lương Xa Cấp ${level} (${lootCount}/${capacity})`, 0, -90 + bounce);
  ctx.fillStyle = '#fde047';
  ctx.fillText(`Lương Xa Cấp ${level} (${lootCount}/${capacity})`, 0, -90 + bounce);

  ctx.restore();

  // Captured Escort Soldiers marching alongside the cart
  const soldierSprite = assetManager.sprites.enemy_soldier;
  if (soldierSprite) {
    const aspect = soldierSprite.width / Math.max(1, soldierSprite.height);
    const sH = 54;
    const sW = sH * aspect;
    haulers.slice(0, 2).forEach((_troop, idx) => {
      const tx = x + 54 + idx * 28;
      const ty = y + (idx % 2 === 0 ? 4 : -4);
      const stepBob = Math.abs(Math.sin(time * 12 + idx)) * -4;
      ctx.save();
      ctx.translate(tx, ty + stepBob);
      ctx.scale(-1, 1); // Flip enemy_soldier so captured soldier marches RIGHT with player!
      ctx.drawImage(soldierSprite, -sW / 2, -sH + 4, sW, sH);
      ctx.restore();
    });
  }
}

/**
 * Draw Diablo-style Loot Drop with Glowing Light Beam & Capture Soul Orbs
 */
export function drawGroundLoot(ctx, drop, time) {
  const { x, y, type, color, label, isCaptureSoul } = drop;
  const floatY = Math.sin(time * 6 + drop.id) * 4;

  ctx.save();
  ctx.translate(x, y);

  if (isCaptureSoul) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createRadialGradient(0, -18 + floatY, 2, 0, -18 + floatY, 28);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.45, color || '#38bdf8');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, -18 + floatY, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#450a0a';
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -18 + floatY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 12px serif';
    ctx.textAlign = 'center';
    ctx.fillText('降', 0, -14 + floatY);
  } else if (type === 'item') {
    // Diablo Rarity Pillar of Light
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const beamGrad = ctx.createLinearGradient(0, 0, 0, -110);
    beamGrad.addColorStop(0, color);
    beamGrad.addColorStop(0.45, color);
    beamGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = beamGrad;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(-8, -110, 16, 110);
    ctx.restore();

    ctx.fillStyle = color;
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(-10, -13 + floatY, 20, 13, 3);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 10.5px "Cinzel", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.92)';
    ctx.strokeText(label, 0, -18 + floatY);
    ctx.fillStyle = color;
    ctx.fillText(label, 0, -18 + floatY);
  } else {
    ctx.fillStyle = type === 'iron' ? '#38bdf8' : '#facc15';
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(0, -5 + floatY, 7.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}
