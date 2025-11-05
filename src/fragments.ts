import {getString} from '@oscarpalmer/atoms/string';
import {array, type ReactiveArray} from '@oscarpalmer/mora';
import type {Fragment} from './fragment';
import {isFragment, isFragments} from './helpers';
import type {FragmentsState} from './models';

export class Fragments {
	readonly #state: FragmentsState;

	/**
	 * Fragment items
	 */
	get items(): ReactiveArray<Fragment> {
		return this.#state.mapped;
	}

	constructor(
		items: ReactiveArray<unknown>,
		identify: (item: unknown) => unknown,
		fragment: (item: unknown) => Fragment,
	) {
		Object.defineProperty(this, '$fragments', {
			value: true,
		});

		this.#state = {
			fragment,
			identify,
			array: items,
			instances: {},
			mapped: array<Fragment>([]),
			subscriber: undefined,
		};

		states.set(this, this.#state);

		initializeFragments(this.#state);
	}
}

export function handleFragments(
	item: Fragments | FragmentsState,
	remove: boolean,
): void {
	const state = isFragments(item) ? states.get(item) : item;

	if (state != null) {
		(remove ? removeFragments : initializeFragments)(state);
	}
}

function handleItems(state: FragmentsState, items: unknown[]): void {
	const keys = new Set<string>();
	const mapped: Fragment[] = [];

	const {length} = items;

	for (let index = 0; index < length; index += 1) {
		const item = items[index];
		const identifier = state.identify(item);

		if (identifier == null) {
			throw new Error('Identifier cannot be null or undefined');
		}

		const key = getString(identifier);

		if (keys.has(key)) {
			throw new Error(`Duplicate identifier found: "${key}"`);
		}

		let instance = state.instances[key];

		if (instance == null) {
			instance = state.fragment(item);

			if (!isFragment(instance)) {
				throw new Error('Fragment function must return a Fragment instance');
			}
		}

		instance.identify(key);

		state.instances[key] = instance;

		keys.add(key);

		mapped.push(instance);
	}

	state.mapped.set(mapped);

	updateFragments(state, keys);
}

export function initializeFragments(state: FragmentsState): void {
	state.subscriber ??= state.array.subscribe(items => {
		handleItems(state, items);
	});
}

function removeFragments(state: FragmentsState): void {
	state.subscriber?.();

	updateFragments(state);

	state.subscriber = undefined;
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
		} else {
			previous[key].remove();
		}
	}

	state.instances = next;

	active?.clear();
}

//

const states: WeakMap<Fragments, FragmentsState> = new WeakMap();
