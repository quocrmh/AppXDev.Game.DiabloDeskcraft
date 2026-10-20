import {
  FACTIONS,
  HEROES,
  SKILL_RUNES,
  PROVINCES_13,
  ITEM_SETS,
  GAUNTLET_PASSES,
  MINION_TROOPS,
  CAMPAIGN_STAGES,
  EQUIP_SLOTS,
  TOWN_BUILDINGS,
  COMBAT_TALENTS,
  HERO_BONDS,
} from './data/threeKingdomsData.js';
import { ThreeKingdomsDeskrawlEngine } from './engine/gameEngine.js';
import { PixelOverlayRenderer } from './renderer/pixelOverlayRenderer.js';
import { soundEngine } from './engine/soundEngine.js';

const SLOT_ICONS = {
  weapon: '⚔️',
  armor: '🛡️',
  mount: '🐎',
  seal: '💮',
  tome: '📜',
  cape: '🧣',
};

const engine = new ThreeKingdomsDeskrawlEngine();
const canvas = document.getElementById('pixel-overlay-canvas');
const pixelRenderer = new PixelOverlayRenderer(canvas, engine);

// UI State
let activeTab = null;
let selectedFactionFilter = 'ALL';
let selectedHeroInspectId = 'zhao_yun';
let activeSkillSlotToAssign = 0;
let selectedBagItemUid = null;
let selectedEquipSlotToCompare = 'weapon';
let selectedForgeSetId = '';

function findHero(heroId) {
  return HEROES.find((h) => h.id === heroId) || HEROES[0];
}

function findRune(runeId) {
  return SKILL_RUNES.find((r) => r.id === runeId) || SKILL_RUNES[0];
}

function renderStars(count = 1) {
  return '★'.repeat(Math.max(1, Math.min(5, count)));
}

function syncWindowMode() {
  if (!window.desktopAPI) return;
  if (activeTab !== null) {
    window.desktopAPI.setWindowMode('expanded');
  } else {
    window.desktopAPI.setWindowMode('battle');
  }
  setTimeout(() => pixelRenderer.resize(), 60);
}

// ============================================================================
// DESKRAWL OVERLAY HUD UPDATER (60FPS)
// ============================================================================
let lastSkillSig = '';

function formatTimer(sec) {
  const s = Math.max(0, Math.ceil(sec || 0));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function updateDeskrawlHud() {
  const unlockedCount = Object.keys(engine.state.unlockedHeroes).length;
  const ragePct = Math.max(0, Math.min(100, Math.floor(engine.comboRage || 0)));

  // 1. Mode Toggle Button (🏕️ Doanh Trại / ⚔ Chiến Trường)
  const modeBtn = document.getElementById('btn-toggle-town');
  if (modeBtn) {
    modeBtn.textContent = engine.inTownMode ? '⚔ Ra Chiến Trường' : '🏕️ Về Doanh Trại';
    modeBtn.classList.toggle('in-town', Boolean(engine.inTownMode));
  }

  // 2. Direct 1-Click Military Training Button
  const trainBtn = document.getElementById('btn-hud-train');
  if (trainBtn) {
    const tCost = engine.getTrainingCost();
    const tLv = engine.state.trainingLevel || 1;
    const canAfford = engine.state.gold >= tCost;
    trainBtn.textContent = `⬆ Rèn Quân Cấp ${tLv} (${tCost} Vàng)`;
    trainBtn.classList.toggle('can-afford', canAfford);
  }

  // 3. Split Red/Blue Diablo Globe (HP + Rage + Level)
  const lvEl = document.getElementById('hud-commander-lv');
  if (lvEl) lvEl.textContent = `Lv. ${engine.state.level}`;

  if (engine.mainUnit) {
    const hpRatio = Math.max(
      0,
      Math.min(100, Math.round((engine.mainUnit.hp / Math.max(1, engine.mainUnit.maxHp)) * 100))
    );
    const hpFill = document.getElementById('hud-hp-fill');
    const hpText = document.getElementById('hud-hp-text');
    if (hpFill) hpFill.style.height = `${hpRatio}%`;
    if (hpText) hpText.textContent = `${Math.ceil(engine.mainUnit.hp)}/${engine.mainUnit.maxHp}`;
  }

  const rageFill = document.getElementById('hud-rage-fill');
  const rageText = document.getElementById('hud-rage-text');
  const ultBtn = document.getElementById('btn-cast-ultimate');
  if (rageFill) rageFill.style.height = `${ragePct}%`;
  if (rageText) rageText.textContent = ragePct >= 100 ? 'TUYỆT KỸ!' : `Nộ ${ragePct}%`;
  if (ultBtn) ultBtn.classList.toggle('ready', ragePct >= 100);

  // 4. Potion Slot + EXP Bar
  const potCountEl = document.getElementById('hud-potion-count');
  if (potCountEl) {
    potCountEl.textContent = `${engine.potions}/${engine.maxPotions}`;
  }

  const expFill = document.getElementById('hud-exp-fill');
  if (expFill) {
    const expPct = Math.max(
      0,
      Math.min(100, Math.round(((engine.state.exp || 0) / Math.max(1, engine.state.expToNext || 100)) * 100))
    );
    expFill.style.width = `${expPct}%`;
  }

  // 5. 4 Square Skill Slots
  const mainPUrl = pixelRenderer.getHeroPortraitDataUrl(engine.state.mainHeroId);
  const sig = `${engine.state.level}|${Boolean(mainPUrl)}|${(engine.state.equippedSkillHeroIds || []).join(',')}|${(engine.state.equippedSkillRunes || []).join(',')}`;
  const slotsContainer = document.getElementById('hud-skill-slots');
  if (slotsContainer && sig !== lastSkillSig) {
    lastSkillSig = sig;
    slotsContainer.innerHTML = [0, 1, 2, 3]
      .map((idx) => {
        const hId = engine.state.equippedSkillHeroIds?.[idx];
        const isUnlocked = engine.isSkillSlotUnlocked(idx);
        const reqLv = engine.getSkillSlotUnlockLevel(idx);
        if (!isUnlocked) {
          return `
            <div class="hud-skill-slot locked" title="Mở khóa ở Cấp ${reqLv}">
              <span class="skill-key-badge">${idx + 1}</span>
              <span style="font-size:8.5px;font-weight:800;color:#9a8466">Lv.${reqLv}</span>
            </div>
          `;
        }
        const effectiveHId =
          hId && engine.state.unlockedHeroes[hId]
            ? hId
            : idx === 0
              ? engine.state.mainHeroId
              : null;
        if (!effectiveHId) {
          return `
            <div class="hud-skill-slot" data-assign-empty-slot="${idx}" title="Ô Võ Kỹ ${idx + 1} — Click để gán Tướng">
              <span class="skill-key-badge">${idx + 1}</span>
              <span style="font-size:9px;font-weight:800;color:#fde047">+Gán</span>
            </div>
          `;
        }
        const h = findHero(effectiveHId);
        const rune = findRune(engine.state.equippedSkillRunes?.[idx]);
        const sk = h.skill || { name: 'Võ Kỹ' };
        const pUrl = pixelRenderer.getHeroPortraitDataUrl(effectiveHId);
        return `
          <div class="hud-skill-slot" data-cast-slot="${idx}" title="[Phím ${idx + 1}] ${sk.name} (${h.name})">
            ${pUrl ? `<img src="${pUrl}" alt="${h.name}" />` : ''}
            <span class="skill-key-badge">${idx + 1}</span>
            <span class="skill-rune-dot" style="color:${rune.color}">${rune.sealChar}</span>
            <div class="skill-cd-overlay" id="hud-slot-cd-${idx}" style="height:0%"></div>
          </div>
        `;
      })
      .join('');

    slotsContainer.querySelectorAll('[data-cast-slot]').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = Number(el.getAttribute('data-cast-slot'));
        engine.castEquippedSkillSlot(idx);
      });
    });

    slotsContainer.querySelectorAll('[data-assign-empty-slot]').forEach((el) => {
      el.addEventListener('click', () => {
        activeSkillSlotToAssign = Number(el.getAttribute('data-assign-empty-slot'));
        openModalTab('town');
      });
    });
  }

  for (let i = 0; i < 4; i++) {
    const cdEl = document.getElementById(`hud-slot-cd-${i}`);
    if (cdEl) {
      const rawId = engine.state.equippedSkillHeroIds?.[i] || (i === 0 ? engine.state.mainHeroId : null);
      const h = rawId ? findHero(rawId) : HEROES[0];
      const maxCd = (h.skill?.cooldown || 6) * 1.35;
      const curCd = engine.skillSlotCooldowns[i] || 0;
      const pct = Math.min(100, Math.round((curCd / maxCd) * 100));
      cdEl.style.height = `${pct}%`;
      cdEl.textContent = curCd > 0.2 ? `${curCd.toFixed(1)}s` : '';
    }
  }

  // 6. BOTTOM-CENTER: DIABLO / DESKRAWL BOSS HP BAR (Screenshot #1)
  const bossHud = document.getElementById('deskrawl-boss-hud');
  if (bossHud) {
    const activeBoss = engine.enemies.find((e) => (e.isBoss || e.isSubBoss) && e.hp > 0);
    if (engine.inTownMode || !activeBoss) {
      bossHud.classList.add('hidden');
    } else {
      bossHud.classList.remove('hidden');
      const nameEl = document.getElementById('boss-hud-name');
      const fillEl = document.getElementById('boss-hud-fill');
      const hpTextEl = document.getElementById('boss-hud-hp-text');
      const isChief = Boolean(activeBoss.isBoss);
      const bossPct = Math.max(0, Math.min(100, Math.round((activeBoss.hp / Math.max(1, activeBoss.maxHp)) * 100)));

      if (nameEl) {
        nameEl.textContent = `${isChief ? '👑' : '💀'} ${activeBoss.name} (Lv.${activeBoss.level || engine.getCurrentStage().enemyLevel})`;
        nameEl.classList.toggle('chief', isChief);
      }
      if (fillEl) {
        fillEl.style.width = `${bossPct}%`;
        fillEl.classList.toggle('chief', isChief);
      }
      if (hpTextEl) {
        hpTextEl.textContent = `${Math.ceil(activeBoss.hp).toLocaleString()} / ${Math.ceil(activeBoss.maxHp).toLocaleString()}`;
      }
    }
  }

  // 7. BOTTOM-RIGHT: T1–T10 3-SKULL + 1-CROWN PROGRESS BAR (Screenshot #3)
  const curStage = engine.getCurrentStage();
  const curWave = Math.max(1, Math.min(4, engine.state.currentWave || 1));

  const stTitleEl = document.getElementById('hud-stage-title');
  if (stTitleEl) {
    if (engine.inTownMode) {
      stTitleEl.textContent = '🏕️ Doanh Trại Tiền Tuyến (Click NPC để mở)';
    } else if (engine.activeGauntletPass) {
      stTitleEl.textContent = `⚔ ${engine.activeGauntletPass.name} (${engine.gauntletBossIndex + 1}/6)`;
    } else {
      stTitleEl.textContent = `${curStage.name} • Đợt ${curWave}/4`;
    }
  }

  const timerEl = document.getElementById('hud-boss-timer');
  if (timerEl) {
    timerEl.textContent = engine.bossTimer > 0 ? formatTimer(engine.bossTimer) : '00:25';
  }

  const tierBadgeEl = document.getElementById('hud-tier-badge');
  if (tierBadgeEl) {
    tierBadgeEl.textContent = `T${curStage.id}`;
  }

  const skullFillEl = document.getElementById('hud-skull-fill');
  if (skullFillEl) {
    const fillPct = ((curWave - 1) / 3) * 100;
    skullFillEl.style.width = `${Math.max(8, Math.min(100, fillPct))}%`;
  }

  document.querySelectorAll('.skull-node-btn[data-wave]').forEach((btn) => {
    const w = Number(btn.getAttribute('data-wave'));
    btn.classList.toggle('done', w < curWave);
    btn.classList.toggle('active', w === curWave);
  });

  // 8. Currencies & Badges
  const goldEl = document.getElementById('hud-gold-val');
  if (goldEl) goldEl.textContent = Math.floor(engine.state.gold).toLocaleString();

  const skullValEl = document.getElementById('hud-skull-val');
  if (skullValEl) skullValEl.textContent = Math.floor(engine.state.bossSkulls || 0).toLocaleString();

  const ironEl = document.getElementById('hud-iron-val');
  if (ironEl) ironEl.textContent = Math.floor(engine.state.iron).toLocaleString();

  const rosterEl = document.getElementById('hud-roster-val');
  if (rosterEl) rosterEl.textContent = `${unlockedCount}`;

  const bagCountEl = document.getElementById('hud-bag-count');
  if (bagCountEl) bagCountEl.textContent = `${engine.state.inventory.length}`;

  const speedBtn = document.getElementById('btn-cycle-speed');
  if (speedBtn) {
    speedBtn.textContent = `${(engine.state.gameSpeed || 1.0).toFixed(1)}x`;
  }
}

window.addEventListener('sprites-updated', () => {
  lastSkillSig = '';
  updateDeskrawlHud();
  if (activeTab) renderModalContent();
});

// ============================================================================
// DESKRAWL FLOATING WINDOWS (SCREENSHOTS #4, #5, #6, #7)
// ============================================================================
function openModalTab(tabName) {
  if (activeTab === tabName) {
    closeModal();
    return;
  }
  activeTab = tabName;
  document.getElementById('command-modal-backdrop')?.classList.remove('hidden');

  document.querySelectorAll('[data-tab]').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
  });
  document.querySelectorAll('[data-open-tab]').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-open-tab') === tabName);
  });

  renderModalContent();
  syncWindowMode();
}

function closeModal() {
  activeTab = null;
  document.getElementById('command-modal-backdrop')?.classList.add('hidden');
  document.querySelectorAll('[data-open-tab]').forEach((b) => b.classList.remove('active'));
  syncWindowMode();
}

function renderModalContent() {
  const body = document.getElementById('command-modal-body');
  if (!body || !activeTab) return;

  // --------------------------------------------------------------------------
  // TAB 1: DANH TƯỚNG & THU PHỤC — 3-COLUMN DESKRAWL BOOK (Screenshot #4 + Phases 11 & 12)
  // --------------------------------------------------------------------------
  if (activeTab === 'generals') {
    const lineupIds = engine.getActiveLineupHeroIds();
    const { allHeroBonds } = engine.computeActiveHeroBonds();
    const filteredHeroes =
      selectedFactionFilter === 'ALL'
        ? HEROES
        : HEROES.filter((h) => h.faction === selectedFactionFilter);

    if (!filteredHeroes.some((h) => h.id === selectedHeroInspectId)) {
      selectedHeroInspectId = filteredHeroes[0]?.id || 'zhao_yun';
    }
    const selHero = findHero(selectedHeroInspectId);
    const selUnlock = engine.state.unlockedHeroes[selHero.id];
    const selStars = selUnlock ? selUnlock.stars : 0;
    const selShards = engine.state.heroShards?.[selHero.id] || 0;
    const selFac = FACTIONS[selHero.faction];
    const selPortrait = pixelRenderer.getHeroPortraitDataUrl(selHero.id);
    const selInLineup = lineupIds.includes(selHero.id);
    const selIsMain = engine.state.mainHeroId === selHero.id;

    body.innerHTML = `
      <div class="deskrawl-minions-book">
        <!-- LEFT COLUMN: Faction Filter + Scrollable General List -->
        <div class="book-left-list-col">
          <div class="faction-filter-bar">
            <button class="filter-pill ${selectedFactionFilter === 'ALL' ? 'active' : ''}" data-fac="ALL">Tất Cả</button>
            <button class="filter-pill ${selectedFactionFilter === 'SHU' ? 'active' : ''}" data-fac="SHU">Thục</button>
            <button class="filter-pill ${selectedFactionFilter === 'WEI' ? 'active' : ''}" data-fac="WEI">Ngụy</button>
            <button class="filter-pill ${selectedFactionFilter === 'WU' ? 'active' : ''}" data-fac="WU">Ngô</button>
            <button class="filter-pill ${selectedFactionFilter === 'QUN' ? 'active' : ''}" data-fac="QUN">Quần</button>
          </div>
          <div class="book-roster-scroll">
            ${filteredHeroes
              .map((h) => {
                const uInfo = engine.state.unlockedHeroes[h.id];
                const shards = engine.state.heroShards?.[h.id] || 0;
                const fac = FACTIONS[h.faction];
                const isSelected = h.id === selHero.id;
                const inSquad = lineupIds.includes(h.id);
                return `
                  <div class="book-roster-row ${isSelected ? 'selected' : ''} ${!uInfo ? 'locked' : ''}" data-inspect-hero="${h.id}">
                    <span>
                      <b style="color:${fac.color}">[${fac.shortName}]</b> ${h.name}
                      ${inSquad ? '⚔️' : ''}
                    </span>
                    <span style="font-size:10px;color:#fde047">
                      ${uInfo ? renderStars(uInfo.stars) : shards > 0 ? `🏮${shards}/3` : '🔒'}
                    </span>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>

        <!-- CENTER COLUMN: DARK SHOWCASE PEDESTAL (Screenshot #4) -->
        <div class="book-center-stage">
          <div class="stage-lineup-strip">
            ${lineupIds
              .map((id, idx) => {
                const lh = findHero(id);
                return `<span class="lineup-mini-slot">${idx === 0 ? '帥' : ` Phó ${idx}`}: ${lh.name}</span>`;
              })
              .join('')}
          </div>

          <div class="stage-hero-pedestal">
            ${selPortrait ? `<img src="${selPortrait}" class="stage-hero-img" alt="${selHero.name}" />` : ''}
            <div class="stage-stars">${selUnlock ? renderStars(selStars) : 'CHƯA CHIÊU MỘ'}</div>
            <div style="font-size:10.5px;color:#e879f9;font-weight:800">
              🏮 Mảnh Hồn Boss Rơi: ${selShards}/3 (Đủ 3 mảnh tự động Chiêu Mộ / +1★)
            </div>
            <div style="font-size:11px;color:#fde047;font-weight:800">
              Lực Chiến Toàn Quân: ⚔ ${engine.getTotalArmyPower().toLocaleString()}
            </div>
          </div>

          <div style="width:100%;display:flex;justify-content:space-between;font-size:10px;color:#9a8466;border-top:1px solid #4a3519;padding-top:4px">
            <span>Phe: <b style="color:${selFac.color}">${selFac.name}</b></span>
            <span>Vai trò: <b style="color:#fde047">${selHero.role}</b></span>
          </div>
        </div>

        <!-- RIGHT COLUMN: PARCHMENT DOSSIER + HERO BONDS (Phase 12) + CAPTURED TROOPS -->
        <div class="book-right-parchment">
          <div class="parchment-title-row">
            <div>
              <div class="parchment-hero-name">${selHero.name}</div>
              <div class="parchment-hero-sub">"${selHero.title}"</div>
            </div>
            <span style="font-size:11px;color:#fde047;font-weight:800">
              Đội hình: ${lineupIds.length}/${1 + engine.getMaxSquadSlots()} Tướng
            </span>
          </div>

          <div class="parchment-stat-badges">
            <div class="p-stat-box"><span>CÔNG KÍCH</span><b>${selHero.baseStats.atk}</b></div>
            <div class="p-stat-box"><span>SINH LỰC</span><b>${selHero.baseStats.hp}</b></div>
            <div class="p-stat-box"><span>PHÒNG THỦ</span><b>${selHero.baseStats.def}</b></div>
            <div class="p-stat-box"><span>TỐC ĐÁNH</span><b>${selHero.baseStats.atkSpeed}</b></div>
          </div>

          <div class="parchment-skill-card">
            <div class="parchment-skill-header">
              <span>⚡ Tuyệt Kỹ: ${selHero.skill.name}</span>
              <span style="font-size:10px;color:#f59e0b">Hồi chiêu: ${selHero.skill.cooldown}s</span>
            </div>
            <div class="parchment-skill-desc">${selHero.skill.desc}</div>
          </div>

          <!-- PHASE 12: THREE KINGDOMS HERO BONDS / SYNERGIES -->
          <div style="background:rgba(15,10,7,0.72);border:1px solid #6e5023;padding:5px 8px">
            <div style="font-size:10px;font-weight:800;color:#fde047;margin-bottom:3px">
              🔗 Duyên Phận Danh Tướng Tam Quốc (Tự động kích hoạt khi đủ Tướng)
            </div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:3px;font-size:9px">
              ${allHeroBonds
                .map(
                  (b) => `
                  <div style="display:flex;justify-content:space-between;padding:2px 5px;background:${b.isFull ? 'rgba(21,128,61,0.35)' : 'rgba(0,0,0,0.35)'};border:1px solid ${b.isFull ? '#4ade80' : '#3d2c17'}">
                    <span style="color:${b.isFull ? '#4ade80' : '#cbd5e1'};font-weight:800" title="${b.desc}">${b.name} (${b.unlockedCount}/${b.totalRequired})</span>
                    <span style="color:${b.isFull ? '#fde047' : '#9a8466'}">${b.isFull ? '★ KÍCH HOẠT' : b.desc.split('&')[0]}</span>
                  </div>
                `
                )
                .join('')}
            </div>
          </div>

          <!-- Captured Troops Summary (Minions like Screenshot #4) -->
          <div style="background:rgba(15,10,7,0.62);border:1px solid #5c4322;padding:4px 8px">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;font-size:9px">
              ${MINION_TROOPS.map((t) => {
                const cnt = engine.state.capturedTroops[t.id] || 0;
                return `<div style="color:${t.color};font-weight:800">${t.name}: <span style="color:#4ade80">x${cnt}</span></div>`;
              }).join('')}
            </div>
          </div>

          <div class="parchment-actions-row">
            ${
              selUnlock
                ? `
                  ${
                    !selIsMain
                      ? `<button class="action-btn ${selInLineup ? 'jade' : ''}" data-toggle-squad="${selHero.id}" style="flex:1">
                          ${selInLineup ? '✓ Đang Xuất Trận (Bấm Để Nghỉ)' : '⚔ Cho Xuất Trận Cùng Đoàn'}
                        </button>
                        <button class="action-btn" data-make-leader="${selHero.id}">Đặt Làm Chủ Soái</button>`
                      : `<span class="action-btn jade" style="flex:1;display:flex;align-items:center;justify-content:center">★ Đang Là Chủ Soái Đại Quân</span>`
                  }
                  <button class="action-btn" data-recruit="${selHero.id}">
                    ⬆ Thăng Sao (${selHero.recruitCost || 380} Vàng)
                  </button>
                `
                : `
                  <button class="action-btn jade" data-recruit="${selHero.id}" style="width:100%">
                    🏮 Chiêu Mộ Danh Tướng ${selHero.name} (${selHero.recruitCost || 380} Vàng hoặc 3 Mảnh Hồn Boss)
                  </button>
                `
            }
          </div>
        </div>
      </div>
    `;

    body.querySelectorAll('[data-fac]').forEach((el) => {
      el.onclick = () => {
        selectedFactionFilter = el.getAttribute('data-fac');
        renderModalContent();
      };
    });

    body.querySelectorAll('[data-inspect-hero]').forEach((el) => {
      el.onclick = () => {
        selectedHeroInspectId = el.getAttribute('data-inspect-hero');
        renderModalContent();
      };
    });

    body.querySelectorAll('[data-toggle-squad]').forEach((el) => {
      el.onclick = () => {
        engine.toggleSquadHero(el.getAttribute('data-toggle-squad'));
        renderModalContent();
        updateDeskrawlHud();
      };
    });

    body.querySelectorAll('[data-make-leader]').forEach((el) => {
      el.onclick = () => {
        engine.setMainHero(el.getAttribute('data-make-leader'));
        renderModalContent();
        updateDeskrawlHud();
      };
    });

    body.querySelectorAll('[data-recruit]').forEach((el) => {
      el.onclick = () => {
        if (engine.recruitOrAwakenHero(el.getAttribute('data-recruit'))) {
          renderModalContent();
          updateDeskrawlHud();
        }
      };
    });

  // --------------------------------------------------------------------------
  // TAB 2: DIABLO PAPERDOLL + 8x4 BAG GRID + SIDE-BY-SIDE COMPARE (Screenshots #6 & #7)
  // --------------------------------------------------------------------------
  } else if (activeTab === 'gear') {
    const leader = findHero(engine.state.mainHeroId);
    const leaderPortrait = pixelRenderer.getHeroPortraitDataUrl(leader.id);
    const selectedItem =
      engine.state.inventory.find((i) => i.uid === selectedBagItemUid) ||
      engine.state.inventory[0] ||
      null;

    if (selectedItem) {
      selectedEquipSlotToCompare = selectedItem.slot;
    }

    const equippedInSlot = engine.state.equipped[selectedEquipSlotToCompare] || null;
    const enhCost = equippedInSlot ? engine.getEnhanceCost(equippedInSlot) : null;
    const refCost = equippedInSlot ? engine.getReforgeCost(equippedInSlot) : null;

    const stageLv = Math.max(engine.state.level || 1, engine.getCurrentStage().enemyLevel);
    const forgeGoldCost = 220 + stageLv * 25;
    const forgeIronCost = 28;

    const leftSlots = EQUIP_SLOTS.slice(0, 3);
    const rightSlots = EQUIP_SLOTS.slice(3, 6);

    const powerDiff =
      selectedItem && equippedInSlot
        ? (selectedItem.powerScore || 0) - (equippedInSlot.powerScore || 0)
        : selectedItem
          ? selectedItem.powerScore || 0
          : 0;

    body.innerHTML = `
      <div class="deskrawl-gear-layout">
        <!-- LEFT SIDE: SIDE-BY-SIDE DIABLO ITEM COMPARISON + BLACKSMITH -->
        <div class="diablo-compare-and-forge">
          <!-- CARD 1: CURRENTLY EQUIPPED IN SLOT + BLACKSMITH UPGRADE (Screenshot #7) -->
          <div class="diablo-tooltip-card">
            <span class="tooltip-header-tag">ĐANG TRANG BỊ (${EQUIP_SLOTS.find((s) => s.id === selectedEquipSlotToCompare)?.name || 'Vũ Khí'})</span>
            ${
              equippedInSlot
                ? `
                  <div>
                    <div class="tooltip-item-title" style="color:${equippedInSlot.rarityColor}">
                      ${SLOT_ICONS[equippedInSlot.slot] || '⚔️'} ${equippedInSlot.name} (+${equippedInSlot.upgradeLevel || 0})
                    </div>
                    <div style="text-align:center;font-size:10px;color:${equippedInSlot.rarityColor};font-weight:800">
                      Phẩm chất: ${equippedInSlot.rarityName} • Cấp ${equippedInSlot.level || 1}
                    </div>
                  </div>
                  <div class="tooltip-big-stat">
                    ⚔ Uy Lực: ${equippedInSlot.powerScore}
                  </div>
                  <div class="tooltip-affix-list">
                    ${equippedInSlot.affixes.map((a) => `<div>• +${a.value}${a.unit} ${a.label}</div>`).join('')}
                  </div>
                  <div style="display:flex;flex-direction:column;gap:4px;border-top:1px solid #3a2a18;padding-top:6px">
                    <div style="font-size:10px;color:#fde047;font-weight:800;text-align:center">
                      ⚒ Lò Rèn Cường Hóa (+${equippedInSlot.upgradeLevel || 0} ➔ +${enhCost.nextLv})
                    </div>
                    <div style="display:flex;gap:5px">
                      <button class="action-btn jade" id="btn-upgrade-equipped" ${enhCost.isMax ? 'disabled' : ''} style="flex:1">
                        ${enhCost.isMax ? 'Đã Tối Đa (+15)' : `🔨 Rèn +${enhCost.nextLv} (${enhCost.gold}🪙 + ${enhCost.iron}⛏️)`}
                      </button>
                      <button class="action-btn" id="btn-reforge-equipped" title="Tẩy luyện dòng thuộc tính">
                        🔄 Tẩy (${refCost.iron}⛏️)
                      </button>
                    </div>
                  </div>
                `
                : `
                  <div style="flex:1;display:flex;align-items:center;justify-content:center;color:#9a8466;font-size:11px;text-align:center">
                    Chưa mặc trang bị ở ô này.<br/>Chọn vật phẩm bên phải để mặc!
                  </div>
                  <div style="height:28px"></div>
                `
            }
          </div>

          <!-- CARD 2: SELECTED BAG ITEM COMPARISON + SET FORGE (Screenshot #6) -->
          <div class="diablo-tooltip-card selected-card">
            <span class="tooltip-header-tag">VẬT PHẨM ĐANG CHỌN TRONG TÚI</span>
            ${
              selectedItem
                ? `
                  <div>
                    <div class="tooltip-item-title" style="color:${selectedItem.rarityColor}">
                      ${SLOT_ICONS[selectedItem.slot] || '⚔️'} ${selectedItem.name} (+${selectedItem.upgradeLevel || 0})
                    </div>
                    <div style="text-align:center;font-size:10px;color:${selectedItem.rarityColor};font-weight:800">
                      Phẩm chất: ${selectedItem.rarityName} • Cấp ${selectedItem.level || 1}
                    </div>
                  </div>
                  <div class="tooltip-big-stat">
                    ⚔ Uy Lực: ${selectedItem.powerScore}
                    <span class="${powerDiff >= 0 ? 'stat-diff-pos' : 'stat-diff-neg'}" style="font-size:12px;margin-left:6px">
                      (${powerDiff >= 0 ? `+${powerDiff} ▲` : `${powerDiff} ▼`})
                    </span>
                  </div>
                  <div class="tooltip-affix-list">
                    ${selectedItem.affixes.map((a) => `<div>• +${a.value}${a.unit} ${a.label}</div>`).join('')}
                  </div>
                  <div style="display:flex;gap:6px;border-top:1px solid #3a2a18;padding-top:6px">
                    <button class="action-btn jade" id="btn-equip-sel" style="flex:1">⬆ Mặc Trang Bị Này</button>
                    <button class="action-btn" id="btn-salvage-sel">♻️ Phân Giải</button>
                  </div>
                `
                : `
                  <div style="flex:1;display:flex;align-items:center;justify-content:center;color:#9a8466;font-size:11px;text-align:center">
                    Hạ Boss trên chiến trường để nhặt Thần Binh phát sáng hoặc Đúc Đồ Bộ bên dưới!
                  </div>
                `
            }
            <div style="border-top:1px solid #3a2a18;padding-top:5px;display:flex;flex-direction:column;gap:4px">
              <div style="display:flex;gap:4px;align-items:center">
                <select id="select-forge-set-id" style="flex:1;height:23px;background:#140e09;border:1px solid #6e5023;color:#fde047;font-size:9.5px">
                  <option value="">Đúc Bộ Ngẫu Nhiên (${forgeGoldCost}🪙+${forgeIronCost}⛏️)</option>
                  ${ITEM_SETS.map((s) => `<option value="${s.id}" ${selectedForgeSetId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                </select>
                <button class="action-btn" id="btn-forge-current-slot" style="height:23px;font-size:9.5px;padding:0 8px" title="Đúc Thần Trang cho ô đang chọn">
                  ⚒ Đúc Ô Này
                </button>
              </div>
              <!-- PHASE 10: BOSS SKULL SHOP & DIABLO KADALA GAMBLE -->
              <div style="display:flex;gap:4px;align-items:center">
                <button class="action-btn" data-gamble-skull="mystery" style="flex:1;height:23px;font-size:9px;padding:0 4px" title="Đổ Thần Binh Bí Ẩn cho ô đang chọn">
                  🎲 Đổ Bí Ẩn (3💀)
                </button>
                <button class="action-btn jade" data-gamble-skull="set_chest" style="flex:1;height:23px;font-size:9px;padding:0 4px" title="Chắc chắn nhận 1 Thần Trang Bộ Xanh Lá">
                  🟩 Rương Bộ (8💀)
                </button>
                <button class="action-btn" data-gamble-skull="mythic_chest" style="flex:1;height:23px;font-size:9px;padding:0 4px;border-color:#f43f5e;color:#fda4af" title="Chắc chắn nhận Thần Binh Vô Song Đỏ (+3)">
                  🟥 Thần Thoại +3 (15💀)
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT SIDE: DIABLO CHARACTER PAPERDOLL + 8x4 SQUARE GRID INVENTORY (Screenshot #6) -->
        <div class="diablo-character-bag-col">
          <div class="diablo-paperdoll-box">
            <div class="paperdoll-slot-col">
              ${leftSlots
                .map((slot) => {
                  const eq = engine.state.equipped[slot.id];
                  const isAct = selectedEquipSlotToCompare === slot.id;
                  return `
                    <div class="paperdoll-slot ${isAct ? 'active' : ''}" data-paperdoll-slot="${slot.id}" style="border-color:${eq ? eq.rarityColor : '#5c4322'}">
                      <span>${SLOT_ICONS[slot.id]}</span>
                      <div style="min-width:0;flex:1">
                        <div style="font-size:8.5px;color:#9a8466">${slot.name}</div>
                        <div style="font-size:9.5px;font-weight:800;color:${eq ? eq.rarityColor : '#6b7280'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                          ${eq ? `+${eq.upgradeLevel || 0} ${eq.name}` : 'Trống'}
                        </div>
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>

            <div class="paperdoll-center-figure">
              ${leaderPortrait ? `<img src="${leaderPortrait}" alt="${leader.name}" />` : ''}
              <div style="font-size:10.5px;font-weight:900;color:#fde047;margin-top:2px">${leader.name}</div>
              <button class="action-btn jade" id="btn-auto-equip-all" style="height:22px;font-size:9.5px;padding:0 8px;margin-top:3px">
                ⚡ Mặc Nhanh
              </button>
            </div>

            <div class="paperdoll-slot-col">
              ${rightSlots
                .map((slot) => {
                  const eq = engine.state.equipped[slot.id];
                  const isAct = selectedEquipSlotToCompare === slot.id;
                  return `
                    <div class="paperdoll-slot ${isAct ? 'active' : ''}" data-paperdoll-slot="${slot.id}" style="border-color:${eq ? eq.rarityColor : '#5c4322'}">
                      <span>${SLOT_ICONS[slot.id]}</span>
                      <div style="min-width:0;flex:1">
                        <div style="font-size:8.5px;color:#9a8466">${slot.name}</div>
                        <div style="font-size:9.5px;font-weight:800;color:${eq ? eq.rarityColor : '#6b7280'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                          ${eq ? `+${eq.upgradeLevel || 0} ${eq.name}` : 'Trống'}
                        </div>
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>
          </div>

          <!-- 8x4 SQUARE LOOT BAG GRID -->
          <div class="diablo-bag-grid-box">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#e5b95c">
              <span>🎒 Hành Trang Chiến利 (${engine.state.inventory.length}/36 Ô) — Click đúp để mặc ngay</span>
              <button class="action-btn" id="btn-salvage-all" style="height:20px;font-size:9.5px;padding:0 8px">
                ♻️ Phân Giải Hết Túi
              </button>
            </div>
            <div class="diablo-square-grid">
              ${Array.from({ length: 24 })
                .map((_, idx) => {
                  const item = engine.state.inventory[idx];
                  if (!item) {
                    return `<div class="diablo-grid-cell" style="opacity:0.35"></div>`;
                  }
                  const isSel = selectedItem && selectedItem.uid === item.uid;
                  return `
                    <div
                      class="diablo-grid-cell ${isSel ? 'selected' : ''}"
                      data-bag-uid="${item.uid}"
                      style="border-color:${item.rarityColor};background:radial-gradient(circle, ${item.rarityColor}28 0%, #140e09 90%)"
                      title="${item.name} (⚔ ${item.powerScore})"
                    >
                      <span>${SLOT_ICONS[item.slot] || '⚔️'}</span>
                      ${item.upgradeLevel ? `<span class="cell-upg-tag">+${item.upgradeLevel}</span>` : ''}
                      <span class="cell-lv-tag">⚔${item.powerScore}</span>
                    </div>
                  `;
                })
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('select-forge-set-id')?.addEventListener('change', (e) => {
      selectedForgeSetId = e.target.value || '';
    });

    document.getElementById('btn-forge-current-slot')?.addEventListener('click', () => {
      if (engine.forgeSetEquipment(selectedEquipSlotToCompare, selectedForgeSetId || null)) {
        renderModalContent();
        updateDeskrawlHud();
      }
    });

    body.querySelectorAll('[data-gamble-skull]').forEach((btn) => {
      btn.onclick = () => {
        const tierType = btn.getAttribute('data-gamble-skull');
        if (engine.gambleSkullItem(selectedEquipSlotToCompare, tierType, selectedForgeSetId || null)) {
          renderModalContent();
          updateDeskrawlHud();
        }
      };
    });

    body.querySelectorAll('[data-paperdoll-slot]').forEach((el) => {
      el.onclick = () => {
        selectedEquipSlotToCompare = el.getAttribute('data-paperdoll-slot');
        renderModalContent();
      };
    });

    body.querySelectorAll('[data-bag-uid]').forEach((el) => {
      el.onclick = () => {
        selectedBagItemUid = el.getAttribute('data-bag-uid');
        renderModalContent();
      };
      el.ondblclick = () => {
        engine.equipItem(el.getAttribute('data-bag-uid'));
        selectedBagItemUid = null;
        renderModalContent();
        updateDeskrawlHud();
      };
    });

    document.getElementById('btn-upgrade-equipped')?.addEventListener('click', () => {
      if (engine.upgradeEquippedItem(selectedEquipSlotToCompare)) {
        renderModalContent();
        updateDeskrawlHud();
      }
    });

    document.getElementById('btn-reforge-equipped')?.addEventListener('click', () => {
      if (engine.reforgeEquippedItem(selectedEquipSlotToCompare)) {
        renderModalContent();
        updateDeskrawlHud();
      }
    });

    document.getElementById('btn-auto-equip-all')?.addEventListener('click', () => {
      EQUIP_SLOTS.forEach((slot) => {
        const cur = engine.state.equipped[slot.id];
        const candidates = engine.state.inventory.filter((i) => i.slot === slot.id);
        candidates.sort((a, b) => (b.powerScore || 0) - (a.powerScore || 0));
        if (candidates[0] && (!cur || candidates[0].powerScore > cur.powerScore)) {
          engine.equipItem(candidates[0].uid);
        }
      });
      renderModalContent();
      updateDeskrawlHud();
    });

    document.getElementById('btn-salvage-all')?.addEventListener('click', () => {
      engine.salvageAllInventory();
      selectedBagItemUid = null;
      renderModalContent();
      updateDeskrawlHud();
    });

    document.getElementById('btn-equip-sel')?.addEventListener('click', () => {
      if (selectedItem) {
        engine.equipItem(selectedItem.uid);
        selectedBagItemUid = null;
        renderModalContent();
        updateDeskrawlHud();
      }
    });

    document.getElementById('btn-salvage-sel')?.addEventListener('click', () => {
      if (selectedItem) {
        engine.salvageItem(selectedItem.uid);
        selectedBagItemUid = null;
        renderModalContent();
        updateDeskrawlHud();
      }
    });

  // --------------------------------------------------------------------------
  // TAB 3: VÕ KỸ & CÂY THIÊN PHÚ — DESKRAWL SPELLS & 15-NODE TALENT TREE (Screenshot #5 + Phase 9)
  // --------------------------------------------------------------------------
  } else if (activeTab === 'town') {
    const currentRuneId = engine.state.equippedSkillRunes?.[activeSkillSlotToAssign] || 'split_phantom';
    const unlockedHeroList = Object.keys(engine.state.unlockedHeroes).map((id) => findHero(id));
    const tierLevels = [1, 5, 10, 15, 20];
    const availPts = engine.getAvailableTalentPoints();
    const totalPts = engine.getTotalTalentPoints();

    body.innerHTML = `
      <div class="deskrawl-talents-layout">
        <!-- LEFT PANEL: SPELLS & RUNE LOADOUT + 5 BUILDINGS -->
        <div class="spells-parchment-panel">
          <div style="font-size:11.5px;font-weight:900;color:#fef08a;border-bottom:1px solid #6e5023;padding-bottom:3px">
            📕 4 Ô Võ Kỹ Chủ Tướng & Ấn Pháp
          </div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:4px">
            ${[0, 1, 2, 3]
              .map((slotIdx) => {
                const isUnlocked = engine.isSkillSlotUnlocked(slotIdx);
                const reqLv = engine.getSkillSlotUnlockLevel(slotIdx);
                const isSel = activeSkillSlotToAssign === slotIdx;
                const rawHId = engine.state.equippedSkillHeroIds?.[slotIdx] || (slotIdx === 0 ? engine.state.mainHeroId : null);
                const h = rawHId ? findHero(rawHId) : null;
                const rune = findRune(engine.state.equippedSkillRunes?.[slotIdx]);
                return `
                  <div
                    class="stage-card-box ${isSel ? 'active' : ''}"
                    data-select-skill-slot="${slotIdx}"
                    style="cursor:pointer;padding:4px 6px"
                  >
                    <div style="display:flex;justify-content:space-between;font-size:9px;color:#fde047">
                      <b>Phím ${slotIdx + 1}</b>
                      <span>${isUnlocked ? `${rune.sealChar} ${rune.name.replace(' Ấn', '')}` : `Khóa (Lv.${reqLv})`}</span>
                    </div>
                    <div style="font-size:10.5px;font-weight:800;color:#fff">
                      ${isUnlocked && h ? h.skill.name : 'Chưa Gán'}
                    </div>
                    <div style="font-size:9px;color:#d4a64a">${isUnlocked && h ? h.name : 'Click chọn tướng'}</div>
                  </div>
                `;
              })
              .join('')}
          </div>

          <div style="font-size:10px;font-weight:800;color:#fde047">
            Ấn Pháp Ô ${activeSkillSlotToAssign + 1}:
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px">
            ${SKILL_RUNES.map((r) => {
              const isAct = r.id === currentRuneId;
              return `
                <button
                  class="action-btn ${isAct ? 'jade' : ''}"
                  data-socket-rune="${r.id}"
                  title="${r.desc}"
                  style="height:22px;font-size:9px;padding:0 3px"
                >
                  ${r.sealChar} ${r.name.replace(' Ấn', '')}
                </button>
              `;
            }).join('')}
          </div>

          <div style="font-size:10px;font-weight:800;color:#fde047">
            Đổi Võ Kỹ Tướng Ô ${activeSkillSlotToAssign + 1}:
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:3px;max-height:58px;overflow-y:auto">
            ${unlockedHeroList
              .map(
                (uh) => `
                  <button class="action-btn" data-equip-skill="${uh.id}" style="height:21px;font-size:9px;padding:0 5px">
                    ${uh.name}
                  </button>
                `
              )
              .join('')}
          </div>

          <!-- 5 TOWN BUILDINGS COMPACT STRIP -->
          <div style="border-top:1px solid #6e5023;padding-top:4px;margin-top:auto">
            <div style="font-size:10px;font-weight:800;color:#fde047;margin-bottom:3px">
              🏯 5 Công Trình Đại Doanh (Click Để Nâng Cấp):
            </div>
            <div style="display:flex;flex-direction:column;gap:3px">
              ${TOWN_BUILDINGS.map((b) => {
                const lv = engine.state.buildings[b.id] || 1;
                const cost = engine.getBuildingUpgradeCost(b.id);
                return `
                  <button
                    class="action-btn ${cost.isMax ? 'disabled' : ''}"
                    data-up-bld="${b.id}"
                    title="${b.effectText(lv)}"
                    style="height:21px;font-size:9px;display:flex;justify-content:space-between;align-items:center;padding:0 6px"
                  >
                    <span>${b.name} (Cấp ${lv})</span>
                    <span>${cost.isMax ? 'MAX' : `${cost.gold}🪙+${cost.iron}⛏️`}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL: TRUE 5-TIER × 3 CIRCULAR NODES COMBAT TALENT TREE (Screenshot #5) -->
        <div class="talent-tree-slate-panel">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #4a3519;padding-bottom:4px">
            <span style="font-size:11.5px;font-weight:900;color:#fde047">
              ⚡ Cây Thiên Phú Chiến Đấu — Điểm Khả Dụng: <b style="color:#4ade80">${availPts} / ${totalPts}</b>
            </span>
            <div style="display:flex;gap:5px">
              <button class="action-btn" id="btn-reset-talents" style="height:22px;font-size:9.5px;padding:0 8px">
                🔄 Tẩy Điểm Thiên Phú
              </button>
              <button class="action-btn" id="btn-reset-save" style="height:22px;font-size:9.5px;padding:0 8px">
                Chơi Lại Lv.1
              </button>
            </div>
          </div>

          ${tierLevels
            .map((reqLv, tIdx) => {
              const tierNum = tIdx + 1;
              const tierNodes = COMBAT_TALENTS.filter((t) => t.tier === tierNum);
              const isTierUnlocked = (engine.state.level || 1) >= reqLv;
              return `
                <div class="talent-tier-row" style="grid-template-columns: 42px repeat(3, 1fr);opacity:${isTierUnlocked ? '1' : '0.52'}">
                  <div class="talent-tier-badge" title="Mở khóa ở Cấp ${reqLv}">${reqLv}</div>
                  ${tierNodes
                    .map((node) => {
                      const curRank = engine.state.talents?.[node.id] || 0;
                      const isMax = curRank >= node.maxRank;
                      return `
                        <div
                          class="talent-node-circle"
                          data-up-talent="${node.id}"
                          title="${node.name}: ${node.desc} (Yêu cầu Lv.${node.reqLv})"
                          style="flex-direction:row;gap:8px;justify-content:flex-start;background:rgba(15,28,36,0.75);border-color:${curRank > 0 ? '#fde047' : 'rgba(138,101,41,0.35)'}"
                        >
                          <div class="t-circle-ico" style="border-color:${isMax ? '#4ade80' : curRank > 0 ? '#fde047' : '#64748b'}">
                            ${node.icon}
                          </div>
                          <div style="min-width:0;flex:1">
                            <div style="display:flex;justify-content:space-between;align-items:center">
                              <span class="t-circle-name" style="font-weight:800;color:#f8fafc;text-align:left">${node.name}</span>
                              <span class="t-circle-rank" style="color:${isMax ? '#4ade80' : '#fde047'}">${curRank}/${node.maxRank}</span>
                            </div>
                            <div style="font-size:8.5px;color:#93c5fd">${node.desc}</div>
                          </div>
                        </div>
                      `;
                    })
                    .join('')}
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    `;

    body.querySelectorAll('[data-select-skill-slot]').forEach((el) => {
      el.onclick = () => {
        activeSkillSlotToAssign = Number(el.getAttribute('data-select-skill-slot'));
        renderModalContent();
      };
    });

    body.querySelectorAll('[data-socket-rune]').forEach((el) => {
      el.onclick = () => {
        engine.setSkillRune(activeSkillSlotToAssign, el.getAttribute('data-socket-rune'));
        lastSkillSig = '';
        renderModalContent();
        updateDeskrawlHud();
      };
    });

    body.querySelectorAll('[data-equip-skill]').forEach((el) => {
      el.onclick = () => {
        engine.setEquippedSkillSlot(activeSkillSlotToAssign, el.getAttribute('data-equip-skill'));
        lastSkillSig = '';
        renderModalContent();
        updateDeskrawlHud();
      };
    });

    body.querySelectorAll('[data-up-talent]').forEach((el) => {
      el.onclick = () => {
        if (engine.upgradeTalent(el.getAttribute('data-up-talent'))) {
          renderModalContent();
          updateDeskrawlHud();
        }
      };
    });

    document.getElementById('btn-reset-talents')?.addEventListener('click', () => {
      engine.resetTalents();
      renderModalContent();
      updateDeskrawlHud();
    });

    body.querySelectorAll('[data-up-bld]').forEach((btn) => {
      btn.onclick = () => {
        if (engine.upgradeBuilding(btn.getAttribute('data-up-bld'))) {
          renderModalContent();
          updateDeskrawlHud();
        }
      };
    });

    document.getElementById('btn-reset-save')?.addEventListener('click', () => {
      engine.resetSave();
    });

  // --------------------------------------------------------------------------
  // TAB 4: THÁI THÚ 13 CHÂU
  // --------------------------------------------------------------------------
  } else if (activeTab === 'provinces') {
    const lineupIds = engine.getActiveLineupHeroIds();
    const reserveUnlocked = Object.keys(engine.state.unlockedHeroes).filter((id) => !lineupIds.includes(id));

    body.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:11.5px;color:#f4ead5">
          🏯 Bổ nhiệm Tướng Dự Bị trấn giữ 13 Châu để cộng chỉ số vĩnh viễn cho toàn quân (Khả dụng: <b style="color:#fde047">${reserveUnlocked.length} Tướng</b>)
        </span>
        <button class="action-btn jade" id="btn-auto-governors">⚡ Tự Động Bổ Nhiệm Thái Thú</button>
      </div>

      <div class="compact-grid-3">
        ${PROVINCES_13.map((prov) => {
          const govHeroId = engine.state.provinceGovernors?.[prov.id];
          const govHero = govHeroId ? findHero(govHeroId) : null;
          const stars = govHeroId ? engine.state.unlockedHeroes[govHeroId]?.stars || 1 : 0;
          const totalPct = Math.round(prov.baseVal * Math.max(1, stars) * 100);
          return `
            <div class="stage-card-box ${govHero ? 'active' : ''}">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <b style="color:#fde047;font-size:12px">${prov.name} (${prov.capital})</b>
                <span style="font-size:10px;color:#4ade80;font-weight:800">
                  ${govHero ? `${govHero.name} +${totalPct}%` : 'Chưa bổ nhiệm'}
                </span>
              </div>
              <div style="font-size:10px;color:#d6c7b2">${prov.desc}</div>
              ${
                reserveUnlocked.length > 0
                  ? `
                    <select data-prov-select="${prov.id}" style="height:24px;background:#120d09;border:1px solid #6e5023;color:#fde047;font-size:10px">
                      <option value="">-- Chọn Thái Thú Trấn Châu --</option>
                      ${reserveUnlocked
                        .map((rId) => {
                          const rh = findHero(rId);
                          const rStars = engine.state.unlockedHeroes[rId]?.stars || 1;
                          return `<option value="${rId}" ${rId === govHeroId ? 'selected' : ''}>${rh.name} (${rStars}★)</option>`;
                        })
                        .join('')}
                    </select>
                  `
                  : `<div style="font-size:9.5px;color:#9a8466">Chiêu mộ thêm Tướng để bổ nhiệm Thái Thú</div>`
              }
            </div>
          `;
        }).join('')}
      </div>
    `;

    document.getElementById('btn-auto-governors')?.addEventListener('click', () => {
      engine.state.provinceGovernors = {};
      engine.autoAssignGovernors();
      engine.rebuildPlayerArmy();
      engine.saveGame();
      renderModalContent();
    });

    body.querySelectorAll('[data-prov-select]').forEach((sel) => {
      sel.onchange = () => {
        const provId = sel.getAttribute('data-prov-select');
        const hId = sel.value;
        if (hId) {
          engine.assignProvinceGovernor(provId, hId);
          renderModalContent();
        }
      };
    });

  // --------------------------------------------------------------------------
  // TAB 5: SA BÀN CHIẾN DỊCH (T1–T10) & QUÁ NGŨ QUAN
  // --------------------------------------------------------------------------
  } else if (activeTab === 'roadmap') {
    const ascTier = engine.state.ascensionTier || 0;

    body.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:11.5px;color:#fde047;font-weight:800">
          🗺️ 10 Chiến Dịch Lịch Sử Tam Quốc (Mỗi Ải gồm 3 Đợt 💀 Tiểu Boss + 1 👑 Chủ Soái Trấn Ải)
        </span>
        <button id="btn-ascend-empire" class="action-btn jade">
          🔥 Luân Hồi Bậc ${ascTier + 1} (+45% Công/Máu Vĩnh Viễn)
        </button>
      </div>

      <div class="compact-grid-3" style="flex:1">
        ${CAMPAIGN_STAGES.map((st) => {
          const isUnlocked = st.id <= engine.state.maxUnlockedStageId;
          const isCurrent = st.id === engine.state.currentStageId && !engine.activeGauntletPass;
          return `
            <div class="stage-card-box ${isCurrent ? 'active' : ''}">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-weight:900;color:#c084fc;font-size:11px">T${st.id} • ${st.eraTitle}</span>
                <span style="font-size:10px;color:#fde047">Lv.${st.enemyLevel + ascTier * 5}</span>
              </div>
              <div style="font-size:12.5px;font-weight:900;color:#fff">${st.name}</div>
              <div style="font-size:10px;color:#fca5a5">👑 Chủ Soái: ${st.bossTitle}</div>
              <button class="action-btn ${isCurrent ? 'jade' : !isUnlocked ? 'disabled' : ''}" data-march-stage="${st.id}" ${!isUnlocked ? 'disabled' : ''}>
                ${isCurrent ? '⚔ Đang Giao Chiến' : isUnlocked ? '🐎 Xuất Quân Tới Ải Này' : '🔒 Chưa Mở Khóa'}
              </button>
            </div>
          `;
        }).join('')}
      </div>

      <div style="border-top:1px solid #5c4322;padding-top:6px;margin-top:6px;display:flex;align-items:center;justify-content:space-between;gap:6px">
        <span style="font-size:11px;font-weight:800;color:#fde047">
          ⚔ Quá Ngũ Quan Trảm Lục Tướng (${engine.state.clearedGauntletPassIds.length}/5):
        </span>
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          ${GAUNTLET_PASSES.map((gp) => {
            const cleared = engine.state.clearedGauntletPassIds.includes(gp.passId);
            return `
              <button class="action-btn ${cleared ? 'jade' : ''}" data-start-gauntlet="${gp.passId}" style="height:24px;font-size:10px">
                ${cleared ? '✓ ' : '⚔ '}${gp.name} (Lv.${gp.recLv})
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-ascend-empire')?.addEventListener('click', () => {
      engine.ascendEmpire();
      renderModalContent();
      updateDeskrawlHud();
    });

    body.querySelectorAll('[data-start-gauntlet]').forEach((btn) => {
      btn.onclick = () => {
        const passId = Number(btn.getAttribute('data-start-gauntlet'));
        if (engine.startGauntletPass(passId)) {
          engine.inTownMode = false;
          closeModal();
          updateDeskrawlHud();
        }
      };
    });

    body.querySelectorAll('[data-march-stage]').forEach((btn) => {
      btn.onclick = () => {
        const stId = Number(btn.getAttribute('data-march-stage'));
        if (stId <= engine.state.maxUnlockedStageId) {
          engine.inTownMode = false;
          engine.state.currentStageId = stId;
          engine.state.currentWave = 1;
          engine.state.farmingBeforeBoss = false;
          engine.spawnWave();
          closeModal();
          updateDeskrawlHud();
        }
      };
    });
  }
}

// ============================================================================
// WIRE UP BATTLEFIELD & TOWN ROAD CLICKS + HUD LISTENERS
// ============================================================================
canvas?.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const relX = e.clientX - rect.left;
  const relY = e.clientY - rect.top;

  // Check if player clicked one of the 4 Interactive Town Outpost NPC Stalls in Town Mode
  if (engine.inTownMode && Array.isArray(pixelRenderer.townStallHitboxes)) {
    const clickedStall = pixelRenderer.townStallHitboxes.find(
      (b) => relX >= b.x && relX <= b.x + b.w && relY >= b.y && relY <= b.y + b.h
    );
    if (clickedStall) {
      openModalTab(clickedStall.tab);
      return;
    }
  }

  const worldX = (relX / Math.max(1, rect.width)) * 1050;
  engine.triggerBattlefieldClick(worldX, relY);
  updateDeskrawlHud();
});

document.getElementById('btn-toggle-town')?.addEventListener('click', () => {
  engine.toggleTownMode();
  updateDeskrawlHud();
});

document.getElementById('btn-hud-potion')?.addEventListener('click', () => {
  engine.usePotion();
  updateDeskrawlHud();
});

document.getElementById('btn-hud-train')?.addEventListener('click', () => {
  if (engine.upgradeTraining()) {
    updateDeskrawlHud();
    if (activeTab) renderModalContent();
  }
});

// Clickable 3-Skull + 1-Crown Stage Progress Nodes (💀 💀 💀 👑)
document.querySelectorAll('.skull-node-btn[data-wave]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const waveNum = Number(btn.getAttribute('data-wave'));
    engine.inTownMode = false;
    engine.jumpToWave(waveNum);
    updateDeskrawlHud();
  });
});

document.getElementById('hud-tier-badge')?.addEventListener('click', () => {
  openModalTab('roadmap');
});

document.querySelectorAll('[data-open-tab]').forEach((btn) => {
  btn.addEventListener('click', () => {
    openModalTab(btn.getAttribute('data-open-tab'));
  });
});

document.querySelectorAll('[data-tab]').forEach((btn) => {
  btn.addEventListener('click', () => {
    openModalTab(btn.getAttribute('data-tab'));
  });
});

document.getElementById('btn-close-modal')?.addEventListener('click', () => {
  closeModal();
});

document.getElementById('btn-cast-ultimate')?.addEventListener('click', () => {
  engine.castMeta3QComboUltimate();
  updateDeskrawlHud();
});

document.getElementById('btn-cycle-speed')?.addEventListener('click', (e) => {
  const newSpd = engine.cycleGameSpeed();
  e.currentTarget.textContent = `${newSpd.toFixed(1)}x`;
});

document.getElementById('btn-toggle-sound')?.addEventListener('click', (e) => {
  const isMuted = soundEngine.toggleMute();
  e.currentTarget.textContent = isMuted ? '🔇' : '🔊';
});

document.getElementById('btn-hide-hud')?.addEventListener('click', () => {
  document.getElementById('hud-bar-inner')?.classList.add('hidden');
  document.getElementById('btn-expand-hud')?.classList.remove('hidden');
});

document.getElementById('btn-expand-hud')?.addEventListener('click', () => {
  document.getElementById('hud-bar-inner')?.classList.remove('hidden');
  document.getElementById('btn-expand-hud')?.classList.add('hidden');
});

document.getElementById('btn-quit-app')?.addEventListener('click', () => {
  engine.saveGame();
  window.desktopAPI?.quitApp();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  } else if (['1', '2', '3', '4'].includes(e.key)) {
    engine.castEquippedSkillSlot(Number(e.key) - 1);
  } else if (e.key.toLowerCase() === 'q') {
    engine.usePotion();
    updateDeskrawlHud();
  } else if (e.code === 'Space') {
    engine.castMeta3QComboUltimate();
  }
});

// ============================================================================
// MAIN 60FPS GAME LOOP
// ============================================================================
let lastTime = performance.now();
let hudAcc = 0;

function mainLoop(now) {
  const rawDelta = typeof now === 'number' ? (now - lastTime) / 1000 : 0.016;
  const dt = Math.max(0.001, Math.min(0.1, rawDelta));
  if (typeof now === 'number') lastTime = now;

  engine.update(dt, pixelRenderer.width);
  pixelRenderer.render(dt);

  hudAcc += dt;
  if (hudAcc >= 0.12) {
    hudAcc = 0;
    updateDeskrawlHud();
  }

  requestAnimationFrame(mainLoop);
}

updateDeskrawlHud();
requestAnimationFrame(mainLoop);
