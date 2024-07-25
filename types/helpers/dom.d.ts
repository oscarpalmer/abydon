import type { FragmentNode } from '../models';
export declare function createNodes(value: unknown): FragmentNode[];
export declare function createTemplate(html: string): Node;
export declare function getNodes(node: Node): Node[];
export declare function replaceNodes(from: FragmentNode[], to: FragmentNode[]): void;
