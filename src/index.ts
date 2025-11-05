import '@oscarpalmer/mora';
import type {ReactiveArray} from '@oscarpalmer/mora';
import {Fragment} from './fragment';
import {Fragments} from './fragments';

export function fragments<Item>(
	array: ReactiveArray<Item>,
	identify: (item: Item) => unknown,
	fragment: (item: Item) => Fragment,
): Fragments {
	return new Fragments(
		array as ReactiveArray<unknown>,
		identify as never,
		fragment as never,
	);
}

export function html(
	strings: TemplateStringsArray,
	...values: unknown[]
): unknown {
	return new Fragment(strings, values);
}

export * from '@oscarpalmer/mora';
export type {Fragment} from './fragment';
export type {Fragments} from './fragments';
