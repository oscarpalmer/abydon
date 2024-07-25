import { type Fragment, type FragmentData } from './fragment';
export declare function getFragment(nodes: Node[]): DocumentFragment;
export declare function html(strings: TemplateStringsArray, ...values: unknown[]): Fragment;
export declare function parse(data: FragmentData): string;
