import { describe, test, expect } from "bun:test";
import { Queue } from "../src/Queue";

describe("Queue – constructor", () => {
  test("empty by default", () => {
    const queue = new Queue<number>();
    expect(queue.size).toBe(0);
    expect(queue.isEmpty()).toBe(true);
    expect(queue.peek()).toBeNull();
  });
});

describe("Queue – enqueue + dequeue", () => {
  test("FIFO behavior", () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);

    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    expect(queue.dequeue()).toBe(3);
    expect(queue.dequeue()).toBeNull();
    expect(queue.size).toBe(0);
  });

  test("peek does not remove element", () => {
    const queue = new Queue<string>();
    queue.enqueue("a");
    expect(queue.peek()).toBe("a");
    expect(queue.size).toBe(1);
  });

  test("dequeue from empty queue returns null", () => {
    const queue = new Queue<number>();
    expect(queue.dequeue()).toBeNull();
  });

  test("clear empties the queue", () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.clear();
    expect(queue.size).toBe(0);
    expect(queue.peek()).toBeNull();
    expect(queue.dequeue()).toBeNull();
  });
});

describe("Queue – iterator", () => {
  test("yields values in order", () => {
    const queue = new Queue<string>();
    queue.enqueue("a");
    queue.enqueue("b");
    queue.enqueue("c");

    const result = Array.from(queue);
    expect(result).toEqual(["a", "b", "c"]);
  });

  test("iterator fails if queue is modified during iteration", () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);

    const iterator = queue[Symbol.iterator]();
    expect(iterator.next().value).toBe(1);

    queue.enqueue(99); // triggers fail-fast
    expect(() => iterator.next()).toThrowError();
  });
});

describe("Queue – stress test", () => {
  test("enqueue/dequeue 1 million items", () => {
    const queue = new Queue<number>();
    const n = 1_000_000;

    for (let i = 0; i < n; i++) {
      queue.enqueue(i);
    }
    expect(queue.size).toBe(n);

    let valid = true;
    for (let i = 0; i < n; i++) {
      if (queue.dequeue() !== i) {
        valid = false;
        break;
      }
    }
    expect(valid).toBe(true);
    expect(queue.size).toBe(0);
    expect(queue.isEmpty()).toBe(true);
  }, 10000); // allow 10s
});

describe("Queue - advanced methods", () => {
  test("should clone the queue (shallow copy)", () => {
    const q = Queue.fromArray([1, 2, 3]);
    const clone = q.clone();

    expect(clone.toArray()).toEqual([1, 2, 3]);
    expect(clone).not.toBe(q); // different instance
    clone.dequeue();
    expect(clone.toArray()).toEqual([2, 3]);
    expect(q.toArray()).toEqual([1, 2, 3]); // original untouched
  });

  test("should clone with mapper", () => {
    const q = Queue.fromArray(["a", "b", "c"]);
    const clone = q.clone((v) => v.toUpperCase());

    expect(clone.toArray()).toEqual(["A", "B", "C"]);
    expect(q.toArray()).toEqual(["a", "b", "c"]);
  });

  test("should filter correctly", () => {
    const q = Queue.fromArray([10, 15, 20, 25]);
    const filtered = q.filter((v) => v % 20 !== 0);
    expect(filtered.toArray()).toEqual([10, 15, 25]);
  });

  test("should map each value in the queue", () => {
    const q = Queue.fromArray([1, 2, 3]);
    const doubled = q.map((val) => val * 2);
    expect(doubled.toArray()).toEqual([2, 4, 6]);
    expect(q.toArray()).toEqual([1, 2, 3]); // original unchanged
  });

  test("should find matching element", () => {
    const q = Queue.fromArray(["foo", "bar", "baz"]);
    expect(q.find((val) => val.startsWith("ba"))).toBe("bar");
    expect(q.find((val) => val === "qux")).toBeNull();
  });

  test("should build from array with mapper", () => {
    const q = Queue.fromArray([1, 2, 3], (v) => v * 2);
    expect(q.toArray()).toEqual([2, 4, 6]);
  });
});

describe("Queue – toArray", () => {
  test("converts queue to array", () => {
    const queue = new Queue<number>();
    [1, 2, 3].forEach((n) => queue.enqueue(n));
    expect(queue.toArray()).toEqual([1, 2, 3]);
  });
});

describe("Queue - isQueue", () => {
  test("should correctly identify a Queue instance", () => {
    const q = new Queue();
    expect(Queue.isQueue(q)).toBe(true);
    expect(Queue.isQueue({})).toBe(false);
    expect(Queue.isQueue(null)).toBe(false);
    expect(Queue.isQueue(undefined)).toBe(false);
  });
});
