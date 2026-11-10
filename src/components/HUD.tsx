import React from 'react';
import { Volume2, VolumeX, Pause, Crosshair, Shield, Zap, AlertTriangle } from 'lucide-react';
import { Language } from '../game/types';
import { translations } from '../game/translations';

interface HUDProps {
  language: Language;
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
  boss?: { name: string; hp: number; maxHp: number } | null;
  autoAim: boolean;
  onToggleAutoAim: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onTriggerDash: () => void;
  onTriggerNova: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  language,
  hp,
  maxHp,
  shield,
  maxShield,
  level,
  xp,
  nextLevelXp,
  dashPercent,
  novaPercent,
  score,
  combo,
  time,
  wave,
  boss,
  autoAim,
  onToggleAutoAim,
  isMuted,
  onToggleMute,
  onPause,
  onTriggerDash,
  onTriggerNova,
}) => {
  const t = translations[language];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const hpRatio = Math.max(0, Math.min(1, hp / maxHp));
  const shieldRatio = Math.max(0, Math.min(1, shield / maxShield));
  const xpRatio = Math.max(0, Math.min(1, xp / nextLevelXp));

  return (
    <div className="absolute inset-0 z-20 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5">
      {/* TOP PERIMETER ROW */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: Status Cluster (Hull, Shield, Level, XP) */}
        <div className="flex flex-col gap-2 max-w-[240px] sm:max-w-[280px]">
          {/* Level & XP Gauge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-900 border border-cyan-500/50 text-cyan-300 font-cyber font-bold text-sm">
              <span className="tabular-nums">{level}</span>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] font-cyber text-slate-300">
                <span>{t.level} {level}</span>
                <span className="font-code tabular-nums text-cyan-400">
                  {Math.round(xpRatio * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60">
                <div
                  className="h-full bg-cyan-400 transition-all duration-150 ease-out"
                  style={{ width: `${xpRatio * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Hull (Health) Bar */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[11px] font-cyber">
              <span className="text-rose-300">{t.health}</span>
              <span className="font-code tabular-nums text-slate-200">
                {hp} / {maxHp}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded overflow-hidden border border-rose-950/80">
              <div
                className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-100 ease-out"
                style={{ width: `${hpRatio * 100}%` }}
              />
            </div>
          </div>

          {/* Shield Bar */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[11px] font-cyber">
              <span className="text-sky-300 flex items-center gap-1">
                <Shield className="w-3 h-3 text-sky-400" />
                {t.shield}
              </span>
              <span className="font-code tabular-nums text-slate-200">
                {shield} / {maxShield}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded overflow-hidden border border-sky-950/80">
              <div
                className="h-full bg-gradient-to-r from-sky-600 to-sky-300 transition-all duration-100 ease-out"
                style={{ width: `${shieldRatio * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top-Center: Boss Health Bar (if active) */}
        {boss && (
          <div className="flex flex-col items-center max-w-sm sm:max-w-md w-full px-4">
            <div className="flex items-center gap-1.5 text-rose-400 font-cyber font-bold text-xs sm:text-sm animate-pulse tracking-widest uppercase">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>{boss.name}</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-sm overflow-hidden border border-rose-500/80 mt-1 shadow-[0_0_12px_rgba(244,63,94,0.4)]">
              <div
                className="h-full bg-gradient-to-r from-rose-700 via-rose-500 to-amber-400 transition-all duration-150 ease-out"
                style={{ width: `${(boss.hp / boss.maxHp) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-code tabular-nums text-rose-300 mt-0.5">
              {boss.hp} / {boss.maxHp} HP
            </span>
          </div>
        )}

        {/* Top-Right: Telemetry Cluster (Wave, Time, Score, Combo) */}
        <div className="flex flex-col items-end gap-1.5 text-right font-cyber">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">{t.time}</span>
              <span className="font-code font-bold text-sm sm:text-base text-cyan-300 tabular-nums">
                {formatTime(time)}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">WAVE</span>
              <span className="font-code font-bold text-sm sm:text-base text-cyan-400 tabular-nums">
                #{wave}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{t.score}</span>
            <span className="font-code font-bold text-lg sm:text-xl text-amber-300 tabular-nums drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Combo Badge */}
          {combo > 1 && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-950/60 border border-amber-500/60 rounded text-[11px] font-cyber font-bold text-amber-300 animate-pulse">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>x{combo.toFixed(1)} {t.combo}</span>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM PERIMETER ROW */}
      <div className="flex items-end justify-between w-full">
        {/* Bottom-Left: Abilities Status (Dash & EMP Nova) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Dash Ability Card */}
          <button
            onClick={onTriggerDash}
            className={`relative flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded border transition-all ${
              dashPercent >= 1
                ? 'bg-slate-900/90 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.3)] active:scale-95 cursor-pointer'
                : 'bg-slate-950/80 border-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title="Dash (SPACE)"
          >
            <Zap className={`w-5 h-5 ${dashPercent >= 1 ? 'fill-cyan-400 text-cyan-300' : ''}`} />
            <span className="text-[9px] font-cyber mt-1 tracking-wider uppercase">DASH</span>
            <span className="text-[8px] font-code text-slate-400 hidden sm:inline">[SPACE]</span>

            {/* Cooldown Overlay */}
            {dashPercent < 1 && (
              <div
                className="absolute inset-0 bg-slate-950/70 rounded flex items-center justify-center font-code text-xs font-bold text-cyan-400"
                style={{ clipPath: `inset(${(1 - dashPercent) * 100}% 0 0 0)` }}
              />
            )}
          </button>

          {/* EMP Nova Bomb Ability Card */}
          <button
            onClick={onTriggerNova}
            className={`relative flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded border transition-all ${
              novaPercent >= 1
                ? 'bg-rose-950/80 border-rose-400 text-rose-300 shadow-[0_0_16px_rgba(244,63,94,0.5)] animate-pulse active:scale-95 cursor-pointer'
                : 'bg-slate-950/80 border-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title="EMP Nova Bomb (E / Right Click)"
          >
            <AlertTriangle className={`w-5 h-5 ${novaPercent >= 1 ? 'text-rose-400' : ''}`} />
            <span className="text-[9px] font-cyber mt-1 tracking-wider uppercase">NOVA</span>
            <span className="text-[8px] font-code text-slate-400 hidden sm:inline">[E]</span>

            {/* Charge Meter */}
            {novaPercent < 1 && (
              <div className="absolute bottom-1 w-10 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500"
                  style={{ width: `${novaPercent * 100}%` }}
                />
              </div>
            )}
          </button>
        </div>

        {/* Bottom-Right: Interactive Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Auto Aim Toggle */}
          <button
            onClick={onToggleAutoAim}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-cyber border rounded transition-colors ${
              autoAim
                ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400'
            }`}
            title="Toggle Auto Aim"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {autoAim ? t.autoAimOn : t.autoAimOff}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 transition-colors"
            title="Mute / Unmute (M)"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 transition-colors"
            title="Pause (ESC)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
