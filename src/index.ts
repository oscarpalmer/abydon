import '@oscarpalmer/mora';
import {isArray, type ReactiveArray} from '@oscarpalmer/mora';
import {Fragment} from './fragment';
import {Fragments} from './fragments';

/**
 * Create a Fragments from a reactive array
 * @param array Reactive array
 * @param identify Function to identify item
 * @param fragment Function to create fragment from item
 * @returns Fragments
 */
export function fragments<Item>(
	array: ReactiveArray<Item>,
	identify: (item: Item) => unknown,
	fragment: (item: Item) => Fragment,
): Fragments {
	if (!isArray(array)) {
		throw new TypeError('Fragments array must be a reactive array');
	}

	if (typeof identify !== 'function') {
		throw new TypeError('Fragments identify must be a function');
	}

	if (typeof fragment !== 'function') {
		throw new TypeError('Fragments fragment must be a function');
	}

	return new Fragments(array as ReactiveArray<unknown>, identify as never, fragment as never);
}

/**
 * Create a Fragment from a template
 * @returns Fragment
 */
export function html(template: TemplateStringsArray, ...values: unknown[]): Fragment {
	return new Fragment(template, values);
}

export * from '@oscarpalmer/mora';
export type {Fragment} from './fragment';
export type {Fragments} from './fragments';
export {isFragment, isFragments} from './helpers';
