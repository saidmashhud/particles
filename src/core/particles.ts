export interface ParticleInit {
  x: number;
  y: number;
  px?: number;
  py?: number;
  radius?: number;
  mass?: number;
}

export class ParticleBuffer {
  posX: Float64Array;
  posY: Float64Array;
  prevX: Float64Array;
  prevY: Float64Array;
  accX: Float64Array;
  accY: Float64Array;
  radius: Float64Array;
  invMass: Float64Array;
  count = 0;

  private capacity: number;

  constructor(capacity = 16384) {
    this.capacity = capacity;
    this.posX = new Float64Array(capacity);
    this.posY = new Float64Array(capacity);
    this.prevX = new Float64Array(capacity);
    this.prevY = new Float64Array(capacity);
    this.accX = new Float64Array(capacity);
    this.accY = new Float64Array(capacity);
    this.radius = new Float64Array(capacity);
    this.invMass = new Float64Array(capacity);
  }

  add(p: ParticleInit): number {
    if (this.count >= this.capacity) this.grow();
    const i = this.count++;
    this.posX[i] = p.x;
    this.posY[i] = p.y;
    this.prevX[i] = p.px ?? p.x;
    this.prevY[i] = p.py ?? p.y;
    this.accX[i] = 0;
    this.accY[i] = 0;
    this.radius[i] = p.radius ?? 4;
    const mass = p.mass ?? 1;
    this.invMass[i] = mass > 0 ? 1 / mass : 0;
    return i;
  }

  clear(): void {
    this.count = 0;
  }

  private grow(): void {
    const next = this.capacity * 2;
    const copy = (src: Float64Array): Float64Array => {
      const dst = new Float64Array(next);
      dst.set(src);
      return dst;
    };
    this.posX = copy(this.posX);
    this.posY = copy(this.posY);
    this.prevX = copy(this.prevX);
    this.prevY = copy(this.prevY);
    this.accX = copy(this.accX);
    this.accY = copy(this.accY);
    this.radius = copy(this.radius);
    this.invMass = copy(this.invMass);
    this.capacity = next;
  }
}
