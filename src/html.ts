import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import {type Fragment, type FragmentData, createFragment} from './fragment';

export function getFragment(nodes: Node[]): DocumentFragment {
	const fragment = document.createDocumentFragment();

	fragment.append(...nodes);

	return fragment;
}

function handleExpression(
	data: FragmentData,
	prefix: string,
	expression: unknown,
): string {
	if (isNullableOrWhitespace(expression)) {
		return prefix;
	}

	if (Array.isArray(expression)) {
		const {length} = expression;

		let expressions = '';

		for (let index = 0; index < length; index += 1) {
			expressions += handleExpression(data, '', expression[index]);
		}

		return `${prefix}${expressions}`;
	}

	if (typeof expression === 'object') {
		const index = data.values.push(expression) - 1;

		return `${prefix}<!--abydon.${index}-->`;
	}

	return `${prefix}${expression}`;
}

export function html(
	strings: TemplateStringsArray,
	...values: unknown[]
): Fragment {
	return createFragment(strings, values);
}

export function parse(data: FragmentData): string {
	const {length} = data.strings;

	let template = '';

	for (let index = 0; index < length; index += 1) {
		template += handleExpression(
			data,
			data.strings[index],
			data.expressions[index],
		);
	}

	return template;
}