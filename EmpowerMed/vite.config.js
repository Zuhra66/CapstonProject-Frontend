import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // If you set VITE_API_ORIGIN in .env (e.g. https://empowermed-backend.onrender.com),
  // we'll still proxy in dev when it's localhost; otherwise the app will call that origin directly.
  const apiOrigin = env.VITE_API_ORIGIN || 'http://localhost:5001';
  const isLocal = /^(https?:\/\/)?(localhost|127\.0\.0\.1)/i.test(apiOrigin);

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      // In local dev, proxy to your local backend to avoid CORS and HTML responses.
      proxy: isLocal
        ? {
            '/api':   { target: apiOrigin, changeOrigin: true, secure: false },
            '/auth':  { target: apiOrigin, changeOrigin: true, secure: false },
            '/internal': { target: apiOrigin, changeOrigin: true, secure: false },
          }
        : undefined,
    },
    resolve: { alias: { '@': '/src' } },
  };
});
