import React, { useEffect } from 'react';
import { Volume2, VolumeX, Globe, Play, Shield, Zap, Sparkles } from 'lucide-react';
import { Language } from '../game/types';
import { translations } from '../game/translations';
import { sounds } from '../audio/soundEngine';

interface TitleScreenProps {
  onStart: () => void;
  language: Language;
  onToggleLanguage: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  highScore: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  language,
  onToggleLanguage,
  isMuted,
  onToggleMute,
  highScore,
}) => {
  const t = translations[language];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 md:p-12 pointer-events-none select-none text-slate-100">
      {/* Top Bar Utilities */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        <div className="flex items-center gap-2 text-xs font-cyber tracking-widest text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>AIS-SIMULATION // STABLE 60FPS</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switch */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-cyber bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded transition-colors"
            title="Тағйири забон / Switch language"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.languageToggle}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-cyber bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded transition-colors"
            title="Овоз / Mute (M)"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="hidden sm:inline">{isMuted ? t.soundOff : t.soundOn}</span>
          </button>
        </div>
      </div>

      {/* Center Hero Lockup over 30-40% Negative Space */}
      <div className="flex flex-col items-center justify-center text-center my-auto max-w-3xl mx-auto">
        {/* Bespoke Inline SVG Title Lockup */}
        <div className="mb-6 relative">
          <svg
            className="w-48 h-20 md:w-64 md:h-28 mx-auto filter drop-shadow-[0_0_24px_rgba(56,189,248,0.65)]"
            viewBox="0 0 260 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Geometric Mech Emblem Wings */}
            <path
              d="M130 15L175 48L245 42L220 72L165 65L130 92L95 65L40 72L15 42L85 48L130 15Z"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="2.5"
            />
            {/* Core Reactor Diamond */}
            <path
              d="M130 36L146 54L130 72L114 54L130 36Z"
              fill="#38bdf8"
              fillOpacity="0.85"
            />
            {/* Cyan Laser Accent Lines */}
            <line x1="10" y1="50" x2="60" y2="50" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="200" y1="50" x2="250" y2="50" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 4" />
          </svg>

          <h1 className="font-cyber font-black text-4xl sm:text-6xl md:text-7xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-500 uppercase mt-2">
            {t.gameTitle}
          </h1>
          <p className="font-cyber text-sm sm:text-base tracking-[0.35em] text-cyan-300/80 uppercase mt-1">
            {t.gameSubtitle}
          </p>
        </div>

        {/* Start Game CTA Button */}
        <div className="flex flex-col items-center gap-3 pointer-events-auto">
          <button
            onClick={() => {
              sounds.playLevelUp();
              onStart();
            }}
            className="group relative px-8 py-4 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-cyber font-bold text-base md:text-lg tracking-wider rounded transition-all duration-150 shadow-[0_0_30px_rgba(6,182,212,0.45)] hover:shadow-[0_0_45px_rgba(6,182,212,0.7)] flex items-center gap-3 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{t.startAction}</span>
          </button>

          <span className="font-cyber text-xs tracking-wider text-slate-400">
            {t.pressKeyPrompt}
          </span>
        </div>

        {/* High score badge if exists */}
        {highScore > 0 && (
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900/60 border border-amber-500/30 rounded font-code text-xs text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>RECORD:</span>
            <span className="font-bold tabular-nums text-amber-200">
              {highScore.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Flat Control-Hint Line as required by Game Craft guidelines */}
      <div className="w-full text-center pointer-events-auto pt-4 border-t border-slate-800/60">
        <p className="font-cyber text-xs md:text-sm tracking-wide text-slate-400">
          {t.controlsSummary}
        </p>
      </div>
    </div>
  );
};
