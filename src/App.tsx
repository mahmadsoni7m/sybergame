/**
 * Cyber Void: Survivor - Main Game Shell
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/gameEngine';
import { GameState, Language, UpgradeOption, GameStats } from './game/types';
import { sounds } from './audio/soundEngine';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { UpgradeModal } from './components/UpgradeModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { TouchControls } from './components/TouchControls';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // High-level Game State Machine
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [language, setLanguage] = useState<Language>('tj'); // Default to Tajik as requested
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());
  const [autoAim, setAutoAim] = useState<boolean>(true);

  // High score tracking
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('cybervoid_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isNewRecord, setIsNewRecord] = useState(false);

  // Upgrade Selection modal state
  const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([]);

  // HUD State (throttled updates from game loop)
  const [hudData, setHudData] = useState({
    hp: 120,
    maxHp: 120,
    shield: 60,
    maxShield: 60,
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    dashPercent: 1,
    novaPercent: 0,
    score: 0,
    combo: 1,
    time: 0,
    wave: 1,
    boss: null as { name: string; hp: number; maxHp: number } | null,
  });

  // Final Stats for Game Over / Victory
  const [finalStats, setFinalStats] = useState<GameStats>({
    timeSurvived: 0,
    kills: 0,
    bossesDefeated: 0,
    damageDealt: 0,
    highestCombo: 1,
    currentCombo: 1,
    comboTimer: 0,
    score: 0,
  });

  // Initialize Canvas Engine once on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    // React callbacks from engine
    engine.onHudUpdate = (data) => {
      setHudData(data);
    };

    engine.onLevelUp = (options) => {
      setUpgradeOptions(options);
      setGameState('UPGRADE_SELECT');
    };

    engine.onGameOver = (stats) => {
      setFinalStats({ ...stats });
      setHighScore((prev) => {
        if (stats.score > prev) {
          localStorage.setItem('cybervoid_highscore', stats.score.toString());
          setIsNewRecord(true);
          return stats.score;
        }
        setIsNewRecord(false);
        return prev;
      });
      setGameState('GAME_OVER');
    };

    engine.onVictory = (stats) => {
      setFinalStats({ ...stats });
      setHighScore((prev) => {
        if (stats.score > prev) {
          localStorage.setItem('cybervoid_highscore', stats.score.toString());
          setIsNewRecord(true);
          return stats.score;
        }
        setIsNewRecord(false);
        return prev;
      });
      setGameState('VICTORY');
    };

    // Render initial live canvas background scene
    engine.render();

    return () => {
      engine.cleanup();
    };
  }, []);

  // Keyboard navigation for Pause (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameState === 'PLAYING') {
          engineRef.current?.pause();
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          engineRef.current?.resume();
          setGameState('PLAYING');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Action Handlers
  const handleStartGame = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.resetGame();
    engineRef.current.start();
    setGameState('PLAYING');
    setIsNewRecord(false);
  }, []);

  const handleResumeGame = useCallback(() => {
    engineRef.current?.resume();
    setGameState('PLAYING');
  }, []);

  const handleRestartGame = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.resetGame();
    engineRef.current.start();
    setGameState('PLAYING');
    setIsNewRecord(false);
  }, []);

  const handleQuitToMain = useCallback(() => {
    engineRef.current?.stop();
    engineRef.current?.resetGame();
    setGameState('TITLE_MENU');
  }, []);

  const handleSelectUpgrade = useCallback((upgradeId: string) => {
    engineRef.current?.applyUpgrade(upgradeId);
    setUpgradeOptions([]);
    setGameState('PLAYING');
  }, []);

  const handleToggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'tj' ? 'en' : 'tj'));
  }, []);

  const handleToggleMute = useCallback(() => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  }, []);

  const handleToggleAutoAim = useCallback(() => {
    if (engineRef.current) {
      const active = engineRef.current.toggleAutoAim();
      setAutoAim(active);
    }
  }, []);

  const handleTriggerDash = useCallback(() => {
    engineRef.current?.triggerDash();
  }, []);

  const handleTriggerNova = useCallback(() => {
    engineRef.current?.triggerNovaBomb();
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-body select-none">
      {/* Isolated 60fps Game Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-crosshair z-0"
      />

      {/* Atmospheric Arcade Vignette Filter */}
      <div className="absolute inset-0 arcade-vignette z-10 pointer-events-none" />

      {/* 1. Title Screen */}
      {gameState === 'TITLE_MENU' && (
        <TitleScreen
          onStart={handleStartGame}
          language={language}
          onToggleLanguage={handleToggleLanguage}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          highScore={highScore}
        />
      )}

      {/* 2. World-Matched Low-Occlusion HUD */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'UPGRADE_SELECT') && (
        <HUD
          language={language}
          hp={hudData.hp}
          maxHp={hudData.maxHp}
          shield={hudData.shield}
          maxShield={hudData.maxShield}
          level={hudData.level}
          xp={hudData.xp}
          nextLevelXp={hudData.nextLevelXp}
          dashPercent={hudData.dashPercent}
          novaPercent={hudData.novaPercent}
          score={hudData.score}
          combo={hudData.combo}
          time={hudData.time}
          wave={hudData.wave}
          boss={hudData.boss}
          autoAim={autoAim}
          onToggleAutoAim={handleToggleAutoAim}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={() => {
            engineRef.current?.pause();
            setGameState('PAUSED');
          }}
          onTriggerDash={handleTriggerDash}
          onTriggerNova={handleTriggerNova}
        />
      )}

      {/* Touch Joystick & Actions (Visible on touch devices when playing) */}
      {gameState === 'PLAYING' && (
        <TouchControls
          onMove={(vec) => engineRef.current?.setVirtualJoystick(vec)}
          onDash={handleTriggerDash}
          onNova={handleTriggerNova}
          dashReady={hudData.dashPercent >= 1}
          novaReady={hudData.novaPercent >= 1}
        />
      )}

      {/* 3. Roguelite Upgrade Select Modal */}
      {gameState === 'UPGRADE_SELECT' && (
        <UpgradeModal
          options={upgradeOptions}
          onSelect={handleSelectUpgrade}
          language={language}
        />
      )}

      {/* 4. Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResumeGame}
          onRestart={handleRestartGame}
          onQuit={handleQuitToMain}
          language={language}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 5. Game Over / Victory Modal */}
      {(gameState === 'GAME_OVER' || gameState === 'VICTORY') && (
        <GameOverModal
          isVictory={gameState === 'VICTORY'}
          stats={finalStats}
          highScore={highScore}
          isNewRecord={isNewRecord}
          onRestart={handleRestartGame}
          onQuit={handleQuitToMain}
          language={language}
        />
      )}
    </div>
  );
}
