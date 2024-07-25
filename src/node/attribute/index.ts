import {isReactive} from '@oscarpalmer/sentinel';
import type {FragmentData, FragmentElement} from '../../models';
import {mapEvent} from '../event';
import {setAttribute} from './value';

const commentExpression = /^<!--abydon\.(\d+)-->$/;

function getValue(data: FragmentData, original: string): unknown {
	const matches = commentExpression.exec(original ?? '');

	return matches == null ? original : data.values[+matches[1]];
}

export function isBadAttribute(name: string, value: string): boolean {
	return (
		/^on/i.test(name) ||
		(/^(href|src|xlink:href)$/i.test(name) &&
			/(data:text\/html|javascript:)/i.test(value))
	);
}

export function mapAttributes(
	data: FragmentData,
	element: FragmentElement,
): void {
	const attributes = [...element.attributes];
	const {length} = attributes;

	for (let index = 0; index < length; index += 1) {
		const {name, value} = attributes[index];

		if (isBadAttribute(name, value)) {
			element.removeAttribute(name);

			continue;
		}

		const actual = getValue(data, value);

		if (name.startsWith('@')) {
			mapEvent(element, name, actual);
		} else if (name.includes('.') || isReactive(actual)) {
			mapValue(element, name, actual);
		}
	}
}

function mapValue(
	element: FragmentElement,
	name: string,
	value: unknown,
): void {
	switch (true) {
		case typeof value === 'function':
			mapValue(element, name, value());
			return;

		default:
			setAttribute(element, name, value);
			break;
	}
}
