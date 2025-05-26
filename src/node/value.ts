import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import type {Key} from '@oscarpalmer/atoms/models';
import {getString} from '@oscarpalmer/atoms/string';
import type {Reactive} from '@oscarpalmer/mora';
import {isChildNode} from '@oscarpalmer/toretto/is';
import type {Fragment} from '../fragment';
import {compareArrays, isFragment} from '../helpers';
import {createNodes, replaceNodes} from '../helpers/dom';
import type {FragmentData, FragmentItem} from '../models';

function removeFragments(fragments: Fragment[] | undefined): void {
	if (fragments != null) {
		const {length} = fragments;

		for (let index = 0; index < length; index += 1) {
			fragments[index].remove();
		}
	}
}

function setArray(
	fragments: Fragment[] | undefined,
	nodes: ChildNode[] | undefined,
	comment: Comment,
	text: Text,
	value: unknown[],
): Partial<FragmentItem> | boolean {
	if (value.length === 0) {
		return {
			nodes: setText(fragments, nodes, comment, text, value),
		};
	}

	let templates = value.filter(
		item => isFragment(item) && item.identifier != null,
	) as Fragment[];

	const identifiers = templates.map(fragment => fragment.identifier) as Key[];
	const oldIdentifiers = fragments?.map(fragment => fragment.identifier) ?? [];

	if (new Set(identifiers).size !== templates.length) {
		templates = [];
	}

	const noTemplates = templates.length === 0;

	if (
		noTemplates ||
		nodes == null ||
		oldIdentifiers.some(identifier => identifier == null)
	) {
		return {
			fragments: noTemplates ? undefined : templates,
			nodes: setNodes(
				fragments,
				nodes,
				comment,
				text,
				noTemplates
					? value.flatMap(item => createNodes(item))
					: templates.flatMap(template => template.get()),
			),
		};
	}

	const next = templates.map(
		template =>
			fragments?.find(
				fragment => fragment.identifier === template.identifier,
			) ?? template,
	);

	const comparison = compareArrays(fragments ?? [], templates);

	if (comparison !== 'removed') {
		let position = nodes[0];

		const before =
			comparison === 'added' &&
			!oldIdentifiers.includes(templates[0].identifier);

		const items = next.flatMap(fragment =>
			fragment.get().flatMap(node => ({
				identifier: fragment.identifier,
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
		fragments: next,
		nodes: next.flatMap(fragment => fragment.get()),
	};
}

function setNodes(
	fragments: Fragment[] | undefined,
	nodes: ChildNode[] | undefined,
	comment: Comment,
	text: Text,
	next: ChildNode[],
): ChildNode[] {
	if (nodes == null) {
		if (comment.parentNode != null) {
			replaceNodes([comment], next);
		} else if (text.parentNode != null) {
			replaceNodes([text], next);
		}
	} else {
		replaceNodes(nodes, next);
	}

	removeFragments(fragments);

	return next;
}

export function setReactiveValue(
		data: FragmentData,
		comment: Comment,
		reactive: Reactive<unknown>,
	): void {
		const item = data.items.find(item => item.nodes.includes(comment));
		const text = new Text();

		let fragments: Fragment[] | undefined;
		let nodes: ChildNode[] | undefined;

		data.mora.subscribers.add(
			reactive.subscribe(value => {
				if (Array.isArray(value)) {
					const result = setArray(fragments, nodes, comment, text, value);

					fragments =
						typeof result === 'boolean' ? undefined : result?.fragments;

					nodes =
						typeof result === 'boolean'
							? result
								? [text]
								: undefined
							: result?.nodes;
				} else {
					const valueIsFragment = isFragment(value);

					fragments = valueIsFragment ? [value] : undefined;

					if (valueIsFragment || isChildNode(value)) {
						nodes = setNodes(
							fragments,
							nodes,
							comment,
							text,
							createNodes(value),
						);
					} else {
						nodes = setText(fragments, nodes, comment, text, value);
					}
				}

				if (item != null) {
					item.fragments = fragments;
					item.nodes = [...(nodes ?? [comment])];
				}
			}),
		);
	}

function setText(
	fragments: Fragment[] | undefined,
	nodes: ChildNode[] | undefined,
	comment: Comment,
	text: Text,
	value: unknown,
): ChildNode[] | undefined {
	const isNullable = isNullableOrWhitespace(value);

	text.textContent = isNullable ? '' : getString(value);

	let result = false;

	if (nodes != null) {
		replaceNodes(nodes, [isNullable ? comment : text]);

		result = !isNullable;
	} else if (isNullable && comment.parentNode == null) {
		text.replaceWith(comment);
	} else if (!isNullable && text.parentNode == null) {
		comment.replaceWith(text);

		result = true;
	}

	removeFragments(fragments);

	return result ? [text] : undefined;
}
