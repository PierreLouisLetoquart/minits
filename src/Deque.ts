import { DoublyLinkedList } from "./DoublyLinkedList";

/**
 * A generic double-ended queue (Deque) implementation using a doubly linked list.
 * Provides constant-time operations at both ends.
 *
 * @typeParam T - The type of elements stored in the deque.
 */
export class Deque<T> {
  private list: DoublyLinkedList<T>;

  /**
   * Creates an empty deque.
   */
  constructor() {
    this.list = new DoublyLinkedList();
  }

  /**
   * Adds a value to the front (head) of the deque.
   *
   * @param value - The value to add.
   */
  pushFront(value: T): void {
    this.list.prepend(value);
  }

  /**
   * Adds a value to the back (tail) of the deque.
   *
   * @param value - The value to add.
   */
  pushBack(value: T): void {
    this.list.append(value);
  }

  /**
   * Removes and returns the value at the front (head) of the deque.
   *
   * @returns The removed value, or `null` if the deque is empty.
   */
  popFront(): T | null {
    return this.list.shift();
  }

  /**
   * Removes and returns the value at the back (tail) of the deque.
   *
   * @returns The removed value, or `null` if the deque is empty.
   */
  popBack(): T | null {
    return this.list.pop();
  }

  /**
   * Returns the value at the front of the deque without removing it.
   *
   * @returns The front value, or `null` if the deque is empty.
   */
  peekFront(): T | null {
    return this.list.getHead();
  }

  /**
   * Returns the value at the back of the deque without removing it.
   *
   * @returns The back value, or `null` if the deque is empty.
   */
  peekBack(): T | null {
    return this.list.getTail();
  }

  /**
   * Returns a shallow clone of the deque.
   * Optionally map each element with a custom function.
   */
  clone(mapper?: (value: T) => T): Deque<T> {
    const newDeque = new Deque<T>();
    newDeque.list = this.list.clone(mapper);
    return newDeque;
  }

  /**
   * Returns a new Deque containing only the elements
   * that satisfy the predicate.
   *
   * @param predicate - A function to filter values.
   * @returns A filtered Deque instance.
   */
  filter(predicate: (value: T, index: number) => boolean): Deque<T> {
    const newDeque = new Deque<T>();
    newDeque.list = this.list.filter(predicate);
    return newDeque;
  }

  /**
   * Creates a new Deque by applying a mapping function to each element.
   * The mapping preserves the order of the original deque.
   *
   * @param fn - A function that maps each value and index to a new value.
   * @returns A new Deque<U> with the mapped values.
   */
  map<U>(fn: (value: T, index: number) => U): Deque<U> {
    const result = new Deque<U>();
    let index = 0;
    for (const value of this) {
      result.pushBack(fn(value, index));
      index++;
    }
    return result;
  }

  /**
   * Finds the first value that satisfies the predicate.
   *
   * @param predicate - A function that tests each value.
   * @returns The found value, or null if not found.
   */
  find(predicate: (value: T, index: number) => boolean): T | null {
    return this.list.find(predicate);
  }

  /**
   * Removes all elements from the deque.
   */
  clear(): void {
    this.list.clear();
  }

  /**
   * Checks whether the deque is empty.
   *
   * @returns `true` if the deque has no elements.
   */
  isEmpty(): boolean {
    return this.list.isEmpty();
  }

  /**
   * The number of elements in the deque.
   */
  get size(): number {
    return this.list.size;
  }

  /**
   * Converts the deque into an array.
   *
   * @returns An array of values in order.
   */
  toArray(): T[] {
    return this.list.toArray();
  }

  /**
   * Returns a JSON-serializable array representation of the deque.
   */
  toJSON(): T[] {
    return this.toArray();
  }

  /**
   * Returns a string representation of the deque.
   */
  toString(): string {
    return this.list.toString();
  }

  /**
   * Prints the string representation to the console.
   */
  print(): void {
    this.list.print();
  }

  /**
   * Creates a new Deque from an array, in order.
   *
   * @param arr - The array of values to populate.
   * @param mapper - Optional function to transform values.
   */
  static fromArray<T>(arr: T[], mapper?: (item: T) => T): Deque<T> {
    const deque = new Deque<T>();
    deque.list = DoublyLinkedList.fromArray(arr, mapper);
    return deque;
  }

  /**
   * Checks if the given value is a Deque instance.
   *
   * @param elem - The value to test.
   */
  static isDeque(elem: unknown): boolean {
    return elem instanceof Deque;
  }

  /**
   * Enables iteration with `for...of`.
   */
  [Symbol.iterator](): Iterator<T> {
    return this.list[Symbol.iterator]();
  }
}
