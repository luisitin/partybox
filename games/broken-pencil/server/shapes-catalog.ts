// The bot's picture book: one constructor per thing it can draw (see shapes.ts for the lookup).
import { C, arc, circle, line, poly, star, wave } from './shapes-draw';
import type { Points, Shape } from './shapes-draw';

export const sun = (): Shape => {
  const rays: Points[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    rays.push(
      line(C + Math.cos(a) * 62, C + Math.sin(a) * 62, C + Math.cos(a) * 92, C + Math.sin(a) * 92),
    );
  }
  return [circle(C, C, 50), ...rays];
};
export const moon = (): Shape => [
  arc(C, C, 70, -Math.PI / 2, Math.PI / 2, 16).concat(
    arc(C + 30, C, 52, Math.PI / 2, -Math.PI / 2, 16),
  ),
];
export const heart = (): Shape => [
  [
    ...arc(96, 100, 34, Math.PI, Math.PI * 2, 12),
    ...arc(160, 100, 34, Math.PI, Math.PI * 2, 12),
    128,
    200,
    62,
    100,
  ],
];
export const house = (): Shape => [
  poly(60, 120, 196, 120, 196, 210, 60, 210),
  poly(50, 120, 128, 50, 206, 120),
  poly(112, 210, 112, 160, 144, 160, 144, 210),
  poly(72, 140, 96, 140, 96, 164, 72, 164),
];
export const cat = (): Shape => [
  circle(C, 140, 56),
  poly(84, 104, 76, 56, 116, 92),
  poly(172, 104, 180, 56, 140, 92),
  circle(108, 130, 5, 8),
  circle(148, 130, 5, 8),
  poly(122, 152, 134, 152, 128, 160),
  line(60, 150, 104, 158),
  line(60, 170, 104, 164),
  line(196, 150, 152, 158),
  line(196, 170, 152, 164),
];
export const dog = (): Shape => [
  circle(C, 130, 54),
  poly(80, 100, 56, 170, 92, 150),
  poly(176, 100, 200, 170, 164, 150),
  circle(110, 122, 5, 8),
  circle(146, 122, 5, 8),
  circle(128, 150, 9, 10),
  arc(128, 154, 20, 0.2, Math.PI - 0.2, 8),
];
export const tree = (): Shape => [
  poly(116, 230, 140, 230, 140, 160, 116, 160),
  poly(60, 160, 128, 40, 196, 160),
  poly(76, 120, 128, 60, 180, 120),
];
export const fish = (): Shape => [
  circle(120, 128, 48, 28),
  poly(160, 128, 210, 96, 210, 160),
  circle(100, 118, 5, 8),
  arc(120, 128, 30, -0.9, 0.9, 8),
];
export const boat = (): Shape => [
  poly(40, 150, 216, 150, 186, 200, 70, 200),
  line(128, 150, 128, 60),
  poly(128, 60, 200, 140, 128, 140),
  wave(20, 236, 215, 6, 4),
];
export const car = (): Shape => [
  poly(40, 170, 40, 130, 80, 130, 104, 96, 170, 96, 196, 130, 216, 130, 216, 170),
  circle(80, 176, 18),
  circle(176, 176, 18),
  line(110, 104, 110, 130),
];
export const robot = (): Shape => [
  poly(88, 60, 168, 60, 168, 120, 88, 120),
  poly(76, 128, 180, 128, 180, 210, 76, 210),
  circle(108, 88, 8, 10),
  circle(148, 88, 8, 10),
  line(100, 108, 156, 108),
  line(128, 60, 128, 36),
  circle(128, 30, 6, 8),
  line(76, 150, 40, 170),
  line(180, 150, 216, 170),
  poly(96, 150, 160, 150, 160, 170, 96, 170),
];
export const ghost = (): Shape => [
  [
    ...arc(C, 110, 60, Math.PI, Math.PI * 2, 16),
    188,
    200,
    168,
    184,
    148,
    200,
    128,
    184,
    108,
    200,
    88,
    184,
    68,
    200,
    68,
    110,
  ],
  circle(108, 110, 7, 8),
  circle(148, 110, 7, 8),
  circle(128, 140, 8, 8),
];
export const hat = (): Shape => [
  poly(40, 160, 216, 160, 216, 172, 40, 172),
  poly(80, 160, 80, 70, 176, 70, 176, 160),
  line(80, 140, 176, 140),
];
export const banana = (): Shape => [
  arc(C, 60, 90, 0.3, Math.PI - 0.3, 14),
  arc(C, 60, 68, Math.PI - 0.35, 0.35, 14),
];
export const flower = (): Shape => {
  const petals: Points[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    petals.push(circle(C + Math.cos(a) * 34, 100 + Math.sin(a) * 34, 20, 12));
  }
  return [
    circle(C, 100, 16, 12),
    ...petals,
    line(C, 134, C, 230),
    arc(160, 200, 30, Math.PI, Math.PI * 1.6, 6),
  ];
};
export const cup = (): Shape => [
  poly(72, 90, 168, 90, 156, 200, 84, 200),
  arc(178, 130, 24, -Math.PI / 2, Math.PI / 2, 10),
  wave(96, 144, 70, 5, 2),
];
export const pizza = (): Shape => [
  poly(48, 60, 208, 60, 128, 220),
  circle(110, 90, 8, 8),
  circle(150, 100, 8, 8),
  circle(128, 140, 8, 8),
  circle(118, 178, 6, 8),
];
export const cloud = (): Shape => [
  [
    ...arc(90, 140, 30, Math.PI * 0.5, Math.PI * 1.5, 10),
    ...arc(128, 110, 40, Math.PI, Math.PI * 2, 14),
    ...arc(176, 140, 30, Math.PI * 1.5, Math.PI * 2.5, 10),
    90,
    170,
  ],
];
export const rain = (): Shape => [
  ...cloud(),
  line(90, 190, 80, 220),
  line(128, 190, 118, 220),
  line(166, 190, 156, 220),
];
export const umbrella = (): Shape => [
  arc(C, 120, 90, Math.PI, Math.PI * 2, 18),
  line(38, 120, 218, 120),
  line(C, 120, C, 220),
  arc(112, 220, 16, 0, Math.PI, 8),
];
export const phone = (): Shape => [
  poly(84, 30, 172, 30, 172, 226, 84, 226),
  poly(92, 50, 164, 50, 164, 190, 92, 190),
  circle(128, 208, 8, 10),
];
export const shoe = (): Shape => [
  [40, 200, 40, 120, 90, 120, 130, 150, 216, 170, 216, 200, 40, 200],
  line(60, 140, 90, 140),
  line(64, 160, 100, 160),
];
export const snake = (): Shape => [
  wave(30, 226, 128, 30, 3),
  circle(226, 120, 10, 10),
  line(236, 120, 250, 116),
];
export const apple = (): Shape => [
  circle(C, 140, 66, 28),
  line(C, 74, C + 6, 44),
  arc(150, 60, 22, Math.PI, Math.PI * 1.8, 8),
];
export const ball = (): Shape => [
  circle(C, C, 80),
  arc(C, C, 80, -0.6, 0.6, 8),
  arc(C, C, 80, Math.PI - 0.6, Math.PI + 0.6, 8),
  line(60, 128, 196, 128),
];
export const bird = (): Shape => [
  circle(120, 128, 40, 24),
  circle(166, 96, 20, 16),
  poly(184, 96, 210, 100, 184, 108),
  line(96, 120, 60, 100),
  line(96, 136, 60, 156),
  line(110, 168, 110, 200),
  line(130, 168, 130, 200),
];
export const spider = (): Shape => {
  const legs: Points[] = [];
  for (let i = 0; i < 4; i++) {
    const y = 100 + i * 20;
    legs.push(line(96, y, 30, y - 30 + i * 20), line(160, y, 226, y - 30 + i * 20));
  }
  return [circle(C, 128, 34, 20), circle(C, 84, 18, 12), ...legs];
};
export const glasses = (): Shape => [
  circle(84, 128, 34),
  circle(172, 128, 34),
  line(118, 128, 138, 128),
  line(50, 120, 20, 110),
  line(206, 120, 236, 110),
];
export const key = (): Shape => [
  circle(70, 128, 30),
  line(100, 128, 220, 128),
  line(200, 128, 200, 156),
  line(220, 128, 220, 150),
];
export const egg = (): Shape => [
  [...arc(C, 140, 56, 0, Math.PI, 14), ...arc(C, 110, 56, Math.PI, Math.PI * 2, 14)],
];
export const clock = (): Shape => [
  circle(C, C, 84),
  line(C, C, C, 70),
  line(C, C, 176, 128),
  line(C, 44, C, 52),
  line(C, 204, C, 212),
];
export const moonAndStars = (): Shape => [...moon(), star(60, 60, 14, 6), star(200, 70, 10, 4)];
export const shrug = (): Shape => [
  circle(96, 140, 44),
  circle(80, 130, 5, 8),
  circle(112, 130, 5, 8),
  arc(96, 148, 20, 0.3, Math.PI - 0.3, 8),
  arc(180, 80, 24, Math.PI, Math.PI * 2.4, 10),
  line(190, 100, 190, 130),
  circle(190, 150, 5, 8),
];
