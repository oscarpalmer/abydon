import {html} from '@oscarpalmer/toretto/html';
import {removeNodes} from './helpers/dom';
import type {FragmentConfiguration, FragmentData} from './models';
import {mapNodes} from './node';
import {parse} from './parse';
import { isPlainObject } from '@oscarpalmer/atoms';

export class Fragment {
	readonly #data: FragmentData;

	readonly #configuration: Required<FragmentConfiguration> = {
		identifier: undefined,
		ignoreCache: false,
	}

	get identifier(): unknown {
		return this.#configuration.identifier;
	}

	constructor(strings: TemplateStringsArray, expressions: unknown[]) {
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

		Object.defineProperty(this, '$fragment', {
			value: true,
		});
	}

	/**
	 * Appends the fragment to the given element
	 */
	appendTo(element: Element): void {
		element.append(...this.get());
	}

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
	 * Gets a list of the fragment's nodes
	 */
	get(): ChildNode[] {
		const data = this.#data;

		if (data.items.length === 0) {
			const parsed = parse(data);

			const templated = html(parsed, {
				sanitizeBooleanAttributes: false,
			});

			if (this.#configuration.ignoreCache) {
				html.remove(parsed);
			}

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
						item.fragments?.flatMap(fragment => fragment.get()) ?? item.nodes ?? [],
				),
			);
		}

		return [
			...data.items.flatMap(
				item =>
					item.fragments?.flatMap(fragment => fragment.get()) ?? item.nodes ?? [],
			),
		];
	}

	identify(identifier: unknown): Fragment {
		this.#configuration.identifier = identifier;

		return this;
	}

	/**
	 * Removes the fragment from the DOM
	 */
	remove(): void {
		removeFragment(this.#data);
	}
}

function removeFragment(data: FragmentData): void {
	removeMora(data);

	const {length} = data.items;

	for (let index = 0; index < length; index += 1) {
		const {fragments, nodes} = data.items[index];
		const length = fragments?.length ?? 0;

		for (let index = 0; index < length; index += 1) {
			fragments?.[index]?.remove();
		}

		removeNodes(nodes ?? []);
	}

	data.items.length = 0;
}

function removeMora(data: FragmentData): void {
	const unsubscribers = [...data.mora.subscribers];

	data.mora.subscribers.clear();
	data.mora.values.clear();

	for (const unsubscribe of unsubscribers) {
		unsubscribe();
	}
}
