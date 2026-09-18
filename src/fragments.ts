import {getString} from '@oscarpalmer/atoms/string';
import {array, isReactiveArray, type ReactiveArray} from '@oscarpalmer/mora';
import {
	MESSAGE_FRAGMENTS_FRAGMENT_RESULT,
	MESSAGE_FRAGMENTS_FRAGMENT_TYPE,
	MESSAGE_FRAGMENTS_IDENTIFIER_RESULT_DUPLICATE,
	MESSAGE_FRAGMENTS_IDENTIFIER_RESULT_TYPE,
	MESSAGE_FRAGMENTS_IDENTIFIER_TYPE,
	MESSAGE_FRAGMENTS_VALUE,
	NAME_FRAGMENTS,
	SYMBOL,
	TEMPLATE_ITEM,
} from './constants';
import {isFragment} from './helpers';
import type {Fragment, Fragments, FragmentsState, InternalFragments} from './models';

// #region Instances

function Fragments(
	this: any,
	items: ReactiveArray<unknown>,
	identify: (item: unknown) => unknown,
	fragment: (item: unknown) => Fragment,
) {
	this[SYMBOL] = {
		fragment,
		identify,
		array: items,
		instances: {},
		mapped: array<Fragment>([]),
		name: NAME_FRAGMENTS,
		subscription: undefined,
	};

	initializeFragments.call(this);
}

Fragments.prototype.remove = removeFragments;

// #endregion

// #region Functions

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
	if (!isReactiveArray(array)) {
		throw new TypeError(MESSAGE_FRAGMENTS_VALUE);
	}

	if (typeof identify !== 'function') {
		throw new TypeError(MESSAGE_FRAGMENTS_IDENTIFIER_TYPE);
	}

	if (typeof fragment !== 'function') {
		throw new TypeError(MESSAGE_FRAGMENTS_FRAGMENT_TYPE);
	}

	// @ts-expect-error All good, no worries :-)
	return new Fragments(array as ReactiveArray<unknown>, identify as never, fragment as never);
}

export function handleFragments(instance: Fragments, remove: boolean): void {
	(remove ? removeFragments : initializeFragments).call(instance as InternalFragments);
}

function handleItems(state: FragmentsState, items: unknown[]): void {
	const keys = new Set<string>();
	const mapped: Fragment[] = [];

	const {length} = items;

	for (let index = 0; index < length; index += 1) {
		const item = items[index];
		const identifier = state.identify(item);

		if (identifier == null) {
			throw new TypeError(MESSAGE_FRAGMENTS_IDENTIFIER_RESULT_TYPE);
		}

		const key = getString(identifier);

		if (keys.has(key)) {
			throw new Error(MESSAGE_FRAGMENTS_IDENTIFIER_RESULT_DUPLICATE.replace(TEMPLATE_ITEM, key));
		}

		let instance = state.instances[key];

		if (instance == null) {
			instance = state.fragment(item);

			if (!isFragment(instance)) {
				throw new Error(MESSAGE_FRAGMENTS_FRAGMENT_RESULT);
			}
		}

		instance.configure({
			identifier: key,
		});

		state.instances[key] = instance;

		keys.add(key);

		mapped.push(instance);
	}

	state.mapped.set(mapped);

	updateFragments(state, keys);
}

function initializeFragments(this: InternalFragments): void {
	const state = this[SYMBOL];

	state.subscription ??= state.array.subscribe(items => {
		handleItems(state, items);
	});
}

function removeFragments(this: InternalFragments): void {
	const state = this[SYMBOL];

	state.subscription?.unsubscribe();

	state.mapped.set([]);

	updateFragments(state);

	state.subscription = undefined;
}

function updateFragments(state: FragmentsState, active?: Set<string>): void {
	const next: Record<string, Fragment> = {};

	const previous = {...state.instances};
	const keys = Object.keys(previous);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		if (active?.has(key)) {
			next[key] = previous[key];
		} else if (active == null) {
			previous[key].remove();
		}
	}

	state.instances = next;

	active?.clear();
}

// #endregion
