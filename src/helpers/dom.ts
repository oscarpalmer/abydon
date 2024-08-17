import {getString} from '@oscarpalmer/atoms/string';
import type {ProperNode} from '../models';
import {isFragment, isProperNode} from './index';

export function createNodes(value: unknown): ProperNode[] {
	if (isFragment(value)) {
		return value.get() as ProperNode[];
	}

	if (isProperNode(value)) {
		return [value];
	}

	return [new Text(getString(value))];
}

export function replaceNodes(from: ProperNode[], to: ProperNode[]): void {
	const {length} = from;

	for (let index = 0; index < length; index += 1) {
		const node = from[index];

		if (index === 0) {
			node.replaceWith(...to);
		} else {
			node.remove();
		}
	}
}
