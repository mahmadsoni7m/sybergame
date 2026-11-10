import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cybervoid.survivor',
  appName: 'Cyber Void Survivor',
  webDir: 'dist',
  android: {
    backgroundColor: '#020617',
    allowMixedContent: false,
  },
};

export default config;
