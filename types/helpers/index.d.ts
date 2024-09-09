import type { Fragment } from '../fragment';
import type { HTMLOrSVGElement } from '../models';
export declare function compareArrays(first: unknown[], second: unknown[]): 'added' | 'dissimilar' | 'removed';
export declare function isChildNode(value: unknown): value is ChildNode;
export declare function isFragment(value: unknown): value is Fragment;
export declare function isHTMLOrSVGElement(value: unknown): value is HTMLOrSVGElement;
