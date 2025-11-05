import {isPlainObject} from '@oscarpalmer/atoms/is';
import {html} from '@oscarpalmer/toretto/html';
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
		ignoreCache: false,
	};

	/**
	 * Fragment identifier
	 */
	get identifier(): unknown {
		return this.#configuration.identifier;
	}

	constructor(strings: TemplateStringsArray, expressions: unknown[]) {
		Object.defineProperty(this, '$fragment', {
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
	 * Append the fragment to the given element
	 * @param element Element to append to
	 */
	appendTo(element: Element): void {
		element.append(...this.get());
	}

	/**
	 * Configure the fragment
	 * @param configuration Configuration options
	 * @returns Fragment
	 */
	configure(configuration: FragmentConfiguration): Fragment {
		const actual = isPlainObject(configuration) ? configuration : {};

		if (actual.identifier !== undefined) {
			this.#configuration.identifier = actual.identifier;
		}

		if (typeof actual.ignoreCache === 'boolean') {
			this.#configuration.ignoreCache = actual.ignoreCache;
		}

		return this;
	}

	/**
	 * Get a list of the fragment's nodes
	 * @returns List of nodes
	 */
	get(): ChildNode[] {
		const data = this.#data;

		if (data.items.length === 0) {
			const parsed = parse(data);

			const templated = html(parsed, {
				ignoreCache: this.#configuration.ignoreCache,
				sanitizeBooleanAttributes: false,
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
				data.items.flatMap(
					item =>
						item.fragments?.flatMap(fragment => fragment.get()) ??
						item.nodes ??
						[],
				),
			);
		}

		return [
			...data.items.flatMap(
				item =>
					item.fragments?.flatMap(fragment => fragment.get()) ??
					item.nodes ??
					[],
			),
		];
	}

	/**
	 * Set an identifier for the fragment
	 *
	 * _An identifier can be used to uniquely identify a fragment,
	 * which helps prevent re-rendering in certain scenarios._
	 * @param identifier Identifier
	 * @returns Fragment
	 */
	identify(identifier: unknown): Fragment {
		this.#configuration.identifier = identifier;

		return this;
	}

	/**
	 * Remove the fragment from the DOM
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

		for (
			let fragmentIndex = 0;
			fragmentIndex < fragmentsLength;
			fragmentIndex += 1
		) {
			fragments?.[fragmentIndex]?.remove();
		}

		removeNodes(nodes ?? []);
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
