import { describe, test, expect } from "bun:test";
import { LinkedList } from "../src/LinkedList";
import { RangeError } from "../src/Errors";

describe("LinkedList – constructor", () => {
  test("empty by default", () => {
    const list = new LinkedList<number>();
    expect(list.size).toBe(0);
    expect(list.getHead()).toBeNull();
  });

  test("initial value sets head and size", () => {
    const list = new LinkedList("hello");
    expect(list.size).toBe(1);
    expect(list.getHead()).toBe("hello");
  });
});

describe("LinkedList - includes", () => {
  test("returns true when value exists in the list", () => {
    const list = LinkedList.fromArray([1, 2, 3]);
    expect(list.includes(2)).toBe(true);
    expect(list.includes(3)).toBe(true);
  });

  test("returns false when value is not in the list", () => {
    const list = LinkedList.fromArray([4, 5, 6]);
    expect(list.includes(0)).toBe(false);
    expect(list.includes(7)).toBe(false);
  });

  test("returns false for empty list", () => {
    const list = new LinkedList<number>();
    expect(list.includes(1)).toBe(false);
  });
});

describe("LinkedList - indexOf", () => {
  test("returns correct index of a value", () => {
    const list = LinkedList.fromArray(["a", "b", "c"]);
    expect(list.indexOf("a")).toBe(0);
    expect(list.indexOf("c")).toBe(2);
  });

  test("returns -1 when value is not found", () => {
    const list = LinkedList.fromArray(["x", "y", "z"]);
    expect(list.indexOf("w")).toBe(-1);
  });

  test("returns -1 for empty list", () => {
    const list = new LinkedList<string>();
    expect(list.indexOf("anything")).toBe(-1);
  });
});

describe("LinkedList – append", () => {
  test("append to empty list", () => {
    const list = new LinkedList<number>();
    list.append(10);
    expect(list.size).toBe(1);
    expect(list.getHead()).toBe(10);
  });

  test("append multiple values", () => {
    const list = new LinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    expect(list.size).toBe(3);
    expect(list.getHead()).toBe(1);
  });
});

describe("LinkedList – prepend", () => {
  test("prepend to empty list", () => {
    const list = new LinkedList<number>();
    list.prepend(10);
    expect(list.size).toBe(1);
    expect(list.getHead()).toBe(10);
  });

  test("prepend multiple values", () => {
    const list = new LinkedList<number>();
    list.prepend(1);
    list.prepend(2);
    list.prepend(3);
    expect(list.size).toBe(3);
    expect(list.getHead()).toBe(3);
  });
});

describe("LinkedList – get", () => {
  test("get element at specific index", () => {
    const list = new LinkedList<number>();
    list.append(10);
    list.append(20);
    list.append(30);

    expect(list.get(0)).toBe(10);
    expect(list.get(1)).toBe(20);
    expect(list.get(2)).toBe(30);
  });

  test("throws on out-of-bounds index", () => {
    const list = new LinkedList<number>();
    expect(() => list.get(0)).toThrow(RangeError);
    list.append(1);
    expect(() => list.get(1)).toThrow(RangeError);
  });
});

describe("LinkedList – insert", () => {
  test("insert at the beginning (index 0)", () => {
    const list = new LinkedList<number>();
    list.append(2);
    list.insert(0, 1);

    expect(list.get(0)).toBe(1);
    expect(list.get(1)).toBe(2);
    expect(list.size).toBe(2);
  });

  test("insert at the end (index === size)", () => {
    const list = new LinkedList<number>();
    list.append(1);
    list.append(2);
    list.insert(2, 3);

    expect(list.get(2)).toBe(3);
    expect(list.size).toBe(3);
  });

  test("insert in the middle", () => {
    const list = new LinkedList<number>();
    list.append(1);
    list.append(3);
    list.insert(1, 2);

    expect(list.get(0)).toBe(1);
    expect(list.get(1)).toBe(2);
    expect(list.get(2)).toBe(3);
    expect(list.size).toBe(3);
  });

  test("throws on negative index", () => {
    const list = new LinkedList<number>();
    expect(() => list.insert(-1, 69)).toThrow(RangeError);
  });

  test("throws when index is greater than size", () => {
    const list = new LinkedList<number>();
    list.append(1);
    expect(() => list.insert(2, 69)).toThrow(RangeError);
  });

  // we use a ts-expect-error because tests run after compilation
  test("rejects insert with wrong value type", () => {
    const list = new LinkedList<number>();

    // @ts-expect-error - Type 'string' is not assignable to type 'number'
    list.insert(0, "wrong-type");
  });
});

describe("LinkedList – remove", () => {
  test("remove at the beginning (index 0)", () => {
    const list = new LinkedList<number>();
    list.append(6);
    list.append(9);
    const removed = list.remove(0);

    expect(removed).toBe(6);
    expect(list.get(0)).toBe(9);
    expect(list.getHead()).toBe(9);
    expect(list.getTail()).toBe(9);
    expect(list.size).toBe(1);
  });

  test("remove at the last index (index === size - 1)", () => {
    const list = new LinkedList<number>();
    list.append(4);
    list.append(2);
    list.append(0);
    const removed = list.remove(2);

    expect(removed).toBe(0);
    expect(list.get(0)).toBe(4);
    expect(list.get(1)).toBe(2);
    expect(list.getTail()).toBe(2);
    expect(list.size).toBe(2);
  });

  test("remove in the middle", () => {
    const list = new LinkedList<number>();
    list.append(6);
    list.append(99);
    list.append(9);
    const removed = list.remove(1);

    expect(removed).toBe(99);
    expect(list.get(0)).toBe(6);
    expect(list.get(1)).toBe(9);
    expect(list.getHead()).toBe(6);
    expect(list.getTail()).toBe(9);
    expect(list.size).toBe(2);
  });

  test("throws on negative index", () => {
    const list = new LinkedList<number>();
    expect(() => list.remove(-1)).toThrow(RangeError);
  });

  test("throws when index is greater than size", () => {
    const list = new LinkedList<number>();
    list.append(1);
    expect(() => list.remove(2)).toThrow(RangeError);
  });

  test("throws when index === size", () => {
    const list = new LinkedList<number>();
    list.append(1);
    list.append(2);
    expect(() => list.remove(2)).toThrow(RangeError);
  });

  test("throws when removing from empty list", () => {
    const list = new LinkedList<number>();
    expect(() => list.remove(0)).toThrow(RangeError);
  });
});

describe("LinkedList - find(predicate => bool)", () => {
  test("find executes the predicate properly and returns the first match", () => {
    const list = new LinkedList<number>();
    list.append(10);
    list.append(28);
    list.append(389); // prime
    list.append(391); // not prime

    function isPrime(n: number): boolean {
      if (n <= 1) return false;
      if (n <= 3) return true;
      if (n % 2 === 0 || n % 3 === 0) return false;
      for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) return false;
      }
      return true;
    }

    const result = list.find((value) => isPrime(value));
    expect(result).toBe(389);
  });

  test("returns null if no match", () => {
    const list = new LinkedList<number>();
    list.append(4);
    list.append(6);
    list.append(8);

    const result = list.find((value) => value > 100);
    expect(result).toBeNull();
  });

  test("returns null if list is empty", () => {
    const list = new LinkedList<number>();
    const result = list.find(() => true);
    expect(result).toBeNull();
  });

  test("predicate receives correct index", () => {
    const list = new LinkedList<number>();
    list.append(3);
    list.append(5);
    list.append(7);

    const calledIndexes: number[] = [];

    list.find((_, index) => {
      calledIndexes.push(index);
      return false;
    });

    expect(calledIndexes).toEqual([0, 1, 2]);
  });
});

describe("LinkedList - utils", () => {
  test("toArray converts list to array", () => {
    const list = new LinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);

    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  test("toString returns correct string representation", () => {
    const list = new LinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);

    expect(list.toString()).toBe("1 -> 2 -> 3");
  });

  test("toString returns empty string for empty list", () => {
    const list = new LinkedList<number>();
    expect(list.toString()).toBe("");
  });

  test("linked list is iterable", () => {
    const list = new LinkedList<number>();
    list.append(10);
    list.append(20);

    const result: number[] = [];
    for (const val of list) {
      result.push(val);
    }

    expect(result).toEqual([10, 20]);
    expect(result.length).toBe(list.size);
  });

  test("clear() empties the list", () => {
    const list = LinkedList.fromArray([1, 2, 3]);
    expect(list.size).toBe(3);
    expect(list.isEmpty()).toBe(false);

    list.clear();

    expect(list.size).toBe(0);
    expect(list.isEmpty()).toBe(true);
    expect(list.getHead()).toBeNull();
    expect(list.getTail()).toBeNull();
    expect(list.toArray()).toEqual([]);
  });

  test("isEmpty() on new list", () => {
    const list = new LinkedList<number>();
    expect(list.isEmpty()).toBe(true);
  });

  test("isEmpty() after append and remove", () => {
    const list = new LinkedList<number>();
    list.append(42);
    expect(list.isEmpty()).toBe(false);

    list.remove(0);
    expect(list.isEmpty()).toBe(true);
  });
});

describe("LinkedList - map", () => {
  test("maps values correctly", () => {
    const list = new LinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);

    const mapped = list.map((v, i) => v * 10 + i);

    expect(mapped.size).toBe(3);
    expect(mapped.get(0)).toBe(10); // 1*10 + 0
    expect(mapped.get(1)).toBe(21); // 2*10 + 1
    expect(mapped.get(2)).toBe(32); // 3*10 + 2

    // Original list unchanged
    expect(list.get(0)).toBe(1);
  });

  test("map on empty list returns empty list", () => {
    const list = new LinkedList<number>();
    const mapped = list.map((v) => v * 2);
    expect(mapped.size).toBe(0);
  });
});

describe("LinkedList - filter", () => {
  test("filters values correctly", () => {
    const list = new LinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);
    list.append(4);

    const filtered = list.filter((v) => v % 2 === 0);

    expect(filtered.size).toBe(2);
    expect(filtered.get(0)).toBe(2);
    expect(filtered.get(1)).toBe(4);

    // Original list unchanged
    expect(list.size).toBe(4);
  });

  test("filter on empty list returns empty list", () => {
    const list = new LinkedList<number>();
    const filtered = list.filter(() => true);
    expect(filtered.size).toBe(0);
  });
});

describe("LinkedList - reduce", () => {
  test("reduces values correctly", () => {
    const list = new LinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);

    const sum = list.reduce((acc, v) => acc + v, 0);
    expect(sum).toBe(6);

    const product = list.reduce((acc, v) => acc * v, 1);
    expect(product).toBe(6);
  });

  test("reduce on empty list returns initial value", () => {
    const list = new LinkedList<number>();
    const res = list.reduce((acc, v) => acc + v, 100);
    expect(res).toBe(100);
  });
});

describe("LinkedList - reverse", () => {
  test("reverses the list correctly", () => {
    const list = new LinkedList<number>();
    list.append(1);
    list.append(2);
    list.append(3);

    list.reverse();

    expect(list.get(0)).toBe(3);
    expect(list.get(1)).toBe(2);
    expect(list.get(2)).toBe(1);
    expect(list.size).toBe(3);
    expect(list.getHead()).toBe(3);
    expect(list.getTail()).toBe(1);
  });

  test("reverse on empty list does nothing", () => {
    const list = new LinkedList<number>();
    list.reverse();
    expect(list.size).toBe(0);
    expect(list.getHead()).toBeNull();
  });

  test("reverse on single-element list does nothing", () => {
    const list = new LinkedList<number>();
    list.append(42);
    list.reverse();
    expect(list.size).toBe(1);
    expect(list.getHead()).toBe(42);
  });
});

describe("LinkedList - clone", () => {
  test("should return an empty list if the original is empty", () => {
    const list = new LinkedList<number>();
    const cloned = list.clone();

    expect(cloned).not.toBe(list);
    expect(cloned.size).toBe(0);
    expect(cloned.toArray()).toEqual([]);
  });

  test("should clone a list with primitive values (shallow copy)", () => {
    const list = LinkedList.fromArray([1, 2, 3]);
    const cloned = list.clone();

    expect(cloned).not.toBe(list);
    expect(cloned.toArray()).toEqual([1, 2, 3]);
  });

  test("should clone a list with objects (shallow by default)", () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const list = LinkedList.fromArray([obj1, obj2]);
    const cloned = list.clone();

    expect(cloned.toArray()).toEqual([obj1, obj2]);
    expect(cloned.get(0)).toBe(obj1); // reference equality
  });

  test("should deeply clone a list when using a mapper", () => {
    const obj1 = { id: 1 };
    const list = LinkedList.fromArray([obj1]);
    const cloned = list.clone((item) => ({ ...item }));

    expect(cloned.get(0)).not.toBe(obj1);
    expect(cloned.get(0)).toEqual(obj1);
  });

  test("should not affect original list when modifying clone", () => {
    const list = LinkedList.fromArray([1, 2, 3]);
    const cloned = list.clone();

    cloned.append(4);
    expect(list.size).toBe(3);
    expect(cloned.size).toBe(4);
  });
});

describe("LinkedList.equals", () => {
  test("should return true for two empty lists", () => {
    const a = new LinkedList();
    const b = new LinkedList();
    expect(a.equals(b)).toBe(true);
  });

  test("should return true for two identical lists with primitive values", () => {
    const a = LinkedList.fromArray([1, 2, 3]);
    const b = LinkedList.fromArray([1, 2, 3]);
    expect(a.equals(b)).toBe(true);
  });

  test("should return false for lists with different lengths", () => {
    const a = LinkedList.fromArray([1, 2]);
    const b = LinkedList.fromArray([1, 2, 3]);
    expect(a.equals(b)).toBe(false);
  });

  test("should return false for lists with same length but different content", () => {
    const a = LinkedList.fromArray([1, 2, 3]);
    const b = LinkedList.fromArray([1, 2, 99]);
    expect(a.equals(b)).toBe(false);
  });

  test("should return true if both lists reference same object instances", () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };

    const a = LinkedList.fromArray([obj1, obj2]);
    const b = LinkedList.fromArray([obj1, obj2]);

    expect(a.equals(b)).toBe(true);
  });

  test("should return false if objects in the lists are equal in value but not by reference", () => {
    const a = LinkedList.fromArray([{ id: 1 }]);
    const b = LinkedList.fromArray([{ id: 1 }]);

    expect(a.equals(b)).toBe(false); // because !==
  });
});

describe("LinkedList - fromArray", () => {
  test("creates a LinkedList from an array of numbers", () => {
    const arr = [1, 2, 3, 4];
    const list = LinkedList.fromArray(arr);

    expect(list.size).toBe(arr.length);
    for (let i = 0; i < arr.length; i++) {
      expect(list.get(i)).toBe(arr[i]!);
    }
  });

  test("creates an empty LinkedList from an empty array", () => {
    const arr: number[] = [];
    const list = LinkedList.fromArray(arr);

    expect(list.size).toBe(0);
    expect(list.getHead()).toBeNull();
  });
});
