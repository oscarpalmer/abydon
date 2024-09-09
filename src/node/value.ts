import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import type {Key} from '@oscarpalmer/atoms/models';
import {getString} from '@oscarpalmer/atoms/string';
import {type Reactive, effect} from '@oscarpalmer/sentinel';
import type {Fragment} from '../fragment';
import {compareOrder, isFragment, isProperNode} from '../helpers';
import {createNodes, replaceNodes} from '../helpers/dom';
import type {FragmentData, FragmentItem, ProperNode} from '../models';

function setArray(
	fragments: Fragment[] | undefined,
	nodes: ProperNode[] | undefined,
	comment: Comment,
	text: Text,
	value: unknown[],
): FragmentItem | undefined {
	if (value.length === 0) {
		if (nodes != null) {
			replaceNodes(nodes, [comment]);
		}

		return undefined;
	}

	let templates = value.filter(
		item => isFragment(item) && item.identifier != null,
	) as Fragment[];

	const identifiers = templates.map(fragment => fragment.identifier) as Key[];

	if (new Set(identifiers).size !== templates.length) {
		templates = [];
	}

	if (templates.length === 0) {
		const next = value.flatMap(item => createNodes(value));

		setNodes(nodes, comment, text, next);

		return {
			nodes: next,
		};
	}

	const oldIdentifiers = fragments?.map(fragment => fragment.identifier) ?? [];

	if (nodes == null || oldIdentifiers.some(identifier => identifier == null)) {
		const next = templates.flatMap(template => template.get());

		setNodes(nodes, comment, text, next);

		return {
			fragments: templates,
			nodes: next,
		};
	}

	const comparison = compareOrder(fragments ?? [], templates);

	let position = nodes[0];

	if (comparison !== 'removed') {
		const before =
			comparison === 'added' &&
			!oldIdentifiers.includes(templates[0].identifier);

		const items = templates.flatMap(template =>
			template.get().map(node => ({
				identifier: template.identifier,
				value: node,
			})),
		);

		const {length} = items;

		for (let index = 0; index < length; index += 1) {
			const item = items[index];

			if (
				comparison === 'dissimilar' ||
				!oldIdentifiers.includes(item.identifier)
			) {
				if (index === 0 && before) {
					position.before(item.value);
				} else {
					position.after(item.value);
				}
			}

			position = item.value;
		}
	}

	const toRemove =
		fragments?.filter(
			fragment => !identifiers.includes(fragment.identifier as Key),
		) ?? [];

	const {length} = toRemove;

	for (let index = 0; index < length; index += 1) {
		toRemove[index].remove();
	}

	return {
		fragments: templates,
		nodes: templates.flatMap(template => template.get()),
	};
}

function setNode(
	nodes: ProperNode[] | undefined,
	comment: Comment,
	text: Text,
	value: Fragment | ProperNode,
): ProperNode[] {
	const next = createNodes(value);

	setNodes(nodes, comment, text, next);

	return next;
}

function setNodes(
	nodes: ProperNode[] | undefined,
	comment: Comment,
	text: Text,
	next: ProperNode[],
): void {
	if (nodes == null) {
		if (comment.parentNode != null) {
			replaceNodes([comment], next);
		} else if (text.parentNode != null) {
			replaceNodes([text], next);
		}
	} else {
		replaceNodes(nodes, next);
	}
}

export function setReactiveNode(
	data: FragmentData,
	comment: Comment,
	reactive: Reactive,
): void {
	const item = data.items.find(item => item.nodes.includes(comment));
	const text = new Text();

	let fragments: Fragment[] | undefined;
	let nodes: ProperNode[] | undefined;

	effect(() => {
		const value = reactive.get();

		if (Array.isArray(value)) {
			const array = setArray(fragments, nodes, comment, text, value);

			fragments = array?.fragments;
			nodes = array?.nodes;
		} else {
			const valueIsFragment = isFragment(value);

			fragments = valueIsFragment ? [value] : undefined;

			if (valueIsFragment || isProperNode(value)) {
				nodes = setNode(nodes, comment, text, value);
			} else {
				nodes = setText(nodes, comment, text, value) ? [text] : undefined;
			}
		}

		if (item != null) {
			item.fragments = fragments;
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
