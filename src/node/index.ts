import {isReactive} from '@oscarpalmer/sentinel';
import {isFragmentElement} from '../helpers';
import {createNodes} from '../helpers/dom';
import type {FragmentData} from '../models';
import {setReactive} from './value';

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

		if (isFragmentElement(node)) {
			// Attributes
		}

		if (node.hasChildNodes()) {
			mapNodes(data, [...node.childNodes]);
		}
	}
}

function mapValue(comment: Comment, value: unknown): void {
	switch (true) {
		case isReactive(value):
			setReactive(comment, value);
			break;

		case typeof value === 'function':
			mapValue(comment, value());
			return;

		default:
			comment.replaceWith(...createNodes(value));
			break;
	}
}
