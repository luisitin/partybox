// The TV is designed at 1920×1080 CSS px (docs/DESIGN_SYSTEM.md): every token is a px value sized
// for a 3 m couch. A PC at 150 % display scaling reports a 1280×720 viewport (the stage spilled
// off-screen until the browser was zoomed to 67 %); a 4K TV browser reports 3840×2160 (everything
// tiny). `zoom` on <html> fits the design to whatever the viewport is: the subtree scales and the
// layout viewport becomes viewport ÷ zoom, so a 16:10 or 21:9 screen gets a slightly taller or
// wider 1080p stage instead of letterboxing. Viewport units are NOT divided by zoom, so TV styles
// use px and % (`--pb-overscan-*` are px for that reason).
export const TV_DESIGN = { width: 1920, height: 1080 } as const;

export function tvZoom(width: number, height: number): number {
  return Math.min(width / TV_DESIGN.width, height / TV_DESIGN.height);
}

/** Sets `--pb-tv-zoom` on <html> (global.css applies it) and keeps it current on resize. */
export function fitTvToViewport(): () => void {
  const apply = (): void => {
    document.documentElement.style.setProperty(
      '--pb-tv-zoom',
      tvZoom(window.innerWidth, window.innerHeight).toFixed(4),
    );
  };
  apply();
  window.addEventListener('resize', apply);
  return () => window.removeEventListener('resize', apply);
}
