import type {Fragment} from '../fragment';
import type {HTMLOrSVGElement} from '../models';

export function compareArrays(
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

export function isChildNode(value: unknown): value is ChildNode {
	return value instanceof CharacterData || value instanceof Element;
}

export function isFragment(value: unknown): value is Fragment {
	return (
		typeof value === 'object' &&
		value != null &&
		'$fragment' in value &&
		value.$fragment === true
	);
}

export function isHTMLOrSVGElement(value: unknown): value is HTMLOrSVGElement {
	return value instanceof HTMLElement || value instanceof SVGElement;
}
