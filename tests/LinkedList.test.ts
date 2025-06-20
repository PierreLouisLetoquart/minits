import { describe, test, expect } from "bun:test";
import { LinkedList } from "../src/LinkedList";
import { RangeError } from "../src/Errors";

describe("LinkedList - construction", () => {
  test("should create an empty list by default", () => {
    const list = new LinkedList<number>();
    expect(list.size).toBe(0);
    expect(list.getHead()).toBeNull();
  });

  test("should accept an initial value", () => {
    const list = new LinkedList("hello");
    expect(list.size).toBe(1);
    expect(list.getHead()).toBe("hello");
  });

  test("should create from array", () => {
    const list = LinkedList.fromArray([1, 2, 3]);
    expect(list.size).toBe(3);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });
});

describe("LinkedList - basic operations", () => {
  test("append and prepend", () => {
    const list = new LinkedList<number>();
    list.append(2);
    list.prepend(1);
    list.append(3);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  test("insert at index", () => {
    const list = LinkedList.fromArray([1, 3]);
    list.insert(1, 2);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  test("remove at index", () => {
    const list = LinkedList.fromArray([1, 2, 3]);
    const removed = list.remove(1);
    expect(removed).toBe(2);
    expect(list.toArray()).toEqual([1, 3]);
  });

  test("clear empties the list", () => {
    const list = LinkedList.fromArray([1, 2, 3]);
    list.clear();
    expect(list.size).toBe(0);
    expect(list.isEmpty()).toBe(true);
    expect(list.getHead()).toBeNull();
  });
});

describe("LinkedList - boundary checks", () => {
  test("get throws on invalid index", () => {
    const list = new LinkedList<number>();
    expect(() => list.get(0)).toThrow(RangeError);
  });

  test("insert throws on out-of-bounds index", () => {
    const list = new LinkedList<number>();
    expect(() => list.insert(1, 42)).toThrow(RangeError);
  });

  test("remove throws on invalid index", () => {
    const list = new LinkedList<number>();
    expect(() => list.remove(0)).toThrow(RangeError);
  });
});

describe("LinkedList - access and search", () => {
  test("get returns correct value", () => {
    const list = LinkedList.fromArray([10, 20, 30]);
    expect(list.get(0)).toBe(10);
    expect(list.get(2)).toBe(30);
  });

  test("includes and indexOf", () => {
    const list = LinkedList.fromArray(["a", "b", "c"]);
    expect(list.includes("b")).toBe(true);
    expect(list.indexOf("c")).toBe(2);
    expect(list.includes("x")).toBe(false);
  });

  test("find returns correct value", () => {
    const list = LinkedList.fromArray([10, 15, 20]);
    const found = list.find((v) => v > 10);
    expect(found).toBe(15);
  });

  test("find returns null when not found", () => {
    const list = new LinkedList<number>();
    const found = list.find(() => true);
    expect(found).toBeNull();
  });
});

describe("LinkedList - functional methods", () => {
  test("map produces new list with transformed values", () => {
    const list = LinkedList.fromArray([1, 2, 3]);
    const mapped = list.map((v) => v * 10);
    expect(mapped.toArray()).toEqual([10, 20, 30]);
  });

  test("filter returns only matching elements", () => {
    const list = LinkedList.fromArray([1, 2, 3, 4]);
    const filtered = list.filter((v) => v % 2 === 0);
    expect(filtered.toArray()).toEqual([2, 4]);
  });

  test("reduce accumulates values", () => {
    const list = LinkedList.fromArray([1, 2, 3]);
    const sum = list.reduce((acc, v) => acc + v, 0);
    expect(sum).toBe(6);
  });
});

describe("LinkedList - transformation", () => {
  test("reverse inverts the list", () => {
    const list = LinkedList.fromArray([1, 2, 3]);
    list.reverse();
    expect(list.toArray()).toEqual([3, 2, 1]);
  });

  test("clone produces a deep copy with mapper", () => {
    const list = LinkedList.fromArray([{ x: 1 }]);
    const cloned = list.clone((o) => ({ ...o }));
    expect(cloned.get(0)).toEqual({ x: 1 });
    expect(cloned.get(0)).not.toBe(list.get(0));
  });
});

describe("LinkedList - comparison and iteration", () => {
  test("equals compares two lists", () => {
    const a = LinkedList.fromArray([1, 2, 3]);
    const b = LinkedList.fromArray([1, 2, 3]);
    expect(a.equals(b)).toBe(true);
  });

  test("iterator yields correct values", () => {
    const list = LinkedList.fromArray([1, 2, 3]);
    const iterated = [...list];
    expect(iterated).toEqual([1, 2, 3]);
  });

  test("mutation during iteration throws", () => {
    const list = LinkedList.fromArray([1, 2, 3]);
    const iterator = list[Symbol.iterator]();
    list.append(4);
    expect(() => iterator.next()).toThrow();
  });
});

describe("LinkedList - utility methods", () => {
  test("toArrayReverse returns reversed array", () => {
    const list = LinkedList.fromArray([1, 2, 3]);
    expect(list.toArrayReverse()).toEqual([3, 2, 1]);
  });

  test("toString prints correctly", () => {
    const list = LinkedList.fromArray([1, 2, 3]);
    expect(list.toString()).toBe("1 -> 2 -> 3");
  });
});

describe("LinkedList - stress & edge cases", () => {
  test("stress test: append 1 million items", () => {
    const list = new LinkedList<number>();
    for (let i = 0; i < 1_000_000; i++) {
      list.append(i);
    }
    expect(list.size).toBe(1_000_000);
    expect(list.get(0)).toBe(0);
    expect(list.get(999999)).toBe(999999);
  });

  test("map stress test", () => {
    const list = LinkedList.fromArray(
      Array.from({ length: 5000 }, (_, i) => i),
    );
    const mapped = list.map((v) => v * 2);
    expect(mapped.size).toBe(5000);
    expect(mapped.get(4999)).toBe(9998);
  });

  test("equals with large identical lists", () => {
    const data = Array.from({ length: 1000 }, (_, i) => i);
    const a = LinkedList.fromArray(data);
    const b = LinkedList.fromArray(data);
    expect(a.equals(b)).toBe(true);
  });
});
