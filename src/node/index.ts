import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {
	computed,
	isComputed,
	isReactive,
	isSignal,
	type Computed,
	type Reactive,
} from '@oscarpalmer/mora';
import {isHTMLOrSVGElement} from '@oscarpalmer/toretto/is';
import {EXPRESSION_ABYDON_CONTENT, EXPRESSION_TEXTAREA_VALUE} from '../constants';
import {handleFragments} from '../fragments';
import {isFragment, isFragments} from '../helpers';
import {createNodes} from '../helpers/dom';
import type {FragmentData} from '../models';
import {mapAttributes} from './attribute';
import {setReactiveValue} from './value';
import {mapEvent} from './event';

function mapNode(data: FragmentData, comment: Comment): void {
	const matches = EXPRESSION_ABYDON_CONTENT.exec(comment.textContent ?? '');
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

		if (node instanceof HTMLTextAreaElement) {
			mapTextarea(data, node);
		}

		if (isHTMLOrSVGElement(node)) {
			mapAttributes(data, node);
		}

		if (node.hasChildNodes()) {
			mapNodes(data, [...node.childNodes] as ChildNode[]);
		}
	}
}

function mapTextarea(data: FragmentData, element: HTMLTextAreaElement): void {
	const [, index] = EXPRESSION_TEXTAREA_VALUE.exec(element.value) ?? [];

	if (index == null) {
		return;
	}

	element.value = '';

	const value = data.values[Number.parseInt(index, 10)];

	if (isSignal(value)) {
		element.value = String(value.peek());

		mapEvent(element, '@on', () => {
			value.set(element.value);
		});

		return;
	}

	let reactive: Computed<unknown> | undefined;

	if (typeof value === 'function') {
		reactive = computed(value as GenericCallback);
	} else if (isComputed(value)) {
		reactive = value;
	}

	if (reactive == null) {
		element.value = String(value);
	} else {
		data.mora.subscribers.add(
			reactive.subscribe(value => {
				element.value = String(value);
			}),
		);
	}
}

function mapValue(data: FragmentData, comment: Comment, value: unknown): void {
	switch (true) {
		case typeof value === 'function':
			setComputedValue(data, comment, value as GenericCallback);
			break;

		case isFragments(value):
			handleFragments(value, false);
			setReactiveValue(data, comment, value.items as Reactive<unknown[], unknown>);
			break;

		case isReactive(value):
			setReactiveValue(data, comment, value);
			break;

		default:
			replaceComment(data, comment, value);
			break;
	}
}

function replaceComment(data: FragmentData, comment: Comment, value: unknown): void {
	const item = data.items.find(item => item.nodes?.includes(comment));
	const nodes = createNodes(value);

	if (item != null) {
		item.fragments = isFragment(value) ? [value] : undefined;
		item.nodes = nodes;
	}

	comment.replaceWith(...nodes);
}

function setComputedValue(data: FragmentData, comment: Comment, callback: GenericCallback): void {
	const value = computed(callback);

	data.mora.values.add(value);

	setReactiveValue(data, comment, value);
}
