import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const API_PORT = process.env.API_PORT ?? '3001';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks: (id: string) => {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('/three/')) {
            return 'vendor-three';
          }

          if (id.includes('@react-three/fiber')) {
            return 'vendor-r3f';
          }

          if (id.includes('@react-three/drei')) {
            return 'vendor-drei';
          }

          if (
            id.includes('@react-three/postprocessing') ||
            id.includes('/postprocessing/')
          ) {
            return 'vendor-postfx';
          }

          if (id.includes('@react-spring/three')) {
            return 'vendor-spring3d';
          }

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/zustand/')
          ) {
            return 'vendor-react';
          }

          if (id.includes('/lucide-react/')) {
            return 'vendor-ui';
          }

          return 'vendor-misc';
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
      },
    },
  },
});
