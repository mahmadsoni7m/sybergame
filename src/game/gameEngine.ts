/**
 * Cyber Void: Survivor - Core 60fps Canvas Simulation Engine
 * Completely decoupled from React re-renders for fluid 60fps execution.
 */

import { sounds } from '../audio/soundEngine';
import {
  Player,
  Enemy,
  Projectile,
  Particle,
  DamageText,
  DropItem,
  GameStats,
  BossEntity,
  UpgradeOption,
  Vector2,
} from './types';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  // Simulation state
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  private hitstopTimer: number = 0; // ms
  private trauma: number = 0; // 0..1 for screen shake
  private camera: Vector2 = { x: 0, y: 0 };
  private worldSize = { width: 3200, height: 3200 };

  // Entities
  public player!: Player;
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public damageTexts: DamageText[] = [];
  public drops: DropItem[] = [];
  public activeBoss: BossEntity | null = null;

  // Wave & Spawn Management
  public currentWave: number = 1;
  private waveTimer: number = 0;
  private waveDuration: number = 35; // 35s per wave before progression
  private spawnTimer: number = 0;
  private bossSpawnedForWave: boolean = false;

  // Stats & Progress
  public stats: GameStats = {
    timeSurvived: 0,
    kills: 0,
    bossesDefeated: 0,
    damageDealt: 0,
    highestCombo: 1,
    currentCombo: 1,
    comboTimer: 0,
    score: 0,
  };

  // Input management
  private keysHeld: Record<string, boolean> = {};
  private keysJustPressed: Record<string, boolean> = {};
  private mousePos: Vector2 = { x: 0, y: 0 };
  private isMouseDown: boolean = false;
  private virtualJoystick: Vector2 = { x: 0, y: 0 };

  // Callbacks to React
  public onLevelUp?: (options: UpgradeOption[]) => void;
  public onGameOver?: (stats: GameStats) => void;
  public onVictory?: (stats: GameStats) => void;
  public onHudUpdate?: (data: {
    hp: number;
    maxHp: number;
    shield: number;
    maxShield: number;
    level: number;
    xp: number;
    nextLevelXp: number;
    dashPercent: number;
    novaPercent: number;
    score: number;
    combo: number;
    time: number;
    wave: number;
    boss: { name: string; hp: number; maxHp: number } | null;
  }) => void;

  private hudThrottleTimer: number = 0;

  // Upgrades registry
  private availableUpgrades: UpgradeOption[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('2D Context unavailable');
    this.ctx = context;

    this.initUpgrades();
    this.resetGame();
    this.setupInputs();
    this.resizeCanvas();

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('blur', this.handleBlur);
  }

  private handleResize = () => {
    this.resizeCanvas();
  };

  private handleBlur = () => {
    this.keysHeld = {};
    this.keysJustPressed = {};
  };

  public resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private initUpgrades() {
    this.availableUpgrades = [
      {
        id: 'plasmaSpread',
        titleKey: 'plasmaSpread.title',
        descKey: 'plasmaSpread.desc',
        icon: 'Sparkles',
        level: 1,
        maxLevel: 5,
        apply: (p) => {
          p.projectileCount += 1;
        },
      },
      {
        id: 'rapidFire',
        titleKey: 'rapidFire.title',
        descKey: 'rapidFire.desc',
        icon: 'Zap',
        level: 1,
        maxLevel: 5,
        apply: (p) => {
          p.fireRate = Math.max(70, p.fireRate * 0.78);
        },
      },
      {
        id: 'plasmaDamage',
        titleKey: 'plasmaDamage.title',
        descKey: 'plasmaDamage.desc',
        icon: 'Crosshair',
        level: 1,
        maxLevel: 5,
        apply: (p) => {
          p.projectileDamage = Math.round(p.projectileDamage * 1.3);
        },
      },
      {
        id: 'homingMissiles',
        titleKey: 'homingMissiles.title',
        descKey: 'homingMissiles.desc',
        icon: 'Rocket',
        level: 0,
        maxLevel: 4,
        apply: (p) => {
          p.missileUnlocked = true;
          p.missileRate = Math.max(600, p.missileRate * 0.8);
        },
      },
      {
        id: 'orbiters',
        titleKey: 'orbiters.title',
        descKey: 'orbiters.desc',
        icon: 'Shield',
        level: 0,
        maxLevel: 4,
        apply: (p) => {
          p.orbitersCount += 1;
        },
      },
      {
        id: 'overdriveDash',
        titleKey: 'overdriveDash.title',
        descKey: 'overdriveDash.desc',
        icon: 'FastForward',
        level: 1,
        maxLevel: 4,
        apply: (p) => {
          p.dashCooldown = Math.max(600, p.dashCooldown * 0.65);
        },
      },
      {
        id: 'shieldBooster',
        titleKey: 'shieldBooster.title',
        descKey: 'shieldBooster.desc',
        icon: 'ShieldAlert',
        level: 1,
        maxLevel: 4,
        apply: (p) => {
          p.maxShield += 30;
          p.shield = p.maxShield;
        },
      },
      {
        id: 'magnetRange',
        titleKey: 'magnetRange.title',
        descKey: 'magnetRange.desc',
        icon: 'Compass',
        level: 1,
        maxLevel: 4,
        apply: (p) => {
          p.pickupRange += 75;
        },
      },
      {
        id: 'hyperReactor',
        titleKey: 'hyperReactor.title',
        descKey: 'hyperReactor.desc',
        icon: 'Flame',
        level: 1,
        maxLevel: 4,
        apply: (p) => {
          p.speed = Math.round(p.speed * 1.18);
        },
      },
    ];
  }

  public resetGame() {
    this.player = {
      x: this.worldSize.width / 2,
      y: this.worldSize.height / 2,
      vx: 0,
      vy: 0,
      radius: 18,
      rotation: 0,
      hp: 120,
      maxHp: 120,
      shield: 60,
      maxShield: 60,
      shieldRegenTimer: 0,
      speed: 280,

      xp: 0,
      level: 1,
      nextLevelXp: 100,

      dashCooldown: 1800,
      dashTimer: 0,
      isDashing: 0,
      invulnerableTimer: 0,

      novaCharge: 0,
      novaMaxCharge: 100,

      fireRate: 200,
      fireTimer: 0,
      projectileSpeed: 750,
      projectileDamage: 24,
      projectileCount: 1,
      projectilePiercing: 1,

      missileUnlocked: false,
      missileRate: 1400,
      missileTimer: 0,

      orbitersCount: 0,
      orbiterAngle: 0,
      orbiterRadius: 65,

      pickupRange: 130,
      autoAim: true,
    };

    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.damageTexts = [];
    this.drops = [];
    this.activeBoss = null;

    this.currentWave = 1;
    this.waveTimer = 0;
    this.spawnTimer = 0;
    this.bossSpawnedForWave = false;
    this.trauma = 0;
    this.hitstopTimer = 0;

    this.stats = {
      timeSurvived: 0,
      kills: 0,
      bossesDefeated: 0,
      damageDealt: 0,
      highestCombo: 1,
      currentCombo: 1,
      comboTimer: 0,
      score: 0,
    };

    this.camera = {
      x: this.player.x - window.innerWidth / 2,
      y: this.player.y - window.innerHeight / 2,
    };

    this.initUpgrades();
  }

  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (!this.keysHeld[key]) {
        this.keysJustPressed[key] = true;
      }
      this.keysHeld[key] = true;

      // Quick mute toggle
      if (key === 'm') {
        sounds.toggleMute();
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      this.keysHeld[key] = false;
    });

    window.addEventListener('mousemove', (e) => {
      this.mousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.isMouseDown = true;
      } else if (e.button === 2) {
        e.preventDefault();
        this.triggerNovaBomb();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.isMouseDown = false;
      }
    });

    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  public setVirtualJoystick(vector: Vector2) {
    this.virtualJoystick = vector;
  }

  public toggleAutoAim() {
    this.player.autoAim = !this.player.autoAim;
    return this.player.autoAim;
  }

  public triggerDash() {
    if (this.player.dashTimer <= 0) {
      this.player.dashTimer = this.player.dashCooldown;
      this.player.isDashing = 220; // 220ms of hyper speed dash
      this.player.invulnerableTimer = 260;
      sounds.playDash();

      // Dash burst particles
      for (let i = 0; i < 16; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 50 + Math.random() * 200;
        this.particles.push({
          x: this.player.x,
          y: this.player.y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: 4 + Math.random() * 4,
          color: '#38bdf8',
          alpha: 0.9,
          life: 0.35,
          maxLife: 0.35,
          shape: 'line',
        });
      }
      this.addTrauma(0.2);
    }
  }

  public triggerNovaBomb() {
    if (this.player.novaCharge >= this.player.novaMaxCharge) {
      this.player.novaCharge = 0;
      sounds.playNova();
      this.addTrauma(0.65);
      this.hitstop(60);

      // Expand ring particle
      this.particles.push({
        x: this.player.x,
        y: this.player.y,
        vx: 0,
        vy: 0,
        size: 20,
        color: '#f43f5e',
        alpha: 1,
        life: 0.6,
        maxLife: 0.6,
        shape: 'ring',
      });

      // Clear all enemy projectiles
      this.projectiles = this.projectiles.filter((p) => !p.isEnemy);

      // Heavy damage to all enemies within 450px radius
      const novaRadius = 450;
      for (const enemy of this.enemies) {
        const dx = enemy.x - this.player.x;
        const dy = enemy.y - this.player.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= novaRadius) {
          const dmg = 240;
          this.damageEnemy(enemy, dmg, true);
        }
      }
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    sounds.startMusic();
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    sounds.stopMusic();
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  private loop = (currentTime: number) => {
    if (!this.isRunning) return;

    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Clamped frame delta time (Math.min(rawDt, 0.05)) as required by guidelines
    const dt = Math.min(rawDt, 0.05);

    if (!this.isPaused) {
      // Hitstop logic (freeze frame simulation on heavy impacts)
      if (this.hitstopTimer > 0) {
        this.hitstopTimer -= dt * 1000;
      } else {
        this.update(dt);
      }
    }

    this.render();

    // Reset single-frame keys
    this.keysJustPressed = {};

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private hitstop(ms: number) {
    this.hitstopTimer = ms;
  }

  private addTrauma(amount: number) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  // --- UPDATE SIMULATION ---
  private update(dt: number) {
    this.stats.timeSurvived += dt;
    this.waveTimer += dt;

    // Decay trauma for camera shake
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 1.5);
    }

    // Combo timer decay
    if (this.stats.comboTimer > 0) {
      this.stats.comboTimer -= dt;
      if (this.stats.comboTimer <= 0) {
        this.stats.currentCombo = 1;
      }
    }

    // Wave Progression
    if (this.waveTimer >= this.waveDuration && !this.activeBoss) {
      this.currentWave += 1;
      this.waveTimer = 0;
      this.bossSpawnedForWave = false;

      // At wave 5 or 10, spawn Boss Titan
      if ((this.currentWave === 5 || this.currentWave === 10) && !this.bossSpawnedForWave) {
        this.spawnBoss();
      }
    }

    this.updatePlayer(dt);
    this.updateSpawns(dt);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updateOrbiters(dt);
    this.updateDrops(dt);
    this.updateParticles(dt);
    this.updateDamageTexts(dt);
    this.updateCamera(dt);

    // Throttle React HUD updates ~10 times per second for zero frame lag
    this.hudThrottleTimer += dt;
    if (this.hudThrottleTimer >= 0.1) {
      this.hudThrottleTimer = 0;
      this.dispatchHud();
    }
  }

  private dispatchHud() {
    if (this.onHudUpdate) {
      this.onHudUpdate({
        hp: Math.ceil(this.player.hp),
        maxHp: this.player.maxHp,
        shield: Math.ceil(this.player.shield),
        maxShield: this.player.maxShield,
        level: this.player.level,
        xp: this.player.xp,
        nextLevelXp: this.player.nextLevelXp,
        dashPercent: Math.max(0, 1 - this.player.dashTimer / this.player.dashCooldown),
        novaPercent: this.player.novaCharge / this.player.novaMaxCharge,
        score: this.stats.score,
        combo: Number(this.stats.currentCombo.toFixed(1)),
        time: Math.floor(this.stats.timeSurvived),
        wave: this.currentWave,
        boss: this.activeBoss
          ? {
              name: this.activeBoss.name,
              hp: Math.max(0, Math.ceil(this.activeBoss.hp)),
              maxHp: this.activeBoss.maxHp,
            }
          : null,
      });
    }
  }

  private updatePlayer(dt: number) {
    const p = this.player;

    // Movement input
    let moveX = 0;
    let moveY = 0;

    if (this.keysHeld['w'] || this.keysHeld['arrowup']) moveY -= 1;
    if (this.keysHeld['s'] || this.keysHeld['arrowdown']) moveY += 1;
    if (this.keysHeld['a'] || this.keysHeld['arrowleft']) moveX -= 1;
    if (this.keysHeld['d'] || this.keysHeld['arrowright']) moveX += 1;

    // Virtual Joystick support
    if (this.virtualJoystick.x !== 0 || this.virtualJoystick.y !== 0) {
      moveX = this.virtualJoystick.x;
      moveY = this.virtualJoystick.y;
    }

    const inputLen = Math.hypot(moveX, moveY);
    if (inputLen > 1) {
      moveX /= inputLen;
      moveY /= inputLen;
    }

    // Edge-triggered actions
    if (this.keysJustPressed[' '] || this.keysJustPressed['space']) {
      this.triggerDash();
    }
    if (this.keysJustPressed['e'] || this.keysJustPressed['q']) {
      this.triggerNovaBomb();
    }

    // Dash state
    let speed = p.speed;
    if (p.isDashing > 0) {
      p.isDashing -= dt * 1000;
      speed = p.speed * 2.8;

      // Thruster trail ghost particles
      if (Math.random() < 0.8) {
        this.particles.push({
          x: p.x + (Math.random() - 0.5) * 12,
          y: p.y + (Math.random() - 0.5) * 12,
          vx: -p.vx * 0.2,
          vy: -p.vy * 0.2,
          size: 6,
          color: '#38bdf8',
          alpha: 0.7,
          life: 0.2,
          maxLife: 0.2,
          shape: 'circle',
        });
      }
    }

    // Smooth inertia
    const accel = p.isDashing > 0 ? 3000 : 1800;
    p.vx += (moveX * speed - p.vx) * Math.min(1, dt * 12);
    p.vy += (moveY * speed - p.vy) * Math.min(1, dt * 12);

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Boundary clamp
    p.x = Math.max(p.radius + 40, Math.min(this.worldSize.width - p.radius - 40, p.x));
    p.y = Math.max(p.radius + 40, Math.min(this.worldSize.height - p.radius - 40, p.y));

    // Dash cooldown
    if (p.dashTimer > 0) {
      p.dashTimer -= dt * 1000;
    }

    // Invulnerability timer
    if (p.invulnerableTimer > 0) {
      p.invulnerableTimer -= dt * 1000;
    }

    // Shield passive regeneration
    p.shieldRegenTimer += dt;
    if (p.shieldRegenTimer >= 3.5 && p.shield < p.maxShield) {
      p.shield = Math.min(p.maxShield, p.shield + dt * 18);
    }

    // Aiming calculation
    let targetAngle = p.rotation;
    let closestEnemy: Enemy | null = null;
    let minDist = Infinity;

    if (p.autoAim) {
      // Find nearest enemy within 600px
      for (const e of this.enemies) {
        const dist = Math.hypot(e.x - p.x, e.y - p.y);
        if (dist < minDist && dist < 650) {
          minDist = dist;
          closestEnemy = e;
        }
      }
    }

    if (p.autoAim && closestEnemy) {
      targetAngle = Math.atan2(closestEnemy.y - p.y, closestEnemy.x - p.x);
    } else {
      // Mouse aiming relative to screen center
      const screenX = p.x - this.camera.x;
      const screenY = p.y - this.camera.y;
      targetAngle = Math.atan2(this.mousePos.y - screenY, this.mousePos.x - screenX);
    }

    p.rotation = targetAngle;

    // Automatic primary firing
    p.fireTimer += dt * 1000;
    if (p.fireTimer >= p.fireRate) {
      p.fireTimer = 0;
      this.firePrimaryWeapon();
    }

    // Secondary homing missile firing
    if (p.missileUnlocked) {
      p.missileTimer += dt * 1000;
      if (p.missileTimer >= p.missileRate) {
        p.missileTimer = 0;
        this.fireHomingMissile();
      }
    }
  }

  private firePrimaryWeapon() {
    const p = this.player;
    sounds.playShoot(1 + (Math.random() - 0.5) * 0.1);

    const count = p.projectileCount;
    const spreadAngle = count > 1 ? 0.14 * (count - 1) : 0;
    const startAngle = p.rotation - spreadAngle / 2;
    const step = count > 1 ? spreadAngle / (count - 1) : 0;

    for (let i = 0; i < count; i++) {
      const angle = startAngle + i * step;
      this.projectiles.push({
        id: Math.random(),
        x: p.x + Math.cos(p.rotation) * p.radius,
        y: p.y + Math.sin(p.rotation) * p.radius,
        vx: Math.cos(angle) * p.projectileSpeed,
        vy: Math.sin(angle) * p.projectileSpeed,
        radius: 4,
        damage: p.projectileDamage,
        isEnemy: false,
        pierceRemaining: p.projectilePiercing,
        life: 0.9,
        maxLife: 0.9,
        color: '#38bdf8',
      });
    }

    // Small recoil muzzle flash
    this.particles.push({
      x: p.x + Math.cos(p.rotation) * (p.radius + 4),
      y: p.y + Math.sin(p.rotation) * (p.radius + 4),
      vx: Math.cos(p.rotation) * 60,
      vy: Math.sin(p.rotation) * 60,
      size: 6,
      color: '#7dd3fc',
      alpha: 1,
      life: 0.08,
      maxLife: 0.08,
      shape: 'circle',
    });
  }

  private fireHomingMissile() {
    const p = this.player;
    sounds.playMissile();

    // Spawn 2 homing missiles from sides
    const offsets = [-0.5, 0.5];
    for (const offset of offsets) {
      const angle = p.rotation + offset;
      this.projectiles.push({
        id: Math.random(),
        x: p.x,
        y: p.y,
        vx: Math.cos(angle) * 320,
        vy: Math.sin(angle) * 320,
        radius: 5,
        damage: p.projectileDamage * 2.2,
        isEnemy: false,
        pierceRemaining: 1,
        life: 2.2,
        maxLife: 2.2,
        color: '#f59e0b',
        isMissile: true,
      });
    }
  }

  private updateSpawns(dt: number) {
    if (this.activeBoss) return; // limit spawns during boss fight

    this.spawnTimer += dt;
    const baseSpawnRate = Math.max(0.35, 1.4 - this.currentWave * 0.12);

    if (this.spawnTimer >= baseSpawnRate) {
      this.spawnTimer = 0;
      this.spawnWaveEnemies();
    }
  }

  private spawnWaveEnemies() {
    const p = this.player;
    // Spawn off-screen around player
    const spawnDist = Math.max(window.innerWidth, window.innerHeight) * 0.65;
    const angle = Math.random() * Math.PI * 2;
    const spawnX = Math.max(100, Math.min(this.worldSize.width - 100, p.x + Math.cos(angle) * spawnDist));
    const spawnY = Math.max(100, Math.min(this.worldSize.height - 100, p.y + Math.sin(angle) * spawnDist));

    // Choose enemy type based on current wave
    const roll = Math.random();
    let type: Enemy['type'] = 'swarmer';

    if (this.currentWave >= 4 && roll < 0.22) {
      type = 'exploder';
    } else if (this.currentWave >= 3 && roll < 0.42) {
      type = 'sniper';
    } else if (this.currentWave >= 2 && roll < 0.68) {
      type = 'brute';
    }

    this.createEnemy(type, spawnX, spawnY);
  }

  private createEnemy(type: Enemy['type'], x: number, y: number): Enemy {
    const waveMult = 1 + (this.currentWave - 1) * 0.18;
    let enemy: Enemy;

    switch (type) {
      case 'brute':
        enemy = {
          id: Math.random(),
          type: 'brute',
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 26,
          hp: 110 * waveMult,
          maxHp: 110 * waveMult,
          speed: 130,
          damage: 32,
          scoreValue: 80,
          xpValue: 35,
          color: '#ea580c', // Orange brute
          state: 'chasing',
          windupTimer: 0,
          windupDuration: 0.9,
          hitFlashTimer: 0,
          animTimer: 0,
        };
        break;

      case 'sniper':
        enemy = {
          id: Math.random(),
          type: 'sniper',
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 17,
          hp: 45 * waveMult,
          maxHp: 45 * waveMult,
          speed: 150,
          damage: 28,
          scoreValue: 120,
          xpValue: 45,
          color: '#a855f7', // Purple sniper
          state: 'chasing',
          windupTimer: 0,
          windupDuration: 1.4,
          hitFlashTimer: 0,
          animTimer: 0,
        };
        break;

      case 'exploder':
        enemy = {
          id: Math.random(),
          type: 'exploder',
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 19,
          hp: 35 * waveMult,
          maxHp: 35 * waveMult,
          speed: 190,
          damage: 55,
          scoreValue: 100,
          xpValue: 40,
          color: '#ef4444', // Red ticking bomb
          state: 'chasing',
          windupTimer: 0,
          windupDuration: 1.1,
          hitFlashTimer: 0,
          animTimer: 0,
        };
        break;

      case 'swarmer':
      default:
        enemy = {
          id: Math.random(),
          type: 'swarmer',
          x,
          y,
          vx: 0,
          vy: 0,
          radius: 14,
          hp: 30 * waveMult,
          maxHp: 30 * waveMult,
          speed: 215,
          damage: 16,
          scoreValue: 35,
          xpValue: 18,
          color: '#10b981', // Emerald crawler
          state: 'chasing',
          windupTimer: 0,
          windupDuration: 0,
          hitFlashTimer: 0,
          animTimer: 0,
        };
        break;
    }

    this.enemies.push(enemy);
    return enemy;
  }

  private spawnBoss() {
    this.bossSpawnedForWave = true;
    sounds.playBossAlert();
    this.addTrauma(0.5);

    const spawnDist = 450;
    const angle = Math.random() * Math.PI * 2;
    const x = this.player.x + Math.cos(angle) * spawnDist;
    const y = this.player.y + Math.sin(angle) * spawnDist;

    const maxHp = 1800 + this.currentWave * 450;
    const boss: BossEntity = {
      id: Math.random(),
      type: 'boss',
      name: this.currentWave >= 10 ? 'OMEGA PRIME // THE ABYSS' : 'GOLIATH PRIME',
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 46,
      hp: maxHp,
      maxHp,
      speed: 110,
      damage: 40,
      scoreValue: 3500,
      xpValue: 500,
      color: '#e11d48',
      state: 'chasing',
      windupTimer: 0,
      windupDuration: 1.6,
      hitFlashTimer: 0,
      animTimer: 0,
      phase: 1,
      specialAttackTimer: 0,
    };

    this.activeBoss = boss;
    this.enemies.push(boss);

    // Alert particle explosion
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * 220,
        vy: Math.sin(a) * 220,
        size: 8,
        color: '#f43f5e',
        alpha: 1,
        life: 0.8,
        maxLife: 0.8,
        shape: 'ring',
      });
    }
  }

  private updateEnemies(dt: number) {
    const p = this.player;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.animTimer += dt;
      if (e.hitFlashTimer > 0) e.hitFlashTimer -= dt;

      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const dist = Math.hypot(dx, dy);

      // Boss specific AI
      if (e.type === 'boss') {
        const boss = e as BossEntity;
        boss.specialAttackTimer += dt;

        // Boss attacks every 3.5 seconds
        if (boss.specialAttackTimer >= 3.2) {
          boss.specialAttackTimer = 0;
          this.triggerBossAttack(boss);
        }

        // Slow steady tracking
        if (dist > 100) {
          e.x += (dx / dist) * e.speed * dt;
          e.y += (dy / dist) * e.speed * dt;
        }

        this.checkPlayerCollision(e);
        continue;
      }

      // Swarmer AI: relentless pursuit
      if (e.type === 'swarmer') {
        if (dist > 5) {
          e.x += (dx / dist) * e.speed * dt;
          e.y += (dy / dist) * e.speed * dt;
        }
        this.checkPlayerCollision(e);
        continue;
      }

      // Brute AI: windup charging attack with danger lane telegraph
      if (e.type === 'brute') {
        if (e.state === 'chasing') {
          if (dist < 320 && e.windupTimer <= 0) {
            // Enter windup telegraph
            e.state = 'windup';
            e.windupTimer = e.windupDuration;
            e.chargeDirection = { x: dx / dist, y: dy / dist };
          } else {
            e.x += (dx / dist) * e.speed * dt;
            e.y += (dy / dist) * e.speed * dt;
          }
        } else if (e.state === 'windup') {
          e.windupTimer -= dt;
          if (e.windupTimer <= 0 && e.chargeDirection) {
            e.state = 'attacking';
            e.vx = e.chargeDirection.x * 420;
            e.vy = e.chargeDirection.y * 420;
            sounds.playMissile();
          }
        } else if (e.state === 'attacking') {
          e.x += e.vx * dt;
          e.y += e.vy * dt;
          e.vx *= 0.94;
          e.vy *= 0.94;
          if (Math.hypot(e.vx, e.vy) < 40) {
            e.state = 'chasing';
            e.windupTimer = 1.2; // recharge delay
          }
        }
        this.checkPlayerCollision(e);
        continue;
      }

      // Sniper AI: maintains standoff distance & telegraphs sniper laser
      if (e.type === 'sniper') {
        if (dist < 260) {
          // Back away
          e.x -= (dx / dist) * e.speed * dt;
          e.y -= (dy / dist) * e.speed * dt;
        } else if (dist > 480) {
          e.x += (dx / dist) * e.speed * dt;
          e.y += (dy / dist) * e.speed * dt;
        }

        // Fire telegraph
        e.windupTimer += dt;
        if (e.windupTimer >= e.windupDuration) {
          e.windupTimer = 0;
          sounds.playShoot(0.65);
          // Fire high speed projectile towards player
          this.projectiles.push({
            id: Math.random(),
            x: e.x,
            y: e.y,
            vx: (dx / dist) * 580,
            vy: (dy / dist) * 580,
            radius: 5,
            damage: e.damage,
            isEnemy: true,
            pierceRemaining: 1,
            life: 2.5,
            maxLife: 2.5,
            color: '#a855f7',
          });
        }
        this.checkPlayerCollision(e);
        continue;
      }

      // Exploder AI: charges in, locks position, then explodes in AOE
      if (e.type === 'exploder') {
        if (e.state === 'chasing') {
          if (dist < 110) {
            e.state = 'windup';
            e.windupTimer = e.windupDuration;
          } else {
            e.x += (dx / dist) * e.speed * dt;
            e.y += (dy / dist) * e.speed * dt;
          }
        } else if (e.state === 'windup') {
          e.windupTimer -= dt;
          if (e.windupTimer <= 0) {
            // Explode!
            this.explodeEnemy(e);
            this.enemies.splice(i, 1);
            continue;
          }
        }
        this.checkPlayerCollision(e);
      }
    }
  }

  private triggerBossAttack(boss: BossEntity) {
    const p = this.player;
    const dx = p.x - boss.x;
    const dy = p.y - boss.y;
    const dist = Math.hypot(dx, dy);

    const attackChoice = Math.random();

    if (attackChoice < 0.5) {
      // Spiral bullet hell burst
      sounds.playShoot(0.5);
      const bulletCount = 14;
      for (let i = 0; i < bulletCount; i++) {
        const angle = (i / bulletCount) * Math.PI * 2 + boss.animTimer;
        this.projectiles.push({
          id: Math.random(),
          x: boss.x,
          y: boss.y,
          vx: Math.cos(angle) * 320,
          vy: Math.sin(angle) * 320,
          radius: 7,
          damage: 22,
          isEnemy: true,
          pierceRemaining: 1,
          life: 3.5,
          maxLife: 3.5,
          color: '#f43f5e',
        });
      }
    } else {
      // Tri-spread high speed barrage directed at player
      sounds.playMissile();
      const centerAngle = Math.atan2(dy, dist);
      for (let offset of [-0.25, 0, 0.25]) {
        const a = centerAngle + offset;
        this.projectiles.push({
          id: Math.random(),
          x: boss.x,
          y: boss.y,
          vx: Math.cos(a) * 480,
          vy: Math.sin(a) * 480,
          radius: 8,
          damage: 30,
          isEnemy: true,
          pierceRemaining: 1,
          life: 2.8,
          maxLife: 2.8,
          color: '#fbbf24',
        });
      }
    }
  }

  private explodeEnemy(e: Enemy) {
    sounds.playExplosion(true);
    this.addTrauma(0.4);

    // Shockwave ring
    this.particles.push({
      x: e.x,
      y: e.y,
      vx: 0,
      vy: 0,
      size: 15,
      color: '#ef4444',
      alpha: 1,
      life: 0.45,
      maxLife: 0.45,
      shape: 'ring',
    });

    // Damage player if in range
    const dist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
    if (dist < 150) {
      this.damagePlayer(e.damage);
    }
  }

  private checkPlayerCollision(e: Enemy) {
    const p = this.player;
    const dist = Math.hypot(p.x - e.x, p.y - e.y);
    if (dist < p.radius + e.radius) {
      if (p.isDashing > 0) {
        // Ramming enemies while dashing deals massive damage to enemy
        this.damageEnemy(e, p.projectileDamage * 2.5, true);
      } else {
        this.damagePlayer(e.damage);
      }
    }
  }

  private damagePlayer(amount: number) {
    const p = this.player;
    if (p.invulnerableTimer > 0) return;

    sounds.playPlayerDamage();
    p.invulnerableTimer = 400; // 400ms grace period
    this.addTrauma(0.45);
    this.hitstop(45);

    // Reset shield regen timer
    p.shieldRegenTimer = 0;

    // Absorb with shield first
    if (p.shield > 0) {
      const absorbed = Math.min(p.shield, amount);
      p.shield -= absorbed;
      amount -= absorbed;
    }

    if (amount > 0) {
      p.hp -= amount;
      if (p.hp <= 0) {
        p.hp = 0;
        this.handleGameOver();
      }
    }

    // Floating text
    this.damageTexts.push({
      id: Math.random(),
      text: `-${Math.round(amount)}`,
      x: p.x,
      y: p.y - p.radius - 10,
      vy: -40,
      alpha: 1,
      color: '#f87171',
      isCrit: false,
      life: 0.8,
    });
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.life -= dt;

      if (pr.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Homing missile logic
      if (pr.isMissile) {
        let closest: Enemy | null = null;
        let cDist = 450;
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - pr.x, e.y - pr.y);
          if (d < cDist) {
            cDist = d;
            closest = e;
          }
        }
        if (closest) {
          const targetAngle = Math.atan2(closest.y - pr.y, closest.x - pr.x);
          const currentAngle = Math.atan2(pr.vy, pr.vx);
          const speed = Math.hypot(pr.vx, pr.vy);
          const newAngle = currentAngle + (targetAngle - currentAngle) * Math.min(1, dt * 7);
          pr.vx = Math.cos(newAngle) * speed;
          pr.vy = Math.sin(newAngle) * speed;
        }

        // Smoke particles behind missile
        if (Math.random() < 0.6) {
          this.particles.push({
            x: pr.x,
            y: pr.y,
            vx: -pr.vx * 0.1,
            vy: -pr.vy * 0.1,
            size: 3,
            color: '#fbbf24',
            alpha: 0.8,
            life: 0.25,
            maxLife: 0.25,
            shape: 'circle',
          });
        }
      }

      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;

      // Enemy projectile collision with player
      if (pr.isEnemy) {
        const distToPlayer = Math.hypot(this.player.x - pr.x, this.player.y - pr.y);
        if (distToPlayer < this.player.radius + pr.radius) {
          this.damagePlayer(pr.damage);
          this.projectiles.splice(i, 1);
          continue;
        }
      } else {
        // Player projectile collision with enemies
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          const distToEnemy = Math.hypot(e.x - pr.x, e.y - pr.y);
          if (distToEnemy < e.radius + pr.radius) {
            const isCrit = Math.random() < 0.2;
            const finalDmg = isCrit ? pr.damage * 1.8 : pr.damage;

            this.damageEnemy(e, finalDmg, isCrit);

            pr.pierceRemaining -= 1;
            if (pr.pierceRemaining <= 0) {
              this.projectiles.splice(i, 1);
              break;
            }
          }
        }
      }
    }
  }

  private updateOrbiters(dt: number) {
    const p = this.player;
    if (p.orbitersCount <= 0) return;

    p.orbiterAngle += dt * 3.5;

    for (let i = 0; i < p.orbitersCount; i++) {
      const angle = p.orbiterAngle + (i / p.orbitersCount) * Math.PI * 2;
      const ox = p.x + Math.cos(angle) * p.orbiterRadius;
      const oy = p.y + Math.sin(angle) * p.orbiterRadius;

      // Check collision with nearby enemies
      for (const e of this.enemies) {
        const dist = Math.hypot(e.x - ox, e.y - oy);
        if (dist < e.radius + 12) {
          this.damageEnemy(e, p.projectileDamage * 0.65, false);
        }
      }
    }
  }

  public damageEnemy(enemy: Enemy, damage: number, isCrit = false) {
    enemy.hp -= damage;
    enemy.hitFlashTimer = 0.08;
    this.stats.damageDealt += damage;
    sounds.playHit();

    // Spawn damage number
    this.damageTexts.push({
      id: Math.random(),
      text: `${Math.round(damage)}`,
      x: enemy.x + (Math.random() - 0.5) * 15,
      y: enemy.y - enemy.radius - 8,
      vy: -55,
      alpha: 1,
      color: isCrit ? '#facc15' : '#ffffff',
      isCrit,
      life: 0.6,
    });

    // Spark burst
    for (let i = 0; i < (isCrit ? 8 : 4); i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 140;
      this.particles.push({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 2.5,
        color: isCrit ? '#facc15' : '#38bdf8',
        alpha: 1,
        life: 0.25,
        maxLife: 0.25,
        shape: 'line',
      });
    }

    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  private killEnemy(enemy: Enemy) {
    const idx = this.enemies.indexOf(enemy);
    if (idx !== -1) {
      this.enemies.splice(idx, 1);
    }

    this.stats.kills += 1;
    this.stats.currentCombo = Math.min(20, this.stats.currentCombo + 0.15);
    this.stats.comboTimer = 3.2; // 3.2s window to chain combo
    this.stats.highestCombo = Math.max(this.stats.highestCombo, this.stats.currentCombo);

    const comboMult = this.stats.currentCombo;
    this.stats.score += Math.round(enemy.scoreValue * comboMult);

    // Charge nova bomb
    this.player.novaCharge = Math.min(this.player.novaMaxCharge, this.player.novaCharge + 3.5);

    // Heavy feedback on boss death
    if (enemy.type === 'boss') {
      this.activeBoss = null;
      this.stats.bossesDefeated += 1;
      sounds.playExplosion(true);
      this.hitstop(80);
      this.addTrauma(0.8);

      if (this.currentWave >= 10) {
        this.handleVictory();
        return;
      }
    } else {
      sounds.playExplosion(false);
      this.addTrauma(0.12);
    }

    // Death explosion particles
    const pCount = enemy.type === 'boss' ? 45 : 12;
    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 80 + Math.random() * (enemy.type === 'boss' ? 350 : 180);
      this.particles.push({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 3 + Math.random() * 5,
        color: enemy.color,
        alpha: 1,
        life: 0.45,
        maxLife: 0.45,
        shape: 'circle',
      });
    }

    // Drops
    this.drops.push({
      id: Math.random(),
      type: 'xp',
      x: enemy.x,
      y: enemy.y,
      value: enemy.xpValue,
      radius: 6,
      color: '#38bdf8',
      life: 60,
    });

    // Rare powerup drop
    if (Math.random() < 0.08) {
      this.drops.push({
        id: Math.random(),
        type: Math.random() < 0.5 ? 'health' : 'shield',
        x: enemy.x + (Math.random() - 0.5) * 20,
        y: enemy.y + (Math.random() - 0.5) * 20,
        value: 30,
        radius: 8,
        color: '#10b981',
        life: 45,
      });
    }
  }

  private updateDrops(dt: number) {
    const p = this.player;

    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      drop.life -= dt;
      if (drop.life <= 0) {
        this.drops.splice(i, 1);
        continue;
      }

      const dx = p.x - drop.x;
      const dy = p.y - drop.y;
      const dist = Math.hypot(dx, dy);

      // Magnetic pull when within pickup range
      if (dist < p.pickupRange) {
        const pullSpeed = 450 + (1 - dist / p.pickupRange) * 550;
        drop.x += (dx / dist) * pullSpeed * dt;
        drop.y += (dy / dist) * pullSpeed * dt;
      }

      // Collected by player
      if (dist < p.radius + drop.radius) {
        if (drop.type === 'xp') {
          this.addXp(drop.value);
          sounds.playGemPickup(this.stats.currentCombo);
        } else if (drop.type === 'health') {
          p.hp = Math.min(p.maxHp, p.hp + drop.value);
          sounds.playLevelUp();
        } else if (drop.type === 'shield') {
          p.shield = Math.min(p.maxShield, p.shield + drop.value);
          sounds.playLevelUp();
        }

        this.drops.splice(i, 1);
      }
    }
  }

  private addXp(amount: number) {
    const p = this.player;
    p.xp += amount;
    if (p.xp >= p.nextLevelXp) {
      p.xp -= p.nextLevelXp;
      p.level += 1;
      p.nextLevelXp = Math.round(p.nextLevelXp * 1.35 + 40);
      this.triggerLevelUp();
    }
  }

  private triggerLevelUp() {
    sounds.playLevelUp();
    this.hitstop(80);

    // Pick 3 random eligible upgrades
    const pool = this.availableUpgrades.filter((u) => u.level < u.maxLevel);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const choices = shuffled.slice(0, 3);

    if (choices.length > 0 && this.onLevelUp) {
      this.pause();
      this.onLevelUp(choices);
    }
  }

  public applyUpgrade(upgradeId: string) {
    const upgrade = this.availableUpgrades.find((u) => u.id === upgradeId);
    if (upgrade) {
      upgrade.level += 1;
      upgrade.apply(this.player);
    }
    this.resume();
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.alpha = Math.max(0, pt.life / pt.maxLife);

      if (pt.shape === 'ring') {
        pt.size += dt * 380;
      }
    }
  }

  private updateDamageTexts(dt: number) {
    for (let i = this.damageTexts.length - 1; i >= 0; i--) {
      const dtText = this.damageTexts[i];
      dtText.life -= dt;
      if (dtText.life <= 0) {
        this.damageTexts.splice(i, 1);
        continue;
      }

      dtText.y += dtText.vy * dt;
      dtText.alpha = Math.max(0, dtText.life / 0.6);
    }
  }

  private updateCamera(dt: number) {
    const targetX = this.player.x - window.innerWidth / 2;
    const targetY = this.player.y - window.innerHeight / 2;

    this.camera.x += (targetX - this.camera.x) * Math.min(1, dt * 10);
    this.camera.y += (targetY - this.camera.y) * Math.min(1, dt * 10);
  }

  private handleGameOver() {
    this.stop();
    sounds.playGameOver();
    if (this.onGameOver) {
      this.onGameOver(this.stats);
    }
  }

  private handleVictory() {
    this.stop();
    if (this.onVictory) {
      this.onVictory(this.stats);
    }
  }

  // --- RENDER PIPELINE ---
  public render() {
    const ctx = this.ctx;
    const width = window.innerWidth;
    const height = window.innerHeight;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Apply trauma screen shake
    let shakeX = 0;
    let shakeY = 0;
    if (this.trauma > 0) {
      const shakeAmt = this.trauma * this.trauma * 16;
      shakeX = (Math.random() * 2 - 1) * shakeAmt;
      shakeY = (Math.random() * 2 - 1) * shakeAmt;
    }

    ctx.translate(-this.camera.x + shakeX, -this.camera.y + shakeY);

    // 1. Draw cyberpunk grid background
    this.renderBackground(ctx);

    // 2. Draw drops (XP & items)
    this.renderDrops(ctx);

    // 3. Draw telegraph danger lanes & zones
    this.renderTelegraphs(ctx);

    // 4. Draw enemies
    this.renderEnemies(ctx);

    // 5. Draw player & orbiters
    this.renderPlayer(ctx);

    // 6. Draw projectiles
    this.renderProjectiles(ctx);

    // 7. Draw particles
    this.renderParticles(ctx);

    // 8. Draw floating damage texts
    this.renderDamageTexts(ctx);

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D) {
    const camX = this.camera.x;
    const camY = this.camera.y;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // Arena boundary border
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, this.worldSize.width - 60, this.worldSize.height - 60);

    // Subtle neon grid
    const gridSize = 80;
    const startX = Math.floor(camX / gridSize) * gridSize;
    const startY = Math.floor(camY / gridSize) * gridSize;
    const endX = startX + screenW + gridSize * 2;
    const endY = startY + screenH + gridSize * 2;

    ctx.strokeStyle = 'rgba(14, 116, 144, 0.12)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let x = startX; x <= endX; x += gridSize) {
      if (x >= 30 && x <= this.worldSize.width - 30) {
        ctx.moveTo(x, Math.max(30, startY));
        ctx.lineTo(x, Math.min(this.worldSize.height - 30, endY));
      }
    }
    for (let y = startY; y <= endY; y += gridSize) {
      if (y >= 30 && y <= this.worldSize.height - 30) {
        ctx.moveTo(Math.max(30, startX), y);
        ctx.lineTo(Math.min(this.worldSize.width - 30, endX), y);
      }
    }
    ctx.stroke();

    // Subtle ambient stars / glowing grid nodes
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    for (let x = startX; x <= endX; x += gridSize * 2) {
      for (let y = startY; y <= endY; y += gridSize * 2) {
        if (x >= 30 && x <= this.worldSize.width - 30 && y >= 30 && y <= this.worldSize.height - 30) {
          ctx.beginPath();
          ctx.arc(x, y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  private renderTelegraphs(ctx: CanvasRenderingContext2D) {
    for (const e of this.enemies) {
      // Brute charge lane telegraph
      if (e.type === 'brute' && e.state === 'windup' && e.chargeDirection) {
        const progress = 1 - e.windupTimer / e.windupDuration;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x + e.chargeDirection.x * 380, e.y + e.chargeDirection.y * 380);
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.3 + progress * 0.5})`;
        ctx.lineWidth = 18;
        ctx.setLineDash([12, 8]);
        ctx.stroke();
        ctx.restore();
      }

      // Sniper aim line telegraph
      if (e.type === 'sniper' && e.windupDuration > 0) {
        const progress = e.windupTimer / e.windupDuration;
        const dx = this.player.x - e.x;
        const dy = this.player.y - e.y;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x + dx, e.y + dy);
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.2 + progress * 0.7})`;
        ctx.lineWidth = 1.5 + progress * 2.5;
        ctx.stroke();
        ctx.restore();
      }

      // Exploder countdown AOE ring telegraph
      if (e.type === 'exploder' && e.state === 'windup') {
        const progress = 1 - e.windupTimer / e.windupDuration;
        ctx.save();
        ctx.beginPath();
        ctx.arc(e.x, e.y, 140 * progress, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239, 68, 68, ${0.1 + progress * 0.25})`;
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  private renderDrops(ctx: CanvasRenderingContext2D) {
    for (const drop of this.drops) {
      ctx.save();
      ctx.fillStyle = drop.color;
      ctx.shadowColor = drop.color;
      ctx.shadowBlur = 10;

      if (drop.type === 'xp') {
        // Diamond gem
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y - drop.radius);
        ctx.lineTo(drop.x + drop.radius, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.radius);
        ctx.lineTo(drop.x - drop.radius, drop.y);
        ctx.closePath();
        ctx.fill();
      } else {
        // Orb with cross
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderEnemies(ctx: CanvasRenderingContext2D) {
    for (const e of this.enemies) {
      ctx.save();
      ctx.translate(e.x, e.y);

      // Flash white when hit
      if (e.hitFlashTimer > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        continue;
      }

      ctx.fillStyle = e.color;
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 12;

      if (e.type === 'boss') {
        // Giant mechanical titan with rotating plates
        const boss = e as BossEntity;
        ctx.beginPath();
        ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = '#fff1f2';
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting armor shields
        ctx.strokeStyle = '#fda4af';
        ctx.lineWidth = 4;
        for (let i = 0; i < 4; i++) {
          const a = boss.animTimer * 1.5 + (i * Math.PI) / 2;
          ctx.beginPath();
          ctx.arc(0, 0, e.radius + 8, a, a + 0.6);
          ctx.stroke();
        }
      } else if (e.type === 'brute') {
        // Hexagonal heavy tank
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const px = Math.cos(angle) * e.radius;
          const py = Math.sin(angle) * e.radius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffedd5';
        ctx.fillRect(-4, -4, 8, 8);
      } else if (e.type === 'sniper') {
        // Triangular stealth craft
        const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(e.radius, 0);
        ctx.lineTo(-e.radius, -e.radius * 0.7);
        ctx.lineTo(-e.radius * 0.5, 0);
        ctx.lineTo(-e.radius, e.radius * 0.7);
        ctx.closePath();
        ctx.fill();
      } else if (e.type === 'exploder') {
        // Spiky pulsating bomb
        const pulse = 1 + Math.sin(e.animTimer * 14) * 0.15;
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Swarmer: sharp razor crawler
        const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(e.radius, 0);
        ctx.lineTo(-e.radius * 0.8, -e.radius * 0.7);
        ctx.lineTo(-e.radius * 0.3, 0);
        ctx.lineTo(-e.radius * 0.8, e.radius * 0.7);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    ctx.save();
    ctx.translate(p.x, p.y);

    // Shield aura if shield active
    if (p.shield > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 10, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + (p.shield / p.maxShield) * 0.4})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();
    }

    // Invulnerability blink
    if (p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer / 50) % 2 === 0) {
      ctx.restore();
      return;
    }

    // Orbiters (spinning plasma blades)
    if (p.orbitersCount > 0) {
      for (let i = 0; i < p.orbitersCount; i++) {
        const angle = p.orbiterAngle + (i / p.orbitersCount) * Math.PI * 2;
        const ox = Math.cos(angle) * p.orbiterRadius;
        const oy = Math.sin(angle) * p.orbiterRadius;

        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Rotate player to facing direction
    ctx.rotate(p.rotation);

    // Thruster flame when moving
    if (Math.hypot(p.vx, p.vy) > 20 || p.isDashing > 0) {
      const flameLen = p.isDashing > 0 ? 24 : 12 + Math.random() * 6;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-p.radius, -5);
      ctx.lineTo(-p.radius - flameLen, 0);
      ctx.lineTo(-p.radius, 5);
      ctx.closePath();
      ctx.fillStyle = p.isDashing > 0 ? '#38bdf8' : '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.restore();
    }

    // Mech Interceptor Hull (Sleek aerodynamic sci-fi fighter)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 16;

    ctx.beginPath();
    ctx.moveTo(p.radius + 6, 0); // nose tip
    ctx.lineTo(-p.radius * 0.7, -p.radius); // left wingtip
    ctx.lineTo(-p.radius * 0.4, -p.radius * 0.3); // left intake
    ctx.lineTo(-p.radius * 0.9, 0); // rear engine
    ctx.lineTo(-p.radius * 0.4, p.radius * 0.3); // right intake
    ctx.lineTo(-p.radius * 0.7, p.radius); // right wingtip
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit neon canopy
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(2, 0, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D) {
    for (const pr of this.projectiles) {
      ctx.save();
      ctx.fillStyle = pr.color;
      ctx.shadowColor = pr.color;
      ctx.shadowBlur = 10;

      if (pr.isMissile) {
        const angle = Math.atan2(pr.vy, pr.vx);
        ctx.translate(pr.x, pr.y);
        ctx.rotate(angle);
        ctx.fillRect(-6, -2.5, 12, 5);
      } else {
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, pr.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const pt of this.particles) {
      ctx.save();
      ctx.globalAlpha = pt.alpha;
      ctx.fillStyle = pt.color;
      ctx.strokeStyle = pt.color;

      if (pt.shape === 'ring') {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (pt.shape === 'line') {
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x - pt.vx * 0.05, pt.y - pt.vy * 0.05);
        ctx.lineWidth = pt.size;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderDamageTexts(ctx: CanvasRenderingContext2D) {
    ctx.font = 'bold 15px var(--font-orbitron), monospace';
    ctx.textAlign = 'center';

    for (const dt of this.damageTexts) {
      ctx.save();
      ctx.globalAlpha = dt.alpha;
      ctx.fillStyle = dt.color;
      ctx.shadowColor = dt.color;
      ctx.shadowBlur = dt.isCrit ? 8 : 4;
      ctx.fillText(dt.text, dt.x, dt.y);
      ctx.restore();
    }
  }

  public cleanup() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('blur', this.handleBlur);
  }
}
