import { describe, expect, it } from "vitest";
import { AABB, containsPoint, intersects } from "../src/core/aabb.js";
import { createPrng } from "../src/core/prng.js";
import { QuadPoint, Quadtree } from "../src/core/quadtree.js";

const bruteForce = (points: QuadPoint[], range: AABB): Set<number> => {
  const out = new Set<number>();
  for (const p of points) {
    if (containsPoint(range, p.x, p.y)) out.add(p.index);
  }
  return out;
};

const treeResult = (tree: Quadtree, range: AABB): Set<number> => {
  const out = new Set<number>();
  for (const p of tree.query(range)) out.add(p.index);
  return out;
};

describe("quadtree vs brute-force oracle", () => {
  it("query returns exactly the brute-force set over many seeds", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const rng = createPrng(seed * 1009);
      const bounds: AABB = { cx: 500, cy: 500, hw: 500, hh: 500 };
      const tree = new Quadtree(bounds, { capacity: 4, maxDepth: 10 });

      const points: QuadPoint[] = [];
      const n = 200 + Math.floor(rng.next() * 300);
      for (let i = 0; i < n; i++) {
        const p = { x: rng.range(0, 1000), y: rng.range(0, 1000), index: i };
        points.push(p);
        tree.insert(p);
      }

      for (let q = 0; q < 30; q++) {
        const cx = rng.range(0, 1000);
        const cy = rng.range(0, 1000);
        const hw = rng.range(1, 300);
        const hh = rng.range(1, 300);
        const range: AABB = { cx, cy, hw, hh };

        const expected = bruteForce(points, range);
        const actual = treeResult(tree, range);

        expect(actual).toEqual(expected);
      }
    }
  });
});

describe("quadtree structure", () => {
  it("does not subdivide below capacity", () => {
    const tree = new Quadtree({ cx: 50, cy: 50, hw: 50, hh: 50 }, { capacity: 4 });
    for (let i = 0; i < 4; i++) tree.insert({ x: 10 + i, y: 10, index: i });
    expect(tree.isDivided()).toBe(false);
  });

  it("subdivides when capacity exceeded", () => {
    const tree = new Quadtree({ cx: 50, cy: 50, hw: 50, hh: 50 }, { capacity: 4, maxDepth: 8 });
    for (let i = 0; i < 5; i++) tree.insert({ x: 10 + i, y: 10 + i, index: i });
    expect(tree.isDivided()).toBe(true);
  });

  it("respects max depth with coincident points", () => {
    const tree = new Quadtree(
      { cx: 50, cy: 50, hw: 50, hh: 50 },
      { capacity: 1, maxDepth: 3 },
    );
    for (let i = 0; i < 20; i++) tree.insert({ x: 50, y: 50, index: i });
    expect(tree.size()).toBe(20);
    const all = tree.query({ cx: 50, cy: 50, hw: 50, hh: 50 });
    expect(all.length).toBe(20);
  });

  it("rejects points outside bounds", () => {
    const tree = new Quadtree({ cx: 50, cy: 50, hw: 50, hh: 50 });
    expect(tree.insert({ x: 200, y: 200, index: 0 })).toBe(false);
    expect(tree.size()).toBe(0);
  });

  it("aabb intersects symmetric", () => {
    const a: AABB = { cx: 0, cy: 0, hw: 10, hh: 10 };
    const b: AABB = { cx: 15, cy: 0, hw: 10, hh: 10 };
    expect(intersects(a, b)).toBe(intersects(b, a));
    expect(intersects(a, b)).toBe(true);
  });
});
