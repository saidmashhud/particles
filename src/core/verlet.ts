import { ParticleBuffer } from "./particles.js";

export interface IntegratorOptions {
  gravityX?: number;
  gravityY?: number;
  damping?: number;
}

export const integrate = (
  buf: ParticleBuffer,
  dt: number,
  options: IntegratorOptions = {},
): void => {
  const gx = options.gravityX ?? 0;
  const gy = options.gravityY ?? 0;
  const damping = options.damping ?? 1;
  const dt2 = dt * dt;
  const n = buf.count;

  for (let i = 0; i < n; i++) {
    if (buf.invMass[i] === 0) continue;

    const x = buf.posX[i];
    const y = buf.posY[i];

    const vx = (x - buf.prevX[i]) * damping;
    const vy = (y - buf.prevY[i]) * damping;

    buf.posX[i] = x + vx + (gx + buf.accX[i]) * dt2;
    buf.posY[i] = y + vy + (gy + buf.accY[i]) * dt2;

    buf.prevX[i] = x;
    buf.prevY[i] = y;

    buf.accX[i] = 0;
    buf.accY[i] = 0;
  }
};
