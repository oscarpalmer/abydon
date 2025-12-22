import '@oscarpalmer/mora';
import type {ReactiveArray} from '@oscarpalmer/mora';
import {Fragment} from './fragment';
import {Fragments} from './fragments';

/**
 * Create Fragments from a reactive array
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
	return new Fragments(array as ReactiveArray<unknown>, identify as never, fragment as never);
}

/**
 * Create Fragment from a template
 * @returns Fragment
 */
export function html(template: TemplateStringsArray, ...values: unknown[]): Fragment {
	return new Fragment(template, values);
}

export * from '@oscarpalmer/mora';
export type {Fragment} from './fragment';
export type {Fragments} from './fragments';
