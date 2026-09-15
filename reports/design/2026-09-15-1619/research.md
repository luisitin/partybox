# Research notes — design pass 2026-09-15

Takeaways in my own words, applied to what the capture showed. Links are for follow-up reading only;
nothing was copied.

## 10-foot UI (TV)

- The "10-foot" rule: viewers sit ~3 m away, so anything under roughly 24 sp on Android TV is
  illegible; a practical rule of thumb is mobile sizes × 2.5–3. PartyBox's own scale (body 36 px at
  1080p) is in line with that — the problem found in this pass is that the scale is not actually
  applied to inherited text on the TV (18 px leaks through).
- Keep a 5 % safe margin on every side of the 1920×1080 canvas (≈ 96 px left/right, 54 px top/bottom)
  for anything that carries meaning; decoration may bleed to the edge. Toasts and the mute/fullscreen
  controls currently sit inside that band.
- One focal point per screen, high contrast, and oversized state indicators — small glyphs (the 12–20 px
  VIP star) vanish at distance.
- Sources: [Fire TV design guidelines](https://developer.amazon.com/docs/fire-tv/design-and-user-experience-guidelines.html),
  [Designing a 10 ft UI](https://pascalpotvin.medium.com/designing-a-10ft-ui-ae2ca0da08b7),
  [TV guidelines kick-off](https://uxdesign.cc/guidelines-designing-for-television-experience-524f19ab6357),
  [Large-screen readability](https://www.alicia.design/post/solving-small-text-and-contrast-issues-for-large-screen-readability).

## Party-game stage conventions (timers, whose turn)

- Couch games treat the countdown as a character: it is big, it lives in one predictable place, and it
  changes voice (colour, size, sound) for the final seconds. Extended-timer settings exist because the
  default pace is tuned for readers, not typers.
- Player state is shown on the TV as a row of avatar+name chips; the phone mirrors only _my_ state
  (submitted / waiting) and never reveals what the stage has not.
- Sources: [Jackbox timer game type](https://www.jackboxgames.com/game-type/timer),
  [Jackbox accessibility features](https://www.jackboxgames.com/blog/streaming-moderation-accessibility-features-jackbox-party-pack-eight).

## Phone ergonomics

- Minimum tap target: 44 pt (Apple) / 48 dp (Android); WCAG 2.5.8 accepts 24 px only with spacing.
  PartyBox's `--pb-touch` = 44 px and 56 px buttons are fine; the 12 px connection dot is decorative
  and must not be the only carrier of state (it is, on the kicked screen).
- Put the primary action in the bottom third (thumb arc) and keep transient UI (toasts) out of it —
  the phone toasts currently stack over the submit button.
- Sources: [WCAG 2.5.8 guide](https://www.allaccessible.org/blog/wcag-258-target-size-minimum-implementation-guide),
  [Touch target sizes](https://blog.logrocket.com/ux-design/all-accessible-touch-target-sizes/),
  [Tap targets and thumb zones](https://www.72technologies.com/blog/tap-targets-thumb-zones-mobile-ux).

## iOS Safari keyboard

- `100dvh` + a sticky footer is the right base (the shell already does this). On iOS the visual
  viewport shrinks before `dvh` updates, so a footer can briefly slide under the keyboard; the robust
  fix is to position the footer from `visualViewport.height` (top + translateY(-100%)) or use
  `env(keyboard-inset-height)`. Not reproducible headless — needs a real iPhone check before the pass
  is closed.
- Sources: [Fixed elements above the iOS keyboard](https://mathix.dev/blog/fix-html-elements-on-top-of-the-ios-keyboard-using-html-css-js),
  [VirtualKeyboard API](https://www.bram.us/2021/09/13/prevent-items-from-being-hidden-underneath-the-virtual-keyboard-by-means-of-the-virtualkeyboard-api/),
  [visualViewport fix](https://dev.to/franciscomoretti/fix-mobile-keyboard-overlap-with-visualviewport-3a4a).

## Contrast and motion

- 4.5:1 for normal text, 3:1 for large text (≥ 24 px regular / 18.7 px bold) and for UI boundaries
  (focus rings, input borders). Dark UIs benefit from aiming higher than the minimum because light
  text on dark "blooms".
- `prefers-reduced-motion` should shorten or replace motion, not only zero CSS durations: JS-driven
  sequences (the Reveal stepper) need to read the media query too. Never flash > 3×/s.
- Measured token pairs (WCAG ratio): text/bg 17.5, muted/bg 9.6, muted/surface 8.3, muted/surface-2 6.9,
  accent-2 timer/surface 11.2, danger urgent timer/surface **4.48** (large text → passes 3:1),
  button label/accent 6.6, ✓ submitted 10.1, error strip 5.3, **disabled button label 2.7**.
- Sources: [WebAIM contrast](https://webaim.org/articles/contrast/),
  [Dark-mode contrast guide](https://www.colorcontrast.org/blog/dark-mode-contrast-accessibility-guide/),
  [Reduced motion (web.dev)](https://web.dev/learn/accessibility/motion),
  [MDN media queries for accessibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using_for_accessibility).
