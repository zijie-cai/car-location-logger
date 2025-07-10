// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',    // makes all asset links relative (works in both dev & docs/)
  plugins: [react()],
  build: { outDir: 'docs' }
});