import {createTemplate, getNodes} from './helpers/dom';
import {getFragment, parse} from './html';
import {mapNodes} from './node';

export type Fragment = {
	get(): DocumentFragment;
	remove(): void;
};

export type FragmentData = {
	expressions: unknown[];
	nodes: Node[];
	strings: TemplateStringsArray;
	values: unknown[];
};

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
		get(): Node {
			if (data.nodes.length === 0) {
				const parsed = parse(data);
				const templated = createTemplate(parsed);

				data.nodes.splice(0, data.nodes.length, ...getNodes(templated));

				mapNodes(data, data.nodes);
			}

			return getFragment(data.nodes);
		},
		remove(): void {
			const {length} = data.nodes;

			for (let index = 0; index < length; index += 1) {
				const node = data.nodes[index];

				node.parentNode?.removeChild(node);
			}

			data.nodes.splice(0, data.nodes.length);
		},
	});

	Object.defineProperty(instance, '$fragment', {
		value: true,
	});

	return instance;
}

export function isFragment(value: unknown): value is Fragment {
	return (
		typeof value === 'object' &&
		value != null &&
		'$fragment' in value &&
		value.$fragment === true
	);
}
