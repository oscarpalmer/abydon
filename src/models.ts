import type {Reactive, ReactiveArray, Unsubscribe} from '@oscarpalmer/mora';
import type {Fragment} from './fragment';

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

export type FragmentData = {
	expressions: unknown[];
	items: FragmentItem[];
	mora: MoraData;
	strings: TemplateStringsArray | string[];
	template?: string;
	values: unknown[];
};

export type FragmentItem = {
	fragments?: Fragment[];
	nodes?: ChildNode[];
	text?: Text;
};

export type FragmentsState = {
	array: ReactiveArray<unknown>;
	fragment: (item: unknown) => Fragment;
	identify: (item: unknown) => unknown;
	instances: Record<string, Fragment>;
	mapped: ReactiveArray<Fragment>;
	subscriber: Unsubscribe | undefined;
};

type MoraData = {
	subscribers: Set<() => void>;
	values: Set<Reactive<unknown>>;
};
