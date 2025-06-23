import { describe, test, expect, beforeEach } from "bun:test";
import { BinarySearchTree } from "../src/BinarySearchTree";

describe("BinarySearchTree", () => {
  let tree: BinarySearchTree<number>;

  beforeEach(() => {
    tree = new BinarySearchTree<number>();
  });

  describe("Constructor and Basic Properties", () => {
    test("should create empty tree by default", () => {
      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.height).toBe(-1);
      expect(tree.getRootValue()).toBe(null);
    });

    test("should create tree with initial root value", () => {
      const treeWithRoot = new BinarySearchTree<number>(undefined, 10);
      expect(treeWithRoot.isEmpty).toBe(false);
      expect(treeWithRoot.size).toBe(1);
      expect(treeWithRoot.height).toBe(0);
      expect(treeWithRoot.getRootValue()).toBe(10);
    });

    test("should accept custom comparator", () => {
      const reverseTree = new BinarySearchTree<number>((a, b) => b - a);
      reverseTree.insert(5);
      reverseTree.insert(3);
      reverseTree.insert(7);

      const result = reverseTree.inOrderTraversal();
      expect(result).toEqual([7, 5, 3]); // Reverse order
    });
  });

  describe("Insertion", () => {
    test("should insert single value", () => {
      tree.insert(10);
      expect(tree.size).toBe(1);
      expect(tree.getRootValue()).toBe(10);
      expect(tree.isEmpty).toBe(false);
    });

    test("should insert multiple values maintaining BST property", () => {
      const values = [50, 25, 75, 10, 30, 60, 80];
      values.forEach((val) => tree.insert(val));

      expect(tree.size).toBe(values.length);
      expect(tree.isValidBST()).toBe(true);

      const sorted = tree.inOrderTraversal();
      expect(sorted).toEqual([10, 25, 30, 50, 60, 75, 80]);
    });

    test("should ignore duplicate values", () => {
      tree.insert(10);
      tree.insert(10);
      tree.insert(10);

      expect(tree.size).toBe(1);
      expect(tree.contains(10)).toBe(true);
    });

    test("should throw error for null/undefined values", () => {
      expect(() => tree.insert(null as any)).toThrow(
        "Cannot insert null or undefined value",
      );
      expect(() => tree.insert(undefined as any)).toThrow(
        "Cannot insert null or undefined value",
      );
    });

    test("should handle large number of insertions", () => {
      const values = Array.from({ length: 1000 }, (_, i) => i);
      // Shuffle to avoid worst-case insertion order
      for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
      }

      values.forEach((val) => tree.insert(val));
      expect(tree.size).toBe(1000);
      expect(tree.isValidBST()).toBe(true);
    });
  });

  describe("Batch Operations", () => {
    test("should insert batch of values", () => {
      const values = [50, 25, 75, 10, 30, 60, 80];
      tree.insertBatch(values);

      expect(tree.size).toBe(values.length);
      expect(tree.isValidBST()).toBe(true);

      const sorted = tree.inOrderTraversal();
      expect(sorted).toEqual([10, 25, 30, 50, 60, 75, 80]);
    });

    test("should handle empty batch", () => {
      tree.insertBatch([]);
      expect(tree.size).toBe(0);
      expect(tree.isEmpty).toBe(true);
    });

    test("should handle batch with duplicates", () => {
      const values = [50, 25, 75, 25, 50, 75];
      tree.insertBatch(values);

      expect(tree.size).toBe(3); // Only unique values
      expect(tree.isValidBST()).toBe(true);

      const sorted = tree.inOrderTraversal();
      expect(sorted).toEqual([25, 50, 75]);
    });
  });

  describe("Search Operations", () => {
    beforeEach(() => {
      tree.insertBatch([50, 25, 75, 10, 30, 60, 80]);
    });

    test("should find existing values", () => {
      expect(tree.search(50)).toBe(50);
      expect(tree.search(25)).toBe(25);
      expect(tree.search(80)).toBe(80);
    });

    test("should return null for non-existing values", () => {
      expect(tree.search(100)).toBe(null);
      expect(tree.search(-5)).toBe(null);
    });

    test("should handle search in empty tree", () => {
      const emptyTree = new BinarySearchTree<number>();
      expect(emptyTree.search(10)).toBe(null);
    });

    test("should return null for null/undefined search", () => {
      expect(tree.search(null as any)).toBe(null);
      expect(tree.search(undefined as any)).toBe(null);
    });
  });

  describe("Contains Operation", () => {
    beforeEach(() => {
      tree.insertBatch([50, 25, 75, 10, 30, 60, 80]);
    });

    test("should return true for existing values", () => {
      expect(tree.contains(50)).toBe(true);
      expect(tree.contains(10)).toBe(true);
      expect(tree.contains(80)).toBe(true);
    });

    test("should return false for non-existing values", () => {
      expect(tree.contains(100)).toBe(false);
      expect(tree.contains(-5)).toBe(false);
    });

    test("should return false for null/undefined values", () => {
      expect(tree.contains(null as any)).toBe(false);
      expect(tree.contains(undefined as any)).toBe(false);
    });
  });

  describe("Min/Max Operations", () => {
    test("should return null for empty tree", () => {
      expect(tree.findMin()).toBe(null);
      expect(tree.findMax()).toBe(null);
    });

    test("should find min and max in populated tree", () => {
      tree.insertBatch([50, 25, 75, 10, 30, 60, 80]);
      expect(tree.findMin()).toBe(10);
      expect(tree.findMax()).toBe(80);
    });

    test("should handle single node tree", () => {
      tree.insert(42);
      expect(tree.findMin()).toBe(42);
      expect(tree.findMax()).toBe(42);
    });

    test("should handle unbalanced tree", () => {
      // Insert in ascending order to create right-heavy tree
      tree.insertBatch([1, 2, 3, 4, 5]);
      expect(tree.findMin()).toBe(1);
      expect(tree.findMax()).toBe(5);
    });

    test("should handle reverse order tree", () => {
      // Insert in descending order to create left-heavy tree
      tree.insertBatch([5, 4, 3, 2, 1]);
      expect(tree.findMin()).toBe(1);
      expect(tree.findMax()).toBe(5);
    });
  });

  describe("Removal Operations", () => {
    beforeEach(() => {
      tree.insertBatch([50, 25, 75, 10, 30, 60, 80, 5, 15, 27, 35]);
    });

    test("should remove leaf nodes", () => {
      expect(tree.remove(5)).toBe(true);
      expect(tree.size).toBe(10);
      expect(tree.contains(5)).toBe(false);
      expect(tree.isValidBST()).toBe(true);
    });

    test("should remove nodes with one child", () => {
      expect(tree.remove(60)).toBe(true);
      expect(tree.size).toBe(10);
      expect(tree.contains(60)).toBe(false);
      expect(tree.isValidBST()).toBe(true);
    });

    test("should remove nodes with two children", () => {
      expect(tree.remove(25)).toBe(true);
      expect(tree.size).toBe(10);
      expect(tree.contains(25)).toBe(false);
      expect(tree.isValidBST()).toBe(true);

      // Verify all other nodes still exist
      [50, 75, 10, 30, 80, 5, 15, 27, 35].forEach((val) => {
        expect(tree.contains(val)).toBe(true);
      });
    });

    test("should remove root node", () => {
      expect(tree.remove(50)).toBe(true);
      expect(tree.size).toBe(10);
      expect(tree.contains(50)).toBe(false);
      expect(tree.isValidBST()).toBe(true);
    });

    test("should return false for non-existing values", () => {
      expect(tree.remove(100)).toBe(false);
      expect(tree.size).toBe(11); // Size unchanged
    });

    test("should handle removal from empty tree", () => {
      const emptyTree = new BinarySearchTree<number>();
      expect(emptyTree.remove(10)).toBe(false);
    });

    test("should handle removing all nodes", () => {
      const values = [50, 25, 75, 10, 30, 60, 80, 5, 15, 27, 35];
      values.forEach((val) => {
        expect(tree.remove(val)).toBe(true);
      });

      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
    });

    test("should handle removing single node tree", () => {
      const singleTree = new BinarySearchTree<number>();
      singleTree.insert(42);

      expect(singleTree.remove(42)).toBe(true);
      expect(singleTree.isEmpty).toBe(true);
      expect(singleTree.size).toBe(0);
      expect(singleTree.getRootValue()).toBe(null);
    });

    test("should handle null/undefined removal attempts", () => {
      expect(tree.remove(null as any)).toBe(false);
      expect(tree.remove(undefined as any)).toBe(false);
      expect(tree.size).toBe(11); // Size unchanged
    });
  });

  describe("Traversal Operations", () => {
    beforeEach(() => {
      tree.insertBatch([50, 25, 75, 10, 30, 60, 80]);
    });

    test("should perform in-order traversal", () => {
      const result = tree.inOrderTraversal();
      expect(result).toEqual([10, 25, 30, 50, 60, 75, 80]);
    });

    test("should convert to sorted array", () => {
      const result = tree.toArray();
      expect(result).toEqual([10, 25, 30, 50, 60, 75, 80]);
    });

    test("should handle empty tree traversal", () => {
      const emptyTree = new BinarySearchTree<number>();
      expect(emptyTree.inOrderTraversal()).toEqual([]);
      expect(emptyTree.toArray()).toEqual([]);
    });

    test("should handle single node tree traversal", () => {
      const singleTree = new BinarySearchTree<number>();
      singleTree.insert(42);

      expect(singleTree.inOrderTraversal()).toEqual([42]);
      expect(singleTree.toArray()).toEqual([42]);
    });

    test("should handle traversal after modifications", () => {
      tree.remove(25);
      tree.insert(35);

      const result = tree.inOrderTraversal();
      expect(result).toEqual([10, 30, 35, 50, 60, 75, 80]);
    });
  });

  describe("Clear Operation", () => {
    test("should clear all nodes", () => {
      tree.insertBatch([50, 25, 75, 10, 30, 60, 80]);
      expect(tree.size).toBe(7);

      tree.clear();
      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.height).toBe(-1);
      expect(tree.getRootValue()).toBe(null);
    });

    test("should handle clearing empty tree", () => {
      tree.clear();
      expect(tree.isEmpty).toBe(true);
      expect(tree.size).toBe(0);
      expect(tree.height).toBe(-1);
    });

    test("should allow operations after clear", () => {
      tree.insertBatch([50, 25, 75]);
      tree.clear();

      tree.insert(100);
      expect(tree.size).toBe(1);
      expect(tree.getRootValue()).toBe(100);
      expect(tree.contains(100)).toBe(true);
    });
  });

  describe("Height Calculations", () => {
    test("should calculate height correctly for balanced tree", () => {
      tree.insertBatch([50, 25, 75, 10, 30, 60, 80]);
      expect(tree.height).toBe(2);
    });

    test("should calculate height for single node", () => {
      tree.insert(50);
      expect(tree.height).toBe(0);
    });

    test("should handle height changes after removal", () => {
      tree.insertBatch([50, 25, 75, 10]);
      const initialHeight = tree.height;

      tree.remove(10);
      // Height should be recalculated after removal
      expect(tree.height).toBeLessThanOrEqual(initialHeight);
    });

    test("should handle unbalanced tree height", () => {
      // Create right-heavy tree
      tree.insertBatch([1, 2, 3, 4, 5]);
      expect(tree.height).toBe(4); // Linear chain
    });
  });

  describe("BST Validation", () => {
    test("should validate empty tree as valid BST", () => {
      expect(tree.isValidBST()).toBe(true);
    });

    test("should validate single node tree as valid BST", () => {
      tree.insert(50);
      expect(tree.isValidBST()).toBe(true);
    });

    test("should validate balanced tree as valid BST", () => {
      tree.insertBatch([50, 25, 75, 10, 30, 60, 80]);
      expect(tree.isValidBST()).toBe(true);
    });

    test("should validate tree after operations", () => {
      tree.insertBatch([50, 25, 75, 10, 30, 60, 80]);
      tree.remove(25);
      tree.insert(35);

      expect(tree.isValidBST()).toBe(true);
    });
  });

  describe("Custom Comparator Tests", () => {
    test("should work with string comparator", () => {
      const stringTree = new BinarySearchTree<string>();
      stringTree.insertBatch(["banana", "apple", "cherry", "apricot"]);

      const result = stringTree.inOrderTraversal();
      expect(result).toEqual(["apple", "apricot", "banana", "cherry"]);
    });

    test("should work with object comparator", () => {
      interface Person {
        name: string;
        age: number;
      }

      const personTree = new BinarySearchTree<Person>((a, b) => a.age - b.age);
      const people: Person[] = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
        { name: "Charlie", age: 35 },
      ];

      personTree.insertBatch(people);
      const result = personTree.inOrderTraversal();

      expect(result[0].age).toBe(25);
      expect(result[1].age).toBe(30);
      expect(result[2].age).toBe(35);
    });

    test("should work with date comparator", () => {
      const dateTree = new BinarySearchTree<Date>();
      const dates = [
        new Date("2023-01-01"),
        new Date("2022-12-31"),
        new Date("2023-01-02"),
      ];

      dateTree.insertBatch(dates);
      const result = dateTree.inOrderTraversal();

      expect(result[0].getTime()).toBe(new Date("2022-12-31").getTime());
      expect(result[1].getTime()).toBe(new Date("2023-01-01").getTime());
      expect(result[2].getTime()).toBe(new Date("2023-01-02").getTime());
    });

    test("should throw error for incomparable types without custom comparator", () => {
      const objectTree = new BinarySearchTree<{ value: number }>();

      expect(() => {
        objectTree.insert({ value: 1 });
        objectTree.insert({ value: 2 });
      }).toThrow();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle very large trees", () => {
      const size = 10000;
      const values = Array.from({ length: size }, (_, i) => i);

      // Shuffle for better balance
      for (let i = values.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
      }

      tree.insertBatch(values);
      expect(tree.size).toBe(size);
      expect(tree.isValidBST()).toBe(true);

      // Test some random searches
      for (let i = 0; i < 100; i++) {
        const randomValue = Math.floor(Math.random() * size);
        expect(tree.contains(randomValue)).toBe(true);
      }
    });

    test("should handle operations on tree with root value constructor", () => {
      const treeWithRoot = new BinarySearchTree<number>(undefined, 50);
      treeWithRoot.insertBatch([25, 75]);

      expect(treeWithRoot.size).toBe(3);
      expect(treeWithRoot.contains(50)).toBe(true);
      expect(treeWithRoot.remove(50)).toBe(true);
      expect(treeWithRoot.size).toBe(2);
      expect(treeWithRoot.isValidBST()).toBe(true);
    });

    test("should handle mixed null and value operations gracefully", () => {
      tree.insertBatch([1, 2, 3]);

      expect(tree.search(null as any)).toBe(null);
      expect(tree.contains(null as any)).toBe(false);
      expect(tree.remove(null as any)).toBe(false);

      expect(tree.size).toBe(3);
      expect(tree.isValidBST()).toBe(true);
    });
  });

  describe("Performance and Memory Tests", () => {
    test("should handle rapid insertions and deletions", () => {
      const values = Array.from({ length: 1000 }, (_, i) => i);

      // Insert all values
      tree.insertBatch(values);
      expect(tree.size).toBe(1000);

      // Remove every other value
      for (let i = 0; i < 1000; i += 2) {
        expect(tree.remove(i)).toBe(true);
      }

      expect(tree.size).toBe(500);
      expect(tree.isValidBST()).toBe(true);

      // Verify remaining values
      for (let i = 1; i < 1000; i += 2) {
        expect(tree.contains(i)).toBe(true);
      }
    });

    test("should maintain performance with alternating operations", () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        tree.insert(i);
        if (i % 3 === 0) {
          tree.remove(i / 2);
        }
        if (i % 5 === 0) {
          tree.search(i / 2);
        }
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in reasonable time
      expect(tree.isValidBST()).toBe(true);
    });
  });
});
