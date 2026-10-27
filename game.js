"use strict";

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const UI = {
  p1Health: document.querySelector("#p1Health"),
  p2Health: document.querySelector("#p2Health"),
  p1HealthText: document.querySelector("#p1HealthText"),
  p2HealthText: document.querySelector("#p2HealthText"),
  p1Ammo: document.querySelector("#p1Ammo"),
  p2Ammo: document.querySelector("#p2Ammo"),
  p1Weapon: document.querySelector("#p1Weapon"),
  p2Weapon: document.querySelector("#p2Weapon"),
  p1Status: document.querySelector("#p1Status"),
  p2Status: document.querySelector("#p2Status"),
  p1Score: document.querySelector("#p1Score"),
  p2Score: document.querySelector("#p2Score"),
  roundLabel: document.querySelector("#roundLabel"),
  matchTimer: document.querySelector("#matchTimer"),
  countdown: document.querySelector("#countdown"),
  resultPanel: document.querySelector("#resultPanel"),
  resultEyebrow: document.querySelector("#resultEyebrow"),
  resultTitle: document.querySelector("#resultTitle"),
  resultText: document.querySelector("#resultText"),
  restartButton: document.querySelector("#restartButton"),
  pausePanel: document.querySelector("#pausePanel"),
  soundButton: document.querySelector("#soundButton"),
  modeButton: document.querySelector("#modeButton"),
  modePanel: document.querySelector("#modePanel"),
  modeHome: document.querySelector("#modeHome"),
  levelSelect: document.querySelector("#levelSelect"),
  duelModeButton: document.querySelector("#duelModeButton"),
  campaignModeButton: document.querySelector("#campaignModeButton"),
  level1Button: document.querySelector("#level1Button"),
  level2Button: document.querySelector("#level2Button"),
  level3Button: document.querySelector("#level3Button"),
  backModeButton: document.querySelector("#backModeButton"),
  closeModeButton: document.querySelector("#closeModeButton"),
  p1Tag: document.querySelector("#p1Tag"),
  p2Tag: document.querySelector("#p2Tag"),
  p2Controls: document.querySelector("#p2Controls"),
  controlsTip: document.querySelector("#controlsTip"),
  p1MovementHint: document.querySelector("#p1MovementHint"),
  campaignMovementButton: document.querySelector("#campaignMovementButton"),
  campaignMovementKeys: document.querySelector("#campaignMovementKeys"),
  p1FireKey: document.querySelector("#p1FireKey"),
  p1ReloadKey: document.querySelector("#p1ReloadKey"),
  p1SwitchKey: document.querySelector("#p1SwitchKey"),
  level1Best: document.querySelector("#level1Best"),
  level2Best: document.querySelector("#level2Best"),
  level3Best: document.querySelector("#level3Best"),
  roundInfoLabel: document.querySelector("#roundInfoLabel"),
  roundInfoValue: document.querySelector("#roundInfoValue"),
  roundInfoSuffix: document.querySelector("#roundInfoSuffix"),
  arenaFrame: document.querySelector("#arenaFrame"),
  p2MovementButton: document.querySelector("#p2MovementButton"),
  p2MovementKeys: document.querySelector("#p2MovementKeys"),
};

const W = canvas.width;
const H = canvas.height;
const BASE_WORLD_WIDTH = 1280;
const WORLD_X_OFFSET = (W - BASE_WORLD_WIDTH) / 2;
const ARENA = { left: 42, right: W - 42, top: 42, bottom: H - 42 };
const PLAYER_RADIUS = 25;
const WIN_SCORE = 3;
const PICKUP_INTERVAL = 10;
const PICKUP_RADIUS = 18;
const MEDKIT_HEAL = 30;
const DAMAGE_BUFF_DURATION = 10;
const DAMAGE_BUFF_MULTIPLIER = 1.5;
const SPEED_BUFF_DURATION = 10;
const SPEED_BUFF_MULTIPLIER = 1.2;
const INVINCIBILITY_DURATION = 5;
const MAX_PICKUPS = 5;
const ROUND_DURATION = 120;
const BOT_FIRE_INTERVAL = 2;
const BOT_HEALTH = 100;
const P2_MOVEMENT_KEYMAPS = {
  letters: { up: "KeyO", down: "KeyL", left: "KeyK", right: "Semicolon" },
  arrows: { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" },
};
const CAMPAIGN_CONTROL_SCHEMES = {
  wasd: {
    moveKeys: { up: "KeyW", down: "KeyS", left: "KeyA", right: "KeyD" },
    fireKey: "ShiftLeft",
    reloadKey: "KeyE",
    switchKey: "KeyQ",
    movementLabel: "WASD",
    fireLabel: "左 Shift",
    reloadLabel: "E",
    switchLabel: "Q",
  },
  arrows: {
    moveKeys: { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" },
    fireKey: "ShiftRight",
    reloadKey: "Slash",
    switchKey: "Enter",
    movementLabel: "↑ ↓ ← →",
    fireLabel: "右 Shift",
    reloadLabel: "/",
    switchLabel: "Enter",
  },
};

function getSavedP2MovementMode() {
  try {
    const savedMode = localStorage.getItem("arenaDuel.p2MovementMode");
    return savedMode === "arrows" ? "arrows" : "letters";
  } catch {
    return "letters";
  }
}

let p2MovementMode = getSavedP2MovementMode();

function getSavedCampaignMovementMode() {
  try {
    const savedMode = localStorage.getItem("arenaDuel.campaignMovementMode");
    return savedMode === "arrows" ? "arrows" : "wasd";
  } catch {
    return "wasd";
  }
}

let campaignMovementMode = getSavedCampaignMovementMode();

function getSavedCampaignBestTimes() {
  return [1, 2, 3].reduce((times, level) => {
    try {
      const savedTime = Number.parseFloat(localStorage.getItem(`arenaDuel.campaignBestLevel${level}`));
      times[level] = Number.isFinite(savedTime) && savedTime > 0 ? savedTime : null;
    } catch {
      times[level] = null;
    }
    return times;
  }, {});
}

const campaignBestTimes = getSavedCampaignBestTimes();

const weapons = [
  {
    id: "pistol",
    name: "脉冲手枪",
    magSize: 12,
    reload: 1.15,
    damage: 14,
    cooldown: 0.22,
    speed: 820,
    spread: 0.025,
    pellets: 1,
    color: "#f6e47b",
  },
  {
    id: "smg",
    name: "疾风冲锋枪",
    magSize: 24,
    reload: 1.75,
    damage: 7,
    cooldown: 0.09,
    speed: 900,
    spread: 0.085,
    pellets: 1,
    color: "#73ffbc",
  },
  {
    id: "shotgun",
    name: "破阵霰弹枪",
    magSize: 3,
    reload: 2.25,
    damage: 9,
    cooldown: 0.7,
    speed: 720,
    spread: 0.24,
    pellets: 6,
    color: "#ffb45e",
  },
];

const obstacles = [
  { x: W / 2 - 64, y: H / 2 - 104, w: 128, h: 208 },
  { x: W / 2 - 260, y: H / 2 - 34, w: 100, h: 68 },
  { x: W / 2 + 160, y: H / 2 - 34, w: 100, h: 68 },
];

const keys = new Set();
let bullets = [];
let particles = [];
let trails = [];
let pickups = [];
let pickupTimer = PICKUP_INTERVAL;
let roundTimer = ROUND_DURATION;
let state = "countdown";
let countdownStarted = performance.now();
let paused = false;
let soundEnabled = true;
let audioContext = null;
let lastTime = performance.now();
let screenShake = 0;
let round = 1;
let gameMode = "duel";
let campaignLevel = 1;
let bots = [];
let campaignShotsFired = 0;
let campaignElapsed = 0;
let campaignWon = false;
let stateBeforeModePanel = "countdown";

function createWeaponStates() {
  return weapons.map((weapon) => ({
    ammo: weapon.magSize,
    reloading: false,
    reloadTimer: 0,
  }));
}

function createPlayer(id) {
  const isP1 = id === 1;
  return {
    id,
    x: isP1 ? 180 + WORLD_X_OFFSET : W - 180 - WORLD_X_OFFSET,
    y: H / 2,
    color: isP1 ? "#39e7ff" : "#ff4d8d",
    darkColor: isP1 ? "#117e9b" : "#a62758",
    angle: isP1 ? 0 : Math.PI,
    health: 100,
    speed: 280,
    weaponIndex: 0,
    weaponStates: createWeaponStates(),
    shootTimer: 0,
    hitFlash: 0,
    damageBuffTimer: 0,
    speedBuffTimer: 0,
    invincibilityTimer: 0,
    score: 0,
    moveKeys: isP1
      ? { up: "KeyW", down: "KeyS", left: "KeyA", right: "KeyD" }
      : { ...P2_MOVEMENT_KEYMAPS[p2MovementMode] },
    fireKey: isP1 ? "ShiftLeft" : "ShiftRight",
    reloadKey: isP1 ? "KeyE" : "Slash",
    switchKey: isP1 ? "KeyQ" : "Enter",
  };
}

const players = [createPlayer(1), createPlayer(2)];

function createBot({ id, label, x = W - 190 - WORLD_X_OFFSET, y, color, darkColor, weaponIndex, fireDelay }) {
  return {
    id,
    label,
    x,
    y,
    angle: Math.PI,
    health: BOT_HEALTH,
    color,
    darkColor,
    weaponColor: weapons[weaponIndex].color,
    weaponIndex,
    ammo: weapons[weaponIndex].magSize,
    reloading: false,
    reloadTimer: 0,
    fireTimer: fireDelay,
    shotsFired: 0,
    hitFlash: 0,
    alive: true,
  };
}

function createCampaignBots(level) {
  const levelBots = [
    createBot({
      id: "bot-green",
      label: "GREEN AI",
      y: 178,
      color: "#73ffbc",
      darkColor: "#236d50",
      weaponIndex: 1,
      fireDelay: BOT_FIRE_INTERVAL,
    }),
    createBot({
      id: "bot-yellow",
      label: level === 1 ? "YELLOW AI" : "YELLOW AI 1",
      y: H - 178,
      color: "#ffcf44",
      darkColor: "#8b6517",
      weaponIndex: 0,
      fireDelay: BOT_FIRE_INTERVAL + 1,
    }),
  ];

  if (level >= 2) {
    levelBots.push(createBot({
      id: "bot-yellow-2",
      label: "YELLOW AI 2",
      y: H / 2,
      color: "#ffcf44",
      darkColor: "#8b6517",
      weaponIndex: 0,
      fireDelay: BOT_FIRE_INTERVAL,
    }));
  }

  if (level >= 3) {
    levelBots.push(createBot({
      id: "bot-shotgun",
      label: "SHOTGUN AI",
      x: W - 355 - WORLD_X_OFFSET,
      y: H - 150,
      color: "#ff8a4c",
      darkColor: "#843d24",
      weaponIndex: 2,
      fireDelay: BOT_FIRE_INTERVAL + 1,
    }));
  }

  return levelBots;
}

function updateP2MovementControls() {
  players[1].moveKeys = { ...P2_MOVEMENT_KEYMAPS[p2MovementMode] };
  UI.p2MovementKeys.textContent = p2MovementMode === "arrows" ? "↑ ↓ ← →" : "OKL;";
  UI.p2MovementButton.classList.toggle("is-arrows", p2MovementMode === "arrows");
  UI.p2MovementButton.setAttribute(
    "aria-label",
    `红方移动键位：${p2MovementMode === "arrows" ? "上下左右方向键" : "O K L 分号"}，点击切换`,
  );
}

function toggleP2MovementMode() {
  p2MovementMode = p2MovementMode === "letters" ? "arrows" : "letters";
  keys.clear();
  updateP2MovementControls();
  try {
    localStorage.setItem("arenaDuel.p2MovementMode", p2MovementMode);
  } catch {
    // 隐私模式等环境可能禁止本地存储，当前选择仍然立即生效。
  }
  playTone(440, 0.06, "sine", 0.025);
}

function updateCampaignMovementControls() {
  const scheme = gameMode === "campaign"
    ? CAMPAIGN_CONTROL_SCHEMES[campaignMovementMode]
    : CAMPAIGN_CONTROL_SCHEMES.wasd;
  players[0].moveKeys = { ...scheme.moveKeys };
  players[0].fireKey = scheme.fireKey;
  players[0].reloadKey = scheme.reloadKey;
  players[0].switchKey = scheme.switchKey;
  UI.campaignMovementKeys.textContent = scheme.movementLabel;
  UI.p1FireKey.textContent = scheme.fireLabel;
  UI.p1ReloadKey.textContent = scheme.reloadLabel;
  UI.p1SwitchKey.textContent = scheme.switchLabel;
  UI.campaignMovementButton.classList.toggle("is-arrows", campaignMovementMode === "arrows");
  UI.campaignMovementButton.setAttribute(
    "aria-label",
    `闯关键位：${scheme.movementLabel} 移动，${scheme.fireLabel} 射击，${scheme.reloadLabel} 换弹，${scheme.switchLabel} 换枪；点击切换整套键位`,
  );
}

function toggleCampaignMovementMode() {
  if (gameMode !== "campaign") return;
  campaignMovementMode = campaignMovementMode === "wasd" ? "arrows" : "wasd";
  keys.clear();
  updateCampaignMovementControls();
  try {
    localStorage.setItem("arenaDuel.campaignMovementMode", campaignMovementMode);
  } catch {
    // 本地存储不可用时，键位选择在本次游戏内仍然生效。
  }
  playTone(440, 0.06, "sine", 0.025);
  canvas.focus({ preventScroll: true });
}

function formatCampaignTime(seconds) {
  return seconds.toFixed(1);
}

function updateModePresentation() {
  const isCampaign = gameMode === "campaign";
  const currentBestTime = campaignBestTimes[campaignLevel];
  UI.modeButton.textContent = isCampaign ? `模式：闯关 第 ${campaignLevel} 关` : "模式：双人对战";
  UI.p2Controls.classList.toggle("hidden", isCampaign);
  UI.p1MovementHint.classList.toggle("hidden", isCampaign);
  UI.campaignMovementButton.classList.toggle("hidden", !isCampaign);
  UI.controlsTip.textContent = isCampaign
    ? `击败 ${bots.length} 名人机 · R 随时重新开始 · 计时从 FIGHT 开始`
    : "移动方向就是射击方向 · 打空弹夹会自动换弹";
  UI.roundInfoLabel.textContent = isCampaign ? "最好成绩" : "先赢得";
  UI.roundInfoValue.textContent = isCampaign && currentBestTime !== null
    ? formatCampaignTime(currentBestTime)
    : isCampaign ? "--" : "3";
  UI.roundInfoSuffix.textContent = isCampaign ? "秒" : "局获胜";
  [UI.level1Best, UI.level2Best, UI.level3Best].forEach((element, index) => {
    const bestTime = campaignBestTimes[index + 1];
    element.textContent = `最好成绩：${bestTime === null ? "--" : `${formatCampaignTime(bestTime)} 秒`}`;
  });
  canvas.setAttribute("aria-label", isCampaign ? `闯关模式第 ${campaignLevel} 关竞技场` : "双人竞技场");
  updateCampaignMovementControls();
}

function showModeHome() {
  UI.modeHome.classList.remove("hidden");
  UI.levelSelect.classList.add("hidden");
}

function showLevelSelect() {
  UI.modeHome.classList.add("hidden");
  UI.levelSelect.classList.remove("hidden");
}

function openModePanel() {
  if (state !== "modeSelect") stateBeforeModePanel = state;
  state = "modeSelect";
  keys.clear();
  UI.countdown.classList.add("hidden");
  UI.modePanel.classList.remove("hidden");
  UI.pausePanel.classList.add("hidden");
  showModeHome();
  updateModePresentation();
}

function closeModePanel() {
  if (state !== "modeSelect") return;
  state = stateBeforeModePanel;
  UI.modePanel.classList.add("hidden");
  if (state === "countdown") {
    countdownStarted = performance.now();
    UI.countdown.classList.remove("hidden");
  }
  UI.pausePanel.classList.toggle("hidden", !paused);
}

function currentWeapon(player) {
  return weapons[player.weaponIndex];
}

function currentWeaponState(player) {
  return player.weaponStates[player.weaponIndex];
}

function resetPlayer(player) {
  const isP1 = player.id === 1;
  player.x = isP1 ? 180 + WORLD_X_OFFSET : W - 180 - WORLD_X_OFFSET;
  player.y = H / 2;
  player.angle = isP1 ? 0 : Math.PI;
  player.health = 100;
  player.weaponStates = createWeaponStates();
  player.shootTimer = 0;
  player.hitFlash = 0;
  player.damageBuffTimer = 0;
  player.speedBuffTimer = 0;
  player.invincibilityTimer = 0;
}

function startRound() {
  gameMode = "duel";
  bullets = [];
  particles = [];
  trails = [];
  pickups = [];
  bots = [];
  pickupTimer = PICKUP_INTERVAL;
  roundTimer = ROUND_DURATION;
  players.forEach(resetPlayer);
  paused = false;
  state = "countdown";
  countdownStarted = performance.now();
  UI.modePanel.classList.add("hidden");
  UI.pausePanel.classList.add("hidden");
  UI.resultPanel.classList.add("hidden");
  UI.countdown.classList.remove("hidden");
  updateModePresentation();
  updateUI();
}

function startMatch() {
  players.forEach((player) => {
    player.score = 0;
    player.weaponIndex = 0;
  });
  round = 1;
  startRound();
}

function startCampaignLevel(level = 1) {
  if (![1, 2, 3].includes(level)) return;
  gameMode = "campaign";
  campaignLevel = level;
  campaignWon = false;
  bullets = [];
  particles = [];
  trails = [];
  pickups = [];
  pickupTimer = PICKUP_INTERVAL;
  campaignShotsFired = 0;
  campaignElapsed = 0;
  players[0].score = 0;
  players[0].weaponIndex = 0;
  resetPlayer(players[0]);
  bots = createCampaignBots(level);
  paused = false;
  state = "countdown";
  countdownStarted = performance.now();
  UI.modePanel.classList.add("hidden");
  UI.pausePanel.classList.add("hidden");
  UI.resultPanel.classList.add("hidden");
  UI.countdown.classList.remove("hidden");
  updateModePresentation();
  updateUI();
  canvas.focus({ preventScroll: true });
}

function switchWeapon(player) {
  if (state !== "playing") return;
  player.weaponIndex = (player.weaponIndex + 1) % weapons.length;
  player.shootTimer = 0.2;
  burst(player.x, player.y, currentWeapon(player).color, 8, 80);
  playTone(340 + player.weaponIndex * 100, 0.05, "sine", 0.025);
  updateUI();
}

function beginReload(player, weaponIndex = player.weaponIndex) {
  if (state !== "playing") return;
  const weapon = weapons[weaponIndex];
  const weaponState = player.weaponStates[weaponIndex];
  if (weaponState.reloading || weaponState.ammo === weapon.magSize) return;
  weaponState.reloading = true;
  weaponState.reloadTimer = weapon.reload;
  playTone(170, 0.07, "square", 0.025);
}

function fire(player) {
  const weapon = currentWeapon(player);
  const weaponState = currentWeaponState(player);
  if (weaponState.reloading || player.shootTimer > 0) return;
  if (weaponState.ammo <= 0) {
    beginReload(player);
    return;
  }

  weaponState.ammo -= 1;
  player.shootTimer = weapon.cooldown;
  const muzzleX = player.x + Math.cos(player.angle) * 35;
  const muzzleY = player.y + Math.sin(player.angle) * 35;

  for (let i = 0; i < weapon.pellets; i += 1) {
    const spread = (Math.random() - 0.5) * weapon.spread * 2;
    const angle = player.angle + spread;
    bullets.push({
      x: muzzleX,
      y: muzzleY,
      lastX: muzzleX,
      lastY: muzzleY,
      vx: Math.cos(angle) * weapon.speed,
      vy: Math.sin(angle) * weapon.speed,
      radius: weapon.id === "shotgun" ? 3.5 : 4.5,
      damage: weapon.damage * (player.damageBuffTimer > 0 ? DAMAGE_BUFF_MULTIPLIER : 1),
      owner: player.id,
      color: weapon.color,
      life: weapon.id === "shotgun" ? 0.52 : 1.45,
    });
  }

  const recoil = weapon.id === "shotgun" ? 5 : 1.5;
  movePlayer(player, -Math.cos(player.angle) * recoil, -Math.sin(player.angle) * recoil);
  burst(muzzleX, muzzleY, weapon.color, weapon.id === "shotgun" ? 14 : 5, 150);
  screenShake = Math.max(screenShake, weapon.id === "shotgun" ? 7 : 2);
  playTone(weapon.id === "shotgun" ? 90 : weapon.id === "smg" ? 145 : 190, 0.045, "sawtooth", 0.045);

  if (weaponState.ammo <= 0) beginReload(player, player.weaponIndex);
}

function fireBot(bot) {
  if (!bot.alive || bot.reloading || bot.ammo <= 0 || state !== "playing") return;
  const target = players[0];
  const weapon = weapons[bot.weaponIndex];
  bot.angle = Math.atan2(target.y - bot.y, target.x - bot.x);
  const muzzleX = bot.x + Math.cos(bot.angle) * 35;
  const muzzleY = bot.y + Math.sin(bot.angle) * 35;
  for (let pellet = 0; pellet < weapon.pellets; pellet += 1) {
    const spread = weapon.id === "shotgun" ? (Math.random() - 0.5) * weapon.spread * 2 : 0;
    const angle = bot.angle + spread;
    bullets.push({
      x: muzzleX,
      y: muzzleY,
      lastX: muzzleX,
      lastY: muzzleY,
      vx: Math.cos(angle) * (weapon.id === "shotgun" ? weapon.speed : weapons[0].speed),
      vy: Math.sin(angle) * (weapon.id === "shotgun" ? weapon.speed : weapons[0].speed),
      radius: weapon.id === "shotgun" ? 3.5 : 4.5,
      damage: weapon.id === "shotgun" ? weapon.damage : weapons[0].damage,
      owner: bot.id,
      color: bot.weaponColor,
      life: weapon.id === "shotgun" ? 0.52 : 2.1,
    });
  }
  bot.ammo -= 1;
  bot.shotsFired += 1;
  campaignShotsFired += 1;
  burst(muzzleX, muzzleY, bot.weaponColor, weapon.id === "shotgun" ? 14 : 6, 150);
  playTone(weapon.id === "shotgun" ? 90 : bot.id === "bot-green" ? 155 : 190, 0.045, "sawtooth", 0.035);
  if (bot.ammo <= 0) {
    bot.reloading = true;
    bot.reloadTimer = weapons[bot.weaponIndex].reload;
  }
}

function updateBots(dt) {
  bots.forEach((bot) => {
    if (!bot.alive) return;
    bot.angle = Math.atan2(players[0].y - bot.y, players[0].x - bot.x);
    bot.hitFlash = Math.max(0, bot.hitFlash - dt);
    if (bot.reloading) {
      bot.reloadTimer -= dt;
      if (bot.reloadTimer <= 0) {
        bot.reloading = false;
        bot.reloadTimer = 0;
        bot.ammo = weapons[bot.weaponIndex].magSize;
        playTone(420, 0.06, "sine", 0.02);
      }
    }
    bot.fireTimer -= dt;
    if (bot.fireTimer <= 0) {
      fireBot(bot);
      bot.fireTimer += BOT_FIRE_INTERVAL;
    }
  });
}

function circleRectCollision(x, y, radius, rect) {
  const closestX = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  const dx = x - closestX;
  const dy = y - closestY;
  return dx * dx + dy * dy < radius * radius;
}

function movePlayer(player, dx, dy) {
  const previousX = player.x;
  player.x = Math.max(ARENA.left + PLAYER_RADIUS, Math.min(ARENA.right - PLAYER_RADIUS, player.x + dx));
  if (obstacles.some((rect) => circleRectCollision(player.x, player.y, PLAYER_RADIUS, rect))) {
    player.x = previousX;
  }

  const previousY = player.y;
  player.y = Math.max(ARENA.top + PLAYER_RADIUS, Math.min(ARENA.bottom - PLAYER_RADIUS, player.y + dy));
  if (obstacles.some((rect) => circleRectCollision(player.x, player.y, PLAYER_RADIUS, rect))) {
    player.y = previousY;
  }
}

function updatePlayer(player, dt) {
  const controls = player.moveKeys;
  let dx = Number(keys.has(controls.right)) - Number(keys.has(controls.left));
  let dy = Number(keys.has(controls.down)) - Number(keys.has(controls.up));

  if (dx || dy) {
    const length = Math.hypot(dx, dy);
    dx /= length;
    dy /= length;
    player.angle = Math.atan2(dy, dx);
    const speedMultiplier = player.speedBuffTimer > 0 ? SPEED_BUFF_MULTIPLIER : 1;
    movePlayer(player, dx * player.speed * speedMultiplier * dt, dy * player.speed * speedMultiplier * dt);
  }

  const collisionTargets = gameMode === "campaign"
    ? bots.filter((bot) => bot.alive)
    : [players[player.id === 1 ? 1 : 0]];
  collisionTargets.forEach((other) => {
    const distance = Math.hypot(player.x - other.x, player.y - other.y);
    if (distance < PLAYER_RADIUS * 2) {
      const nx = (player.x - other.x) / (distance || 1);
      const ny = (player.y - other.y) / (distance || 1);
      movePlayer(player, nx * 1.5, ny * 1.5);
    }
  });

  player.shootTimer = Math.max(0, player.shootTimer - dt);
  player.hitFlash = Math.max(0, player.hitFlash - dt);
  player.damageBuffTimer = Math.max(0, player.damageBuffTimer - dt);
  player.speedBuffTimer = Math.max(0, player.speedBuffTimer - dt);
  player.invincibilityTimer = Math.max(0, player.invincibilityTimer - dt);

  player.weaponStates.forEach((weaponState, weaponIndex) => {
    if (weaponState.reloading) {
      weaponState.reloadTimer -= dt;
      if (weaponState.reloadTimer <= 0) {
        weaponState.reloading = false;
        weaponState.reloadTimer = 0;
        weaponState.ammo = weapons[weaponIndex].magSize;
        playTone(420, 0.06, "sine", 0.025);
      }
    }
  });

  if (keys.has(player.fireKey)) fire(player);
}

function isSafePickupPosition(x, y) {
  const clearOfObstacles = obstacles.every(
    (rect) => !circleRectCollision(x, y, PICKUP_RADIUS + 10, rect),
  );
  const activeActors = gameMode === "campaign"
    ? [players[0], ...bots.filter((bot) => bot.alive)]
    : players;
  const clearOfPlayers = activeActors.every(
    (actor) => Math.hypot(x - actor.x, y - actor.y) > PLAYER_RADIUS + PICKUP_RADIUS + 45,
  );
  const clearOfPickups = pickups.every(
    (pickup) => Math.hypot(x - pickup.x, y - pickup.y) > PICKUP_RADIUS * 3,
  );
  return clearOfObstacles && clearOfPlayers && clearOfPickups;
}

function spawnPickup() {
  if (pickups.length >= MAX_PICKUPS) return;

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const x = ARENA.left + 55 + Math.random() * (ARENA.right - ARENA.left - 110);
    const y = ARENA.top + 55 + Math.random() * (ARENA.bottom - ARENA.top - 110);
    if (!isSafePickupPosition(x, y)) continue;

    const roll = Math.random();
    pickups.push({
      x,
      y,
      type: roll < 0.25
        ? "medkit"
        : roll < 0.5
          ? "damage"
          : roll < 0.75
            ? "invincible"
            : "speed",
      age: 0,
    });
    burst(x, y, "#ffffff", 18, 150);
    playTone(520, 0.1, "sine", 0.025);
    return;
  }
}

function collectPickup(player, pickup) {
  if (pickup.type === "medkit") {
    player.health = Math.min(100, player.health + MEDKIT_HEAL);
    burst(pickup.x, pickup.y, "#55f59b", 24, 210);
    playTone(660, 0.13, "sine", 0.035);
  } else if (pickup.type === "damage") {
    player.damageBuffTimer = DAMAGE_BUFF_DURATION;
    burst(pickup.x, pickup.y, "#ffb13b", 24, 210);
    playTone(780, 0.13, "square", 0.03);
  } else if (pickup.type === "invincible") {
    player.invincibilityTimer = INVINCIBILITY_DURATION;
    burst(pickup.x, pickup.y, "#b57bff", 28, 230);
    playTone(920, 0.16, "sine", 0.035);
  } else {
    player.speedBuffTimer = SPEED_BUFF_DURATION;
    burst(pickup.x, pickup.y, "#56a8ff", 28, 240);
    playTone(1080, 0.12, "sine", 0.03);
  }
}

function updatePickups(dt) {
  pickupTimer -= dt;
  if (pickupTimer <= 0) {
    spawnPickup();
    pickupTimer += PICKUP_INTERVAL;
  }

  for (let i = pickups.length - 1; i >= 0; i -= 1) {
    const pickup = pickups[i];
    pickup.age += dt;
    const collectiblePlayers = gameMode === "campaign" ? [players[0]] : players;
    const collector = collectiblePlayers.find(
      (player) => Math.hypot(pickup.x - player.x, pickup.y - player.y) < PICKUP_RADIUS + PLAYER_RADIUS,
    );
    if (collector) {
      collectPickup(collector, pickup);
      pickups.splice(i, 1);
    }
  }
}

function bulletHitsWall(bullet) {
  return (
    bullet.x < ARENA.left ||
    bullet.x > ARENA.right ||
    bullet.y < ARENA.top ||
    bullet.y > ARENA.bottom ||
    obstacles.some((rect) => circleRectCollision(bullet.x, bullet.y, bullet.radius, rect))
  );
}

function updateBullets(dt) {
  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i];
    bullet.lastX = bullet.x;
    bullet.lastY = bullet.y;
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
    trails.push({ x1: bullet.lastX, y1: bullet.lastY, x2: bullet.x, y2: bullet.y, color: bullet.color, life: 0.08 });

    if (gameMode === "campaign") {
      if (bullet.owner === 1) {
        const targetBot = bots.find(
          (bot) => bot.alive && Math.hypot(bullet.x - bot.x, bullet.y - bot.y) < PLAYER_RADIUS + bullet.radius,
        );
        if (targetBot) {
          targetBot.health = Math.max(0, targetBot.health - bullet.damage);
          targetBot.hitFlash = 0.12;
          burst(bullet.x, bullet.y, targetBot.color, 12, 230);
          screenShake = Math.max(screenShake, 5);
          playTone(75, 0.08, "square", 0.045);
          bullets.splice(i, 1);
          if (targetBot.health <= 0) {
            targetBot.alive = false;
            burst(targetBot.x, targetBot.y, targetBot.color, 42, 300);
            if (bots.every((bot) => !bot.alive)) endCampaign(true);
          }
          continue;
        }
      } else {
        const target = players[0];
        const hit = Math.hypot(bullet.x - target.x, bullet.y - target.y) < PLAYER_RADIUS + bullet.radius;
        if (hit) {
          if (target.invincibilityTimer > 0) {
            burst(bullet.x, bullet.y, "#b57bff", 14, 260);
            screenShake = Math.max(screenShake, 2);
            playTone(980, 0.05, "sine", 0.025);
          } else {
            target.health = Math.max(0, target.health - bullet.damage);
            target.hitFlash = 0.12;
            burst(bullet.x, bullet.y, target.color, 12, 230);
            screenShake = Math.max(screenShake, 6);
            playTone(75, 0.08, "square", 0.045);
          }
          bullets.splice(i, 1);
          if (target.health <= 0) endCampaign(false);
          continue;
        }
      }
    } else {
      const target = players[bullet.owner === 1 ? 1 : 0];
      const hit = Math.hypot(bullet.x - target.x, bullet.y - target.y) < PLAYER_RADIUS + bullet.radius;
      if (hit) {
        if (target.invincibilityTimer > 0) {
          burst(bullet.x, bullet.y, "#b57bff", 14, 260);
          screenShake = Math.max(screenShake, 2);
          playTone(980, 0.05, "sine", 0.025);
        } else {
          target.health = Math.max(0, target.health - bullet.damage);
          target.hitFlash = 0.12;
          burst(bullet.x, bullet.y, target.color, 12, 230);
          screenShake = Math.max(screenShake, 6);
          playTone(75, 0.08, "square", 0.045);
        }
        bullets.splice(i, 1);
        if (target.health <= 0) endRound(bullet.owner);
        continue;
      }
    }

    if (bullet.life <= 0 || bulletHitsWall(bullet)) {
      burst(bullet.x, bullet.y, bullet.color, 4, 80);
      bullets.splice(i, 1);
    }
  }
}

function burst(x, y, color, amount, speed) {
  for (let i = 0; i < amount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = speed * (0.3 + Math.random() * 0.7);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: 0.18 + Math.random() * 0.28,
      maxLife: 0.46,
      size: 1.5 + Math.random() * 3.5,
      color,
    });
  }
}

function updateEffects(dt) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.94;
    particle.vy *= 0.94;
    particle.life -= dt;
    if (particle.life <= 0) particles.splice(i, 1);
  }

  for (let i = trails.length - 1; i >= 0; i -= 1) {
    trails[i].life -= dt;
    if (trails[i].life <= 0) trails.splice(i, 1);
  }
  screenShake = Math.max(0, screenShake - 24 * dt);
}

function endRound(winnerId, reason = "knockout") {
  if (state !== "playing") return;
  state = "roundOver";
  const isDraw = winnerId === 0;
  const winner = isDraw ? null : players[winnerId - 1];
  if (winner) winner.score += 1;
  const matchOver = winner ? winner.score >= WIN_SCORE : false;
  UI.resultEyebrow.textContent = matchOver ? "比赛结束" : reason === "timeout" ? "时间到" : `第 ${round} 局结束`;
  UI.resultTitle.textContent = isDraw ? "本局平局" : `P${winnerId} 获胜`;
  UI.resultTitle.style.color = isDraw ? "#f5f7ff" : winner.color;
  UI.resultText.textContent = matchOver
    ? `P${winnerId} 率先赢得 3 局，成为竞技场冠军`
    : isDraw
      ? "双方剩余血量相同，本局不计分"
      : reason === "timeout"
        ? `P${winnerId} 剩余血量更多，赢得本局`
        : "按 R 或点击按钮进入下一局";
  UI.restartButton.firstChild.textContent = matchOver ? "重新比赛 " : "下一局 ";
  UI.resultPanel.classList.remove("hidden");
  if (winner) {
    burst(winner.x, winner.y, winner.color, 50, 320);
    playVictory();
  }
  updateUI();
}

function endCampaign(won) {
  if (state !== "playing") return;
  state = "roundOver";
  campaignWon = won;
  const completionTime = Number.parseFloat(formatCampaignTime(campaignElapsed));
  let isNewBest = false;
  const previousBest = campaignBestTimes[campaignLevel];
  if (won && (previousBest === null || completionTime < previousBest)) {
    campaignBestTimes[campaignLevel] = completionTime;
    isNewBest = true;
    try {
      localStorage.setItem(`arenaDuel.campaignBestLevel${campaignLevel}`, String(completionTime));
    } catch {
      // 无法持久保存时，本次页面中仍保留最好成绩。
    }
  }
  UI.resultEyebrow.textContent = won ? "关卡完成" : "挑战结束";
  UI.resultTitle.textContent = won ? `第 ${campaignLevel} 关通过` : "闯关失败";
  UI.resultTitle.style.color = won ? "#73ffbc" : "#ff4d8d";
  UI.resultText.textContent = won
    ? `用时 ${formatCampaignTime(completionTime)} 秒 · ${isNewBest ? "新的最好成绩" : `最好成绩 ${formatCampaignTime(campaignBestTimes[campaignLevel])} 秒`} · ${campaignLevel < 3 ? `下一关：第 ${campaignLevel + 1} 关` : "全部关卡完成"}`
    : `按 R 或点击按钮重新挑战第 ${campaignLevel} 关`;
  UI.restartButton.firstChild.textContent = won && campaignLevel < 3 ? "下一关 " : won ? "再玩一次 " : "重新挑战 ";
  UI.resultPanel.classList.remove("hidden");
  if (won) {
    burst(players[0].x, players[0].y, players[0].color, 50, 320);
    playVictory();
  }
  updateModePresentation();
  updateUI();
}

function endRoundByTime() {
  const [p1, p2] = players;
  if (p1.health === p2.health) {
    endRound(0, "timeout");
  } else {
    endRound(p1.health > p2.health ? 1 : 2, "timeout");
  }
}

function continueGame() {
  if (state !== "roundOver") return;
  if (gameMode === "campaign") {
    startCampaignLevel(campaignWon && campaignLevel < 3 ? campaignLevel + 1 : campaignLevel);
    return;
  }
  const matchOver = players.some((player) => player.score >= WIN_SCORE);
  if (matchOver) {
    startMatch();
  } else {
    round += 1;
    startRound();
  }
}

function updateCountdown(now) {
  const elapsed = (now - countdownStarted) / 1000;
  if (elapsed < 0.8) UI.countdown.textContent = "3";
  else if (elapsed < 1.6) UI.countdown.textContent = "2";
  else if (elapsed < 2.4) UI.countdown.textContent = "1";
  else if (elapsed < 3.05) UI.countdown.textContent = "FIGHT";
  else {
    UI.countdown.classList.add("hidden");
    state = "playing";
  }
}

function updateUI() {
  players.forEach((player, index) => {
    const prefix = index === 0 ? "p1" : "p2";
    const weaponState = currentWeaponState(player);
    UI[`${prefix}Health`].style.width = `${player.health}%`;
    UI[`${prefix}HealthText`].textContent = `${Math.ceil(player.health)}%`;
    UI[`${prefix}Ammo`].textContent = `${weaponState.ammo} / ${currentWeapon(player).magSize}`;
    UI[`${prefix}Weapon`].textContent = currentWeapon(player).name;
    UI[`${prefix}Score`].textContent = player.score;
    UI[`${prefix}Status`].textContent = player.invincibilityTimer > 0
      ? `无敌 ${player.invincibilityTimer.toFixed(1)}s`
      : weaponState.reloading
      ? `换弹中 ${(Math.max(0, weaponState.reloadTimer)).toFixed(1)}s`
      : player.damageBuffTimer > 0
        ? `攻击强化 ${player.damageBuffTimer.toFixed(1)}s · 150%`
      : player.speedBuffTimer > 0
        ? `速度强化 ${player.speedBuffTimer.toFixed(1)}s · 120%`
      : player.health <= 30
        ? "生命垂危"
        : "战斗就绪";
    UI[`${prefix}Health`].style.filter = player.health <= 30 ? "saturate(.5) brightness(1.4)" : "";
  });
  if (gameMode === "campaign") {
    const aliveBots = bots.filter((bot) => bot.alive).length;
    const totalBotHealth = bots.reduce((total, bot) => total + bot.health, 0);
    const [greenBot, yellowBot] = bots;
    const botAmmoText = bots.map((bot) => {
      const shortName = bot.id === "bot-green"
        ? "绿"
        : bot.id === "bot-yellow"
          ? campaignLevel === 1 ? "黄" : "黄1"
          : bot.id === "bot-yellow-2" ? "黄2" : "霰";
      return bot.reloading
        ? `${shortName} 换弹 ${Math.max(0, bot.reloadTimer).toFixed(1)}s`
        : `${shortName} ${bot.ammo}/${weapons[bot.weaponIndex].magSize}`;
    }).join(" · ");
    const shotgunBot = bots.find((bot) => bot.id === "bot-shotgun");
    UI.p1Tag.textContent = "P1";
    UI.p1Score.textContent = campaignLevel;
    UI.p2Tag.textContent = "AI";
    UI.p2Weapon.textContent = campaignLevel === 3 ? "AI 编队 + 霰弹枪" : `AI 编队 × ${bots.length}`;
    UI.p2Score.textContent = aliveBots;
    UI.p2Health.style.width = `${(totalBotHealth / (BOT_HEALTH * bots.length)) * 100}%`;
    UI.p2HealthText.textContent = `${aliveBots} / ${bots.length}`;
    UI.p2Ammo.textContent = botAmmoText;
    UI.p2Status.textContent = aliveBots > 0 ? `${aliveBots} 名人机 · 各自 2 秒/发` : "敌人已清除";
    UI.roundLabel.textContent = `LEVEL ${campaignLevel}`;
    UI.matchTimer.textContent = `${formatCampaignTime(campaignElapsed)}s`;
    UI.matchTimer.style.color = "#ffcf44";
    UI.arenaFrame.dataset.gameMode = "campaign";
    UI.arenaFrame.dataset.campaignLevel = String(campaignLevel);
    UI.arenaFrame.dataset.totalBots = String(bots.length);
    UI.arenaFrame.dataset.elapsed = formatCampaignTime(campaignElapsed);
    UI.arenaFrame.dataset.remainingBots = String(aliveBots);
    UI.arenaFrame.dataset.botShotsFired = String(campaignShotsFired);
    UI.arenaFrame.dataset.greenShotsFired = String(greenBot.shotsFired);
    UI.arenaFrame.dataset.yellowShotsFired = String(yellowBot.shotsFired);
    UI.arenaFrame.dataset.greenAmmo = String(greenBot.ammo);
    UI.arenaFrame.dataset.yellowAmmo = String(yellowBot.ammo);
    UI.arenaFrame.dataset.greenReloading = String(greenBot.reloading);
    UI.arenaFrame.dataset.yellowReloading = String(yellowBot.reloading);
    UI.arenaFrame.dataset.shotgunShotsFired = String(shotgunBot?.shotsFired ?? 0);
    UI.arenaFrame.dataset.shotgunAmmo = String(shotgunBot?.ammo ?? 0);
    UI.arenaFrame.dataset.controlScheme = campaignMovementMode;
  } else {
    UI.p1Tag.textContent = "P1";
    UI.p2Tag.textContent = "P2";
    UI.roundLabel.textContent = `ROUND ${round}`;
    const seconds = Math.max(0, Math.ceil(roundTimer));
    UI.matchTimer.textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    UI.matchTimer.style.color = seconds <= 10 ? "#ff4d8d" : "";
    UI.arenaFrame.dataset.gameMode = "duel";
    delete UI.arenaFrame.dataset.remainingBots;
    delete UI.arenaFrame.dataset.botShotsFired;
    delete UI.arenaFrame.dataset.greenShotsFired;
    delete UI.arenaFrame.dataset.yellowShotsFired;
    delete UI.arenaFrame.dataset.greenAmmo;
    delete UI.arenaFrame.dataset.yellowAmmo;
    delete UI.arenaFrame.dataset.greenReloading;
    delete UI.arenaFrame.dataset.yellowReloading;
    delete UI.arenaFrame.dataset.campaignLevel;
    delete UI.arenaFrame.dataset.totalBots;
    delete UI.arenaFrame.dataset.shotgunShotsFired;
    delete UI.arenaFrame.dataset.shotgunAmmo;
    delete UI.arenaFrame.dataset.elapsed;
    delete UI.arenaFrame.dataset.controlScheme;
  }
}

function drawArena(time) {
  const gradient = ctx.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, W * 0.65);
  gradient.addColorStop(0, "#151a2b");
  gradient.addColorStop(0.62, "#0b1020");
  gradient.addColorStop(1, "#060913");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.beginPath();
  ctx.rect(ARENA.left, ARENA.top, ARENA.right - ARENA.left, ARENA.bottom - ARENA.top);
  ctx.clip();

  ctx.strokeStyle = "rgba(124, 148, 190, .075)";
  ctx.lineWidth = 1;
  const grid = 48;
  const offset = (time * 0.006) % grid;
  for (let x = ARENA.left - grid + offset; x < ARENA.right + grid; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, ARENA.top);
    ctx.lineTo(x, ARENA.bottom);
    ctx.stroke();
  }
  for (let y = ARENA.top - grid + offset; y < ARENA.bottom + grid; y += grid) {
    ctx.beginPath();
    ctx.moveTo(ARENA.left, y);
    ctx.lineTo(ARENA.right, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255,255,255,.025)";
  ctx.lineWidth = 80;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 260, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.05)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 210, 0, Math.PI * 2);
  ctx.stroke();

  const centerGlow = ctx.createLinearGradient(W * 0.36, 0, W * 0.64, 0);
  centerGlow.addColorStop(0, "rgba(57,231,255,0)");
  centerGlow.addColorStop(0.5, "rgba(255,255,255,.04)");
  centerGlow.addColorStop(1, "rgba(255,77,141,0)");
  ctx.fillStyle = centerGlow;
  ctx.fillRect(W * 0.3, ARENA.top, W * 0.4, ARENA.bottom - ARENA.top);
  ctx.restore();

  ctx.strokeStyle = "rgba(255,255,255,.18)";
  ctx.lineWidth = 2;
  ctx.strokeRect(ARENA.left, ARENA.top, ARENA.right - ARENA.left, ARENA.bottom - ARENA.top);

  const corners = [
    [ARENA.left, ARENA.top, 1, 1],
    [ARENA.right, ARENA.top, -1, 1],
    [ARENA.left, ARENA.bottom, 1, -1],
    [ARENA.right, ARENA.bottom, -1, -1],
  ];
  corners.forEach(([x, y, sx, sy], index) => {
    ctx.strokeStyle = index % 2 === 0 ? "#39e7ff" : "#ff4d8d";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y + 36 * sy);
    ctx.lineTo(x, y);
    ctx.lineTo(x + 36 * sx, y);
    ctx.stroke();
  });
}

function drawObstacle(rect) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.7)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = "#111728";
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const edge = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  edge.addColorStop(0, "rgba(57,231,255,.28)");
  edge.addColorStop(0.5, "rgba(255,255,255,.04)");
  edge.addColorStop(1, "rgba(255,77,141,.28)");
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

  ctx.fillStyle = "rgba(255,255,255,.035)";
  for (let y = rect.y + 12; y < rect.y + rect.h; y += 16) {
    ctx.fillRect(rect.x + 8, y, rect.w - 16, 2);
  }
  ctx.restore();
}

function drawPlayer(player, time) {
  const weaponState = currentWeaponState(player);
  const pulse = 1 + Math.sin(time * 0.006 + player.id * 2) * 0.05;
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);

  ctx.globalAlpha = 0.18;
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(0, 0, 36 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.shadowColor = player.color;
  ctx.shadowBlur = 16;
  ctx.fillStyle = player.hitFlash > 0 ? "#ffffff" : player.darkColor;
  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = player.color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_RADIUS - 3, -2.2, 2.2);
  ctx.stroke();

  ctx.fillStyle = "#090d17";
  ctx.fillRect(8, -8, 32, 16);
  ctx.fillStyle = currentWeapon(player).color;
  ctx.fillRect(23, -4, 20, 8);
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(4, -8);
  ctx.lineTo(4, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "700 12px Chakra Petch, sans-serif";
  ctx.fillStyle = player.color;
  ctx.fillText(`P${player.id}`, player.x, player.y - 40);
  if (player.damageBuffTimer > 0) {
    ctx.strokeStyle = "#ffb13b";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#ff8a24";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(
      player.x,
      player.y,
      33,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * (player.damageBuffTimer / DAMAGE_BUFF_DURATION),
    );
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  if (player.invincibilityTimer > 0) {
    const shieldPulse = 37 + Math.sin(time * 0.012) * 3;
    ctx.strokeStyle = "#b57bff";
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.75;
    ctx.shadowColor = "#b57bff";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(player.x, player.y, shieldPulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
  if (player.speedBuffTimer > 0) {
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = "#56a8ff";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#56a8ff";
    ctx.shadowBlur = 12;
    for (let i = 0; i < 3; i += 1) {
      const offset = ((time * 0.08 + i * 13) % 34);
      ctx.beginPath();
      ctx.moveTo(player.x - Math.cos(player.angle) * (28 + offset), player.y - Math.sin(player.angle) * (28 + offset));
      ctx.lineTo(player.x - Math.cos(player.angle) * (42 + offset), player.y - Math.sin(player.angle) * (42 + offset));
      ctx.stroke();
    }
    ctx.restore();
  }
  if (weaponState.reloading) {
    ctx.fillStyle = "rgba(0,0,0,.65)";
    ctx.fillRect(player.x - 28, player.y + 36, 56, 5);
    ctx.fillStyle = currentWeapon(player).color;
    const progress = 1 - weaponState.reloadTimer / currentWeapon(player).reload;
    ctx.fillRect(player.x - 28, player.y + 36, 56 * Math.max(0, progress), 5);
  }
  ctx.restore();
}

function drawBot(bot, time) {
  if (!bot.alive) return;
  const pulse = 1 + Math.sin(time * 0.006 + bot.y) * 0.05;
  ctx.save();
  ctx.translate(bot.x, bot.y);
  ctx.rotate(bot.angle);

  ctx.globalAlpha = 0.16;
  ctx.fillStyle = bot.color;
  ctx.beginPath();
  ctx.arc(0, 0, 36 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.shadowColor = bot.color;
  ctx.shadowBlur = 16;
  ctx.fillStyle = bot.hitFlash > 0 ? "#ffffff" : bot.darkColor;
  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = bot.color;
  ctx.lineWidth = 4;
  ctx.setLineDash([7, 5]);
  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_RADIUS - 3, -2.2, 2.2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#090d17";
  ctx.fillRect(8, -8, 32, 16);
  ctx.fillStyle = bot.weaponColor;
  ctx.fillRect(23, -4, 21, 8);
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(4, -8);
  ctx.lineTo(4, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "700 11px Chakra Petch, sans-serif";
  ctx.fillStyle = bot.color;
  ctx.fillText(bot.label, bot.x, bot.y - 42);
  ctx.fillStyle = "rgba(0,0,0,.7)";
  ctx.fillRect(bot.x - 28, bot.y + 34, 56, 5);
  ctx.fillStyle = bot.color;
  ctx.fillRect(bot.x - 28, bot.y + 34, 56 * (bot.health / BOT_HEALTH), 5);
  ctx.font = "700 9px Chakra Petch, sans-serif";
  ctx.fillStyle = bot.reloading ? "#ffffff" : bot.color;
  ctx.fillText(
    bot.reloading
      ? `RELOAD ${Math.max(0, bot.reloadTimer).toFixed(1)}s`
      : `${bot.ammo} / ${weapons[bot.weaponIndex].magSize}`,
    bot.x,
    bot.y + 53,
  );
  ctx.restore();
}

function drawPickup(pickup, time) {
  const isMedkit = pickup.type === "medkit";
  const isDamage = pickup.type === "damage";
  const isInvincible = pickup.type === "invincible";
  const color = isMedkit ? "#55f59b" : isDamage ? "#ffb13b" : isInvincible ? "#b57bff" : "#56a8ff";
  const bob = Math.sin(time * 0.004 + pickup.x) * 4;
  const pulse = 1 + Math.sin(time * 0.007 + pickup.y) * 0.09;

  ctx.save();
  ctx.translate(pickup.x, pickup.y + bob);
  ctx.scale(pulse, pulse);

  ctx.globalAlpha = 0.14;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#101722";
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.shadowColor = color;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.roundRect(-17, -17, 34, 34, 7);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = color;
  if (isMedkit) {
    ctx.fillRect(-4, -11, 8, 22);
    ctx.fillRect(-11, -4, 22, 8);
  } else if (isDamage) {
    ctx.beginPath();
    ctx.moveTo(2, -13);
    ctx.lineTo(-10, 3);
    ctx.lineTo(-2, 3);
    ctx.lineTo(-6, 13);
    ctx.lineTo(11, -5);
    ctx.lineTo(3, -5);
    ctx.closePath();
    ctx.fill();
  } else if (isInvincible) {
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(11, -7);
    ctx.lineTo(9, 5);
    ctx.quadraticCurveTo(7, 12, 0, 15);
    ctx.quadraticCurveTo(-7, 12, -9, 5);
    ctx.lineTo(-11, -7);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(-12, 5);
    ctx.lineTo(-4, 5);
    ctx.lineTo(1, -10);
    ctx.lineTo(8, -10);
    ctx.lineTo(5, 3);
    ctx.lineTo(13, 8);
    ctx.lineTo(9, 13);
    ctx.lineTo(-9, 13);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "700 10px Noto Sans SC, sans-serif";
  ctx.fillStyle = color;
  ctx.fillText(
    isMedkit ? "+30 生命" : isDamage ? "150% 攻击" : isInvincible ? "5秒无敌" : "120% 速度",
    pickup.x,
    pickup.y + bob + 34,
  );
  ctx.restore();
}

function drawEffects() {
  ctx.save();
  ctx.lineCap = "round";
  trails.forEach((trail) => {
    ctx.globalAlpha = Math.min(1, trail.life / 0.08);
    ctx.strokeStyle = trail.color;
    ctx.shadowColor = trail.color;
    ctx.shadowBlur = 9;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(trail.x1, trail.y1);
    ctx.lineTo(trail.x2, trail.y2);
    ctx.stroke();
  });
  ctx.restore();

  bullets.forEach((bullet) => {
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  particles.forEach((particle) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 8;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    ctx.restore();
  });
}

function render(time) {
  ctx.save();
  if (screenShake > 0) {
    ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
  }
  drawArena(time);
  obstacles.forEach(drawObstacle);
  pickups.forEach((pickup) => drawPickup(pickup, time));
  drawEffects();
  if (gameMode === "campaign") {
    drawPlayer(players[0], time);
    bots.forEach((bot) => drawBot(bot, time));
  } else {
    players.forEach((player) => drawPlayer(player, time));
  }
  ctx.restore();
}

function playTone(frequency, duration, type = "sine", volume = 0.03) {
  if (!soundEnabled) return;
  try {
    audioContext ??= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch {
    soundEnabled = false;
  }
}

function playVictory() {
  [262, 330, 392, 523].forEach((note, index) => {
    window.setTimeout(() => playTone(note, 0.13, "square", 0.025), index * 90);
  });
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;

  if (!paused) {
    if (state === "countdown") updateCountdown(now);
    if (state === "playing") {
      if (gameMode === "campaign") {
        campaignElapsed += dt;
        updatePlayer(players[0], dt);
        updateBots(dt);
      } else {
        roundTimer = Math.max(0, roundTimer - dt);
        players.forEach((player) => updatePlayer(player, dt));
      }
      updateBullets(dt);
      updatePickups(dt);
      if (gameMode === "duel" && roundTimer <= 0 && state === "playing") endRoundByTime();
    }
    updateEffects(dt);
    updateUI();
  }
  render(now);
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  const blockedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "ShiftLeft", "ShiftRight", "Slash", "KeyK", "KeyL", "KeyO", "Semicolon"];
  if (blockedKeys.includes(event.code)) event.preventDefault();
  keys.add(event.code);

  if (!event.repeat && event.code === players[0].switchKey) switchWeapon(players[0]);
  if (gameMode === "duel" && !event.repeat && event.code === players[1].switchKey) switchWeapon(players[1]);
  if (!event.repeat && event.code === players[0].reloadKey) beginReload(players[0]);
  if (gameMode === "duel" && !event.repeat && event.code === players[1].reloadKey) beginReload(players[1]);
  if (!event.repeat && event.code === "KeyR") {
    if (gameMode === "campaign") startCampaignLevel(campaignLevel);
    else continueGame();
  }
  if (!event.repeat && event.code === "Space" && state !== "roundOver" && state !== "modeSelect") {
    paused = !paused;
    UI.pausePanel.classList.toggle("hidden", !paused);
    if (!paused && state === "countdown") {
      countdownStarted = performance.now();
    }
  }
});

window.addEventListener("keyup", (event) => keys.delete(event.code));
window.addEventListener("blur", () => keys.clear());

UI.restartButton.addEventListener("click", continueGame);
UI.p2MovementButton.addEventListener("click", toggleP2MovementMode);
UI.campaignMovementButton.addEventListener("click", toggleCampaignMovementMode);
UI.modeButton.addEventListener("click", openModePanel);
UI.closeModeButton.addEventListener("click", closeModePanel);
UI.duelModeButton.addEventListener("click", startMatch);
UI.campaignModeButton.addEventListener("click", showLevelSelect);
UI.backModeButton.addEventListener("click", showModeHome);
UI.level1Button.addEventListener("click", () => startCampaignLevel(1));
UI.level2Button.addEventListener("click", () => startCampaignLevel(2));
UI.level3Button.addEventListener("click", () => startCampaignLevel(3));
UI.soundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  UI.soundButton.textContent = `声音：${soundEnabled ? "开" : "关"}`;
  if (soundEnabled) playTone(330, 0.08, "sine", 0.025);
});

updateP2MovementControls();
startMatch();
requestAnimationFrame(loop);
