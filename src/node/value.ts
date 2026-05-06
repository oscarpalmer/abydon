import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import {getString} from '@oscarpalmer/atoms/string';
import type {Reactive} from '@oscarpalmer/mora';
import {isChildNode} from '@oscarpalmer/toretto/is';
import {ARRAY_COMPARISON_ADDED, ARRAY_COMPARISON_REMOVED} from '../constants';
import type {Fragment} from '../fragment';
import {compareArrays, isFragment} from '../helpers';
import {createNodes, replaceNodes} from '../helpers/dom';
import type {FragmentData, FragmentItem} from '../models';

//

type ArrayData = {
	next: ArrayDataIdentifiers;
	previous: ArrayDataIdentifiers;
	template: ArrayDataTemplate;
};

type ArrayDataIdentifiers = {
	array: unknown[];
	set: Set<unknown>;
};

type ArrayDataTemplate = {
	empty: boolean;
	items: Fragment[];
};

type Identifiers = {
	next: IdentifiersValues;
	previous: IdentifiersValues;
};

type IdentifiersValues = {
	array: unknown[];
	set: Set<unknown>;
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

	const before = added && !identifiers.previous.set.has(items.templates[0].identifier);

	const next = items.next.flatMap(fragment =>
		fragment.get().flatMap(node => ({
			identifier: fragment.identifier,
			value: node,
		})),
	);

	const {length} = next;

	for (let index = 0; index < length; index += 1) {
		const node = next[index];

		if (!(added && identifiers.previous.set.has(node.identifier))) {
			if (index === 0 && before) {
				position.before(node.value);
			} else {
				position.after(node.value);
			}
		}

		position = node.value;
	}
}

function getArrayData(item: FragmentItem, values: unknown[]): ArrayData {
	const {length} = values;

	const next: unknown[] = [];

	let templates: Fragment[] = [];

	for (let index = 0; index < length; index += 1) {
		const value = values[index];

		if (isFragment(value) && value.identifier != null) {
			next.push(value.identifier);
			templates.push(value);
		}
	}

	const previous = item.fragments?.map(fragment => fragment.identifier) ?? [];

	const nextSet = new Set(next);

	if (nextSet.size !== templates.length) {
		templates = [];
	}

	return {
		next: {
			array: next,
			set: nextSet,
		},
		previous: {
			array: previous,
			set: new Set(previous),
		},
		template: {
			empty: templates.length === 0,
			items: templates,
		},
	};
}

function handleArray(
	identifiers: Identifiers,
	items: BaseItems,
	nodes: ChildNode[],
): Partial<FragmentItem> {
	const next = items.templates.map(
		template =>
			items.fragments.find(fragment => fragment.identifier === template.identifier) ?? template,
	);

	const comparison = compareArrays(identifiers.previous.array, identifiers.next.array);

	if (comparison !== ARRAY_COMPARISON_REMOVED) {
		addToArray(identifiers, {...items, next}, nodes, comparison === ARRAY_COMPARISON_ADDED);
	}

	const toRemove = items.fragments.filter(
		fragment => !identifiers.next.set.has(fragment.identifier),
	);

	const {length} = toRemove;

	for (let index = 0; index < length; index += 1) {
		toRemove[index].remove();
	}

	return {
		fragments: next,
		nodes: next.flatMap(fragment => fragment.get()),
	};
}

function removeArray(item: FragmentItem, comment: Comment): Partial<FragmentItem> {
	const fragments = (item.fragments ?? []).slice();

	const result = {
		nodes: setText(item, comment),
	};

	removeFragmentsItems(fragments);

	return result;
}

function removeFragmentsItems(fragments: Fragment[]): void {
	const {length} = fragments;

	for (let index = 0; index < length; index += 1) {
		fragments[index].remove();
	}
}

function setArray(item: FragmentItem, comment: Comment, value: unknown[]): Partial<FragmentItem> {
	if (value.length === 0) {
		return removeArray(item, comment);
	}

	const {next, previous, template} = getArrayData(item, value);

	if (
		template.empty ||
		item.nodes == null ||
		previous.array.some(identifier => identifier == null)
	) {
		const fragments = (item.fragments ?? []).slice();

		const result = {
			fragments: template.empty ? undefined : template.items,
			nodes: replaceNodes(
				item.nodes ?? [comment],
				template.empty
					? value.flatMap(item => createNodes(item))
					: template.items.flatMap(template => template.get()),
			),
		};

		removeFragmentsItems(fragments);

		return result;
	}

	return handleArray(
		{
			next,
			previous,
		},
		{
			fragments: item.fragments ?? [],
			templates: template.items,
		},
		item.nodes,
	);
}

function setNodes(item: FragmentItem, comment: Comment, next: ChildNode[]): ChildNode[] {
	return replaceNodes(item.nodes ?? [comment], next);
}

export function setReactiveValue(
	data: FragmentData,
	comment: Comment,
	reactive: Reactive<unknown>,
): void {
	let item = data.items.find(item => item.nodes?.includes(comment));

	item ??= {};

	data.mora.subscribers.add(
		reactive.subscribe(value => {
			if (Array.isArray(value)) {
				setReactiveValueForArray(item, comment, value);
			} else {
				setReactiveValueForSingle(item, comment, value);
			}
		}),
	);
}

function setReactiveValueForArray(item: FragmentItem, comment: Comment, value: unknown[]): void {
	const {fragments, nodes} = setArray(item, comment, value);

	item.fragments = fragments;
	item.nodes = nodes;
}

function setReactiveValueForSingle(item: FragmentItem, comment: Comment, value: unknown): void {
	const fragments = (item.fragments ?? []).slice();

	const valueIsFragment = isFragment(value);

	if (valueIsFragment || isChildNode(value)) {
		item.nodes = setNodes(item, comment, createNodes(value));
	} else {
		item.nodes = setText(item, comment, value);
	}

	item.fragments = valueIsFragment ? [value] : undefined;

	removeFragmentsItems(fragments);
}

function setText(item: FragmentItem, comment: Comment, value?: unknown): ChildNode[] {
	const valueIsNullable = isNullableOrWhitespace(value);

	item.text ??= new Text();

	item.text.textContent = valueIsNullable ? '' : getString(value);

	const result = valueIsNullable ? [comment] : [item.text];

	replaceNodes(item.nodes ?? [comment], result);

	return result;
}
