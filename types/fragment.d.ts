import type { Key } from '@oscarpalmer/atoms/models';
import type { ProperNode } from './models';
export declare class Fragment {
    private readonly $fragment;
    private readonly data;
    get identifier(): Key | undefined;
    constructor(strings: TemplateStringsArray, expressions: unknown[]);
    /**
     * Appends the fragment to the given element
     */
    appendTo(element: Element): void;
    /**
     * Gets a list of the fragment's nodes
     */
    get(): ProperNode[];
    identify(identifier: Key): Fragment;
    /**
     * Removes the fragment from the DOM
     */
    remove(): void;
}
