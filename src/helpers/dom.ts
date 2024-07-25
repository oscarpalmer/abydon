import {getString} from '@oscarpalmer/atoms/string';
import {isFragment} from '../fragment';

export function createNode(value: unknown): Node {
	if (value instanceof Node) {
		return value;
	}

	if (isFragment(value)) {
		return value.get();
	}

	return new Text(getString(value));
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
