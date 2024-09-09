import type { Key } from '@oscarpalmer/atoms/models';
import type { Effect, Reactive } from '@oscarpalmer/sentinel';
import type { Fragment } from './fragment';
export type FragmentData = {
    expressions: unknown[];
    identifier?: Key;
    items: FragmentItem[];
    sentinel: FragmentDataSentinel;
    strings: TemplateStringsArray;
    values: unknown[];
};
type FragmentDataSentinel = {
    effects: Set<Effect>;
    values: Set<Reactive>;
};
export type FragmentItem = {
    fragments?: Fragment[];
    nodes: ChildNode[];
};
export type HTMLOrSVGElement = HTMLElement | SVGElement;
export {};
