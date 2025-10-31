import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import {getString} from '@oscarpalmer/atoms/string';
import type {Reactive} from '@oscarpalmer/mora';
import {isChildNode} from '@oscarpalmer/toretto/is';
import type {Fragment} from '../fragment';
import {compareArrays, isFragment} from '../helpers';
import {createNodes, replaceNodes} from '../helpers/dom';
import type {FragmentData, FragmentItem} from '../models';

//

type Identifiers = {
	next: unknown[];
	previous: (unknown | undefined)[];
};

type BaseItems = {
	fragments: Fragment[];
	templates: Fragment[];
};

type ExtendedItems = {
	next: Fragment[];
} & BaseItems;

//

function addToArray(
	identifiers: Identifiers,
	items: ExtendedItems,
	nodes: ChildNode[],
	added: boolean,
): void {
	let position = nodes[0];

	const before =
		added && !identifiers.previous.includes(items.templates[0].identifier);

	const next = items.next.flatMap(fragment =>
		fragment.get().flatMap(node => ({
			identifier: fragment.identifier,
			value: node,
		})),
	);

	const {length} = next;

	for (let index = 0; index < length; index += 1) {
		const node = next[index];

		if (!(added && identifiers.previous.includes(node.identifier))) {
			if (index === 0 && before) {
				position.before(node.value);
			} else {
				position.after(node.value);
			}
		}

		position = node.value;
	}
}

function handleArray(
	identifiers: Identifiers,
	items: BaseItems,
	nodes: ChildNode[],
): Partial<FragmentItem> {
	const next = items.templates.map(
		template =>
			items.fragments?.find(
				fragment => fragment.identifier === template.identifier,
			) ?? template,
	);

	const comparison = compareArrays(items.fragments ?? [], items.templates);

	if (comparison !== 'removed') {
		addToArray(identifiers, {...items, next}, nodes, comparison === 'added');
	}

	const toRemove =
		items.fragments?.filter(
			fragment => !identifiers.next.includes(fragment.identifier),
		) ?? [];

	const {length} = toRemove;

	for (let index = 0; index < length; index += 1) {
		toRemove[index].remove();
	}

	return {
		fragments: next,
		nodes: next.flatMap(fragment => fragment.get()),
	};
}

function removeFragments(fragments: Fragment[] | undefined): void {
	if (fragments != null) {
		const {length} = fragments;

		for (let index = 0; index < length; index += 1) {
			fragments[index].remove();
		}
	}
}

function setArray(
	item: FragmentItem,
	comment: Comment,
	value: unknown[],
): Partial<FragmentItem> | boolean {
	if (value.length === 0) {
		return {
			nodes: setText(item, comment, value),
		};
	}

	let templates = value.filter(
		item => isFragment(item) && item.identifier != null,
	) as Fragment[];

	const next = templates.map(fragment => fragment.identifier) as unknown[];
	const previous = item.fragments?.map(fragment => fragment.identifier) ?? [];

	if (new Set(next).size !== templates.length) {
		templates = [];
	}

	const noTemplates = templates.length === 0;

	if (
		noTemplates ||
		item.nodes == null ||
		previous.some(identifier => identifier == null)
	) {
		return {
			fragments: noTemplates ? undefined : templates,
			nodes: setNodes(
				item,
				comment,
				noTemplates
					? value.flatMap(item => createNodes(item))
					: templates.flatMap(template => template.get()),
			),
		};
	}

	return handleArray(
		{
			next,
			previous,
		},
		{
			templates,
			fragments: item.fragments ?? [],
		},
		item.nodes,
	);
}

function setNodes(
	item: FragmentItem,
	comment: Comment,
	next: ChildNode[],
): ChildNode[] {
	if (item.nodes == null) {
		if (comment.parentNode != null) {
			replaceNodes([comment], next);
		} else if (item.text?.parentNode != null) {
			replaceNodes([item.text], next);
		}
	} else {
		replaceNodes(item.nodes, next);
	}

	removeFragments(item.fragments);

	return next;
}

export function setReactiveValue(
	data: FragmentData,
	comment: Comment,
	reactive: Reactive<unknown>,
): void {
	let item = data.items.find(item => item.nodes?.includes(comment));

	item ??= {};

	item.text = new Text();

	data.mora.subscribers.add(
		reactive.subscribe(value => {
			if (Array.isArray(value)) {
				setReactiveValueForArray(item, comment, value);
			} else {
				setReactiveValueForSingle(item, comment, value);
			}

			item.nodes = [...(item.nodes ?? [comment])];
		}),
	);
}

function setReactiveValueForArray(
	item: FragmentItem,
	comment: Comment,
	value: unknown[],
): void {
	const result = setArray(item, comment, value);

	item.fragments = typeof result === 'boolean' ? undefined : result?.fragments;

	if (typeof result === 'boolean') {
		item.nodes = result ? item.text == null ? [] : [item.text] : undefined;
	} else {
		item.nodes = result?.nodes;
	}
}

function setReactiveValueForSingle(
	item: FragmentItem,
	comment: Comment,
	value: unknown,
): void {
	const valueIsFragment = isFragment(value);

	item.fragments = valueIsFragment ? [value] : undefined;

	if (valueIsFragment || isChildNode(value)) {
		item.nodes = setNodes(item, comment, createNodes(value));
	} else {
		item.nodes = setText(item, comment, value);
	}
}

function setText(
	item: FragmentItem,
	comment: Comment,
	value: unknown,
): ChildNode[] | undefined {
	const isNullable = isNullableOrWhitespace(value);

	if (item.text != null) {
		item.text.textContent = isNullable ? '' : getString(value);
	}

	let result = false;

	if (item.nodes != null) {
		replaceNodes(item.nodes, isNullable ? [comment] : item.text == null ? [] : [item.text]);

		result = !isNullable;
	} else if (isNullable && comment.parentNode == null) {
		item.text?.replaceWith(comment);
	} else if (!isNullable && item?.text?.parentNode == null) {
		if (item.text != null) {
			comment.replaceWith(item.text);
		}

		result = true;
	}

	removeFragments(item.fragments);

	return result ? item.text == null ? [] : [item.text] : undefined;
}
