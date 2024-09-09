import type {Fragment} from '../fragment';
import type {ProperElement, ProperNode} from '../models';

export function compareOrder(
	first: unknown[],
	second: unknown[],
): 'added' | 'dissimilar' | 'removed' {
	const firstIsLarger = first.length > second.length;
	const from = firstIsLarger ? first : second;
	const to = firstIsLarger ? second : first;

	if (
		!from
			.filter(key => to.includes(key))
			.every((key, index) => to[index] === key)
	) {
		return 'dissimilar';
	}

	return firstIsLarger ? 'removed' : 'added';
}

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
