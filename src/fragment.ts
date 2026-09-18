import {isNonTemplateStringsArray, isPlainObject} from '@oscarpalmer/atoms/is';
import {html} from '@oscarpalmer/toretto/html';
import {MESSAGE_FRAGMENT_VALUE, NAME_FRAGMENT, PROPERTY_IDENTIFIER, SYMBOL} from './constants';
import {handleFragments} from './fragments';
import {isFragments} from './helpers';
import {removeNodes} from './helpers/dom';
import type {Fragment, FragmentConfiguration, FragmentState, InternalFragment} from './models';
import {mapNodes} from './node';
import {parse} from './parse';

// #region Instances

function Fragment(this: any, strings: TemplateStringsArray, expressions: unknown[]) {
	this[SYMBOL] = {
		expressions,
		strings,
		cache: true,
		identifier: undefined,
		items: [],
		mora: {
			subscriptions: new Set(),
			values: new Set(),
		},
		name: NAME_FRAGMENT,
		values: [],
	};
}

Fragment.prototype.after = insertFragmentAfter;
Fragment.prototype.appendTo = appendFragmentTo;
Fragment.prototype.before = insertFragmentBefore;
Fragment.prototype.configure = configureFragment;
Fragment.prototype.get = getFragmentNodes;
Fragment.prototype.prependTo = prependFragmentTo;
Fragment.prototype.remove = removeFragment;

Object.defineProperties(Fragment.prototype, {
	cache: {
		enumerable: true,
		get: getFragmentCache,
	},
	identifier: {
		enumerable: true,
		get: getFragmentIdentifier,
	},
});

// #endregion

// #region Functions

function appendFragmentTo(this: InternalFragment, element: Element): void {
	element.append(...this.get());
}

function configureFragment(
	this: InternalFragment,
	configuration: FragmentConfiguration,
): InternalFragment {
	const state = this[SYMBOL];

	const actual = isPlainObject(configuration) ? configuration : {};

	if (PROPERTY_IDENTIFIER in actual) {
		state.identifier = actual.identifier;
	}

	if (typeof actual.cache === 'boolean') {
		state.cache = actual.cache;
	}

	return this;
}

/**
 * Create a _Fragment_ from a template
 *
 * _A Fragment can be used to efficiently render a template that may change over time, only updating the necessary parts of the DOM._
 *
 * @example
 * ```ts
 * const name = signal('World');
 * const fragment = fragment`<p>Hello, ${name}!</p>`; // or `html`<p>Hello, ${name}!</p>`
 * fragment.appendTo(document.body);                  // Renders '<p>Hello, World!</p>'
 * name.set('Alice');                                 // Replaces 'World' with 'Alice'
 * ```
 *
 * @returns _Fragment_
 */
export function fragment(template: TemplateStringsArray, ...values: unknown[]): Fragment;

/**
 * Create a _Fragment_ from a simple template
 *
 * @example
 * ```ts
 * const fragment = fragment('<p>Hello, World!</p>'); // or `html`('<p>Hello, World!</p>')
 * fragment.appendTo(document.body);                  // Renders '<p>Hello, World!</p>'
 * ```
 *
 * @returns _Fragment_
 */
export function fragment(template: string): Fragment;

export function fragment(template: string | TemplateStringsArray, ...values: unknown[]): Fragment {
	if (typeof template !== 'string' && isNonTemplateStringsArray(template)) {
		throw new TypeError(MESSAGE_FRAGMENT_VALUE);
	}

	// @ts-expect-error All good, no worries :-)
	return new Fragment(template, values);
}

function getFragmentCache(this: InternalFragment): boolean {
	return this[SYMBOL].cache;
}

function getFragmentIdentifier(this: InternalFragment): unknown {
	return this[SYMBOL].identifier;
}

function getFragmentNodes(this: InternalFragment): ChildNode[] {
	const state = this[SYMBOL];

	if (state.items.length === 0) {
		const parsed = parse(state);

		const templated = html(parsed, {
			cache: state.cache,
		});

		state.items.splice(
			0,
			state.items.length,
			...templated.map(node => ({
				nodes: [node as ChildNode],
			})),
		);

		mapNodes(
			state,
			state.items.flatMap(item => item.nodes!),
		);
	}

	return state.items.flatMap(
		item => item.fragments?.flatMap(fragment => fragment.get()) ?? item.nodes!,
	);
}

function insertFragmentAfter(this: InternalFragment, element: Element): void {
	element.after(...this.get());
}

function insertFragmentBefore(this: InternalFragment, element: Element): void {
	element.before(...this.get());
}

function prependFragmentTo(this: InternalFragment, element: Element): void {
	element.prepend(...this.get());
}

function removeFragment(this: InternalFragment): void {
	const state = this[SYMBOL];

	removeMora(state);

	let {length} = state.items;

	for (let index = 0; index < length; index += 1) {
		const {fragments, nodes} = state.items[index];
		const fragmentsLength = fragments?.length ?? 0;

		for (let fragmentIndex = 0; fragmentIndex < fragmentsLength; fragmentIndex += 1) {
			fragments?.[fragmentIndex]?.remove();
		}

		removeNodes(nodes!);
	}

	state.items.length = 0;

	length = state.values.length;

	for (let index = 0; index < length; index += 1) {
		const value = state.values[index];

		if (isFragments(value)) {
			handleFragments(value, true);
		}
	}
}

function removeMora(state: FragmentState): void {
	const subscriptions = [...state.mora.subscriptions];

	state.mora.subscriptions.clear();
	state.mora.values.clear();

	for (const subscription of subscriptions) {
		subscription.unsubscribe();
	}
}

// #endregion

// #region Exports

export {fragment as html};

// #endregion
