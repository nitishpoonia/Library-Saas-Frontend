import { keepWithinBranch, keys } from "../keys";

describe("keepWithinBranch", () => {
  const previous = { pages: [{ items: ["a"] }] };

  it("keeps the previous results when the filter changes in the same branch", () => {
    const placeholder = keepWithinBranch(1);
    expect(placeholder(previous, { queryKey: keys.students(1, { status: "overdue", search: "" }) })).toBe(previous);
  });

  it("never shows another branch's results while switching branch", () => {
    const placeholder = keepWithinBranch(2);
    expect(placeholder(previous, { queryKey: keys.students(1, { status: "current", search: "" }) })).toBeUndefined();
  });

  it("has nothing to keep on the first load", () => {
    expect(keepWithinBranch(1)(undefined, undefined)).toBeUndefined();
  });
});
