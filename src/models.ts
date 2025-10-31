import type {Reactive} from '@oscarpalmer/mora';
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

type MoraData = {
	subscribers: Set<() => void>;
	values: Set<Reactive<unknown>>;
};
