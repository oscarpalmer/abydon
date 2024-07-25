import {createTemplate, getNodes} from './helpers/dom';
import {parse} from './html';
import type {Fragment, FragmentData} from './models';
import {mapNodes} from './node';

export function createFragment(
	strings: TemplateStringsArray,
	expressions: unknown[],
): Fragment {
	const data: FragmentData = {
		expressions,
		strings,
		nodes: [],
		values: [],
	};

	const instance = Object.create({
		appendTo(element: Element) {
			element.append(...this.get());
		},
		get() {
			if (data.nodes.length === 0) {
				const parsed = parse(data);
				const templated = createTemplate(parsed);

				data.nodes.splice(0, data.nodes.length, ...getNodes(templated));

				mapNodes(data, data.nodes);
			}

			return [...data.nodes];
		},
		remove() {
			const {length} = data.nodes;

			for (let index = 0; index < length; index += 1) {
				const node = data.nodes[index];

				node.parentNode?.removeChild(node);
			}

			data.nodes.splice(0, data.nodes.length);
		},
	} as Fragment);

	Object.defineProperty(instance, '$fragment', {
		value: true,
	});

	return instance;
}
