import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {isReactive} from '@oscarpalmer/mora';
import {isHTMLOrSVGElement} from '@oscarpalmer/toretto/is';
import {mapAttributes, mapAttributeValue} from '../attribute/index';
import {EXPRESSION_ABYDON_CONTENT, EXPRESSION_TEXTAREA_VALUE, SYMBOL} from '../constants';
import {handleFragments} from '../fragments';
import {isFragment, isFragments, setComputedValue} from '../helpers';
import {createNodes} from '../helpers/dom';
import type {Fragments, FragmentState, InternalFragments} from '../models';
import {setReactiveValue} from './value';

// #region Functions

function mapNode(data: FragmentState, comment: Comment): void {
	const matches = EXPRESSION_ABYDON_CONTENT.exec(comment.textContent);
	const value = matches == null ? null : data.values[+matches[1]];

	if (value != null) {
		mapValue(data, comment, value);
	}
}

export function mapNodes(data: FragmentState, nodes: ChildNode[]): void {
	const {length} = nodes;

	for (let index = 0; index < length; index += 1) {
		const node = nodes[index];

		if (node instanceof Comment) {
			mapNode(data, node);

			continue;
		}

		if (isHTMLOrSVGElement(node)) {
			let ignoreValueAttribute = false;

			if (node instanceof HTMLTextAreaElement) {
				// Textareas are a special case because their value can be set via the `value` property
				// or the text content. In order to support both, we need to check for the presence of
				// the expression in both places and map it accordingly.
				ignoreValueAttribute = mapTextarea(data, node);
			}

			mapAttributes(data, node, ignoreValueAttribute);
		}

		if (node.hasChildNodes()) {
			mapNodes(data, [...node.childNodes] as ChildNode[]);
		}
	}
}

function mapTextarea(data: FragmentState, element: HTMLTextAreaElement): boolean {
	const [, index] =
		EXPRESSION_TEXTAREA_VALUE.exec(element.textContent) ??
		EXPRESSION_TEXTAREA_VALUE.exec(element.value) ??
		[];

	if (index == null) {
		return false;
	}

	element.textContent = '';
	element.value = '';

	mapAttributeValue(data, element, 'value', data.values[Number.parseInt(index, 10)]);

	return true;
}

function mapValue(data: FragmentState, comment: Comment, value: unknown): void {
	switch (true) {
		case typeof value === 'function':
			setComputedNode(data, comment, value as GenericCallback);
			break;

		case isFragments(value):
			setFragmentsNode(data, comment, value);
			break;

		case isReactive(value):
			setReactiveValue(data, comment, value);
			break;

		default:
			replaceComment(data, comment, value);
			break;
	}
}

function replaceComment(data: FragmentState, comment: Comment, value: unknown): void {
	const item = data.items.find(item => item.nodes?.includes(comment));
	const nodes = createNodes(value);

	if (item != null) {
		item.fragments = isFragment(value) ? [value] : undefined;
		item.nodes = nodes;
	}

	comment.replaceWith(...nodes);
}

function setComputedNode(data: FragmentState, comment: Comment, callback: GenericCallback): void {
	setComputedValue(data, callback, computation => {
		setReactiveValue(data, comment, computation);
	});
}

function setFragmentsNode(data: FragmentState, comment: Comment, fragments: Fragments): void {
	handleFragments(fragments, false);

	setReactiveValue(data, comment, (fragments as InternalFragments)[SYMBOL].mapped);
}

// #endregion
