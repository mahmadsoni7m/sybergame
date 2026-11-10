import React, { useRef, useState, useEffect } from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import { Vector2 } from '../game/types';

interface TouchControlsProps {
  onMove: (vec: Vector2) => void;
  onDash: () => void;
  onNova: () => void;
  dashReady: boolean;
  novaReady: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMove,
  onDash,
  onNova,
  dashReady,
  novaReady,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [touchActive, setTouchActive] = useState(false);
  const [knobPos, setKnobPos] = useState<Vector2>({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
    }
  }, []);

  if (!isTouchDevice) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchActive(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const touch = e.touches[0];
    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = rect.width / 2;

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: knobX, y: knobY });
    onMove({
      x: knobX / maxRadius,
      y: knobY / maxRadius,
    });
  };

  const handleTouchEnd = () => {
    setTouchActive(false);
    setKnobPos({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none flex justify-between items-end p-6">
      {/* Virtual Joystick */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-28 h-28 rounded-full bg-slate-900/60 border-2 border-cyan-500/40 relative flex items-center justify-center pointer-events-auto touch-none"
      >
        <div
          className="w-12 h-12 rounded-full bg-cyan-500/80 border border-white shadow-[0_0_12px_#38bdf8] transition-transform duration-75"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        />
      </div>

      {/* Action Buttons for Mobile */}
      <div className="flex flex-col gap-3 pointer-events-auto">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onNova();
          }}
          className={`w-14 h-14 rounded-full flex items-center justify-center border ${
            novaReady
              ? 'bg-rose-600/90 border-white text-white shadow-[0_0_15px_#f43f5e]'
              : 'bg-slate-900/60 border-slate-700 text-slate-500'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </button>

        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onDash();
          }}
          className={`w-16 h-16 rounded-full flex items-center justify-center border ${
            dashReady
              ? 'bg-cyan-500/90 border-white text-slate-950 shadow-[0_0_15px_#38bdf8]'
              : 'bg-slate-900/60 border-slate-700 text-slate-500'
          }`}
        >
          <Zap className="w-7 h-7 fill-current" />
        </button>
      </div>
    </div>
  );
};
