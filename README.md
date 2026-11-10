# Cyber Void: Survivor — Android APK

Версияи Android-и бозии Cyber Void бо React, TypeScript, Vite ва Capacitor. Барнома дар ҳолати landscape ва immersive fullscreen кор мекунад.

## Сохтани APK тавассути GitHub Actions

1. Ҳамаи файлҳои ин лоиҳаро ба repository-и GitHub бор кунед.
2. Ба ҷадвали **Actions** гузаред.
3. Workflow-и **Build Android APK**-ро интихоб кунед.
4. **Run workflow**-ро пахш кунед (ё ба branch-и `main` push кунед).
5. Пас аз анҷом, дар саҳифаи иҷрои workflow қисми **Artifacts** пайдо мешавад.
6. `Cyber-Void-Survivor-APK`-ро зеркашӣ кунед ва ZIP-ро кушода, `app-debug.apk`-ро насб кунед.

## Иҷрои маҳаллӣ

Талабот: Node.js 22 ва npm.

```bash
npm install
npm run dev
```

Барои сохтани web build:

```bash
npm run build
```

Android project дар workflow сохта мешавад; Android SDK дар GitHub-hosted runner истифода мешавад.

## Маълумоти техникӣ

- Application ID: `com.cybervoid.survivor`
- Номи барнома: `Cyber Void Survivor`
- Самти экран: Landscape
- Fullscreen: immersive sticky (status bar ва navigation bar пинҳон)
- APK: debug APK барои санҷиш ва паҳнкунии мустақим

Барои нашр дар Google Play бояд APK-и release/AAB бо keystore-и шахсӣ имзо карда шавад. Калидҳои имзоро ба repository ворид накунед; онҳоро ҳамчун GitHub Secrets нигоҳ доред.
