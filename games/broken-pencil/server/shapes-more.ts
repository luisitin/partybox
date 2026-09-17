// More pictures for the bot (shapes.ts looks them up): every word in lines.json's botGuesses has
// one, so a bot's own guess is always something it can draw on the next page.
import { C, arc, circle, line, poly, wave } from './shapes-draw';
import type { Shape } from './shapes-draw';

export const cake = (): Shape => [
  poly(56, 130, 200, 130, 200, 210, 56, 210),
  wave(56, 200, 150, 6, 4),
  line(96, 130, 96, 96),
  line(128, 130, 128, 90),
  line(160, 130, 160, 96),
  circle(96, 86, 5, 8),
  circle(128, 80, 5, 8),
  circle(160, 86, 5, 8),
];
export const crown = (): Shape => [
  poly(56, 200, 56, 100, 92, 140, 128, 80, 164, 140, 200, 100, 200, 200),
  circle(92, 176, 6, 8),
  circle(128, 176, 6, 8),
  circle(164, 176, 6, 8),
];
export const chair = (): Shape => [
  poly(80, 40, 120, 40, 120, 140, 80, 140),
  poly(80, 140, 190, 140, 190, 160, 80, 160),
  line(84, 160, 84, 220),
  line(186, 160, 186, 220),
  line(116, 160, 116, 220),
];
export const dragon = (): Shape => [
  wave(40, 200, 150, 22, 2),
  circle(206, 130, 22, 14),
  poly(224, 122, 250, 118, 226, 136),
  line(216, 118, 226, 100),
  poly(90, 132, 70, 70, 130, 120),
  poly(140, 130, 150, 76, 176, 122),
  line(70, 170, 60, 200),
  line(120, 172, 116, 200),
  line(170, 170, 180, 200),
];
export const sock = (): Shape => [
  [86, 40, 150, 40, 150, 130, 200, 170, 180, 210, 120, 210, 86, 150, 86, 40],
  line(86, 60, 150, 60),
  line(96, 120, 140, 120),
];
export const frog = (): Shape => [
  circle(C, 150, 60, 24),
  circle(98, 96, 18, 12),
  circle(158, 96, 18, 12),
  circle(98, 96, 6, 8),
  circle(158, 96, 6, 8),
  arc(C, 150, 32, 0.3, Math.PI - 0.3, 8),
  line(72, 190, 40, 220),
  line(184, 190, 216, 220),
];
export const bell = (): Shape => [
  [...arc(C, 150, 64, Math.PI, Math.PI * 2, 16), 200, 180, 56, 180, 64, 150],
  line(56, 180, 200, 180),
  circle(C, 196, 10, 10),
  line(C, 86, C, 66),
];
export const door = (): Shape => [
  poly(76, 30, 180, 30, 180, 226, 76, 226),
  poly(96, 50, 160, 50, 160, 120, 96, 120),
  circle(164, 150, 6, 8),
];
export const kite = (): Shape => [
  poly(C, 30, 196, 100, C, 190, 60, 100),
  line(60, 100, 196, 100),
  line(C, 30, C, 190),
  wave(60, 128, 220, 10, 2).map((v, i) => (i % 2 === 0 ? v : v + 8)),
];
export const bone = (): Shape => [
  line(80, 108, 176, 108),
  line(80, 148, 176, 148),
  circle(72, 96, 16, 12),
  circle(72, 160, 16, 12),
  circle(184, 96, 16, 12),
  circle(184, 160, 16, 12),
];
export const lamp = (): Shape => [
  poly(70, 120, 186, 120, 160, 40, 96, 40),
  line(C, 120, C, 200),
  poly(80, 220, 176, 220, 160, 200, 96, 200),
  line(C, 130, 110, 150),
  line(C, 130, 146, 150),
];
export const ring = (): Shape => [
  circle(C, 150, 60),
  circle(C, 150, 44),
  poly(C, 60, 156, 90, 128, 108, 100, 90),
];
export const leaf = (): Shape => [
  [...arc(96, 128, 70, -0.9, 0.9, 12), ...arc(160, 128, 70, Math.PI - 0.9, Math.PI + 0.9, 12)],
  line(60, 128, 200, 128),
  line(100, 128, 116, 100),
  line(130, 128, 150, 96),
  line(100, 128, 116, 156),
  line(130, 128, 150, 160),
  line(60, 128, 30, 150),
];
