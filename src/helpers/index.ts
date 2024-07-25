import type {Fragment, FragmentElement, FragmentNode} from '../models';

export function isFragment(value: unknown): value is Fragment {
	return (
		typeof value === 'object' &&
		value != null &&
		'$fragment' in value &&
		value.$fragment === true
	);
}

export function isFragmentElement(value: unknown): value is FragmentElement {
	return value instanceof HTMLElement || value instanceof SVGElement;
}

export function isFragmentNode(value: unknown): value is FragmentNode {
	return (
		value instanceof Comment ||
		value instanceof Element ||
		value instanceof Text
	);
}
