import type {PlainObject} from '@oscarpalmer/atoms/models';
import {NAME_FRAGMENT, NAME_FRAGMENTS} from '../constants';
import type {Fragment} from '../fragment';
import type {Fragments} from '../fragments';

export function compareArrays(
	first: unknown[],
	second: unknown[],
): 'added' | 'dissimilar' | 'removed' {
	const firstIsLarger = first.length > second.length;
	const from = firstIsLarger ? first : second;
	const to = firstIsLarger ? second : first;

	if (!from.filter(key => to.includes(key)).every((key, index) => to[index] === key)) {
		return COMPARISON_DISSIMILAR;
	}

	return firstIsLarger ? COMPARISON_REMOVED : COMPARISON_ADDED;
}

export function isFragment(value: unknown): value is Fragment {
	return isNamed(value, NAME_FRAGMENT);
}

export function isFragments(value: unknown): value is Fragments {
	return isNamed(value, NAME_FRAGMENTS);
}

function isNamed(value: unknown, name: string): boolean {
	return (
		typeof value === 'object' &&
		value != null &&
		name in value &&
		(value as PlainObject)[name] === true
	);
}

const COMPARISON_ADDED = 'added';

const COMPARISON_DISSIMILAR = 'dissimilar';

const COMPARISON_REMOVED = 'removed';
