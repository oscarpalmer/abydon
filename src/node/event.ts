import type {FragmentElement} from '../models';

export function mapEvent(
	element: FragmentElement,
	name: string,
	value: unknown,
): void {
	element.removeAttribute(name);

	if (typeof value !== 'function') {
		return;
	}

	// TODO
}