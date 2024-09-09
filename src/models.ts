import type {Key} from '@oscarpalmer/atoms/models';
import type {Fragment} from './fragment';

export type FragmentData = {
	expressions: unknown[];
	identifier?: Key;
	items: FragmentItem[];
	strings: TemplateStringsArray;
	values: unknown[];
};

export type FragmentItem = {
	fragments?: Fragment[];
	nodes: ProperNode[];
};

export type ProperElement = HTMLElement | SVGElement;

export type ProperNode = CharacterData | Element;
