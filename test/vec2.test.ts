import { describe, expect, it } from "vitest";
import {
  add,
  dot,
  len,
  normalize,
  scale,
  sub,
  vec2,
} from "../src/core/vec2.js";

describe("vec2", () => {
  it("add and sub are inverse", () => {
    const a = vec2(3, -2);
    const b = vec2(7, 5);
    expect(sub(add(a, b), b)).toEqual(a);
  });

  it("scale distributes over add", () => {
    const a = vec2(1, 2);
    const b = vec2(3, 4);
    const s = 2.5;
    const left = scale(add(a, b), s);
    const right = add(scale(a, s), scale(b, s));
    expect(left.x).toBeCloseTo(right.x);
    expect(left.y).toBeCloseTo(right.y);
  });

  it("dot is commutative", () => {
    const a = vec2(2, 3);
    const b = vec2(-1, 4);
    expect(dot(a, b)).toBe(dot(b, a));
  });

  it("normalize yields unit length", () => {
    const n = normalize(vec2(3, 4));
    expect(len(n)).toBeCloseTo(1);
    expect(n.x).toBeCloseTo(0.6);
    expect(n.y).toBeCloseTo(0.8);
  });

  it("normalize of zero is zero", () => {
    expect(normalize(vec2(0, 0))).toEqual(vec2(0, 0));
  });

  it("len matches pythagoras", () => {
    expect(len(vec2(5, 12))).toBeCloseTo(13);
  });
});
