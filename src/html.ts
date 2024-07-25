import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import {createFragment, type FragmentData, type Fragment} from './fragment';

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
		const part = data.strings[index];
		const expression = data.expressions[index];

		template += isNullableOrWhitespace(expression)
			? part
			: `${part}${expression}`;
	}

	return template;
}