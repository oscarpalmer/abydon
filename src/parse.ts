import {getString} from '@oscarpalmer/atoms/string';
import {
	EXPRESSION_ABYDON_ATTRIBUTE_FULL,
	EXPRESSION_EVENT_ATTRIBUTE,
	WHITESPACE,
} from './constants';
import type {FragmentData} from './models';

function handleExpression(data: FragmentData, prefix: string, expression: unknown): string {
	if (Array.isArray(expression)) {
		if (EXPRESSION_EVENT_ATTRIBUTE.test(prefix.split(WHITESPACE).at(-1)!)) {
			return transformExpression(prefix, data.values.push(expression) - 1);
		}

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

	const asString = getString(expression);

	return asString.trim().length === 0 ? prefix : `${prefix}${asString}`;
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
	data.strings = [];

	return data.template;
}

function transformAttribute(_: string, name: string, index: string): string {
	return `abydon-${name}="abydon.${index}"`;
}

function transformExpression(prefix: string, index: number): string {
	return `${prefix}<!--abydon.${index}-->`;
}
