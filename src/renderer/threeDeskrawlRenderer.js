// ============================================================================
// TRUE 3D WEBGL DESKRAWL ENGINE (THREE.JS)
// Replicates Deskrawl's exact 3D lit cobblestone walkway, flickering wall torches,
// 3D articulated skeletal heroes/mounts/dragons, parabolic loot arcs into cart,
// volumetric loot beams sticking out of cart, and 3D in-world Town Street!
// ============================================================================

import * as THREE from '../../node_modules/three/build/three.module.js';
import { FACTIONS, HEROES, TOWN_BUILDINGS } from '../data/threeKingdomsData.js';

export class ThreeDeskrawlRenderer {
  constructor(containerEl, engine) {
    this.container = containerEl;
    this.engine = engine;
    this.sceneMode = 'combat'; // 'combat' | 'town'
    this.townWalkTargetX = 0;
    this.townHeroX = -3.5;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // 1. WebGL Renderer with alpha so upper sky can blend seamlessly
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 2. HTML Overlay Layer for crisp Diablo Loot Labels, Damage Numbers & Town Plaques
    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'webgl-world-overlay';
    this.container.appendChild(this.overlayEl);

    // 3. Scene & Camera (Tilted 2.5D Isometric-Side Strip angle matching Deskrawl)
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(26, this.width / Math.max(1, this.height), 0.1, 120);
    this.updateCameraFraming();

    // 4. Procedural PBR Textures (Cobblestone road, Stone wall bricks, Wood, Radial glow)
    this.textures = {
      cobble: this.createCobblestoneTexture(),
      wallBrick: this.createWallBrickTexture(),
      glow: this.createRadialGlowTexture(),
      beam: this.createVerticalBeamTexture(),
    };

    // 5. Lights (Moonlight directional + warm flickering Wall Torch PointLights)
    this.setupLights();

    // 6. World Groups
    this.environmentGroup = new THREE.Group();
    this.combatWallGroup = new THREE.Group();
    this.townBuildingsGroup = new THREE.Group();
    this.unitsGroup = new THREE.Group();
    this.lootGroup = new THREE.Group();
    this.particlesGroup = new THREE.Group();

    this.scene.add(this.environmentGroup);
    this.scene.add(this.combatWallGroup);
    this.scene.add(this.townBuildingsGroup);
    this.scene.add(this.unitsGroup);
    this.scene.add(this.lootGroup);
    this.scene.add(this.particlesGroup);

    // Runtime 3D caches
    this.torchFlames = [];
    this.unitRigMap = new Map(); // uid -> THREE.Group skeletal rig
    this.cartRig = null;
    this.lootMeshMap = new Map(); // drop.id -> THREE.Group
    this.particles = []; // { mesh, vx, vy, vz, life, maxLife, scaleRate }
    this.townBuildingAnchors = []; // For projecting HTML plaques above 3D town buildings

    this.buildEnvironment();
    this.buildTownBuildings();
    this.buildSupplyCartRig();
    this.setSceneMode('combat');

    window.addEventListener('resize', () => this.onResize());
  }

  updateCameraFraming() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / Math.max(1, this.height);
    // Position camera so the 3D stone road sits along the bottom strip of the window
    // and the upper space is open for tall loot beams and pop-up windows
    const isExpanded = this.height > 360;
    this.camera.position.set(0, isExpanded ? 9.2 : 5.4, isExpanded ? 24.5 : 15.2);
    this.camera.lookAt(0, isExpanded ? 3.2 : 0.85, 0);
    this.camera.updateProjectionMatrix();
  }

  onResize() {
    this.updateCameraFraming();
    this.renderer.setSize(this.width, this.height);
  }

  // --------------------------------------------------------------------------
  // PROCEDURAL DARK-FANTASY TEXTURES
  // --------------------------------------------------------------------------
  createCobblestoneTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 256;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#141619';
    ctx.fillRect(0, 0, 512, 256);

    // Draw staggered stone pavers with warm/cool variation like Deskrawl's road
    const rows = 8;
    const cols = 12;
    const bw = 512 / cols;
    const bh = 256 / rows;

    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (bw * 0.5);
      for (let col = -1; col <= cols; col++) {
        const x = col * bw + offset;
        const y = r * bh;
        const shade = 36 + ((r * 17 + col * 31) % 26);
        const warm = (r + col) % 3 === 0 ? 6 : 0;
        ctx.fillStyle = `rgb(${shade + warm}, ${shade + 2}, ${shade + 6})`;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, bw - 4, bh - 4, 4);
        ctx.fill();

        // Highlight top edge of stone
        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.fillRect(x + 4, y + 3, bw - 8, 3);
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(9, 1.5);
    return tex;
  }

  createWallBrickTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#181512';
    ctx.fillRect(0, 0, 256, 128);

    const rows = 4;
    const cols = 6;
    const bw = 256 / cols;
    const bh = 128 / rows;
    for (let r = 0; r < rows; r++) {
      const off = (r % 2) * (bw * 0.5);
      for (let col = -1; col <= cols; col++) {
        const v = 42 + ((r * 13 + col * 29) % 22);
        ctx.fillStyle = `rgb(${v + 8}, ${v + 3}, ${v})`;
        ctx.fillRect(col * bw + off + 2, r * bh + 2, bw - 4, bh - 4);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 1.5);
    return tex;
  }

  createRadialGlowTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
    g.addColorStop(0, 'rgba(255, 255, 255, 1)');
    g.addColorStop(0.4, 'rgba(255, 220, 140, 0.65)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  createVerticalBeamTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 256, 0, 0);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    g.addColorStop(0.25, 'rgba(255, 255, 255, 0.65)');
    g.addColorStop(0.75, 'rgba(255, 255, 255, 0.18)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;

    // Horizontal softness
    for (let x = 0; x < 64; x++) {
      const dist = Math.abs(x - 32) / 32;
      ctx.globalAlpha = Math.pow(Math.max(0, 1 - dist), 1.8);
      ctx.fillRect(x, 0, 1, 256);
    }
    return new THREE.CanvasTexture(c);
  }

  // --------------------------------------------------------------------------
  // LIGHTING (COOL MOONLIGHT + WARM FLICKERING TORCH POINT LIGHTS)
  // --------------------------------------------------------------------------
  setupLights() {
    const ambient = new THREE.AmbientLight(0x3b4866, 1.35);
    this.scene.add(ambient);

    const moonDir = new THREE.DirectionalLight(0x93c5fd, 1.4);
    moonDir.position.set(6, 14, 10);
    moonDir.castShadow = true;
    moonDir.shadow.mapSize.width = 1024;
    moonDir.shadow.mapSize.height = 1024;
    moonDir.shadow.camera.left = -16;
    moonDir.shadow.camera.right = 16;
    moonDir.shadow.camera.top = 8;
    moonDir.shadow.camera.bottom = -8;
    this.scene.add(moonDir);

    // 4 Flickering Warm Orange Wall Torches along the walkway
    this.torchLights = [];
    const torchPositions = [-10.5, -3.5, 3.5, 10.5];
    torchPositions.forEach((tx) => {
      const pl = new THREE.PointLight(0xff7b1a, 4.2, 9.5, 1.6);
      pl.position.set(tx, 1.65, -1.65);
      this.scene.add(pl);
      this.torchLights.push({ light: pl, baseX: tx });
    });
  }

  // --------------------------------------------------------------------------
  // 3D WALKWAY, BATTLMENTS & TORCHES (EXACT DESKRAWL LOOK)
  // --------------------------------------------------------------------------
  buildEnvironment() {
    // 1. Dark background hill silhouette strip right behind the wall
    const bgHillGeo = new THREE.PlaneGeometry(42, 4.2);
    const bgHillMat = new THREE.MeshBasicMaterial({
      color: 0x060911,
      transparent: true,
      opacity: 0.92,
    });
    const bgHill = new THREE.Mesh(bgHillGeo, bgHillMat);
    bgHill.position.set(0, 1.6, -3.2);
    this.environmentGroup.add(bgHill);

    // 2. Main 3D Cobblestone Walkway Floor
    const roadGeo = new THREE.BoxGeometry(40, 0.5, 4.2);
    const roadMat = new THREE.MeshStandardMaterial({
      map: this.textures.cobble,
      roughness: 0.78,
      metalness: 0.12,
    });
    this.roadMesh = new THREE.Mesh(roadGeo, roadMat);
    this.roadMesh.position.set(0, -0.25, 0);
    this.roadMesh.receiveShadow = true;
    this.environmentGroup.add(this.roadMesh);

    // Front stone curb bevel
    const curbGeo = new THREE.BoxGeometry(40, 0.58, 0.28);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x262930, roughness: 0.7 });
    const frontCurb = new THREE.Mesh(curbGeo, curbMat);
    frontCurb.position.set(0, -0.22, 2.1);
    this.environmentGroup.add(frontCurb);

    // 3. Back 3D Fortress Battlement Wall (Hổ Lao Quan / Deskrawl Dungeon Wall)
    const wallGeo = new THREE.BoxGeometry(40, 1.85, 0.55);
    const wallMat = new THREE.MeshStandardMaterial({
      map: this.textures.wallBrick,
      roughness: 0.85,
      metalness: 0.1,
    });
    this.wallMesh = new THREE.Mesh(wallGeo, wallMat);
    this.wallMesh.position.set(0, 0.85, -2.15);
    this.wallMesh.receiveShadow = true;
    this.combatWallGroup.add(this.wallMesh);

    // Stone Pillars & Crenellations along the wall + Wall Torch Sconces
    const pillarGeo = new THREE.BoxGeometry(0.75, 2.25, 0.75);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x2d2620, roughness: 0.8 });
    this.wallPillars = [];

    for (let i = -3; i <= 3; i++) {
      const px = i * 5.2;
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(px, 1.0, -2.08);
      pillar.castShadow = true;
      pillar.receiveShadow = true;

      // Torch sconce on pillar
      const sconce = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.04, 0.45, 6),
        new THREE.MeshStandardMaterial({ color: 0x1c1917, metalness: 0.8 })
      );
      sconce.position.set(0, 0.35, 0.42);
      sconce.rotation.x = 0.35;
      pillar.add(sconce);

      // Glowing Torch Flame Sprite
      const flameMat = new THREE.SpriteMaterial({
        map: this.textures.glow,
        color: 0xff8811,
        blending: THREE.AdditiveBlending,
        transparent: true,
      });
      const flame = new THREE.Sprite(flameMat);
      flame.scale.set(0.95, 1.25, 1);
      flame.position.set(0, 0.65, 0.52);
      pillar.add(flame);
      this.torchFlames.push(flame);

      this.combatWallGroup.add(pillar);
      this.wallPillars.push(pillar);
    }
  }

  // --------------------------------------------------------------------------
  // IN-WORLD 3D TOWN BUILDINGS STREET (LIKE DESKRAWL_TOWN.MP4!)
  // --------------------------------------------------------------------------
  buildTownBuildings() {
    this.townBuildingAnchors = [];
    const positions = [-10.0, -5.0, 0.0, 5.0, 10.0];
    const roofColors = [0x991b1b, 0x334155, 0x92400e, 0x1e3a8a, 0x15803d];

    TOWN_BUILDINGS.forEach((bDef, idx) => {
      const bx = positions[idx];
      const bGroup = new THREE.Group();
      bGroup.position.set(bx, 0, -1.35);

      // Building Wooden/Stone Base House
      const houseGeo = new THREE.BoxGeometry(3.4, 2.2, 1.8);
      const houseMat = new THREE.MeshStandardMaterial({
        color: 0x3b2818,
        roughness: 0.85,
      });
      const house = new THREE.Mesh(houseGeo, houseMat);
      house.position.y = 1.1;
      house.castShadow = true;
      house.receiveShadow = true;
      bGroup.add(house);

      // Pitched Chinese Tiled Roof
      const roofGeo = new THREE.ConeGeometry(2.75, 1.25, 4);
      const roofMat = new THREE.MeshStandardMaterial({
        color: roofColors[idx % roofColors.length],
        roughness: 0.65,
      });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 2.75;
      roof.rotation.y = Math.PI / 4;
      bGroup.add(roof);

      // Glowing Windows / Lanterns
      for (const wx of [-0.85, 0.85]) {
        const win = new THREE.Mesh(
          new THREE.PlaneGeometry(0.48, 0.58),
          new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
        );
        win.position.set(wx, 1.15, 0.92);
        bGroup.add(win);
      }

      // NPC Shopkeeper standing in front of building
      const npc = this.createHumanoidRig({
        armorColor: roofColors[idx % roofColors.length],
        capeColor: 0xfacc15,
        accentColor: 0xfde047,
        scale: 0.72,
      });
      npc.position.set(0, 0, 1.15);
      bGroup.add(npc);

      this.townBuildingsGroup.add(bGroup);
      this.townBuildingAnchors.push({
        buildingId: bDef.id,
        bDef,
        group: bGroup,
        worldPos: new THREE.Vector3(bx, 3.55, -1.1),
      });
    });
  }

  setSceneMode(mode) {
    this.sceneMode = mode;
    this.combatWallGroup.visible = true;
    this.townBuildingsGroup.visible = mode === 'town';
    this.lootGroup.visible = mode === 'combat';
  }

  // --------------------------------------------------------------------------
  // 3D ARTICULATED SKELETAL RIG BUILDER (HEROES, HORSES, BOSSES & DRAGONS)
  // --------------------------------------------------------------------------
  createHumanoidRig(config = {}) {
    const {
      armorColor = 0x1e293b,
      capeColor = 0xdc2626,
      accentColor = 0xfbbf24,
      mountColor = null,
      weaponType = 'halberd',
      headgear = 'silver_helm',
      scale = 1.0,
      isBoss = false,
    } = config;

    const root = new THREE.Group();
    const s = scale * (isBoss ? 1.38 : 1.0);
    root.scale.set(s, s, s);

    const armorMat = new THREE.MeshStandardMaterial({
      color: armorColor,
      metalness: 0.65,
      roughness: 0.32,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      metalness: 0.85,
      roughness: 0.22,
    });
    const capeMat = new THREE.MeshStandardMaterial({
      color: capeColor,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.5 });

    let riderY = 0;
    const mountLegs = [];

    // 1. Optional 3D Warhorse Mount (Xích Thố / Bạch Long Mã / Tuyệt Ảnh)
    if (mountColor) {
      riderY = 0.68;
      const horseGroup = new THREE.Group();
      const horseMat = new THREE.MeshStandardMaterial({
        color: mountColor,
        roughness: 0.55,
        metalness: 0.15,
      });

      // Horse Barrel Torso
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.52, 0.48), horseMat);
      body.position.set(0, 0.68, 0);
      body.castShadow = true;
      horseGroup.add(body);

      // Horse Neck & Head
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.58, 0.32), horseMat);
      neck.position.set(0.54, 1.02, 0);
      neck.rotation.z = -0.35;
      horseGroup.add(neck);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.26, 0.28), horseMat);
      head.position.set(0.76, 1.22, 0);
      head.rotation.z = 0.2;
      horseGroup.add(head);

      // Golden Horse Face Armor
      const chanfron = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.3), goldMat);
      chanfron.position.set(0.78, 1.28, 0);
      chanfron.rotation.z = 0.2;
      horseGroup.add(chanfron);

      // 4 Articulated Horse Legs
      const legCoords = [
        [-0.44, 0.45, 0.18],
        [-0.44, 0.45, -0.18],
        [0.44, 0.45, 0.18],
        [0.44, 0.45, -0.18],
      ];
      legCoords.forEach(([lx, ly, lz]) => {
        const legPivot = new THREE.Group();
        legPivot.position.set(lx, ly, lz);
        const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.46, 0.14), horseMat);
        legMesh.position.y = -0.22;
        legPivot.add(legMesh);
        horseGroup.add(legPivot);
        mountLegs.push(legPivot);
      });

      root.add(horseGroup);
    }

    // 2. Character Upper & Lower Body Rig
    const bodyRoot = new THREE.Group();
    bodyRoot.position.y = riderY;
    root.add(bodyRoot);

    // Legs (if on foot)
    const leftLeg = new THREE.Group();
    const rightLeg = new THREE.Group();
    leftLeg.position.set(0, 0.48, 0.14);
    rightLeg.position.set(0, 0.48, -0.14);
    const legGeo = new THREE.BoxGeometry(0.18, 0.48, 0.18);
    const lLegMesh = new THREE.Mesh(legGeo, armorMat);
    lLegMesh.position.y = -0.24;
    leftLeg.add(lLegMesh);
    const rLegMesh = new THREE.Mesh(legGeo, armorMat);
    rLegMesh.position.y = -0.24;
    rightLeg.add(rLegMesh);
    bodyRoot.add(leftLeg);
    bodyRoot.add(rightLeg);

    // Armored Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.62, 0.38), armorMat);
    torso.position.y = 0.78;
    torso.castShadow = true;
    bodyRoot.add(torso);

    // Golden Belt & Shoulder Pauldrons
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.1, 0.4), goldMat);
    belt.position.y = 0.54;
    bodyRoot.add(belt);

    for (const side of [-1, 1]) {
      const pauldron = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.24), goldMat);
      pauldron.position.set(0, 0.98, side * 0.26);
      bodyRoot.add(pauldron);
    }

    // Flowing Cape
    const capePivot = new THREE.Group();
    capePivot.position.set(-0.22, 1.02, 0);
    const capeMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.52, 4, 1), capeMat);
    capeMesh.position.set(-0.35, -0.18, 0);
    capeMesh.rotation.y = Math.PI / 2;
    capeMesh.rotation.x = 0.35;
    capePivot.add(capeMesh);
    bodyRoot.add(capePivot);

    // Head & Three Kingdoms Crown/Helmet
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 12), skinMat);
    head.position.y = 1.28;
    bodyRoot.add(head);

    const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.22, 8), goldMat);
    helm.position.y = 1.42;
    bodyRoot.add(helm);

    // Lü Bu's Iconic Twin Pheasant Feathers in 3D!
    if (headgear === 'pheasant_crown') {
      for (const zOff of [-0.08, 0.08]) {
        const feather = new THREE.Mesh(
          new THREE.BoxGeometry(0.85, 0.06, 0.04),
          new THREE.MeshBasicMaterial({ color: 0xef4444 })
        );
        feather.position.set(-0.38, 1.62, zOff);
        feather.rotation.z = 0.35;
        bodyRoot.add(feather);
      }
    }

    // 3. Articulated Weapon Arm & Glowing 3D Three Kingdoms Weapon
    const weaponArm = new THREE.Group();
    weaponArm.position.set(0.08, 0.96, 0.24);
    bodyRoot.add(weaponArm);

    const armMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.16), armorMat);
    armMesh.position.y = -0.18;
    weaponArm.add(armMesh);

    // Weapon Shaft & Glowing Blade
    const weaponGroup = new THREE.Group();
    weaponGroup.position.set(0.1, -0.32, 0);
    weaponGroup.rotation.z = -1.1;

    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 1.85, 6),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    shaft.position.y = 0.45;
    weaponGroup.add(shaft);

    const bladeColor =
      weaponType === 'guandao'
        ? 0x4ade80
        : weaponType === 'halberd'
          ? 0xef4444
          : weaponType === 'spear'
            ? 0x38bdf8
            : 0xfde047;
    const bladeMat = new THREE.MeshStandardMaterial({
      color: bladeColor,
      emissive: bladeColor,
      emissiveIntensity: 0.85,
      metalness: 0.9,
      roughness: 0.1,
    });
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.65, 0.05), bladeMat);
    blade.position.set(0.08, 1.25, 0);
    weaponGroup.add(blade);

    weaponArm.add(weaponGroup);

    root.userData = {
      bodyRoot,
      leftLeg,
      rightLeg,
      weaponArm,
      capePivot,
      mountLegs,
      armorMat,
      baseArmorColor: new THREE.Color(armorColor),
    };

    return root;
  }

  // --------------------------------------------------------------------------
  // DESKRAWL 3D SUPPLY CART & CAPTURED DRAGON / WARHORSE HAULER RIG
  // --------------------------------------------------------------------------
  buildSupplyCartRig() {
    this.cartRig = new THREE.Group();

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.85 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.7, roughness: 0.3 });

    // Wooden Wagon Bed
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.65, 1.15), woodMat);
    bed.position.set(0, 0.55, 0);
    bed.castShadow = true;
    this.cartRig.add(bed);

    // 4 Rotating Spoked Wheels
    this.cartWheels = [];
    const wheelCoords = [
      [-0.55, 0.32, 0.62],
      [0.55, 0.32, 0.62],
      [-0.55, 0.32, -0.62],
      [0.55, 0.32, -0.62],
    ];
    wheelCoords.forEach(([wx, wy, wz]) => {
      const wGroup = new THREE.Group();
      wGroup.position.set(wx, wy, wz);
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 8, 16), rimMat);
      wGroup.add(tire);
      const spoke1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.04), woodMat);
      const spoke2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.04), woodMat);
      wGroup.add(spoke1, spoke2);
      this.cartRig.add(wGroup);
      this.cartWheels.push(wGroup);
    });

    // Gold Pile & Volumetric Loot Beams sticking out of the Cart (Exact Deskrawl signature!)
    const goldPile = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 })
    );
    goldPile.scale.set(1.2, 0.6, 0.9);
    goldPile.position.set(0, 0.92, 0);
    this.cartRig.add(goldPile);

    this.cartBeamsGroup = new THREE.Group();
    const beamColors = [0xf59e0b, 0x22c55e, 0xa855f7];
    beamColors.forEach((col, idx) => {
      const bMat = new THREE.SpriteMaterial({
        map: this.textures.beam,
        color: col,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.85,
      });
      const beam = new THREE.Sprite(bMat);
      beam.scale.set(0.65, 5.2, 1);
      beam.position.set(-0.35 + idx * 0.35, 3.1, (idx - 1) * 0.15);
      this.cartBeamsGroup.add(beam);
    });
    this.cartRig.add(this.cartBeamsGroup);

    // Captured Dragon / Warbeast Hauler pulling the Cart in front (like deskrawl_minions.mp4!)
    this.haulerBeast = new THREE.Group();
    this.haulerBeast.position.set(1.85, 0, 0);

    const dragonMat = new THREE.MeshStandardMaterial({
      color: 0x3f1d24,
      roughness: 0.5,
      metalness: 0.3,
    });
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });

    const dBody = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.55, 0.55), dragonMat);
    dBody.position.set(0, 0.68, 0);
    dBody.castShadow = true;
    this.haulerBeast.add(dBody);

    const dHead = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.32, 0.34), dragonMat);
    dHead.position.set(0.82, 1.05, 0);
    this.haulerBeast.add(dHead);

    // Flapping 3D Dragon Wings!
    this.leftWing = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.35), wingMat);
    this.leftWing.position.set(0, 1.05, 0.65);
    this.leftWing.rotation.x = 0.85;
    this.rightWing = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.35), wingMat);
    this.rightWing.position.set(0, 1.05, -0.65);
    this.rightWing.rotation.x = -0.85;
    this.haulerBeast.add(this.leftWing, this.rightWing);

    this.cartRig.add(this.haulerBeast);
    this.unitsGroup.add(this.cartRig);
  }

  // --------------------------------------------------------------------------
  // COORDINATE MAPPING (2D ENGINE X -> 3D WORLD X)
  // --------------------------------------------------------------------------
  mapX(engineX) {
    // Map engineX (140..900) to 3D world X (-7.5..+8.5)
    return (engineX - 480) * 0.022;
  }

  projectToScreen(worldVec) {
    const v = worldVec.clone().project(this.camera);
    return {
      x: (v.x * 0.5 + 0.5) * this.width,
      y: (-v.y * 0.5 + 0.5) * this.height,
    };
  }

  // --------------------------------------------------------------------------
  // SPAWN 3D PARTICLES (DRAGON FIRE BREATH, SKILL SHOCKWAVES, GOLD SPARKLES)
  // --------------------------------------------------------------------------
  spawnFireBreath(startX, targetX) {
    const dir = targetX >= startX ? 1 : -1;
    for (let i = 0; i < 26; i++) {
      const mat = new THREE.SpriteMaterial({
        map: this.textures.glow,
        color: i % 2 === 0 ? 0xff5500 : 0xfde047,
        blending: THREE.AdditiveBlending,
        transparent: true,
      });
      const sp = new THREE.Sprite(mat);
      const s = 0.45 + Math.random() * 0.55;
      sp.scale.set(s, s, 1);
      sp.position.set(
        startX + Math.random() * 0.4,
        0.95 + (Math.random() - 0.5) * 0.35,
        (Math.random() - 0.5) * 0.4
      );
      this.particlesGroup.add(sp);
      this.particles.push({
        mesh: sp,
        vx: dir * (7.5 + Math.random() * 6.5),
        vy: (Math.random() - 0.45) * 1.8,
        vz: (Math.random() - 0.5) * 1.5,
        life: 0.45 + Math.random() * 0.3,
        maxLife: 0.75,
        scaleRate: 1.8,
      });
    }
  }

  spawnGoldPillarBurst(worldX) {
    for (let i = 0; i < 24; i++) {
      const mat = new THREE.SpriteMaterial({
        map: this.textures.glow,
        color: i % 2 === 0 ? 0xfde047 : 0x38bdf8,
        blending: THREE.AdditiveBlending,
        transparent: true,
      });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(0.45, 0.45, 1);
      sp.position.set(worldX + (Math.random() - 0.5) * 1.4, 0.5 + Math.random() * 1.2, 0);
      this.particlesGroup.add(sp);
      this.particles.push({
        mesh: sp,
        vx: (Math.random() - 0.5) * 2.2,
        vy: 3.5 + Math.random() * 4.5,
        vz: (Math.random() - 0.5) * 1.2,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2,
        scaleRate: -0.2,
      });
    }
  }

  // --------------------------------------------------------------------------
  // MAIN 60FPS RENDER & ANIMATION UPDATE
  // --------------------------------------------------------------------------
  render(dt) {
    const time = this.engine.time;

    // 1. Scroll 3D Cobblestone Texture & Wall Pillars in Combat Mode
    if (this.sceneMode === 'combat') {
      this.textures.cobble.offset.x = (this.engine.scrollOffset * 0.0032) % 1;
      this.textures.wallBrick.offset.x = (this.engine.scrollOffset * 0.0038) % 1;

      const pillarScroll = (this.engine.scrollOffset * 0.022) % 5.2;
      this.wallPillars.forEach((p, idx) => {
        p.position.x = (idx - 3) * 5.2 - pillarScroll;
      });
    }

    // 2. Flicker Wall Torch Lights & Flame Sprites
    this.torchLights.forEach((tl, idx) => {
      tl.light.intensity = 3.8 + Math.sin(time * 14 + idx * 2.1) * 0.65;
    });
    this.torchFlames.forEach((fl, idx) => {
      const s = 0.9 + Math.sin(time * 18 + idx) * 0.14;
      fl.scale.set(s, s * 1.3, 1);
    });

    if (this.sceneMode === 'town') {
      this.renderTownMode(dt, time);
    } else {
      this.renderCombatMode(dt, time);
    }

    // Update 3D Particle System
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particlesGroup.remove(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;
      const s = Math.max(0.05, p.mesh.scale.x + p.scaleRate * dt);
      p.mesh.scale.set(s, s, 1);
      p.mesh.material.opacity = Math.min(1, p.life / p.maxLife);
    }

    this.renderer.render(this.scene, this.camera);
  }

  // --------------------------------------------------------------------------
  // COMBAT MODE: SYNC UNITS, CART, LOOT BEAMS & PARABOLIC TRAJECTORIES
  // --------------------------------------------------------------------------
  renderCombatMode(dt, time) {
    this.cartRig.visible = true;

    const activeUnits = [
      ...(this.engine.mainUnit ? [this.engine.mainUnit] : []),
      ...this.engine.squadUnits,
      ...this.engine.enemies.filter((e) => e.hp > 0),
    ];
    const activeUids = new Set(activeUnits.map((u) => u.uid));

    // Remove dead unit rigs
    for (const [uid, rig] of this.unitRigMap.entries()) {
      if (!activeUids.has(uid)) {
        this.unitsGroup.remove(rig);
        this.unitRigMap.delete(uid);
      }
    }

    // Update Supply Cart & Dragon Hauler
    if (this.engine.mainUnit) {
      const cartWorldX = this.mapX(this.engine.mainUnit.x) - 4.4;
      this.cartRig.position.set(cartWorldX, 0, -0.15);

      const isMoving = this.engine.mainUnit.isMoving;
      if (isMoving) {
        this.cartWheels.forEach((w) => {
          w.rotation.z -= dt * 6.5;
        });
      }
      // Flap Dragon Hauler Wings!
      const wingAngle = 0.65 + Math.sin(time * 9) * 0.42;
      this.leftWing.rotation.x = wingAngle;
      this.rightWing.rotation.x = -wingAngle;
      this.cartBeamsGroup.visible = this.engine.state.inventory.length > 0;

      // Periodically unleash Dragon Fire Breath when fighting enemies (like deskrawl_minions.mp4!)
      if (!isMoving && Math.random() < dt * 1.4) {
        const frontEnemy = this.engine.enemies.find((e) => e.hp > 0);
        if (frontEnemy) {
          this.spawnFireBreath(cartWorldX + 2.5, this.mapX(frontEnemy.x));
        }
      }
    }

    // Update or Create 3D Skeletal Rigs for all Units
    activeUnits.forEach((u, idx) => {
      let rig = this.unitRigMap.get(u.uid);
      if (!rig) {
        rig = this.createHumanoidRig({
          armorColor: u.heroConfig.armorColor || '#334155',
          capeColor: u.heroConfig.capeColor || '#dc2626',
          accentColor: u.heroConfig.accentColor || '#fbbf24',
          mountColor: u.heroConfig.mountColor || null,
          weaponType: u.heroConfig.weaponType || 'halberd',
          headgear: u.heroConfig.headgear || 'silver_helm',
          scale: u.isMainHero ? 1.05 : u.isSquadGeneral ? 0.88 : 0.92,
          isBoss: u.isBoss,
        });
        this.unitsGroup.add(rig);
        this.unitRigMap.set(u.uid, rig);
      }

      const wx = this.mapX(u.x);
      const wz = u.isMainHero
        ? 0.35
        : u.isSquadGeneral
          ? (idx % 2 === 0 ? -0.55 : 0.85)
          : u.isBoss
            ? 0.25
            : ((u.y - 136) * 0.045);

      rig.position.set(wx, 0, wz);
      rig.rotation.y = u.facing >= 0 ? 0 : Math.PI;

      // Animate Skeletal Limbs at 60 FPS!
      const ud = rig.userData;
      const runPhase = u.isMoving ? time * 12 + (u.animSeed || 0) : time * 3;
      const stride = u.isMoving ? Math.sin(runPhase) * 0.65 : 0;

      ud.leftLeg.rotation.z = stride;
      ud.rightLeg.rotation.z = -stride;
      ud.mountLegs.forEach((mLeg, mIdx) => {
        mLeg.rotation.z = (mIdx % 2 === 0 ? 1 : -1) * stride * 0.85;
      });

      ud.bodyRoot.position.y =
        (u.heroConfig.mountColor ? 0.68 : 0) + (u.isMoving ? Math.abs(Math.sin(runPhase)) * 0.08 : 0);

      // Weapon Swing Animation
      const swing = u.attackAnim > 0 ? Math.sin(u.attackAnim * Math.PI) : 0;
      ud.weaponArm.rotation.z = -0.35 + swing * 2.15;
      ud.capePivot.rotation.z = 0.15 + Math.sin(time * 8 + idx) * 0.12;

      // Hit-flash emissive
      if (u.hurtAnim > 0.08) {
        ud.armorMat.emissive.setHex(0xffffff);
        ud.armorMat.emissiveIntensity = 0.9;
      } else {
        ud.armorMat.emissive.setHex(0x000000);
        ud.armorMat.emissiveIntensity = 0;
      }
    });

    // Trigger 3D Skill Burst VFX
    if (this.engine.vfxEffects.length > 0) {
      this.engine.vfxEffects.forEach((vfx) => {
        if (!vfx.spawned3D) {
          vfx.spawned3D = true;
          this.spawnFireBreath(this.mapX(vfx.x) - 1.5, this.mapX(vfx.x) + 1.5);
        }
      });
    }

    // Update 3D Ground Drops, Volumetric Loot Beams & Parabolic Arc into Cart!
    const currentDropIds = new Set(this.engine.groundDrops.map((d) => d.id));
    for (const [did, dGroup] of this.lootMeshMap.entries()) {
      if (!currentDropIds.has(did)) {
        this.lootGroup.remove(dGroup);
        this.lootMeshMap.delete(did);
      }
    }

    const cartX = this.engine.mainUnit ? this.mapX(this.engine.mainUnit.x) - 4.4 : -5.0;
    const htmlSnippets = [];

    this.engine.groundDrops.forEach((drop) => {
      let dGroup = this.lootMeshMap.get(drop.id);
      if (!dGroup) {
        dGroup = new THREE.Group();
        const col = new THREE.Color(drop.color || '#facc15');
        const chest = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.22, 0.22),
          new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.6 })
        );
        chest.position.y = 0.14;
        dGroup.add(chest);

        if (drop.type === 'item' || drop.isCaptureSoul) {
          const beamMat = new THREE.SpriteMaterial({
            map: this.textures.beam,
            color: col,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.9,
          });
          const beam = new THREE.Sprite(beamMat);
          beam.scale.set(0.55, 5.5, 1);
          beam.position.y = 2.75;
          dGroup.add(beam);
        }

        this.lootGroup.add(dGroup);
        this.lootMeshMap.set(drop.id, dGroup);
      }

      const wx = this.mapX(drop.x);
      const age = drop.age || 0;
      // Parabolic jump on drop AND parabolic fly into Cart when age > 1.1s!
      let wy = 0;
      if (age < 0.45) {
        wy = Math.sin((age / 0.45) * Math.PI) * 1.45;
      } else if (age > 1.1) {
        const flyT = Math.min(1, (age - 1.1) / 1.1);
        wy = Math.sin(flyT * Math.PI) * 2.2 + 0.5;
      }

      dGroup.position.set(wx, wy, 0.55);

      // Project Diablo Ground Item Text Tag (like "Golden Treasure Chest", "Infinity Edge Blade")
      if (drop.type === 'item' || drop.isCaptureSoul) {
        const scr = this.projectToScreen(new THREE.Vector3(wx, wy + 0.65, 0.55));
        htmlSnippets.push(`
          <div class="diablo-ground-label" style="left:${scr.x}px; top:${scr.y}px; color:${drop.color}">
            ${drop.isCaptureSoul ? `[Chiêu Hàng] ${drop.label}` : drop.label}
          </div>
        `);
      }
    });

    // Project Unit HP Bars & Floating Damage Numbers
    activeUnits.forEach((u) => {
      const wx = this.mapX(u.x);
      const scr = this.projectToScreen(new THREE.Vector3(wx, u.isBoss ? 2.25 : 1.75, 0.25));
      const hpPct = Math.max(0, Math.min(100, (u.hp / Math.max(1, u.maxHp)) * 100));
      if (u.isBoss || u.isMainHero || u.hp < u.maxHp) {
        htmlSnippets.push(`
          <div class="world-unit-plate" style="left:${scr.x}px; top:${scr.y}px">
            ${u.isBoss ? `<div class="boss-skull-name">☠ ${u.name}</div>` : ''}
            <div class="world-hp-track ${u.isBoss ? 'boss-track' : ''}">
              <div class="world-hp-fill ${u.isPlayerTeam ? 'ally' : 'enemy'}" style="width:${hpPct}%"></div>
            </div>
          </div>
        `);
      }
    });

    this.engine.floatingTexts.forEach((ft) => {
      const wx = this.mapX(ft.x);
      const wy = 1.6 + (0.95 - ft.timer) * 1.8;
      const scr = this.projectToScreen(new THREE.Vector3(wx, wy, 0.4));
      htmlSnippets.push(`
        <div class="world-dmg-num" style="left:${scr.x}px; top:${scr.y}px; color:${ft.color}; font-size:${ft.size + 2}px">
          ${ft.text}
        </div>
      `);
    });

    this.overlayEl.innerHTML = htmlSnippets.join('');
  }

  // --------------------------------------------------------------------------
  // TOWN MODE: HERO WALKS ALONG 3D STREET & CLICKABLE BUILDING PLAQUES
  // --------------------------------------------------------------------------
  renderTownMode(dt, time) {
    this.cartRig.visible = true;
    this.cartRig.position.set(-12.2, 0, 0.2);

    // Clear enemy rigs, keep only Main Hero walking on Town Street
    for (const [uid, rig] of this.unitRigMap.entries()) {
      if (uid !== 'main_hero') {
        rig.visible = false;
      } else {
        rig.visible = true;
        const diff = this.townWalkTargetX - this.townHeroX;
        const walking = Math.abs(diff) > 0.12;
        if (walking) {
          this.townHeroX += Math.sign(diff) * 4.5 * dt;
          rig.rotation.y = diff >= 0 ? 0 : Math.PI;
        }
        rig.position.set(this.townHeroX, 0, 0.55);

        const ud = rig.userData;
        const stride = walking ? Math.sin(time * 12) * 0.65 : 0;
        ud.leftLeg.rotation.z = stride;
        ud.rightLeg.rotation.z = -stride;
        ud.mountLegs.forEach((mLeg, mIdx) => {
          mLeg.rotation.z = (mIdx % 2 === 0 ? 1 : -1) * stride * 0.85;
        });
      }
    }

    // Project Deskrawl-style In-World Building Plaques above each 3D Town Building!
    const plaquesHtml = this.townBuildingAnchors
      .map((anchor) => {
        const scr = this.projectToScreen(anchor.worldPos);
        const bId = anchor.buildingId;
        const lv = this.engine.state.buildings[bId] || 1;
        const cost = this.engine.getBuildingUpgradeCost(bId);
        const canAfford =
          !cost.isMax &&
          this.engine.state.gold >= cost.gold &&
          this.engine.state.iron >= cost.iron;

        return `
          <div class="deskrawl-town-plaque" style="left:${scr.x}px; top:${scr.y}px">
            <div class="plaque-title">${anchor.bDef.name.toUpperCase()} <span style="color:#4ade80">Lv.${lv}</span></div>
            <div class="plaque-cost">${cost.isMax ? 'MAX LEVEL' : `${cost.gold.toLocaleString()} 🪙 • ${cost.iron} 💎`}</div>
            <button class="plaque-unlock-btn" data-town-upgrade="${bId}" data-bx="${anchor.worldPos.x}" ${!canAfford || cost.isMax ? 'disabled' : ''}>
              ${cost.isMax ? 'Đã Tối Đa' : 'Nâng Cấp'}
            </button>
          </div>
        `;
      })
      .join('');

    this.overlayEl.innerHTML = plaquesHtml;

    this.overlayEl.querySelectorAll('[data-town-upgrade]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const bId = btn.dataset.townUpgrade;
        const bx = Number(btn.dataset.bx);
        this.townWalkTargetX = bx;
        if (this.engine.upgradeBuilding(bId)) {
          this.spawnGoldPillarBurst(bx);
        }
      });
    });
  }
}
