import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

// Also imported by packages/server in dev mode (Vite middleware, ADR-006): keep it side-effect free.
export default defineConfig({
  plugins: [react()],
  appType: 'spa',
  server: {
    // Game client code lives outside this package (games/<id>/client); allow serving it.
    fs: { allow: [repoRoot] },
  },
  resolve: { dedupe: ['react', 'react-dom'] },
  build: { outDir: 'dist', emptyOutDir: true, sourcemap: false },
});
