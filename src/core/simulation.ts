import {
  WorldBounds,
  applyBounds,
  buildQuadtree,
  resolveCollisions,
} from "./collision.js";
import { ParticleBuffer, ParticleInit } from "./particles.js";
import { QuadtreeOptions } from "./quadtree.js";
import { IntegratorOptions, integrate } from "./verlet.js";

export interface SimulationOptions {
  world: WorldBounds;
  gravityX?: number;
  gravityY?: number;
  damping?: number;
  fixedStep?: number;
  substeps?: number;
  quadtree?: QuadtreeOptions;
  capacity?: number;
}

export class Simulation {
  readonly buffer: ParticleBuffer;
  readonly world: WorldBounds;
  readonly fixedStep: number;
  readonly substeps: number;

  private integratorOptions: IntegratorOptions;
  private quadtreeOptions?: QuadtreeOptions;
  private accumulator = 0;

  constructor(options: SimulationOptions) {
    this.world = options.world;
    this.fixedStep = options.fixedStep ?? 1 / 60;
    this.substeps = Math.max(1, options.substeps ?? 2);
    this.buffer = new ParticleBuffer(options.capacity);
    this.quadtreeOptions = options.quadtree;
    this.integratorOptions = {
      gravityX: options.gravityX ?? 0,
      gravityY: options.gravityY ?? 0,
      damping: options.damping ?? 0.999,
    };
  }

  add(p: ParticleInit): number {
    return this.buffer.add(p);
  }

  get count(): number {
    return this.buffer.count;
  }

  applyForce(index: number, fx: number, fy: number): void {
    this.buffer.accX[index] += fx * this.buffer.invMass[index];
    this.buffer.accY[index] += fy * this.buffer.invMass[index];
  }

  advance(frameDt: number): number {
    this.accumulator += frameDt;
    let steps = 0;
    while (this.accumulator >= this.fixedStep) {
      this.step(this.fixedStep);
      this.accumulator -= this.fixedStep;
      steps++;
      if (steps > 8) {
        this.accumulator = 0;
        break;
      }
    }
    return steps;
  }

  step(dt: number): void {
    const sub = dt / this.substeps;
    for (let s = 0; s < this.substeps; s++) {
      integrate(this.buffer, sub, this.integratorOptions);
      const tree = buildQuadtree(this.buffer, this.world, this.quadtreeOptions);
      resolveCollisions(this.buffer, tree);
      applyBounds(this.buffer, this.world);
    }
  }
}
