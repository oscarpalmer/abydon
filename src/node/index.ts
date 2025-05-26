import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {computed, isReactive} from '@oscarpalmer/mora';
import {isHTMLOrSVGElement} from '@oscarpalmer/toretto/is';
import {isFragment} from '../helpers';
import {createNodes} from '../helpers/dom';
import type {FragmentData} from '../models';
import {mapAttributes} from './attribute';
import {setReactiveValue} from './value';

const commentExpression = /^abydon\.(\d+)$/;

function mapNode(data: FragmentData, comment: Comment): void {
	const matches = commentExpression.exec(comment.textContent ?? '');
	const value = matches == null ? null : data.values[+matches[1]];

	if (value != null) {
		mapValue(data, comment, value);
	}
}

export function mapNodes(data: FragmentData, nodes: ChildNode[]): void {
	const {length} = nodes;

	for (let index = 0; index < length; index += 1) {
		const node = nodes[index];

		if (node instanceof Comment) {
			mapNode(data, node);

			continue;
		}

		if (isHTMLOrSVGElement(node)) {
			mapAttributes(data, node);
		}

		if (node.hasChildNodes()) {
			mapNodes(data, [...node.childNodes] as ChildNode[]);
		}
	}
}

function mapValue(data: FragmentData, comment: Comment, value: unknown): void {
	switch (true) {
		case typeof value === 'function':
			setComputedValue(data, comment, value as GenericCallback);
			break;

		case isReactive(value):
			setReactiveValue(data, comment, value);
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

function setComputedValue(
	data: FragmentData,
	comment: Comment,
	callback: GenericCallback,
): void {
	const value = computed(callback);

	data.mora.values.add(value);

	setReactiveValue(data, comment, value);
}
