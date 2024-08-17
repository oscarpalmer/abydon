import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import {getString} from '@oscarpalmer/atoms/string';
import {type Reactive, effect} from '@oscarpalmer/sentinel';
import type {Fragment} from '../fragment';
import {isFragment, isProperNode} from '../helpers';
import {createNodes, replaceNodes} from '../helpers/dom';
import type {FragmentData, ProperNode} from '../models';

function setNodes(
	nodes: ProperNode[] | undefined,
	comment: Comment,
	text: Text,
	value: Fragment | ProperNode,
): ProperNode[] {
	const next = createNodes(value);

	if (nodes == null) {
		if (comment.parentNode != null) {
			replaceNodes([comment], next);
		} else if (text.parentNode != null) {
			replaceNodes([text], next);
		}
	} else {
		replaceNodes(nodes, next);
	}

	return next;
}

export function setReactiveNode(
	data: FragmentData,
	comment: Comment,
	reactive: Reactive,
): void {
	const item = data.items.find(item => item.nodes.includes(comment));
	const text = new Text();

	let nodes: ProperNode[] | undefined;

	effect(() => {
		const value = reactive.get();

		const valueIsFragment = isFragment(value);

		if (valueIsFragment || isProperNode(value)) {
			nodes = setNodes(nodes, comment, text, value);
		} else {
			nodes = setText(nodes, comment, text, value) ? [text] : undefined;
		}

		if (item != null) {
			item.fragment = valueIsFragment ? value : undefined;
			item.nodes = [...(nodes ?? [comment])];
		}
	});
}

function setText(
	nodes: ProperNode[] | undefined,
	comment: Comment,
	text: Text,
	value: unknown,
): boolean {
	const isNullable = isNullableOrWhitespace(value);

	text.textContent = isNullable ? '' : getString(value);

	if (nodes != null) {
		replaceNodes(nodes, [isNullable ? comment : text]);

		return !isNullable;
	}

	if (isNullable && comment.parentNode == null) {
		text.replaceWith(comment);

		return false;
	}

	if (!isNullable && text.parentNode == null) {
		comment.replaceWith(text);

		return true;
	}

	return false;
}
