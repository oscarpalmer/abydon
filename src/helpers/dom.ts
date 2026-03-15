import {getString} from '@oscarpalmer/atoms/string';
import {isChildNode} from '@oscarpalmer/toretto/is';
import {isFragment} from './index';

export function createNodes(value: unknown): ChildNode[] {
	if (isFragment(value)) {
		return value.get() as ChildNode[];
	}

	if (isChildNode(value)) {
		return [value];
	}

	return [new Text(getString(value))];
}

export function isInputElement(node: Node): node is HTMLInputElement | HTMLSelectElement {
	return node instanceof HTMLInputElement || node instanceof HTMLSelectElement;
}

export function removeNodes(nodes: ChildNode[]): void {
	const {length} = nodes;

	for (let index = 0; index < length; index += 1) {
		nodes[index].remove();
	}
}

export function replaceNodes(from: ChildNode[], to: ChildNode[]): void {
	from[0]?.replaceWith(...to);

	const {length} = from;

	for (let index = 1; index < length; index += 1) {
		from[index].remove();
	}
}
