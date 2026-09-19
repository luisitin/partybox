import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

// The GitHub Pages build (ADR-034). `base` must match where Pages serves the site from:
// "/<repo>/" for a project site, "/" for a user/org site or a custom domain. The workflow in
// .github/workflows/pages.yml passes it as PARTYBOX_BASE; the default suits a fork named partybox.
export default defineConfig({
  base: process.env['PARTYBOX_BASE'] ?? '/partybox/',
  plugins: [react()],
  appType: 'spa',
  server: {
    port: 42072,
    // Game and client code lives outside this package; allow serving it in dev.
    fs: { allow: [repoRoot] },
  },
  resolve: { dedupe: ['react', 'react-dom'] },
  build: { outDir: 'dist', emptyOutDir: true, sourcemap: false },
});
