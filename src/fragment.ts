import {html} from '@oscarpalmer/toretto/html';
import {parse} from './html';
import type {FragmentData, ProperNode} from './models';
import {mapNodes} from './node';

export class Fragment {
	private readonly $fragment = true;
	private readonly data: FragmentData;

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
	get(): Node[] {
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
					item => item.fragment?.get() ?? item.nodes,
				) as ProperNode[],
			);
		}

		return [
			...(this.data.items.flatMap(
				item => item.fragment?.get() ?? item.nodes,
			) as ProperNode[]),
		];
	}

	/**
	 * Removes the fragment from the DOM
	 */
	remove(): void {
		const {length} = this.data.items;

		for (let index = 0; index < length; index += 1) {
			const item = this.data.items[index];

			item.fragment?.remove();

			for (const node of item.nodes) {
				node.remove();
			}
		}

		this.data.items.splice(0, length);
	}
}
