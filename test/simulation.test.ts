import { describe, expect, it } from "vitest";
import { createPrng } from "../src/core/prng.js";
import { Simulation, SimulationOptions } from "../src/core/simulation.js";

const baseOptions: SimulationOptions = {
  world: { minX: 0, minY: 0, maxX: 800, maxY: 600 },
  gravityY: 9.81,
  damping: 0.99,
  fixedStep: 1 / 60,
  substeps: 2,
  quadtree: { capacity: 8, maxDepth: 12 },
};

const seedSim = (seed: number, n: number): Simulation => {
  const sim = new Simulation(baseOptions);
  const rng = createPrng(seed);
  for (let i = 0; i < n; i++) {
    sim.add({
      x: rng.range(50, 750),
      y: rng.range(50, 550),
      radius: 5,
    });
  }
  return sim;
};

const snapshot = (sim: Simulation): number[] => {
  const buf = sim.buffer;
  const out: number[] = [];
  for (let i = 0; i < buf.count; i++) {
    out.push(buf.posX[i], buf.posY[i], buf.prevX[i], buf.prevY[i]);
  }
  return out;
};

describe("simulation", () => {
  it("stepping identical initial state twice is deterministic", () => {
    const a = seedSim(12345, 300);
    const b = seedSim(12345, 300);

    for (let s = 0; s < 120; s++) {
      a.step(a.fixedStep);
      b.step(b.fixedStep);
    }

    expect(snapshot(a)).toEqual(snapshot(b));
  });

  it("accumulator advances deterministic fixed steps", () => {
    const sim = seedSim(777, 50);
    const steps = sim.advance(1 / 60 + 1 / 60 + 0.001);
    expect(steps).toBe(2);
  });

  it("keeps all particles inside world after many steps", () => {
    const sim = seedSim(99, 500);
    for (let s = 0; s < 200; s++) sim.step(sim.fixedStep);
    const { buffer: buf, world } = sim;
    for (let i = 0; i < buf.count; i++) {
      expect(buf.posX[i]).toBeGreaterThanOrEqual(world.minX - 1);
      expect(buf.posX[i]).toBeLessThanOrEqual(world.maxX + 1);
      expect(buf.posY[i]).toBeGreaterThanOrEqual(world.minY - 1);
      expect(buf.posY[i]).toBeLessThanOrEqual(world.maxY + 1);
    }
  });

  it("handles thousands of particles without error", () => {
    const sim = seedSim(2024, 5000);
    sim.step(sim.fixedStep);
    expect(sim.count).toBe(5000);
  });
});
