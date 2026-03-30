import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'it.consenso.app',
  appName: 'APP del Consenso',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0F0F14',
    },
  },
}

export default config
