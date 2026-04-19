import { AABB } from "./aabb.js";
import { ParticleBuffer } from "./particles.js";
import { Quadtree, QuadtreeOptions } from "./quadtree.js";

export interface WorldBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export const buildQuadtree = (
  buf: ParticleBuffer,
  world: WorldBounds,
  options?: QuadtreeOptions,
): Quadtree => {
  const cx = (world.minX + world.maxX) / 2;
  const cy = (world.minY + world.maxY) / 2;
  const hw = (world.maxX - world.minX) / 2;
  const hh = (world.maxY - world.minY) / 2;
  const tree = new Quadtree({ cx, cy, hw, hh }, options);
  for (let i = 0; i < buf.count; i++) {
    tree.insert({ x: buf.posX[i], y: buf.posY[i], index: i });
  }
  return tree;
};

export const resolveCollisions = (
  buf: ParticleBuffer,
  tree: Quadtree,
): void => {
  const n = buf.count;
  const range: AABB = { cx: 0, cy: 0, hw: 0, hh: 0 };
  const candidates = [] as { x: number; y: number; index: number }[];

  for (let i = 0; i < n; i++) {
    const ri = buf.radius[i];
    range.cx = buf.posX[i];
    range.cy = buf.posY[i];
    range.hw = ri * 2 + buf.radius[i];
    range.hh = range.hw;

    candidates.length = 0;
    tree.query(range, candidates);

    for (const c of candidates) {
      const j = c.index;
      if (j <= i) continue;

      const dx = buf.posX[j] - buf.posX[i];
      const dy = buf.posY[j] - buf.posY[i];
      const minDist = ri + buf.radius[j];
      const d2 = dx * dx + dy * dy;
      if (d2 >= minDist * minDist || d2 === 0) continue;

      const d = Math.sqrt(d2);
      const overlap = minDist - d;
      const nx = dx / d;
      const ny = dy / d;

      const wi = buf.invMass[i];
      const wj = buf.invMass[j];
      const wsum = wi + wj;
      if (wsum === 0) continue;

      const ci = overlap * (wi / wsum);
      const cj = overlap * (wj / wsum);
      buf.posX[i] -= nx * ci;
      buf.posY[i] -= ny * ci;
      buf.posX[j] += nx * cj;
      buf.posY[j] += ny * cj;
    }
  }
};

export const applyBounds = (buf: ParticleBuffer, world: WorldBounds): void => {
  const n = buf.count;
  for (let i = 0; i < n; i++) {
    const r = buf.radius[i];
    if (buf.posX[i] - r < world.minX) buf.posX[i] = world.minX + r;
    else if (buf.posX[i] + r > world.maxX) buf.posX[i] = world.maxX - r;

    if (buf.posY[i] - r < world.minY) buf.posY[i] = world.minY + r;
    else if (buf.posY[i] + r > world.maxY) buf.posY[i] = world.maxY - r;
  }
};
