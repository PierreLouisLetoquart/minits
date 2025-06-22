import { describe, it, expect, beforeEach } from "bun:test";
import { Stack, StackPool } from "../src/Stack";

describe("Stack", () => {
  let stack: Stack<number>;

  beforeEach(() => {
    stack = new Stack<number>();
  });

  describe("Constructor", () => {
    it("should create empty stack with default capacity", () => {
      expect(stack.size).toBe(0);
      expect(stack.isEmpty).toBe(true);
    });

    it("should create stack with initial values", () => {
      const initialValues = [1, 2, 3];
      const stackWithValues = new Stack(16, initialValues);

      expect(stackWithValues.size).toBe(3);
      expect(stackWithValues.peek()).toBe(3);
      expect(stackWithValues.isEmpty).toBe(false);
    });

    it("should handle custom initial capacity", () => {
      const customStack = new Stack<string>(32);
      expect(customStack.size).toBe(0);
      expect(customStack.isEmpty).toBe(true);
    });
  });

  describe("Basic Operations", () => {
    it("should push single item", () => {
      stack.push(42);
      expect(stack.size).toBe(1);
      expect(stack.peek()).toBe(42);
      expect(stack.isEmpty).toBe(false);
    });

    it("should push multiple items in order", () => {
      const values = [1, 2, 3, 4, 5];
      values.forEach((val) => stack.push(val));

      expect(stack.size).toBe(5);
      expect(stack.peek()).toBe(5);
    });

    it("should pop items in LIFO order", () => {
      const values = [1, 2, 3];
      values.forEach((val) => stack.push(val));

      expect(stack.pop()).toBe(3);
      expect(stack.pop()).toBe(2);
      expect(stack.pop()).toBe(1);
      expect(stack.size).toBe(0);
    });

    it("should handle pop on empty stack", () => {
      expect(stack.pop()).toBeUndefined();
      expect(stack.size).toBe(0);
    });

    it("should peek without removing item", () => {
      stack.push(100);
      expect(stack.peek()).toBe(100);
      expect(stack.size).toBe(1);
      expect(stack.peek()).toBe(100); // Should still be there
    });

    it("should handle peek on empty stack", () => {
      expect(stack.peek()).toBeUndefined();
    });
  });

  describe("Clear Operation", () => {
    it("should clear all items", () => {
      [1, 2, 3, 4, 5].forEach((val) => stack.push(val));
      stack.clear();

      expect(stack.size).toBe(0);
      expect(stack.isEmpty).toBe(true);
      expect(stack.peek()).toBeUndefined();
      expect(stack.pop()).toBeUndefined();
    });

    it("should handle clear on empty stack", () => {
      stack.clear();
      expect(stack.size).toBe(0);
      expect(stack.isEmpty).toBe(true);
    });
  });

  describe("Type Safety", () => {
    it("should work with different types", () => {
      const stringStack = new Stack<string>();
      stringStack.push("hello");
      stringStack.push("world");

      expect(stringStack.pop()).toBe("world");
      expect(stringStack.peek()).toBe("hello");
    });

    it("should work with complex objects", () => {
      interface User {
        id: number;
        name: string;
      }

      const userStack = new Stack<User>();
      const user1 = { id: 1, name: "Alice" };
      const user2 = { id: 2, name: "Bob" };

      userStack.push(user1);
      userStack.push(user2);

      expect(userStack.pop()).toEqual(user2);
      expect(userStack.peek()).toEqual(user1);
    });
  });

  describe("Memory Management", () => {
    it("should handle capacity growth", () => {
      const smallStack = new Stack<number>(2);

      // Fill beyond initial capacity
      for (let i = 0; i < 10; i++) {
        smallStack.push(i);
      }

      expect(smallStack.size).toBe(10);
      expect(smallStack.peek()).toBe(9);

      // Verify LIFO order still works
      for (let i = 9; i >= 0; i--) {
        expect(smallStack.pop()).toBe(i);
      }
    });

    it("should prevent memory leaks after pop", () => {
      const objectStack = new Stack<{ data: string }>();
      const obj = { data: "test" };

      objectStack.push(obj);
      const popped = objectStack.pop();

      expect(popped).toEqual(obj);
      expect(objectStack.size).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle alternating push/pop operations", () => {
      stack.push(1);
      expect(stack.pop()).toBe(1);

      stack.push(2);
      stack.push(3);
      expect(stack.pop()).toBe(3);

      stack.push(4);
      expect(stack.size).toBe(2);
      expect(stack.peek()).toBe(4);
    });

    it("should handle null and undefined values", () => {
      const nullableStack = new Stack<number | null | undefined>();

      nullableStack.push(null);
      nullableStack.push(undefined);
      nullableStack.push(0);

      expect(nullableStack.pop()).toBe(0);
      expect(nullableStack.pop()).toBeUndefined();
      expect(nullableStack.pop()).toBeNull();
    });
  });

  describe("Performance & Stress Tests", () => {
    it("should handle large datasets efficiently", () => {
      const start = performance.now();
      const largeStack = new Stack<number>();

      // Push 100k items
      for (let i = 0; i < 1_000_000; i++) {
        largeStack.push(i);
      }

      expect(largeStack.size).toBe(1_000_000);

      // Pop all items
      for (let i = 999999; i >= 0; i--) {
        expect(largeStack.pop()).toBe(i);
      }

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(200); // Should complete in <200ms
      expect(largeStack.isEmpty).toBe(true);
    });

    it("should maintain performance with frequent operations", () => {
      const iterations = 1_000_000;
      const start = performance.now();

      // Simulate realistic usage pattern
      for (let i = 0; i < iterations; i++) {
        stack.push(i);
        if (i % 3 === 0) stack.pop(); // Pop every 3rd item
        if (i % 7 === 0) stack.peek(); // Peek occasionally
      }

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(200);
      expect(stack.size).toBeGreaterThan(0);
    });

    it("should handle rapid growth and shrinkage", () => {
      // Grow rapidly
      for (let i = 0; i < 1_000_000; i++) {
        stack.push(i);
      }

      expect(stack.size).toBe(1_000_000);

      // Shrink rapidly
      for (let i = 0; i < 1_000_000; i++) {
        stack.pop();
      }

      expect(stack.isEmpty).toBe(true);

      // Grow again to test reusability
      for (let i = 0; i < 500; i++) {
        stack.push(i * 2);
      }

      expect(stack.size).toBe(500);
      expect(stack.peek()).toBe(998);
    });
  });

  describe("Real-world Scenarios", () => {
    it("should work as undo/redo system", () => {
      interface Action {
        type: string;
        data: any;
      }

      const undoStack = new Stack<Action>();

      // Simulate user actions
      undoStack.push({ type: "CREATE", data: { id: 1 } });
      undoStack.push({ type: "EDIT", data: { id: 1, field: "name" } });
      undoStack.push({ type: "DELETE", data: { id: 1 } });

      // Undo operations
      const lastAction = undoStack.pop();
      expect(lastAction?.type).toBe("DELETE");

      const secondLastAction = undoStack.peek();
      expect(secondLastAction?.type).toBe("EDIT");
    });

    it("should work for expression evaluation (Shunting Yard)", () => {
      const operatorStack = new Stack<string>();
      const outputQueue: number[] = [];

      // Parse infix: 2 + 3 * 4 = 14 (not 20)
      // Token by token processing

      outputQueue.push(2);
      operatorStack.push("+");
      outputQueue.push(3);
      operatorStack.push("*");
      outputQueue.push(4);

      // End of expression - pop remaining operators
      // "*" has higher precedence, gets processed first
      expect(operatorStack.pop()).toBe("*");
      expect(operatorStack.pop()).toBe("+");
      expect(operatorStack.isEmpty).toBe(true);

      // Verify output queue has operands in correct order
      expect(outputQueue).toEqual([2, 3, 4]);
    });

    it("should work for function call tracking", () => {
      interface CallFrame {
        function: string;
        args: any[];
        timestamp: number;
      }

      const callStack = new Stack<CallFrame>();

      // Simulate nested function calls
      callStack.push({
        function: "main",
        args: [],
        timestamp: Date.now(),
      });

      callStack.push({
        function: "processData",
        args: [{ id: 1 }],
        timestamp: Date.now(),
      });

      callStack.push({
        function: "validateInput",
        args: [{ id: 1 }],
        timestamp: Date.now(),
      });

      // Function returns (LIFO order)
      expect(callStack.pop()?.function).toBe("validateInput");
      expect(callStack.pop()?.function).toBe("processData");
      expect(callStack.peek()?.function).toBe("main");
    });
  });
});

describe("StackPool", () => {
  let pool: StackPool<number>;

  beforeEach(() => {
    pool = new StackPool<number>(5, 8);
  });

  describe("Basic Pool Operations", () => {
    it("should acquire new stack when pool is empty", () => {
      const stack = pool.acquire();
      expect(stack).toBeInstanceOf(Stack);
      expect(stack.size).toBe(0);
      expect(stack.isEmpty).toBe(true);
    });

    it("should reuse released stacks", () => {
      const stack1 = pool.acquire();
      stack1.push(42);
      pool.release(stack1);

      const stack2 = pool.acquire();
      expect(stack2.size).toBe(0); // Should be cleared
      expect(stack2.isEmpty).toBe(true);
    });

    it("should respect max pool size", () => {
      const stacks: Stack<number>[] = [];

      // Acquire more stacks than pool size
      for (let i = 0; i < 10; i++) {
        stacks.push(pool.acquire());
      }

      // Release all stacks
      stacks.forEach((stack) => {
        stack.push(Math.random());
        pool.release(stack);
      });

      // Pool should only hold maxPoolSize stacks
      // Acquiring 6 stacks should create 1 new stack
      const acquiredStacks: Stack<number>[] = [];
      for (let i = 0; i < 6; i++) {
        acquiredStacks.push(pool.acquire());
      }

      expect(acquiredStacks).toHaveLength(6);
      acquiredStacks.forEach((stack) => {
        expect(stack.isEmpty).toBe(true);
      });
    });
  });

  describe("Pool Performance", () => {
    it("should reduce allocation overhead", () => {
      const iterations = 1_000_000;
      const start = performance.now();

      // Simulate high-frequency acquire/release pattern
      for (let i = 0; i < iterations; i++) {
        const stack = pool.acquire();
        stack.push(i);
        stack.push(i * 2);
        stack.pop();
        pool.release(stack);
      }

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(50); // Should be very fast (even on bad machines)
    });

    it("should handle concurrent-like usage", () => {
      const stacks: Stack<number>[] = [];

      // Acquire multiple stacks
      for (let i = 0; i < 5; i++) {
        const stack = pool.acquire();
        stack.push(i);
        stacks.push(stack);
      }

      // Use stacks independently
      stacks.forEach((stack, index) => {
        expect(stack.peek()).toBe(index);
        stack.push(index * 10);
      });

      // Release all stacks
      stacks.forEach((stack) => pool.release(stack));

      // Acquire again and verify they're clean
      for (let i = 0; i < 5; i++) {
        const stack = pool.acquire();
        expect(stack.isEmpty).toBe(true);
        pool.release(stack);
      }
    });
  });
});
