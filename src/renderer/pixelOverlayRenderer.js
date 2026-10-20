// ============================================================================
// AUTHENTIC 32-BIT HD SPRITE SHEET RENDERER (32 MULTI-FRAME ANIMATION SHEETS)
// - Loads 28 True 4-Frame Character Animation Sprite Sheets (Run Cycles &
//   Attack Combos for ALL 14 Character Archetypes: Zhao Yun, Guan Yu, Lu Bu,
//   Zhuge Liang, Sima Yi, Diao Chan, Zhen Ji, Heavy Warrior, Xu Chu, Meng Huo,
//   Twin Swords, Archer, Enemy Soldier, and Boss Warlord!)
// - Loads 4 Animated 4-Frame VFX Sprite Sheets (Dragon Slash, Lightning Strike,
//   Crimson Cross Slash, Fire Pillar) + 3 Evolving Supply Cart Tiers!
// - Loads 5 Iconic Three Kingdoms Battlefield Backgrounds (Hulao Gate, Red Cliffs,
//   Changban Bridge, Wuzhang Plains, Luoyang Palace)!
// - Renders 1v1 Single Combat Duel ("Nhất Kỵ Đương Thiên") Arena & Dynamic
//   Battlefield Encounters ("Kỳ Ngộ Hành Quân")!
// ============================================================================

const SPRITE_SOURCES = {
  // 17 Base Character & 3-Tier Evolving Supply Cart Sprites
  lu_bu: { url: 'assets/sprite_lu_bu.png', nativeFacing: 1, isVfx: false },
  guan_yu: { url: 'assets/sprite_guan_yu.png', nativeFacing: 1, isVfx: false },
  zhao_yun: { url: 'assets/sprite_zhao_yun.png', nativeFacing: 1, isVfx: false },
  zhuge_liang: { url: 'assets/sprite_zhuge_liang.png', nativeFacing: 1, isVfx: false },
  archer: { url: 'assets/sprite_archer_general.png', nativeFacing: 1, isVfx: false },
  twin_swords: { url: 'assets/sprite_twin_swords_lord.png', nativeFacing: 1, isVfx: false },
  heavy_warrior: { url: 'assets/sprite_heavy_warrior.png', nativeFacing: 1, isVfx: false },
  diao_chan: { url: 'assets/sprite_diao_chan_mage.png', nativeFacing: 1, isVfx: false },
  meng_huo: { url: 'assets/sprite_meng_huo.png', nativeFacing: 1, isVfx: false },
  sima_yi: { url: 'assets/sprite_sima_yi.png', nativeFacing: 1, isVfx: false },
  xu_chu: { url: 'assets/sprite_xu_chu.png', nativeFacing: 1, isVfx: false },
  zhen_ji: { url: 'assets/sprite_zhen_ji.png', nativeFacing: 1, isVfx: false },
  supply_cart: { url: 'assets/sprite_supply_cart.png', nativeFacing: 1, isVfx: false },
  supply_cart_tier2: { url: 'assets/sprite_supply_cart_tier2.png', nativeFacing: -1, isVfx: false },
  supply_cart_tier3: { url: 'assets/sprite_supply_cart_tier3.png', nativeFacing: 1, isVfx: false },
  enemy_soldier: { url: 'assets/sprite_enemy_soldier.png', nativeFacing: -1, isVfx: false },
  boss_warlord: { url: 'assets/sprite_boss_warlord.png', nativeFacing: -1, isVfx: false },

  // 7 Authentic 32-Bit HD Pixel Art Skill & Combat VFX Sprites
  vfx_dragon: { url: 'assets/vfx_dragon_slash.png', nativeFacing: 1, isVfx: true },
  vfx_crimson_halberd: { url: 'assets/vfx_crimson_halberd.png', nativeFacing: 1, isVfx: true },
  vfx_spear_pierce: { url: 'assets/vfx_spear_pierce.png', nativeFacing: 1, isVfx: true },
  vfx_lightning_bagua: { url: 'assets/vfx_lightning_bagua.png', nativeFacing: 1, isVfx: true },
  vfx_fire_eruption: { url: 'assets/vfx_fire_eruption.png', nativeFacing: 1, isVfx: true },
  vfx_arrow_volley: { url: 'assets/vfx_arrow_volley.png', nativeFacing: 1, isVfx: true },
  vfx_hit_explosion: { url: 'assets/vfx_hit_explosion.png', nativeFacing: 1, isVfx: true },
};

// 32 True 4-Frame Horizontal Animation Sprite Sheets (28 Character Run/Attack + 4 VFX Sheets)
const SPRITE_SHEET_SOURCES = {
  zhao_yun_run: { url: 'assets/sheet_zhao_yun_run.png', nativeFacing: 1, frames: 4, isVfx: false },
  zhao_yun_attack: { url: 'assets/sheet_zhao_yun_attack.png', nativeFacing: 1, frames: 4, isVfx: false },
  guan_yu_run: { url: 'assets/sheet_guan_yu_run.png', nativeFacing: 1, frames: 4, isVfx: false },
  guan_yu_attack: { url: 'assets/sheet_guan_yu_attack.png', nativeFacing: 1, frames: 4, isVfx: false },
  lu_bu_run: { url: 'assets/sheet_lu_bu_run.png', nativeFacing: 1, frames: 4, isVfx: false },
  lu_bu_attack: { url: 'assets/sheet_lu_bu_attack.png', nativeFacing: 1, frames: 4, isVfx: false },
  meng_huo_run: { url: 'assets/sheet_meng_huo_run.png', nativeFacing: 1, frames: 4, isVfx: false },
  meng_huo_attack: { url: 'assets/sheet_meng_huo_attack.png', nativeFacing: 1, frames: 4, isVfx: false },
  heavy_warrior_run: { url: 'assets/sheet_heavy_warrior_run.png', nativeFacing: 1, frames: 4, isVfx: false },
  heavy_warrior_attack: { url: 'assets/sheet_heavy_warrior_attack.png', nativeFacing: 1, frames: 4, isVfx: false },
  xu_chu_run: { url: 'assets/sheet_xu_chu_run.png', nativeFacing: 1, frames: 4, isVfx: false },
  xu_chu_attack: { url: 'assets/sheet_xu_chu_attack.png', nativeFacing: 1, frames: 4, isVfx: false },
  twin_swords_run: { url: 'assets/sheet_twin_swords_run.png', nativeFacing: 1, frames: 4, isVfx: false },
  twin_swords_attack: { url: 'assets/sheet_twin_swords_attack.png', nativeFacing: 1, frames: 4, isVfx: false },
  archer_run: { url: 'assets/sheet_archer_run.png', nativeFacing: 1, frames: 4, isVfx: false },
  archer_attack: { url: 'assets/sheet_archer_attack.png', nativeFacing: 1, frames: 4, isVfx: false },
  zhuge_liang_run: { url: 'assets/sheet_zhuge_liang_run.png', nativeFacing: 1, frames: 4, isVfx: false },
  zhuge_liang_attack: { url: 'assets/sheet_zhuge_liang_attack.png', nativeFacing: 1, frames: 4, isVfx: false },
  sima_yi_run: { url: 'assets/sheet_sima_yi_run.png', nativeFacing: 1, frames: 4, isVfx: false },
  sima_yi_attack: { url: 'assets/sheet_sima_yi_attack.png', nativeFacing: 1, frames: 4, isVfx: false },
  diao_chan_run: { url: 'assets/sheet_diao_chan_run.png', nativeFacing: 1, frames: 4, isVfx: false },
  diao_chan_attack: { url: 'assets/sheet_diao_chan_attack.png', nativeFacing: 1, frames: 4, isVfx: false },
  zhen_ji_run: { url: 'assets/sheet_zhen_ji_run.png', nativeFacing: 1, frames: 4, isVfx: false },
  zhen_ji_attack: { url: 'assets/sheet_zhen_ji_attack.png', nativeFacing: 1, frames: 4, isVfx: false },
  enemy_soldier_run: { url: 'assets/sheet_enemy_soldier_run.png', nativeFacing: 1, frames: 4, isVfx: false },
  enemy_soldier_attack: { url: 'assets/sheet_enemy_soldier_attack.png', nativeFacing: 1, frames: 4, isVfx: false },
  boss_warlord_run: { url: 'assets/sheet_boss_warlord_run.png', nativeFacing: 1, frames: 4, isVfx: false },
  boss_warlord_attack: { url: 'assets/sheet_boss_warlord_attack.png', nativeFacing: 1, frames: 4, isVfx: false },

  // 8 Animated 4-Frame Skill & Combat VFX Sheets!
  vfx_sheet_dragon: { url: 'assets/sheet_vfx_dragon_slash.png', nativeFacing: 1, frames: 4, isVfx: true },
  vfx_sheet_lightning: { url: 'assets/sheet_vfx_lightning_strike.png', nativeFacing: 1, frames: 4, isVfx: true },
  vfx_sheet_crimson: { url: 'assets/sheet_vfx_crimson_slash.png', nativeFacing: 1, frames: 4, isVfx: true },
  vfx_sheet_fire: { url: 'assets/sheet_vfx_fire_pillar.png', nativeFacing: 1, frames: 4, isVfx: true },
  vfx_sheet_arrow: { url: 'assets/sheet_vfx_arrow_volley.png', nativeFacing: 1, frames: 4, isVfx: true },
  vfx_sheet_spear: { url: 'assets/sheet_vfx_spear_pierce.png', nativeFacing: 1, frames: 4, isVfx: true },
  vfx_sheet_ice: { url: 'assets/sheet_vfx_ice_nova.png', nativeFacing: 1, frames: 4, isVfx: true },
  vfx_sheet_hit: { url: 'assets/sheet_vfx_hit_explosion.png', nativeFacing: 1, frames: 4, isVfx: true },
};

// Maps every character rig to its dedicated 4-frame Run Sheet & 4-frame Attack Sheet (100% coverage!)
const RIG_SHEET_MAP = {
  zhao_yun: { run: 'zhao_yun_run', attack: 'zhao_yun_attack' },
  guan_yu: { run: 'guan_yu_run', attack: 'guan_yu_attack' },
  lu_bu: { run: 'lu_bu_run', attack: 'lu_bu_attack' },
  meng_huo: { run: 'meng_huo_run', attack: 'meng_huo_attack' },
  heavy_warrior: { run: 'heavy_warrior_run', attack: 'heavy_warrior_attack' },
  xu_chu: { run: 'xu_chu_run', attack: 'xu_chu_attack' },
  twin_swords: { run: 'twin_swords_run', attack: 'twin_swords_attack' },
  archer: { run: 'archer_run', attack: 'archer_attack' },
  zhuge_liang: { run: 'zhuge_liang_run', attack: 'zhuge_liang_attack' },
  sima_yi: { run: 'sima_yi_run', attack: 'sima_yi_attack' },
  diao_chan: { run: 'diao_chan_run', attack: 'diao_chan_attack' },
  zhen_ji: { run: 'zhen_ji_run', attack: 'zhen_ji_attack' },
  enemy_soldier: { run: 'enemy_soldier_run', attack: 'enemy_soldier_attack' },
  boss_warlord: { run: 'boss_warlord_run', attack: 'boss_warlord_attack' },
};

// 5 Iconic Three Kingdoms Battlefield Backgrounds mapped across Campaign Chapters
const BG_SOURCES = {
  hulao: 'assets/bg_hulao_gate.png',
  luoyang: 'assets/bg_luoyang_palace.png',
  changban: 'assets/bg_changban_bridge.png',
  red_cliffs: 'assets/bg_red_cliffs.png',
  wuzhang: 'assets/bg_wuzhang_plains.png',
};

const STAGE_BG_MAP = {
  1: 'hulao',
  2: 'luoyang',
  3: 'changban',
  4: 'red_cliffs',
  5: 'wuzhang',
  6: 'changban',
  7: 'luoyang',
  8: 'red_cliffs',
  9: 'wuzhang',
  10: 'hulao',
};

const RIG_HEIGHT_CONFIG = {
  lu_bu: { targetH: 118, footOffsetY: 6, isMounted: true },
  meng_huo: { targetH: 118, footOffsetY: 6, isMounted: true },
  zhao_yun: { targetH: 114, footOffsetY: 6, isMounted: true },
  guan_yu: { targetH: 106, footOffsetY: 4, isMounted: false },
  twin_swords: { targetH: 106, footOffsetY: 4, isMounted: false },
  archer: { targetH: 106, footOffsetY: 4, isMounted: false },
  heavy_warrior: { targetH: 108, footOffsetY: 4, isMounted: false },
  xu_chu: { targetH: 110, footOffsetY: 4, isMounted: false },
  zhuge_liang: { targetH: 104, footOffsetY: 4, isMounted: false },
  sima_yi: { targetH: 104, footOffsetY: 4, isMounted: false },
  diao_chan: { targetH: 102, footOffsetY: 4, isMounted: false },
  zhen_ji: { targetH: 102, footOffsetY: 4, isMounted: false },
  enemy_soldier: { targetH: 94, footOffsetY: 4, isMounted: false },
  boss_warlord: { targetH: 124, footOffsetY: 6, isMounted: false },
};

const HERO_RIG_MAP = {
  // SHU (15)
  guan_yu: 'guan_yu',
  zhang_fei: 'heavy_warrior',
  zhao_yun: 'zhao_yun',
  ma_chao: 'zhao_yun',
  huang_zhong: 'archer',
  zhuge_liang: 'zhuge_liang',
  liu_bei: 'twin_swords',
  pang_tong: 'sima_yi',
  jiang_wei: 'zhao_yun',
  wei_yan: 'xu_chu',
  huang_yueying: 'zhen_ji',
  fa_zheng: 'zhuge_liang',
  guan_ping: 'guan_yu',
  xing_cai: 'zhen_ji',
  ma_dai: 'zhao_yun',

  // WEI (15)
  cao_cao: 'twin_swords',
  zhang_liao: 'zhao_yun',
  xiahou_dun: 'heavy_warrior',
  xiahou_yuan: 'archer',
  xu_chu: 'xu_chu',
  dian_wei: 'xu_chu',
  sima_yi: 'sima_yi',
  guo_jia: 'zhuge_liang',
  xun_yu: 'zhuge_liang',
  jia_xu: 'sima_yi',
  xu_huang: 'guan_yu',
  zhang_he: 'twin_swords',
  pang_de: 'meng_huo',
  zhen_ji: 'zhen_ji',
  cao_ren: 'xu_chu',

  // WU (15)
  sun_quan: 'twin_swords',
  zhou_yu: 'diao_chan',
  lu_xun: 'twin_swords',
  gan_ning: 'heavy_warrior',
  taishi_ci: 'archer',
  sun_shangxiang: 'archer',
  lu_meng: 'guan_yu',
  huang_gai: 'xu_chu',
  zhou_tai: 'twin_swords',
  xiao_qiao: 'diao_chan',
  da_qiao: 'zhen_ji',
  lu_su: 'zhuge_liang',
  ding_feng: 'heavy_warrior',
  ling_tong: 'zhao_yun',
  cheng_pu: 'guan_yu',

  // QUN (15)
  lu_bu: 'lu_bu',
  diao_chan: 'diao_chan',
  dong_zhuo: 'xu_chu',
  yuan_shao: 'twin_swords',
  zhang_jiao: 'sima_yi',
  meng_huo: 'meng_huo',
  zhu_rong: 'diao_chan',
  hua_xiong: 'xu_chu',
  yan_liang: 'guan_yu',
  wen_chou: 'heavy_warrior',
  zuo_ci: 'sima_yi',
  yu_ji: 'zhuge_liang',
  gongsun_zan: 'zhao_yun',
  ma_teng: 'meng_huo',
  chen_gong: 'zhuge_liang',
};

export class PixelOverlayRenderer {
  constructor(canvas, engine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.engine = engine;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.masterSprites = {};
    this.masterSheets = {};
    this.scaledRigCache = new Map();
    this.portraitDataUrls = new Map();
    this.bgImages = {};
    this.assetsReady = false;

    this.vfxSprites = [];
    this.afterimages = [];
    this.customProjectiles = [];
    this.dustParticles = [];
    this.lootIcons = this.bakePixelLootIcons();

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('click', (e) => {
      if (this.engine.fieldEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const scaleX = this.width / 1050;
        const evScreenX = this.engine.fieldEvent.x * scaleX;
        if (Math.abs(cx - evScreenX) < 95) {
          this.engine.claimFieldEvent();
        }
      }
    });
    this.preloadAssets();
  }

  async preloadAssets() {
    const loadImg = (url) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
      });

    for (const [key, cfg] of Object.entries(SPRITE_SOURCES)) {
      const rawImg = await loadImg(cfg.url);
      if (rawImg) {
        this.masterSprites[key] = this.cleanSingleSpriteCanvas(rawImg, cfg.nativeFacing, cfg.isVfx);
      }
    }

    for (const [key, cfg] of Object.entries(SPRITE_SHEET_SOURCES)) {
      const rawSheet = await loadImg(cfg.url);
      if (rawSheet) {
        this.masterSheets[key] = this.sliceSpriteSheetFrames(
          rawSheet,
          cfg.nativeFacing,
          cfg.frames || 4,
          cfg.isVfx
        );
      }
    }

    for (const [key, url] of Object.entries(BG_SOURCES)) {
      const rawBg = await loadImg(url);
      if (rawBg) {
        this.bgImages[key] = rawBg;
      }
    }

    this.scaledRigCache.clear();
    this.portraitDataUrls.clear();
    this.assetsReady = true;
    window.dispatchEvent(new Event('sprites-updated'));
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  // --------------------------------------------------------------------------
  // 1. EXTERIOR BORDER FLOOD-FILL FOR 32-BIT HD SPRITES (100% OPAQUE INTERIOR)
  // --------------------------------------------------------------------------
  cleanSingleSpriteCanvas(img, nativeFacing = 1, isVfx = false) {
    const w = img.width;
    const h = img.height;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tctx = tempCanvas.getContext('2d', { willReadFrequently: true });
    tctx.drawImage(img, 0, 0);

    const imgData = tctx.getImageData(0, 0, w, h);
    const d = imgData.data;

    let minX = w;
    let minY = h;
    let maxX = 0;
    let maxY = 0;

    if (isVfx) {
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const maxC = Math.max(r, g, b);
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        if (maxC < 36 || luma < 26) {
          d[i + 3] = 0;
          continue;
        } else if (maxC < 95) {
          d[i + 3] = Math.min(255, Math.floor(((maxC - 36) / 59) * 245));
        }
        if (d[i + 3] > 25) {
          const px = (i / 4) % w;
          const py = Math.floor(i / 4 / w);
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
        }
      }
    } else {
      // Exterior Flood-Fill (BFS from outer edges) so 100% of interior dark armor/hair/beard/pants stay SOLID OPAQUE!
      const total = w * h;
      const isBg = new Uint8Array(total);
      const queue = new Int32Array(total);
      let head = 0;
      let tail = 0;

      const isDarkBgPixel = (pIdx) => {
        const i = pIdx * 4;
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const maxC = Math.max(r, g, b);
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        return maxC < 26 && luma < 22;
      };

      const pushSeed = (x, y) => {
        const p = y * w + x;
        if (!isBg[p] && isDarkBgPixel(p)) {
          isBg[p] = 1;
          queue[tail++] = p;
        }
      };

      for (let x = 0; x < w; x++) {
        pushSeed(x, 0);
        pushSeed(x, h - 1);
      }
      for (let y = 0; y < h; y++) {
        pushSeed(0, y);
        pushSeed(w - 1, y);
      }

      while (head < tail) {
        const p = queue[head++];
        const px = p % w;
        const py = (p - px) / w;

        if (px > 0) {
          const np = p - 1;
          if (!isBg[np] && isDarkBgPixel(np)) {
            isBg[np] = 1;
            queue[tail++] = np;
          }
        }
        if (px < w - 1) {
          const np = p + 1;
          if (!isBg[np] && isDarkBgPixel(np)) {
            isBg[np] = 1;
            queue[tail++] = np;
          }
        }
        if (py > 0) {
          const np = p - w;
          if (!isBg[np] && isDarkBgPixel(np)) {
            isBg[np] = 1;
            queue[tail++] = np;
          }
        }
        if (py < h - 1) {
          const np = p + w;
          if (!isBg[np] && isDarkBgPixel(np)) {
            isBg[np] = 1;
            queue[tail++] = np;
          }
        }
      }

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const p = y * w + x;
          const i = p * 4;
          if (isBg[p]) {
            d[i + 3] = 0;
          } else {
            // Check if adjacent to exterior background for 1px edge anti-aliasing
            const touchesBg =
              (x > 0 && isBg[p - 1]) ||
              (x < w - 1 && isBg[p + 1]) ||
              (y > 0 && isBg[p - w]) ||
              (y < h - 1 && isBg[p + w]);
            if (touchesBg) {
              const maxC = Math.max(d[i], d[i + 1], d[i + 2]);
              d[i + 3] = maxC < 40 ? Math.min(255, Math.max(120, maxC * 6)) : 255;
            } else {
              d[i + 3] = 255; // 100% OPAQUE INSIDE CHARACTER!
            }
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
    }

    tctx.putImageData(imgData, 0, 0);

    if (maxX <= minX || maxY <= minY) {
      return tempCanvas;
    }

    const pad = 4;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(w - 1, maxX + pad);
    maxY = Math.min(h - 1, maxY + pad);

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = cropW;
    outCanvas.height = cropH;
    const octx = outCanvas.getContext('2d');

    if (nativeFacing === -1) {
      octx.translate(cropW, 0);
      octx.scale(-1, 1);
    }

    octx.drawImage(tempCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    return outCanvas;
  }

  // --------------------------------------------------------------------------
  // 2. AUTO-SEGMENTER FOR 4-FRAME HORIZONTAL ANIMATION SPRITE SHEETS
  // --------------------------------------------------------------------------
  sliceSpriteSheetFrames(img, nativeFacing = 1, expectedFrames = 4, isVfx = false) {
    const w = img.width;
    const h = img.height;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tctx = tempCanvas.getContext('2d', { willReadFrequently: true });
    tctx.drawImage(img, 0, 0);

    const imgData = tctx.getImageData(0, 0, w, h);
    const d = imgData.data;

    const colHasPixels = new Uint8Array(w);

    if (isVfx) {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const r = d[idx];
          const g = d[idx + 1];
          const b = d[idx + 2];
          const maxC = Math.max(r, g, b);
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;

          if ((y < h * 0.295 || y > h * 0.705) && r > 220 && g > 220 && b > 220) {
            d[idx + 3] = 0;
          } else if (maxC < 36 || luma < 26) {
            d[idx + 3] = 0;
          } else if (maxC < 95) {
            d[idx + 3] = Math.min(255, Math.floor(((maxC - 36) / 59) * 245));
          }
          if (d[idx + 3] > 35) {
            colHasPixels[x] = 1;
          }
        }
      }
    } else {
      // Exterior Flood-Fill (BFS from outer edges + inter-frame vertical dividers)
      // Guarantees 100% SOLID OPAQUE interior for all 4 frames!
      const total = w * h;
      const isBg = new Uint8Array(total);
      const queue = new Int32Array(total);
      let head = 0;
      let tail = 0;

      const isDarkBgPixel = (pIdx) => {
        const i = pIdx * 4;
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const maxC = Math.max(r, g, b);
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        return maxC < 26 && luma < 22;
      };

      const pushSeed = (x, y) => {
        const p = y * w + x;
        if (!isBg[p] && isDarkBgPixel(p)) {
          isBg[p] = 1;
          queue[tail++] = p;
        }
      };

      for (let x = 0; x < w; x++) {
        pushSeed(x, 0);
        pushSeed(x, h - 1);
      }
      for (let y = 0; y < h; y++) {
        pushSeed(0, y);
        pushSeed(w - 1, y);
        for (let k = 1; k < expectedFrames; k++) {
          pushSeed(Math.floor((w * k) / expectedFrames), y);
        }
      }

      while (head < tail) {
        const p = queue[head++];
        const px = p % w;
        const py = (p - px) / w;

        if (px > 0) {
          const np = p - 1;
          if (!isBg[np] && isDarkBgPixel(np)) {
            isBg[np] = 1;
            queue[tail++] = np;
          }
        }
        if (px < w - 1) {
          const np = p + 1;
          if (!isBg[np] && isDarkBgPixel(np)) {
            isBg[np] = 1;
            queue[tail++] = np;
          }
        }
        if (py > 0) {
          const np = p - w;
          if (!isBg[np] && isDarkBgPixel(np)) {
            isBg[np] = 1;
            queue[tail++] = np;
          }
        }
        if (py < h - 1) {
          const np = p + w;
          if (!isBg[np] && isDarkBgPixel(np)) {
            isBg[np] = 1;
            queue[tail++] = np;
          }
        }
      }

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const p = y * w + x;
          const idx = p * 4;
          if (isBg[p]) {
            d[idx + 3] = 0;
          } else {
            const touchesBg =
              (x > 0 && isBg[p - 1]) ||
              (x < w - 1 && isBg[p + 1]) ||
              (y > 0 && isBg[p - w]) ||
              (y < h - 1 && isBg[p + w]);
            if (touchesBg) {
              const maxC = Math.max(d[idx], d[idx + 1], d[idx + 2]);
              d[idx + 3] = maxC < 40 ? Math.min(255, Math.max(120, maxC * 6)) : 255;
            } else {
              d[idx + 3] = 255; // 100% OPAQUE INSIDE CHARACTER!
            }
            colHasPixels[x] = 1;
          }
        }
      }
    }

    tctx.putImageData(imgData, 0, 0);

    // Find horizontal islands corresponding to each animation frame
    let rawSegments = [];
    let inSeg = false;
    let segStart = 0;
    for (let x = 0; x < w; x++) {
      if (colHasPixels[x]) {
        if (!inSeg) {
          inSeg = true;
          segStart = x;
        }
      } else if (inSeg) {
        inSeg = false;
        if (x - segStart >= 12) {
          rawSegments.push({ x0: segStart, x1: x - 1 });
        }
      }
    }
    if (inSeg && w - segStart >= 12) {
      rawSegments.push({ x0: segStart, x1: w - 1 });
    }

    while (rawSegments.length > expectedFrames) {
      let minGap = Infinity;
      let mergeIdx = 0;
      for (let i = 0; i < rawSegments.length - 1; i++) {
        const gap = rawSegments[i + 1].x0 - rawSegments[i].x1;
        if (gap < minGap) {
          minGap = gap;
          mergeIdx = i;
        }
      }
      rawSegments[mergeIdx].x1 = rawSegments[mergeIdx + 1].x1;
      rawSegments.splice(mergeIdx + 1, 1);
    }

    if (rawSegments.length !== expectedFrames) {
      rawSegments = [];
      const colW = Math.floor(w / expectedFrames);
      for (let i = 0; i < expectedFrames; i++) {
        rawSegments.push({ x0: i * colW, x1: (i + 1) * colW - 1 });
      }
    }

    const framesOut = [];
    for (let f = 0; f < rawSegments.length; f++) {
      const seg = rawSegments[f];
      let minX = seg.x1;
      let maxX = seg.x0;
      let minY = h;
      let maxY = 0;

      for (let y = 0; y < h; y++) {
        for (let x = seg.x0; x <= seg.x1; x++) {
          const a = d[(y * w + x) * 4 + 3];
          if (a > 30) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (maxX <= minX || maxY <= minY) continue;

      const pad = 4;
      minX = Math.max(0, minX - pad);
      minY = Math.max(0, minY - pad);
      maxX = Math.min(w - 1, maxX + pad);
      maxY = Math.min(h - 1, maxY + pad);

      const cw = maxX - minX + 1;
      const ch = maxY - minY + 1;

      const fCanvas = document.createElement('canvas');
      fCanvas.width = cw;
      fCanvas.height = ch;
      const fctx = fCanvas.getContext('2d', { willReadFrequently: true });

      if (nativeFacing === -1) {
        fctx.translate(cw, 0);
        fctx.scale(-1, 1);
      }

      fctx.drawImage(tempCanvas, minX, minY, cw, ch, 0, 0, cw, ch);

      // Soft border feathering for VFX frames so no VFX can ever show a rectangular crop edge!
      if (isVfx && cw > 24 && ch > 24) {
        const fData = fctx.getImageData(0, 0, cw, ch);
        const fd = fData.data;
        const feather = 10;
        for (let fy = 0; fy < ch; fy++) {
          const dyEdge = Math.min(fy, ch - 1 - fy);
          for (let fx = 0; fx < cw; fx++) {
            const dxEdge = Math.min(fx, cw - 1 - fx);
            const distEdge = Math.min(dxEdge, dyEdge);
            if (distEdge < feather) {
              const aIdx = (fy * cw + fx) * 4 + 3;
              fd[aIdx] = Math.floor(fd[aIdx] * (distEdge / feather));
            }
          }
        }
        fctx.putImageData(fData, 0, 0);
      }

      framesOut.push(fCanvas);
    }

    return framesOut;
  }

  normalizeFrameArray(rawFrames, targetH) {
    if (!rawFrames || rawFrames.length === 0) return [];

    const heights = rawFrames.map((f) => f.height).sort((a, b) => a - b);
    const refH = heights[Math.floor(heights.length * 0.4)] || heights[0];
    const scale = targetH / refH;

    let maxW = 0;
    let maxH = 0;
    const scaledDims = rawFrames.map((f) => {
      const sw = Math.max(16, Math.round(f.width * scale));
      const sh = Math.max(16, Math.round(f.height * scale));
      if (sw > maxW) maxW = sw;
      if (sh > maxH) maxH = sh;
      return { sw, sh };
    });

    const boxW = maxW + 16;
    const boxH = Math.max(targetH + 24, maxH + 8);

    return rawFrames.map((f, idx) => {
      const { sw, sh } = scaledDims[idx];
      const c = document.createElement('canvas');
      c.width = boxW;
      c.height = boxH;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const dx = Math.round((boxW - sw) * 0.5);
      const dy = Math.round(boxH - 6 - sh);
      ctx.drawImage(f, 0, 0, f.width, f.height, dx, dy, sw, sh);
      return c;
    });
  }

  getHeroRigKey(u) {
    if (u.isPlayerTeam) {
      if (u.isAlliedSoldier) {
        if (u.troopType === 'archer') return 'archer';
        return 'twin_swords';
      }
      const heroId = u.heroConfig?.id;
      return HERO_RIG_MAP[heroId] || 'zhao_yun';
    }
    if (u.isBoss) {
      if (u.isVanguardGeneral) {
        const vanguards = ['xu_chu', 'meng_huo', 'heavy_warrior', 'guan_yu'];
        return vanguards[Math.abs(Math.floor(u.animSeed || 0)) % vanguards.length];
      }
      return 'boss_warlord';
    }
    if (u.isEnemyArcher) return 'archer';
    return 'enemy_soldier';
  }

  getHeroTintProfile() {
    return null;
  }

  getScaledSprite(rigKey, heroId = null) {
    const cacheKey = heroId ? `${rigKey}__${heroId}` : rigKey;
    if (this.scaledRigCache.has(cacheKey)) {
      return this.scaledRigCache.get(cacheKey);
    }

    const master = this.masterSprites[rigKey];
    if (!master) return null;

    const heightCfg = RIG_HEIGHT_CONFIG[rigKey] || { targetH: 106, footOffsetY: 4, isMounted: false };
    const dh = heightCfg.targetH;
    const tint = this.getHeroTintProfile(heroId, rigKey);

    const sheetCfg = RIG_SHEET_MAP[rigKey] || {};
    const rawRunFrames = sheetCfg.run ? this.masterSheets[sheetCfg.run] : null;
    const rawAttackFrames = sheetCfg.attack ? this.masterSheets[sheetCfg.attack] : null;

    // 1. Build Normalized Walk Frames from the 4-Frame Run Sprite Sheet
    let walkFrames = [];
    if (rawRunFrames && rawRunFrames.length >= 2) {
      walkFrames = this.normalizeFrameArray(rawRunFrames, dh, tint);
    } else {
      walkFrames = this.normalizeFrameArray([master], dh, tint);
    }

    // 2. Build Normalized Attack Frames from the 4-Frame Attack Sprite Sheet
    let attackFrames = [];
    if (rawAttackFrames && rawAttackFrames.length >= 2) {
      attackFrames = this.normalizeFrameArray(rawAttackFrames, dh, tint);
    } else {
      attackFrames = walkFrames;
    }

    // 3. Base Idle Frame
    const idleFrames = this.normalizeFrameArray([master], dh, tint);
    const idle0 = idleFrames[0] || walkFrames[0];

    // 4. Warm Hit-Flash Canvas
    const hurtCanvas = document.createElement('canvas');
    hurtCanvas.width = idle0.width;
    hurtCanvas.height = idle0.height;
    const hctx = hurtCanvas.getContext('2d');
    hctx.drawImage(idle0, 0, 0);
    hctx.globalCompositeOperation = 'source-atop';
    hctx.fillStyle = 'rgba(255, 140, 90, 0.35)';
    hctx.fillRect(0, 0, hurtCanvas.width, hurtCanvas.height);

    // 5. Cyan-Silver Afterimage Clone Canvas (for Skill Dash & Speed Flurry!)
    const strikeFrame = attackFrames[Math.min(1, attackFrames.length - 1)] || idle0;
    const afterimageCanvas = document.createElement('canvas');
    afterimageCanvas.width = strikeFrame.width;
    afterimageCanvas.height = strikeFrame.height;
    const actx = afterimageCanvas.getContext('2d');
    actx.drawImage(strikeFrame, 0, 0);
    actx.globalCompositeOperation = 'source-atop';
    actx.fillStyle = 'rgba(56, 189, 248, 0.55)';
    actx.fillRect(0, 0, afterimageCanvas.width, afterimageCanvas.height);

    const entry = {
      canvas: idle0,
      walkFrames,
      attackFrames,
      hurtCanvas,
      afterimageCanvas,
      dw: idle0.width,
      dh: idle0.height,
      footOffsetY: heightCfg.footOffsetY + 6,
      isMounted: heightCfg.isMounted,
    };
    this.scaledRigCache.set(cacheKey, entry);
    return entry;
  }

  getHeroPortraitDataUrl(heroId) {
    const rigKey = HERO_RIG_MAP[heroId] || 'zhao_yun';
    const master = this.masterSprites[rigKey];
    if (!master) return '';
    if (this.portraitDataUrls.has(heroId)) {
      return this.portraitDataUrls.get(heroId);
    }

    let hash = 0;
    const idStr = String(heroId || rigKey);
    for (let i = 0; i < idStr.length; i++) {
      hash = (hash * 33 + idStr.charCodeAt(i)) | 0;
    }
    const hVal = Math.abs(hash);

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pctx = pCanvas.getContext('2d');

    const bgPalettes = [
      ['#362417', '#120c08'],
      ['#1b2e20', '#09120b'],
      ['#1a2636', '#090e14'],
      ['#381c1c', '#140909'],
      ['#332914', '#120e07'],
    ];
    const pal = bgPalettes[hVal % bgPalettes.length];
    const grad = pctx.createRadialGradient(32, 32, 6, 32, 32, 36);
    grad.addColorStop(0, pal[0]);
    grad.addColorStop(1, pal[1]);
    pctx.fillStyle = grad;
    pctx.fillRect(0, 0, 64, 64);

    const cropH = Math.round(master.height * (0.56 + (hVal % 3) * 0.05));
    const scale = Math.min(60 / master.width, 60 / cropH) * (1.16 + (hVal % 4) * 0.04);
    const dw = Math.round(master.width * scale);
    const dh = Math.round(cropH * scale);
    const offsetX = ((hVal % 3) - 1) * 2;

    pctx.save();
    if ((hVal >> 3) % 2 === 1) {
      pctx.translate(64, 0);
      pctx.scale(-1, 1);
    }
    pctx.imageSmoothingEnabled = true;
    pctx.imageSmoothingQuality = 'high';
    pctx.drawImage(
      master,
      0,
      0,
      master.width,
      cropH,
      Math.round((64 - dw) * 0.5) + offsetX,
      Math.round((64 - dh) * 0.5) + 4,
      dw,
      dh
    );
    pctx.restore();

    pctx.strokeStyle = 'rgba(212, 166, 74, 0.35)';
    pctx.lineWidth = 2;
    pctx.strokeRect(1, 1, 62, 62);

    const url = pCanvas.toDataURL();
    this.portraitDataUrls.set(heroId, url);
    return url;
  }

  bakePixelLootIcons() {
    const types = ['gold', 'iron', 'item', 'seal'];
    const map = {};
    types.forEach((t) => {
      const c = document.createElement('canvas');
      c.width = 20;
      c.height = 20;
      const p = c.getContext('2d');
      p.imageSmoothingEnabled = false;

      p.fillStyle = 'rgba(0, 0, 0, 0.45)';
      p.fillRect(4, 15, 12, 3);

      if (t === 'gold') {
        p.fillStyle = '#92400e';
        p.fillRect(3, 9, 14, 6);
        p.fillStyle = '#facc15';
        p.fillRect(4, 9, 12, 5);
        p.fillRect(6, 6, 8, 3);
        p.fillStyle = '#fef08a';
        p.fillRect(7, 6, 6, 2);
      } else if (t === 'iron') {
        p.fillStyle = '#1e293b';
        p.fillRect(5, 6, 10, 9);
        p.fillStyle = '#64748b';
        p.fillRect(6, 7, 8, 7);
        p.fillStyle = '#cbd5e1';
        p.fillRect(7, 7, 4, 3);
      } else if (t === 'seal') {
        p.fillStyle = '#7f1d1d';
        p.fillRect(5, 4, 10, 12);
        p.fillStyle = '#dc2626';
        p.fillRect(6, 5, 8, 10);
        p.fillStyle = '#facc15';
        p.fillRect(8, 7, 4, 6);
      } else {
        p.fillStyle = '#451a03';
        p.fillRect(4, 6, 12, 9);
        p.fillStyle = '#b45309';
        p.fillRect(5, 7, 10, 7);
        p.fillStyle = '#f2c96d';
        p.fillRect(4, 9, 12, 2);
        p.fillRect(8, 8, 4, 4);
      }
      map[t] = c;
    });
    return map;
  }

  // --------------------------------------------------------------------------
  // 3. ANIMATED 4-FRAME SKILL VFX SHEETS & HERO DASH AFTERIMAGES
  // --------------------------------------------------------------------------
  pushVfxSprite(cfg) {
    if (this.vfxSprites.length >= 32) {
      this.vfxSprites.shift();
    }
    this.vfxSprites.push(cfg);
  }

  spawnSkillPixelVfx(vfx) {
    const playH = this.height - 38;
    const groundY = playH - 12;
    const scaleX = this.width / 1050;
    const sx = (vfx.x || 420) * scaleX;
    const casterSx = (vfx.casterX || vfx.attackerX || 290) * scaleX;
    const sy = groundY - 46;
    const type = vfx.type || 'aoe_burst';

    if (type === 'basic_weapon_strike') {
      const wt = vfx.weaponType || 'spear';
      const dir = sx >= casterSx ? 1 : -1;

      if (wt === 'bow') {
        this.pushVfxSprite({
          sheetKey: 'vfx_sheet_arrow',
          x: casterSx + dir * 34,
          y: sy - 4,
          vx: dir * 420,
          vy: 0,
          w: 52,
          h: 36,
          facing: dir,
          life: 0.2,
          maxLife: 0.2,
          scaleGrow: 0.12,
        });
      }

      if (vfx.isCrit || dir > 0) {
        this.pushVfxSprite({
          sheetKey: 'vfx_sheet_hit',
          x: sx + (Math.random() - 0.5) * 8,
          y: sy - 4 + (Math.random() - 0.5) * 6,
          vx: dir * 12,
          vy: 0,
          w: vfx.isCrit ? 40 : 28,
          h: vfx.isCrit ? 40 : 28,
          facing: dir,
          life: 0.18,
          maxLife: 0.18,
          scaleGrow: 0.15,
        });
      }
      return;
    }

    if (type === 'dragon_cleave') {
      for (let w = 0; w < 3; w++) {
        this.pushVfxSprite({
          sheetKey: 'vfx_sheet_dragon',
          x: casterSx + 42 + w * 54,
          y: groundY - 58 - (w % 2) * 10,
          vx: 280 + w * 40,
          vy: 0,
          w: 132 + w * 14,
          h: 112 + w * 10,
          facing: 1,
          life: 0.48 + w * 0.1,
          maxLife: 0.48 + w * 0.1,
          scaleGrow: 0.24,
        });
      }
    } else if (type === 'crimson_cross') {
      for (let w = 0; w < 3; w++) {
        this.pushVfxSprite({
          sheetKey: w % 2 === 0 ? 'vfx_sheet_crimson' : 'vfx_sheet_fire',
          x: sx - 30 + w * 55,
          y: groundY - 64,
          vx: 130,
          vy: 0,
          w: 136,
          h: 120,
          facing: 1,
          life: 0.5 + w * 0.08,
          maxLife: 0.5 + w * 0.08,
          scaleGrow: 0.26,
        });
      }
    } else if (type === 'spear_flurry' || type === 'phantom_charge') {
      for (let w = 0; w < 4; w++) {
        this.pushVfxSprite({
          sheetKey: 'vfx_sheet_spear',
          x: casterSx + 36 + w * 42,
          y: groundY - 52 + ((w % 3) - 1) * 12,
          vx: 360 + w * 35,
          vy: 0,
          w: 134,
          h: 84,
          facing: 1,
          life: 0.4 + w * 0.07,
          maxLife: 0.4 + w * 0.07,
          scaleGrow: 0.25,
        });
      }
    } else if (type === 'bagua_lightning') {
      for (let w = 0; w < 4; w++) {
        this.pushVfxSprite({
          sheetKey: 'vfx_sheet_lightning',
          x: sx - 45 + w * 48,
          y: groundY - 74,
          vx: 0,
          vy: 0,
          w: 116,
          h: 138,
          facing: 1,
          life: 0.46 + w * 0.09,
          maxLife: 0.46 + w * 0.09,
          scaleGrow: 0.2,
        });
      }
    } else if (type === 'arrow_rain') {
      for (let w = 0; w < 4; w++) {
        this.pushVfxSprite({
          sheetKey: 'vfx_sheet_arrow',
          x: sx - 60 + w * 52,
          y: groundY - 82 - w * 10,
          vx: 180,
          vy: 70,
          w: 124,
          h: 92,
          facing: 1,
          life: 0.48 + w * 0.08,
          maxLife: 0.48 + w * 0.08,
          scaleGrow: 0.22,
        });
      }
    } else if (type === 'ice_nova' || type === 'heal_banner') {
      for (let w = 0; w < 3; w++) {
        this.pushVfxSprite({
          sheetKey: 'vfx_sheet_ice',
          x: sx - 36 + w * 54,
          y: groundY - 68,
          vx: 20,
          vy: 0,
          w: 126,
          h: 126,
          facing: 1,
          life: 0.48 + w * 0.09,
          maxLife: 0.48 + w * 0.09,
          scaleGrow: 0.24,
        });
      }
    } else {
      for (let w = 0; w < 3; w++) {
        this.pushVfxSprite({
          sheetKey: 'vfx_sheet_fire',
          x: sx - 36 + w * 52,
          y: groundY - 72,
          vx: 24,
          vy: 0,
          w: 122,
          h: 138,
          facing: 1,
          life: 0.5 + w * 0.09,
          maxLife: 0.5 + w * 0.09,
          scaleGrow: 0.24,
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 3B. DYNAMIC STAGE WEATHER ATMOSPHERE (EMBERS, SPARKS, PETALS, SNOW, METEOR)
  // --------------------------------------------------------------------------
  updateAndDrawWeatherParticles(ctx, W, playH, dt) {
    if (!this.weatherParticles) {
      this.weatherParticles = [];
    }
    const stage = this.engine.getCurrentStage ? this.engine.getCurrentStage() : null;
    const wType = stage?.weatherType || 'sparks';

    while (this.weatherParticles.length < 34) {
      this.weatherParticles.push({
        x: Math.random() * W,
        y: Math.random() * playH,
        vx:
          wType === 'snow'
            ? -25 - Math.random() * 30
            : wType === 'petals'
              ? -45 - Math.random() * 40
              : wType === 'meteor'
                ? -140 - Math.random() * 90
                : -35 + (Math.random() - 0.5) * 45,
        vy:
          wType === 'embers'
            ? -22 - Math.random() * 28
            : wType === 'meteor'
              ? 65 + Math.random() * 45
              : 18 + Math.random() * 26,
        size: wType === 'petals' || wType === 'snow' ? 3 : 2,
        phase: Math.random() * Math.PI * 2,
        wType,
      });
    }

    ctx.save();
    for (let i = 0; i < this.weatherParticles.length; i++) {
      const p = this.weatherParticles[i];
      if (p.wType !== wType) {
        p.wType = wType;
      }
      p.phase += dt * 3;
      p.x += (p.vx + Math.sin(p.phase) * 12) * dt;
      p.y += p.vy * dt;

      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = playH - 6;
      if (p.y > playH) p.y = 4;

      if (wType === 'embers') {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(251, 146, 60, 0.78)' : 'rgba(250, 204, 21, 0.75)';
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 3, 2);
      } else if (wType === 'petals') {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(253, 164, 175, 0.82)' : 'rgba(251, 113, 133, 0.75)';
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 4, 3);
      } else if (wType === 'snow') {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(248, 250, 252, 0.85)' : 'rgba(186, 230, 253, 0.78)';
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 3, 3);
      } else if (wType === 'meteor') {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(250, 204, 21, 0.85)' : 'rgba(244, 63, 94, 0.82)';
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 6, 2);
      } else {
        ctx.fillStyle = 'rgba(253, 224, 71, 0.62)';
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
      }
    }
    ctx.restore();
  }

  // --------------------------------------------------------------------------
  // 4. SEAMLESS MIRROR-TILED PARALLAX 5-STAGE HD BATTLEFIELD BACKGROUND
  // --------------------------------------------------------------------------
  drawBattlefieldBackground(ctx, W, H, playH) {
    const stageId = this.engine.state?.currentStageId || 1;
    const bgKey = STAGE_BG_MAP[stageId] || 'hulao';
    const bgImg = this.bgImages[bgKey] || this.bgImages.hulao;

    ctx.fillStyle = '#0d0907';
    ctx.fillRect(0, 0, W, H);

    if (bgImg) {
      const srcX = Math.round(bgImg.width * 0.02);
      const srcY = bgKey === 'hulao' ? Math.round(bgImg.height * 0.14) : 0;
      const srcW = bgKey === 'hulao' ? Math.round(bgImg.width * 0.80) : Math.round(bgImg.width * 0.96);
      const srcH = bgImg.height - srcY;

      const tileW = Math.max(520, Math.round((srcW / srcH) * playH));
      const periodW = tileW * 2;
      const rawScroll = Math.max(0, (this.engine.scrollOffset || 0) * 0.45);
      const scroll = rawScroll % periodW;

      let tileIdx = Math.floor(rawScroll / tileW);
      for (let x = -(scroll % tileW), step = 0; x < W + tileW; x += tileW, step++) {
        const ix = Math.round(x);
        const isMirrored = (tileIdx + step) % 2 !== 0;
        ctx.save();
        if (isMirrored) {
          ctx.translate(ix + tileW, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(bgImg, srcX, srcY, srcW, srcH, -1, 0, tileW + 2, playH);
        } else {
          ctx.drawImage(bgImg, srcX, srcY, srcW, srcH, ix, 0, tileW + 2, playH);
        }
        ctx.restore();
      }
    }

    const vignette = ctx.createLinearGradient(0, 0, 0, playH);
    vignette.addColorStop(0, 'rgba(8, 6, 5, 0.28)');
    vignette.addColorStop(0.65, 'rgba(10, 8, 6, 0.06)');
    vignette.addColorStop(1, 'rgba(6, 5, 4, 0.62)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, playH);

    ctx.fillStyle = '#8c6628';
    ctx.fillRect(0, 0, W, 2);
  }

  // --------------------------------------------------------------------------
  // 5. AUTHENTIC IMPERIAL LACQUER SKILL CUT-IN BANNER
  // --------------------------------------------------------------------------
  drawSkillCutInBanner(ctx) {
    const ci = this.engine.skillCutIn;
    if (!ci || ci.timer <= 0) return;

    const p = 1 - ci.timer / ci.maxTimer;
    let slideAlpha = 1;
    let offsetX = 0;
    if (p < 0.14) {
      const t = p / 0.14;
      offsetX = -(1 - t) * 200;
      slideAlpha = t;
    } else if (p > 0.80) {
      const t = (p - 0.80) / 0.20;
      offsetX = -t * 120;
      slideAlpha = 1 - t;
    }

    const rigKey = HERO_RIG_MAP[ci.heroId] || 'lu_bu';
    const master = this.masterSprites[rigKey];

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, slideAlpha));
    ctx.translate(Math.round(12 + offsetX), 8);

    ctx.fillStyle = 'rgba(16, 11, 8, 0.94)';
    ctx.fillRect(0, 0, 268, 42);
    ctx.strokeStyle = '#b88b3a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, 268, 42);
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(2, 2, 4, 38);

    if (master) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(8, 2, 48, 38);
      ctx.clip();
      const cropH = Math.round(master.height * 0.58);
      const scale = Math.min(48 / master.width, 40 / cropH) * 1.18;
      const pw = Math.round(master.width * scale);
      const ph = Math.round(cropH * scale);
      ctx.drawImage(master, 0, 0, master.width, cropH, Math.round(32 - pw * 0.5), 2, pw, ph);
      ctx.restore();
    }

    ctx.textAlign = 'left';
    ctx.font = '700 9.5px "Segoe UI", sans-serif';
    ctx.fillStyle = '#d4a64a';
    ctx.fillText(ci.heroName, 62, 16);

    ctx.font = '900 12px "Cinzel", "Segoe UI", serif';
    ctx.fillStyle = '#f5ebd6';
    ctx.fillText(ci.skillName.toUpperCase(), 62, 33);

    ctx.restore();
  }

  // --------------------------------------------------------------------------
  // 6. MAIN 60FPS GPU-ACCELERATED RENDER LOOP (FLUSH BOTTOM-OF-SCREEN DESKRAWL)
  // --------------------------------------------------------------------------
  render(dt) {
    const ctx = this.ctx;
    const W = this.width;
    const H = this.height;
    const playH = H;
    const groundY = H - 20;
    const time = Math.max(0, this.engine.time || 0);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const shakeX = this.engine.screenShake > 0 ? (Math.random() - 0.5) * this.engine.screenShake * 1.1 : 0;
    const shakeY = this.engine.screenShake > 0 ? (Math.random() - 0.5) * this.engine.screenShake * 0.7 : 0;

    ctx.save();
    if (shakeX !== 0 || shakeY !== 0) {
      ctx.translate(Math.round(shakeX), Math.round(shakeY));
    }

    // 1. Seamless Mirror-Tiled Parallax Battlefield Background
    this.drawBattlefieldBackground(ctx, W, H, playH);

    // 1B. Dynamic Stage Weather Atmosphere
    this.updateAndDrawWeatherParticles(ctx, W, playH, dt);

    if (!this.assetsReady) {
      ctx.restore();
      return;
    }

    const scaleX = W / 1050;

    // 2. 3-Tier Evolving Supply Cart (Mộc Ngưu Lưu Mã) + Deskrawl Golden Treasure Beam!
    const cartLv = this.engine.state?.buildings?.supply_workshop || 1;
    const cartKey =
      cartLv >= 5
        ? 'supply_cart_tier3'
        : cartLv >= 3
          ? 'supply_cart_tier2'
          : 'supply_cart';
    const cartMaster = this.masterSprites[cartKey] || this.masterSprites.supply_cart;
    const cartScreenX = this.engine.mainUnit ? Math.round((this.engine.mainUnit.x - 125) * scaleX) : Math.round(160 * scaleX);

    if (this.engine.mainUnit && cartMaster) {
      const isMovingCart = !this.engine.inTownMode && this.engine.mainUnit.isMoving;
      const bobY = isMovingCart ? Math.sin(time * 14) * 2.2 : 0;
      const tilt = isMovingCart ? Math.cos(time * 14) * 0.02 : 0;
      const targetH = cartLv >= 5 ? 92 : cartLv >= 3 ? 86 : 82;
      const targetW = Math.round((cartMaster.width / cartMaster.height) * targetH);

      // Golden Loot Beam rising from Supply Cart (just like Deskrawl Screenshot #1 & #2!)
      const invCount = this.engine.state?.inventory?.length || 0;
      if (invCount > 0 || this.engine.groundDrops.length > 0) {
        ctx.save();
        const beamGrad = ctx.createLinearGradient(cartScreenX, groundY - 26, cartScreenX, groundY - 145);
        beamGrad.addColorStop(0, 'rgba(245, 158, 11, 0.55)');
        beamGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.22)');
        beamGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(cartScreenX - 18, groundY - 24);
        ctx.lineTo(cartScreenX + 18, groundY - 24);
        ctx.lineTo(cartScreenX + 34, groundY - 145);
        ctx.lineTo(cartScreenX - 34, groundY - 145);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(Math.round(cartScreenX - targetW * 0.36), groundY - 4, Math.round(targetW * 0.72), 5);

      ctx.save();
      ctx.translate(cartScreenX, Math.round(groundY - targetH * 0.5 + 4 + bobY));
      ctx.rotate(tilt);
      ctx.drawImage(
        cartMaster,
        Math.round(-targetW * 0.5),
        Math.round(-targetH * 0.5),
        targetW,
        targetH
      );
      ctx.restore();
    }

    // 2A. TOWN OUTPOST MODE: Render Interactive NPC Pavilions along the stone road (Deskrawl Screenshots #4-#7!)
    if (this.engine.inTownMode) {
      this.drawTownOutpostStalls(ctx, W, groundY, scaleX, time);
    }

    // 2B. Dynamic Battlefield Encounter ("Kỳ Ngộ Hành Quân") Interactive Banner & Chest
    if (!this.engine.inTownMode && this.engine.fieldEvent && !this.engine.fieldEvent.claimed) {
      const ev = this.engine.fieldEvent;
      const evX = Math.round(ev.x * scaleX);
      const evY = groundY - 22 + Math.sin(time * 6) * 3;
      const iconImg = this.masterSprites.supply_cart_tier2 || this.masterSprites.supply_cart;
      if (iconImg) {
        ctx.drawImage(iconImg, evX - 28, evY - 24, 56, 44);
      }
      ctx.fillStyle = 'rgba(16, 11, 8, 0.92)';
      ctx.fillRect(evX - 72, evY - 48, 144, 20);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(evX - 72, evY - 48, 144, 20);
      ctx.font = 'bold 9.5px "Noto Serif", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047';
      ctx.fillText(`⚡ ${ev.title}`, evX, evY - 35);
    }

    // 2C. Render Skill Dash Afterimage Clones behind Heroes!
    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      const ai = this.afterimages[i];
      ai.life -= dt;
      if (ai.life <= 0) {
        this.afterimages.splice(i, 1);
        continue;
      }
      const sp = this.getScaledSprite(ai.rigKey, ai.heroId);
      if (sp && sp.afterimageCanvas) {
        ctx.save();
        ctx.globalAlpha = (ai.life / ai.maxLife) * 0.55;
        ctx.drawImage(
          sp.afterimageCanvas,
          Math.round(ai.x - sp.afterimageCanvas.width * 0.5),
          Math.round(ai.y - sp.afterimageCanvas.height + sp.footOffsetY),
          sp.afterimageCanvas.width,
          sp.afterimageCanvas.height
        );
        ctx.restore();
      }
    }

    // 2D. 1v1 Single Combat Duel ("NHẤT KỴ ĐƯƠNG THIÊN") Golden Arena Ring!
    if (!this.engine.inTownMode && this.engine.activeDuel && this.engine.mainUnit) {
      const duelCenterX = Math.round((this.engine.mainUnit.x + 44) * scaleX);
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.78)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(duelCenterX, groundY - 6, 135, 16, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Depth-Sort & Render All Living Units Using Authentic 4-Frame Sprite Sheets!
    const allUnits = [
      ...(this.engine.alliedTroops || []),
      ...this.engine.squadUnits,
      ...(this.engine.mainUnit ? [this.engine.mainUnit] : []),
      ...this.engine.enemies.filter((e) => e.hp > 0),
    ];
    allUnits.sort((a, b) => a.y - b.y);

    for (let idx = 0; idx < allUnits.length; idx++) {
      const u = allUnits[idx];
      const rigKey = this.getHeroRigKey(u);
      const sprite = this.getScaledSprite(rigKey, u.heroConfig?.id);
      if (!sprite) continue;

      const sx = Math.round(u.x * scaleX);
      const sy = groundY + Math.round((u.y - 148) * 0.32);

      const seed = Number.isFinite(u.animSeed) ? u.animSeed : 0;
      let animDx = 0;
      let animDy = 0;
      let frameCanvas = sprite.canvas;

      const roleScale =
        u.isBoss && !u.isVanguardGeneral
          ? 1.16
          : u.isMainHero
            ? 1.04
            : u.isBoss || u.isSquadGeneral
              ? 1.0
              : u.isAlliedSoldier
                ? 0.85
                : 0.90;

      if (u.hurtAnim > 0.65) {
        frameCanvas = sprite.hurtCanvas || sprite.canvas;
        animDx = -u.facing * 4;
      } else if (u.attackAnim > 0.04) {
        const p = Math.max(0, Math.min(0.999, 1 - u.attackAnim));
        const totalAtkFrames = sprite.attackFrames.length;
        const atkIdx = Math.max(0, Math.min(totalAtkFrames - 1, Math.floor(p * totalAtkFrames)));
        frameCanvas = sprite.attackFrames[atkIdx] || sprite.canvas;
        const strikeWave = Math.sin(p * Math.PI);
        animDx = 12 * strikeWave;
        animDy = -3 * strikeWave;
      } else if (u.isMoving) {
        const walkFps = sprite.isMounted ? 7.2 : 6.2;
        const totalWalkFrames = sprite.walkFrames.length;
        const rawWalk = Math.floor(time * walkFps + seed * 5);
        const walkFrameIdx = ((rawWalk % totalWalkFrames) + totalWalkFrames) % totalWalkFrames;
        frameCanvas = sprite.walkFrames[walkFrameIdx] || sprite.canvas;
        animDy = -Math.abs(Math.sin(time * walkFps * 0.7 + seed)) * 1.6;

        if (Math.random() < 0.06 && this.dustParticles.length < 28) {
          this.dustParticles.push({
            x: sx - u.facing * 14,
            y: sy - 2,
            vx: -u.facing * (22 + Math.random() * 26),
            vy: -10 - Math.random() * 14,
            life: 0.24,
          });
        }
      } else {
        const idleBreath = Math.sin(time * 3.2 + seed) * 1.0;
        frameCanvas = sprite.canvas;
        animDy = idleBreath;
      }

      const dw = Math.round(frameCanvas.width * roleScale);
      const dh = Math.round(frameCanvas.height * roleScale);

      // Ground Shadow & Boss Aura Ring (like Deskrawl Screenshot #1!)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
      const shW = Math.min(58, Math.round(dw * 0.4));
      ctx.fillRect(Math.round(sx - shW * 0.5), sy - 3, shW, 4);

      if (u.isBoss) {
        ctx.save();
        ctx.strokeStyle = u.isVanguardGeneral ? 'rgba(192, 132, 252, 0.65)' : 'rgba(239, 68, 68, 0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(sx, sy - 1, shW * 0.72, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.translate(Math.round(sx + animDx * u.facing), Math.round(sy + animDy));
      if (u.facing < 0) {
        ctx.scale(-1, 1);
      }

      ctx.drawImage(
        frameCanvas,
        Math.round(-dw * 0.5),
        Math.round(-dh + sprite.footOffsetY * roleScale),
        dw,
        dh
      );
      ctx.restore();

      // Overhead Mini HP Bar (for regular mobs & main hero; Bosses also have the bottom-center Deskrawl Boss Bar!)
      if (!this.engine.inTownMode && (u.isBoss || (!u.isAlliedSoldier && u.hp < u.maxHp))) {
        const barW = u.isBoss ? 52 : 28;
        const barH = u.isBoss ? 4 : 3;
        const bx = Math.round(sx - barW / 2);
        const by = Math.round(sy - (dh - sprite.footOffsetY * roleScale) + 6);
        const hpRatio = Math.max(0, Math.min(1, u.hp / Math.max(1, u.maxHp)));

        ctx.fillStyle = '#090a0f';
        ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
        ctx.fillStyle = u.isPlayerTeam
          ? '#22c55e'
          : u.isBoss && !u.isVanguardGeneral
            ? '#ef4444'
            : u.isVanguardGeneral
              ? '#c084fc'
              : '#b91c1c';
        ctx.fillRect(bx, by, Math.round(barW * hpRatio), barH);
      }
    }

    // 3B. Pixel Footstep Dust Puffs
    if (this.dustParticles.length > 0) {
      ctx.fillStyle = 'rgba(186, 160, 126, 0.65)';
      for (let i = this.dustParticles.length - 1; i >= 0; i--) {
        const dp = this.dustParticles[i];
        dp.life -= dt;
        if (dp.life <= 0) {
          this.dustParticles.splice(i, 1);
          continue;
        }
        dp.x += dp.vx * dt;
        dp.y += dp.vy * dt;
        ctx.fillRect(Math.round(dp.x), Math.round(dp.y), 3, 3);
      }
    }

    // 4. DIABLO / DESKRAWL LOOT FOUNTAIN: Vertical Light Beams + Stacked Colored Item Nameplates (Deskrawl Screenshot #2!)
    const drops = this.engine.groundDrops;
    for (let i = 0; i < drops.length; i++) {
      const drop = drops[i];
      const dx = Math.round(drop.x * scaleX);
      const age = drop.age || 0;
      let arcY = 0;
      if (age < 0.35) {
        arcY = Math.sin((age / 0.35) * Math.PI) * 32;
      }
      const dy = Math.round(groundY - 10 - arcY);
      const beamColor = drop.color || '#facc15';

      // Tall Glowing Vertical Loot Beam (Exactly like Deskrawl Screenshot #2!)
      if (drop.type === 'item' || drop.isCaptureSoul || (drop.type === 'gold' && drop.amount >= 40)) {
        const beamH = drop.type === 'item' || drop.isCaptureSoul ? 115 : 70;
        const beamW = drop.type === 'item' ? 14 : 10;
        ctx.save();
        const bGrad = ctx.createLinearGradient(dx, dy, dx, dy - beamH);
        bGrad.addColorStop(0, beamColor);
        bGrad.addColorStop(0.35, `${beamColor}66`);
        bGrad.addColorStop(1, `${beamColor}00`);
        ctx.fillStyle = bGrad;
        ctx.fillRect(dx - Math.round(beamW * 0.5), dy - beamH, beamW, beamH);

        // Bright core line
        ctx.fillStyle = '#ffffffaa';
        ctx.fillRect(dx - 1, dy - Math.round(beamH * 0.7), 2, Math.round(beamH * 0.7));
        ctx.restore();
      }

      const iconCanvas = drop.isCaptureSoul
        ? this.lootIcons.seal
        : this.lootIcons[drop.type] || this.lootIcons.item;
      ctx.drawImage(iconCanvas, dx - 10, dy - 10, 20, 20);

      // Stacked Diablo Item Label Pill above the ground
      if (drop.label) {
        const stackRow = i % 5;
        const labelY = dy - 18 - stackRow * 16;
        ctx.font = '700 10.5px "Noto Serif", "Segoe UI", serif';
        const tw = Math.ceil(ctx.measureText(drop.label).width) + 12;
        const lx = Math.round(dx - tw * 0.5);

        ctx.fillStyle = 'rgba(10, 8, 6, 0.86)';
        ctx.fillRect(lx, labelY - 11, tw, 15);
        ctx.strokeStyle = beamColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(lx, labelY - 11, tw, 15);

        ctx.textAlign = 'center';
        ctx.fillStyle = beamColor;
        ctx.fillText(drop.label, dx, labelY);
      }
    }

    // 6. Spawn New Engine VFX Events
    const vfxList = this.engine.vfxEffects;
    for (let i = 0; i < vfxList.length; i++) {
      const vfx = vfxList[i];
      if (!vfx.spawnedPixel) {
        vfx.spawnedPixel = true;
        this.spawnSkillPixelVfx(vfx);
      }
    }

    // 7. Render Multi-Wave 4-Frame Animated VFX Sheets & HD VFX Sprites
    if (this.vfxSprites.length > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = this.vfxSprites.length - 1; i >= 0; i--) {
        const fx = this.vfxSprites[i];
        fx.life -= dt;
        if (fx.life <= 0) {
          this.vfxSprites.splice(i, 1);
          continue;
        }
        fx.x += fx.vx * dt;
        fx.y += fx.vy * dt;

        const progress = Math.max(0, Math.min(0.999, 1 - fx.life / fx.maxLife));
        let img = null;
        if (fx.sheetKey && this.masterSheets[fx.sheetKey]?.length > 0) {
          const sheetFrames = this.masterSheets[fx.sheetKey];
          const fIdx = Math.min(sheetFrames.length - 1, Math.floor(progress * sheetFrames.length));
          img = sheetFrames[fIdx];
        } else if (fx.spriteKey) {
          img = this.masterSprites[fx.spriteKey];
        }
        if (!img) continue;

        const scale = 1 + (fx.scaleGrow || 0.22) * progress;
        const alpha = (progress < 0.14 ? progress / 0.14 : Math.min(1, (fx.life / fx.maxLife) * 1.35)) * 0.86;
        const dw = Math.round(fx.w * scale);
        const dh = Math.round(fx.h * scale);

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.translate(Math.round(fx.x), Math.round(fx.y));
        if (fx.facing === -1) {
          ctx.scale(-1, 1);
        }
        ctx.drawImage(img, Math.round(-dw * 0.5), Math.round(-dh * 0.5), dw, dh);
        ctx.restore();
      }
      ctx.restore();
    }

    // 8. Deskrawl-Style Bold Golden & White Combat Damage Numbers (like Screenshot #1 & #3: 753,394 / 34,231!)
    const texts = this.engine.floatingTexts;
    const startIdx = Math.max(0, texts.length - 8);
    for (let i = startIdx; i < texts.length; i++) {
      const ft = texts[i];
      const slotOffset = (((i - startIdx) % 3) - 1) * 22;
      const fx = Math.round(ft.x * scaleX) + slotOffset;
      const fy = Math.round(groundY - (170 - ft.y) * 0.78) - (i - startIdx) * 7;
      const fontSize = Math.min(18, Math.max(12, ft.size + 2));
      ctx.font = `900 ${fontSize}px "Noto Serif", "Cinzel", serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#050403';
      ctx.fillText(ft.text, fx + 1, fy + 2);
      ctx.fillStyle = ft.color === '#c084fc' || ft.color === '#a855f7' ? '#fde047' : ft.color;
      ctx.fillText(ft.text, fx, fy);
    }

    // 9. Musou Skill Cut-In Portrait Banner
    this.drawSkillCutInBanner(ctx);

    ctx.restore();
  }

  drawTownOutpostStalls(ctx, W, groundY, scaleX, time) {
    const stalls = [
      { id: 'forge', x: 455, icon: '⚒', name: 'Thợ Rèn Thần Binh', sub: 'Cường Hóa & Trang Bị', color: '#f59e0b', rig: 'xu_chu' },
      { id: 'generals', x: 615, icon: '🏮', name: 'Điểm Tướng Đài', sub: 'Danh Tướng & Thu Phục', color: '#22c55e', rig: 'zhuge_liang' },
      { id: 'town', x: 775, icon: '📕', name: 'Thái Học Viện', sub: 'Võ Kỹ & Thiên Phú', color: '#38bdf8', rig: 'sima_yi' },
      { id: 'campaign', x: 935, icon: '🗺️', name: 'Sa Bàn Quân Cơ', sub: 'Chiến Dịch & Ngũ Quan', color: '#f43f5e', rig: 'guan_yu' },
    ];

    stalls.forEach((st, idx) => {
      const sx = Math.round(st.x * scaleX);
      const sy = groundY - 6;

      // Pavilion Wooden Canopy & Pillars
      ctx.save();
      ctx.fillStyle = 'rgba(20, 14, 10, 0.88)';
      ctx.fillRect(sx - 54, sy - 92, 108, 88);
      ctx.strokeStyle = st.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sx - 54, sy - 92, 108, 88);

      // Roof eave
      ctx.fillStyle = '#3a2214';
      ctx.fillRect(sx - 60, sy - 98, 120, 10);
      ctx.strokeStyle = '#d4a64a';
      ctx.strokeRect(sx - 60, sy - 98, 120, 10);

      // NPC Master inside stall
      const npcSprite = this.getScaledSprite(st.rig, null);
      if (npcSprite && npcSprite.canvas) {
        const nh = 74;
        const nw = Math.round((npcSprite.canvas.width / npcSprite.canvas.height) * nh);
        const bob = Math.sin(time * 3 + idx) * 1.2;
        ctx.drawImage(npcSprite.canvas, Math.round(sx - nw * 0.5), Math.round(sy - nh + 4 + bob), nw, nh);
      }

      // Signboard above stall
      ctx.fillStyle = 'rgba(12, 8, 6, 0.95)';
      ctx.fillRect(sx - 62, sy - 120, 124, 20);
      ctx.strokeStyle = st.color;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(sx - 62, sy - 120, 124, 20);

      ctx.font = '700 10px "Noto Serif", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fef08a';
      ctx.fillText(`${st.icon} ${st.name}`, sx, sy - 107);
      ctx.restore();
    });
  }
}
