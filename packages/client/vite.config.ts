import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, constants as zlib, gzipSync } from 'node:zlib';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

/** Text worth compressing ahead of time; audio, fonts and images are compressed already. */
const COMPRESSIBLE = /\.(js|css|svg|json)$/;

/**
 * FOUNDATION-AUDIT #9: `.br` and `.gz` siblings of every text file in dist/assets over 1 KB, made
 * once per build at maximum quality instead of per request; the host sends them to phones that
 * accept them (packages/server/src/static-cache.ts). writeBundle, not closeBundle: it runs only
 * when files were written, so the in-memory build of `pnpm check-bundle` never touches dist.
 */
function precompress(): Plugin {
  let outDir = '';
  return {
    name: 'partybox:precompress',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    writeBundle() {
      const assets = join(outDir, 'assets');
      for (const name of readdirSync(assets)) {
        const file = join(assets, name);
        if (!COMPRESSIBLE.test(name) || statSync(file).size <= 1024) continue;
        const body = readFileSync(file);
        const quality = {
          [zlib.BROTLI_PARAM_QUALITY]: 11,
          [zlib.BROTLI_PARAM_SIZE_HINT]: body.length,
        };
        writeFileSync(`${file}.br`, brotliCompressSync(body, { params: quality }));
        writeFileSync(`${file}.gz`, gzipSync(body, { level: 9 }));
      }
    },
  };
}

// Also imported by packages/server in dev mode (Vite middleware, ADR-006): keep it side-effect free.
export default defineConfig({
  plugins: [react(), precompress()],
  appType: 'spa',
  server: {
    // Game client code lives outside this package (games/<id>/client); allow serving it.
    fs: { allow: [repoRoot] },
    // A Cloudflare quick tunnel (the owner, 2026-09-21: guests outside the LAN) fronts the dev
    // server under a random *.trycloudflare.com host; Vite's host check must let it through.
    allowedHosts: ['.trycloudflare.com', '.ts.net'],
  },
  resolve: { dedupe: ['react', 'react-dom'] },
  build: { outDir: 'dist', emptyOutDir: true, sourcemap: false },
});
