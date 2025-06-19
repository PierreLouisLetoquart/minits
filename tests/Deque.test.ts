import { describe, test, expect } from "bun:test";
import { Deque } from "../src/Deque";

describe("Deque – constructor", () => {
  test("empty by default", () => {
    const deque = new Deque<number>();
    expect(deque.size).toBe(0);
    expect(deque.isEmpty()).toBe(true);
    expect(deque.peekFront()).toBeNull();
    expect(deque.peekBack()).toBeNull();
  });
});

describe("Deque – addFront + pushBack + removeFront + removeBack", () => {
  test("FIFO and LIFO behavior", () => {
    const deque = new Deque<number>();

    deque.pushBack(1);
    deque.pushBack(2);
    deque.pushBack(3);
    expect(deque.size).toBe(3);

    expect(deque.popFront()).toBe(1);
    expect(deque.popFront()).toBe(2);
    expect(deque.popFront()).toBe(3);
    expect(deque.popFront()).toBeNull();
    expect(deque.size).toBe(0);

    deque.pushFront(1);
    deque.pushFront(2);
    deque.pushFront(3);
    expect(deque.size).toBe(3);

    expect(deque.popBack()).toBe(1);
    expect(deque.popBack()).toBe(2);
    expect(deque.popBack()).toBe(3);
    expect(deque.popBack()).toBeNull();
    expect(deque.size).toBe(0);
  });

  test("peekFront and peekBack do not remove elements", () => {
    const deque = new Deque<string>();
    deque.pushBack("a");
    deque.pushFront("b");
    expect(deque.peekFront()).toBe("b");
    expect(deque.peekBack()).toBe("a");
    expect(deque.size).toBe(2);
  });

  test("removing from empty deque returns null", () => {
    const deque = new Deque<number>();
    expect(deque.popFront()).toBeNull();
    expect(deque.popBack()).toBeNull();
  });

  test("clear empties the deque", () => {
    const deque = new Deque<number>();
    deque.pushBack(1);
    deque.pushFront(2);
    deque.clear();
    expect(deque.size).toBe(0);
    expect(deque.peekFront()).toBeNull();
    expect(deque.peekBack()).toBeNull();
    expect(deque.popFront()).toBeNull();
  });
});

describe("Deque – iterator", () => {
  test("yields values in order front to back", () => {
    const deque = new Deque<string>();
    deque.pushBack("a");
    deque.pushBack("b");
    deque.pushBack("c");

    const result = Array.from(deque);
    expect(result).toEqual(["a", "b", "c"]);
  });

  test("iterator fails if deque is modified during iteration", () => {
    const deque = new Deque<number>();
    deque.pushBack(1);
    deque.pushBack(2);

    const iterator = deque[Symbol.iterator]();
    expect(iterator.next().value).toBe(1);

    deque.pushBack(99); // triggers fail-fast
    expect(() => iterator.next()).toThrowError();
  });
});

describe("Deque – stress test", () => {
  test("add/remove 1 million items from back and front", () => {
    const deque = new Deque<number>();
    const n = 1_000_000;

    for (let i = 0; i < n; i++) {
      deque.pushBack(i);
    }
    expect(deque.size).toBe(n);

    let valid = true;
    for (let i = 0; i < n; i++) {
      if (deque.popFront() !== i) {
        valid = false;
        break;
      }
    }
    expect(valid).toBe(true);
    expect(deque.size).toBe(0);
    expect(deque.isEmpty()).toBe(true);

    // Now test front adds + back removes
    for (let i = 0; i < n; i++) {
      deque.pushFront(i);
    }
    expect(deque.size).toBe(n);

    valid = true;
    for (let i = 0; i < n; i++) {
      if (deque.popBack() !== i) {
        valid = false;
        break;
      }
    }
    expect(valid).toBe(true);
    expect(deque.size).toBe(0);
    expect(deque.isEmpty()).toBe(true);
  }, 15000); // allow 15s
});

describe("Deque - advanced methods", () => {
  test("should clone the deque (shallow copy)", () => {
    const d = Deque.fromArray([1, 2, 3]);
    const clone = d.clone();

    expect(clone.toArray()).toEqual([1, 2, 3]);
    expect(clone).not.toBe(d); // different instance
    clone.popFront();
    expect(clone.toArray()).toEqual([2, 3]);
    expect(d.toArray()).toEqual([1, 2, 3]); // original untouched
  });

  test("should clone with mapper", () => {
    const d = Deque.fromArray(["a", "b", "c"]);
    const clone = d.clone((v) => v.toUpperCase());

    expect(clone.toArray()).toEqual(["A", "B", "C"]);
    expect(d.toArray()).toEqual(["a", "b", "c"]);
  });

  test("should filter correctly", () => {
    const d = Deque.fromArray([10, 15, 20, 25]);
    const filtered = d.filter((v) => v % 20 !== 0);
    expect(filtered.toArray()).toEqual([10, 15, 25]);
  });

  test("should map each value in the deque", () => {
    const d = Deque.fromArray([1, 2, 3]);
    const doubled = d.map((val) => val * 2);
    expect(doubled.toArray()).toEqual([2, 4, 6]);
    expect(d.toArray()).toEqual([1, 2, 3]); // original unchanged
  });

  test("should find matching element", () => {
    const d = Deque.fromArray(["foo", "bar", "baz"]);
    expect(d.find((val) => val.startsWith("ba"))).toBe("bar");
    expect(d.find((val) => val === "qux")).toBeNull();
  });

  test("should build from array with mapper", () => {
    const d = Deque.fromArray([1, 2, 3], (v) => v * 2);
    expect(d.toArray()).toEqual([2, 4, 6]);
  });
});

describe("Deque – toArray", () => {
  test("converts deque to array", () => {
    const deque = new Deque<number>();
    [1, 2, 3].forEach((n) => deque.pushBack(n));
    expect(deque.toArray()).toEqual([1, 2, 3]);
  });
});

describe("Deque - isDeque", () => {
  test("should correctly identify a Deque instance", () => {
    const d = new Deque();
    expect(Deque.isDeque(d)).toBe(true);
    expect(Deque.isDeque({})).toBe(false);
    expect(Deque.isDeque(null)).toBe(false);
    expect(Deque.isDeque(undefined)).toBe(false);
  });
});
