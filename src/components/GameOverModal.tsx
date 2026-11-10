import React, { useEffect } from 'react';
import { RotateCcw, Home, Award, Sparkles, Skull, Trophy } from 'lucide-react';
import { GameStats, Language } from '../game/types';
import { translations } from '../game/translations';

interface GameOverModalProps {
  isVictory: boolean;
  stats: GameStats;
  highScore: number;
  isNewRecord: boolean;
  onRestart: () => void;
  onQuit: () => void;
  language: Language;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory,
  stats,
  highScore,
  isNewRecord,
  onRestart,
  onQuit,
  language,
}) => {
  const t = translations[language];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/85 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-lg p-6 shadow-[0_0_40px_rgba(2,6,23,0.9)] flex flex-col items-center">
        {/* Banner Icon */}
        <div className={`p-3 rounded-full mb-3 ${isVictory ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
          {isVictory ? <Trophy className="w-8 h-8" /> : <Skull className="w-8 h-8" />}
        </div>

        {/* Title */}
        <h2 className={`font-cyber font-black text-2xl tracking-wider uppercase text-center ${isVictory ? 'text-amber-300' : 'text-rose-400'}`}>
          {isVictory ? t.victoryTitle : t.gameOverTitle}
        </h2>
        <p className="font-cyber text-xs text-slate-400 text-center mt-1 mb-5">
          {isVictory ? t.victorySubtitle : t.gameOverSubtitle}
        </p>

        {/* New High Score Banner */}
        {isNewRecord && (
          <div className="w-full mb-4 py-2 px-3 bg-amber-500/10 border border-amber-500/40 rounded flex items-center justify-center gap-2 text-amber-300 font-cyber font-bold text-xs animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t.highScoreBadge}</span>
          </div>
        )}

        {/* Performance Debrief Grid */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-lg p-4 flex flex-col gap-2.5 mb-6 text-xs font-cyber">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
            <span>{t.statScore}</span>
            <span className="font-code font-bold text-base text-amber-300 tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>{t.statTime}</span>
            <span className="font-code font-bold text-cyan-300 tabular-nums">
              {formatTime(stats.timeSurvived)}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>{t.statKills}</span>
            <span className="font-code font-bold text-slate-100 tabular-nums">
              {stats.kills}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>{t.statBosses}</span>
            <span className="font-code font-bold text-rose-400 tabular-nums">
              {stats.bossesDefeated}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>{t.statCombo}</span>
            <span className="font-code font-bold text-amber-400 tabular-nums">
              x{stats.highestCombo.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onRestart}
            className="w-full py-3.5 px-4 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-cyber font-bold text-sm tracking-wider rounded flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.playAgainBtn}</span>
          </button>

          <button
            onClick={onQuit}
            className="w-full py-2.5 px-4 bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 font-cyber text-xs tracking-wider rounded flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.quitBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
