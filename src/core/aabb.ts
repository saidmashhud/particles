export interface AABB {
  cx: number;
  cy: number;
  hw: number;
  hh: number;
}

export const aabb = (cx: number, cy: number, hw: number, hh: number): AABB => ({
  cx,
  cy,
  hw,
  hh,
});

export const containsPoint = (b: AABB, x: number, y: number): boolean =>
  x >= b.cx - b.hw && x <= b.cx + b.hw && y >= b.cy - b.hh && y <= b.cy + b.hh;

export const intersects = (a: AABB, b: AABB): boolean =>
  Math.abs(a.cx - b.cx) <= a.hw + b.hw && Math.abs(a.cy - b.cy) <= a.hh + b.hh;
