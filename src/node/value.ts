import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import {getString} from '@oscarpalmer/atoms/string';
import {type Reactive, effect} from '@oscarpalmer/sentinel';
import {isFragment, isFragmentNode} from '../helpers';
import {createNodes, replaceNodes} from '../helpers/dom';
import type {FragmentNode} from '../models';

export function setReactiveNode(comment: Comment, reactive: Reactive): void {
	const text = new Text();

	let nodes: FragmentNode[] | undefined;

	effect(() => {
		const value = reactive.get();

		if (isFragment(value) || isFragmentNode(value)) {
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

			nodes = next;

			return;
		}

		const isNullable = isNullableOrWhitespace(value);

		text.textContent = getString(value);

		if (nodes != null) {
			replaceNodes(nodes, [isNullable ? comment : text]);
		} else if (isNullable && comment.parentNode == null) {
			text.replaceWith(comment);
		} else if (!isNullable && text.parentNode == null) {
			comment.replaceWith(text);
		}

		nodes = undefined;
	});
}
