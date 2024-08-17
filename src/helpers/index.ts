import type {Fragment} from '../fragment';
import type {ProperElement, ProperNode} from '../models';

export function isFragment(value: unknown): value is Fragment {
	return (
		typeof value === 'object' &&
		value != null &&
		'$fragment' in value &&
		value.$fragment === true
	);
}

export function isProperElement(value: unknown): value is ProperElement {
	return value instanceof HTMLElement || value instanceof SVGElement;
}

export function isProperNode(value: unknown): value is ProperNode {
	return value instanceof CharacterData || value instanceof Element;
}
