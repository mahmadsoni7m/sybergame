/**
 * Localization dictionary supporting Tajik (тоҷикӣ) and English
 */

export const translations = {
  tj: {
    gameTitle: "ВОДИИ КИБЕРӢ",
    gameSubtitle: "НАҶОТЁБАНДАИ КАЙҲОНӢ",
    startAction: "ОҒОЗИ МУБОРИЗА",
    pressKeyPrompt: "Барои оғоз SPACE ё ENTER-ро пахш кунед",
    controlsSummary: "WASD / Тирчаҳо: Ҳаракат · Муш / Тирчаҳо: Ҳадафгирӣ · SPACE: Ҷаҳиши тези Dash · E / Тугмаи рости муш: Таркиши Нова · ESC: Таваққуф",
    
    // HUD
    health: "ҶОН",
    shield: "СИПАР",
    level: "САТҲИ",
    score: "ИМТИЁЗ",
    time: "ВАҚТИ ЗИНДАМОНӢ",
    combo: "КОМБО",
    dash: "ҶАҲИШ (DASH)",
    nova: "ТАРКИШИ НОВА",
    autoAimOn: "Ҳадафгирии Худкор: ФАЪОЛ",
    autoAimOff: "Ҳадафгирии Худкор: ХОМӮШ",
    bossAlert: "ОГОҲИИ ХАТАР: ҒУЛИ КИБЕРӢ ВОРИД ШУД!",

    // Upgrades
    levelUpTitle: "САТҲИ НАВ! ТАКМИЛИ СИСТЕМАРО ИНТИХОБ КУНЕД",
    levelUpPrompt: "Барои интихоб 1, 2 ё 3-ро пахш кунед",
    reroll: "Ивази вариантҳо",
    upgrades: {
      plasmaSpread: {
        title: "Тӯфони Плазма (Spread)",
        desc: "+1 тири иловагӣ дар ҳар як тирпарронӣ ва паҳншавии васеъ"
      },
      rapidFire: {
        title: "Суръати Тирпарронӣ (Rapid)",
        desc: "Суръати тирпарронӣ 22% тезтар ва сабуктар мегардад"
      },
      plasmaDamage: {
        title: "Нерӯи Плазма (Damage)",
        desc: "Қувваи зарари тирҳо 30% зиёд мешавад"
      },
      homingMissiles: {
        title: "Мушакҳои Ҳадафёб (Missiles)",
        desc: "Партоби худкори мушакҳои қавӣ ба сӯи душманони наздиктарин"
      },
      orbiters: {
        title: "Теғҳои Энергетикӣ (Orbiters)",
        desc: "+1 теғи гардишкунанда, ки душманони наздикшударо пора мекунад"
      },
      overdriveDash: {
        title: "Ҷаҳиши Фаврӣ (Hyper Dash)",
        desc: "Вақти интизории Dash 35% кам ва масофаи он дарозтар мешавад"
      },
      shieldBooster: {
        title: "Сипари Титанӣ (Shield)",
        desc: "Сипари нав барқарор мешавад ва барқароршавии он 40% тезтар мешавад"
      },
      magnetRange: {
        title: "Магнити Нанозарраҳо (Magnet)",
        desc: "Масофаи ҷалби кристаллҳои XP ва тӯҳфаҳо 60% васеъ мегардад"
      },
      hyperReactor: {
        title: "Реактори Суръат (Engine)",
        desc: "Суръати ҳаракати киштӣ 18% зиёд мешавад"
      }
    },

    // Pause & Game Over
    pausedTitle: "БОЗӢ ДАР ТАВАҚҚУФ АСТ",
    resumeBtn: "ИДОМАИ БОЗӢ (ESC)",
    restartBtn: "АЗ НАВ ОҒОЗ КАРДАН",
    quitBtn: "БА САҲИФАИ АСОСӢ",

    gameOverTitle: "СИСТЕМА ШИКАСТ ХӮРД",
    gameOverSubtitle: "Киштии шумо дар водии киберӣ нобуд шуд",
    victoryTitle: "ҒАЛАБАИ БУЗУРГ!",
    victorySubtitle: "Шумо ҳамаи мавҷҳои душман ва ғулҳоро мағлуб кардед!",
    
    // Stats Summary
    statsTitle: "ҲИСОБОТИ ҶАНГ",
    statKills: "Душманони шикастхӯрда:",
    statBosses: "Ғулҳои мағлубшуда:",
    statTime: "Вақти истодагарӣ:",
    statCombo: "Баландтарин комбо:",
    statScore: "Имтиёзи ниҳоӣ:",
    highScoreBadge: "РЕКОРДИ НАВ!",
    playAgainBtn: "БОРИ ДИГАР БОЗӢ КУНЕД",
    
    // Audio & Lang
    soundOn: "Овоз: Фаъол",
    soundOff: "Овоз: Хомӯш",
    languageToggle: "English"
  },
  en: {
    gameTitle: "CYBER VOID",
    gameSubtitle: "SURVIVOR CHRONICLES",
    startAction: "ENGAGE THREAT",
    pressKeyPrompt: "Press SPACE or ENTER to launch",
    controlsSummary: "WASD / Arrows: Move · Mouse / Arrows: Aim · SPACE: Dash · E / Right Click: EMP Nova · ESC: Pause",

    // HUD
    health: "HULL",
    shield: "SHIELD",
    level: "LEVEL",
    score: "SCORE",
    time: "SURVIVED",
    combo: "COMBO",
    dash: "DASH",
    nova: "EMP NOVA",
    autoAimOn: "Auto Aim: ON",
    autoAimOff: "Auto Aim: OFF",
    bossAlert: "DANGER WARNING: GOLIATH PRIME DETECTED!",

    // Upgrades
    levelUpTitle: "SYSTEM UPGRADE READY",
    levelUpPrompt: "Select augmentation with 1, 2 or 3",
    reroll: "Reroll Options",
    upgrades: {
      plasmaSpread: {
        title: "Spread Plasma Array",
        desc: "+1 extra plasma bolt per shot in a destructive fan spread"
      },
      rapidFire: {
        title: "Overclocked Trigger",
        desc: "Blaster fire rate increased by 22% with enhanced velocity"
      },
      plasmaDamage: {
        title: "Heavy Matter Rounds",
        desc: "Plasma bolt impact damage boosted by 30%"
      },
      homingMissiles: {
        title: "Seeker Swarm Missiles",
        desc: "Autofires high-explosive tracking micro-missiles at target clusters"
      },
      orbiters: {
        title: "Orbital Energy Blades",
        desc: "+1 revolving plasma cutter that shreds encroaching swarmers"
      },
      overdriveDash: {
        title: "Quantum Phase Dash",
        desc: "Dash cooldown reduced by 35% with extended invulnerability"
      },
      shieldBooster: {
        title: "Aegis Shield Matrix",
        desc: "Instantly repairs shield and speeds up automatic recharge by 40%"
      },
      magnetRange: {
        title: "Nano-Magnetic Field",
        desc: "Expands XP core and drop attraction radius by 60%"
      },
      hyperReactor: {
        title: "Ion Thruster Injection",
        desc: "Movement speed and maneuvering acceleration increased by 18%"
      }
    },

    // Pause & Game Over
    pausedTitle: "SYSTEM SUSPENDED",
    resumeBtn: "RESUME (ESC)",
    restartBtn: "RESTART RUN",
    quitBtn: "ABORT TO MAIN",

    gameOverTitle: "HULL CRITICAL · DESTROYED",
    gameOverSubtitle: "Your drone went dark in the desolate neon sector",
    victoryTitle: "SECTOR PURGED · VICTORY!",
    victorySubtitle: "All waves eradicated and Goliath Prime eliminated!",

    // Stats Summary
    statsTitle: "MISSION DEBRIEF",
    statKills: "Hostiles Neutralized:",
    statBosses: "Bosses Destroyed:",
    statTime: "Time Elapsed:",
    statCombo: "Highest Chain:",
    statScore: "Total Score:",
    highScoreBadge: "NEW HIGH SCORE!",
    playAgainBtn: "DEPLOY AGAIN",

    // Audio & Lang
    soundOn: "Audio: ON",
    soundOff: "Audio: OFF",
    languageToggle: "Тоҷикӣ"
  }
};
