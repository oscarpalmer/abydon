import type {Reactive, ReactiveArray, Unsubscribe} from '@oscarpalmer/mora';
import type {Fragment} from './fragment';

export type FragmentConfiguration = {
	identifier?: unknown;
	ignoreCache?: boolean;
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
