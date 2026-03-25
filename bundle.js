(() => {
  // src/input.js
  var InputManager = class {
    constructor(canvas) {
      this.keys = {};
      this.prevKeys = {};
      this.mouseButtons = {};
      this.prevMouseButtons = {};
      this.mouse = { x: 0, y: 0 };
      this.canvas = canvas;
      window.addEventListener("keydown", (e) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
          e.preventDefault();
        }
        this.keys[e.code] = true;
      });
      window.addEventListener("keyup", (e) => {
        this.keys[e.code] = false;
      });
      window.addEventListener("blur", () => this.keys = {});
      window.addEventListener("mousemove", (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        this.mouse.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
      });
      window.addEventListener("mousedown", (e) => this.mouseButtons[e.button] = true);
      window.addEventListener("mouseup", (e) => this.mouseButtons[e.button] = false);
    }
    isHeld(code) {
      return !!this.keys[code];
    }
    wasJustPressed(code) {
      return !!this.keys[code] && !this.prevKeys[code];
    }
    isMouseHeld(button) {
      return !!this.mouseButtons[button];
    }
    wasJustClicked(button) {
      return !!this.mouseButtons[button] && !this.prevMouseButtons[button];
    }
    flush() {
      this.prevKeys = { ...this.keys };
      this.prevMouseButtons = { ...this.mouseButtons };
    }
  };

  // src/audio.js
  var AudioManager = class {
    constructor() {
      this.sounds = {};
      this.unlocked = false;
      window.addEventListener("keydown", () => this.unlocked = true, { once: true });
      window.addEventListener("mousedown", () => this.unlocked = true, { once: true });
    }
    load(name, path) {
      const audio = new Audio(path);
      audio.preload = "auto";
      this.sounds[name] = audio;
    }
    play(name, volume = 1) {
      if (!this.unlocked) return;
      const sound = this.sounds[name];
      if (!sound) return;
      const clone = sound.cloneNode();
      clone.volume = volume;
      clone.play().catch(() => {
      });
    }
    playMusic(name, volume = 0.4) {
      const sound = this.sounds[name];
      if (!sound) return;
      sound.loop = true;
      sound.volume = volume;
      sound.play().catch(() => {
      });
    }
    stopMusic(name) {
      const sound = this.sounds[name];
      if (!sound) return;
      sound.pause();
      sound.currentTime = 0;
    }
  };

  // src/particles.js
  function emitExplosion(particles, x, y, color = "orange", count = 40) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 200;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        life: 1,
        decay: 0.8 + Math.random() * 0.8,
        color
      });
    }
  }
  function emitScorePopup(particles, x, y, score) {
    particles.push({
      type: "popup",
      x,
      y,
      vy: -60,
      life: 1,
      decay: 1.2,
      text: `+${score}`
    });
  }
  function updateParticles(particles, dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += (p.vx ?? 0) * dt;
      p.y += (p.vy ?? 0) * dt;
      if (p.vx !== void 0) p.vx *= 0.95;
      if (p.vy !== void 0 && p.type !== "popup") p.vy *= 0.95;
      p.life -= p.decay * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }
  function renderParticles(particles, ctx) {
    ctx.textAlign = "center";
    ctx.font = "bold 18px Arial";
    for (const p of particles) {
      ctx.globalAlpha = p.life;
      if (p.type === "popup") {
        ctx.fillStyle = "#ffd700";
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    }
    ctx.globalAlpha = 1;
  }

  // src/level.js
  var Level = class {
    constructor(data) {
      this.walls = data.walls;
      this.enemySpawns = data.enemySpawns;
      this.playerSpawn = data.playerSpawn;
    }
    // Level.js
    render(ctx) {
      ctx.fillStyle = "#8B7355";
      for (const wall of this.walls) {
        ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      }
    }
    getWalls() {
      return this.walls;
    }
  };

  // src/levels.js
  var LEVEL_1 = {
    playerSpawn: { x: 80, y: 240 },
    enemySpawns: [
      { x: 720, y: 180, type: "brown" },
      { x: 720, y: 320, type: "brown" }
    ],
    walls: [
      // Border walls
      { x: 0, y: 0, w: 900, h: 20 },
      // top
      { x: 0, y: 480, w: 900, h: 20 },
      // bottom
      { x: 0, y: 0, w: 20, h: 500 },
      // left
      { x: 880, y: 0, w: 20, h: 500 },
      // right
      // Center square — left side open
      { x: 380, y: 160, w: 140, h: 20 },
      // top
      { x: 380, y: 320, w: 140, h: 20 },
      // bottom
      { x: 500, y: 160, w: 20, h: 180 },
      // right side
      // Corridor wall — nudges player toward opening
      { x: 260, y: 200, w: 20, h: 100 }
    ]
  };
  var LEVEL_2 = {
    playerSpawn: { x: 80, y: 240 },
    enemySpawns: [
      { x: 700, y: 100, type: "brown" },
      { x: 700, y: 380, type: "brown" },
      { x: 500, y: 240, type: "gray" },
      { x: 780, y: 240, type: "gray" },
      { x: 400, y: 100, type: "teal" }
    ],
    walls: [
      // borders
      { x: 0, y: 0, w: 900, h: 20 },
      { x: 0, y: 480, w: 900, h: 20 },
      { x: 0, y: 0, w: 20, h: 500 },
      { x: 880, y: 0, w: 20, h: 500 },
      // left corridor divider
      { x: 200, y: 20, w: 20, h: 180 },
      { x: 200, y: 300, w: 20, h: 180 },
      // center divider with gap
      { x: 450, y: 20, w: 20, h: 160 },
      { x: 450, y: 320, w: 20, h: 160 },
      // right side cover
      { x: 650, y: 150, w: 20, h: 200 }
    ]
  };
  var LEVEL_3 = {
    playerSpawn: { x: 80, y: 240 },
    enemySpawns: [
      { x: 700, y: 100, type: "gray" },
      { x: 700, y: 380, type: "gray" },
      { x: 500, y: 240, type: "teal" },
      { x: 780, y: 150, type: "teal" },
      { x: 780, y: 350, type: "teal" },
      { x: 400, y: 380, type: "black" }
    ],
    walls: [
      // borders
      { x: 0, y: 0, w: 900, h: 20 },
      { x: 0, y: 480, w: 900, h: 20 },
      { x: 0, y: 0, w: 20, h: 500 },
      { x: 880, y: 0, w: 20, h: 500 },
      // left room
      { x: 200, y: 20, w: 20, h: 160 },
      { x: 200, y: 320, w: 20, h: 160 },
      { x: 20, y: 180, w: 180, h: 20 },
      { x: 20, y: 300, w: 180, h: 20 },
      // center cross
      { x: 420, y: 140, w: 20, h: 100 },
      { x: 420, y: 260, w: 20, h: 100 },
      { x: 340, y: 220, w: 100, h: 20 },
      { x: 480, y: 220, w: 100, h: 20 },
      // right cover
      { x: 650, y: 20, w: 20, h: 140 },
      { x: 650, y: 340, w: 20, h: 140 }
    ]
  };
  var LEVEL_4 = {
    playerSpawn: { x: 80, y: 140 },
    enemySpawns: [
      { x: 650, y: 100, type: "teal" },
      { x: 650, y: 380, type: "teal" },
      { x: 780, y: 240, type: "black" },
      { x: 600, y: 240, type: "black" },
      { x: 780, y: 100, type: "black" },
      { x: 400, y: 380, type: "white" }
    ],
    walls: [
      // borders
      { x: 0, y: 0, w: 900, h: 20 },
      { x: 0, y: 480, w: 900, h: 20 },
      { x: 0, y: 0, w: 20, h: 500 },
      { x: 880, y: 0, w: 20, h: 500 },
      // player side cover
      { x: 150, y: 100, w: 20, h: 120 },
      { x: 150, y: 280, w: 20, h: 120 },
      { x: 20, y: 220, w: 130, h: 20 },
      // center barriers
      { x: 380, y: 20, w: 20, h: 120 },
      { x: 380, y: 360, w: 20, h: 120 },
      { x: 380, y: 220, w: 120, h: 20 },
      // right side obstacles
      { x: 560, y: 120, w: 80, h: 20 },
      { x: 560, y: 360, w: 80, h: 20 }
    ]
  };
  var LEVEL_5 = {
    playerSpawn: { x: 80, y: 240 },
    enemySpawns: [
      { x: 500, y: 150, type: "gray" },
      { x: 500, y: 350, type: "gray" },
      { x: 650, y: 240, type: "teal" },
      { x: 780, y: 150, type: "black" },
      { x: 780, y: 350, type: "black" },
      { x: 820, y: 240, type: "white" }
    ],
    walls: [
      // borders
      { x: 0, y: 0, w: 900, h: 20 },
      { x: 0, y: 480, w: 900, h: 20 },
      { x: 0, y: 0, w: 20, h: 500 },
      { x: 880, y: 0, w: 20, h: 500 },
      // left maze
      { x: 150, y: 20, w: 20, h: 140 },
      { x: 150, y: 340, w: 20, h: 140 },
      { x: 20, y: 160, w: 130, h: 20 },
      { x: 20, y: 320, w: 130, h: 20 },
      // center island
      { x: 360, y: 160, w: 120, h: 20 },
      { x: 360, y: 320, w: 120, h: 20 },
      { x: 360, y: 180, w: 20, h: 140 },
      { x: 460, y: 180, w: 20, h: 140 },
      // right corridors
      { x: 580, y: 20, w: 20, h: 100 },
      { x: 580, y: 200, w: 20, h: 100 },
      { x: 580, y: 380, w: 20, h: 100 },
      { x: 700, y: 120, w: 20, h: 100 },
      { x: 700, y: 280, w: 20, h: 100 }
    ]
  };

  // src/entity.js
  var Entity = class {
    constructor(x = 0, y = 0, vx = 0, vy = 0) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
    }
    update(dt) {
      throw new Error(`${this.constructor.name} must implement update()`);
    }
    render(ctx) {
      throw new Error(`${this.constructor.name} must implement render()`);
    }
  };

  // src/eventBus.js
  var eventBus = {
    queue: [],
    push(event) {
      this.queue.push(event);
    },
    drain() {
      const q = this.queue;
      this.queue = [];
      return q;
    }
  };

  // src/tank.js
  var Tank = class extends Entity {
    constructor(x, y, w = 40, h = 36) {
      super(x, y, 0, 0);
      this.w = w;
      this.h = h;
      this.color = void 0;
      this.gunColor = void 0;
      this.bulletColor = void 0;
      this.bulletSpeed = void 0;
      this.health = void 0;
      this.trackAngle = 0;
      this.gunAngle = 0;
      this.maxBounces = void 0;
      this.fireCooldown = 0;
      this.fireRate = void 0;
      this.speed = void 0;
      this.rotationSpeed = void 0;
      this.muzzleFlash = 0;
    }
    update(dt) {
      if (this.fireCooldown > 0) this.fireCooldown -= dt;
      if (this.muzzleFlash > 0) this.muzzleFlash -= dt;
    }
    fire() {
      if (this.fireCooldown > 0) return;
      this.fireCooldown = this.fireRate;
      this.muzzleFlash = 0.08;
      const angle = this.trackAngle + this.gunAngle;
      const barrelLength = this.w * 0.75;
      eventBus.push({
        type: "SPAWN_BULLET",
        owner: this,
        x: this.x + this.w / 2 + Math.cos(angle) * barrelLength,
        y: this.y + this.h / 2 + Math.sin(angle) * barrelLength,
        vx: Math.cos(angle) * this.bulletSpeed,
        vy: Math.sin(angle) * this.bulletSpeed,
        color: this.bulletColor,
        bounces: this.maxBounces
      });
      eventBus.push({ type: "PLAY_SOUND", sound: "shoot" });
    }
    render(ctx) {
      ctx.save();
      ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
      ctx.rotate(this.trackAngle);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      ctx.rotate(this.gunAngle);
      ctx.fillStyle = this.gunColor;
      ctx.fillRect(0, -4, this.w * 0.75, this.h * 0.33);
      if (this.muzzleFlash > 0) {
        const barrelLength = this.w * 0.75;
        ctx.fillStyle = "rgba(255, 255, 180, 0.9)";
        ctx.beginPath();
        ctx.arc(barrelLength, 0, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  };

  // src/playerTank.js
  var Player = class extends Tank {
    constructor(x, y) {
      super(x, y);
      this.color = "green";
      this.gunColor = "darkgreen";
      this.bulletColor = "yellow";
      this.bulletSpeed = 400;
      this.health = 1;
      this.maxBounces = 2;
      this.fireRate = 1;
      this.speed = 150;
      this.rotationSpeed = 2;
      this.prevX = 0;
      this.prevY = 0;
      this.isMoving = false;
    }
    update(dt, input) {
      this.prevX = this.x;
      this.prevY = this.y;
      super.update(dt);
      if (input.isHeld("ArrowUp") || input.isHeld("KeyW")) {
        this.x += Math.cos(this.trackAngle) * this.speed * dt;
        this.y += Math.sin(this.trackAngle) * this.speed * dt;
      }
      if (input.isHeld("ArrowDown") || input.isHeld("KeyS")) {
        this.x -= Math.cos(this.trackAngle) * this.speed * dt;
        this.y -= Math.sin(this.trackAngle) * this.speed * dt;
      }
      if (input.isHeld("ArrowLeft") || input.isHeld("KeyA")) {
        this.trackAngle -= this.rotationSpeed * dt;
      }
      if (input.isHeld("ArrowRight") || input.isHeld("KeyD")) {
        this.trackAngle += this.rotationSpeed * dt;
      }
      const dx = input.mouse.x - (this.x + this.w / 2);
      const dy = input.mouse.y - (this.y + this.h / 2);
      this.gunAngle = Math.atan2(dy, dx) - this.trackAngle;
      if (input.wasJustClicked(0)) {
        this.fire();
      }
    }
  };

  // src/collision/rayAABB.js
  function rayAABB(x1, y1, x2, y2, rect) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const tMinX = (rect.x - x1) / dx;
    const tMaxX = (rect.x + rect.w - x1) / dx;
    const tMinY = (rect.y - y1) / dy;
    const tMaxY = (rect.y + rect.h - y1) / dy;
    const tEnter = Math.max(Math.min(tMinX, tMaxX), Math.min(tMinY, tMaxY));
    const tExit = Math.min(Math.max(tMinX, tMaxX), Math.max(tMinY, tMaxY));
    return tEnter <= tExit && tExit >= 0 && tEnter <= 1;
  }
  function hasLOS(tank, context) {
    const player = context.player;
    const x1 = tank.x + tank.w / 2;
    const y1 = tank.y + tank.h / 2;
    const x2 = player.x + player.w / 2;
    const y2 = player.y + player.h / 2;
    for (const wall of context.walls) {
      if (rayAABB(x1, y1, x2, y2, wall)) return false;
    }
    return true;
  }

  // src/collision/aabb.js
  function overlapAABB(a, b) {
    const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    if (overlapX <= 0 || overlapY <= 0) return null;
    return { overlapX, overlapY };
  }

  // src/collision/circleAABB.js
  function circleAABB(circle, rect) {
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    return dx * dx + dy * dy <= circle.r ** 2;
  }
  function circleAABBNormal(circle, rect) {
    if (!circleAABB(circle, rect)) return null;
    const overlapLeft = circle.x + circle.r - rect.x;
    const overlapRight = rect.x + rect.w - (circle.x - circle.r);
    const overlapTop = circle.y + circle.r - rect.y;
    const overlapBottom = rect.y + rect.h - (circle.y - circle.r);
    const min = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
    if (min === overlapLeft) return { nx: -1, ny: 0, depth: overlapLeft };
    if (min === overlapRight) return { nx: 1, ny: 0, depth: overlapRight };
    if (min === overlapTop) return { nx: 0, ny: -1, depth: overlapTop };
    return { nx: 0, ny: 1, depth: overlapBottom };
  }

  // src/bullet.js
  var Bullet = class extends Entity {
    constructor(x = 0, y = 0, vx = 0, vy = 0, color = "yellow", bounces = 1, r = 6, owner = null) {
      super(x, y, vx, vy);
      this.color = color;
      this.bounces = bounces;
      this.bounceCount = 0;
      this.r = r;
      this.owner = owner;
      this.spawnImmunity = 0.05;
    }
    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (this.spawnImmunity > 0) this.spawnImmunity -= dt;
    }
    render(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  };

  // src/enemyData.js
  var ENEMY_DATA = {
    brown: {
      color: "brown",
      gunColor: "saddlebrown",
      bulletColor: "orange",
      hitValue: 25,
      // score per hit
      scoreValue: 75,
      // bonus on kill
      bulletSpeed: 350,
      health: 1,
      maxBounces: 1,
      fireRate: 2,
      speed: 0,
      rotationSpeed: 0
    },
    gray: {
      color: "gray",
      gunColor: "darkgray",
      bulletColor: "white",
      bulletSpeed: 350,
      hitValue: 40,
      scoreValue: 110,
      health: 1,
      maxBounces: 1,
      fireRate: 1.5,
      speed: 80,
      rotationSpeed: 2
    },
    teal: {
      color: "teal",
      gunColor: "darkcyan",
      bulletColor: "cyan",
      bulletSpeed: 375,
      hitValue: 50,
      scoreValue: 200,
      health: 2,
      maxBounces: 2,
      fireRate: 1.2,
      speed: 100,
      rotationSpeed: 2.5
    },
    black: {
      color: "#222",
      gunColor: "#444",
      bulletColor: "white",
      bulletSpeed: 400,
      hitValue: 75,
      scoreValue: 300,
      health: 2,
      maxBounces: 2,
      fireRate: 1.8,
      speed: 90,
      rotationSpeed: 2
    },
    white: {
      color: "white",
      gunColor: "#ccc",
      bulletColor: "lightblue",
      bulletSpeed: 450,
      hitValue: 60,
      scoreValue: 250,
      health: 1,
      maxBounces: 1,
      fireRate: 0.6,
      // fires frequently
      speed: 160,
      // noticeably faster than others
      rotationSpeed: 3
    }
  };

  // src/enemyTank.js
  var EnemyTank = class extends Tank {
    constructor(x, y, type, ai) {
      super(x, y);
      const data = ENEMY_DATA[type];
      this.color = data.color;
      this.gunColor = data.gunColor;
      this.bulletColor = data.bulletColor;
      this.bulletSpeed = data.bulletSpeed;
      this.health = data.health;
      this.maxBounces = data.maxBounces;
      this.fireRate = data.fireRate;
      this.speed = data.speed;
      this.rotationSpeed = data.rotationSpeed;
      this.hitValue = data.hitValue;
      this.scoreValue = data.scoreValue;
      this.ai = ai;
    }
    update(dt, context) {
      super.update(dt);
      this.ai.update(this, dt, context);
    }
    moveToward(targetX, targetY, dt) {
      const dx = targetX - (this.x + this.w / 2);
      const dy = targetY - (this.y + this.h / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const angle = Math.atan2(dy, dx);
      this.trackAngle = angle;
      this.x += dx / dist * this.speed * dt;
      this.y += dy / dist * this.speed * dt;
    }
  };

  // src/ai/brownAI.js
  var BrownAI = class {
    update(tank, dt, context) {
      const dx = context.player.x + context.player.w / 2 - (tank.x + tank.w / 2);
      const dy = context.player.y + context.player.h / 2 - (tank.y + tank.h / 2);
      tank.gunAngle = Math.atan2(dy, dx) - tank.trackAngle;
      tank.fire();
    }
  };

  // src/ai/grayAI.js
  var GrayAI = class {
    update(tank, dt, context) {
      const playerCX = context.player.x + context.player.w / 2;
      const playerCY = context.player.y + context.player.h / 2;
      tank.moveToward(playerCX, playerCY, dt);
      if (hasLOS(tank, context)) {
        const dx = playerCX - (tank.x + tank.w / 2);
        const dy = playerCY - (tank.y + tank.h / 2);
        tank.gunAngle = Math.atan2(dy, dx) - tank.trackAngle;
        tank.fire();
      }
    }
  };

  // src/ai/tealAI.js
  var PATROL_RADIUS = 200;
  var LOST_DELAY = 0.5;
  var PATROL_TIMEOUT = 2;
  var AI_STATE = {
    PATROL: "patrol",
    CHASE: "chase",
    LOST: "lost"
  };
  var TealAI = class {
    constructor() {
      this.state = AI_STATE.PATROL;
      this.lostTimer = 0;
      this.patrolTarget = null;
      this.patrolTimer = 0;
    }
    pickPatrolTarget(tank) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * PATROL_RADIUS;
      this.patrolTarget = {
        x: tank.x + Math.cos(angle) * radius,
        y: tank.y + Math.sin(angle) * radius
      };
      this.patrolTimer = PATROL_TIMEOUT;
    }
    update(tank, dt, context) {
      const los = hasLOS(tank, context);
      switch (this.state) {
        case AI_STATE.PATROL:
          this.updatePatrol(tank, dt, context, los);
          break;
        case AI_STATE.CHASE:
          this.updateChase(tank, dt, context, los);
          break;
        case AI_STATE.LOST:
          this.updateLost(tank, dt, los);
          break;
      }
    }
    updatePatrol(tank, dt, context, los) {
      if (los) {
        this.state = AI_STATE.CHASE;
        return;
      }
      this.patrolTimer -= dt;
      if (!this.patrolTarget || this.patrolTimer <= 0) {
        this.pickPatrolTarget(tank);
      }
      const dx = this.patrolTarget.x - (tank.x + tank.w / 2);
      const dy = this.patrolTarget.y - (tank.y + tank.h / 2);
      const dist = Math.hypot(dx, dy);
      if (dist < 10) {
        this.patrolTarget = null;
        return;
      }
      tank.moveToward(this.patrolTarget.x, this.patrolTarget.y, dt);
    }
    updateChase(tank, dt, context, los) {
      if (!los) {
        this.state = AI_STATE.LOST;
        this.lostTimer = LOST_DELAY;
        return;
      }
      const playerCX = context.player.x + context.player.w / 2;
      const playerCY = context.player.y + context.player.h / 2;
      tank.moveToward(playerCX, playerCY, dt);
      const dx = playerCX - (tank.x + tank.w / 2);
      const dy = playerCY - (tank.y + tank.h / 2);
      tank.gunAngle = Math.atan2(dy, dx) - tank.trackAngle;
      tank.fire();
    }
    updateLost(tank, dt, los) {
      if (los) {
        this.state = AI_STATE.CHASE;
        return;
      }
      tank.x += Math.cos(tank.trackAngle) * tank.speed * dt;
      tank.y += Math.sin(tank.trackAngle) * tank.speed * dt;
      this.lostTimer -= dt;
      if (this.lostTimer <= 0) {
        this.state = AI_STATE.PATROL;
        this.patrolTarget = null;
      }
    }
  };

  // src/ai/blackAI.js
  var PREFERRED_DISTANCE = 250;
  var DISTANCE_TOLERANCE = 50;
  var BlackAI = class {
    update(tank, dt, context) {
      const playerCX = context.player.x + context.player.w / 2;
      const playerCY = context.player.y + context.player.h / 2;
      const dx = playerCX - (tank.x + tank.w / 2);
      const dy = playerCY - (tank.y + tank.h / 2);
      const dist = Math.hypot(dx, dy);
      const los = hasLOS(tank, context);
      this.reposition(tank, dt, dx, dy, dist, los, playerCX, playerCY);
      if (los) {
        this.aimAndFire(tank, dt, context, playerCX, playerCY, dist);
      }
    }
    reposition(tank, dt, dx, dy, dist, los, playerCX, playerCY) {
      if (!los) {
        tank.moveToward(playerCX, playerCY, dt);
        return;
      }
      if (dist < PREFERRED_DISTANCE - DISTANCE_TOLERANCE) {
        tank.x -= dx / dist * tank.speed * dt;
        tank.y -= dy / dist * tank.speed * dt;
      } else if (dist > PREFERRED_DISTANCE + DISTANCE_TOLERANCE) {
        tank.moveToward(playerCX, playerCY, dt);
      }
    }
    aimAndFire(tank, dt, context, playerCX, playerCY, dist) {
      const playerVx = (context.player.x - context.player.prevX) / dt;
      const playerVy = (context.player.y - context.player.prevY) / dt;
      const timeToHit = dist / tank.bulletSpeed;
      const predictedX = playerCX + playerVx * timeToHit;
      const predictedY = playerCY + playerVy * timeToHit;
      const aimDx = predictedX - (tank.x + tank.w / 2);
      const aimDy = predictedY - (tank.y + tank.h / 2);
      tank.gunAngle = Math.atan2(aimDy, aimDx) - tank.trackAngle;
      tank.fire();
    }
  };

  // src/ai/whiteAI.js
  var DIRECTION_CHANGE_INTERVAL = 0.8;
  var MAX_ANGLE_OFFSET = Math.PI / 2;
  var INACCURACY = 0.6;
  var WhiteAI = class {
    constructor() {
      this.directionTimer = 0;
      this.moveAngle = 0;
    }
    update(tank, dt, context) {
      const playerCX = context.player.x + context.player.w / 2;
      const playerCY = context.player.y + context.player.h / 2;
      const dx = playerCX - (tank.x + tank.w / 2);
      const dy = playerCY - (tank.y + tank.h / 2);
      this.updateMovement(tank, dt, dx, dy);
      if (hasLOS(tank, context)) {
        this.shoot(tank, dx, dy);
      }
    }
    updateMovement(tank, dt, dx, dy) {
      this.directionTimer -= dt;
      if (this.directionTimer <= 0) {
        const angleToPlayer = Math.atan2(dy, dx);
        const offset = (Math.random() - 0.5) * 2 * MAX_ANGLE_OFFSET;
        this.moveAngle = angleToPlayer + offset;
        this.directionTimer = DIRECTION_CHANGE_INTERVAL;
      }
      tank.trackAngle = this.moveAngle;
      tank.x += Math.cos(this.moveAngle) * tank.speed * dt;
      tank.y += Math.sin(this.moveAngle) * tank.speed * dt;
    }
    shoot(tank, dx, dy) {
      const inaccuracy = (Math.random() - 0.5) * INACCURACY;
      tank.gunAngle = Math.atan2(dy, dx) - tank.trackAngle + inaccuracy;
      tank.fire();
    }
  };

  // src/game.js
  var STATE = {
    MENU: "menu",
    LEVEL_SELECT: "level_select",
    PLAYING: "playing",
    PAUSED: "paused",
    GAMEOVER: "gameover",
    WIN: "win"
  };
  var AI_MAP = {
    brown: BrownAI,
    gray: GrayAI,
    teal: TealAI,
    black: BlackAI,
    white: WhiteAI
  };
  var BOUNCE_MULTIPLIER = 1.1;
  var FRIENDLY_FIRE_MULTIPLIER = 1.5;
  var Game = class {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext("2d");
      this.state = STATE.MENU;
      this.lastTime = 0;
      this.score = 0;
      this.displayScore = 0;
      this.particles = [];
      this.bullets = [];
      this.enemies = [];
      this.shakeTime = 0;
      this.shakeMagnitude = 0;
      this.input = new InputManager(this.canvas);
      this.levels = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5];
      this.selectedLevel = 0;
      this.level = null;
      this.player = new Player();
      this.audio = new AudioManager();
      this.audio.load("shoot", "src/assets/audio/impactMetal_003.ogg");
      this.audio.load("bounce", "src/assets/audio/impactMetal_000.ogg");
      this.audio.load("explosion", "src/assets/audio/explosionCrunch_001.ogg");
      this.audio.load("music", "src/assets/audio/Scheme_inc.ogg");
    }
    start() {
      this.loop(performance.now());
    }
    loop(timestamp) {
      const dt = Math.min(0.033, (timestamp - this.lastTime) / 1e3);
      this.lastTime = timestamp;
      this.update(dt);
      this.render();
      requestAnimationFrame((t) => this.loop(t));
    }
    setState(newState) {
      switch (newState) {
        case STATE.PLAYING: {
          this.resetGame();
          this.audio.playMusic("music");
          break;
        }
        case STATE.WIN: {
          this.score = Math.max(0, this.score);
          this.audio.stopMusic("music");
          break;
        }
        case STATE.GAMEOVER: {
          this.audio.stopMusic("music");
          break;
        }
        case STATE.LEVEL_SELECT: {
          this.selectedLevel = 0;
          break;
        }
      }
      this.state = newState;
    }
    resetGame() {
      this.bullets = [];
      this.particles = [];
      this.score = 0;
      this.displayScore = 0;
      this.winDelay = null;
      this.player = new Player(this.level.playerSpawn.x, this.level.playerSpawn.y);
      this.shakeTime = 0;
      this.shakeMagnitude = 0;
      this.enemies = this.level.enemySpawns.map((spawn) => {
        const AIClass = AI_MAP[spawn.type];
        return new EnemyTank(spawn.x, spawn.y, spawn.type, new AIClass());
      });
    }
    update(dt) {
      switch (this.state) {
        case STATE.MENU:
          this.updateMenu(dt);
          break;
        case STATE.LEVEL_SELECT:
          this.updateLevelSelect(dt);
          break;
        case STATE.PLAYING:
          this.updatePlaying(dt);
          break;
        case STATE.GAMEOVER:
          this.updateGameOver(dt);
          break;
        case STATE.WIN:
          this.updateWin(dt);
          break;
      }
      this.input.flush();
    }
    render() {
      switch (this.state) {
        case STATE.MENU:
          this.renderMenu();
          break;
        case STATE.LEVEL_SELECT:
          this.renderLevelSelect();
          break;
        case STATE.PLAYING:
          this.renderPlaying();
          break;
        case STATE.GAMEOVER:
          this.renderGameOver();
          break;
        case STATE.WIN:
          this.renderWin();
          break;
      }
    }
    updateMenu(dt) {
      if (this.input.wasJustPressed("Space")) {
        this.setState(STATE.LEVEL_SELECT);
      }
    }
    updateGameOver(dt) {
      if (this.input.wasJustPressed("Space")) {
        this.setState(STATE.MENU);
      }
    }
    updatePlaying(dt) {
      this.player.update(dt, this.input);
      if (this.shakeTime > 0) this.shakeTime -= dt;
      this.displayScore += (this.score - this.displayScore) * 5 * dt;
      if (Math.abs(this.score - this.displayScore) < 0.3) {
        this.displayScore = this.score;
      }
      this.processEvents();
      this.updateBullets(dt);
      this.resolveBulletTankCollision();
      this.resolveTankCollision();
      this.updateEnemies(dt);
      updateParticles(this.particles, dt);
      this.checkWin(dt);
    }
    updateLevelSelect(dt) {
      if (this.input.wasJustPressed("ArrowUp") || this.input.wasJustPressed("KeyW")) {
        this.selectedLevel = Math.max(0, this.selectedLevel - 1);
      }
      if (this.input.wasJustPressed("ArrowDown") || this.input.wasJustPressed("KeyS")) {
        this.selectedLevel = Math.min(this.levels.length - 1, this.selectedLevel + 1);
      }
      if (this.input.wasJustPressed("Space")) {
        this.level = new Level(this.levels[this.selectedLevel]);
        this.setState(STATE.PLAYING);
      }
    }
    updateWin(dt) {
      if (this.input.wasJustPressed("Space")) {
        this.setState(STATE.LEVEL_SELECT);
      }
    }
    renderLevelSelect() {
      this.ctx.fillStyle = "#111";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "white";
      this.ctx.textAlign = "center";
      this.ctx.font = "bold 40px Arial";
      this.ctx.fillText("SELECT LEVEL", this.canvas.width / 2, 80);
      const labels = [
        "Level 1 \u2014 Stationary enemies",
        "Level 2 \u2014 Moving enemies introduced",
        "Level 3 \u2014 Patrol enemies",
        "Level 4 \u2014 Long range enemies",
        "Level 5 \u2014 All enemy types"
      ];
      this.ctx.font = "24px Arial";
      const startY = 160;
      const spacing = 55;
      for (let i = 0; i < this.levels.length; i++) {
        const y = startY + i * spacing;
        const isSelected = i === this.selectedLevel;
        this.ctx.fillStyle = isSelected ? "#ffd700" : "white";
        this.ctx.fillText(labels[i], this.canvas.width / 2, y);
        if (isSelected) {
          this.ctx.textAlign = "left";
          this.ctx.fillText("\u25BA", this.canvas.width / 2 - 220, y);
          this.ctx.textAlign = "center";
        }
      }
      this.ctx.fillStyle = "#888";
      this.ctx.font = "20px Arial";
      this.ctx.fillText("W/S or Arrows to select, SPACE to play", this.canvas.width / 2, 460);
    }
    renderWin() {
      this.renderPlaying();
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "#ffd700";
      this.ctx.textAlign = "center";
      this.ctx.font = "bold 52px Arial";
      this.ctx.fillText("LEVEL CLEAR", this.canvas.width / 2, 180);
      this.ctx.fillStyle = "white";
      this.ctx.font = "28px Arial";
      this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, 250);
      this.ctx.fillText("Press SPACE to return to level select", this.canvas.width / 2, 350);
    }
    renderMenu() {
      this.ctx.fillStyle = "#111";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "white";
      this.ctx.textAlign = "center";
      this.ctx.font = "bold 48px Arial";
      this.ctx.fillText("MI TANQUE", this.canvas.width / 2, 120);
      this.ctx.fillStyle = "#ffd700";
      this.ctx.font = "22px Arial";
      this.ctx.fillText("Destroy all enemy tanks to clear each level", this.canvas.width / 2, 180);
      this.ctx.fillStyle = "white";
      this.ctx.font = "20px Arial";
      this.ctx.fillText("Controls", this.canvas.width / 2, 240);
      this.ctx.fillStyle = "#aaa";
      this.ctx.font = "18px Arial";
      this.ctx.fillText("WASD / Arrow Keys \u2014 Move tank", this.canvas.width / 2, 275);
      this.ctx.fillText("Mouse \u2014 Aim turret", this.canvas.width / 2, 305);
      this.ctx.fillText("Left Click \u2014 Shoot", this.canvas.width / 2, 335);
      this.ctx.fillStyle = "white";
      this.ctx.font = "22px Arial";
      this.ctx.fillText("Press SPACE to select level", this.canvas.width / 2, 420);
    }
    renderGameOver() {
      this.renderPlaying();
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "#ff4d4d";
      this.ctx.textAlign = "center";
      this.ctx.font = "bold 52px Arial";
      this.ctx.fillText("GAME OVER", this.canvas.width / 2, 200);
      this.ctx.fillStyle = "white";
      this.ctx.font = "24px Arial";
      this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, 260);
      this.ctx.fillText("Press SPACE to return to menu", this.canvas.width / 2, 300);
    }
    renderPlaying() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const { dx, dy } = this.getShakeOffset();
      this.ctx.save();
      this.ctx.translate(dx, dy);
      this.level.render(this.ctx);
      this.player.render(this.ctx);
      for (const e of this.enemies) e.render(this.ctx);
      for (const b of this.bullets) b.render(this.ctx);
      renderParticles(this.particles, this.ctx);
      this.ctx.restore();
      this.ctx.fillStyle = "white";
      this.ctx.textAlign = "left";
      this.ctx.font = "20px Arial";
      this.ctx.fillText(`Score: ${Math.floor(this.displayScore)}`, 30, 50);
    }
    processEvents() {
      for (const event of eventBus.drain()) {
        switch (event.type) {
          case "SPAWN_BULLET":
            this.bullets.push(new Bullet(
              event.x,
              event.y,
              event.vx,
              event.vy,
              event.color,
              event.bounces,
              6,
              event.owner
            ));
            break;
          case "TANK_HIT":
            event.tank.health--;
            const bounceMultiplier = Math.pow(BOUNCE_MULTIPLIER, event.bullet.bounceCount);
            const friendlyFireMultiplier = event.bullet.owner instanceof EnemyTank ? FRIENDLY_FIRE_MULTIPLIER : 1;
            const hitScore = Math.floor(event.tank.hitValue * bounceMultiplier * friendlyFireMultiplier);
            this.score += hitScore;
            emitScorePopup(this.particles, event.x, event.y, hitScore);
            break;
          case "TANK_KILLED":
            this.audio.play("explosion", 0.6);
            emitExplosion(this.particles, event.x, event.y, event.tank.color);
            if (event.tank === this.player) {
              this.setState(STATE.GAMEOVER);
            } else {
              this.triggerShake(0.3, event.tank === this.player ? 12 : 8);
              const bm = Math.pow(BOUNCE_MULTIPLIER, event.bullet.bounceCount);
              const ffm = event.bullet.owner instanceof EnemyTank ? FRIENDLY_FIRE_MULTIPLIER : 1;
              const killScore = Math.floor(event.tank.scoreValue * bm * ffm);
              this.score += killScore;
              emitScorePopup(this.particles, event.x, event.y - 20, killScore);
              this.enemies = this.enemies.filter((e) => e !== event.tank);
            }
            break;
          case "PLAY_SOUND":
            this.audio.play(event.sound);
            break;
        }
      }
    }
    checkWin(dt) {
      if (this.enemies.length > 0) {
        this.winDelay = null;
        return;
      }
      if (this.winDelay === null) {
        this.winDelay = 1.5;
      }
      this.winDelay -= dt;
      if (this.winDelay <= 0) {
        this.setState(STATE.WIN);
      }
    }
    updateBullets(dt) {
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        b.update(dt);
        this.resolveBulletCollision(b, i);
        if (b.x + b.r < 0 || b.x - b.r > this.canvas.width || b.y + b.r < 0 || b.y - b.r > this.canvas.height) {
          this.bullets.splice(i, 1);
        }
      }
    }
    updateEnemies(dt) {
      const context = {
        player: this.player,
        walls: this.level.getWalls(),
        bullets: this.bullets,
        enemies: this.enemies
      };
      for (const enemy of this.enemies) {
        enemy.update(dt, context);
      }
    }
    resolveBulletCollision(b, i) {
      for (const wall of this.level.getWalls()) {
        const hit = circleAABBNormal(b, wall);
        if (!hit) continue;
        b.x += hit.nx * hit.depth;
        b.y += hit.ny * hit.depth;
        const dot = b.vx * hit.nx + b.vy * hit.ny;
        b.vx -= 2 * dot * hit.nx;
        b.vy -= 2 * dot * hit.ny;
        b.bounces--;
        b.bounceCount++;
        eventBus.push({ type: "PLAY_SOUND", sound: "bounce" });
        if (b.bounces < 0) {
          this.bullets.splice(i, 1);
        }
        break;
      }
    }
    resolveBulletTankCollision() {
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        if (b.spawnImmunity <= 0 && circleAABB(b, this.player)) {
          eventBus.push({
            type: "TANK_KILLED",
            tank: this.player,
            bullet: b,
            x: this.player.x + this.player.w / 2,
            y: this.player.y + this.player.h / 2
          });
          this.bullets.splice(i, 1);
          return;
        }
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          if (b.owner === e) continue;
          if (circleAABB(b, e)) {
            const cx = e.x + e.w / 2;
            const cy = e.y + e.h / 2;
            eventBus.push({ type: "TANK_HIT", tank: e, bullet: b, x: cx, y: cy });
            if (e.health - 1 <= 0) {
              eventBus.push({ type: "TANK_KILLED", tank: e, bullet: b, x: cx, y: cy });
            }
            this.bullets.splice(i, 1);
            break;
          }
        }
      }
    }
    resolveTankCollision() {
      this.resolveSingleTankCollision(this.player);
      for (const enemy of this.enemies) {
        this.resolveSingleTankCollision(enemy);
      }
    }
    resolveSingleTankCollision(tank) {
      for (const wall of this.level.getWalls()) {
        const hit = overlapAABB(tank, wall);
        if (!hit) continue;
        if (hit.overlapX < hit.overlapY) {
          tank.x += tank.x < wall.x ? -hit.overlapX : hit.overlapX;
        } else {
          tank.y += tank.y < wall.y ? -hit.overlapY : hit.overlapY;
        }
      }
    }
    triggerShake(duration, magnitude = 8) {
      this.shakeTime = Math.max(this.shakeTime, duration);
      this.shakeMagnitude = Math.max(this.shakeMagnitude, magnitude);
    }
    getShakeOffset() {
      if (this.shakeTime <= 0) return { dx: 0, dy: 0 };
      return {
        dx: (Math.random() - 0.5) * this.shakeMagnitude,
        dy: (Math.random() - 0.5) * this.shakeMagnitude
      };
    }
  };

  // src/main.js
  var game = new Game("game");
  game.start();
})();
