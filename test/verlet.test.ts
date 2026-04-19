import { describe, expect, it } from "vitest";
import { ParticleBuffer } from "../src/core/particles.js";
import { integrate } from "../src/core/verlet.js";

describe("verlet integrator", () => {
  it("follows free-fall trajectory under gravity", () => {
    const buf = new ParticleBuffer();
    buf.add({ x: 0, y: 0, radius: 1 });

    const g = 9.81;
    const dt = 1 / 240;
    const steps = 240;
    for (let i = 0; i < steps; i++) {
      integrate(buf, dt, { gravityY: g, damping: 1 });
    }

    const t = dt * steps;
    const expected = 0.5 * g * t * t;
    expect(buf.posY[0]).toBeCloseTo(expected, 1);
  });

  it("damping reduces kinetic energy", () => {
    const moving = new ParticleBuffer();
    moving.add({ x: 0, y: 0, px: -1, radius: 1 });
    const free = new ParticleBuffer();
    free.add({ x: 0, y: 0, px: -1, radius: 1 });

    const dt = 1 / 60;
    for (let i = 0; i < 100; i++) {
      integrate(moving, dt, { damping: 0.9 });
      integrate(free, dt, { damping: 1 });
    }

    const vDamped = Math.abs(moving.posX[0] - moving.prevX[0]);
    const vFree = Math.abs(free.posX[0] - free.prevX[0]);
    expect(vDamped).toBeLessThan(vFree);
  });

  it("is deterministic for identical inputs", () => {
    const run = (): number[] => {
      const buf = new ParticleBuffer();
      buf.add({ x: 5, y: 5, px: 4.9, py: 5.1, radius: 1 });
      for (let i = 0; i < 500; i++) {
        integrate(buf, 1 / 120, { gravityY: 9.81, damping: 0.99 });
      }
      return [buf.posX[0], buf.posY[0], buf.prevX[0], buf.prevY[0]];
    };
    expect(run()).toEqual(run());
  });
});
