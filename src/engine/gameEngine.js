// ============================================================================
// CORE GAME ENGINE: COMBAT, META 3Q SYNERGY, CAPTURE, LOOT CART & DIABLO GEAR
// Phases 1-8 Complete:
// - 60 Famous Three Kingdoms Generals (15 Shu, 15 Wei, 15 Wu, 15 Qun)
// - 4 Custom Skill Loadout Slots + 6 Diablo/PoE Skill Runes (Ấn Biến Đổi Võ Kỹ)
// - 13 Provinces Governor System (Thái Thú Trấn 13 Châu)
// - 6 Diablo Green Equipment Sets (Bộ Thần Trang Danh Tướng 2-món / 4-món)
// - Boss Rush Gauntlet ("Quá Ngũ Quan Trảm Lục Tướng") & Retro Chiptune SFX
// ============================================================================

import {
  FACTIONS,
  HEROES,
  SYNERGY_BONDS,
  MINION_TROOPS,
  CAMPAIGN_STAGES,
  SKILL_RUNES,
  PROVINCES_13,
  ITEM_SETS,
  GAUNTLET_PASSES,
  ITEM_RARITIES,
  EQUIP_SLOTS,
  FAMOUS_ITEMS,
  ITEM_AFFIX_POOL,
  TOWN_BUILDINGS,
  COMBAT_TALENTS,
  HERO_BONDS,
} from '../data/threeKingdomsData.js';
import { soundEngine } from './soundEngine.js';

const SAVE_KEY = 'THREE_KINGDOMS_DESKRAWL_CLEAN_V6_2026_10_20';

export class ThreeKingdomsDeskrawlEngine {
  constructor() {
    this.time = 0;
    this.nextEntityId = 1;

    // Persistent Player State — True Deskrawl Progression!
    this.state = {
      level: 1,
      exp: 0,
      expToNext: 180,
      gold: 60,
      iron: 8,
      bossSkulls: 0,
      recruitTokens: 1,
      mainHeroId: 'zhao_yun',
      squadHeroIds: [],
      unlockedHeroes: {
        zhao_yun: { stars: 1, level: 1 },
      },
      equippedSkillHeroIds: ['zhao_yun', null, null, null],
      equippedSkillRunes: ['split_phantom', 'frost_seal', 'blood_leech', 'thunder_chain'],
      provinceGovernors: {},
      capturedTroops: {},
      equipped: {
        weapon: null,
        armor: null,
        helm: null,
        boots: null,
        accessory: null,
        mount: null,
      },
      inventory: [],
      autoSalvageRarityIndex: 0,
      buildings: {
        command_altar: 1,
        blacksmith: 1,
        supply_workshop: 1,
        tavern: 1,
        war_academy: 1,
      },
      talents: {},
      heroShards: {},
      trainingLevel: 1,
      currentStageId: 1,
      maxUnlockedStageId: 1,
      currentWave: 1, // 1..3 = Mini-Boss Skulls (💀), 4 = Stage Chief Boss (👑)
      farmingBeforeBoss: false,
      clearedStageIds: [],
      clearedGauntletPassIds: [],
      ascensionTier: 0,
      imperialSeals: 0,
      gameSpeed: 1.0,
      autoAdvanceStage: true,
      autoCastCombo: true,
      totalKills: 0,
      totalCaptures: 0,
    };

    // Runtime Battlefield & Town Entities
    this.inTownMode = false; // Toggle between Battlefield (⚔) and Outpost Town (🏕️) like Deskrawl!
    this.potions = 3;
    this.maxPotions = 3;
    this.potionCooldown = 0;
    this.scrollOffset = 0;
    this.comboRage = 0; // 0..100
    this.skillSlotCooldowns = [0, 0, 0, 0];
    this.activeBanner = null;
    this.skillCutIn = null;
    this.screenShake = 0;
    this.activeGauntletPass = null;
    this.activeDuel = null;
    this.fieldEvent = null;
    this.fieldEventSpawnCooldown = 16;
    this.fieldBuffs = { hasteTimer: 0 };
    this.cartCrossbowCooldown = 2.2;
    this.bossFightTimer = 0;
    this.waveTotalEnemies = 4;
    this.waveKilledEnemies = 0;

    this.mainUnit = null;
    this.squadUnits = [];
    this.alliedTroops = [];
    this.enemies = [];
    this.deadBodies = [];
    this.groundDrops = [];
    this.floatingTexts = [];
    this.vfxEffects = [];
    this.projectiles = [];
    this.merchantOffers = [];

    this.loadSave();
    if (!Array.isArray(this.state.equippedSkillHeroIds) || this.state.equippedSkillHeroIds.length < 4) {
      this.state.equippedSkillHeroIds = ['zhao_yun', null, null, null];
    }
    if (!Array.isArray(this.state.equippedSkillRunes) || this.state.equippedSkillRunes.length < 4) {
      this.state.equippedSkillRunes = ['split_phantom', 'frost_seal', 'blood_leech', 'thunder_chain'];
    }
    if (!this.state.provinceGovernors || typeof this.state.provinceGovernors !== 'object') {
      this.state.provinceGovernors = {};
    }
    if (!Array.isArray(this.state.clearedGauntletPassIds)) {
      this.state.clearedGauntletPassIds = [];
    }
    if (!Array.isArray(this.state.clearedStageIds)) {
      this.state.clearedStageIds = [];
    }
    if (typeof this.state.trainingLevel !== 'number' || this.state.trainingLevel < 1) {
      this.state.trainingLevel = 1;
    }
    if (typeof this.state.bossSkulls !== 'number') {
      this.state.bossSkulls = 0;
    }
    if (!this.state.talents || typeof this.state.talents !== 'object') {
      this.state.talents = {};
    }
    if (!this.state.heroShards || typeof this.state.heroShards !== 'object') {
      this.state.heroShards = {};
    }
    this.state.autoAdvanceStage = true;
    if (typeof this.state.gameSpeed !== 'number' || this.state.gameSpeed <= 0) {
      this.state.gameSpeed = 1.0;
    }
    if (this.state.currentWave > 4 || this.state.currentWave < 1) {
      this.state.currentWave = 1;
    }

    this.autoAssignGovernors();
    this.ensureStarterGear();
    this.refreshMerchantOffers();
    this.rebuildPlayerArmy();
    this.spawnWave();
  }

  // --------------------------------------------------------------------------
  // SAVE / LOAD
  // --------------------------------------------------------------------------
  saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    } catch (_e) {
      // Ignore storage quota errors
    }
  }

  loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        this.state = {
          ...this.state,
          ...parsed,
          unlockedHeroes: { ...this.state.unlockedHeroes, ...(parsed.unlockedHeroes || {}) },
          provinceGovernors: { ...this.state.provinceGovernors, ...(parsed.provinceGovernors || {}) },
          capturedTroops: { ...this.state.capturedTroops, ...(parsed.capturedTroops || {}) },
          equipped: { ...this.state.equipped, ...(parsed.equipped || {}) },
          buildings: { ...this.state.buildings, ...(parsed.buildings || {}) },
        };
      }
    } catch (_e) {
      // Ignore corrupt save
    }
  }

  resetSave() {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  }

  cycleGameSpeed() {
    const speeds = [0.6, 0.78, 1.0, 1.25];
    const curIdx = speeds.findIndex((s) => Math.abs(s - (this.state.gameSpeed || 0.78)) < 0.06);
    this.state.gameSpeed = speeds[(curIdx + 1) % speeds.length];
    this.saveGame();
    return this.state.gameSpeed;
  }

  ensureStarterGear() {
    if (!this.state.equipped.weapon) {
      const starterWep = this.generateItem(1, 'weapon', 'common');
      starterWep.name = 'Trường Thương Tân Binh';
      starterWep.baseStats = { atk: 4 };
      starterWep.affixes = [];
      starterWep.powerScore = 16;
      this.state.equipped.weapon = starterWep;
    }
  }

  // --------------------------------------------------------------------------
  // PHASE 5: 13 PROVINCES GOVERNOR SYSTEM (THÁI THÚ TRẤN 13 CHÂU)
  // --------------------------------------------------------------------------
  autoAssignGovernors() {
    const lineupIds = this.getActiveLineupHeroIds();
    const assignedHeroIds = new Set();

    // Remove invalid or in-lineup heroes from governor slots first
    PROVINCES_13.forEach((prov) => {
      const curHeroId = this.state.provinceGovernors[prov.id];
      if (!curHeroId || !this.state.unlockedHeroes[curHeroId] || lineupIds.includes(curHeroId) || assignedHeroIds.has(curHeroId)) {
        delete this.state.provinceGovernors[prov.id];
      } else {
        assignedHeroIds.add(curHeroId);
      }
    });

    // Collect unlocked reserve generals sorted by stars descending
    const reserveHeroIds = Object.keys(this.state.unlockedHeroes)
      .filter((hId) => !lineupIds.includes(hId) && !assignedHeroIds.has(hId))
      .sort((a, b) => (this.state.unlockedHeroes[b]?.stars || 1) - (this.state.unlockedHeroes[a]?.stars || 1));

    let rIdx = 0;
    PROVINCES_13.forEach((prov) => {
      if (!this.state.provinceGovernors[prov.id] && rIdx < reserveHeroIds.length) {
        this.state.provinceGovernors[prov.id] = reserveHeroIds[rIdx++];
      }
    });
  }

  assignProvinceGovernor(provinceId, heroId) {
    if (!this.state.unlockedHeroes[heroId]) return false;
    const lineupIds = this.getActiveLineupHeroIds();
    if (lineupIds.includes(heroId)) return false;

    // Remove hero from any other province first
    Object.keys(this.state.provinceGovernors).forEach((pKey) => {
      if (this.state.provinceGovernors[pKey] === heroId) {
        delete this.state.provinceGovernors[pKey];
      }
    });

    this.state.provinceGovernors[provinceId] = heroId;
    this.rebuildPlayerArmy();
    this.saveGame();
    return true;
  }

  // --------------------------------------------------------------------------
  // PHASE 7: DIABLO GREEN EQUIPMENT SETS (BỘ THẦN TRANG DANH TƯỚNG)
  // --------------------------------------------------------------------------
  computeEquippedSets() {
    const counts = {};
    Object.values(this.state.equipped).forEach((item) => {
      if (item && item.setId) {
        counts[item.setId] = (counts[item.setId] || 0) + 1;
      }
    });

    const activeSets = [];
    let activeSetAuraColor = null;

    ITEM_SETS.forEach((setDef) => {
      const count = counts[setDef.id] || 0;
      if (count > 0) {
        const has2 = count >= 2;
        const has4 = count >= 4;
        if (has4) {
          activeSetAuraColor = setDef.auraColor;
        } else if (has2 && !activeSetAuraColor) {
          activeSetAuraColor = setDef.auraColor;
        }
        activeSets.push({
          setDef,
          count,
          has2,
          has4,
        });
      }
    });

    return { counts, activeSets, activeSetAuraColor };
  }

  // --------------------------------------------------------------------------
  // PROGRESSIVE UNLOCK MILESTONES & META 3Q SYNERGY
  // --------------------------------------------------------------------------
  getSkillSlotUnlockLevel(slotIdx) {
    const reqLevels = [1, 4, 8, 12];
    return reqLevels[slotIdx] || 1;
  }

  isSkillSlotUnlocked(slotIdx) {
    return (this.state.level || 1) >= this.getSkillSlotUnlockLevel(slotIdx);
  }

  getMaxCleaveTargets() {
    const lv = this.state.level || 1;
    if (lv >= 18) return 4;
    if (lv >= 10) return 3;
    if (lv >= 5) return 2;
    return 1; // Khởi đầu Lv.1 đánh đơn mục tiêu (1v1 cận chiến chân thực)
  }

  getCommanderRankInfo() {
    const lv = this.state.level || 1;
    const cleaveTargets = this.getMaxCleaveTargets();
    if (lv < 2) {
      return { title: 'Nghĩa Quân Hiệu Úy', rankTitle: 'Nghĩa Quân Hiệu Úy', cleaveTargets, nextMilestone: 'Lv.2: Mở Thân Binh Tiên Phong', color: '#facc15' };
    }
    if (lv < 4) {
      return { title: 'Biệt Bộ Tư Mã', rankTitle: 'Biệt Bộ Tư Mã', cleaveTargets, nextMilestone: 'Lv.4: Mở Ô Võ Kỹ 2 & Phó Tướng 1', color: '#fde047' };
    }
    if (lv < 5) {
      return { title: 'Đô Úy Tiên Phong', rankTitle: 'Đô Úy Tiên Phong', cleaveTargets, nextMilestone: 'Lv.5: Mở Đánh Lan 2 Địch & Khảm Ấn', color: '#38bdf8' };
    }
    if (lv < 8) {
      return { title: 'Trung Lang Tướng', rankTitle: 'Trung Lang Tướng', cleaveTargets, nextMilestone: 'Lv.8: Mở Ô Võ Kỹ 3 & Phó Tướng 2', color: '#4ade80' };
    }
    if (lv < 12) {
      return { title: 'Thiên Tướng Quân', rankTitle: 'Thiên Tướng Quân', cleaveTargets, nextMilestone: 'Lv.12: Mở Ô Võ Kỹ 4 & Đánh Lan 3 Địch', color: '#f59e0b' };
    }
    if (lv < 18) {
      return { title: 'Trấn Quốc Đại Tướng', rankTitle: 'Trấn Quốc Đại Tướng', cleaveTargets, nextMilestone: 'Lv.18: Mở Phó Tướng 4 & Đánh Lan 4 Địch', color: '#f43f5e' };
    }
    return { title: 'Đại Đô Đốc Tam Quân', rankTitle: 'Đại Đô Đốc Tam Quân', cleaveTargets, nextMilestone: 'Đỉnh Cao Bá Nghiệp', color: '#fde047' };
  }

  getMaxSquadSlots() {
    const altarLv = this.state.buildings.command_altar || 1;
    const cmdLv = this.state.level || 1;
    if (altarLv >= 6 || cmdLv >= 18) return 4;
    if (altarLv >= 4 || cmdLv >= 13) return 3;
    if (altarLv >= 3 || cmdLv >= 8) return 2;
    if (altarLv >= 2 || cmdLv >= 4) return 1;
    return 0; // Khởi đầu Lv.1–3 là Đơn Kỵ Xuất Chinh (0 Phó Tướng)
  }

  getMaxAlliedTroopSlots() {
    const cmdLv = this.state.level || 1;
    const capCount = this.state.totalCaptures || 0;
    if (capCount <= 0 || cmdLv < 2) return 0; // Khởi đầu Lv.1 chưa có Thân Binh cho tới khi Thu Phục lính!
    if (cmdLv >= 6 && capCount >= 4) return 2;
    return 1;
  }

  getActiveLineupHeroIds() {
    const maxSlots = this.getMaxSquadSlots();
    const squad = this.state.squadHeroIds
      .filter((id) => id !== this.state.mainHeroId && this.state.unlockedHeroes[id])
      .slice(0, maxSlots);
    return [this.state.mainHeroId, ...squad];
  }

  computeMeta3QSynergies() {
    const lineupIds = this.getActiveLineupHeroIds();
    const lineupHeroes = lineupIds.map((id) => HEROES.find((h) => h.id === id)).filter(Boolean);

    // 1. Faction counts
    const factionCounts = { SHU: 0, WEI: 0, WU: 0, QUN: 0 };
    lineupHeroes.forEach((h) => {
      factionCounts[h.faction] = (factionCounts[h.faction] || 0) + 1;
    });

    const activeFactionBonuses = [];
    Object.keys(FACTIONS).forEach((fKey) => {
      const count = factionCounts[fKey] || 0;
      const fData = FACTIONS[fKey];
      let matchedTier = null;
      for (const b of fData.bonuses) {
        if (count >= b.count) matchedTier = b;
      }
      if (matchedTier) {
        activeFactionBonuses.push({
          faction: fData,
          count,
          tier: matchedTier,
        });
      }
    });

    // Special "Tam Quốc Đỉnh Lập" (At least 1 Shu + 1 Wei + 1 Wu)
    const hasThreeKingdomsBalance =
      factionCounts.SHU >= 1 && factionCounts.WEI >= 1 && factionCounts.WU >= 1;

    // 2. Named 3Q Synergy Bonds & Combo Ultimates
    const activeBonds = [];
    const unlockedComboSkills = [];

    SYNERGY_BONDS.forEach((bond) => {
      const matchedHeroes = bond.requiredHeroes.filter((reqId) => lineupIds.includes(reqId));
      const matchCount = matchedHeroes.length;
      if (matchCount >= bond.minRequired) {
        const isFull = matchCount >= bond.requiredHeroes.length || matchCount >= 2;
        activeBonds.push({
          bond,
          matchCount,
          totalRequired: bond.requiredHeroes.length,
          isFull: matchCount >= bond.requiredHeroes.length,
          statBonus:
            matchCount >= bond.requiredHeroes.length ? bond.statBonusFull : bond.statBonus2,
        });
        if (isFull && bond.comboSkill) {
          unlockedComboSkills.push({
            bondId: bond.id,
            bondName: bond.name,
            icon: bond.icon,
            ...bond.comboSkill,
          });
        }
      }
    });

    return {
      lineupIds,
      lineupHeroes,
      factionCounts,
      activeFactionBonuses,
      hasThreeKingdomsBalance,
      activeBonds,
      unlockedComboSkills,
    };
  }

  computeTotalBonuses(force = false) {
    if (!force && this._cachedBonuses && this.time - (this._bonusesCacheTime || -99) < 0.4) {
      return this._cachedBonuses;
    }
    const syn = this.computeMeta3QSynergies();
    const setInfo = this.computeEquippedSets();
    const bld = this.state.buildings;

    const mods = {
      atkFlat: 0,
      hpFlat: 0,
      defFlat: 0,
      atkPct: (bld.war_academy - 1) * 0.10,
      hpPct: (bld.war_academy - 1) * 0.10,
      armorPct: 0,
      atkSpeed: (bld.war_academy - 1) * 0.05,
      critChance: 0,
      critDmg: 0,
      lifesteal: 0,
      skillDmg: (bld.command_altar - 1) * 0.15,
      rageGain: (bld.tavern - 1) * 0.10,
      hpRegenPct: 0,
      burnDamage: 0,
      bossDmg: 0,
      captureBonus: (bld.tavern - 1) * 0.06,
      magicFind: (bld.blacksmith - 1) * 0.08,
      goldBonus: (bld.supply_workshop - 1) * 0.18,
    };

    // 1. Equipment stats + Blacksmith amplifier
    const smithMult = 1 + (bld.blacksmith - 1) * 0.12;
    Object.values(this.state.equipped).forEach((item) => {
      if (!item) return;
      const upgradeMult = 1 + (item.upgradeLevel || 0) * 0.15;
      const affixUpgradeMult = 1 + (item.upgradeLevel || 0) * 0.08;
      const totalItemMult = smithMult * upgradeMult;
      if (item.baseStats.atk) mods.atkFlat += Math.round(item.baseStats.atk * totalItemMult);
      if (item.baseStats.hp) mods.hpFlat += Math.round(item.baseStats.hp * totalItemMult);
      if (item.baseStats.def) mods.defFlat += Math.round(item.baseStats.def * totalItemMult);
      if (item.baseStats.atkSpeed) mods.atkSpeed += (item.baseStats.atkSpeed / 100) * totalItemMult;
      if (item.baseStats.critChance) mods.critChance += (item.baseStats.critChance / 100) * totalItemMult;

      (item.affixes || []).forEach((af) => {
        const val = (af.value / 100) * affixUpgradeMult;
        if (mods[af.id] !== undefined) {
          mods[af.id] += val;
        }
      });
    });

    // 2. Diablo Green Equipment Sets (2-piece & 4-piece bonuses)
    setInfo.activeSets.forEach(({ setDef, has2, has4 }) => {
      if (has2 && setDef.bonus2) {
        Object.keys(setDef.bonus2).forEach((k) => {
          if (typeof setDef.bonus2[k] === 'number' && mods[k] !== undefined) {
            mods[k] += setDef.bonus2[k];
          }
        });
      }
      if (has4 && setDef.bonus4) {
        Object.keys(setDef.bonus4).forEach((k) => {
          if (typeof setDef.bonus4[k] === 'number' && mods[k] !== undefined) {
            mods[k] += setDef.bonus4[k];
          }
        });
      }
    });

    // 3. 13 Provinces Governors (Thái Thú Trấn 13 Châu)
    PROVINCES_13.forEach((prov) => {
      const govHeroId = this.state.provinceGovernors?.[prov.id];
      if (!govHeroId) return;
      const unlockInfo = this.state.unlockedHeroes[govHeroId];
      if (!unlockInfo) return;
      const stars = unlockInfo.stars || 1;
      if (mods[prov.bonusType] !== undefined) {
        mods[prov.bonusType] += prov.baseVal * stars;
      }
    });

    // 4. Faction Resonance bonuses
    syn.activeFactionBonuses.forEach(({ tier }) => {
      Object.keys(tier).forEach((k) => {
        if (typeof tier[k] === 'number' && mods[k] !== undefined) {
          mods[k] += tier[k];
        }
      });
    });

    if (syn.hasThreeKingdomsBalance) {
      mods.atkPct += 0.35;
      mods.hpPct += 0.35;
      mods.magicFind += 0.50;
    }

    // 5. Active 3Q Synergy Bonds
    syn.activeBonds.forEach(({ statBonus }) => {
      Object.keys(statBonus).forEach((k) => {
        if (mods[k] !== undefined) {
          mods[k] += statBonus[k];
        }
      });
    });

    // 6. Captured Minion Troops hauling the Loot Cart
    MINION_TROOPS.forEach((troop) => {
      const count = this.state.capturedTroops[troop.id] || 0;
      if (count <= 0) return;
      const stack = Math.min(count, 25);
      if (troop.bonuses.goldBonus) mods.goldBonus += troop.bonuses.goldBonus * stack * 0.35;
      if (troop.bonuses.atkBonus) mods.atkPct += troop.bonuses.atkBonus * stack * 0.30;
      if (troop.bonuses.critDmg) mods.critDmg += troop.bonuses.critDmg * stack * 0.30;
      if (troop.bonuses.atkSpeed) mods.atkSpeed += troop.bonuses.atkSpeed * stack * 0.25;
      if (troop.bonuses.armorBonus) mods.armorPct += troop.bonuses.armorBonus * stack * 0.30;
      if (troop.bonuses.critChance) mods.critChance += troop.bonuses.critChance * stack * 0.20;
      if (troop.bonuses.hpBonus) mods.hpPct += troop.bonuses.hpBonus * stack * 0.30;
      if (troop.bonuses.regen) mods.hpRegenPct += troop.bonuses.regen * stack * 0.25;
      if (troop.bonuses.magicFind) mods.magicFind += troop.bonuses.magicFind * stack * 0.35;
    });

    // 7. Phase 10: Nhất Thống Thiên Hạ — Luân Hồi Bá Nghiệp (Imperial Ascension / Torment Tier)
    const asc = this.state.ascensionTier || 0;
    if (asc > 0) {
      mods.atkPct += asc * 0.45;
      mods.hpPct += asc * 0.45;
      mods.skillDmg += asc * 0.30;
      mods.magicFind += asc * 0.40;
      mods.goldBonus += asc * 0.40;
    }

    // 8. Direct HUD Military Training (Rèn Quân Trực Tiếp Trên Thanh Chiến Trường)
    const trainLv = Math.max(1, this.state.trainingLevel || 1);
    if (trainLv > 1) {
      mods.atkFlat += (trainLv - 1) * 5;
      mods.hpFlat += (trainLv - 1) * 38;
      mods.atkPct += (trainLv - 1) * 0.14;
      mods.hpPct += (trainLv - 1) * 0.14;
    }

    // 9. Phase 9: True 5-Tier Combat Talent Tree (15 Circular Nodes, 0/5 Ranks Each)
    COMBAT_TALENTS.forEach((tal) => {
      const rank = this.state.talents?.[tal.id] || 0;
      if (rank > 0 && mods[tal.stat] !== undefined) {
        mods[tal.stat] += rank * tal.perRank;
      }
    });

    // 10. Phase 12: Three Kingdoms Hero Bonds / Synergies (Duyên Phận Danh Tướng)
    const bondStatus = this.computeActiveHeroBonds();
    bondStatus.activeHeroBonds.forEach((bond) => {
      Object.keys(bond.bonuses).forEach((k) => {
        if (mods[k] !== undefined) {
          mods[k] += bond.bonuses[k];
        }
      });
    });

    this._cachedBonuses = { mods, syn, setInfo, bondStatus };
    this._bonusesCacheTime = this.time;
    return this._cachedBonuses;
  }

  // --------------------------------------------------------------------------
  // PHASE 9: COMBAT TALENT TREE (5 TIERS × 3 CIRCULAR NODES)
  // --------------------------------------------------------------------------
  getTotalTalentPoints() {
    const lvPts = Math.max(1, this.state.level || 1);
    const stagePts = Array.isArray(this.state.clearedStageIds) ? this.state.clearedStageIds.length * 2 : 0;
    const ascPts = (this.state.ascensionTier || 0) * 5;
    return lvPts + stagePts + ascPts;
  }

  getSpentTalentPoints() {
    if (!this.state.talents) return 0;
    return Object.values(this.state.talents).reduce((s, v) => s + (Number(v) || 0), 0);
  }

  getAvailableTalentPoints() {
    return Math.max(0, this.getTotalTalentPoints() - this.getSpentTalentPoints());
  }

  upgradeTalent(talentId) {
    const tal = COMBAT_TALENTS.find((t) => t.id === talentId);
    if (!tal) return false;
    if ((this.state.level || 1) < tal.reqLv) return false;
    if (this.getAvailableTalentPoints() <= 0) return false;
    const curRank = this.state.talents?.[talentId] || 0;
    if (curRank >= tal.maxRank) return false;

    this.state.talents[talentId] = curRank + 1;
    soundEngine.playLootChime(false);
    this.rebuildPlayerArmy();
    this.saveGame();
    return true;
  }

  resetTalents() {
    this.state.talents = {};
    soundEngine.playLootChime(true);
    this.rebuildPlayerArmy();
    this.saveGame();
    return true;
  }

  // --------------------------------------------------------------------------
  // PHASE 12: HERO BONDS / SYNERGIES (DUYÊN PHẬN TAM QUỐC)
  // --------------------------------------------------------------------------
  computeActiveHeroBonds() {
    const unlocked = this.state.unlockedHeroes || {};
    const activeHeroBonds = [];
    const allHeroBonds = HERO_BONDS.map((b) => {
      const matchedIds = b.heroIds.filter((id) => Boolean(unlocked[id]));
      const isFull = matchedIds.length >= b.heroIds.length;
      if (isFull) activeHeroBonds.push(b);
      return {
        ...b,
        unlockedCount: matchedIds.length,
        totalRequired: b.heroIds.length,
        isFull,
      };
    });
    return { activeHeroBonds, allHeroBonds };
  }

  getTrainingCost() {
    const lv = Math.max(1, this.state.trainingLevel || 1);
    return Math.round(24 * Math.pow(1.24, lv - 1));
  }

  upgradeTraining() {
    const cost = this.getTrainingCost();
    if (this.state.gold < cost) return false;
    this.state.gold -= cost;
    this.state.trainingLevel = (this.state.trainingLevel || 1) + 1;
    soundEngine.playLootChime(true);
    this.rebuildPlayerArmy();
    if (this.mainUnit) {
      this.mainUnit.hp = Math.min(this.mainUnit.maxHp, this.mainUnit.hp + Math.round(this.mainUnit.maxHp * 0.35));
      this.addFloatingText(this.mainUnit.x, this.mainUnit.y - 72, `RÈN QUÂN CẤP ${this.state.trainingLevel}!`, '#fde047', 14);
      this.vfxEffects.push({
        type: 'heal_banner',
        casterX: this.mainUnit.x,
        x: this.mainUnit.x,
        y: 138,
        color: '#fde047',
        timer: 0.45,
        maxTimer: 0.45,
      });
    }
    this.saveGame();
    return true;
  }

  getTotalArmyPower() {
    if (!this.mainUnit) return 100;
    const units = [this.mainUnit, ...(this.squadUnits || [])];
    return units.reduce((sum, u) => sum + Math.round(u.atk * 3.2 + u.maxHp * 0.22 + (u.def || 10) * 2.5), 0);
  }

  ascendEmpire() {
    this.state.ascensionTier = (this.state.ascensionTier || 0) + 1;
    this.state.imperialSeals = (this.state.imperialSeals || 0) + 1;
    this.state.currentStageId = 1;
    this.state.currentWave = 1;
    this.state.farmingBeforeBoss = false;
    this.state.gold += 500 * this.state.ascensionTier;
    this.state.iron += 80 * this.state.ascensionTier;

    // Grant 1 Mythic or Set heirloom item on every Ascension!
    const heirloom = this.generateItem(
      this.state.level + this.state.ascensionTier * 4,
      null,
      'set'
    );
    this.state.inventory.unshift(heirloom);

    soundEngine.playUltimateExplosion();
    this.rebuildPlayerArmy();
    this.mainUnit.hp = this.mainUnit.maxHp;
    this.spawnWave();
    this.triggerBanner(
      `LUÂN HỒI BẬC ${this.state.ascensionTier} — NHẬN NGỌC TỶ & THẦN TRANG!`,
      '#fde047'
    );
    this.saveGame();
    return true;
  }

  getHeroCombatStats(heroId, isMain = false) {
    const heroDef = HEROES.find((h) => h.id === heroId) || HEROES[0];
    const unlockInfo = this.state.unlockedHeroes[heroId] || { stars: 1, level: 1 };
    const starMult = 1 + (unlockInfo.stars - 1) * 0.25;
    const levelMult = 0.36 + (this.state.level - 1) * 0.1;
    const { mods, setInfo } = this.computeTotalBonuses();

    const rawHp = heroDef.baseStats.hp * levelMult * starMult + (isMain ? mods.hpFlat : mods.hpFlat * 0.55);
    const rawAtk = heroDef.baseStats.atk * levelMult * starMult + (isMain ? mods.atkFlat : mods.atkFlat * 0.65);
    const rawDef = heroDef.baseStats.def * levelMult * starMult + mods.defFlat;

    const maxHp = Math.round(rawHp * (1 + mods.hpPct) * (isMain ? 1 : 0.82));
    const atk = Math.round(rawAtk * (1 + mods.atkPct) * (isMain ? 1 : 0.72));
    const def = Math.round(rawDef * (1 + mods.armorPct));
    const atkSpeed = Number((heroDef.baseStats.atkSpeed * 0.78 * (1 + mods.atkSpeed)).toFixed(2));
    const critChance = Math.min(0.85, Number((heroDef.baseStats.critChance + mods.critChance).toFixed(2)));
    const critDmg = Number((heroDef.baseStats.critDmg + mods.critDmg).toFixed(2));

    return {
      maxHp,
      atk,
      def,
      atkSpeed,
      critChance,
      critDmg,
      range: heroDef.baseStats.range,
      stars: unlockInfo.stars,
      activeSetAuraColor: isMain ? setInfo.activeSetAuraColor : null,
      mods,
    };
  }

  // --------------------------------------------------------------------------
  // BUILD PLAYER ARMY ON BATTLEFIELD
  // --------------------------------------------------------------------------
  rebuildPlayerArmy() {
    this.autoAssignGovernors();
    this.computeTotalBonuses(true);
    const mainHeroDef = HEROES.find((h) => h.id === this.state.mainHeroId) || HEROES[0];
    const mainStats = this.getHeroCombatStats(mainHeroDef.id, true);
    const factionData = FACTIONS[mainHeroDef.faction];

    const prevHpRatio = this.mainUnit ? this.mainUnit.hp / Math.max(1, this.mainUnit.maxHp) : 1;

    this.mainUnit = {
      uid: 'main_hero',
      heroId: mainHeroDef.id,
      name: `${mainHeroDef.name} (${mainStats.stars}★)`,
      isMainHero: true,
      isPlayerTeam: true,
      x: 290,
      y: 148,
      scale: 2.8,
      facing: 1,
      isMoving: true,
      attackAnim: 0,
      hurtAnim: 0,
      attackCooldown: 0,
      skillCooldown: 3.5,
      animSeed: 0,
      heroConfig: mainHeroDef,
      factionColor: factionData.color,
      ...mainStats,
      hp: Math.max(1, Math.round(mainStats.maxHp * prevHpRatio)),
    };

    // Build Squad Escort Generals (Phó Tướng Xuất Trận)
    const maxSlots = this.getMaxSquadSlots();
    this.state.squadHeroIds = this.state.squadHeroIds
      .filter((id) => id !== this.state.mainHeroId && this.state.unlockedHeroes[id])
      .slice(0, maxSlots);

    const formationOffsets = [
      { dx: -56, dy: -12 },
      { dx: -108, dy: 14 },
      { dx: -162, dy: -10 },
      { dx: -214, dy: 14 },
    ];

    this.squadUnits = this.state.squadHeroIds.map((sqId, idx) => {
      const hDef = HEROES.find((h) => h.id === sqId);
      const stats = this.getHeroCombatStats(sqId, false);
      const offset = formationOffsets[idx] || { dx: -60 - idx * 52, dy: 0 };
      return {
        uid: `squad_${sqId}`,
        heroId: sqId,
        name: `${hDef.name} (${stats.stars}★)`,
        isSquadGeneral: true,
        isPlayerTeam: true,
        x: this.mainUnit.x + offset.dx,
        y: this.mainUnit.y + offset.dy,
        offsetX: offset.dx,
        offsetY: offset.dy,
        scale: 2.45,
        facing: 1,
        isMoving: true,
        attackAnim: 0,
        hurtAnim: 0,
        attackCooldown: 0.5 * idx,
        skillCooldown: 4.5 + idx * 1.5,
        animSeed: idx * 1.7,
        heroConfig: hDef,
        factionColor: FACTIONS[hDef.faction].color,
        ...stats,
        hp: stats.maxHp,
      };
    });

    // Build Progressive Allied Escort Soldiers (Đứng sau Chủ Tướng hộ vệ Lương Xa, không đè lên ngựa Chủ Tướng!)
    const troopOffsets = [
      { dx: -52, dy: 12, role: 'pikeman', wt: 'spear' },
      { dx: -96, dy: -10, role: 'archer', wt: 'bow' },
    ];
    const maxTroops = Math.min(2, this.getMaxAlliedTroopSlots());
    this.alliedTroops = troopOffsets.slice(0, maxTroops).map((t, idx) => ({
      uid: `ally_troop_${idx}`,
      name: t.role === 'archer' ? 'Cung Thủ Hộ Vệ' : 'Thân Binh Hộ Vệ',
      isAlliedSoldier: true,
      troopType: t.role,
      isEnemyArcher: t.role === 'archer',
      isEliteMob: false,
      isPlayerTeam: true,
      x: this.mainUnit.x + t.dx,
      y: this.mainUnit.y + t.dy,
      offsetX: t.dx,
      offsetY: t.dy,
      facing: 1,
      isMoving: true,
      attackAnim: 0,
      hurtAnim: 0,
      attackCooldown: 0.45 * idx,
      animSeed: 3.1 + idx * 1.9,
      atk: Math.max(4, Math.round(mainStats.atk * 0.22)),
      atkSpeed: t.role === 'archer' ? 0.78 : 0.85,
      critChance: 0.1,
      critDmg: 1.4,
      range: t.role === 'archer' ? 230 : 128,
      factionColor: factionData.color,
      heroConfig: {
        weaponType: t.wt,
      },
      hp: 100,
      maxHp: 100,
    }));
  }

  // --------------------------------------------------------------------------
  // SPAWN WAVES, THREE KINGDOMS BOSSES & PHASE 8 BOSS RUSH GAUNTLET
  // --------------------------------------------------------------------------
  getCurrentStage() {
    return CAMPAIGN_STAGES.find((s) => s.id === this.state.currentStageId) || CAMPAIGN_STAGES[0];
  }

  isStageBossReadyToChallenge() {
    const stage = this.getCurrentStage();
    return (
      !this.activeGauntletPass &&
      this.state.currentWave === stage.wavesPerBoss - 1 &&
      Boolean(this.state.farmingBeforeBoss)
    );
  }

  challengeStageBoss() {
    this.inTownMode = false;
    const stage = this.getCurrentStage();
    this.state.farmingBeforeBoss = false;
    this.state.currentWave = stage.wavesPerBoss;
    this.mainUnit.hp = this.mainUnit.maxHp;
    this.saveGame();
    this.spawnWave();
    return true;
  }

  jumpToWave(waveNum) {
    this.inTownMode = false;
    const stage = this.getCurrentStage();
    const targetWave = Math.max(1, Math.min(stage.wavesPerBoss, waveNum));
    this.state.farmingBeforeBoss = false;
    this.state.currentWave = targetWave;
    this.mainUnit.hp = this.mainUnit.maxHp;
    this.saveGame();
    this.spawnWave();
    return true;
  }

  toggleTownMode(forceState = null) {
    this.inTownMode = forceState !== null ? Boolean(forceState) : !this.inTownMode;
    if (this.inTownMode) {
      this.enemies = [];
      this.activeDuel = null;
      this.bossFightTimer = 0;
      this.potions = this.maxPotions;
      if (this.mainUnit) this.mainUnit.hp = this.mainUnit.maxHp;
      this.triggerBanner('DOANH TRẠI TIỀN TUYẾN — RÈN BINH & ĐIỂM TƯỚNG', '#fde047');
    } else {
      this.spawnWave();
    }
    return this.inTownMode;
  }

  usePotion() {
    if (!this.mainUnit || this.potions <= 0 || this.potionCooldown > 0) return false;
    this.potions -= 1;
    this.potionCooldown = 4.0;
    const healAmt = Math.round(this.mainUnit.maxHp * 0.65);
    this.mainUnit.hp = Math.min(this.mainUnit.maxHp, this.mainUnit.hp + healAmt);
    this.fieldBuffs.hasteTimer = Math.max(this.fieldBuffs.hasteTimer || 0, 5.0);
    soundEngine.playLootChime(true);
    this.addFloatingText(this.mainUnit.x, this.mainUnit.y - 68, `+${healAmt} HP (LINH DƯỢC)`, '#4ade80', 13);
    return true;
  }

  startGauntletPass(passId) {
    const passDef = GAUNTLET_PASSES.find((p) => p.passId === passId);
    if (!passDef) return false;

    this.inTownMode = false;
    this.activeGauntletPass = passDef;
    this.enemies = [];
    const lvScale = Math.pow(1.22, passDef.recLv - 1);
    const baseSpawnX = 480;

    passDef.bossGeneralIds.forEach((bId, idx) => {
      const bossHeroDef = HEROES.find((h) => h.id === bId) || HEROES[0];
      const bossHp = Math.round(1350 * lvScale * (1 + idx * 0.18));
      const bossAtk = Math.round(34 * lvScale);
      const bossDef = Math.round(14 * lvScale);

      this.enemies.push({
        uid: `gauntlet_boss_${this.nextEntityId++}`,
        name: `[NGŨ QUAN] ${bossHeroDef.name}`,
        bossHeroId: bossHeroDef.id,
        isBoss: true,
        isGauntletBoss: true,
        isPlayerTeam: false,
        x: baseSpawnX + idx * 125,
        y: 142 + (idx % 2) * 10,
        scale: 2.75,
        facing: -1,
        isMoving: true,
        attackAnim: 0,
        hurtAnim: 0,
        attackCooldown: 1.0 + idx * 0.4,
        skillCooldown: 5.5 + idx,
        animSeed: idx * 3.1,
        hp: bossHp,
        maxHp: bossHp,
        atk: bossAtk,
        def: bossDef,
        atkSpeed: 0.85,
        range: 86,
        heroConfig: bossHeroDef,
      });
    });

    soundEngine.playBossHorn();
    this.triggerBanner(`QUÁ NGŨ QUAN: ${passDef.name.toUpperCase()}!`, '#f43f5e');
    return true;
  }

  spawnWave() {
    this.activeGauntletPass = null;
    this.activeDuel = null;
    if (this.inTownMode) {
      this.enemies = [];
      return;
    }

    const stage = this.getCurrentStage();
    const totalCheckpoints = stage.wavesPerBoss || 4;
    if (this.state.currentWave > totalCheckpoints) {
      this.state.currentWave = totalCheckpoints;
    }
    const isBossWave = this.state.currentWave >= totalCheckpoints;
    const ascTier = this.state.ascensionTier || 0;
    const lvScale = Math.pow(1.22, stage.enemyLevel + ascTier * 5 - 1) * (1 + (this.state.currentWave - 1) * 0.15);

    this.bossFightTimer = isBossWave ? 30.0 : 24.0;
    this.enemies = [];
    const baseSpawnX = 435; // Ngay trên màn hình, tiếp chiến trong 1.2 giây!

    // Mỗi điểm Đầu Lâu (💀 1, 2, 3) hoặc Vương Miện (👑 4) chỉ có 3-4 thân binh hộ vệ đứng cạnh Tướng Địch!
    const mobCount = isBossWave ? 3 : 3 + (this.state.currentWave % 2);
    const laneYPositions = [134, 146, 155, 162];

    for (let i = 0; i < mobCount; i++) {
      const laneIdx = i % laneYPositions.length;
      const mobName = stage.mobNames[i % stage.mobNames.length];
      const mobHp = Math.round(95 * lvScale * (0.92 + (i % 3) * 0.08));
      const mobAtk = Math.round(10 * lvScale);
      const mobDef = Math.round(3 * lvScale);

      const isEliteCavalry = i === 1;
      const isEnemyArcher = i === mobCount - 1;

      this.enemies.push({
        uid: `enemy_${this.nextEntityId++}`,
        name: mobName,
        isBoss: false,
        isEliteMob: isEliteCavalry,
        isEnemyArcher,
        isPlayerTeam: false,
        troopDropId: stage.mobTroopDrop,
        x: baseSpawnX + i * 52,
        y: laneYPositions[laneIdx],
        knockbackVx: 0,
        scale: 2.4,
        facing: -1,
        isMoving: true,
        attackAnim: 0,
        hurtAnim: 0,
        attackCooldown: 0.7 + i * 0.25,
        animSeed: i * 1.37,
        hp: mobHp,
        maxHp: mobHp,
        atk: mobAtk,
        def: mobDef,
        atkSpeed: isEnemyArcher ? 0.62 : 0.72,
        range: isEnemyArcher ? 165 : 68,
        heroConfig: {
          weaponType: isEnemyArcher ? 'bow' : isEliteCavalry ? 'halberd' : i % 2 === 0 ? 'spear' : 'guandao',
          armorColor: i % 2 === 0 ? '#475569' : '#7f1d1d',
          capeColor: '#991b1b',
          accentColor: '#eab308',
        },
      });
    }

    // MỌI ĐỢT (💀 1, 💀 2, 💀 3) ĐỀU CÓ DANH TƯỚNG TRẤN ẢI XUẤT HIỆN NGAY TRƯỚC MẶT (Giống hệt Deskrawl!)
    const eraPool = (stage.eraGenerals && stage.eraGenerals.length > 0 ? stage.eraGenerals : [stage.bossHeroId]).filter(
      (hId) => hId !== stage.bossHeroId
    );
    const subPool = eraPool.length > 0 ? eraPool : [stage.bossHeroId];

    if (!isBossWave) {
      const rankTitles = ['TIÊN PHONG', 'TẢ QUÂN', 'HỮU QUÂN'];
      const rankTitle = rankTitles[(this.state.currentWave - 1) % rankTitles.length];
      const vHeroId = subPool[(this.state.currentWave - 1) % subPool.length];
      const vHeroDef = HEROES.find((h) => h.id === vHeroId) || HEROES[0];
      const vHp = Math.round(390 * lvScale * (1 + (this.state.currentWave - 1) * 0.18));
      const vAtk = Math.round(19 * lvScale);
      const vDef = Math.round(8 * lvScale);

      this.enemies.push({
        uid: `vanguard_${this.nextEntityId++}`,
        name: `[${rankTitle}] ${vHeroDef.name}`,
        bossHeroId: vHeroDef.id,
        isBoss: true,
        isVanguardGeneral: true,
        isPlayerTeam: false,
        x: baseSpawnX + 42, // Đứng ngay hàng đầu cùng thân binh, thấy Boss ngay lập tức!
        y: 147,
        knockbackVx: 0,
        scale: 2.65,
        facing: -1,
        isMoving: true,
        attackAnim: 0,
        hurtAnim: 0,
        attackCooldown: 1.0,
        skillCooldown: 5.2,
        animSeed: 4.2 + this.state.currentWave * 1.7,
        hp: vHp,
        maxHp: vHp,
        atk: vAtk,
        def: vDef,
        atkSpeed: 0.82,
        range: 82,
        heroConfig: vHeroDef,
      });

      this.triggerBanner(`ĐỤNG ĐỘ ${rankTitle}: ${vHeroDef.name.toUpperCase()}!`, '#c084fc');
    } else {
      // ĐỢT 4 (👑): CHỦ SOÁI TRẤN ẢI!
      const bossHeroDef = HEROES.find((h) => h.id === stage.bossHeroId) || HEROES[0];
      const bossHp = Math.round(960 * lvScale);
      const bossAtk = Math.round(30 * lvScale);
      const bossDef = Math.round(12 * lvScale);

      this.enemies.push({
        uid: `boss_${this.nextEntityId++}`,
        name: `[CHỦ SOÁI] ${bossHeroDef.name}`,
        bossHeroId: bossHeroDef.id,
        isBoss: true,
        isVanguardGeneral: false,
        isPlayerTeam: false,
        x: baseSpawnX + 55, // Xuất hiện ngay trên màn hình!
        y: 148,
        knockbackVx: 0,
        scale: 2.9,
        facing: -1,
        isMoving: true,
        attackAnim: 0,
        hurtAnim: 0,
        attackCooldown: 1.1,
        skillCooldown: 4.8,
        animSeed: 7.7,
        hp: bossHp,
        maxHp: bossHp,
        atk: bossAtk,
        def: bossDef,
        atkSpeed: 0.88,
        range: 88,
        heroConfig: bossHeroDef,
      });

      soundEngine.playBossHorn();
      this.triggerBanner(`QUYẾT CHIẾN CHỦ SOÁI: ${bossHeroDef.name.toUpperCase()}!`, '#ef4444');
    }

    this.waveTotalEnemies = Math.max(1, this.enemies.length);
    this.waveKilledEnemies = 0;
  }

  triggerBattlefieldClick(worldX, worldY) {
    // 1. Collect any active Field Event or Ground Loot immediately!
    if (this.fieldEvent && !this.fieldEvent.claimed) {
      this.claimFieldEvent();
    }
    if (this.groundDrops.length > 0) {
      for (let i = this.groundDrops.length - 1; i >= 0; i--) {
        this.collectDrop(this.groundDrops[i]);
        this.groundDrops.splice(i, 1);
      }
    }

    // 2. Active Commander Strike (Lệnh Kỳ Lôi Kích) on closest living enemy
    const living = this.enemies.filter((e) => e.hp > 0);
    if (living.length === 0 || !this.mainUnit) return false;
    living.sort((a, b) => Math.abs(a.x - worldX) - Math.abs(b.x - worldX));
    const target = living[0];

    const strikeDmg = Math.max(12, Math.round(this.mainUnit.atk * 0.85));
    target.hp -= strikeDmg;
    target.hurtAnim = 1;
    target.knockbackVx = target.isBoss ? 12 : 34;

    this.comboRage = Math.min(100, (this.comboRage || 0) + 6);
    this.state.gold += 3;
    soundEngine.playSlash(true);

    this.addFloatingText(target.x + (Math.random() - 0.5) * 16, target.y - 68, `${strikeDmg.toLocaleString()}`, '#fde047', 16);
    this.vfxEffects.push({
      type: 'bagua_lightning',
      casterX: this.mainUnit.x,
      x: target.x,
      y: target.y - 12,
      color: '#fde047',
      timer: 0.36,
      maxTimer: 0.36,
    });

    if (target.hp <= 0) {
      this.onEnemyKilled(target);
    }
    return true;
  }

  // --------------------------------------------------------------------------
  // PHASE 4 & PHASE 6: CUSTOM 4-SLOT SKILL LOADOUT & SKILL RUNES (ẤN BIẾN ĐỔI)
  // --------------------------------------------------------------------------
  setEquippedSkillSlot(slotIndex, heroId) {
    if (slotIndex < 0 || slotIndex > 3) return false;
    if (!this.isSkillSlotUnlocked(slotIndex)) return false;
    if (!this.state.unlockedHeroes[heroId]) return false;
    // Không cho phép 1 tướng chiếm nhiều ô Võ Kỹ cùng lúc
    for (let i = 0; i < 4; i++) {
      if (i !== slotIndex && this.state.equippedSkillHeroIds[i] === heroId) {
        this.state.equippedSkillHeroIds[i] = null;
      }
    }
    this.state.equippedSkillHeroIds[slotIndex] = heroId;
    this.skillSlotCooldowns[slotIndex] = 0;
    this.saveGame();
    return true;
  }

  setSkillRune(slotIndex, runeId) {
    if (slotIndex < 0 || slotIndex > 3) return false;
    if (!this.isSkillSlotUnlocked(slotIndex)) return false;
    if (!SKILL_RUNES.some((r) => r.id === runeId)) return false;
    this.state.equippedSkillRunes[slotIndex] = runeId;
    this.saveGame();
    return true;
  }

  castEquippedSkillSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex > 3) return false;
    if (!this.isSkillSlotUnlocked(slotIndex)) return false;
    if (!this.mainUnit) return false;
    const livingEnemies = this.enemies.filter((e) => e.hp > 0);
    if (livingEnemies.length === 0) return false;
    if (this.skillSlotCooldowns[slotIndex] > 0.15) return false;

    const rawSkillHeroId = slotIndex === 0 ? (this.state.equippedSkillHeroIds[0] || this.state.mainHeroId) : this.state.equippedSkillHeroIds[slotIndex];
    if (!rawSkillHeroId || !this.state.unlockedHeroes[rawSkillHeroId]) return false;

    const skillHeroDef = HEROES.find((h) => h.id === rawSkillHeroId) || this.mainUnit.heroConfig;
    // Ấn Biến Đổi chỉ kích hoạt khi đạt Lv.5+
    const runeId = (this.state.level || 1) >= 5 ? this.state.equippedSkillRunes?.[slotIndex] : null;
    const runeObj = runeId ? SKILL_RUNES.find((r) => r.id === runeId) || null : null;
    const { mods } = this.computeTotalBonuses();

    const proxyCaster = {
      ...this.mainUnit,
      heroId: skillHeroDef.id,
      heroConfig: skillHeroDef,
      factionColor: FACTIONS[skillHeroDef.faction]?.color || '#fde047',
    };

    this.executeHeroSkill(proxyCaster, livingEnemies, mods, runeObj);
    const baseCd = (skillHeroDef.skill?.cooldown || 7.5) * 1.65;
    const cdrMult = runeObj?.cdrMult || 1.0;
    this.skillSlotCooldowns[slotIndex] = (baseCd * cdrMult) / (1 + mods.atkSpeed * 0.25);
    this.mainUnit.attackAnim = 1;
    return true;
  }

  // --------------------------------------------------------------------------
  // MAIN UPDATE TICK (60 FPS WITH GAME SPEED MULTIPLIER)
  // --------------------------------------------------------------------------
  update(rawDt) {
    const dt = rawDt * (this.state.gameSpeed || 1.0);
    this.time += dt;
    if (this.potionCooldown > 0) this.potionCooldown = Math.max(0, this.potionCooldown - dt);
    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 18);
    if (this.activeBanner) {
      this.activeBanner.timer -= dt;
      if (this.activeBanner.timer <= 0) this.activeBanner = null;
    }
    if (this.skillCutIn) {
      this.skillCutIn.timer -= dt;
      if (this.skillCutIn.timer <= 0) this.skillCutIn = null;
    }

    if (!this.mainUnit) return;

    // Town Outpost Mode (Doanh Trại Tiền Tuyến — Giống Deskrawl Town Mode!)
    if (this.inTownMode) {
      this.mainUnit.isMoving = false;
      this.mainUnit.attackAnim = 0;
      this.mainUnit.x = 285;
      this.mainUnit.y = 152;
      this.mainUnit.hp = this.mainUnit.maxHp;
      this.squadUnits.forEach((sq) => {
        sq.isMoving = false;
        sq.attackAnim = 0;
        sq.x = 285 + sq.offsetX;
        sq.y = 152 + sq.offsetY;
      });
      (this.alliedTroops || []).forEach((tr) => {
        tr.isMoving = false;
        tr.attackAnim = 0;
        tr.x = 285 + tr.offsetX;
        tr.y = 152 + tr.offsetY;
      });
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y -= 32 * dt;
        ft.timer -= dt;
        if (ft.timer <= 0) this.floatingTexts.splice(i, 1);
      }
      return;
    }

    // Boss Fight Enrage / Timeout Check
    if (this.bossFightTimer > 0) {
      this.bossFightTimer -= dt;
      if (this.bossFightTimer <= 0) {
        this.bossFightTimer = 0;
        this.onPlayerDefeated(true);
        return;
      }
    }

    const { mods, syn } = this.computeTotalBonuses();

    // Tick 4 Custom Equipped Skill Slot Cooldowns (only unlocked slots)
    for (let sIdx = 0; sIdx < 4; sIdx++) {
      if (this.skillSlotCooldowns[sIdx] > 0) {
        this.skillSlotCooldowns[sIdx] = Math.max(0, this.skillSlotCooldowns[sIdx] - dt);
      }
    }

    // 1. Passive HP Regeneration & Auto-Potion when below 42% HP
    const regenRate = 0.018 + (mods.hpRegenPct || 0);
    if (this.mainUnit.hp < this.mainUnit.maxHp) {
      this.mainUnit.hp = Math.min(
        this.mainUnit.maxHp,
        this.mainUnit.hp + this.mainUnit.maxHp * regenRate * dt
      );
      if (this.mainUnit.hp < this.mainUnit.maxHp * 0.42 && this.potions > 0 && this.potionCooldown <= 0) {
        this.usePotion();
      }
    }

    // 2. Check closest living enemy
    const livingEnemies = this.enemies.filter((e) => e.hp > 0);
    livingEnemies.sort((a, b) => a.x - b.x);
    const frontEnemy = livingEnemies[0] || null;

    // 3. Deliberate March vs. Grounded Melee Stance (Stop marching when clashing weapons!)
    const engageDist = frontEnemy ? frontEnemy.x - this.mainUnit.x : 9999;
    const isMarching = !frontEnemy || engageDist > this.mainUnit.range + 10;

    // Khi đang giáp lá cà cận chiến, quân đội đứng trụ vững vàng (advanceSpeed = 0), chỉ hành quân khi tiến tới toán địch tiếp theo!
    const advanceSpeed = isMarching ? 46 : 0;
    this.scrollOffset += advanceSpeed * dt;
    livingEnemies.forEach((e) => {
      e.x -= advanceSpeed * dt;
    });
    this.deadBodies.forEach((db) => {
      db.x -= advanceSpeed * dt;
    });
    this.groundDrops.forEach((d) => {
      d.x -= advanceSpeed * dt;
    });

    // Main Hero & Squad plant their feet firmly in melee combat and lunge forward only when swinging
    const targetY = frontEnemy ? frontEnemy.y : 148;
    this.mainUnit.y += (targetY - this.mainUnit.y) * Math.min(1, dt * 3.5);
    const combatLungeX = !isMarching && this.mainUnit.attackAnim > 0.2 ? 14 * Math.sin(this.mainUnit.attackAnim * Math.PI) : 0;
    this.mainUnit.x = 285 + combatLungeX;
    this.mainUnit.isMoving = isMarching;

    this.squadUnits.forEach((sq) => {
      sq.isMoving = isMarching;
      const sqLunge = sq.attackAnim > 0.2 ? 12 * Math.sin(sq.attackAnim * Math.PI) : 0;
      sq.x = 285 + sq.offsetX + sqLunge;
      sq.y = this.mainUnit.y + sq.offsetY;
    });
    (this.alliedTroops || []).forEach((tr) => {
      tr.isMoving = isMarching;
      const trLunge = tr.attackAnim > 0.2 ? 10 * Math.sin(tr.attackAnim * Math.PI) : 0;
      tr.x = 285 + tr.offsetX + trLunge;
      tr.y = this.mainUnit.y + tr.offsetY;
    });

    // 4. Player Main Hero, Squad Generals & Allied Vanguard Troops Combat Loop
    const allPlayerUnits = [this.mainUnit, ...this.squadUnits, ...(this.alliedTroops || [])];
    allPlayerUnits.forEach((pUnit, uIdx) => {
      // Deliberate attackAnim decay (1.35/s = ~0.74s per 4-frame combo) so every frame of the swing is crisp!
      if (pUnit.attackAnim > 0) pUnit.attackAnim = Math.max(0, pUnit.attackAnim - dt * 1.35);
      if (pUnit.hurtAnim > 0) pUnit.hurtAnim = Math.max(0, pUnit.hurtAnim - dt * 3.5);

      if (!frontEnemy) return;
      const distToEnemy = frontEnemy.x - pUnit.x;
      if (distToEnemy <= pUnit.range + 75) {
        pUnit.attackCooldown -= dt;
        if (pUnit.skillCooldown !== undefined) pUnit.skillCooldown -= dt;

        // If Main Hero, auto-cast ready skills from UNLOCKED Custom Skill Loadout Slots with deliberate pacing
        if (uIdx === 0) {
          const readySlot = this.skillSlotCooldowns.findIndex(
            (cd, sIdx) => cd <= 0 && this.isSkillSlotUnlocked(sIdx)
          );
          if (readySlot !== -1 && pUnit.skillCooldown <= 0) {
            this.castEquippedSkillSlot(readySlot);
            pUnit.skillCooldown = 4.2;
            return;
          }
        }

        // Cast Escort General Active Skill
        if (!pUnit.isAlliedSoldier && uIdx > 0 && pUnit.skillCooldown <= 0 && pUnit.heroConfig?.skill) {
          this.executeHeroSkill(pUnit, livingEnemies, mods, null);
          pUnit.skillCooldown = (pUnit.heroConfig.skill.cooldown * 1.45) / (1 + mods.atkSpeed * 0.25);
          pUnit.attackAnim = 1;
        } else if (pUnit.attackCooldown <= 0) {
          this.performBasicAttack(pUnit, frontEnemy, livingEnemies, mods);
          const hasteMult = this.fieldBuffs?.hasteTimer > 0 ? 1.4 : 1.0;
          pUnit.attackCooldown = 1 / Math.max(0.55, pUnit.atkSpeed * hasteMult);
          pUnit.attackAnim = 1;
        }
      }
    });

    // 5. Auto-trigger or Ready Meta 3Q Combo Ultimate (Hợp Kích)
    if (this.comboRage >= 100 && this.state.autoCastCombo && syn.unlockedComboSkills.length > 0 && livingEnemies.length > 0) {
      this.castMeta3QComboUltimate();
    }

    // 6. Enemy Combat, Knockback Physics & Burn DoT Loop
    livingEnemies.forEach((enemy, eIdx) => {
      if (enemy.attackAnim > 0) enemy.attackAnim = Math.max(0, enemy.attackAnim - dt * 1.4);
      if (enemy.hurtAnim > 0) enemy.hurtAnim = Math.max(0, enemy.hurtAnim - dt * 3.5);

      // Apply smooth knockback physics when hit
      if (enemy.knockbackVx && enemy.knockbackVx > 1) {
        enemy.x += enemy.knockbackVx * dt;
        enemy.knockbackVx = Math.max(0, enemy.knockbackVx - 380 * dt);
      }

      if (enemy.stunTimer > 0) {
        enemy.stunTimer -= dt;
        return;
      }

      // Burn DoT (Đông Ngô Hỏa Công)
      if (enemy.burnTimer > 0) {
        enemy.burnTimer -= dt;
        const burnTick = this.mainUnit.atk * Math.max(0.18, mods.burnDamage) * dt;
        enemy.hp -= burnTick;
        if (enemy.hp <= 0) {
          this.onEnemyKilled(enemy);
          return;
        }
      }

      const dist = enemy.x - this.mainUnit.x;
      // Front 2 enemies engage in melee; rear ranks march at a grounded pace until they reach the front line!
      const meleeEngageRange = enemy.range + (eIdx < 2 ? eIdx * 18 : 34 + (eIdx % 3) * 16);
      if (dist > meleeEngageRange) {
        enemy.x -= (enemy.isBoss ? 32 : 38) * dt;
        enemy.isMoving = true;
      } else {
        enemy.isMoving = false;
        enemy.attackCooldown -= dt;
        if (enemy.skillCooldown !== undefined) enemy.skillCooldown -= dt;

        // Enemy Boss / Vanguard General casts their signature skill!
        if (enemy.isBoss && enemy.skillCooldown !== undefined && enemy.skillCooldown <= 0) {
          enemy.skillCooldown = 5.6;
          enemy.attackAnim = 1;
          const bossSkName = enemy.heroConfig?.skill?.name || 'Bá Vương Trảm';
          const skillDmg = Math.max(4, Math.round(enemy.atk * 1.65 - this.mainUnit.def * 0.45));
          this.mainUnit.hp -= skillDmg;
          this.mainUnit.hurtAnim = 1;
          this.screenShake = Math.max(this.screenShake, 5);
          this.addFloatingText(enemy.x, enemy.y - 76, `${bossSkName}!`, '#fca5a5', 13);
          this.addFloatingText(this.mainUnit.x, this.mainUnit.y - 62, `-${skillDmg}`, '#ef4444', 14);
          this.vfxEffects.push({
            type: enemy.heroConfig?.skill?.effectType || 'crimson_cross',
            weaponType: enemy.heroConfig?.weaponType || 'halberd',
            casterX: enemy.x,
            casterY: enemy.y,
            x: this.mainUnit.x + 25,
            y: 135,
            color: '#ef4444',
            timer: 0.55,
            maxTimer: 0.55,
          });
          if (this.mainUnit.hp <= 0) {
            this.onPlayerDefeated();
          }
          return;
        }

        if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 1 / Math.max(0.5, enemy.atkSpeed);
          enemy.attackAnim = 1;
          const rawDmg = Math.max(2, enemy.atk - this.mainUnit.def * 0.45);
          this.mainUnit.hp -= rawDmg;
          this.mainUnit.hurtAnim = 1;

          if (enemy.isBoss || enemy.isEnemyArcher || Math.random() < 0.45) {
            this.vfxEffects.push({
              type: 'basic_weapon_strike',
              weaponType: enemy.heroConfig?.weaponType || (enemy.isEnemyArcher ? 'bow' : 'halberd'),
              attackerX: enemy.x,
              attackerY: enemy.y,
              x: this.mainUnit.x,
              y: this.mainUnit.y - 26,
              color: '#ef4444',
              isCrit: enemy.isBoss,
              timer: 0.22,
              maxTimer: 0.22,
            });
          }

          if (enemy.isBoss || Math.random() < 0.35) {
            this.addFloatingText(this.mainUnit.x, this.mainUnit.y - 55, `-${Math.round(rawDmg)}`, '#f87171', 11);
          }

          if (this.mainUnit.hp <= 0) {
            this.onPlayerDefeated();
          }
        }
      }
    });

    // 6B. Ragdoll Flying Enemy Corpses Physics
    for (let i = this.deadBodies.length - 1; i >= 0; i--) {
      const db = this.deadBodies[i];
      db.timer -= dt;
      if (db.timer <= 0) {
        this.deadBodies.splice(i, 1);
        continue;
      }
      db.x += db.vx * dt;
      db.offsetY += db.vy * dt;
      db.vy += 680 * dt; // Gravity
      db.rot += db.vRot * dt;

      // Ground bounce
      if (db.offsetY >= 0 && db.vy > 0) {
        db.offsetY = 0;
        db.vy = -db.vy * 0.38;
        db.vx *= 0.62;
        db.vRot *= 0.5;
      }
    }

    // 6C. Single Combat 1v1 Duel ("NHẤT KỴ ĐƯƠNG THIÊN") on Boss Waves!
    const chiefBoss = livingEnemies.find((e) => e.isBoss && !e.isVanguardGeneral);
    if (chiefBoss && !this.activeDuel && !chiefBoss.duelTriggered && chiefBoss.x - this.mainUnit.x < 175) {
      chiefBoss.duelTriggered = true;
      this.activeDuel = {
        bossUid: chiefBoss.uid,
        bossName: chiefBoss.heroConfig?.name || chiefBoss.name,
        bossHeroId: chiefBoss.bossHeroId || 'lu_bu',
        timer: 6.5,
        maxTimer: 6.5,
        clashTick: 0,
      };
      this.triggerBanner(
        `NHẤT KỴ ĐƯƠNG THIÊN: ${this.mainUnit.heroConfig.name.toUpperCase()} ĐẤU ${this.activeDuel.bossName.toUpperCase()}!`,
        '#facc15'
      );
      this.screenShake = 8;
    }

    if (this.activeDuel) {
      this.activeDuel.timer -= dt;
      this.activeDuel.clashTick -= dt;
      const duelBoss = livingEnemies.find((e) => e.uid === this.activeDuel.bossUid);
      if (!duelBoss || duelBoss.hp <= 0) {
        // Player won the 1v1 Duel!
        const rewardGold = 180 * Math.max(1, this.state.currentStageId);
        this.state.gold += rewardGold;
        this.state.iron += 15;
        this.triggerBanner(`ĐƠN ĐẤU ĐẠI THẮNG! THƯỞNG +${rewardGold} LƯƠNG THẢO & +15 HUYỀN THIẾT!`, '#fde047');
        this.activeDuel = null;
      } else if (this.activeDuel.timer <= 0) {
        this.activeDuel = null;
      } else {
        // Pull Main Hero and Boss into high-speed center duel arena & trigger rapid weapon clashes!
        duelBoss.x += (this.mainUnit.x + 88 - duelBoss.x) * Math.min(1, dt * 6);
        duelBoss.y += (this.mainUnit.y - duelBoss.y) * Math.min(1, dt * 6);
        if (this.activeDuel.clashTick <= 0) {
          this.activeDuel.clashTick = 0.42;
          this.mainUnit.attackAnim = 1;
          duelBoss.attackAnim = 1;
          const clashDmg = Math.round(this.mainUnit.atk * 0.95);
          duelBoss.hp -= clashDmg;
          duelBoss.hurtAnim = 0.8;
          this.screenShake = Math.max(this.screenShake, 4);
          this.addFloatingText(duelBoss.x, duelBoss.y - 68, `-${clashDmg}`, '#fde047', 13);
          this.vfxEffects.push({
            type: 'basic_weapon_strike',
            weaponType: this.mainUnit.heroConfig?.weaponType || 'spear',
            attackerX: this.mainUnit.x,
            attackerY: this.mainUnit.y,
            x: (this.mainUnit.x + duelBoss.x) * 0.5,
            y: this.mainUnit.y - 24,
            isCrit: true,
            timer: 0.22,
            maxTimer: 0.22,
          });
          if (duelBoss.hp <= 0) {
            this.onEnemyKilled(duelBoss);
          }
        }
      }
    }

    // 6D. Dynamic Battlefield Encounter ("KỲ NGỘ HÀNH QUÂN")
    if (this.fieldBuffs.hasteTimer > 0) {
      this.fieldBuffs.hasteTimer = Math.max(0, this.fieldBuffs.hasteTimer - dt);
    }
    this.fieldEventSpawnCooldown -= dt;
    if (!this.fieldEvent && this.fieldEventSpawnCooldown <= 0 && livingEnemies.length > 0) {
      this.fieldEventSpawnCooldown = 24 + Math.random() * 12;
      const evTypes = [
        { type: 'war_drum', title: 'Trống trận Kỳ Ngộ', subtitle: 'Tốc Đánh +50% & Đầy Nộ!' },
        { type: 'imperial_convoy', title: 'Thương Buôn Tây Lương', subtitle: 'Nhận Rương Thần Binh & Vàng!' },
        { type: 'arrow_support', title: 'Viện Quân Cung Nỏ', subtitle: 'Gọi Mưa Tên Hỏa Phụng!' },
      ];
      const chosen = evTypes[Math.floor(Math.random() * evTypes.length)];
      this.fieldEvent = {
        id: this.nextEntityId++,
        ...chosen,
        x: 560,
        y: 122,
        timer: 9.0,
        claimed: false,
      };
    }

    if (this.fieldEvent) {
      this.fieldEvent.timer -= dt;
      this.fieldEvent.x -= advanceSpeed * 0.65 * dt;
      // Auto-trigger when Main Hero marches past it (or when clicked via claimFieldEvent())
      if (this.fieldEvent.x <= this.mainUnit.x + 48 && !this.fieldEvent.claimed) {
        this.claimFieldEvent();
      } else if (this.fieldEvent.timer <= 0) {
        this.fieldEvent = null;
      }
    }

    // 6E. Upgraded Supply Cart Repeating Crossbow Support (Tier 2 Lv.4+ & Tier 3 Lv.8+)
    const cartLv = this.state.buildings?.supply_workshop || 1;
    if (cartLv >= 2 && frontEnemy) {
      this.cartCrossbowCooldown -= dt;
      const fireInterval = cartLv >= 5 ? 1.1 : 1.8;
      if (this.cartCrossbowCooldown <= 0) {
        this.cartCrossbowCooldown = fireInterval;
        const boltDmg = Math.round(this.mainUnit.atk * (0.45 + cartLv * 0.12));
        frontEnemy.hp -= boltDmg;
        frontEnemy.hurtAnim = 0.7;
        this.addFloatingText(frontEnemy.x, frontEnemy.y - 52, `-${boltDmg}`, '#38bdf8', 11);
        this.vfxEffects.push({
          type: 'basic_weapon_strike',
          weaponType: 'bow',
          attackerX: this.mainUnit.x - 155,
          attackerY: 145,
          x: frontEnemy.x,
          y: frontEnemy.y - 24,
          isCrit: cartLv >= 5,
          timer: 0.22,
          maxTimer: 0.22,
        });
        if (frontEnemy.hp <= 0) {
          this.onEnemyKilled(frontEnemy);
        }
      }
    }

    // 7. Deskrawl Loot Cart Collection (Để chiến lợi phẩm tỏa cột sáng Diablo 2.2s trên mặt đất trước khi Xe Lương Thảo thu gom)
    const cartX = this.mainUnit.x - 145;
    const cartSpeedMult = 1 + (this.state.buildings.supply_workshop - 1) * 0.15;
    for (let i = this.groundDrops.length - 1; i >= 0; i--) {
      const drop = this.groundDrops[i];
      drop.age = (drop.age || 0) + dt;

      if (drop.age > 2.2) {
        const dx = cartX - drop.x;
        drop.x += dx * 6.5 * cartSpeedMult * dt;
        if (Math.abs(dx) < 32 || drop.age > 3.6) {
          this.collectDrop(drop);
          this.groundDrops.splice(i, 1);
        }
      }
    }

    // 8. Update VFX & Floating Damage Numbers
    for (let i = this.vfxEffects.length - 1; i >= 0; i--) {
      this.vfxEffects[i].timer -= dt;
      if (this.vfxEffects[i].timer <= 0) this.vfxEffects.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 32 * dt;
      ft.timer -= dt;
      if (ft.timer <= 0) this.floatingTexts.splice(i, 1);
    }

    // 9. Check Wave Clear (with 0.85s pause to admire the Boss Loot Fountain!)
    if (this.enemies.length > 0 && this.enemies.every((e) => e.hp <= 0)) {
      this.waveClearTimer = (this.waveClearTimer || 0) + dt;
      if (this.waveClearTimer >= 0.85) {
        this.waveClearTimer = 0;
        this.onWaveCleared();
      }
    } else {
      this.waveClearTimer = 0;
    }
  }

  claimFieldEvent() {
    if (!this.fieldEvent || this.fieldEvent.claimed) return false;
    const ev = this.fieldEvent;
    ev.claimed = true;
    soundEngine.playLootChime(true);

    if (ev.type === 'war_drum') {
      this.fieldBuffs.hasteTimer = 10.0;
      this.comboRage = Math.min(100, this.comboRage + 50);
      this.triggerBanner('KỲ NGỘ TRỐNG TRẬN: TỐC ĐÁNH CỰC HẠN & +50 NỘ KHÍ!', '#facc15');
    } else if (ev.type === 'imperial_convoy') {
      const bonusGold = 120 * Math.max(1, this.state.currentStageId);
      this.state.gold += bonusGold;
      const item = this.generateItem(this.state.level + 1, null, 'epic', true);
      this.groundDrops.push({
        id: this.nextEntityId++,
        type: 'item',
        item,
        x: this.mainUnit.x + 20,
        y: 148,
        color: item.rarityColor,
        label: item.name,
      });
      this.triggerBanner(`THƯƠNG BUÔN TÂY LƯƠNG: +${bonusGold} VÀNG & THẦN BINH!`, '#fde047');
    } else if (ev.type === 'arrow_support') {
      const living = this.enemies.filter((e) => e.hp > 0);
      living.forEach((e) => {
        const dmg = Math.round(this.mainUnit.atk * 2.4);
        e.hp -= dmg;
        e.hurtAnim = 1;
        this.addFloatingText(e.x, e.y - 58, `-${dmg}`, '#f97316', 12);
        if (e.hp <= 0) this.onEnemyKilled(e);
      });
      this.vfxEffects.push({
        type: 'arrow_rain',
        casterX: this.mainUnit.x,
        x: 520,
        y: 140,
        timer: 0.6,
        maxTimer: 0.6,
      });
      this.triggerBanner('KỲ NGỘ VIỆN QUÂN: VẠN TIỄN TỀ PHÁT!', '#f97316');
    }

    this.fieldEvent = null;
    this.saveGame();
    return true;
  }

  // --------------------------------------------------------------------------
  // COMBAT ACTIONS, HERO SKILLS, SKILL RUNES & META 3Q COMBO ULTIMATES
  // --------------------------------------------------------------------------
  performBasicAttack(attacker, primaryTarget, allEnemies, mods) {
    const isCrit = Math.random() < (attacker.critChance || 0.15);
    let dmg = attacker.atk * (isCrit ? attacker.critDmg || 1.5 : 1);
    if (primaryTarget.isBoss && mods.bossDmg > 0) {
      dmg *= 1 + mods.bossDmg;
    }

    if (attacker.isMainHero) {
      soundEngine.playSlash(isCrit);
    }

    // Progressive Cleave: Khởi đầu Lv.1 đánh đơn (1 mục tiêu), lên Lv.5 mở Hoành Tảo (2 mục tiêu), Lv.10 (3 mục tiêu), Lv.18 (4 mục tiêu)!
    const cleaveCount = attacker.isAlliedSoldier ? 1 : this.getMaxCleaveTargets();
    const cleaveTargets = allEnemies.filter((e) => e.x - attacker.x <= attacker.range + 65).slice(0, cleaveCount);
    const hitList = cleaveTargets.length > 0 ? cleaveTargets : allEnemies.slice(0, 1);

    hitList.forEach((target, idx) => {
      const falloff = idx === 0 ? 1.0 : idx === 1 ? 0.65 : 0.45;
      const finalDmg = Math.max(1, Math.round(dmg * falloff - target.def * 0.35));
      target.hp -= finalDmg;
      target.hurtAnim = 1;
      if (!attacker.isAlliedSoldier) {
        target.knockbackVx = target.isBoss ? 18 : 48;
      }

      if (mods.burnDamage > 0) {
        target.burnTimer = 3.5;
      }

      if (!attacker.isAlliedSoldier && (idx < 2 || isCrit)) {
        this.addFloatingText(
          target.x + (Math.random() - 0.5) * 18,
          target.y - 52 - idx * 12,
          `${isCrit ? 'BẠO ' : ''}${finalDmg}`,
          isCrit ? '#fde047' : '#f8fafc',
          isCrit ? 14 : 11
        );
      }

      if (target.hp <= 0) {
        this.onEnemyKilled(target);
      }
    });

    if (!attacker.isAlliedSoldier && mods.lifesteal > 0) {
      const heal = Math.round(dmg * mods.lifesteal);
      this.mainUnit.hp = Math.min(this.mainUnit.maxHp, this.mainUnit.hp + heal);
    }

    if (!attacker.isAlliedSoldier) {
      this.comboRage = Math.min(100, this.comboRage + 3.2 * (1 + mods.rageGain));
    }

    this.vfxEffects.push({
      type: 'basic_weapon_strike',
      weaponType: attacker.heroConfig?.weaponType || 'spear',
      attackerX: attacker.x,
      attackerY: attacker.y,
      x: primaryTarget.x,
      y: primaryTarget.y - 26,
      color: attacker.factionColor || '#fde047',
      isCrit,
      timer: 0.24,
      maxTimer: 0.24,
    });
  }

  executeHeroSkill(caster, enemies, mods, runeObj = null) {
    const sk = caster.heroConfig.skill;
    const runeDmgMult = runeObj?.dmgMult || 1.0;
    const skillMult = sk.multiplier * 0.44 * (1 + mods.skillDmg) * runeDmgMult;
    // Progressive AoE Skill Targets: Khởi đầu Lv.1 trúng tối đa 2 mục tiêu tiền tuyến, mở rộng dần theo cấp Thống Soái!
    const baseMaxTargets = Math.min(8, 2 + Math.floor((this.state.level || 1) / 3));
    const maxTargets =
      runeObj?.id === 'split_phantom' || runeObj?.id === 'thunder_chain'
        ? baseMaxTargets + 1
        : baseMaxTargets;
    const targets = enemies.slice(0, maxTargets);

    soundEngine.playSkillCast(sk.effectType);

    // Trigger Anime / Musou Portrait Cut-In Banner!
    this.skillCutIn = {
      heroId: caster.heroId || caster.heroConfig?.id || 'lu_bu',
      heroName: caster.heroConfig?.name || caster.name,
      skillName: sk.name,
      runeName: runeObj?.name || '',
      color: runeObj?.color || caster.factionColor || '#fde047',
      timer: 0.95,
      maxTimer: 0.95,
    };

    const runeTag = runeObj ? ` • ${runeObj.name}` : '';
    this.addFloatingText(caster.x + 20, caster.y - 82, `${sk.name}${runeTag}!`, runeObj?.color || caster.factionColor, 14);
    this.screenShake = Math.max(this.screenShake, 5);

    let totalDealt = 0;

    targets.forEach((enemy, idx) => {
      const isCrit = Math.random() < caster.critChance + 0.15;
      const critMult = isCrit ? caster.critDmg + (runeObj?.critDmgBonus || 0) : 1;
      let dmg = caster.atk * skillMult * critMult * (idx === 0 ? 1.0 : 0.72);
      if (enemy.isBoss) {
        dmg *= 1 + mods.bossDmg;
        if (runeObj?.bossDmgMult) dmg *= runeObj.bossDmgMult;
      }

      if (caster.heroId === 'guan_yu' && enemy.hp / enemy.maxHp <= 0.18) {
        dmg *= 2.5;
      }
      if (caster.heroId === 'zhang_fei') {
        enemy.stunTimer = 1.6;
      }
      if (runeObj?.freezeDur) {
        enemy.stunTimer = Math.max(enemy.stunTimer || 0, runeObj.freezeDur);
      }
      if (caster.heroId === 'zhou_yu' || caster.heroId === 'sun_shangxiang' || caster.heroId === 'lu_xun') {
        enemy.burnTimer = 4.5;
      }

      const finalDmg = Math.max(1, Math.round(dmg - enemy.def * 0.25));
      totalDealt += finalDmg;
      enemy.hp -= finalDmg;
      enemy.hurtAnim = 1;
      enemy.knockbackVx = enemy.isBoss ? 45 : 115 + (idx % 3) * 25;

      if (idx < 4 || enemy.isBoss) {
        this.addFloatingText(
          enemy.x + (Math.random() - 0.5) * 24,
          enemy.y - 64 - (idx % 3) * 12,
          `${finalDmg}`,
          runeObj?.color || caster.factionColor,
          15
        );
      }

      if (enemy.hp <= 0) {
        this.onEnemyKilled(enemy);
      }
    });

    // Blood Leech Rune (Huyết Tế Ấn)
    if (runeObj?.lifestealPct && totalDealt > 0) {
      const runeHeal = Math.round(totalDealt * runeObj.lifestealPct * 0.25);
      this.mainUnit.hp = Math.min(this.mainUnit.maxHp, this.mainUnit.hp + runeHeal);
    }

    if (caster.heroId === 'liu_bei' || caster.heroId === 'hua_tuo') {
      this.mainUnit.hp = Math.min(this.mainUnit.maxHp, this.mainUnit.hp + this.mainUnit.maxHp * 0.24);
    }

    const bonusRuneRage = runeObj?.bonusRage || 0;
    if (caster.heroId === 'zhuge_liang' || caster.heroId === 'diao_chan') {
      this.comboRage = Math.min(100, this.comboRage + 16 + bonusRuneRage);
    } else {
      this.comboRage = Math.min(100, this.comboRage + 9 * (1 + mods.rageGain) + bonusRuneRage);
    }

    this.vfxEffects.push({
      type: runeObj?.id === 'thunder_chain' ? 'bagua_lightning' : sk.effectType || 'aoe_burst',
      skillName: sk.name,
      casterHeroId: caster.heroId,
      weaponType: caster.heroConfig?.weaponType || 'spear',
      casterX: caster.x,
      casterY: caster.y,
      x: targets[0] ? targets[0].x + 35 : caster.x + 150,
      y: 135,
      color: runeObj?.color || caster.factionColor || '#fde047',
      extraProjectiles: runeObj?.extraProjectiles || 0,
      timer: 0.65,
      maxTimer: 0.65,
    });
  }

  castMeta3QComboUltimate() {
    const { mods, syn } = this.computeTotalBonuses();
    const livingEnemies = this.enemies.filter((e) => e.hp > 0);
    if (syn.unlockedComboSkills.length === 0 || livingEnemies.length === 0) return false;

    const combo = syn.unlockedComboSkills[0];
    this.comboRage = 0;
    this.screenShake = 14;

    soundEngine.playSkillCast('combo_ultimate');
    this.triggerBanner(combo.bannerText, combo.color);

    this.skillCutIn = {
      heroId: this.state.mainHeroId,
      heroName: 'HỢP KÍCH VÔ SONG',
      skillName: combo.name,
      runeName: combo.bondName,
      color: combo.color || '#fde047',
      timer: 1.25,
      maxTimer: 1.25,
    };

    const dmgMult = combo.multiplier * 0.65 * (1 + mods.skillDmg);
    livingEnemies.forEach((enemy) => {
      const dmg = Math.round(this.mainUnit.atk * dmgMult * (1 + Math.random() * 0.15));
      enemy.hp -= dmg;
      enemy.hurtAnim = 1;
      enemy.stunTimer = 1.8;
      enemy.burnTimer = 4.0;
      enemy.knockbackVx = enemy.isBoss ? 80 : 180;

      this.addFloatingText(enemy.x, enemy.y - 82, `HỢP KÍCH ${dmg}!`, combo.color, 18);

      if (enemy.hp <= 0) {
        this.onEnemyKilled(enemy);
      }
    });

    if (combo.healPct) {
      const healAmt = Math.round(this.mainUnit.maxHp * combo.healPct);
      this.mainUnit.hp = Math.min(this.mainUnit.maxHp, this.mainUnit.hp + healAmt);
      this.addFloatingText(this.mainUnit.x, this.mainUnit.y - 75, `+${healAmt} HP`, '#4ade80', 15);
    }

    this.vfxEffects.push({
      type: 'combo_ultimate',
      x: 520,
      y: 120,
      color: combo.color,
      label: combo.name,
      timer: 1.1,
      maxTimer: 1.1,
    });

    return true;
  }

  // --------------------------------------------------------------------------
  // ENEMY KILLED -> RAGDOLL LAUNCH, LOOT DROPS & DESKRAWL CAPTURE SYSTEM
  // --------------------------------------------------------------------------
  onEnemyKilled(enemy) {
    if (enemy.alreadyProcessedKill) return;
    enemy.alreadyProcessedKill = true;
    enemy.hp = 0;
    this.waveKilledEnemies = (this.waveKilledEnemies || 0) + 1;

    // Launch Ragdoll Corpse
    this.deadBodies.push({
      x: enemy.x,
      y: enemy.y,
      offsetY: -8,
      vx: 95 + Math.random() * 85,
      vy: -210 - Math.random() * 90,
      rot: 0,
      vRot: 5 + Math.random() * 5,
      timer: 0.75,
      maxTimer: 0.75,
      isBoss: enemy.isBoss,
    });

    const stage = this.getCurrentStage();
    const effectiveLv =
      (this.activeGauntletPass ? this.activeGauntletPass.recLv : stage.enemyLevel) +
      (this.state.ascensionTier || 0) * 5;
    const { mods } = this.computeTotalBonuses();
    this.state.totalKills += 1;

    // 1. EXP Gain & Boss Skulls
    const expGain = Math.round((enemy.isBoss ? 68 : 16) * Math.pow(1.15, effectiveLv - 1));
    this.gainExp(expGain);

    if (enemy.isBoss) {
      this.state.bossSkulls = (this.state.bossSkulls || 0) + (enemy.isVanguardGeneral ? 1 : 3);
      this.potions = Math.min(this.maxPotions, (this.potions || 0) + 1);
    }

    // 2. Gold / Lương Thảo Drop (Boss nổ Rương Hoàng Kim + Vàng văng tứ phía giống Deskrawl!)
    const goldAmt = Math.round(
      (enemy.isBoss ? 85 : 15) * Math.pow(1.15, effectiveLv - 1) * (1 + mods.goldBonus)
    );
    this.groundDrops.push({
      id: this.nextEntityId++,
      type: 'gold',
      amount: goldAmt,
      x: enemy.x + (Math.random() - 0.5) * 28,
      y: enemy.y + 4,
      color: '#facc15',
      label: enemy.isBoss ? `Rương Hoàng Kim (+${goldAmt})` : `+${goldAmt} Vàng`,
    });

    // 3. Iron Drop
    if (enemy.isBoss || Math.random() < 0.35) {
      const ironAmt = enemy.isBoss ? 8 + stage.id * 2 : 2 + Math.floor(stage.id * 0.5);
      this.groundDrops.push({
        id: this.nextEntityId++,
        type: 'iron',
        amount: ironAmt,
        x: enemy.x + 26,
        y: enemy.y - 4,
        color: '#38bdf8',
        label: `+${ironAmt} Huyền Thiết`,
      });
    }

    // 4. DIABLO LOOT FOUNTAIN (Boss/Tiên Phong nổ 3-5 món Thần Binh tỏa cột sáng rực rỡ giống Deskrawl Screenshot #2!)
    const itemDropCount = enemy.isGauntletBoss
      ? 4
      : enemy.isBoss && !enemy.isVanguardGeneral
        ? 4
        : enemy.isVanguardGeneral
          ? 2
          : Math.random() < 0.28
            ? 1
            : 0;

    for (let dIdx = 0; dIdx < itemDropCount; dIdx++) {
      const forcedRarity =
        enemy.isGauntletBoss && dIdx === 0 && Math.random() < 0.75
          ? 'set'
          : !enemy.isVanguardGeneral && enemy.isBoss && dIdx === 0 && Math.random() < 0.45
            ? 'legendary'
            : null;
      const item = this.generateItem(effectiveLv, null, forcedRarity, enemy.isBoss);
      const spreadX = itemDropCount > 1 ? (dIdx - (itemDropCount - 1) / 2) * 44 + (Math.random() - 0.5) * 14 : -10;
      const spreadY = (dIdx % 2 === 0 ? -6 : 6) + (Math.random() - 0.5) * 6;
      this.groundDrops.push({
        id: this.nextEntityId++,
        type: 'item',
        item,
        x: Math.max(310, Math.min(1180, enemy.x + spreadX)),
        y: Math.max(134, Math.min(164, enemy.y + spreadY)),
        stackIdx: dIdx,
        color: item.rarityColor,
        label: item.name,
      });
    }

    // 5. PHASE 11 — DESKRAWL CAPTURE SYSTEM & GUARANTEED BOSS SOUL SHARDS!
    if (enemy.isBoss && enemy.bossHeroId) {
      const bossHero = HEROES.find((h) => h.id === enemy.bossHeroId);
      if (bossHero) {
        // Always drop 1 Boss General Soul Shard (3 Shards = Auto-Recruit or +1 Star!)
        this.groundDrops.push({
          id: this.nextEntityId++,
          isCaptureSoul: true,
          captureType: 'shard',
          heroId: bossHero.id,
          x: enemy.x + 18,
          y: enemy.y - 8,
          stackIdx: 4,
          color: '#c084fc',
          label: `🏮 Mảnh Hồn: ${bossHero.name}`,
        });
      }
    }

    const baseCaptureChance = enemy.isGauntletBoss
      ? 0.75
      : enemy.isBoss
        ? 0.52
        : 0.16;
    const finalCaptureChance = Math.min(0.92, baseCaptureChance + mods.captureBonus);
    if (Math.random() < finalCaptureChance) {
      if (enemy.isBoss && enemy.bossHeroId) {
        const bossHero = HEROES.find((h) => h.id === enemy.bossHeroId);
        if (bossHero) {
          this.groundDrops.push({
            id: this.nextEntityId++,
            isCaptureSoul: true,
            captureType: 'general',
            heroId: bossHero.id,
            x: enemy.x - 24,
            y: enemy.y - 10,
            stackIdx: 5,
            color: '#f43f5e',
            label: `Chiêu Hàng: ${bossHero.name}`,
          });
        }
      } else if (enemy.troopDropId) {
        const troopDef = MINION_TROOPS.find((t) => t.id === enemy.troopDropId);
        if (troopDef) {
          this.groundDrops.push({
            id: this.nextEntityId++,
            isCaptureSoul: true,
            captureType: 'troop',
            troopId: troopDef.id,
            x: enemy.x,
            y: enemy.y - 6,
            color: troopDef.color,
            label: troopDef.name,
          });
        }
      }
    }
  }

  unlockOrAwakenHeroFromBattle(hId, sourceLabel = 'THU PHỤC') {
    const heroDef = HEROES.find((h) => h.id === hId);
    if (!heroDef) return;
    if (!this.state.unlockedHeroes[hId]) {
      this.state.unlockedHeroes[hId] = { stars: 1, level: 1 };
      this.triggerBanner(`${sourceLabel} DANH TƯỚNG: ${heroDef.name.toUpperCase()}!`, '#facc15');
      if (this.state.squadHeroIds.length < this.getMaxSquadSlots()) {
        this.state.squadHeroIds.push(hId);
      }
      if (!this.state.equippedSkillHeroIds.includes(hId)) {
        const emptySlot = this.state.equippedSkillHeroIds.findIndex((id) => !id || !this.state.unlockedHeroes[id]);
        if (emptySlot !== -1) this.state.equippedSkillHeroIds[emptySlot] = hId;
      }
      this.autoAssignGovernors();
      this.rebuildPlayerArmy();
    } else {
      this.state.unlockedHeroes[hId].stars = Math.min(5, this.state.unlockedHeroes[hId].stars + 1);
      this.triggerBanner(
        `THỨC TỈNH: ${heroDef.name.toUpperCase()} LÊN ${this.state.unlockedHeroes[hId].stars} SAO!`,
        '#fde047'
      );
      this.rebuildPlayerArmy();
    }
  }

  collectDrop(drop) {
    if (drop.isCaptureSoul) {
      soundEngine.playLootChime(true);
      this.state.totalCaptures += 1;
      if (drop.captureType === 'general') {
        this.unlockOrAwakenHeroFromBattle(drop.heroId, 'THU PHỤC');
      } else if (drop.captureType === 'shard') {
        const hId = drop.heroId;
        const heroDef = HEROES.find((h) => h.id === hId);
        if (heroDef) {
          this.state.heroShards[hId] = (this.state.heroShards[hId] || 0) + 1;
          const curShards = this.state.heroShards[hId];
          if (curShards >= 3) {
            this.state.heroShards[hId] -= 3;
            this.unlockOrAwakenHeroFromBattle(hId, 'HỢP HỒN CHIÊU MỘ');
          } else if (this.mainUnit) {
            this.addFloatingText(
              this.mainUnit.x,
              this.mainUnit.y - 74,
              `🏮 Hồn ${heroDef.name} (${curShards}/3)`,
              '#c084fc',
              12
            );
          }
        }
      } else if (drop.captureType === 'troop') {
        const tId = drop.troopId;
        this.state.capturedTroops[tId] = (this.state.capturedTroops[tId] || 0) + 1;
        this.rebuildPlayerArmy();
      }
      this.saveGame();
      return;
    }

    if (drop.type === 'gold') {
      this.state.gold += drop.amount;
    } else if (drop.type === 'iron') {
      this.state.iron += drop.amount;
    } else if (drop.type === 'item' && drop.item) {
      const item = drop.item;
      const isHighTier = ['set', 'legendary', 'mythic'].includes(item.rarity);
      soundEngine.playLootChime(isHighTier);
      const rarityIdx = ITEM_RARITIES.findIndex((r) => r.id === item.rarity);
      if (this.state.autoSalvageRarityIndex > 0 && rarityIdx < this.state.autoSalvageRarityIndex && item.rarity !== 'set') {
        const ironGain = ITEM_RARITIES[rarityIdx].salvageIron;
        this.state.iron += ironGain;
      } else {
        const cap = this.getCartCapacity();
        // Auto-equip if slot is empty!
        if (!this.state.equipped[item.slot]) {
          this.state.equipped[item.slot] = item;
          this.rebuildPlayerArmy();
          this.addFloatingText(this.mainUnit.x, this.mainUnit.y - 72, `MẶC: ${item.name}`, item.rarityColor, 12);
        } else if (this.state.inventory.length < cap) {
          this.state.inventory.unshift(item);
          if (isHighTier) {
            this.addFloatingText(this.mainUnit.x - 140, 92, `${item.name}`, item.rarityColor, 11);
          }
        } else {
          const ironGain = ITEM_RARITIES[rarityIdx].salvageIron;
          this.state.iron += ironGain;
        }
      }
    }
    this.saveGame();
  }

  getCartCapacity() {
    return 24 + (this.state.buildings.supply_workshop - 1) * 6;
  }

  gainExp(amount) {
    this.state.exp += amount;
    while (this.state.exp >= this.state.expToNext) {
      this.state.exp -= this.state.expToNext;
      this.state.level += 1;
      this.state.expToNext = Math.round(180 * Math.pow(1.28, this.state.level - 1));
      this.rebuildPlayerArmy();
      this.mainUnit.hp = this.mainUnit.maxHp;

      const lv = this.state.level;
      if (lv === 2) {
        this.triggerBanner('THĂNG CẤP LV.2 — MỞ THÂN BINH HỘ VỆ!', '#fde047');
      } else if (lv === 4) {
        this.triggerBanner('THĂNG CẤP LV.4 — MỞ Ô VÕ KỸ 2 & PHÓ TƯỚNG 1!', '#38bdf8');
      } else if (lv === 5) {
        this.triggerBanner('THĂNG CẤP LV.5 — MỞ ĐÁNH LAN 2 MỤC TIÊU & ẤN KHẢM!', '#fde047');
      } else if (lv === 8) {
        this.triggerBanner('THĂNG CẤP LV.8 — MỞ Ô VÕ KỸ 3 & PHÓ TƯỚNG 2!', '#38bdf8');
      } else if (lv === 10) {
        this.triggerBanner('THĂNG CẤP LV.10 — MỞ ĐÁNH LAN 3 MỤC TIÊU!', '#4ade80');
      } else if (lv === 12) {
        this.triggerBanner('THĂNG CẤP LV.12 — MỞ Ô VÕ KỸ 4!', '#f43f5e');
      } else {
        this.triggerBanner(`THĂNG CẤP THỐNG SOÁI LV.${lv}!`, '#4ade80');
      }
    }
  }

  onWaveCleared() {
    if (this.activeGauntletPass) {
      const pId = this.activeGauntletPass.passId;
      if (!this.state.clearedGauntletPassIds.includes(pId)) {
        this.state.clearedGauntletPassIds.push(pId);
      }
      this.state.iron += 60 * pId;
      this.triggerBanner(`VƯỢT QUAN THÀNH CÔNG: ${this.activeGauntletPass.name.toUpperCase()}!`, '#10b981');
      this.activeGauntletPass = null;
      this.saveGame();
      this.spawnWave();
      return;
    }

    const stage = this.getCurrentStage();
    const preBossWave = stage.wavesPerBoss - 1;

    if (this.state.currentWave >= stage.wavesPerBoss) {
      // Đã hạ gục Chủ Soái Trấn Ải -> Tự động tiến sang Chương tiếp theo!
      if (!this.state.clearedStageIds.includes(stage.id)) {
        this.state.clearedStageIds.push(stage.id);
      }
      if (this.state.currentStageId >= this.state.maxUnlockedStageId && this.state.maxUnlockedStageId < CAMPAIGN_STAGES.length) {
        this.state.maxUnlockedStageId += 1;
      }
      const clearBonusGold = 150 * stage.id;
      this.state.gold += clearBonusGold;
      this.state.iron += 12 * stage.id;
      this.triggerBanner(
        `PHÁ QUAN ${stage.name.toUpperCase()}! THƯỞNG +${clearBonusGold} VÀNG & TIẾN QUÂN!`,
        '#10b981'
      );
      if (this.state.currentStageId < CAMPAIGN_STAGES.length) {
        this.state.currentStageId += 1;
        this.state.currentWave = 1;
        this.state.farmingBeforeBoss = false;
      } else {
        this.state.currentWave = 1;
        this.state.farmingBeforeBoss = false;
      }
    } else if (this.state.currentWave === preBossWave && this.state.farmingBeforeBoss) {
      // Chỉ dừng ở Đợt 9 khi trước đó bị Boss đánh bại (cần Rèn Quân rồi bấm Khiêu Chiến Boss)!
      this.state.currentWave = preBossWave;
    } else {
      // Tự động tiến từ Đợt 1 -> 2 -> ... -> 10 (Chủ Soái Trấn Ải)!
      this.state.currentWave += 1;
    }
    this.saveGame();
    this.spawnWave();
  }

  onPlayerDefeated(isTimeout = false) {
    this.activeGauntletPass = null;
    this.activeDuel = null;
    this.bossFightTimer = 0;
    const stage = this.getCurrentStage();
    const wasBossWave = this.state.currentWave >= stage.wavesPerBoss;
    this.state.currentWave = wasBossWave ? Math.max(1, stage.wavesPerBoss - 1) : Math.max(1, this.state.currentWave - 1);
    if (wasBossWave) {
      this.state.farmingBeforeBoss = true;
    }
    this.rebuildPlayerArmy();
    this.mainUnit.hp = this.mainUnit.maxHp;
    this.triggerBanner(
      isTimeout
        ? 'QUÁ HẠN 32 GIÂY ĐẤU CHỦ SOÁI! HÃY NÂNG CẤP THẦN BINH & QUÂN DOANH RỒI TÁI CHIẾN!'
        : 'THẤT THỦ TRƯỚC CỬA QUAN — LÙI VỀ LUYỆN QUÂN & RÈN THẦN BINH!',
      '#f59e0b'
    );
    this.saveGame();
    this.spawnWave();
  }

  // --------------------------------------------------------------------------
  // DIABLO ITEM GENERATOR (WITH PHASE 7 GREEN EQUIPMENT SETS)
  // --------------------------------------------------------------------------
  generateItem(itemLevel = 1, forcedSlot = null, forcedRarityId = null, isBossDrop = false, forcedSetId = null) {
    const { mods } = this.computeTotalBonuses();
    const slotObj = forcedSlot
      ? EQUIP_SLOTS.find((s) => s.id === forcedSlot)
      : EQUIP_SLOTS[Math.floor(Math.random() * EQUIP_SLOTS.length)];

    let rarityObj = ITEM_RARITIES[0];
    if (forcedRarityId) {
      rarityObj = ITEM_RARITIES.find((r) => r.id === forcedRarityId) || ITEM_RARITIES[0];
    } else {
      const mfBoost = 1 + mods.magicFind + (isBossDrop ? 1.4 : 0);
      const roll = Math.random() * 100;
      if (roll < 1.1 * mfBoost) rarityObj = ITEM_RARITIES.find((r) => r.id === 'mythic');
      else if (roll < 4.2 * mfBoost) rarityObj = ITEM_RARITIES.find((r) => r.id === 'set');
      else if (roll < 9.0 * mfBoost) rarityObj = ITEM_RARITIES.find((r) => r.id === 'legendary');
      else if (roll < 20 * mfBoost) rarityObj = ITEM_RARITIES.find((r) => r.id === 'epic');
      else if (roll < 42 * mfBoost) rarityObj = ITEM_RARITIES.find((r) => r.id === 'rare');
      else if (roll < 68) rarityObj = ITEM_RARITIES.find((r) => r.id === 'uncommon');
      else rarityObj = ITEM_RARITIES[0];
    }

    let setDef = null;
    if (rarityObj.id === 'set') {
      setDef = forcedSetId
        ? ITEM_SETS.find((s) => s.id === forcedSetId)
        : ITEM_SETS[Math.floor(Math.random() * ITEM_SETS.length)];
    }

    const namePool = FAMOUS_ITEMS[slotObj.id] || ['Chiến Khí Tam Quốc'];
    const baseName = setDef
      ? `[${setDef.heroName}] ${namePool[Math.floor(Math.random() * namePool.length)]}`
      : namePool[Math.floor(Math.random() * namePool.length)];
    const levelMult = Math.pow(1.18, itemLevel - 1) * rarityObj.mult;

    const baseStats = {};
    if (slotObj.baseStat === 'atk') {
      baseStats.atk = Math.max(4, Math.round(14 * levelMult * (0.9 + Math.random() * 0.2)));
    } else if (slotObj.baseStat === 'hp') {
      baseStats.hp = Math.max(25, Math.round(95 * levelMult * (0.9 + Math.random() * 0.2)));
    } else if (slotObj.baseStat === 'def') {
      baseStats.def = Math.max(3, Math.round(10 * levelMult * (0.9 + Math.random() * 0.2)));
    } else if (slotObj.baseStat === 'atkSpeed') {
      baseStats.atkSpeed = Math.max(3, Math.round(6 * rarityObj.mult));
    } else if (slotObj.baseStat === 'critChance') {
      baseStats.critChance = Math.max(2, Math.round(4 * rarityObj.mult));
    }

    const shuffledPool = [...ITEM_AFFIX_POOL].sort(() => Math.random() - 0.5);
    const affixes = shuffledPool.slice(0, rarityObj.affixCount).map((af) => {
      const val = Math.round((af.min + Math.random() * (af.max - af.min)) * (0.85 + rarityObj.mult * 0.18));
      return {
        id: af.id,
        label: af.label,
        value: val,
        unit: af.unit,
      };
    });

    const powerScore = Math.round(
      (baseStats.atk || 0) * 4 +
        (baseStats.hp || 0) * 0.5 +
        (baseStats.def || 0) * 3 +
        (baseStats.atkSpeed || 0) * 12 +
        (baseStats.critChance || 0) * 15 +
        affixes.reduce((sum, a) => sum + a.value * 6, 0)
    );

    return {
      uid: `item_${Date.now()}_${Math.floor(Math.random() * 99999)}`,
      name: baseName,
      setId: setDef ? setDef.id : null,
      setName: setDef ? setDef.name : null,
      slot: slotObj.id,
      slotName: slotObj.name,
      icon: slotObj.icon,
      level: itemLevel,
      rarity: rarityObj.id,
      rarityName: rarityObj.name,
      rarityColor: rarityObj.color,
      baseStats,
      affixes,
      upgradeLevel: 0,
      powerScore,
    };
  }

  equipItem(itemUid) {
    const idx = this.state.inventory.findIndex((i) => i.uid === itemUid);
    if (idx === -1) return;
    const item = this.state.inventory[idx];
    const currentEquipped = this.state.equipped[item.slot];

    this.state.equipped[item.slot] = item;
    this.state.inventory.splice(idx, 1);
    if (currentEquipped) {
      this.state.inventory.push(currentEquipped);
    }
    this.rebuildPlayerArmy();
    this.saveGame();
  }

  getEnhanceCost(item) {
    if (!item) return { gold: 0, iron: 0, isMax: true };
    const lv = item.upgradeLevel || 0;
    const isMax = lv >= 15;
    return {
      gold: Math.round(45 * Math.pow(1.38, lv)),
      iron: Math.round(5 * Math.pow(1.32, lv)),
      isMax,
      nextLv: lv + 1,
    };
  }

  upgradeEquippedItem(slotId) {
    const item = this.state.equipped[slotId];
    if (!item) return false;
    const cost = this.getEnhanceCost(item);
    if (cost.isMax) return false;
    if (this.state.gold < cost.gold || this.state.iron < cost.iron) return false;

    this.state.gold -= cost.gold;
    this.state.iron -= cost.iron;
    item.upgradeLevel = (item.upgradeLevel || 0) + 1;

    // Milestone Bonus at +5, +10, +15: Awaken a new Affix or boost all affixes!
    if ([5, 10, 15].includes(item.upgradeLevel)) {
      const existingIds = new Set((item.affixes || []).map((a) => a.id));
      const available = ITEM_AFFIX_POOL.filter((a) => !existingIds.has(a.id));
      if (available.length > 0 && (item.affixes || []).length < 6) {
        const pick = available[Math.floor(Math.random() * available.length)];
        const val = Math.round(pick.min + (pick.max - pick.min) * 0.75);
        item.affixes.push({
          id: pick.id,
          label: `★ ${pick.label}`,
          value: val,
          unit: pick.unit,
        });
      } else {
        (item.affixes || []).forEach((a) => {
          a.value = Math.round(a.value * 1.18);
        });
      }
      soundEngine.playUltimateExplosion();
      this.triggerBanner(
        `KHAI QUANG THẦN BINH: ${item.name.toUpperCase()} ĐẠT CẤP +${item.upgradeLevel}!`,
        '#fde047'
      );
    } else {
      soundEngine.playLootChime(false);
    }

    item.powerScore = Math.round(item.powerScore * 1.16);
    this.rebuildPlayerArmy();
    this.saveGame();
    return true;
  }

  getReforgeCost(item) {
    if (!item) return { gold: 0, iron: 0 };
    const lv = Math.max(1, item.level || 1);
    return {
      gold: 40 + lv * 18,
      iron: 8 + Math.floor(lv * 0.8),
    };
  }

  toggleLockEquippedAffix(slotId, affixIdx) {
    const item = this.state.equipped[slotId];
    if (!item || !Array.isArray(item.affixes) || !item.affixes[affixIdx]) return false;
    item.affixes[affixIdx].locked = !item.affixes[affixIdx].locked;
    this.saveGame();
    return true;
  }

  reforgeEquippedItem(slotId) {
    const item = this.state.equipped[slotId];
    if (!item) return false;
    const cost = this.getReforgeCost(item);
    if (this.state.gold < cost.gold || this.state.iron < cost.iron) return false;

    this.state.gold -= cost.gold;
    this.state.iron -= cost.iron;
    item.reforgeCount = (item.reforgeCount || 0) + 1;

    const rarityObj = ITEM_RARITIES.find((r) => r.id === item.rarity) || ITEM_RARITIES[0];
    const targetCount = Math.max((item.affixes || []).length, rarityObj.affixCount);
    const lockedAffixes = (item.affixes || []).filter((a) => a.locked);
    const lockedIds = new Set(lockedAffixes.map((a) => a.id));
    const shuffledPool = [...ITEM_AFFIX_POOL]
      .filter((a) => !lockedIds.has(a.id))
      .sort(() => Math.random() - 0.5);
    const qualityBoost = 1.0 + Math.min(0.45, item.reforgeCount * 0.06);

    const neededNew = Math.max(0, Math.min(6, targetCount) - lockedAffixes.length);
    const rerolledAffixes = shuffledPool.slice(0, neededNew).map((af) => {
      const val = Math.round(
        (af.min + (0.35 + Math.random() * 0.65) * (af.max - af.min)) *
          (0.9 + rarityObj.mult * 0.2) *
          qualityBoost
      );
      return {
        id: af.id,
        label: af.label,
        value: val,
        unit: af.unit,
        locked: false,
      };
    });

    item.affixes = [...lockedAffixes, ...rerolledAffixes];

    item.powerScore = Math.round(
      ((item.baseStats.atk || 0) * 4 +
        (item.baseStats.hp || 0) * 0.5 +
        (item.baseStats.def || 0) * 3 +
        (item.baseStats.atkSpeed || 0) * 12 +
        (item.baseStats.critChance || 0) * 15 +
        item.affixes.reduce((sum, a) => sum + a.value * 6, 0)) *
        Math.pow(1.15, item.upgradeLevel || 0)
    );

    soundEngine.playLootChime(true);
    this.triggerBanner(`TẨY LUYỆN THÀNH CÔNG: ${item.name.toUpperCase()} (LẦN ${item.reforgeCount})!`, '#38bdf8');
    this.rebuildPlayerArmy();
    this.saveGame();
    return true;
  }

  forgeSetEquipment(slotId, setId = null) {
    const stageLv = Math.max(this.state.level || 1, this.getCurrentStage().enemyLevel);
    const goldCost = 220 + stageLv * 25;
    const ironCost = 28;
    if (this.state.gold < goldCost || this.state.iron < ironCost) return false;

    this.state.gold -= goldCost;
    this.state.iron -= ironCost;
    const chosenSlot = slotId || EQUIP_SLOTS[Math.floor(Math.random() * EQUIP_SLOTS.length)].id;
    const newItem = this.generateItem(stageLv, chosenSlot, 'set', true, setId);
    this.state.inventory.unshift(newItem);

    soundEngine.playLootChime(true);
    this.triggerBanner(`LÒ RÈN ÂU DÃ TỬ ĐÚC THÀNH: ${newItem.name.toUpperCase()}!`, '#10b981');
    this.saveGame();
    return true;
  }

  // --------------------------------------------------------------------------
  // PHASE 10: BOSS SKULL SHOP & DIABLO KADALA GAMBLE (ĐỔ THẦN BINH ĐẦU LÂU)
  // --------------------------------------------------------------------------
  gambleSkullItem(slotId, tierType = 'mystery', setId = null) {
    const costs = {
      mystery: 3,
      set_chest: 8,
      mythic_chest: 15,
    };
    const skullCost = costs[tierType] || 3;
    if ((this.state.bossSkulls || 0) < skullCost) return false;

    this.state.bossSkulls -= skullCost;
    const stageLv = Math.max(this.state.level || 1, this.getCurrentStage().enemyLevel) + 1;
    const chosenSlot = slotId || EQUIP_SLOTS[Math.floor(Math.random() * EQUIP_SLOTS.length)].id;

    let forcedRarity = 'legendary';
    if (tierType === 'set_chest') {
      forcedRarity = 'set';
    } else if (tierType === 'mythic_chest') {
      forcedRarity = 'mythic';
    } else {
      const r = Math.random();
      forcedRarity = r < 0.22 ? 'mythic' : r < 0.55 ? 'set' : 'legendary';
    }

    const newItem = this.generateItem(stageLv, chosenSlot, forcedRarity, true, setId);
    if (tierType === 'mythic_chest') {
      newItem.upgradeLevel = 3;
      newItem.powerScore = Math.round(newItem.powerScore * 1.48);
    }
    this.state.inventory.unshift(newItem);

    soundEngine.playUltimateExplosion();
    this.triggerBanner(`💀 ĐỔ THẦN BINH ĐẦU LÂU: ${newItem.name.toUpperCase()}!`, newItem.rarityColor);
    this.saveGame();
    return true;
  }

  salvageItem(itemUid) {
    const idx = this.state.inventory.findIndex((i) => i.uid === itemUid);
    if (idx === -1) return;
    const item = this.state.inventory[idx];
    const rObj = ITEM_RARITIES.find((r) => r.id === item.rarity) || ITEM_RARITIES[0];
    this.state.iron += rObj.salvageIron;
    this.state.gold += rObj.salvageIron * 3;
    this.state.inventory.splice(idx, 1);
    this.saveGame();
  }

  salvageAllInventory() {
    if (this.state.inventory.length === 0) return 0;
    let totalIron = 0;
    this.state.inventory.forEach((item) => {
      const rObj = ITEM_RARITIES.find((r) => r.id === item.rarity) || ITEM_RARITIES[0];
      totalIron += rObj.salvageIron;
    });
    this.state.iron += totalIron;
    this.state.inventory = [];
    this.saveGame();
    return totalIron;
  }

  // --------------------------------------------------------------------------
  // HERO SELECTION, SQUAD FORMATION & TAVERN RECRUITMENT
  // --------------------------------------------------------------------------
  setMainHero(heroId) {
    if (!this.state.unlockedHeroes[heroId]) return false;
    const oldMain = this.state.mainHeroId;
    const sqIdx = this.state.squadHeroIds.indexOf(heroId);
    if (sqIdx !== -1) {
      this.state.squadHeroIds[sqIdx] = oldMain;
    }
    this.state.mainHeroId = heroId;
    this.rebuildPlayerArmy();
    this.saveGame();
    return true;
  }

  toggleSquadHero(heroId) {
    if (heroId === this.state.mainHeroId) return false;
    if (!this.state.unlockedHeroes[heroId]) return false;

    const idx = this.state.squadHeroIds.indexOf(heroId);
    if (idx !== -1) {
      this.state.squadHeroIds.splice(idx, 1);
    } else {
      const maxSlots = this.getMaxSquadSlots();
      if (this.state.squadHeroIds.length >= maxSlots) {
        this.state.squadHeroIds.shift();
      }
      this.state.squadHeroIds.push(heroId);
    }
    this.rebuildPlayerArmy();
    this.saveGame();
    return true;
  }

  recruitOrAwakenHero(heroId) {
    const heroDef = HEROES.find((h) => h.id === heroId);
    if (!heroDef) return false;
    const discount = Math.max(0.5, 1 - (this.state.buildings.tavern - 1) * 0.05);
    const goldCost = Math.round((heroDef.recruitCost || 400) * discount);

    if (this.state.gold < goldCost) return false;
    this.state.gold -= goldCost;
    soundEngine.playLootChime(true);

    if (!this.state.unlockedHeroes[heroId]) {
      this.state.unlockedHeroes[heroId] = { stars: 1, level: 1 };
      this.triggerBanner(`CHIÊU MỘ THÀNH CÔNG: ${heroDef.name.toUpperCase()}!`, '#facc15');
      if (this.state.squadHeroIds.length < this.getMaxSquadSlots()) {
        this.state.squadHeroIds.push(heroId);
      }
      if (!this.state.equippedSkillHeroIds.includes(heroId)) {
        const emptySlot = this.state.equippedSkillHeroIds.findIndex((id) => !id || !this.state.unlockedHeroes[id]);
        if (emptySlot !== -1) this.state.equippedSkillHeroIds[emptySlot] = heroId;
      }
    } else {
      this.state.unlockedHeroes[heroId].stars = Math.min(5, this.state.unlockedHeroes[heroId].stars + 1);
      this.triggerBanner(
        `THĂNG SAO DANH TƯỚNG: ${heroDef.name.toUpperCase()} (${this.state.unlockedHeroes[heroId].stars}★)!`,
        '#fde047'
      );
    }
    this.rebuildPlayerArmy();
    this.saveGame();
    return true;
  }

  // --------------------------------------------------------------------------
  // TOWN BUILDING UPGRADES & TRADING POST
  // --------------------------------------------------------------------------
  getBuildingUpgradeCost(buildingId) {
    const bDef = TOWN_BUILDINGS.find((b) => b.id === buildingId);
    const curLv = this.state.buildings[buildingId] || 1;
    return {
      gold: Math.round(bDef.baseGoldCost * Math.pow(1.48, curLv - 1)),
      iron: Math.round(bDef.baseIronCost * Math.pow(1.42, curLv - 1)),
      isMax: curLv >= bDef.maxLevel,
    };
  }

  upgradeBuilding(buildingId) {
    const cost = this.getBuildingUpgradeCost(buildingId);
    if (cost.isMax) return false;
    if (this.state.gold < cost.gold || this.state.iron < cost.iron) return false;

    this.state.gold -= cost.gold;
    this.state.iron -= cost.iron;
    this.state.buildings[buildingId] = (this.state.buildings[buildingId] || 1) + 1;
    soundEngine.playLootChime(false);
    this.rebuildPlayerArmy();
    this.saveGame();
    return true;
  }

  refreshMerchantOffers() {
    const stageLv = this.getCurrentStage().enemyLevel;
    this.merchantOffers = [
      {
        id: 'offer_set_chest',
        title: 'Rương Thần Trang Bộ Danh Tướng (Xanh Lá)',
        desc: 'Chắc chắn nhận 1 món Thần Trang Bộ (Set Item) của Lữ Bố, Quan Vũ, Gia Cát Lượng, Tào Tháo, Chu Du hoặc Triệu Vân',
        costGold: 320 + stageLv * 35,
        costIron: 25,
        type: 'set_item',
        bought: false,
      },
      {
        id: 'offer_legend_weapon',
        title: 'Rương Thần Binh Truyền Thuyết',
        desc: 'Chắc chắn nhận 1 Thần Binh bậc Truyền Thuyết (Cam) hoặc Thần Thoại (Đỏ)',
        costGold: 280 + stageLv * 35,
        costIron: 20,
        type: 'legendary_weapon',
        bought: false,
      },
      {
        id: 'offer_iron_pack',
        title: 'Lô Huyền Thiết Bắc Địa (x50)',
        desc: 'Mua gấp 50 Huyền Thiết để nâng cấp Doanh Trại & Lò Rèn',
        costGold: 180,
        costIron: 0,
        type: 'iron_bundle',
        bought: false,
      },
      {
        id: 'offer_troop_pack',
        title: 'Chiêu Mộ Đội Hổ Báo Kỵ & Cẩm Phàm (x3)',
        desc: 'Bổ sung ngay 3 toán quân tinh nhuệ kéo Xe Lương Thảo',
        costGold: 240,
        costIron: 10,
        type: 'troop_bundle',
        bought: false,
      },
    ];
  }

  buyMerchantOffer(offerId) {
    const offer = this.merchantOffers.find((o) => o.id === offerId);
    if (!offer || offer.bought) return false;
    if (this.state.gold < offer.costGold || this.state.iron < offer.costIron) return false;

    this.state.gold -= offer.costGold;
    this.state.iron -= offer.costIron;
    offer.bought = true;
    soundEngine.playLootChime(true);

    const stageLv = this.getCurrentStage().enemyLevel;
    if (offer.type === 'set_item') {
      const item = this.generateItem(stageLv + 1, null, 'set');
      this.state.inventory.unshift(item);
      this.triggerBanner(`NHẬN THẦN TRANG BỘ: ${item.name.toUpperCase()}!`, item.rarityColor);
    } else if (offer.type === 'legendary_weapon') {
      const rarity = Math.random() < 0.25 ? 'mythic' : 'legendary';
      const item = this.generateItem(stageLv + 1, 'weapon', rarity);
      this.state.inventory.unshift(item);
      this.triggerBanner(`NHẬN THẦN BINH: ${item.name.toUpperCase()}!`, item.rarityColor);
    } else if (offer.type === 'iron_bundle') {
      this.state.iron += 50;
    } else if (offer.type === 'troop_bundle') {
      this.state.capturedTroops.tiger_leopard_rider = (this.state.capturedTroops.tiger_leopard_rider || 0) + 2;
      this.state.capturedTroops.brocade_sail_raider = (this.state.capturedTroops.brocade_sail_raider || 0) + 1;
    }
    this.saveGame();
    return true;
  }

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------
  triggerBanner(text, color = '#fde047') {
    this.activeBanner = { text, color, timer: 3.2 };
  }

  addFloatingText(x, y, text, color = '#ffffff', size = 13) {
    if (this.floatingTexts.length > 36) this.floatingTexts.shift();
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      size,
      timer: 0.95,
    });
  }
}
