import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {computed, isReactive} from '@oscarpalmer/sentinel';
import {isFragment, isProperElement} from '../helpers';
import {createNodes} from '../helpers/dom';
import type {FragmentData, ProperNode} from '../models';
import {mapAttributes} from './attribute';
import {setReactiveNode} from './value';

const commentExpression = /^abydon\.(\d+)$/;

function mapNode(data: FragmentData, comment: Comment): void {
	const matches = commentExpression.exec(comment.textContent ?? '');
	const value = matches == null ? null : data.values[+matches[1]];

	if (value != null) {
		mapValue(data, comment, value);
	}
}

export function mapNodes(data: FragmentData, nodes: ProperNode[]): void {
	const {length} = nodes;

	for (let index = 0; index < length; index += 1) {
		const node = nodes[index];

		if (node instanceof Comment) {
			mapNode(data, node);

			continue;
		}

		if (isProperElement(node)) {
			mapAttributes(data, node);
		}

		if (node.hasChildNodes()) {
			mapNodes(data, [...node.childNodes] as ProperNode[]);
		}
	}
}

function mapValue(data: FragmentData, comment: Comment, value: unknown): void {
	switch (true) {
		case typeof value === 'function':
			setReactiveNode(data, comment, computed(value as GenericCallback));
			break;

		case isReactive(value):
			setReactiveNode(data, comment, value);
			break;

		default:
			replaceComment(data, comment, value);
			break;
	}
}

function replaceComment(
	data: FragmentData,
	comment: Comment,
	value: unknown,
): void {
	const item = data.items.find(item => item.nodes.includes(comment));
	const nodes = createNodes(value);

	if (item != null) {
		item.fragments = isFragment(value) ? [value] : undefined;
		item.nodes = nodes;
	}

	comment.replaceWith(...nodes);
}
