export type FragmentData = {
    expressions: unknown[];
    nodes: Node[];
    strings: TemplateStringsArray;
    values: unknown[];
};
export type FragmentElement = HTMLElement | SVGElement;
export type FragmentNode = Comment | Element | Text;
