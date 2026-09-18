// ============================================================
// BREACHLINE V2.4
// Tactical FPS Mission
// ============================================================

const scene = new THREE.Scene();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" })
      .then(registration => registration.update())
      .catch(() => {});
  });
}

scene.background = new THREE.Color(0x1a2420);
scene.fog = new THREE.FogExp2(0x1a2420, 0.015);

// ------------------------------------------------------------
// CAMERA
// ------------------------------------------------------------

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.05,
  250
);

camera.position.set(0, 1.7, 48);
camera.rotation.order = "YXZ";

// ------------------------------------------------------------
// RENDERER
// ------------------------------------------------------------

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6;

document.getElementById("game").appendChild(renderer.domElement);

// ============================================================
// TACTICAL UI
// ============================================================

const tacticalStyle = document.createElement("style");

tacticalStyle.textContent = `
* {
  font-family: 'Trebuchet MS', Arial, sans-serif !important;
}

body {
  background: #050807 !important;
  overflow: hidden;
}

#message {
  background: rgba(4,10,8,.94) !important;
  border: 1px solid rgba(92,255,180,.35) !important;
  box-shadow:
    0 0 40px rgba(0,0,0,.8),
    inset 0 0 35px rgba(30,255,150,.035) !important;
  color: #e8fff4 !important;
}

#message .title {
  color: #dffff0 !important;
  text-shadow: 0 0 18px rgba(70,255,170,.25);
}

#message small {
  color: #739083 !important;
}

#crosshair {
  color: #9effd0 !important;
  text-shadow: 0 0 7px #000, 0 0 8px rgba(80,255,170,.5) !important;
  transition: transform .08s, opacity .08s;
}

#hud {
  font-family: 'Courier New', monospace !important;
}

#ammo {
  color: #dfffee !important;
  text-shadow: 0 0 12px rgba(70,255,170,.2);
}

.weapon {
  color: #6d8c7e !important;
}

#healthFill {
  background: #52e39b !important;
  box-shadow: 0 0 8px rgba(82,227,155,.35);
}

#healthText {
  color: #dffff0 !important;
}

#shieldHUD {
  position: absolute;
  bottom: 24px;
  left: 24px;
  z-index: 21;
  width: 220px;
  font-family: 'Courier New', monospace !important;
  pointer-events: none;
}

.shield-label {
  font-size: 10px;
  letter-spacing: 3px;
  color: #7fd4ff;
  margin-bottom: 4px;
  text-shadow: 0 0 8px rgba(90,200,255,.4);
}

.shield-bar {
  width: 100%;
  height: 8px;
  background: rgba(10,20,25,.6);
  border: 1px solid rgba(120,210,255,.35);
  overflow: hidden;
}

#shieldFillBar {
  height: 100%;
  width: 0%;
  background: #4fc3ff;
  box-shadow: 0 0 10px rgba(79,195,255,.6);
  transition: width .15s;
}

#missionHUD {
  position: absolute;
  top: 28px;
  left: 24px;
  z-index: 20;
  pointer-events: none;
  width: min(320px, calc(100vw - 48px));
  font-family: 'Courier New', monospace !important;
}

.mission-header {
  color: #65e6a2;
  font-size: 11px;
  letter-spacing: 3px;
  margin-bottom: 8px;
}

.mission-box {
  background: rgba(4,10,8,.70);
  border-left: 2px solid #3dd98c;
  padding: 12px 14px;
  box-shadow: 0 0 18px rgba(0,0,0,.25);
}

.mission-title {
  font-size: 12px;
  color: #d9fff0;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.mission-brief {
  color: #9ab5a9;
  font-size: 11px;
  line-height: 1.45;
  letter-spacing: .4px;
  margin-bottom: 12px;
}

.objective {
  font-size: 11px;
  margin: 6px 0;
  letter-spacing: 1px;
  color: #76958a;
  transition: color .2s, opacity .2s;
}

.objective.active {
  color: #75f5b2;
}

.objective.complete {
  color: #4bb67d;
  text-decoration: line-through;
}

#interaction {
  position: absolute;
  left: 50%;
  bottom: 25%;
  transform: translateX(-50%);
  z-index: 30;
  color: #dffff0;
  background: rgba(4,10,8,.85);
  border: 1px solid rgba(80,240,160,.35);
  padding: 9px 16px;
  letter-spacing: 2px;
  font-size: 12px;
  display: none;
  pointer-events: none;
  box-shadow: 0 0 18px rgba(0,0,0,.35);
}

#missionMessage {
  position: absolute;
  left: 50%;
  top: 25%;
  transform: translateX(-50%);
  z-index: 40;
  color: #dffff0;
  text-align: center;
  background: rgba(4,10,8,.90);
  border: 1px solid rgba(80,240,160,.35);
  padding: 12px 25px;
  letter-spacing: 3px;
  font-size: 13px;
  opacity: 0;
  pointer-events: none;
  transition: opacity .2s;
  box-shadow: 0 0 25px rgba(0,0,0,.5);
}

#scopeOverlay {
  position: absolute;
  inset: 0;
  z-index: 25;
  pointer-events: none;
  display: none;
  background:
    radial-gradient(
      circle 250px at center,
      transparent 0,
      transparent 235px,
      rgba(0,0,0,.20) 240px,
      rgba(0,0,0,.60) 260px,
      rgba(0,0,0,.88) 270px
    );
}

#scopeOverlay::before {
  content: "";
  position: absolute;
  width: 420px;
  height: 420px;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  border: 2px solid rgba(170,255,215,.35);
  border-radius: 50%;
  box-shadow:
    0 0 10px rgba(0,0,0,.35),
    inset 0 0 15px rgba(0,0,0,.25);
}

#scopeOverlay::after {
  content: "+";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  color: rgba(180,255,220,.75);
  font-family: monospace !important;
  font-size: 22px;
  text-shadow: 0 0 5px #000;
}

#winScreen,
#loseScreen {
  position: absolute;
  inset: 0;
  z-index: 100;
  display: none;
  align-items: center;
  justify-content: center;
  background: rgba(2,6,5,.94);
  text-align: center;
}

.final-box {
  border: 1px solid rgba(90,255,170,.4);
  padding: 45px 65px;
  background: rgba(5,13,10,.9);
  box-shadow: 0 0 60px rgba(0,0,0,.8);
}

.final-title {
  font-size: 46px;
  font-weight: 700;
  letter-spacing: 8px;
  color: #cffff0;
  margin-bottom: 12px;
}

.final-sub {
  color: #67c997;
  letter-spacing: 3px;
  font-size: 13px;
}

.cache-label {
  position: absolute;
  color: #71e7ff;
  font-family: 'Courier New', monospace !important;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 2px;
  pointer-events: none;
  display: none;
  transform: translate(-50%,-50%);
  text-shadow: 0 0 7px #000;
}

#damage {
  position: absolute;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  opacity: 0;
  transition: opacity .08s;
  background:
    radial-gradient(
      ellipse at center,
      transparent 40%,
      rgba(200,20,20,.55) 100%
    );
}

.low-health {
  animation: healthPulse .8s infinite alternate;
}

@keyframes healthPulse {
  from { opacity: .65; }
  to { opacity: 1; }
}

#game::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(255,255,255,.012),
      rgba(255,255,255,.012) 1px,
      transparent 1px,
      transparent 4px
    );
  opacity: .18;
}
`;

document.head.appendChild(tacticalStyle);

// ============================================================
// EXTRA UI
// ============================================================

const missionHUD = document.createElement("div");
missionHUD.id = "missionHUD";

missionHUD.innerHTML = `
  <div class="mission-header">BREACHLINE // OPERATION 01</div>
  <div class="mission-box">
    <div class="mission-title">MISSION: CUT THE FACILITY OFFLINE</div>
    <div class="mission-brief">The district is controlled by a rogue defense system. Restore power, steal the security keycard, shut the system down, then reach extraction.</div>
    <div id="obj1" class="objective active">01 // REACH DISTRICT: FIND THE POWER NODES</div>
    <div id="obj2" class="objective">02 // RESTORE 3 POWER NODES [0/3]</div>
    <div id="obj3" class="objective">03 // TAKE THE SECURITY KEYCARD</div>
    <div id="obj4" class="objective">04 // ENTER THE CENTRAL FACILITY</div>
    <div id="obj5" class="objective">05 // SHUT DOWN THE ROGUE SYSTEM</div>
    <div id="obj6" class="objective">06 // REACH EXTRACTION</div>
  </div>
`;

document.getElementById("game").appendChild(missionHUD);

const interaction = document.createElement("div");
interaction.id = "interaction";
document.getElementById("game").appendChild(interaction);

const missionMessage = document.createElement("div");
missionMessage.id = "missionMessage";
document.getElementById("game").appendChild(missionMessage);

const scopeOverlay = document.createElement("div");
scopeOverlay.id = "scopeOverlay";
document.getElementById("game").appendChild(scopeOverlay);

const damageOverlay = document.createElement("div");
damageOverlay.id = "damage";
document.getElementById("game").appendChild(damageOverlay);

const shieldHUD = document.createElement("div");
shieldHUD.id = "shieldHUD";
shieldHUD.innerHTML = `
  <div class="shield-label">SHIELD</div>
  <div class="shield-bar"><div id="shieldFillBar"></div></div>
`;
document.getElementById("game").appendChild(shieldHUD);

const winScreen = document.createElement("div");
winScreen.id = "winScreen";

winScreen.innerHTML = `
  <div class="final-box">
    <div class="final-title">MISSION COMPLETE</div>
    <div class="final-sub">BREACHLINE // OBJECTIVE ACCOMPLISHED</div>
  </div>
`;

document.getElementById("game").appendChild(winScreen);

const loseScreen = document.createElement("div");
loseScreen.id = "loseScreen";

loseScreen.innerHTML = `
  <div class="final-box">
    <div class="final-title">MISSION FAILED</div>
    <div class="final-sub">OPERATOR DOWN // RESTART TO DEPLOY</div>
  </div>
`;

document.getElementById("game").appendChild(loseScreen);

// ============================================================
// LIGHTING
// ============================================================

const ambient = new THREE.HemisphereLight(0x9fc7b5, 0x2a332e, 2.2);
scene.add(ambient);

const fillLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(fillLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 3);
mainLight.position.set(10, 18, 4);
mainLight.castShadow = true;
mainLight.shadow.mapSize.set(2048, 2048);
mainLight.shadow.camera.left = -70;
mainLight.shadow.camera.right = 70;
mainLight.shadow.camera.top = 70;
mainLight.shadow.camera.bottom = -70;
scene.add(mainLight);

const sunLight = new THREE.DirectionalLight(0xffe2ad, 2.4);
sunLight.position.set(-35, 42, 28);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.left = -70;
sunLight.shadow.camera.right = 70;
sunLight.shadow.camera.top = 70;
sunLight.shadow.camera.bottom = -70;
scene.add(sunLight);

// ============================================================
// MATERIALS
// ============================================================

const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x3a433f, roughness: .95, metalness: .05 });
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x565f5a, roughness: .82, metalness: .05 });
const darkWallMaterial = new THREE.MeshStandardMaterial({ color: 0x3c4642, roughness: .9, metalness: .05 });
const concreteMaterial = new THREE.MeshStandardMaterial({ color: 0x646e69, roughness: .9 });
const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x3e4844, roughness: .35, metalness: .8 });
const crateMaterial = new THREE.MeshStandardMaterial({ color: 0x687870, roughness: .8 });
const redMaterial = new THREE.MeshStandardMaterial({ color: 0x772727, roughness: .7 });
const greenMaterial = new THREE.MeshStandardMaterial({ color: 0x3c7055, roughness: .75 });
const blueMaterial = new THREE.MeshStandardMaterial({ color: 0x247b9b, roughness: .5, metalness: .2 });
const dirtMaterial = new THREE.MeshStandardMaterial({ color: 0x6b4b32, roughness: 1 });
const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x54783d, roughness: .95 });

// ============================================================
// LEVEL / COLLISION
// ============================================================

const colliders = [];

function createBox(x, y, z, sx, sy, sz, material, solid = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  if (solid) {
    colliders.push({
      mesh,
      minX: x - sx / 2,
      maxX: x + sx / 2,
      minZ: z - sz / 2,
      maxZ: z + sz / 2,
      minY: y - sy / 2,
      maxY: y + sy / 2
    });
  }

  return mesh;
}

// Ground
createBox(0, -.15, 0, 120, .3, 120, floorMaterial, false);

// Outer walls
createBox(0, 3, -59, 120, 6, 1, wallMaterial);
createBox(0, 3, 59, 120, 6, 1, wallMaterial);
createBox(-59, 3, 0, 1, 6, 120, wallMaterial);
createBox(59, 3, 0, 1, 6, 120, wallMaterial);

// Main road
const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x171c1a, roughness: 1 });
createBox(0, .01, 0, 14, .04, 118, roadMaterial, false);

// Road markings
const markingMaterial = new THREE.MeshBasicMaterial({ color: 0x8b9d91 });
for (let z = -52; z < 55; z += 8) {
  const marking = createBox(0, .035, z, .25, .02, 3.5, markingMaterial, false);
  marking.castShadow = false;
}

// Buildings
createBox(-35, 5, -32, 34, 10, 30, concreteMaterial);
createBox(-35, 10.5, -32, 36, 1, 32, darkWallMaterial);
createBox(-45, 4, -16, 14, 8, 1, wallMaterial);
createBox(-25, 4, -16, 14, 8, 1, wallMaterial);
createBox(36, 5, -27, 30, 10, 28, concreteMaterial);
createBox(36, 10.5, -27, 32, 1, 30, darkWallMaterial);
createBox(-34, 4, 31, 28, 8, 26, darkWallMaterial);
createBox(34, 4, 34, 30, 8, 25, wallMaterial);

// Central facility
createBox(0, 5, -37, 28, 10, 18, concreteMaterial);
createBox(0, 10.5, -37, 30, 1, 20, darkWallMaterial);

// Facility entrance frame
createBox(-8, 3, -27.7, 4, 6, 1, metalMaterial);
createBox(8, 3, -27.7, 4, 6, 1, metalMaterial);
createBox(0, 6.5, -27.7, 20, 1, 1, metalMaterial);

// ============================================================
// COVER / CONTAINERS
// ============================================================

function createContainer(x, z, rotation = 0) {
  const container = createBox(x, 2, z, 10, 4, 3, metalMaterial);
  container.rotation.y = rotation;

  const halfW = 6.5;
  const halfD = 6.5;

  colliders.push({
    mesh: container,
    minX: x - halfW,
    maxX: x + halfW,
    minZ: z - halfD,
    maxZ: z + halfD,
    minY: 0,
    maxY: 4
  });

  return container;
}

createContainer(-20, -4, 0);
createContainer(20, 8, Math.PI / 2);
createContainer(-20, 20, Math.PI / 2);
createContainer(20, 28, 0);

for (let i = 0; i < 10; i++) {
  const x = -48 + (i % 5) * 3;
  const z = 8 + Math.floor(i / 5) * 3;
  createBox(x, .8, z, 2.2, 1.6, 2.2, crateMaterial);
}

// ============================================================
// NATURE
// ============================================================

const barkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3527, roughness: .95 });
const leafMaterialA = new THREE.MeshStandardMaterial({ color: 0x3f6b3a, roughness: .85 });
const leafMaterialB = new THREE.MeshStandardMaterial({ color: 0x4f7d45, roughness: .85 });
const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x466b3f, roughness: .9 });
const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x767b76, roughness: .95 });

function createTree(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const trunkHeight = 3 + Math.random() * 1.5;

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(.22, .32, trunkHeight, 7),
    barkMaterial
  );
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  const leafMat = Math.random() > .5 ? leafMaterialA : leafMaterialB;

  for (let i = 0; i < 3; i++) {
    const size = 2.4 - i * .55;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(size, 2.1, 8), leafMat);
    cone.position.y = trunkHeight - .3 + i * 1.3;
    cone.castShadow = true;
    cone.receiveShadow = true;
    group.add(cone);
  }

  scene.add(group);

  colliders.push({
    mesh: group,
    minX: x - .35,
    maxX: x + .35,
    minZ: z - .35,
    maxZ: z + .35,
    minY: 0,
    maxY: trunkHeight
  });
}

function createBush(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const clumps = 3 + Math.floor(Math.random() * 2);

  for (let i = 0; i < clumps; i++) {
    const radius = .5 + Math.random() * .35;
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 8, 6), bushMaterial);
    sphere.position.set(
      (Math.random() - .5) * .8,
      radius * .7,
      (Math.random() - .5) * .8
    );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    group.add(sphere);
  }

  scene.add(group);
}

function createRock(x, z) {
  const scale = .4 + Math.random() * .5;
  const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(scale, 0), rockMaterial);
  rock.position.set(x, scale * .4, z);
  rock.rotation.set(Math.random(), Math.random(), Math.random());
  rock.castShadow = true;
  rock.receiveShadow = true;
  scene.add(rock);
}

function createDirtPatch(x, z, radius, scaleZ) {
  const patch = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 16),
    dirtMaterial
  );
  patch.rotation.x = -Math.PI / 2;
  patch.scale.y = scaleZ;
  patch.position.set(x, .022, z);
  patch.receiveShadow = true;
  scene.add(patch);
}

function createGrassTuft(x, z) {
  const tuft = new THREE.Group();
  tuft.position.set(x, 0, z);

  for (let i = 0; i < 5; i++) {
    const blade = new THREE.Mesh(
      new THREE.ConeGeometry(.085, .65 + Math.random() * .35, 4),
      grassMaterial
    );
    blade.position.set((Math.random() - .5) * .55, .35, (Math.random() - .5) * .55);
    blade.rotation.z = (Math.random() - .5) * .35;
    tuft.add(blade);
  }

  scene.add(tuft);
}

function scatterGroundDetails() {
  for (let i = 0; i < 18; i++) {
    const x = (Math.random() - .5) * 104;
    const z = (Math.random() - .5) * 104;

    if (Math.abs(x) < 9 || positionBlocked(x, z, 2)) continue;
    createDirtPatch(x, z, 3 + Math.random() * 4, .6 + Math.random() * .45);
  }

  for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - .5) * 108;
    const z = (Math.random() - .5) * 108;

    if (Math.abs(x) < 9 || positionBlocked(x, z, .35)) continue;
    createGrassTuft(x, z);
  }
}

function scatterNature() {
  let placed = 0;
  let attempts = 0;

  while (placed < 55 && attempts < 400) {
    attempts++;

    const x = (Math.random() - .5) * 108;
    const z = (Math.random() - .5) * 108;

    if (Math.abs(x) < 9) continue;
    if (positionBlocked(x, z, 3)) continue;

    const roll = Math.random();

    if (roll < 0.55) {
      createTree(x, z);
    } else if (roll < 0.85) {
      createBush(x, z);
    } else {
      createRock(x, z);
    }

    placed++;
  }
}

scatterNature();
scatterGroundDetails();

// ============================================================
// COLLISION
// ============================================================

function positionBlocked(x, z, radius = .45) {
  if (x < -56 || x > 56 || z < -56 || z > 56) {
    return true;
  }

  for (const c of colliders) {
    if (
      x + radius > c.minX &&
      x - radius < c.maxX &&
      z + radius > c.minZ &&
      z - radius < c.maxZ
    ) {
      return true;
    }
  }

  return false;
}

function moveWithCollision(position, dx, dz, radius = .45) {
  const nextX = position.x + dx;
  if (!positionBlocked(nextX, position.z, radius)) {
    position.x = nextX;
  }

  const nextZ = position.z + dz;
  if (!positionBlocked(position.x, nextZ, radius)) {
    position.z = nextZ;
  }
}

// ============================================================
// PLAYER
// ============================================================

const player = {
  position: new THREE.Vector3(0, 1.7, 48),
  velocity: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  speed: 5,
  sprintSpeed: 8,
  health: 100,
  ammo: 30,
  reserve: 90,
  shield: 0,
  shieldMax: 50,
  grounded: true,
  aiming: false,
  alive: true
};

camera.position.copy(player.position);

// ============================================================
// WEAPON
// ============================================================

const weapon = new THREE.Group();
camera.add(weapon);
scene.add(camera);

const rifleGroup = new THREE.Group();
rifleGroup.position.set(.35, -.3, -.72);
rifleGroup.rotation.y = -.025;
weapon.add(rifleGroup);

const rifleBlackMaterial = new THREE.MeshStandardMaterial({
  color: 0x111817,
  roughness: .42,
  metalness: .72
});
const rifleFurnitureMaterial = new THREE.MeshStandardMaterial({
  color: 0x3d4a3b,
  roughness: .78,
  metalness: .08
});
const rifleRubberMaterial = new THREE.MeshStandardMaterial({
  color: 0x171b19,
  roughness: .95,
  metalness: 0
});
const rifleGlassMaterial = new THREE.MeshStandardMaterial({
  color: 0x6ee6c1,
  emissive: 0x164f43,
  emissiveIntensity: .8,
  roughness: .12,
  metalness: .35,
  transparent: true,
  opacity: .82
});
const rifleAccentMaterial = new THREE.MeshStandardMaterial({
  color: 0xc18a42,
  roughness: .35,
  metalness: .7
});

const rifleReceiver = new THREE.Mesh(
  new THREE.BoxGeometry(.3, .24, .62),
  rifleBlackMaterial
);
rifleReceiver.position.z = 0;
rifleGroup.add(rifleReceiver);

const rifleUpper = new THREE.Mesh(
  new THREE.BoxGeometry(.27, .11, .52),
  rifleBlackMaterial
);
rifleUpper.position.set(0, .14, -.03);
rifleGroup.add(rifleUpper);

const handguard = new THREE.Mesh(
  new THREE.BoxGeometry(.28, .22, .7),
  rifleFurnitureMaterial
);
handguard.position.set(0, -.01, -.62);
rifleGroup.add(handguard);

const handguardRail = new THREE.Mesh(
  new THREE.BoxGeometry(.14, .045, .62),
  rifleBlackMaterial
);
handguardRail.position.set(0, .115, -.62);
rifleGroup.add(handguardRail);

const rifleBarrel = new THREE.Mesh(
  new THREE.CylinderGeometry(.045, .055, .7, 12),
  rifleBlackMaterial
);
rifleBarrel.rotation.x = Math.PI / 2;
rifleBarrel.position.set(0, -.01, -1.2);
rifleGroup.add(rifleBarrel);

const muzzleBrake = new THREE.Mesh(
  new THREE.CylinderGeometry(.07, .055, .14, 12),
  rifleBlackMaterial
);
muzzleBrake.rotation.x = Math.PI / 2;
muzzleBrake.position.set(0, -.01, -1.58);
rifleGroup.add(muzzleBrake);

const magazine = new THREE.Mesh(
  new THREE.BoxGeometry(.16, .42, .24),
  rifleFurnitureMaterial
);
magazine.position.set(0, -.34, .12);
magazine.rotation.x = -.16;
rifleGroup.add(magazine);

const pistolGrip = new THREE.Mesh(
  new THREE.BoxGeometry(.14, .34, .16),
  rifleRubberMaterial
);
pistolGrip.position.set(0, -.38, -.08);
pistolGrip.rotation.x = -.18;
rifleGroup.add(pistolGrip);

const rifleStock = new THREE.Mesh(
  new THREE.BoxGeometry(.2, .2, .5),
  rifleFurnitureMaterial
);
rifleStock.position.set(0, -.03, .53);
rifleGroup.add(rifleStock);

const stockPad = new THREE.Mesh(
  new THREE.BoxGeometry(.22, .22, .06),
  rifleRubberMaterial
);
stockPad.position.set(0, -.03, .8);
rifleGroup.add(stockPad);

const opticMount = new THREE.Mesh(
  new THREE.BoxGeometry(.12, .08, .23),
  rifleBlackMaterial
);
opticMount.position.set(0, .23, -.02);
rifleGroup.add(opticMount);

const optic = new THREE.Mesh(
  new THREE.CylinderGeometry(.075, .075, .23, 12),
  rifleBlackMaterial
);
optic.rotation.x = Math.PI / 2;
optic.position.set(0, .3, -.04);
rifleGroup.add(optic);

const opticGlass = new THREE.Mesh(
  new THREE.CylinderGeometry(.052, .052, .012, 16),
  rifleGlassMaterial
);
opticGlass.rotation.x = Math.PI / 2;
opticGlass.position.set(0, .3, -.16);
rifleGroup.add(opticGlass);

const ejectionPort = new THREE.Mesh(
  new THREE.BoxGeometry(.012, .095, .2),
  rifleAccentMaterial
);
ejectionPort.position.set(.157, .02, -.04);
rifleGroup.add(ejectionPort);

const chargingHandle = new THREE.Mesh(
  new THREE.BoxGeometry(.035, .05, .16),
  rifleBlackMaterial
);
chargingHandle.position.set(-.16, .1, -.12);
rifleGroup.add(chargingHandle);

const triggerGuard = new THREE.Mesh(
  new THREE.TorusGeometry(.095, .018, 6, 12, Math.PI),
  rifleBlackMaterial
);
triggerGuard.rotation.x = Math.PI / 2;
triggerGuard.position.set(0, -.28, -.07);
rifleGroup.add(triggerGuard);

const trigger = new THREE.Mesh(
  new THREE.BoxGeometry(.025, .1, .025),
  rifleAccentMaterial
);
trigger.position.set(0, -.28, -.07);
trigger.rotation.x = -.2;
rifleGroup.add(trigger);

for (const side of [-1, 1]) {
  const sideRail = new THREE.Mesh(
    new THREE.BoxGeometry(.035, .07, .5),
    rifleBlackMaterial
  );
  sideRail.position.set(side * .15, -.01, -.62);
  rifleGroup.add(sideRail);

  for (let tooth = 0; tooth < 5; tooth++) {
    const railTooth = new THREE.Mesh(
      new THREE.BoxGeometry(.045, .045, .045),
      rifleAccentMaterial
    );
    railTooth.position.set(side * .17, .05, -.42 - tooth * .095);
    rifleGroup.add(railTooth);
  }
}

const slingMount = new THREE.Mesh(
  new THREE.TorusGeometry(.055, .012, 6, 10),
  rifleAccentMaterial
);
slingMount.rotation.y = Math.PI / 2;
slingMount.position.set(0, -.08, .77);
rifleGroup.add(slingMount);

const frontSight = new THREE.Mesh(
  new THREE.BoxGeometry(.035, .13, .035),
  rifleAccentMaterial
);
frontSight.position.set(0, .16, -1.03);
rifleGroup.add(frontSight);

// ============================================================
// INPUT
// ============================================================

const keys = {};

document.addEventListener("keydown", event => {
  keys[event.code] = true;

  if (event.code === "KeyR") {
    reload();
  }

  if (event.code === "KeyE") {
    interact();
  }
});

document.addEventListener("keyup", event => {
  keys[event.code] = false;
});

// ============================================================
// POINTER LOCK
// ============================================================

const message = document.getElementById("message");
const downloadPassword = "EMILIONICK2026";
const passwordInput = document.getElementById("downloadPassword");
const unlockDownloads = document.getElementById("unlockDownloads");
const downloadLinks = document.getElementById("downloadLinks");
const downloadError = document.getElementById("downloadError");
const downloadSite = document.getElementById("downloadSite");

unlockDownloads.addEventListener("click", event => {
  event.stopPropagation();

  if (passwordInput.value === downloadPassword) {
    downloadLinks.hidden = false;
    downloadError.textContent = "DOWNLOADS UNLOCKED";
    downloadError.style.color = "#75f5b2";
    passwordInput.disabled = true;
    unlockDownloads.disabled = true;
  } else {
    downloadError.textContent = "INCORRECT PASSWORD";
    passwordInput.value = "";
    passwordInput.focus();
  }
});

downloadSite.addEventListener("click", async event => {
  event.stopPropagation();
  downloadError.textContent = "BUILDING STANDALONE SITE...";

  try {
    const [htmlResponse, cssResponse, gameResponse, threeResponse] = await Promise.all([
      fetch("index.html"),
      fetch("style.css"),
      fetch("Game.js"),
      fetch("lib/three.min.js")
    ]);

    if (![htmlResponse, cssResponse, gameResponse, threeResponse].every(response => response.ok)) {
      throw new Error("Site files could not be read");
    }

    const html = await htmlResponse.text();
    const css = await cssResponse.text();
    const game = await gameResponse.text();
    const three = await threeResponse.text();
    const standalone = html
      .replace(/\s*<link rel="stylesheet" href="style\.css">/, `<style>${css}</style>`)
      .replace(/\s*<script defer src="lib\/three\.min\.js"><\/script>/, `<script defer>${three}<\/script>`)
      .replace(/\s*<script defer src="Game\.js"><\/script>/, `<script defer>${game}<\/script>`);

    const blob = new Blob([standalone], { type: "text/html" });

    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({
        suggestedName: "BREACHLINE-GAME.html",
        types: [{ description: "BREACHLINE game", accept: { "text/html": [".html"] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      downloadError.textContent = "GAME SAVED // OPEN BREACHLINE-GAME.HTML";
    } else {
      const url = URL.createObjectURL(blob);
      const download = document.createElement("a");
      download.href = url;
      download.download = "BREACHLINE-GAME.html";
      download.style.display = "none";
      document.body.appendChild(download);
      download.click();
      download.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      downloadError.textContent = "GAME DOWNLOADED // OPEN BREACHLINE-GAME.HTML";
    }
  } catch (error) {
    downloadError.textContent = "SITE DOWNLOAD FAILED // USE THE LOCAL SERVER";
  }
});

message.addEventListener("click", event => {
  event.stopPropagation();

  if (event.target.closest("#downloads")) return;

  if (!player.alive) {
    location.reload();
    return;
  }

  renderer.domElement.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === renderer.domElement) {
    message.style.display = "none";
  } else if (player.alive) {
    message.style.display = "block";
  }
});

document.addEventListener("mousemove", event => {
  if (document.pointerLockElement !== renderer.domElement) {
    return;
  }

  player.yaw -= event.movementX * .002;
  player.pitch -= event.movementY * .002;

  const limit = Math.PI / 2 - .05;
  player.pitch = THREE.MathUtils.clamp(player.pitch, -limit, limit);
});

// ============================================================
// SHOOTING
// ============================================================

let shooting = false;
let lastShot = 0;

renderer.domElement.addEventListener("mousedown", event => {
  if (document.pointerLockElement !== renderer.domElement) {
    renderer.domElement.requestPointerLock();
    return;
  }

  if (event.button === 0) {
    shooting = true;
    shoot();
  }

  if (event.button === 2) {
    player.aiming = true;
  }
});

document.addEventListener("mouseup", event => {
  if (event.button === 0) {
    shooting = false;
  }

  if (event.button === 2) {
    player.aiming = false;
  }
});

document.addEventListener("contextmenu", event => {
  event.preventDefault();
});

// ============================================================
// SHOOT
// ============================================================

function shoot() {
  if (!player.alive) return;

  const now = performance.now();
  if (now - lastShot < 125) {
    return;
  }

  if (player.ammo <= 0) {
    reload();
    return;
  }

  lastShot = now;
  player.ammo--;
  updateHUD();

  player.pitch += player.aiming ? .009 : .026;

  const raycaster = new THREE.Raycaster();
  const aimX = 0;
  const aimY = 0;

  const spread = player.aiming ? .0015 : .006;
  raycaster.setFromCamera(
    new THREE.Vector2(aimX + (Math.random() - .5) * spread, aimY + (Math.random() - .5) * spread),
    camera
  );

  const enemyMeshes = [];
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    for (const mesh of enemy.meshes) {
      enemyMeshes.push(mesh);
    }
  }

  const hits = raycaster.intersectObjects(enemyMeshes, true);

  if (hits.length > 0) {
    let hitEnemy = null;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      if (
        enemy.meshes.includes(hits[0].object) ||
        hits[0].object.parent === enemy.group
      ) {
        hitEnemy = enemy;
        break;
      }
    }

    if (hitEnemy) {
      hitEnemy.health--;
      hitEnemy.hitFlash = .08;

      if (hitEnemy.health <= 0) {
        killEnemy(hitEnemy);
      }
    }
  }

  muzzleFlash();

  weapon.position.z = 0.14;
  weapon.position.y = -0.035;
  setTimeout(() => {
    weapon.position.z = 0;
    weapon.position.y = 0;
  }, 70);
}

// ============================================================
// MUZZLE FLASH
// ============================================================

function muzzleFlash() {
  const flash = new THREE.Mesh(
    new THREE.SphereGeometry(.1, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffc766 })
  );

  flash.position.set(.35, -.29, -1.68);
  weapon.add(flash);

  const flashLight = new THREE.PointLight(0xffb347, 2.5, 3);
  flashLight.position.copy(flash.position);
  weapon.add(flashLight);

  setTimeout(() => {
    weapon.remove(flash);
    weapon.remove(flashLight);
    flash.geometry.dispose();
    flash.material.dispose();
  }, 35);
}

// ============================================================
// RELOAD
// ============================================================

function reload() {
  if (player.ammo >= 30 || player.reserve <= 0) {
    return;
  }

  const needed = 30 - player.ammo;
  const amount = Math.min(needed, player.reserve);

  player.ammo += amount;
  player.reserve -= amount;

  updateHUD();
}

// ============================================================
// MOVEMENT
// ============================================================

const clock = new THREE.Clock();

function updatePlayer(delta) {
  if (!player.alive) return;

  const direction = new THREE.Vector3();

  if (keys["KeyW"]) direction.z -= 1;
  if (keys["KeyS"]) direction.z += 1;
  if (keys["KeyA"]) direction.x -= 1;
  if (keys["KeyD"]) direction.x += 1;

  if (direction.lengthSq() > 0) {
    direction.normalize();
  }

  const speed = (keys["ShiftLeft"] || keys["ShiftRight"]) ? player.sprintSpeed : player.speed;

  direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw);

  moveWithCollision(
    player.position,
    direction.x * speed * delta,
    direction.z * speed * delta,
    .55
  );

  if (keys["Space"] && player.grounded) {
    player.velocity.y = 6;
    player.grounded = false;
  }

  player.velocity.y -= 18 * delta;
  player.position.y += player.velocity.y * delta;

  if (player.position.y <= 1.7) {
    player.position.y = 1.7;
    player.velocity.y = 0;
    player.grounded = true;
  }

  camera.position.copy(player.position);
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;

  if (direction.lengthSq() > 0) {
    weapon.position.x = Math.sin(performance.now() * .012) * .008;
    weapon.position.y = Math.abs(Math.cos(performance.now() * .012)) * .008;
  } else {
    weapon.position.x = 0;
    weapon.position.y = 0;
  }
}

// ============================================================
// ADS
// ============================================================

function updateADS(delta) {
  const targetFOV = player.aiming ? 72 : 75;

  camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 1 - Math.pow(.001, delta));
  camera.updateProjectionMatrix();

  scopeOverlay.style.display = player.aiming ? "block" : "none";

  if (player.aiming) {
    weapon.position.x = THREE.MathUtils.lerp(weapon.position.x, .05, .15);
    weapon.position.y = THREE.MathUtils.lerp(weapon.position.y, -.08, .15);
  } else {
    weapon.position.x = THREE.MathUtils.lerp(weapon.position.x, 0, .12);
    weapon.position.y = THREE.MathUtils.lerp(weapon.position.y, 0, .12);
  }
}

// ============================================================
// HUD
// ============================================================

function updateHUD() {
  document.getElementById("ammo").innerHTML =
    `<span style="font-size:11px;letter-spacing:3px;color:#6f9383;">AMMO</span><br>${player.ammo} / ${player.reserve}`;

  document.getElementById("healthText").textContent = Math.max(0, Math.ceil(player.health));
  document.getElementById("healthFill").style.width = `${Math.max(0, player.health)}%`;

  const shieldPct = Math.max(0, player.shield) / player.shieldMax * 100;
  document.getElementById("shieldFillBar").style.width = `${shieldPct}%`;
}

// ============================================================
// MISSION SYSTEM
// ============================================================

const mission = {
  entered: false,
  power: [false, false, false],
  keycard: false,
  facility: false,
  shutdown: false,
  extraction: false,
  won: false
};

function setObjective(number, state) {
  const element = document.getElementById(`obj${number}`);
  if (!element) return;

  element.classList.remove("active", "complete");

  if (state === "active") {
    element.classList.add("active");
  }

  if (state === "complete") {
    element.classList.add("complete");
  }
}

function missionUpdate() {
  const powerCount = mission.power.filter(Boolean).length;

  document.getElementById("obj2").textContent = `02 // RESTORE POWER [${powerCount}/3]`;

  if (!mission.entered) {
    setObjective(1, "active");
    return;
  }
  setObjective(1, "complete");

  if (powerCount < 3) {
    setObjective(2, "active");
    return;
  }
  setObjective(2, "complete");

  if (!mission.keycard) {
    setObjective(3, "active");
    return;
  }
  setObjective(3, "complete");

  if (!mission.facility) {
    setObjective(4, "active");
    return;
  }
  setObjective(4, "complete");

  if (!mission.shutdown) {
    setObjective(5, "active");
    return;
  }
  setObjective(5, "complete");

  if (!mission.extraction) {
    setObjective(6, "active");
    return;
  }
}

// ============================================================
// MESSAGE
// ============================================================

let messageTimeout;

function showMissionMessage(text) {
  missionMessage.textContent = text;
  missionMessage.style.opacity = "1";

  clearTimeout(messageTimeout);
  messageTimeout = setTimeout(() => {
    missionMessage.style.opacity = "0";
  }, 2500);
}

// ============================================================
// POWER SWITCHES
// ============================================================

const switches = [];

function createPowerSwitch(x, z, index) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(.6, 1.2, .25), metalMaterial);
  boxMesh.position.y = .6;
  group.add(boxMesh);

  const light = new THREE.Mesh(
    new THREE.SphereGeometry(.08, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff4d4d })
  );
  light.position.set(0, .82, -.15);
  group.add(light);

  scene.add(group);

  switches.push({ group, light, index });
}

createPowerSwitch(-13, -8, 0);
createPowerSwitch(14, 17, 1);
createPowerSwitch(-17, 38, 2);

// ============================================================
// KEYCARD
// ============================================================

const keycard = new THREE.Group();
keycard.position.set(0, 1.2, -18);

const cardBody = new THREE.Mesh(new THREE.BoxGeometry(.9, .06, .6), blueMaterial);
keycard.add(cardBody);

const cardLight = new THREE.PointLight(0x44cfff, 2, 5);
cardLight.position.y = .2;
keycard.add(cardLight);

scene.add(keycard);

// ============================================================
// FACILITY TERMINAL
// ============================================================

const terminal = new THREE.Group();
terminal.position.set(0, 0, -45);

const terminalBody = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2, .5), metalMaterial);
terminalBody.position.y = 1;
terminal.add(terminalBody);

const screen = new THREE.Mesh(
  new THREE.BoxGeometry(.75, .45, .04),
  new THREE.MeshBasicMaterial({ color: 0x49d6a0 })
);
screen.position.set(0, 1.35, -.27);
terminal.add(screen);

scene.add(terminal);

// ============================================================
// EXTRACTION ZONE
// ============================================================

const extraction = new THREE.Mesh(
  new THREE.CylinderGeometry(5, 5, .05, 48),
  new THREE.MeshBasicMaterial({ color: 0x49d6a0, transparent: true, opacity: .18 })
);
extraction.position.set(42, .04, 45);
scene.add(extraction);

const extractionRing = new THREE.Mesh(
  new THREE.RingGeometry(4.5, 5, 48),
  new THREE.MeshBasicMaterial({
    color: 0x58ffc0,
    transparent: true,
    opacity: .75,
    side: THREE.DoubleSide
  })
);
extractionRing.rotation.x = -Math.PI / 2;
extractionRing.position.copy(extraction.position);
extractionRing.position.y = .07;
scene.add(extractionRing);

extraction.visible = false;
extractionRing.visible = false;

// ============================================================
// AMMO CACHES
// ============================================================

const ammoCaches = [];

function createAmmoCache(x, z) {
  const cache = new THREE.Group();
  cache.position.set(x, 0, z);

  const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(1.3, .6, .8), crateMaterial);
  boxMesh.position.y = .3;
  cache.add(boxMesh);

  const indicator = new THREE.Mesh(
    new THREE.OctahedronGeometry(.18),
    new THREE.MeshBasicMaterial({ color: 0x62dfff })
  );
  indicator.position.y = 1;
  cache.add(indicator);

  scene.add(cache);

  const label = document.createElement("div");
  label.textContent = "AMMO";
  label.className = "cache-label";
  document.body.appendChild(label);

  cache.userData = { collected: false, label };

  ammoCaches.push(cache);
}

createAmmoCache(-45, 20);
createAmmoCache(28, -5);
createAmmoCache(45, -30);
createAmmoCache(-28, 43);

// ============================================================
// SHIELD PICKUPS
// ============================================================

const shieldPickups = [];

const shieldCoreMaterial = new THREE.MeshStandardMaterial({
  color: 0x4fc3ff,
  emissive: 0x1f7fb0,
  emissiveIntensity: .8,
  roughness: .25,
  metalness: .3,
  transparent: true,
  opacity: .85
});

const shieldRingMaterial = new THREE.MeshBasicMaterial({
  color: 0x9fe6ff,
  transparent: true,
  opacity: .55,
  side: THREE.DoubleSide
});

function createShieldPickup(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 1.1, z);

  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.28, 0), shieldCoreMaterial);
  group.add(core);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(.42, .03, 8, 24), shieldRingMaterial);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  const glow = new THREE.PointLight(0x4fc3ff, 2, 5);
  group.add(glow);

  scene.add(group);

  const label = document.createElement("div");
  label.textContent = "SHIELD";
  label.className = "cache-label";
  label.style.color = "#7fe0ff";
  document.body.appendChild(label);

  const pickup = {
    group,
    core,
    ring,
    label,
    baseY: 1.1,
    collected: false,
    respawnAt: 0
  };

  shieldPickups.push(pickup);
}

createShieldPickup(-30, -20);
createShieldPickup(30, 15);
createShieldPickup(0, 20);
createShieldPickup(-40, 40);
createShieldPickup(40, -45);

function updateShieldPickups(delta) {
  const now = performance.now();

  for (const pickup of shieldPickups) {
    if (pickup.collected) {
      if (now >= pickup.respawnAt) {
        pickup.collected = false;
        pickup.group.visible = true;
      } else {
        continue;
      }
    }

    pickup.group.rotation.y += delta * 1.2;
    pickup.ring.rotation.z += delta * .8;
    pickup.group.position.y = pickup.baseY + Math.sin(now * .002) * .12;

    const distance = player.position.distanceTo(pickup.group.position);

    if (distance < 14) {
      const projected = pickup.group.position.clone();
      projected.y += .6;
      projected.project(camera);

      const x = (projected.x * .5 + .5) * window.innerWidth;
      const y = (-projected.y * .5 + .5) * window.innerHeight;

      pickup.label.style.display = "block";
      pickup.label.style.left = `${x}px`;
      pickup.label.style.top = `${y}px`;
    } else {
      pickup.label.style.display = "none";
    }
  }
}

// ============================================================
// INTERACTION
// ============================================================

let nearbyObject = null;

function getNearestInteractable() {
  let nearest = null;
  let nearestDistance = 3;

  for (const sw of switches) {
    if (mission.power[sw.index]) continue;

    const distance = player.position.distanceTo(sw.group.position);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = { type: "power", object: sw };
    }
  }

  if (!mission.keycard) {
    const distance = player.position.distanceTo(keycard.position);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = { type: "keycard", object: keycard };
    }
  }

  if (mission.keycard && !mission.shutdown) {
    const distance = player.position.distanceTo(terminal.position);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = { type: "terminal", object: terminal };
    }
  }

  for (const cache of ammoCaches) {
    if (cache.userData.collected) continue;

    const distance = player.position.distanceTo(cache.position);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = { type: "ammo", object: cache };
    }
  }

  for (const pickup of shieldPickups) {
    if (pickup.collected) continue;

    const distance = player.position.distanceTo(pickup.group.position);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = { type: "shield", object: pickup };
    }
  }

  return nearest;
}

function interact() {
  if (!player.alive) return;

  const target = getNearestInteractable();
  if (!target) return;

  if (target.type === "power") {
    const sw = target.object;
    mission.power[sw.index] = true;
    sw.light.material.color.setHex(0x55ff9e);
    showMissionMessage(`POWER NODE ${sw.index + 1} ONLINE`);
    missionUpdate();
    return;
  }

  if (target.type === "keycard") {
    mission.keycard = true;
    scene.remove(keycard);
    showMissionMessage("ACCESS KEYCARD ACQUIRED");
    missionUpdate();
    return;
  }

  if (target.type === "terminal") {
    const powerCount = mission.power.filter(Boolean).length;

    if (powerCount < 3) {
      showMissionMessage("SYSTEM OFFLINE // POWER REQUIRED");
      return;
    }

    mission.shutdown = true;
    terminal.remove(screen);
    showMissionMessage("SYSTEM SHUTDOWN COMPLETE");

    extraction.visible = true;
    extractionRing.visible = true;
    mission.extraction = false;

    missionUpdate();
    return;
  }

  if (target.type === "ammo") {
    const cache = target.object;
    cache.userData.collected = true;
    cache.userData.label.style.display = "none";
    scene.remove(cache);

    player.reserve += 60;
    updateHUD();

    showMissionMessage("AMMUNITION CACHE ACQUIRED // +60");
    return;
  }

  if (target.type === "shield") {
    const pickup = target.object;
    pickup.collected = true;
    pickup.group.visible = false;
    pickup.label.style.display = "none";
    pickup.respawnAt = performance.now() + 30000;

    player.shield = player.shieldMax;
    updateHUD();

    showMissionMessage("SHIELD CHARGE ACTIVE");
  }
}

// ============================================================
// ENTER AREA
// ============================================================

function checkEntry() {
  if (!mission.entered && player.position.z < 38) {
    mission.entered = true;
    showMissionMessage("OPERATION ACTIVE // PROCEED TO POWER NODES");
    missionUpdate();
  }
}

// ============================================================
// EXTRACTION
// ============================================================

function checkExtraction() {
  if (!mission.shutdown) return;

  const distance = player.position.distanceTo(extraction.position);

  if (distance < 5) {
    mission.extraction = true;
    missionUpdate();
    winMission();
  }
}

function winMission() {
  if (mission.won) return;

  mission.won = true;
  player.alive = false;

  document.exitPointerLock();
  winScreen.style.display = "flex";
}

// ============================================================
// ENEMIES
// ============================================================

const enemies = [];
const enemySpawnPoints = [
  [-8, 30], [8, 25], [-10, 15], [12, 8],
  [-25, 10], [25, 18], [0, -5]
];
const maxRespawnsPerEnemy = 2;
const respawnDelay = 60;

function createEnemy(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const skinTones = [0x9b765d, 0x8a5e42, 0xc79a72, 0x6e4a34, 0xd9b38f];
  const skinTone = skinTones[Math.floor(Math.random() * skinTones.length)];

  const hairTones = [0x1c1712, 0x3b2a1d, 0x5c4632, 0x0c0a08];
  const hairTone = hairTones[Math.floor(Math.random() * hairTones.length)];

  const skinMaterial = new THREE.MeshStandardMaterial({ color: skinTone, roughness: 0.85 });
  const hairMaterial = new THREE.MeshStandardMaterial({ color: hairTone, roughness: 0.9 });
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x14100c, roughness: .4 });
  const uniformMaterial = new THREE.MeshStandardMaterial({ color: 0x252d29, roughness: 0.9 });
  const armorMaterial = new THREE.MeshStandardMaterial({ color: 0x111514, roughness: 0.8 });
  const helmetMaterial = new THREE.MeshStandardMaterial({ color: 0x141817, roughness: 0.75 });

  const buildScale = .94 + Math.random() * .14;
  group.scale.setScalar(buildScale);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12), skinMaterial);
  head.position.y = 1.82;
  head.scale.set(0.92, 1.05, 0.92);
  group.add(head);

  const eyeGeo = new THREE.SphereGeometry(.025, 6, 6);

  const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
  leftEye.position.set(-.09, 1.85, .21);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
  rightEye.position.set(.09, 1.85, .21);
  group.add(rightEye);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(.255, 14, 10, 0, Math.PI * 2, 0, Math.PI * .55),
    hairMaterial
  );
  hair.position.y = 1.85;
  group.add(hair);

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.29, 16, 10), helmetMaterial);
  helmet.position.y = 1.98;
  helmet.scale.set(1, 0.55, 1);
  group.add(helmet);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.16, 10), skinMaterial);
  neck.position.y = 1.58;
  group.add(neck);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.55, 6, 10), uniformMaterial);
  torso.position.y = 1.18;
  torso.scale.set(0.95, 1, 0.62);
  group.add(torso);

  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.62, 0.35), armorMaterial);
  vest.position.set(0, 1.22, -0.03);
  group.add(vest);

  function makeArm(xPos) {
    const arm = new THREE.Group();

    const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.32, 5, 8), uniformMaterial);
    upperArm.position.y = -0.18;

    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.30, 5, 8), uniformMaterial);
    forearm.position.y = -0.52;

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), skinMaterial);
    hand.position.y = -0.73;

    arm.add(upperArm, forearm, hand);
    arm.position.set(xPos, 1.52, -0.02);
    group.add(arm);

    return arm;
  }

  const leftArm = makeArm(-0.40);
  const rightArm = makeArm(0.40);

  function makeLeg(xPos) {
    const leg = new THREE.Group();

    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.38, 5, 8), uniformMaterial);
    thigh.position.y = -0.23;

    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.10, 0.40, 5, 8), uniformMaterial);
    shin.position.y = -0.65;

    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.16, 0.34), armorMaterial);
    boot.position.set(0, -0.94, -0.04);

    leg.add(thigh, shin, boot);
    leg.position.x = xPos;
    group.add(leg);

    return leg;
  }

  const leftLeg = makeLeg(-0.17);
  const rightLeg = makeLeg(0.17);

  const rifle = new THREE.Group();

  const rifleReceiver = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.13, 0.52), metalMaterial);

  const rifleBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.60, 8), metalMaterial);
  rifleBarrel.rotation.x = Math.PI / 2;
  rifleBarrel.position.z = -0.55;

  const rifleStock = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.28), metalMaterial);
  rifleStock.position.z = 0.37;

  const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.25, 0.13), metalMaterial);
  magazine.position.set(0, -0.16, 0.02);
  magazine.rotation.x = -0.2;

  rifle.add(rifleReceiver, rifleBarrel, rifleStock, magazine);
  rifle.position.set(0.22, 1.38, -0.42);
  rifle.rotation.x = -0.08;
  group.add(rifle);

  scene.add(group);

  const enemy = {
    group,
    meshes: [head, torso, vest, helmet, neck, leftArm, rightArm, leftLeg, rightLeg, rifle],
    skinTone,
    health: 5,
    speed: 1.2 + Math.random() * 0.5,
    detectRange: 32,
    shootRange: 19,
    cooldown: 1 + Math.random() * 1.2,
    shotTimer: Math.random(),
    hitFlash: 0,
    alive: true,
    spawnX: x,
    spawnZ: z,
    respawnsRemaining: maxRespawnsPerEnemy,
    respawnTimer: 0,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg
  };

  enemies.push(enemy);
  return enemy;
}

// ============================================================
// ENEMY SPAWNS
// ============================================================

for (const [x, z] of enemySpawnPoints) {
  createEnemy(x, z);
}

function updateEnemyRespawns(delta) {
  for (const enemy of enemies) {
    if (enemy.alive || enemy.respawnTimer <= 0) continue;

    enemy.respawnTimer -= delta;
    if (enemy.respawnTimer > 0) continue;

    enemy.group.position.set(enemy.spawnX, 0, enemy.spawnZ);
    enemy.health = 5;
    enemy.hitFlash = 0;
    enemy.shotTimer = enemy.cooldown;
    enemy.alive = true;
    scene.add(enemy.group);
    showMissionMessage("REINFORCEMENTS INBOUND // HOSTILES RETURNED");
  }
}

// ============================================================
// ENEMY AI
// ============================================================

function updateEnemies(delta) {
  if (!player.alive) return;

  updateEnemyRespawns(delta);

  for (const enemy of enemies) {
    if (!enemy.alive) continue;

    enemy.shotTimer -= delta;

    const distance = enemy.group.position.distanceTo(player.position);

    if (distance < enemy.detectRange) {
      const direction = new THREE.Vector3().subVectors(player.position, enemy.group.position);
      direction.y = 0;

      if (direction.lengthSq() > 0) {
        direction.normalize();
        enemy.group.rotation.y = Math.atan2(direction.x, direction.z);
      }

      if (distance > enemy.shootRange) {
        const movement = enemy.speed * delta;
        const oldX = enemy.group.position.x;
        const oldZ = enemy.group.position.z;

        moveWithCollision(enemy.group.position, direction.x * movement, direction.z * movement, .45);

        if (
          Math.abs(enemy.group.position.x - oldX) < .001 &&
          Math.abs(enemy.group.position.z - oldZ) < .001
        ) {
          moveWithCollision(enemy.group.position, direction.z * movement, -direction.x * movement, .45);
        }
      } else {
        if (enemy.shotTimer <= 0) {
          enemyShoot(enemy);
          enemy.shotTimer = enemy.cooldown;
        }
      }
    }

    if (enemy.hitFlash > 0) {
      enemy.hitFlash -= delta;

      for (const mesh of enemy.meshes) {
        if (mesh.material && mesh.material.color) {
          mesh.material.color.setHex(0xffffff);
        }
      }
    } else {
      for (const mesh of enemy.meshes) {
        if (mesh.material && mesh.material.color) {
          const current = mesh.material.color;

          if (mesh.geometry.type === "SphereGeometry") {
            current.setHex(enemy.skinTone);
          } else {
            current.setHex(0x252d29);
          }
        }
      }
    }
  }
}

// ============================================================
// ENEMY SHOOTING
// ============================================================

function enemyShoot(enemy) {
  const start = new THREE.Vector3(enemy.group.position.x, 1.4, enemy.group.position.z);
  const target = player.position.clone();
  const direction = new THREE.Vector3().subVectors(target, start);
  const distance = direction.length();

  direction.normalize();

  const raycaster = new THREE.Raycaster(start, direction, 0, distance);
  const blockers = raycaster.intersectObjects(colliders.map(collider => collider.mesh), true);

  if (blockers.length > 0 && blockers[0].distance < distance - .5) {
    return;
  }

  const hitChance = .40 + Math.max(0, 1 - distance / 25) * .20;

  if (Math.random() < hitChance) {
    damagePlayer(7);
  }

  createTracer(enemy.group.position, target);
}

function createTracer(start, end) {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(start.x, 1.4, start.z),
    new THREE.Vector3(end.x, end.y, end.z)
  ]);

  const material = new THREE.LineBasicMaterial({ color: 0xffc766, transparent: true, opacity: .65 });
  const line = new THREE.Line(geometry, material);
  scene.add(line);

  setTimeout(() => {
    scene.remove(line);
    geometry.dispose();
    material.dispose();
  }, 80);
}

// ============================================================
// DAMAGE / DEATH
// ============================================================

function damagePlayer(amount) {
  if (!player.alive) return;

  let remaining = amount;

  if (player.shield > 0) {
    const absorbed = Math.min(player.shield, remaining);
    player.shield -= absorbed;
    remaining -= absorbed;
  }

  if (remaining > 0) {
    player.health -= remaining;
  }

  updateHUD();

  if (remaining > 0) {
    const damage = document.getElementById("damage");
    if (damage) {
      const intensity = Math.min(1, .35 + remaining / 20);
      damage.style.transition = "opacity .03s";
      damage.style.opacity = String(intensity);

      setTimeout(() => {
        damage.style.transition = "opacity .5s";
        damage.style.opacity = "0";
      }, 60);
    }
  } else {
    const shieldFlash = document.getElementById("shieldFillBar");
    if (shieldFlash) {
      shieldFlash.style.boxShadow = "0 0 20px rgba(120,220,255,1)";
      setTimeout(() => {
        shieldFlash.style.boxShadow = "0 0 10px rgba(79,195,255,.6)";
      }, 120);
    }
  }

  if (player.health <= 0) {
    player.health = 0;
    player.alive = false;
    updateHUD();

    document.exitPointerLock();
    loseScreen.style.display = "flex";
  }
}

// ============================================================
// KILL ENEMY
// ============================================================

function killEnemy(enemy) {
  enemy.alive = false;
  scene.remove(enemy.group);

  if (enemy.respawnsRemaining > 0) {
    enemy.respawnsRemaining--;
    enemy.respawnTimer = respawnDelay;
    showMissionMessage(`HOSTILE DOWN // REINFORCEMENTS IN ${respawnDelay}s`);
  }
}

// ============================================================
// AMMO LABELS
// ============================================================

function updateAmmoLabels() {
  for (const cache of ammoCaches) {
    if (cache.userData.collected) continue;

    const distance = player.position.distanceTo(cache.position);

    if (distance < 14) {
      const projected = cache.position.clone();
      projected.y += 1.5;
      projected.project(camera);

      const x = (projected.x * .5 + .5) * window.innerWidth;
      const y = (-projected.y * .5 + .5) * window.innerHeight;

      cache.userData.label.style.display = "block";
      cache.userData.label.style.left = `${x}px`;
      cache.userData.label.style.top = `${y}px`;
    } else {
      cache.userData.label.style.display = "none";
    }

    if (cache.children[1]) {
      cache.children[1].rotation.y += .03;
    }
  }
}

// ============================================================
// INTERACTION UI
// ============================================================

function updateInteraction() {
  nearbyObject = getNearestInteractable();

  if (!nearbyObject) {
    interaction.style.display = "none";
    return;
  }

  interaction.style.display = "block";

  if (nearbyObject.type === "power") {
    interaction.textContent = "[ E ]  ACTIVATE POWER NODE";
  } else if (nearbyObject.type === "keycard") {
    interaction.textContent = "[ E ]  TAKE ACCESS KEYCARD";
  } else if (nearbyObject.type === "terminal") {
    interaction.textContent = "[ E ]  SHUT DOWN SYSTEM";
  } else if (nearbyObject.type === "ammo") {
    interaction.textContent = "[ E ]  COLLECT AMMUNITION";
  } else if (nearbyObject.type === "shield") {
    interaction.textContent = "[ E ]  ACTIVATE SHIELD";
  }
}

// ============================================================
// OBJECTIVE CHECKS
// ============================================================

function updateMission(delta) {
  checkEntry();

  if (mission.shutdown) {
    const distance = player.position.distanceTo(extraction.position);

    if (distance < 15) {
      showMissionMessage("EXTRACTION ZONE // MOVE INTO GREEN AREA");
    }

    checkExtraction();
  }

  missionUpdate();
}

// ============================================================
// ANIMATION
// ============================================================

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), .05);

  updatePlayer(delta);
  updateADS(delta);

  if (shooting) {
    shoot();
  }

  updateEnemies(delta);
  updateInteraction();
  updateAmmoLabels();
  updateMission(delta);

  if (extractionRing.visible) {
    extractionRing.rotation.z += delta * .8;
  }

  renderer.render(scene, camera);
}

// ============================================================
// INITIALIZATION
// ============================================================

updateHUD();
missionUpdate();
animate();

// ============================================================
// RESIZE
// ============================================================

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
})
BREACHLINE-GAME.html