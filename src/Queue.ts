import { DoublyLinkedList } from "./DoublyLinkedList";

/**
 * A generic FIFO queue implementation using a doubly linked list.
 * Provides constant-time enqueue and dequeue operations.
 *
 * @typeParam T - The type of elements stored in the queue.
 */
export class Queue<T> {
  private doublyLinkedList: DoublyLinkedList<T>;

  /**
   * Creates an empty queue.
   */
  constructor() {
    this.doublyLinkedList = new DoublyLinkedList();
  }

  /**
   * Adds a value to the end of the queue (tail).
   *
   * @param value - The value to enqueue.
   */
  enqueue(value: T): void {
    this.doublyLinkedList.append(value);
  }

  /**
   * Removes and returns the value at the front of the queue (head).
   *
   * @returns The dequeued value, or `null` if the queue is empty.
   */
  dequeue(): T | null {
    return this.doublyLinkedList.shift();
  }

  /**
   * Returns the value at the front of the queue without removing it.
   *
   * @returns The front value, or `null` if the queue is empty.
   */
  peek(): T | null {
    return this.doublyLinkedList.getHead();
  }

  /**
   * Returns a shallow clone of the queue.
   * If a mapper is provided, each value will be mapped before cloning.
   * @param mapper Optional transformation function.
   * @returns A new Queue instance.
   */
  clone(mapper?: (value: T) => T): Queue<T> {
    const newQueue = new Queue<T>();
    newQueue.doublyLinkedList = this.doublyLinkedList.clone(mapper);
    return newQueue;
  }

  /**
   * Returns a new Queue containing only the elements
   * that satisfy the predicate.
   * @param predicate - A function to filter values.
   * @returns A filtered Queue instance.
   */
  filter(predicate: (value: T, index: number) => boolean): Queue<T> {
    const newQueue = new Queue<T>();
    newQueue.doublyLinkedList = this.doublyLinkedList.filter(predicate);
    return newQueue;
  }

  /**
   * Creates a new Queue by applying a mapping function to each element.
   * The mapping preserves the FIFO order of the original queue.
   *
   * @param fn - A function that maps each value and index to a new value.
   * @returns A new Queue<U> with the mapped values.
   */
  map<U>(fn: (value: T, index: number) => U): Queue<U> {
    const result = new Queue<U>();
    let index = 0;
    for (const value of this) {
      result.enqueue(fn(value, index));
      index++;
    }
    return result;
  }

  /**
   * Finds the first value that satisfies the predicate.
   * @param predicate - A function that tests each value.
   * @returns The found value, or null if not found.
   */
  find(predicate: (value: T, index: number) => boolean): T | null {
    return this.doublyLinkedList.find(predicate);
  }

  /**
   * Removes all values from the queue.
   */
  clear(): void {
    this.doublyLinkedList.clear();
  }

  /**
   * Checks whether the queue is empty.
   *
   * @returns `true` if the queue contains no elements, `false` otherwise.
   */
  isEmpty(): boolean {
    return this.doublyLinkedList.isEmpty();
  }

  /**
   * The number of elements in the queue.
   */
  get size(): number {
    return this.doublyLinkedList.size;
  }

  /**
   * Returns an array containing all elements in the queue, in order.
   *
   * @returns An array of values.
   */
  toArray(): T[] {
    return this.doublyLinkedList.toArray();
  }

  /**
   * Returns a JSON-serializable array representation of the queue.
   * Useful for logging, debugging, or persistence.
   *
   * @returns An array of values in FIFO order.
   */
  toJSON(): T[] {
    return this.toArray();
  }

  /**
   * Returns a string representation of the queue.
   *
   * @returns An string representing the queue.
   */
  toString(): string {
    return this.doublyLinkedList.toString();
  }

  /**
   * Prints the string representation of the queue to the console.
   */
  print(): void {
    this.doublyLinkedList.print();
  }

  /**
   * Creates a Queue from an array, in FIFO order.
   * If a mapper is provided, each element is transformed before insertion.
   * @param arr - The array of values.
   * @param mapper - Optional function to transform values.
   * @returns A new Queue instance.
   */
  static fromArray<T>(arr: T[], mapper?: (item: T) => T): Queue<T> {
    const queue = new Queue<T>();
    queue.doublyLinkedList = DoublyLinkedList.fromArray(arr, mapper);
    return queue;
  }

  /**
   * Checks if the provided value is an instance of the Queue class.
   *
   * @param elem - The value to check.
   * @returns `true` if the value is a Queue instance, otherwise `false`.
   */
  static isQueue(elem: unknown): boolean {
    return elem instanceof Queue;
  }

  /**
   * Allows iteration over the queue using `for..of` syntax.
   * Throws if the queue is mutated during iteration.
   *
   * @returns An iterator over the queue values.
   */
  [Symbol.iterator](): Iterator<T> {
    return this.doublyLinkedList[Symbol.iterator]();
  }
}
