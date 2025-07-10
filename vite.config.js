import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/car-location-logger/',
  plugins: [react()],
  build: {
    outDir: 'docs',   
  },
});