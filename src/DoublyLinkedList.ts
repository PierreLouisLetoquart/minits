import { RangeError } from "./Errors";

/**
 * @internal
 * Internal node class for the DoublyLinkedList implementation.
 */
class DoubleNode<T> {
  value: T;
  prev: DoubleNode<T> | null = null;
  next: DoubleNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

/**
 * A generic singly linked list implementation.
 *
 * Features:
 * - Object pooling for reduced garbage collection pressure
 * - Iteration safety with modification detection
 * - Functional programming methods (map, filter, reduce)
 * - Batch operations for improved efficiency
 */
export class DoublyLinkedList<T> {
  // ================================
  // PRIVATE PROPERTIES
  // ================================

  private head: DoubleNode<T> | null = null;
  private tail: DoubleNode<T> | null = null;
  private length: number = 0;
  private _modCount = 0;

  // Node pool to reduce GC pressure
  // source : https://egghead.io/blog/object-pool-design-pattern
  private static nodePool: DoubleNode<any>[] = [];
  private static readonly MAX_POOL_SIZE = 100;

  // ================================
  // PRIVATE HELPER METHODS
  // ================================

  /**
   * Gets a node from the pool or creates a new one.
   * @param value - The value to assign to the node.
   * @returns A node with the specified value.
   */
  private getNode<T>(value: T): DoubleNode<T> {
    const node = DoublyLinkedList.nodePool.pop();
    if (node) {
      node.value = value;
      node.next = null;
      return node as DoubleNode<T>;
    }
    return new DoubleNode(value);
  }

  /**
   * Returns a node to the pool for reuse.
   * @param node - The node to return to the pool.
   */
  private returnNode(node: DoubleNode<T>): void {
    if (DoublyLinkedList.nodePool.length < DoublyLinkedList.MAX_POOL_SIZE) {
      // Clear references to prevent memory leaks
      node.value = undefined as any;
      node.next = null;
      DoublyLinkedList.nodePool.push(node);
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
   * Creates a new DoublyLinkedList.
   * Optionally initialized with a single value.
   *
   * If you want to instantiate a DoublyLinkedList from
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
        `[DoublyLinkedList.get] Index ${index} is out of bounds. Size: ${this.length}.`,
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
   * Checks whether a given value exists in the doubly linked list.
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
   * Appends a new element to the end of the linked list.
   *
   * @param value - The value to append.
   */
  append(value: T): void {
    const newNode = new DoubleNode(value);
    this._incrementModCount();

    if (this.tail) {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    } else {
      this.head = newNode;
      this.tail = newNode;
    }

    this._incrementSize();
  }

  /**
   * Prepend a new element to the start of the linked list.
   *
   * @param value - The value to prepend.
   */
  prepend(value: T): void {
    const newNode = new DoubleNode(value);
    this._incrementModCount();

    if (this.head) {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    } else {
      this.head = newNode;
      this.tail = newNode;
    }

    this._incrementSize();
  }

  /**
   * Removes and returns the last element of the list (tail).
   *
   * @returns The removed value, or `null` if the list is empty.
   */
  pop(): T | null {
    if (!this.tail) return null;

    const val = this.tail.value;
    this.tail = this.tail.prev;

    if (this.tail) {
      this.tail.next = null;
    } else {
      this.head = null;
    }

    this._decrementSize();

    return val;
  }

  /**
   * Removes and returns the first element of the list (head).
   *
   * @returns The removed value, or `null` if the list is empty.
   */
  shift(): T | null {
    if (!this.head) return null;

    const val = this.head.value;
    this.head = this.head.next;

    if (this.head) {
      this.head.prev = null;
    } else {
      this.tail = null;
    }

    this._decrementSize();

    return val;
  }

  /**
   * Inserts a new value at a specific index.
   * Throws an error if the index is out of bounds.
   *
   * @param index - The index to insert at.
   * @param value - The value to insert.
   * @throws {RangeError} If the index is out of bounds.
   */
  insert(index: number, value: T): void {
    if (!Number.isInteger(index)) {
      throw new TypeError(
        `[DoublyLinkedList.insert] Index must be an integer, got: ${index}`,
      );
    }

    if (index < 0 || index > this.length) {
      throw new RangeError(
        `[DoublyLinkedList.insert] Index ${index} is out of bounds. Size: ${this.length}.`,
      );
    }

    this._incrementModCount();

    if (index === 0) {
      this.prepend(value);
    } else if (index === this.length) {
      this.append(value);
    } else {
      let current: DoubleNode<T>;
      if (index < this.length / 2) {
        current = this.head!;
        for (let i = 0; i < index; i++) {
          current = current.next!;
        }
      } else {
        current = this.tail!;
        for (let i = this.length - 1; i > index; i--) {
          current = current.prev!;
        }
      }

      const newNode = new DoubleNode(value);
      newNode.next = current;
      newNode.prev = current.prev;
      current.prev!.next = newNode;
      current.prev = newNode;
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
        `[DoublyLinkedList.remove] Index ${index} is out of bounds. Size: ${this.length}.`,
      );
    }

    this._incrementModCount();

    if (index === 0) {
      return this.shift()!;
    }
    if (index === this.length - 1) {
      return this.pop()!;
    }

    let nodeToRemove: DoubleNode<T>;
    if (index < this.length / 2) {
      nodeToRemove = this.head!;
      for (let i = 0; i < index; i++) {
        nodeToRemove = nodeToRemove.next!;
      }
    } else {
      nodeToRemove = this.tail!;
      for (let i = this.length - 1; i > index; i--) {
        nodeToRemove = nodeToRemove.prev!;
      }
    }

    const removedValue = nodeToRemove.value;

    if (nodeToRemove.prev) {
      nodeToRemove.prev.next = nodeToRemove.next;
    }
    if (nodeToRemove.next) {
      nodeToRemove.next.prev = nodeToRemove.prev;
    }

    this.returnNode(nodeToRemove);
    this._decrementSize();
    return removedValue;
  }

  // ================================
  // FUNCTIONAL PROGRAMMING METHODS
  // ================================

  /**
   * Creates a new DoublyLinkedList by applying a mapping function
   * to each element in the current list.
   *
   * @param fn - A function that maps a value and index to a new value.
   * @returns A new DoublyLinkedList of the mapped values.
   */
  map<U>(fn: (value: T, index: number) => U): DoublyLinkedList<U> {
    let res = new DoublyLinkedList<U>();
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
   * Creates a new DoublyLinkedList containing only elements
   * for which the predicate function returns true.
   *
   * @param fn - A predicate function to test each value and index.
   * @returns A new filtered DoublyLinkedList.
   */
  filter(fn: (value: T, index: number) => boolean): DoublyLinkedList<T> {
    const res = new DoublyLinkedList<T>();
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
   * Reverses the DoublyLinkedList in place.
   * Updates head and tail accordingly.
   */
  reverse(): void {
    if (!this.head || this.length < 2) return;

    this._incrementModCount();

    let current: DoubleNode<T> | null = this.head;
    this.tail = this.head;

    while (current) {
      const temp: DoubleNode<T> | null = current.next;
      current.next = current.prev;
      current.prev = temp;

      if (!current.prev) {
        this.head = current;
      }

      current = current.prev;
    }
  }

  /**
   * Creates a deep copy of the current list.
   * If a mapper is provided, it will be applied to each value.
   * Otherwise, a shallow copy of the values is done.
   *
   * @param mapper Optional mapping function for deep copying values.
   * @returns A new DoublyLinkedList containing copied values.
   */
  clone(mapper?: (value: T) => T): DoublyLinkedList<T> {
    const newList = new DoublyLinkedList<T>();
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
   * @param other - Another DoublyLinkedList to compare against.
   * @returns true if both lists are equal in size and content.
   */
  equals(other: DoublyLinkedList<T>): boolean {
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
            "[DoublyLinkedList.iterator] List was mutated during iteration.",
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
   * > Pay attention:
   * > Performs a deep copy of the node structure but shallow copy of values.
   * > If T is a reference type (object), use `mapper` func to avoid side effects.
   *
   * Creates a new DoublyLinkedList from an array.
   * Each element of the array is appended to the list in order.
   *
   * @param arr - Array of elements to be added to the list.
   * @param mapper (optional) - Optionally allow a deep copy with a mapper.
   * @returns A new DoublyLinkedList containing the elements from the array.
   */
  static fromArray<T>(arr: T[], mapper?: (item: T) => T): DoublyLinkedList<T> {
    const list = new DoublyLinkedList<T>();

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
    DoublyLinkedList.nodePool.length = 0;
  }
}
