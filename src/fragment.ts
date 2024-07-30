import {createTemplate, getNodes} from './helpers/dom';
import {parse} from './html';
import type {FragmentData} from './models';
import {mapNodes} from './node';

export class Fragment {
	private declare readonly $fragment = true;
	private readonly data: FragmentData;

	constructor(strings: TemplateStringsArray, expressions: unknown[]) {
		this.data = {
			expressions,
			strings,
			nodes: [],
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
		if (this.data.nodes.length === 0) {
			const parsed = parse(this.data);
			const templated = createTemplate(parsed);

			this.data.nodes.splice(0, this.data.nodes.length, ...getNodes(templated));

			mapNodes(this.data, this.data.nodes);
		}

		return [...this.data.nodes];
	}

	/**
	 * Removes the fragment from the DOM
	 */
	remove(): void {
		const {length} = this.data.nodes;

		for (let index = 0; index < length; index += 1) {
			const node = this.data.nodes[index];

			node.parentNode?.removeChild(node);
		}

		this.data.nodes.splice(0, length);
	}
}
