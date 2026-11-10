import React, { useEffect } from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { Language } from '../game/types';
import { translations } from '../game/translations';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  language: Language;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onQuit,
  language,
  isMuted,
  onToggleMute,
}) => {
  const t = translations[language];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onResume();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onResume]);

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/80 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-lg p-6 shadow-[0_0_30px_rgba(15,23,42,0.8)] flex flex-col items-center">
        <h2 className="font-cyber font-bold text-lg text-slate-100 tracking-wider uppercase mb-6">
          {t.pausedTitle}
        </h2>

        <div className="flex flex-col gap-3 w-full">
          {/* Resume */}
          <button
            onClick={onResume}
            className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-cyber font-bold text-sm tracking-wider rounded flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t.resumeBtn}</span>
          </button>

          {/* Restart */}
          <button
            onClick={onRestart}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-cyber font-bold text-sm tracking-wider border border-slate-600 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.restartBtn}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="w-full py-2.5 px-4 bg-slate-950/60 hover:bg-slate-800 text-slate-300 font-cyber text-xs tracking-wider border border-slate-800 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? t.soundOff : t.soundOn}</span>
          </button>

          {/* Main Menu */}
          <button
            onClick={onQuit}
            className="w-full py-2.5 px-4 bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 font-cyber text-xs tracking-wider rounded flex items-center justify-center gap-2 transition-colors cursor-pointer mt-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.quitBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
