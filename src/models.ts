import type {Reactive, ReactiveArray, Subscription} from '@oscarpalmer/mora';
import type {SYMBOL} from './constants';

// #region Types

export type InternalFragment = {
	[SYMBOL]: FragmentState;
} & Fragment;

export type InternalFragments = {
	[SYMBOL]: FragmentsState;
} & Fragments;

export type Fragment = {
	/**
	 * Is template caching enabled?
	 */
	get cache(): boolean;

	/**
	 * Identifier for the _Fragment_
	 *
	 * _An identifier can be used to uniquely identify a Fragment, which helps prevent re-rendering in reactive arrays and Fragments_
	 */
	get identifier(): unknown;

	/**
	 * Insert the _Fragment_ after the given element
	 *
	 * @param element Element to insert after
	 */
	after(element: Element): void;

	/**
	 * Append the _Fragment_ to the given element
	 *
	 * @param element Element to append to
	 */
	appendTo(element: Element): void;

	/**
	 * Insert the _Fragment_ before the given element
	 *
	 * @param element Element to insert before
	 */
	before(element: Element): void;

	/**
	 * Configure the _Fragment_
	 *
	 * @param configuration Configuration options
	 * @returns _Fragment_
	 */
	configure(configuration: FragmentConfiguration): Fragment;

	/**
	 * Get a list of the _Fragment_'s nodes
	 *
	 * @returns List of nodes
	 */
	get(): ChildNode[];

	/**
	 * Prepend the _Fragment_ to the given element
	 *
	 * @param element Element to prepend to
	 */
	prependTo(element: Element): void;

	/**
	 * Remove the _Fragment_ _(and all its descendants)_ from the _DOM_
	 *
	 * - _Any events, reactive values, and Fragments will also be cleaned up and removed_
	 * - _After being removed, the Fragment can be re-inserted into the DOM_
	 */
	remove(): void;
};

/**
 * Configuration for a _Fragment_
 */
export type FragmentConfiguration = {
	/**
	 * Should the template be cached? _(defaults to `true`)_
	 */
	cache?: boolean;
	/**
	 * Identifier for the _Fragment_
	 *
	 * _An identifier can be used to uniquely identify a Fragment, which helps prevent re-rendering in reactive arrays and Fragments_
	 */
	identifier?: unknown;
};

export type FragmentItem = {
	fragments?: Fragment[];
	nodes?: ChildNode[];
	text?: Text;
};

export type FragmentState = {
	cache: boolean;
	expressions: unknown[];
	identifier: unknown;
	items: FragmentItem[];
	mora: MoraData;
	name: string;
	strings: TemplateStringsArray | string[];
	template?: string;
	values: unknown[];
};

export type Fragments = {
	/**
	 * Remove the _Fragments_ _(and all its descendants)_ from the _DOM_, including any events, reactive values, and Fragments
	 */
	remove(): void;
};

export type FragmentsState = {
	array: ReactiveArray<unknown>;
	fragment: (item: unknown) => Fragment;
	identify: (item: unknown) => unknown;
	instances: Record<string, Fragment>;
	mapped: ReactiveArray<Fragment>;
	name: string;
	subscription: Subscription | undefined;
};

type MoraData = {
	subscriptions: Set<Subscription>;
	values: Set<Reactive<unknown>>;
};

// #endregion
