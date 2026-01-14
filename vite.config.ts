import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],

    server: {
      port: 3000,
      host: '0.0.0.0',

      // REQUIRED for Cloudflare Tunnel / custom domain
      allowedHosts: [
        'report.darkroastops.com',
        '.darkroastops.com'
      ]
    },

    // Remove Gemini-specific env wiring
    // (You are now using OpenAI via fetch)
    define: {},

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
