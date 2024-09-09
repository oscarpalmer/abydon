import type { Fragment } from '../fragment';
import type { ProperElement, ProperNode } from '../models';
export declare function compareArrays(first: unknown[], second: unknown[]): 'added' | 'dissimilar' | 'removed';
export declare function isFragment(value: unknown): value is Fragment;
export declare function isProperElement(value: unknown): value is ProperElement;
export declare function isProperNode(value: unknown): value is ProperNode;
