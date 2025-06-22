/**
 * Optimized Node class with better type safety and memory efficiency
 */
class Node<T> {
  public data: T;
  public left: Node<T> | null = null;
  public right: Node<T> | null = null;

  constructor(data: T, left?: Node<T> | null, right?: Node<T> | null) {
    this.data = data;
    this.left = left || null;
    this.right = right || null;
  }

  /**
   * Checks if this node is a leaf (no children)
   */
  isLeaf(): boolean {
    return this.left === null && this.right === null;
  }

  /**
   * Returns the number of children (0, 1, or 2)
   */
  getChildCount(): number {
    return (this.left ? 1 : 0) + (this.right ? 1 : 0);
  }
}

/**
 * Binary Tree implementation
 */
export class BinaryTree<T> {
  private root: Node<T> | null = null;
  private _size: number = 0;

  /**
   * Creates a new Binary Tree
   * @param rootData - Optional root node data
   * @param leftSubtree - Optional left subtree
   * @param rightSubtree - Optional right subtree
   */
  constructor(
    rootData?: T,
    leftSubtree?: BinaryTree<T> | null,
    rightSubtree?: BinaryTree<T> | null,
  ) {
    if (rootData !== undefined) {
      this.root = new Node(
        rootData,
        leftSubtree?.root || null,
        rightSubtree?.root || null,
      );
      this._size = 1 + (leftSubtree?.size || 0) + (rightSubtree?.size || 0);
    }
  }

  /**
   * Returns the number of nodes in the tree
   */
  get size(): number {
    return this._size;
  }

  /**
   * Returns true if the tree is empty
   */
  get isEmpty(): boolean {
    return this.root === null;
  }

  /**
   * Returns the height of the tree (-1 for empty tree)
   */
  get height(): number {
    return this.getHeight(this.root);
  }

  /**
   * Returns the root node data or null if empty
   */
  getRootData(): T | null {
    return this.root?.data || null;
  }

  /**
   * Sets the root data (creates root if empty)
   * @param data - The data to set as root
   */
  setRoot(data: T): void {
    if (this.root === null) {
      this.root = new Node(data);
      this._size = 1;
    } else {
      this.root.data = data;
    }
  }

  /**
   * Calculate height recursively
   */
  private getHeight(node: Node<T> | null): number {
    if (!node) return -1;
    return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }
}
