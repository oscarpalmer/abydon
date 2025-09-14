import type {Key} from '@oscarpalmer/atoms/models';
import type {Reactive} from '@oscarpalmer/mora';
import type {Fragment} from './fragment';

export type FragmentData = {
	expressions: unknown[];
	identifier?: Key;
	items: FragmentItem[];
	mora: MoraData;
	strings: TemplateStringsArray;
	values: unknown[];
};

export type FragmentItem = {
	fragments?: Fragment[];
	nodes: ChildNode[];
};

type MoraData = {
	subscribers: Set<() => void>;
	values: Set<Reactive<unknown>>;
};
