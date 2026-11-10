/**
 * Types & Constants for Cyber Void: Survivor
 */

export type Language = 'tj' | 'en';

export type GameState = 
  | 'TITLE_MENU' 
  | 'PLAYING' 
  | 'PAUSED' 
  | 'UPGRADE_SELECT' 
  | 'GAME_OVER' 
  | 'VICTORY';

export interface Vector2 {
  x: number;
  y: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  shieldRegenTimer: number;
  speed: number;
  
  // Progression
  xp: number;
  level: number;
  nextLevelXp: number;
  
  // Abilities & Cooldowns
  dashCooldown: number;
  dashTimer: number;
  isDashing: number; // remaining dash duration in ms
  invulnerableTimer: number;
  
  novaCharge: number;
  novaMaxCharge: number;

  // Weapons & stats
  fireRate: number; // ms between shots
  fireTimer: number;
  projectileSpeed: number;
  projectileDamage: number;
  projectileCount: number; // spread
  projectilePiercing: number;
  
  missileUnlocked: boolean;
  missileRate: number;
  missileTimer: number;
  
  orbitersCount: number;
  orbiterAngle: number;
  orbiterRadius: number;
  
  pickupRange: number;
  autoAim: boolean;
}

export type EnemyType = 'swarmer' | 'brute' | 'sniper' | 'exploder' | 'boss';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  scoreValue: number;
  xpValue: number;
  color: string;
  
  // Telegraphing & attack states
  state: 'wandering' | 'chasing' | 'windup' | 'attacking' | 'recovering';
  windupTimer: number;
  windupDuration: number;
  attackTarget?: Vector2;
  chargeDirection?: Vector2;
  
  // Visuals
  hitFlashTimer: number;
  animTimer: number;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isEnemy: boolean;
  pierceRemaining: number;
  life: number;
  maxLife: number;
  color: string;
  isMissile?: boolean;
  targetId?: number;
  rotation?: number;
}

export interface Orbiter {
  angle: number;
  radius: number;
  damage: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'square' | 'line' | 'ring';
}

export interface DamageText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  isCrit: boolean;
  life: number;
}

export interface DropItem {
  id: number;
  type: 'xp' | 'health' | 'shield' | 'nova';
  x: number;
  y: number;
  value: number;
  radius: number;
  color: string;
  life: number;
}

export interface UpgradeOption {
  id: string;
  titleKey: string;
  descKey: string;
  icon: string;
  level: number;
  maxLevel: number;
  apply: (p: Player) => void;
}

export interface GameStats {
  timeSurvived: number; // seconds
  kills: number;
  bossesDefeated: number;
  damageDealt: number;
  highestCombo: number;
  currentCombo: number;
  comboTimer: number;
  score: number;
}

export interface BossEntity extends Enemy {
  phase: number;
  specialAttackTimer: number;
  name: string;
}
