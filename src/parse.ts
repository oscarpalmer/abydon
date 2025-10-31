import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import type {FragmentData} from './models';

function handleExpression(
	data: FragmentData,
	prefix: string,
	expression: unknown,
): string {
	if (Array.isArray(expression)) {
		const {length} = expression;

		let expressions = '';

		for (let index = 0; index < length; index += 1) {
			expressions += handleExpression(data, '', expression[index]);
		}

		return `${prefix}${expressions}`;
	}

	if (
		typeof expression === 'function' ||
		(typeof expression === 'object' && expression != null)
	) {
		const index = data.values.push(expression) - 1;

		return `${prefix}<!--abydon.${index}-->`;
	}

	return isNullableOrWhitespace(expression) ? prefix : `${prefix}${expression}`;
}

export function parse(data: FragmentData): string {
	if (data.template != null) {
		return data.template;
	}

	const {length} = data.strings;

	data.template = '';

	for (let index = 0; index < length; index += 1) {
		data.template += handleExpression(
			data,
			data.strings[index],
			data.expressions[index],
		);
	}

	data.expressions = [];
	data.strings = [] as never;

	return data.template;
}
