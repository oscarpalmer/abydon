import type { ProperNode } from './models';
export declare class Fragment {
    private readonly $fragment;
    private readonly data;
    constructor(strings: TemplateStringsArray, expressions: unknown[]);
    /**
     * Appends the fragment to the given element
     */
    appendTo(element: Element): void;
    /**
     * Gets a list of the fragment's nodes
     */
    get(): ProperNode[];
    /**
     * Removes the fragment from the DOM
     */
    remove(): void;
}
