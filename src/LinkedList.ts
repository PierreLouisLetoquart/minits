import { RangeError } from "./Errors";

/**
 * @internal
 * Internal node class for the LinkedList implementation.
 */
class Node<T> {
  value: T;
  next: Node<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

/**
 * A generic singly linked list implementation with optimized performance features.
 *
 * Features:
 * - Object pooling for reduced garbage collection pressure
 * - Stack operations (pushFront, popFront, peekFront) optimized for O(1) performance
 * - Iteration safety with modification detection
 * - Functional programming methods (map, filter, reduce)
 * - Batch operations for improved efficiency
 */
export class LinkedList<T> {
  // ================================
  // PRIVATE PROPERTIES
  // ================================

  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;
  private length: number = 0;
  private _modCount = 0;

  // Node pool to reduce GC pressure
  // source : https://egghead.io/blog/object-pool-design-pattern
  private static nodePool: Node<any>[] = [];
  private static readonly MAX_POOL_SIZE = 100;

  // ================================
  // PRIVATE HELPER METHODS
  // ================================

  /**
   * Gets a node from the pool or creates a new one.
   * @param value - The value to assign to the node.
   * @returns A node with the specified value.
   */
  private getNode<T>(value: T): Node<T> {
    const node = LinkedList.nodePool.pop();
    if (node) {
      node.value = value;
      node.next = null;
      return node as Node<T>;
    }
    return new Node(value);
  }

  /**
   * Returns a node to the pool for reuse.
   * @param node - The node to return to the pool.
   */
  private returnNode(node: Node<T>): void {
    if (LinkedList.nodePool.length < LinkedList.MAX_POOL_SIZE) {
      // Clear references to prevent memory leaks
      node.value = undefined as any;
      node.next = null;
      LinkedList.nodePool.push(node);
    }
  }

  /**
   * Increments the size counter.
   * Gives a hook to monitor allocations or size limits in the future.
   */
  private _incrementSize(): void {
    this.length++;
  }

  /**
   * Decrements the size counter.
   */
  private _decrementSize(): void {
    this.length--;
  }

  /**
   * Increments the modification counter.
   * Utils to prevent mutation during iteration.
   */
  private _incrementModCount(): void {
    this._modCount++;
  }

  // ================================
  // CONSTRUCTOR
  // ================================

  /**
   * Creates a new LinkedList.
   * Optionally initialized with a single value.
   *
   * If you want to instantiate a LinkedList from
   * an array, checkout `fromArray` method.
   *
   * @param initialValue - Optional initial value to add to the list.
   */
  constructor(initialValue?: T) {
    if (initialValue !== undefined) {
      const node = this.getNode(initialValue);
      this.head = node;
      this.tail = node;
      this.length = 1;
    }
  }

  // ================================
  // BASIC PROPERTIES & STATE
  // ================================

  /**
   * Returns the number of elements in the list.
   * @returns The size of the list.
   */
  get size(): number {
    return this.length;
  }

  /**
   * Returns true if the list is empty.
   * @returns True if the list has no elements, false otherwise.
   */
  isEmpty(): boolean {
    return this.head == null;
  }

  /**
   * Clear the current list.
   * All nodes are returned to the object pool for reuse.
   */
  clear(): void {
    // With Object Pooling (optimized approach):
    // - *Walk* through each node in the linked list
    // - *Save* each node to a static pool array instead of letting it become garbage
    // - *Clear* the node's data (set value to undefined, next to null)
    // - *Reuse* these nodes later when creating new nodes
    let current = this.head;
    while (current) {
      const next = current.next;
      this.returnNode(current);
      current = next;
    }

    this.head = null;
    this.tail = null;
    this.length = 0;
    this._incrementModCount();
  }

  // ================================
  // ACCESS METHODS
  // ================================

  /**
   * Returns the first value in the list (or null if empty).
   * @returns The first value or null if the list is empty.
   */
  getHead(): T | null {
    return this.head?.value ?? null;
  }

  /**
   * Returns the last value in the list (or null if empty).
   * @returns The last value or null if the list is empty.
   */
  getTail(): T | null {
    return this.tail?.value ?? null;
  }

  /**
   * Returns the value at a specific index.
   * Throws an error if the index is out of bounds.
   *
   * @param index - The index to retrieve.
   * @returns The value at the specified index.
   * @throws {RangeError} If the index is out of bounds.
   */
  get(index: number): T {
    if (!Number.isInteger(index) || index < 0 || index >= this.length) {
      throw new RangeError(
        `[LinkedList.get] Index ${index} is out of bounds. Size: ${this.length}.`,
      );
    }

    if (index === 0) {
      return this.head!.value;
    }

    let current = this.head!;
    for (let i = 0; i < index; i++) {
      current = current.next!;
    }

    return current.value;
  }

  // ================================
  // SEARCH METHODS
  // ================================

  /**
   * Checks whether a given value exists in the linked list.
   *
   * @param value - The value to search for.
   * @returns `true` if the value is found, otherwise `false`.
   */
  includes(value: T): boolean {
    for (let current = this.head; current; current = current.next) {
      if (current.value === value) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns the index of the first occurrence of the given value.
   *
   * @param value - The value to search for.
   * @returns The index of the value if found, otherwise `-1`.
   */
  indexOf(value: T): number {
    let current = this.head;
    let index = 0;

    while (current) {
      if (current.value === value) {
        return index;
      }
      current = current.next;
      index++;
    }

    return -1;
  }

  /**
   * Finds the first value in the list that satisfies the predicate.
   *
   * @param predicate - A function to test each element (must return a boolean).
   * @returns The first matching value, or null if none found.
   */
  find(predicate: (value: T, index: number) => boolean): T | null {
    let current = this.head;
    let index = 0;

    while (current) {
      if (predicate(current.value, index)) {
        return current.value;
      }
      current = current.next;
      index++;
    }

    return null;
  }

  // ================================
  // STACK OPERATIONS (OPTIMIZED)
  // ================================

  /**
   * Push to front (Stack push operation) - O(1)
   * Optimized for Stack usage - prefer this over append for Stack
   *
   * @param value - The value to push to the front.
   */
  pushFront(value: T): void {
    const newNode = this.getNode(value);
    this._incrementModCount();

    if (this.head) {
      newNode.next = this.head;
      this.head = newNode;
    } else {
      this.head = newNode;
      this.tail = newNode;
    }

    this._incrementSize();
  }

  /**
   * Pop from front (Stack pop operation) - O(1)
   * Returns undefined instead of throwing for better Stack performance
   *
   * @returns The value from the front of the list, or undefined if empty.
   */
  popFront(): T | undefined {
    if (!this.head) {
      return undefined;
    }

    this._incrementModCount();
    const value = this.head.value;
    const oldHead = this.head;

    this.head = this.head.next;
    this._decrementSize();

    if (!this.head) {
      this.tail = null;
    }

    this.returnNode(oldHead);
    return value;
  }

  /**
   * Peek at front (Stack peek operation) - O(1)
   * Returns the front value without removing it.
   *
   * @returns The value at the front of the list, or undefined if empty.
   */
  peekFront(): T | undefined {
    return this.head?.value;
  }

  // ================================
  // INSERTION METHODS
  // ================================

  /**
   * Appends a new element to the end of the linked list.
   *
   * @param value - The value to append.
   */
  append(value: T): void {
    const newNode = this.getNode(value);
    this._incrementModCount();

    if (this.tail) {
      this.tail.next = newNode;
      this.tail = newNode;
    } else {
      // Empty list case
      this.head = newNode;
      this.tail = newNode;
    }

    this._incrementSize();
  }

  /**
   * Prepend a new element to the start of the linked list.
   * Alias for pushFront method.
   *
   * @param value - The value to prepend.
   */
  prepend(value: T): void {
    this.pushFront(value);
  }

  /**
   * Inserts a new value at a specific index.
   * Throws an error if the index is out of bounds.
   *
   * @param index - The index to insert at.
   * @param value - The value to insert.
   * @throws {TypeError} If the index is not an integer.
   * @throws {RangeError} If the index is out of bounds.
   */
  insert(index: number, value: T): void {
    if (!Number.isInteger(index)) {
      throw new TypeError(
        `[LinkedList.insert] Index must be an integer, got: ${index}`,
      );
    }

    if (index < 0 || index > this.length) {
      throw new RangeError(
        `[LinkedList.insert] Index ${index} is out of bounds. Size: ${this.length}.`,
      );
    }

    this._incrementModCount();

    if (index === 0) {
      this.prepend(value);
    } else if (index === this.length) {
      this.append(value);
    } else {
      let current = this.head;
      for (let i = 0; i < index - 1; i++) {
        current = current!.next;
      }

      const newNode = this.getNode(value);
      newNode.next = current!.next;
      current!.next = newNode;
      this._incrementSize();
    }
  }

  /**
   * Append multiple values efficiently in a single operation.
   *
   * @param values - Array of values to append to the list.
   */
  appendBatch(values: T[]): void {
    if (values.length === 0) return;

    this._incrementModCount();

    for (const value of values) {
      const newNode = this.getNode(value);

      if (this.tail) {
        this.tail.next = newNode;
        this.tail = newNode;
      } else {
        this.head = newNode;
        this.tail = newNode;
      }

      this._incrementSize();
    }
  }

  // ================================
  // REMOVAL METHODS
  // ================================

  /**
   * Remove the value at a specific index and returns it.
   * Throws an error if the index is out of bounds.
   *
   * @param index - The index to remove.
   * @returns The value removed at the specified index.
   * @throws {RangeError} If the index is out of bounds.
   */
  remove(index: number): T {
    if (!Number.isInteger(index) || index < 0 || index >= this.length) {
      throw new RangeError(
        `[LinkedList.remove] Index ${index} is out of bounds. Size: ${this.length}.`,
      );
    }

    this._incrementModCount();

    if (index === 0) {
      const value = this.head!.value;
      const oldHead = this.head!;
      this.head = this.head!.next;
      this._decrementSize();

      if (!this.head) {
        this.tail = null;
      }

      this.returnNode(oldHead);
      return value;
    }

    let current = this.head!;
    for (let i = 0; i < index - 1; i++) {
      current = current.next!;
    }

    const nodeToRemove = current.next!;
    const removedValue = nodeToRemove.value;
    current.next = nodeToRemove.next;

    if (nodeToRemove === this.tail) {
      this.tail = current;
    }

    this.returnNode(nodeToRemove);
    this._decrementSize();
    return removedValue;
  }

  // ================================
  // FUNCTIONAL PROGRAMMING METHODS
  // ================================

  /**
   * Creates a new LinkedList by applying a mapping function
   * to each element in the current list.
   *
   * @param fn - A function that maps a value and index to a new value.
   * @returns A new LinkedList of the mapped values.
   */
  map<U>(fn: (value: T, index: number) => U): LinkedList<U> {
    let res = new LinkedList<U>();
    let current = this.head;
    let i = 0;

    while (current) {
      res.append(fn(current.value, i));
      current = current.next;
      i++;
    }

    return res;
  }

  /**
   * Creates a new LinkedList containing only elements
   * for which the predicate function returns true.
   *
   * @param fn - A predicate function to test each value and index.
   * @returns A new filtered LinkedList.
   */
  filter(fn: (value: T, index: number) => boolean): LinkedList<T> {
    const res = new LinkedList<T>();
    let current = this.head;
    let i = 0;

    while (current) {
      if (fn(current.value, i)) {
        res.append(current.value);
      }
      current = current.next;
      i++;
    }

    return res;
  }

  /**
   * Applies a reducer function on each value of the list,
   * accumulating a single result.
   *
   * @param fn - A reducer function receiving accumulator, value and index.
   * @param initial - The initial value for the accumulator.
   * @returns The accumulated result after processing all elements.
   */
  reduce<U>(fn: (acc: U, value: T, index: number) => U, initial: U): U {
    let res = initial;
    let current = this.head;
    let i = 0;

    while (current) {
      res = fn(res, current.value, i);
      current = current.next;
      i++;
    }

    return res;
  }

  // ================================
  // TRANSFORMATION METHODS
  // ================================

  /**
   * Reverses the LinkedList in place.
   * Updates head and tail accordingly.
   */
  reverse(): void {
    if (!this.head || this.length < 2) return;

    this._incrementModCount();

    let prev: Node<T> | null = null;
    let current: Node<T> | null = this.head;
    this.tail = this.head;

    while (current) {
      const nextNode: Node<T> | null = current.next;
      current.next = prev;
      prev = current;
      current = nextNode;
    }

    this.head = prev;
  }

  /**
   * Creates a deep copy of the current list.
   * If a mapper is provided, it will be applied to each value.
   * Otherwise, a shallow copy of the values is done.
   *
   * @param mapper - Optional mapping function for deep copying values.
   * @returns A new LinkedList containing copied values.
   */
  clone(mapper?: (value: T) => T): LinkedList<T> {
    const newList = new LinkedList<T>();
    let current = this.head;

    while (current) {
      newList.append(mapper ? mapper(current.value) : current.value);
      current = current.next;
    }

    return newList;
  }

  // ================================
  // CONVERSION METHODS
  // ================================

  /**
   * Converts the linked list into an array.
   *
   * @returns An array containing all values in the linked list in order.
   */
  toArray(): T[] {
    const result = new Array<T>(this.length);
    let current = this.head;
    let index = 0;

    while (current) {
      result[index++] = current.value;
      current = current.next;
    }

    return result;
  }

  /**
   * Convert to array in reverse order (useful for Stack operations).
   *
   * @returns An array containing all values in reverse order.
   */
  toArrayReverse(): T[] {
    const result = new Array<T>(this.length);
    let current = this.head;
    let index = this.length - 1;

    while (current) {
      result[index--] = current.value;
      current = current.next;
    }

    return result;
  }

  /**
   * Returns a string representation of the linked list,
   * with values connected by " -> ".
   *
   * @returns A string representing the linked list.
   */
  toString(): string {
    let result = "";
    let current = this.head;

    while (current) {
      result += `${current.value}`;
      if (current.next) result += " -> ";
      current = current.next;
    }

    return result;
  }

  /**
   * Prints the string representation of the linked list to the console.
   */
  print(): void {
    console.log(this.toString());
  }

  // ================================
  // COMPARISON METHODS
  // ================================

  /**
   * Compares this list with another to check for value equality.
   * The comparison is shallow: if T is an object, reference equality is used.
   *
   * @param other - Another LinkedList to compare against.
   * @returns `true` if both lists are equal in size and content.
   */
  equals(other: LinkedList<T>): boolean {
    if (this.length !== other.size) return false;

    let a = this.head;
    let b = other.head;

    while (a && b) {
      if (a.value !== b.value) return false;
      a = a.next;
      b = b.next;
    }

    return a === null && b === null;
  }

  // ================================
  // ITERATION SUPPORT
  // ================================

  /**
   * Returns an iterator to allow iteration over the linked list using for..of.
   * The iterator includes mutation detection to prevent unsafe iteration.
   *
   * @returns An iterator over the linked list values.
   * @throws {Error} If a mutation occurs on the list during iteration.
   */
  [Symbol.iterator](): Iterator<T> {
    let current = this.head;
    const expectedModCount = this._modCount;

    return {
      next: (): IteratorResult<T> => {
        if (this._modCount !== expectedModCount) {
          throw new Error(
            "[LinkedList.iterator] List was mutated during iteration.",
          );
        }

        if (current) {
          const value = current.value;
          current = current.next;
          return { value, done: false };
        }

        return { value: undefined, done: true };
      },
    };
  }

  // ================================
  // STATIC FACTORY METHODS
  // ================================

  /**
   * Creates a new LinkedList from an array.
   * Each element of the array is appended to the list in order.
   *
   * > Pay attention:
   * > Performs a deep copy of the node structure but shallow copy of values.
   * > If T is a reference type (object), use `mapper` func to avoid side effects.
   *
   * @param arr - Array of elements to be added to the list.
   * @param mapper - (optional) Optionally allow a deep copy with a mapper.
   * @returns A new LinkedList containing the elements from the array.
   */
  static fromArray<T>(arr: T[], mapper?: (item: T) => T): LinkedList<T> {
    const list = new LinkedList<T>();

    for (const elem of arr) {
      list.append(mapper ? mapper(elem) : elem);
    }

    return list;
  }

  // ================================
  // STATIC UTILITY METHODS
  // ================================

  /**
   * Clean up static resources (call on application shutdown).
   * Clears the node pool to free memory.
   */
  static cleanup(): void {
    LinkedList.nodePool.length = 0;
  }
}
