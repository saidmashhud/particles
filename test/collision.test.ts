import { describe, expect, it } from "vitest";
import {
  WorldBounds,
  applyBounds,
  buildQuadtree,
  resolveCollisions,
} from "../src/core/collision.js";
import { ParticleBuffer } from "../src/core/particles.js";

const world: WorldBounds = { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };

describe("collision", () => {
  it("separates two overlapping equal particles", () => {
    const buf = new ParticleBuffer();
    buf.add({ x: 100, y: 100, radius: 10 });
    buf.add({ x: 105, y: 100, radius: 10 });

    const tree = buildQuadtree(buf, world);
    resolveCollisions(buf, tree);

    const dx = buf.posX[1] - buf.posX[0];
    expect(dx).toBeGreaterThanOrEqual(20 - 1e-9);
  });

  it("conserves center of mass for equal masses", () => {
    const buf = new ParticleBuffer();
    buf.add({ x: 100, y: 100, radius: 10, mass: 1 });
    buf.add({ x: 106, y: 100, radius: 10, mass: 1 });
    const cmBefore = (buf.posX[0] + buf.posX[1]) / 2;

    const tree = buildQuadtree(buf, world);
    resolveCollisions(buf, tree);

    const cmAfter = (buf.posX[0] + buf.posX[1]) / 2;
    expect(cmAfter).toBeCloseTo(cmBefore, 9);
  });

  it("pushes correction proportional to inverse mass", () => {
    const buf = new ParticleBuffer();
    buf.add({ x: 100, y: 100, radius: 10, mass: 0 });
    buf.add({ x: 105, y: 100, radius: 10, mass: 1 });

    const tree = buildQuadtree(buf, world);
    resolveCollisions(buf, tree);

    expect(buf.posX[0]).toBe(100);
    expect(buf.posX[1]).toBeGreaterThanOrEqual(120 - 1e-9);
  });

  it("keeps particles within world bounds", () => {
    const buf = new ParticleBuffer();
    buf.add({ x: -50, y: 100, radius: 5 });
    buf.add({ x: 1200, y: 100, radius: 5 });
    buf.add({ x: 100, y: -30, radius: 5 });

    applyBounds(buf, world);

    for (let i = 0; i < buf.count; i++) {
      expect(buf.posX[i] - buf.radius[i]).toBeGreaterThanOrEqual(world.minX - 1e-9);
      expect(buf.posX[i] + buf.radius[i]).toBeLessThanOrEqual(world.maxX + 1e-9);
      expect(buf.posY[i] - buf.radius[i]).toBeGreaterThanOrEqual(world.minY - 1e-9);
    }
  });
});
