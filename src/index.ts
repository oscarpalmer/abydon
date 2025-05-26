import '@oscarpalmer/mora';
import {Fragment} from './fragment';

export function html(
	strings: TemplateStringsArray,
	...values: unknown[]
): Fragment {
	return new Fragment(strings, values);
}

export type {Fragment} from './fragment';
export * from '@oscarpalmer/mora';
