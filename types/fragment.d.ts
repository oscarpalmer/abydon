export type Fragment = {
    append(parent: Node): void;
};
export type FragmentData = {
    expressions: unknown[];
    nodes: Node[];
    strings: TemplateStringsArray;
};
export declare function createFragment(strings: TemplateStringsArray, expressions: unknown[]): Fragment;
