import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import {createTemplate, getNodes} from './helpers/dom';

export function html(
	strings: TemplateStringsArray,
	...values: unknown[]
): Node[] {
	const parsed = parse(strings, values);
	const templated = createTemplate(parsed);

	return getNodes(templated);
}

function parse(parts: TemplateStringsArray, values: unknown[]): string {
	const {length} = parts;

	let template = '';

	for (let index = 0; index < length; index += 1) {
		const part = parts[index];
		const value = values[index];

		template += isNullableOrWhitespace(value) ? part : `${part}${value}`;
	}

	return template;
}