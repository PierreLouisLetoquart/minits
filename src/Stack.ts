/**
 * High-performance Stack implementation with object pooling and pre-allocated buffers
 * Optimized for minimal memory allocations and maximum throughput
 */
export class Stack<T> {
  private items: T[];
  private top: number;
  private capacity: number;
  private static readonly DEFAULT_CAPACITY = 16;
  private static readonly GROWTH_FACTOR = 2;

  /**
   * Creates a new Stack instance
   * @param initialCapacity - Initial buffer size (default: 16)
   * @param initialValues - Optional array of initial values
   */
  constructor(
    initialCapacity: number = Stack.DEFAULT_CAPACITY,
    initialValues?: T[],
  ) {
    this.capacity = Math.max(initialCapacity, initialValues?.length || 0);
    this.items = new Array(this.capacity);
    this.top = -1;

    if (initialValues) {
      for (let i = 0; i < initialValues.length; i++) {
        this.items[i] = initialValues[i]!;
      }
      this.top = initialValues.length - 1;
    }
  }

  /**
   * Returns the current number of items in the stack
   */
  get size(): number {
    return this.top + 1;
  }

  /**
   * Returns true if the stack is empty
   */
  get isEmpty(): boolean {
    return this.top === -1;
  }

  /**
   * Adds an item to the top of the stack
   * @param value - The item to add
   */
  push(value: T): void {
    if (this.top >= this.capacity - 1) {
      this.resize();
    }
    this.items[++this.top] = value;
  }

  /**
   * Removes and returns the top item from the stack
   * @returns The top item or undefined if stack is empty
   */
  pop(): T | undefined {
    if (this.top === -1) {
      return undefined;
    }

    const value = this.items[this.top];
    // Clear reference to prevent memory leaks
    this.items[this.top] = undefined as any;
    this.top--;

    return value;
  }

  /**
   * Returns the top item without removing it
   * @returns The top item or undefined if stack is empty
   */
  peek(): T | undefined {
    return this.top === -1 ? undefined : this.items[this.top];
  }

  /**
   * Clears all items from the stack
   */
  clear(): void {
    // Clear references to prevent memory leaks
    for (let i = 0; i <= this.top; i++) {
      this.items[i] = undefined as any;
    }
    this.top = -1;
  }

  /**
   * Resizes the internal buffer when capacity is exceeded
   * Uses exponential growth to amortize allocation costs
   */
  private resize(): void {
    const newCapacity = this.capacity * Stack.GROWTH_FACTOR;
    const newItems = new Array<T>(newCapacity);

    // Copy existing items
    for (let i = 0; i <= this.top; i++) {
      newItems[i] = this.items[i]!;
    }

    this.items = newItems;
    this.capacity = newCapacity;
  }
}

/**
 * Object Pool for Stack instances to minimize garbage collection
 * Reuses Stack instances to reduce allocation overhead
 */
export class StackPool<T> {
  private pool: Stack<T>[] = [];
  private readonly maxPoolSize: number;
  private readonly initialCapacity: number;

  /**
   * Creates a new StackPool
   * @param maxPoolSize - Maximum number of instances to pool (default: 10)
   * @param initialCapacity - Initial capacity for pooled stacks (default: 16)
   */
  constructor(maxPoolSize: number = 10, initialCapacity: number = 16) {
    this.maxPoolSize = maxPoolSize;
    this.initialCapacity = initialCapacity;
  }

  /**
   * Acquires a Stack instance from the pool or creates a new one
   * @returns A clean Stack instance ready for use
   */
  acquire(): Stack<T> {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return new Stack<T>(this.initialCapacity);
  }

  /**
   * Returns a Stack instance to the pool for reuse
   * @param stack - The Stack instance to return
   */
  release(stack: Stack<T>): void {
    if (this.pool.length < this.maxPoolSize) {
      stack.clear(); // Reset the stack
      this.pool.push(stack);
    }
    // If pool is full, let the stack be garbage collected
  }
}
