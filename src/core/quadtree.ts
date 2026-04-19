import { AABB, containsPoint, intersects } from "./aabb.js";

export interface QuadPoint {
  x: number;
  y: number;
  index: number;
}

export interface QuadtreeOptions {
  capacity?: number;
  maxDepth?: number;
}

export class Quadtree {
  readonly bounds: AABB;
  readonly capacity: number;
  readonly maxDepth: number;
  readonly depth: number;

  private points: QuadPoint[] = [];
  private divided = false;
  private nw?: Quadtree;
  private ne?: Quadtree;
  private sw?: Quadtree;
  private se?: Quadtree;

  constructor(bounds: AABB, options: QuadtreeOptions = {}, depth = 0) {
    this.bounds = bounds;
    this.capacity = options.capacity ?? 8;
    this.maxDepth = options.maxDepth ?? 16;
    this.depth = depth;
  }

  insert(p: QuadPoint): boolean {
    if (!containsPoint(this.bounds, p.x, p.y)) return false;

    if (!this.divided) {
      if (this.points.length < this.capacity || this.depth >= this.maxDepth) {
        this.points.push(p);
        return true;
      }
      this.subdivide();
    }

    return (
      this.nw!.insert(p) ||
      this.ne!.insert(p) ||
      this.sw!.insert(p) ||
      this.se!.insert(p)
    );
  }

  private subdivide(): void {
    const { cx, cy, hw, hh } = this.bounds;
    const qw = hw / 2;
    const qh = hh / 2;
    const opts: QuadtreeOptions = { capacity: this.capacity, maxDepth: this.maxDepth };
    const d = this.depth + 1;

    this.nw = new Quadtree({ cx: cx - qw, cy: cy - qh, hw: qw, hh: qh }, opts, d);
    this.ne = new Quadtree({ cx: cx + qw, cy: cy - qh, hw: qw, hh: qh }, opts, d);
    this.sw = new Quadtree({ cx: cx - qw, cy: cy + qh, hw: qw, hh: qh }, opts, d);
    this.se = new Quadtree({ cx: cx + qw, cy: cy + qh, hw: qw, hh: qh }, opts, d);
    this.divided = true;

    const carry = this.points;
    this.points = [];
    for (const p of carry) {
      this.nw.insert(p) ||
        this.ne!.insert(p) ||
        this.sw!.insert(p) ||
        this.se!.insert(p);
    }
  }

  query(range: AABB, out: QuadPoint[] = []): QuadPoint[] {
    if (!intersects(this.bounds, range)) return out;

    if (this.divided) {
      this.nw!.query(range, out);
      this.ne!.query(range, out);
      this.sw!.query(range, out);
      this.se!.query(range, out);
    } else {
      for (const p of this.points) {
        if (containsPoint(range, p.x, p.y)) out.push(p);
      }
    }

    return out;
  }

  clear(): void {
    this.points = [];
    this.divided = false;
    this.nw = this.ne = this.sw = this.se = undefined;
  }

  size(): number {
    if (!this.divided) return this.points.length;
    return (
      this.nw!.size() + this.ne!.size() + this.sw!.size() + this.se!.size()
    );
  }

  isDivided(): boolean {
    return this.divided;
  }
}
