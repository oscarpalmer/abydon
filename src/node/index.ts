import {getString} from '@oscarpalmer/atoms/string';
import {isReactive, type Reactive} from '@oscarpalmer/sentinel';
import {type FragmentData, isFragment} from '../fragment';

const commentExpression = /^abydon\.(\d+)$/;

function mapNode(data: FragmentData, comment: Comment): void {
	const matches = commentExpression.exec(comment.textContent ?? '');
	const value = matches == null ? null : data.values[+matches[1]];

	if (value != null) {
		mapValue(comment, value);
	}
}

export function mapNodes(data: FragmentData, nodes: Node[]): void {
	const {length} = nodes;

	for (let index = 0; index < length; index += 1) {
		const node = nodes[index];

		if (node instanceof Comment) {
			mapNode(data, node);

			continue;
		}

		if (node instanceof Element) {
			// Attributes
		}

		if (node.hasChildNodes()) {
			mapNodes(data, [...node.childNodes]);
		}
	}
}

function mapReactive(comment: Comment, value: Reactive): void {
	// ?
}

function mapValue(comment: Comment, value: unknown): void {
	switch (true) {
		case value instanceof Node:
			comment.replaceWith(value);
			return;

		case isFragment(value):
			comment.replaceWith(value.get());
			break;

		case isReactive(value):
			mapReactive(comment, value);
			break;

		case typeof value === 'function':
			mapValue(comment, value());
			return;

		case typeof value === 'object':
			comment.replaceWith(new Text(getString(value)));
			break;
	}
}
