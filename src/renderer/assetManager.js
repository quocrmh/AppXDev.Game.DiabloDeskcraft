// ============================================================================
// HD SPRITE & BACKGROUND ASSET MANAGER WITH SMART CHROMA/FLOOD-FILL KEYING
// ============================================================================

const RAW_ASSETS = {
  bg_hulao: 'assets/bg_hulao_gate.png',
  bg_red_cliffs: 'assets/bg_red_cliffs.png',
  lu_bu: 'assets/sprite_lu_bu.png',
  guan_yu: 'assets/sprite_guan_yu.png',
  zhao_yun: 'assets/sprite_zhao_yun.png',
  zhuge_liang: 'assets/sprite_zhuge_liang.png',
  supply_cart: 'assets/sprite_supply_cart.png',
  enemy_soldier: 'assets/sprite_enemy_soldier.png',
  boss_warlord: 'assets/sprite_boss_warlord.png',
  vfx_slash: 'assets/vfx_dragon_slash.png',
};

class GameAssetManager {
  constructor() {
    this.backgrounds = {};
    this.sprites = {};
    this.tintedCache = {};
    this.loaded = false;
  }

  async loadAll() {
    const entries = Object.entries(RAW_ASSETS);
    await Promise.all(
      entries.map(async ([key, src]) => {
        try {
          const img = await this.loadImage(src);
          if (key.startsWith('bg_')) {
            this.backgrounds[key] = img;
          } else {
            this.sprites[key] = this.removeBlackBackgroundAndCrop(img, key === 'vfx_slash');
          }
        } catch (err) {
          console.warn(`[AssetManager] Could not load ${src}:`, err);
        }
      })
    );
    this.loaded = true;
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = `${src}?v=${Date.now()}`;
    });
  }

  /**
   * Removes solid black (#000000) background using border flood-fill + luminance feathering,
   * then crops tightly to the non-transparent character bounds so feet sit accurately on ground.
   */
  removeBlackBackgroundAndCrop(img, isAdditiveVfx = false) {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tCtx = tempCanvas.getContext('2d');
    tCtx.drawImage(img, 0, 0);

    const imgData = tCtx.getImageData(0, 0, w, h);
    const data = imgData.data;

    if (isAdditiveVfx) {
      // For glowing VFX, convert brightness to alpha
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = Math.max(r, g, b);
        if (lum < 22) {
          data[i + 3] = 0;
        } else if (lum < 75) {
          data[i + 3] = Math.min(255, Math.round((lum - 22) * 4.5));
        }
      }
    } else {
      // Flood fill from all 4 outer borders for dark background pixels
      const visited = new Uint8Array(w * h);
      const queue = new Int32Array(w * h);
      let head = 0;
      let tail = 0;

      const isBgColor = (idx4) => {
        const r = data[idx4];
        const g = data[idx4 + 1];
        const b = data[idx4 + 2];
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        // Dark nearly-black background pixel
        return maxC < 36 && (maxC - minC) < 22;
      };

      // Seed border pixels
      for (let x = 0; x < w; x++) {
        const topIdx = x;
        const botIdx = (h - 1) * w + x;
        if (isBgColor(topIdx * 4)) {
          visited[topIdx] = 1;
          queue[tail++] = topIdx;
        }
        if (isBgColor(botIdx * 4)) {
          visited[botIdx] = 1;
          queue[tail++] = botIdx;
        }
      }
      for (let y = 0; y < h; y++) {
        const leftIdx = y * w;
        const rightIdx = y * w + (w - 1);
        if (!visited[leftIdx] && isBgColor(leftIdx * 4)) {
          visited[leftIdx] = 1;
          queue[tail++] = leftIdx;
        }
        if (!visited[rightIdx] && isBgColor(rightIdx * 4)) {
          visited[rightIdx] = 1;
          queue[tail++] = rightIdx;
        }
      }

      // BFS flood-fill
      while (head < tail) {
        const curr = queue[head++];
        data[curr * 4 + 3] = 0; // Set transparent
        const cx = curr % w;
        const cy = (curr / w) | 0;

        const neighbors = [];
        if (cx > 0) neighbors.push(curr - 1);
        if (cx < w - 1) neighbors.push(curr + 1);
        if (cy > 0) neighbors.push(curr - w);
        if (cy < h - 1) neighbors.push(curr + w);

        for (let n = 0; n < neighbors.length; n++) {
          const nb = neighbors[n];
          if (!visited[nb] && isBgColor(nb * 4)) {
            visited[nb] = 1;
            queue[tail++] = nb;
          }
        }
      }

      // Second pass: clear enclosed pure-black background holes & feather edges
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = y * w + x;
          const i4 = idx * 4;
          if (data[i4 + 3] === 0) continue;
          const r = data[i4];
          const g = data[i4 + 1];
          const b = data[i4 + 2];
          const maxC = Math.max(r, g, b);
          if (maxC < 12) {
            data[i4 + 3] = 0;
          } else if (
            visited[idx - 1] ||
            visited[idx + 1] ||
            visited[idx - w] ||
            visited[idx + w]
          ) {
            // Edge anti-aliasing feather
            if (maxC < 52) {
              data[i4 + 3] = Math.round(((maxC - 12) / 40) * 200);
            }
          }
        }
      }
    }

    tCtx.putImageData(imgData, 0, 0);

    // Find tight bounding box of non-transparent pixels
    let minX = w,
      minY = h,
      maxX = 0,
      maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > 25) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX <= minX || maxY <= minY) {
      return tempCanvas;
    }

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    const cropped = document.createElement('canvas');
    cropped.width = cropW;
    cropped.height = cropH;
    const cCtx = cropped.getContext('2d');
    cCtx.drawImage(tempCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    return cropped;
  }

  /**
   * Returns the best matching HD sprite canvas for any Three Kingdoms Hero or Enemy
   */
  getUnitSprite(unit) {
    if (!this.loaded) return null;

    if (!unit.isPlayerTeam) {
      if (unit.isBoss) {
        if (unit.bossHeroId && this.sprites[unit.bossHeroId]) {
          return this.sprites[unit.bossHeroId];
        }
        return this.sprites.boss_warlord || this.sprites.lu_bu;
      }
      return this.sprites.enemy_soldier;
    }

    const hid = unit.heroId;
    if (this.sprites[hid]) {
      return this.sprites[hid];
    }

    // Map remaining generals to base archetype + custom faction hue/tint
    const archetypeMap = {
      cao_cao: { base: 'zhao_yun', hue: -25 },
      zhang_liao: { base: 'lu_bu', hue: 205 },
      liu_bei: { base: 'zhao_yun', hue: 115 },
      zhang_fei: { base: 'guan_yu', hue: -35 },
      zhou_yu: { base: 'zhuge_liang', hue: 155 },
      diao_chan: { base: 'zhuge_liang', hue: 110 },
      sun_shangxiang: { base: 'zhuge_liang', hue: 145 },
      zhang_jiao: { base: 'zhuge_liang', hue: -140 },
    };

    const mapping = archetypeMap[hid] || { base: 'guan_yu', hue: 0 };
    const baseSprite = this.sprites[mapping.base];
    if (!baseSprite) return null;
    if (!mapping.hue) return baseSprite;

    const cacheKey = `${mapping.base}_${mapping.hue}`;
    if (!this.tintedCache[cacheKey]) {
      const c = document.createElement('canvas');
      c.width = baseSprite.width;
      c.height = baseSprite.height;
      const ctx = c.getContext('2d');
      ctx.filter = `hue-rotate(${mapping.hue}deg) saturate(1.2)`;
      ctx.drawImage(baseSprite, 0, 0);
      this.tintedCache[cacheKey] = c;
    }
    return this.tintedCache[cacheKey];
  }
}

export const assetManager = new GameAssetManager();
