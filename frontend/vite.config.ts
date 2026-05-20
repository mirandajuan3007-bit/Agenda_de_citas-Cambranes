import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo redirigimos las llamadas /api al backend Spring Boot
// para que el frontend funcione tanto via `npm run dev` como dentro
// de Docker (nginx ya proxypassa /api -> backend:8080).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
