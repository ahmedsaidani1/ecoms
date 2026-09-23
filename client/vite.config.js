import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Un seul serveur de dev a la fois : deux instances partagent le cache
    // node_modules/.vite et se cassent mutuellement (page blanche).
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
});
