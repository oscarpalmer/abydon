import type {Key} from '@oscarpalmer/atoms/models';
import type {Reactive} from '@oscarpalmer/mora';
import type {Fragment} from './fragment';

export type FragmentData = {
	expressions: unknown[];
	identifier?: Key;
	items: FragmentItem[];
	mora: FragmentDataMora;
	strings: TemplateStringsArray;
	values: unknown[];
};

type FragmentDataMora = {
	subscribers: Set<() => void>;
	values: Set<Reactive<unknown>>;
};

export type FragmentItem = {
	fragments?: Fragment[];
	nodes: ChildNode[];
};
