import {getString} from '@oscarpalmer/atoms/string';
import type {ProperNode} from '../models';
import {isFragment, isProperElement, isProperNode} from './index';
import {removeEvents} from '../node/event';

export function createNodes(value: unknown): ProperNode[] {
	if (isFragment(value)) {
		return value.get() as ProperNode[];
	}

	if (isProperNode(value)) {
		return [value];
	}

	return [new Text(getString(value))];
}

export function removeNodes(nodes: ProperNode[]): void {
	sanitiseNodes(nodes);

	const {length} = nodes;

	for (let index = 0; index < length; index += 1) {
		nodes[index].remove();
	}
}

export function replaceNodes(from: ProperNode[], to: ProperNode[]): void {
	from[0]?.replaceWith(...to);

	const {length} = from;

	for (let index = 1; index < length; index += 1) {
		from[index].remove();
	}
}

function sanitiseNodes(nodes: ProperNode[]): void {
	const {length} = nodes;

	for (let index = 0; index < length; index += 1) {
		const node = nodes[index];

		if (isProperElement(node)) {
			removeEvents(node);
		}

		if (node.hasChildNodes()) {
			sanitiseNodes([...node.childNodes] as ProperNode[]);
		}
	}
}
