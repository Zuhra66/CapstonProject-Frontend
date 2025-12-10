// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiOrigin = env.VITE_API_ORIGIN || 'http://localhost:5001';
  const isLocal = /^(https?:\/\/)?(localhost|127\.0\.0\.1)/i.test(apiOrigin);

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: isLocal
        ? {
            '/api':      { target: apiOrigin, changeOrigin: true, secure: false },
            '/auth':     { target: apiOrigin, changeOrigin: true, secure: false },
            '/internal': { target: apiOrigin, changeOrigin: true, secure: false },
            // 🔧 NEW: proxy uploads so /uploads/... is served by the backend
            '/uploads':  { target: apiOrigin, changeOrigin: true, secure: false },
          }
        : undefined,
    },
    resolve: { alias: { '@': '/src' } },
  };
});
