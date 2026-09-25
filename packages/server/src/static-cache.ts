// The built client in `pnpm start`: files, the SPA fallback, and how long a phone may keep each
// file (Part 00 §2.4, FOUNDATION-AUDIT #9). The launcher rebuilds on every start, so only Vite's
// content-hashed chunks may be cached for good: an index.html kept for an hour could point a phone
// at chunks the rebuild deleted (net/stale.ts only papers over that with a reload).
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { FastifyInstance } from 'fastify';

/** `/assets/*`: a new build is a new URL, so a phone keeps last week's chunks for good. */
export const CACHE_HASHED = 'public, max-age=31536000, immutable';
/** HTML names the current chunks: always revalidate (a cheap 304 while nothing changed). */
export const CACHE_HTML = 'no-cache';
/** `/music/*`, `/sfx/*`: big files whose names survive a rebuild, so long but never immutable. */
export const CACHE_AUDIO = 'public, max-age=604800';

/**
 * The Cache-Control for a file under dist (a path relative to it; a `.br`/`.gz` sibling counts as
 * its original), or null to keep @fastify/static's one-hour default.
 */
export function cacheControlFor(relPath: string): string | null {
  const path = relPath.replaceAll('\\', '/').replace(/\.(br|gz)$/, '');
  if (path.endsWith('.html')) return CACHE_HTML;
  if (path.startsWith('assets/')) return CACHE_HASHED;
  if (path.startsWith('music/') || path.startsWith('sfx/')) return CACHE_AUDIO;
  return null;
}

/** Serves `dist` (packages/client/dist in production; a fixture folder in tests). */
export async function registerStatic(fastify: FastifyInstance, dist: string): Promise<void> {
  if (!existsSync(join(dist, 'index.html'))) {
    throw new Error(`No built client at ${dist}. Run "pnpm build" first (or use "pnpm dev").`);
  }
  const fastifyStatic = (await import('@fastify/static')).default;
  await fastify.register(fastifyStatic, {
    root: dist,
    wildcard: false,
    index: ['index.html'],
    cacheControl: true,
    maxAge: '1h',
    immutable: false,
    // The client build writes .br/.gz next to the big text assets (packages/client/vite.config.ts):
    // the reply picks one by Accept-Encoding (with Vary) and falls back to the plain file, which is
    // all audio ever gets. The siblings are not URLs of their own.
    preCompressed: true,
    globIgnore: ['**/*.br', '**/*.gz'],
    setHeaders: (reply, path) => {
      const rule = cacheControlFor(relative(dist, path));
      if (rule) reply.header('cache-control', rule);
    },
  });
  // SPA fallback: any unknown GET that wants HTML gets index.html (routes are client-side); it
  // goes through setHeaders like the real file, so it is no-cache too.
  fastify.setNotFoundHandler(async (req, reply) => {
    if (
      req.method === 'GET' &&
      !req.url.startsWith('/api/') &&
      (req.headers.accept ?? '').includes('text/html')
    ) {
      return reply.sendFile('index.html');
    }
    return reply.code(404).send({ error: 'not found' });
  });
}
