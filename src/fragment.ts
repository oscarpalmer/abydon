import type {Key} from '@oscarpalmer/atoms/models';
import {html} from '@oscarpalmer/toretto/html';
import {parse} from './html';
import type {FragmentData, ProperNode} from './models';
import {mapNodes} from './node';
import {removeNodes} from './helpers/dom';

export class Fragment {
	private readonly $fragment = true;
	private readonly data: FragmentData;

	get identifier(): Key | undefined {
		return this.data.identifier;
	}

	constructor(strings: TemplateStringsArray, expressions: unknown[]) {
		this.data = {
			expressions,
			strings,
			items: [],
			values: [],
		};
	}

	/**
	 * Appends the fragment to the given element
	 */
	appendTo(element: Element): void {
		element.append(...this.get());
	}

	/**
	 * Gets a list of the fragment's nodes
	 */
	get(): ProperNode[] {
		if (this.data.items.length === 0) {
			const parsed = parse(this.data);

			const templated = html(parsed, {
				sanitiseBooleanAttributes: false,
			});

			this.data.items.splice(
				0,
				this.data.items.length,
				...templated.map(node => ({
					nodes: [node as ProperNode],
				})),
			);

			mapNodes(
				this.data,
				this.data.items.flatMap(
					item =>
						item.fragments?.flatMap(fragment => fragment.get()) ?? item.nodes,
				),
			);
		}

		return [
			...this.data.items.flatMap(
				item =>
					item.fragments?.flatMap(fragment => fragment.get()) ?? item.nodes,
			),
		];
	}

	identify(identifier: Key): Fragment {
		this.data.identifier = identifier;

		return this;
	}

	/**
	 * Removes the fragment from the DOM
	 */
	remove(): void {
		const {length} = this.data.items;

		for (let index = 0; index < length; index += 1) {
			const {fragments, nodes} = this.data.items[index];
			const {length} = fragments ?? [];

			for (let index = 0; index < length; index += 1) {
				fragments?.[index]?.remove();
			}

			removeNodes(nodes);
		}

		this.data.items.splice(0, length);
	}
}
