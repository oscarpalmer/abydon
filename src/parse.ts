import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import type {FragmentData} from './models';

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

	if (typeof expression === 'function' || typeof expression === 'object') {
		const index = data.values.push(expression) - 1;

		return `${prefix}<!--abydon.${index}-->`;
	}

	return `${prefix}${expression}`;
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
