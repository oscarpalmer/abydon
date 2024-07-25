import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import {getString} from '@oscarpalmer/atoms/string';
import {type Reactive, effect, isReactive} from '@oscarpalmer/sentinel';
import type {FragmentData} from '../fragment';
import {createNode, getNodes} from '../helpers/dom';

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

function mapReactive(comment: Comment, reactive: Reactive): void {
	const text = new Text();

	effect(() => {
		const value = reactive.get();
		const isNullable = isNullableOrWhitespace(value);

		text.textContent = getString(value);

		if (isNullable && comment.parentNode == null) {
			text.replaceWith(comment);
		} else if (!isNullable && text.parentNode == null) {
			comment.replaceWith(text);
		}
	});
}

function mapValue(comment: Comment, value: unknown): void {
	switch (true) {
		case isReactive(value):
			mapReactive(comment, value);
			break;

		case typeof value === 'function':
			mapValue(comment, value());
			return;

		default:
			comment.replaceWith(...getNodes(createNode(value)));
			break;
	}
}
