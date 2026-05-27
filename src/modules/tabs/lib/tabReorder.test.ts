import { describe, expect, it } from "vitest";

import {
  reorderTargetIndex,
  resolveReorderIndices,
} from "./tabReorder";

describe("reorderTargetIndex", () => {
  it("inserts before a later tab", () => {
    expect(reorderTargetIndex(0, 2, true)).toBe(1);
  });

  it("inserts before an earlier tab", () => {
    expect(reorderTargetIndex(3, 1, true)).toBe(1);
  });

  it("inserts after a tab when dragging forward", () => {
    expect(reorderTargetIndex(0, 2, false)).toBe(2);
  });

  it("inserts after a tab when dragging backward", () => {
    expect(reorderTargetIndex(3, 1, false)).toBe(2);
  });
});

describe("resolveReorderIndices", () => {
  it("returns null when indices match", () => {
    expect(resolveReorderIndices(1, 1, true)).toBeNull();
  });

  it("returns from/to when the tab moves", () => {
    expect(resolveReorderIndices(0, 2, true)).toEqual({
      fromIndex: 0,
      toIndex: 1,
    });
  });
});
