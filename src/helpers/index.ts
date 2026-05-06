import type {GenericCallback, PlainObject} from '@oscarpalmer/atoms/models';
import {computed, type Computed} from '@oscarpalmer/mora';
import {
	ARRAY_COMPARISON_ADDED,
	ARRAY_COMPARISON_DISSIMILAR,
	ARRAY_COMPARISON_REMOVED,
	NAME_FRAGMENT,
	NAME_FRAGMENTS,
} from '../constants';
import type {Fragment} from '../fragment';
import type {Fragments} from '../fragments';
import type {FragmentData} from '../models';

export function compareArrays(
	first: unknown[],
	second: unknown[],
):
	| typeof ARRAY_COMPARISON_ADDED
	| typeof ARRAY_COMPARISON_DISSIMILAR
	| typeof ARRAY_COMPARISON_REMOVED {
	const firstIsLarger = first.length > second.length;
	const from = firstIsLarger ? first : second;
	const to = firstIsLarger ? second : first;

	if (!from.filter(key => to.includes(key)).every((key, index) => to[index] === key)) {
		return ARRAY_COMPARISON_DISSIMILAR;
	}

	return firstIsLarger ? ARRAY_COMPARISON_REMOVED : ARRAY_COMPARISON_ADDED;
}

/**
 * Is the value a _Fragment_?
 * @param value Value to check
 * @returns `true` if the value is a _Fragment_, otherwise `false`
 */
export function isFragment(value: unknown): value is Fragment {
	return isNamed(value, NAME_FRAGMENT);
}

/**
 * Is the value a _Fragments_ instance?
 * @param value Value to check
 * @returns `true` if the value is a _Fragments_ instance, otherwise `false`
 */
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

export function setComputedValue(
	data: FragmentData,
	callback: GenericCallback,
	after: (computation: Computed<unknown>) => void,
): void {
	const computation = computed(callback);

	data.mora.values.add(computation);

	after(computation);
}
