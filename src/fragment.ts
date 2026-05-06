import {isPlainObject} from '@oscarpalmer/atoms/is';
import {html} from '@oscarpalmer/toretto/html';
import {NAME_FRAGMENT, PROPERTY_IDENTIFIER} from './constants';
import {handleFragments} from './fragments';
import {isFragments} from './helpers';
import {removeNodes} from './helpers/dom';
import type {FragmentConfiguration, FragmentData} from './models';
import {mapNodes} from './node';
import {parse} from './parse';

export class Fragment {
	readonly #data: FragmentData;

	readonly #configuration: Required<FragmentConfiguration> = {
		identifier: undefined,
		cache: true,
	};

	/**
	 * Is template caching enabled?
	 */
	get cache(): boolean {
		return this.#configuration.cache;
	}

	/**
	 * Identifier for the _Fragment_
	 *
	 * _An identifier can be used to uniquely identify a Fragment, which helps prevent re-rendering in reactive arrays and Fragments_
	 */
	get identifier(): unknown {
		return this.#configuration.identifier;
	}

	constructor(strings: TemplateStringsArray, expressions: unknown[]) {
		Object.defineProperty(this, NAME_FRAGMENT, {
			value: true,
		});

		this.#data = {
			expressions,
			strings,
			items: [],
			mora: {
				subscribers: new Set(),
				values: new Set(),
			},
			values: [],
		};
	}

	/**
	 * Insert the _Fragment_ after the given element
	 * @param element Element to insert after
	 */
	after(element: Element): void {
		element.after(...this.get());
	}

	/**
	 * Append the _Fragment_ to the given element
	 * @param element Element to append to
	 */
	appendTo(element: Element): void {
		element.append(...this.get());
	}

	/**
	 * Insert the _Fragment_ before the given element
	 * @param element Element to insert before
	 */
	before(element: Element): void {
		element.before(...this.get());
	}

	/**
	 * Configure the _Fragment_
	 *
	 * _Returns the Fragment instance for chaining_
	 * @param configuration Configuration options
	 * @returns _Fragment_
	 */
	configure(configuration: FragmentConfiguration): Fragment {
		const actual = isPlainObject(configuration) ? configuration : {};

		if (PROPERTY_IDENTIFIER in actual) {
			this.#configuration.identifier = actual.identifier;
		}

		if (typeof actual.cache === 'boolean') {
			this.#configuration.cache = actual.cache;
		}

		return this;
	}

	/**
	 * Get a list of the _Fragment_'s nodes
	 * @returns List of nodes
	 */
	get(): ChildNode[] {
		const data = this.#data;

		if (data.items.length === 0) {
			const parsed = parse(data);

			const templated = html(parsed, {
				cache: this.#configuration.cache,
			});

			data.items.splice(
				0,
				data.items.length,
				...templated.map(node => ({
					nodes: [node as ChildNode],
				})),
			);

			mapNodes(
				data,
				data.items.flatMap(item => item.nodes!),
			);
		}

		return data.items.flatMap(
			item => item.fragments?.flatMap(fragment => fragment.get()) ?? item.nodes!,
		);
	}

	/**
	 * Prepend the _Fragment_ to the given element
	 * @param element Element to prepend to
	 */
	prependTo(element: Element): void {
		element.prepend(...this.get());
	}

	/**
	 * Remove the _Fragment_ _(and all its descendants)_ from the _DOM_
	 *
	 * - _Any events, reactive values, and Fragments will also be cleaned up and removed_
	 * - _After being removed, the Fragment can be re-inserted into the DOM_
	 */
	remove(): void {
		removeFragment(this.#data);
	}
}

function removeFragment(data: FragmentData): void {
	removeMora(data);

	let {length} = data.items;

	for (let index = 0; index < length; index += 1) {
		const {fragments, nodes} = data.items[index];
		const fragmentsLength = fragments?.length ?? 0;

		for (let fragmentIndex = 0; fragmentIndex < fragmentsLength; fragmentIndex += 1) {
			fragments?.[fragmentIndex]?.remove();
		}

		removeNodes(nodes!);
	}

	data.items.length = 0;

	length = data.values.length;

	for (let index = 0; index < length; index += 1) {
		const value = data.values[index];

		if (isFragments(value)) {
			handleFragments(value, true);
		}
	}
}

function removeMora(data: FragmentData): void {
	const unsubscribers = [...data.mora.subscribers];

	data.mora.subscribers.clear();
	data.mora.values.clear();

	for (const unsubscribe of unsubscribers) {
		unsubscribe();
	}
}
