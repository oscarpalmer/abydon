import {createTemplate, getNodes} from './helpers/dom';
import {parse} from './html';

export type Fragment = {
	append(parent: Node): void;
};

export type FragmentData = {
	expressions: unknown[];
	nodes: Node[];
	strings: TemplateStringsArray;
};

export function createFragment(
	strings: TemplateStringsArray,
	expressions: unknown[],
): Fragment {
	const data: FragmentData = {
		expressions,
		strings,
		nodes: [],
	};

	const instance = Object.create({
		append(parent: ParentNode) {
			if (data.nodes.length > 0) {
				return parent.append(...data.nodes);
			}

			const parsed = parse(data);
			const templated = createTemplate(parsed);

			data.nodes.splice(0, data.nodes.length, ...getNodes(templated));

			parent.append(...data.nodes);
		},
	});

	return instance;
}
