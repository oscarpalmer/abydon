import {getString} from '@oscarpalmer/atoms/string';
import type {FragmentNode} from '../models';
import {isFragment, isFragmentNode} from './index';

export function createNodes(value: unknown): FragmentNode[] {
	if (isFragmentNode(value)) {
		return [value];
	}

	if (isFragment(value)) {
		return value.get();
	}

	return [new Text(getString(value))];
}

export function createTemplate(html: string): Node {
	const template = document.createElement('template');

	template.innerHTML = html;

	const cloned = template.content.cloneNode(true);

	const scripts = [
		...(cloned instanceof Element ? cloned.querySelectorAll('script') : []),
	];

	const {length} = scripts;

	for (let index = 0; index < length; index += 1) {
		scripts[index].remove();
	}

	cloned.normalize();

	return cloned;
}

export function getNodes(node: Node): Node[] {
	return /^documentfragment$/i.test(node.constructor.name)
		? [...node.childNodes]
		: [node];
}

export function replaceNodes(from: FragmentNode[], to: FragmentNode[]): void {
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
