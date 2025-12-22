import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import {EXPRESSION_ABYDON_ATTRIBUTE_FULL} from './constants';
import type {FragmentData} from './models';

function handleExpression(data: FragmentData, prefix: string, expression: unknown): string {
	if (Array.isArray(expression)) {
		const {length} = expression;

		let expressions = '';

		for (let index = 0; index < length; index += 1) {
			expressions += handleExpression(data, '', expression[index]);
		}

		return `${prefix}${expressions}`;
	}

	if (typeof expression === 'function' || (typeof expression === 'object' && expression != null)) {
		return transformExpression(prefix, data.values.push(expression) - 1);
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
		data.template += handleExpression(data, data.strings[index], data.expressions[index]);
	}

	data.template = data.template.replaceAll(EXPRESSION_ABYDON_ATTRIBUTE_FULL, transformAttribute);

	data.expressions = [];
	data.strings = [] as never;

	return data.template;
}

function transformAttribute(_: string, name: string, index: string): string {
	return `_${name}="@abydon.${index}@"`;
}

function transformExpression(prefix: string, index: number): string {
	return `${prefix}<!--abydon.${index}-->`;
}
