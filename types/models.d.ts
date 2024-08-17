import type { Fragment } from './fragment';
export type FragmentData = {
    expressions: unknown[];
    items: FragmentItem[];
    strings: TemplateStringsArray;
    values: unknown[];
};
export type FragmentItem = {
    fragment?: Fragment;
    nodes: ProperNode[];
};
export type ProperElement = HTMLElement | SVGElement;
export type ProperNode = CharacterData | Element;
