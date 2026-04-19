import { Simulation, createPrng } from "@particles/core";
import { CanvasRenderer, startRenderLoop } from "@particles/render";

const canvas = document.getElementById("c") as HTMLCanvasElement;
const fpsEl = document.getElementById("fps")!;
const countEl = document.getElementById("count")!;
const countValEl = document.getElementById("countVal")!;
const slider = document.getElementById("slider") as HTMLInputElement;

const dpr = Math.min(window.devicePixelRatio || 1, 2);
let width = 0;
let height = 0;

const resize = (): void => {
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
};
resize();
window.addEventListener("resize", resize);

const renderer = new CanvasRenderer(canvas, { color: "#7dd3fc" });
const w0 = canvas.width;
const h0 = canvas.height;
const sim = new Simulation({
  world: { minX: 0, minY: 0, maxX: w0, maxY: h0 },
  gravityY: 1400,
  damping: 0.995,
  fixedStep: 1 / 60,
  substeps: 1,
  quadtree: { capacity: 8, maxDepth: 14 },
  capacity: 16384,
});

const buildSim = (n: number): void => {
  const w = sim.world.maxX;
  const h = sim.world.maxY;
  sim.buffer.clear();
  const rng = createPrng(1337);
  const r = Math.max(2, Math.min(w, h) / 320) * dpr;
  for (let i = 0; i < n; i++) {
    sim.add({
      x: rng.range(r, w - r),
      y: rng.range(r, h * 0.6),
      radius: r,
    });
  }
  countEl.textContent = String(n);
  countValEl.textContent = String(n);
};

buildSim(Number(slider.value));

slider.addEventListener("input", () => buildSim(Number(slider.value)));

const mouse = { x: 0, y: 0, active: false, repel: false };
canvas.addEventListener("pointermove", (e) => {
  mouse.x = e.offsetX * dpr;
  mouse.y = e.offsetY * dpr;
});
canvas.addEventListener("pointerdown", (e) => {
  mouse.active = true;
  mouse.repel = e.shiftKey;
  mouse.x = e.offsetX * dpr;
  mouse.y = e.offsetY * dpr;
});
window.addEventListener("pointerup", () => (mouse.active = false));

const applyMouse = (): void => {
  if (!mouse.active) return;
  const buf = sim.buffer;
  const radius = 180 * dpr;
  const r2 = radius * radius;
  const strength = (mouse.repel ? -1 : 1) * 9000;
  for (let i = 0; i < buf.count; i++) {
    const dx = mouse.x - buf.posX[i];
    const dy = mouse.y - buf.posY[i];
    const d2 = dx * dx + dy * dy;
    if (d2 > r2 || d2 === 0) continue;
    const d = Math.sqrt(d2);
    const f = (strength * (1 - d / radius)) / d;
    sim.applyForce(i, dx * f, dy * f);
  }
};

const handle = startRenderLoop(sim, renderer, () => applyMouse());

setInterval(() => {
  fpsEl.textContent = handle.fps().toFixed(0);
}, 250);
