import type {Reactive, ReactiveArray, Unsubscribe} from '@oscarpalmer/mora';
import type {Fragment} from './fragment';

export type FragmentConfiguration = {
	/**
	 * Should the template be cached? _(defaults to `true`)_
	 */
	cache?: boolean;
	/**
	 * Set an identifier for the fragment
	 *
	 * _An identifier can be used to uniquely identify a fragment,
	 * which helps prevent re-rendering in certain scenarios._
	 */
	identifier?: unknown;
};

export type FragmentData = {
	expressions: unknown[];
	items: FragmentItem[];
	mora: MoraData;
	strings: TemplateStringsArray;
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
