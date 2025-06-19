import { RangeError } from "./Errors";

/** @internal */
class Node<T> {
  value: T;
  next: Node<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

/**
 * A generic singly linked list implementation.
 */
export class LinkedList<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;
  private length: number = 0;
  private _modCount = 0;

  /**
   * Creates a new LinkedList.
   * Optionally initialized with a single value.
   *
   * If you want to instanciate a LinkedList from
   * an array, checkout `fromArray` method.
   */
  constructor(initialValue?: T) {
    if (initialValue !== undefined) {
      const node = new Node(initialValue);
      this.head = node;
      this.tail = node;
      this.length = 1;
    }
  }

  // Gives a hook to monitor allocations or size limits in the future.
  private _incrementSize(): void {
    this.length++;
  }

  private _decrementSize(): void {
    this.length--;
  }

  // Utils to prevent mutation during iteration
  private _incrementModCount(): void {
    this._modCount++;
  }

  /**
   * Returns the number of elements in the list.
   */
  get size(): number {
    return this.length;
  }

  /**
   * Returns true is the list is empty.
   */
  isEmpty(): boolean {
    return this.length == 0;
  }

  /**
   * Clear the current list.
   */
  clear(): void {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  /**
   * Returns the first value in the list (or null if empty).
   */
  getHead(): T | null {
    return this.head?.value ?? null;
  }

  /**
   * Returns the last value in the list (or null if empty).
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
    if (!Number.isInteger(index)) {
      throw new TypeError(
        `[LinkedList.get] Index must be an integer, got: ${index}`,
      );
    }

    if (index < 0 || index >= this.length) {
      throw new RangeError(
        `[LinkedList.get] Index ${index} is out of bounds. Size: ${this.length}.`,
      );
    }

    let current = this.head;
    for (let i = 0; i < index; i++) {
      current = current!.next;
    }

    return current!.value;
  }

  /**
   * Checks whether a given value exists in the linked list.
   *
   * @param value - The value to search for.
   * @returns `true` if the value is found, otherwise `false`.
   */
  includes(value: T): boolean {
    let current = this.head;

    while (current) {
      if (current.value === value) {
        return true;
      }
      current = current.next;
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
   * Appends a new element to the end of the linked list.
   *
   * @param value - The value to append.
   */
  append(value: T): void {
    const newNode = new Node(value);
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
   *
   * @param value - The value to prepend.
   */
  prepend(value: T): void {
    const newNode = new Node(value);
    this._incrementModCount();

    if (this.head) {
      newNode.next = this.head;
      this.head = newNode;
    } else {
      // Empty list case
      this.head = newNode;
      this.tail = newNode;
    }

    this._incrementSize();
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

      const newNode = new Node(value);
      newNode.next = current!.next;
      current!.next = newNode;
      this._incrementSize();
    }
  }

  /**
   * Remove the value at a specific index and returns it.
   * Throws an error if the index is out of bounds.
   *
   * @param index - The index to remove.
   * @returns The value removed at the specified index.
   * @throws {RangeError} If the index is out of bounds.
   */
  remove(index: number): T {
    if (!Number.isInteger(index)) {
      throw new TypeError(
        `[LinkedList.remove] Index must be an integer, got: ${index}`,
      );
    }

    if (index < 0 || index >= this.length) {
      throw new RangeError(
        `[LinkedList.remove] Index ${index} is out of bounds. Size: ${this.length}.`,
      );
    }

    if (!this.head) {
      throw new RangeError(
        `[LinkedList.remove] Index ${index} can't be removed. LinkedList is empty.`,
      );
    }

    this._incrementModCount();

    let removedValue: T;

    if (index === 0) {
      removedValue = this.head.value;
      this.head = this.head.next;
      this._decrementSize();

      if (!this.head) {
        this.tail = null;
      }
    } else {
      let current = this.head;
      for (let i = 0; i < index - 1; i++) {
        current = current!.next!;
      }

      const nodeToRemove = current.next!;
      removedValue = nodeToRemove.value;
      current.next = nodeToRemove.next;

      if (nodeToRemove === this.tail) {
        this.tail = current;
      }

      this._decrementSize();
    }

    return removedValue;
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

  /**
   * Converts the linked list into an array.
   *
   * @returns An array containing all values in the linked list in order.
   */
  toArray(): T[] {
    let res: T[] = [];
    let current = this.head;

    while (current) {
      res.push(current.value);
      current = current.next;
    }

    return res;
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
   * @param mapper Optional mapping function for deep copying values.
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

  // UNUSED because `Node` type is internal to the lib...
  ///**
  // * > Pay attention:
  // * > Performs a deep copy of the node structure but shallow copy of values.
  // * > If T is a reference type (object), mutations to values will affect both.
  // *
  // * Factory method to build a LinkedList from an existing node chain.
  // *
  // * @param node - The head of the external node chain.
  // * @returns A new LinkedList containing the copied chain.
  // */
  //static fromNodeChain<T>(node: Node<T>): LinkedList<T> {
  //  const list = new LinkedList<T>();
  //
  //  const copiedHead = new Node(node.value);
  //  let currentOriginal = node.next;
  //  let currentCopy = copiedHead;
  //  let length = 1;
  //
  //  while (currentOriginal) {
  //    const newNode = new Node(currentOriginal.value);
  //    currentCopy.next = newNode;
  //    currentCopy = newNode;
  //    currentOriginal = currentOriginal.next;
  //    length++;
  //  }
  //
  //  list.head = copiedHead;
  //  list.tail = currentCopy;
  //  list.length = length;
  //
  //  return list;
  //}

  /**
   * > Pay attention:
   * > Performs a deep copy of the node structure but shallow copy of values.
   * > If T is a reference type (object), use `mapper` func to avoid side effects.
   *
   * Creates a new LinkedList from an array.
   * Each element of the array is appended to the list in order.
   *
   * @param arr - Array of elements to be added to the list.
   * @param mapper (optional) - Optionally allow a deep copy with a mapper.
   * @returns A new LinkedList containing the elements from the array.
   */
  static fromArray<T>(arr: T[], mapper?: (item: T) => T): LinkedList<T> {
    const list = new LinkedList<T>();

    for (const elem of arr) {
      list.append(mapper ? mapper(elem) : elem);
    }

    return list;
  }
}
