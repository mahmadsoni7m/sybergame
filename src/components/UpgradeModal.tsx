import React, { useEffect } from 'react';
import { Sparkles, Zap, Crosshair, Rocket, Shield, FastForward, ShieldAlert, Compass, Flame } from 'lucide-react';
import { UpgradeOption, Language } from '../game/types';
import { translations } from '../game/translations';

interface UpgradeModalProps {
  options: UpgradeOption[];
  onSelect: (id: string) => void;
  language: Language;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  options,
  onSelect,
  language,
}) => {
  const t = translations[language];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-cyan-400" />;
      case 'Zap': return <Zap className="w-6 h-6 text-amber-400" />;
      case 'Crosshair': return <Crosshair className="w-6 h-6 text-rose-400" />;
      case 'Rocket': return <Rocket className="w-6 h-6 text-orange-400" />;
      case 'Shield': return <Shield className="w-6 h-6 text-sky-400" />;
      case 'FastForward': return <FastForward className="w-6 h-6 text-emerald-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6 text-indigo-400" />;
      case 'Compass': return <Compass className="w-6 h-6 text-teal-400" />;
      case 'Flame': return <Flame className="w-6 h-6 text-red-400" />;
      default: return <Sparkles className="w-6 h-6 text-cyan-400" />;
    }
  };

  const getLocalizedText = (keyPath: string) => {
    const parts = keyPath.split('.');
    const category = parts[0] as keyof typeof t.upgrades;
    const prop = parts[1] as 'title' | 'desc';
    if (t.upgrades[category] && t.upgrades[category][prop]) {
      return t.upgrades[category][prop];
    }
    return keyPath;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' && options[0]) onSelect(options[0].id);
      if (e.key === '2' && options[1]) onSelect(options[1].id);
      if (e.key === '3' && options[2]) onSelect(options[2].id);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, onSelect]);

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/80 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-lg p-6 shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col items-center">
        {/* Title */}
        <div className="flex items-center gap-2 text-cyan-400 font-cyber font-bold text-lg sm:text-xl tracking-wider uppercase text-center mb-1">
          <Sparkles className="w-5 h-5 fill-cyan-400" />
          <span>{t.levelUpTitle}</span>
        </div>

        <p className="font-cyber text-xs text-slate-400 mb-6 tracking-wide">
          {t.levelUpPrompt}
        </p>

        {/* Upgrade Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full">
          {options.map((option, idx) => {
            const title = getLocalizedText(option.titleKey);
            const desc = getLocalizedText(option.descKey);

            return (
              <button
                key={option.id}
                onClick={() => onSelect(option.id)}
                className="group relative flex flex-col items-start p-4 bg-slate-950/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-400 rounded-lg transition-all duration-150 text-left active:scale-95 cursor-pointer"
              >
                {/* Hotkey Badge */}
                <div className="absolute top-3 right-3 w-6 h-6 rounded bg-slate-800 border border-slate-600 flex items-center justify-center font-code font-bold text-xs text-slate-300 group-hover:border-cyan-400 group-hover:text-cyan-300 transition-colors">
                  {idx + 1}
                </div>

                {/* Icon */}
                <div className="p-2 rounded bg-slate-900 border border-slate-800 mb-3 group-hover:border-cyan-500/50 transition-colors">
                  {getIcon(option.icon)}
                </div>

                {/* Card Title */}
                <h3 className="font-cyber font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
                  {title}
                </h3>

                {/* Level Pips */}
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: option.maxLevel }).map((_, pIdx) => (
                    <div
                      key={pIdx}
                      className={`w-3 h-1 rounded-sm ${
                        pIdx < option.level
                          ? 'bg-cyan-400 shadow-[0_0_4px_#38bdf8]'
                          : 'bg-slate-700'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] font-code text-slate-400 ml-1">
                    Lv.{option.level + 1}
                  </span>
                </div>

                {/* Description */}
                <p className="font-body text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  {desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
