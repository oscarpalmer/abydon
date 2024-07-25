export type Fragment = {
    get(): DocumentFragment;
    remove(): void;
};
export type FragmentData = {
    expressions: unknown[];
    nodes: Node[];
    strings: TemplateStringsArray;
    values: unknown[];
};
export declare function createFragment(strings: TemplateStringsArray, expressions: unknown[]): Fragment;
export declare function isFragment(value: unknown): value is Fragment;
