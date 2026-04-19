import { Simulation } from "../core/index.js";

export interface CanvasRendererOptions {
  background?: string;
  color?: string;
}

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private background: string;
  private color: string;

  constructor(
    private canvas: HTMLCanvasElement,
    options: CanvasRendererOptions = {},
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");
    this.ctx = ctx;
    this.background = options.background ?? "#0a0a0f";
    this.color = options.color ?? "#7dd3fc";
  }

  draw(sim: Simulation): void {
    const { ctx } = this;
    const buf = sim.buffer;
    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = this.color;
    ctx.beginPath();
    for (let i = 0; i < buf.count; i++) {
      const r = buf.radius[i];
      ctx.moveTo(buf.posX[i] + r, buf.posY[i]);
      ctx.arc(buf.posX[i], buf.posY[i], r, 0, Math.PI * 2);
    }
    ctx.fill();
  }
}

export interface RenderLoopHandle {
  stop(): void;
  fps(): number;
}

export const startRenderLoop = (
  sim: Simulation,
  renderer: CanvasRenderer,
  onFrame?: (steps: number) => void,
): RenderLoopHandle => {
  let last = performance.now();
  let raf = 0;
  let running = true;
  let frameCount = 0;
  let fpsAcc = 0;
  let fpsValue = 0;

  const tick = (now: number): void => {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;

    const steps = sim.advance(dt);
    renderer.draw(sim);
    onFrame?.(steps);

    fpsAcc += dt;
    frameCount++;
    if (fpsAcc >= 0.5) {
      fpsValue = frameCount / fpsAcc;
      fpsAcc = 0;
      frameCount = 0;
    }

    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);

  return {
    stop: () => {
      running = false;
      cancelAnimationFrame(raf);
    },
    fps: () => fpsValue,
  };
};
