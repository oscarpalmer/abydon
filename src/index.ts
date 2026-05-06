import '@oscarpalmer/mora';
import {isArray, type ReactiveArray} from '@oscarpalmer/mora';
import {Fragment} from './fragment';
import {Fragments} from './fragments';

/**
 * Create a _Fragments_ instance from a reactive array
 * 
 * _A Fragments instance can be used to efficiently render a list of items that may change over time, using unique identifiers to track each item, only adding, removing, or updating each related Fragment._
 *
 * @example
 * ```ts
 * const fruits = array(['Apple', 'Banana', 'Cherry']);
 * const items = fragments(
 *   fruits,
 *   fruit => fruit,                           // Identifies a unique item
 *   fruit => html`<p>${fruit}</p>`,           // Creates a Fragment from an item
 * );
 * html`${items}`.appendTo(document.body)      // Renders '<p>Apple</p><p>Banana</p><p>Cherry</p>'
 * fruits.push(['Date', 'Elderberry', 'Fig']); // Appends '<p>Date</p><p>Elderberry</p><p>Fig</p>'
 *                                             // without re-rendering the existing Fragments
 * ```
 *
 * @param array Reactive array
 * @param identify Function to identify item uniquely _(non-nullable)_
 * @param fragment Function to create _Fragment_ from item
 * @returns _Fragments_
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
 * Create a _Fragment_ from a template
 * 
 * _A Fragment can be used to efficiently render a template that may change over time, only updating the necessary parts of the DOM._
 *
 * @example
 * ```ts
 * const name = signal('World');
 * const fragment = html`<p>Hello, ${name}!</p>`;
 * fragment.appendTo(document.body);              // Renders '<p>Hello, World!</p>'
 * name.set('Alice');                             // Replaces 'World' with 'Alice'
 * ```
 *
 * @returns _Fragment_
 */
export function html(template: TemplateStringsArray, ...values: unknown[]): Fragment {
	return new Fragment(template, values);
}

export * from '@oscarpalmer/mora';
export type {Fragment} from './fragment';
export type {Fragments} from './fragments';
export {isFragment, isFragments} from './helpers';
