import {isReactive} from '@oscarpalmer/sentinel';
import type {FragmentData, ProperElement} from '../../models';
import {mapEvent} from '../event';
import {setAttribute} from './value';

const commentExpression = /^<!--abydon\.(\d+)-->$/;

function getValue(data: FragmentData, original: string): unknown {
	const matches = commentExpression.exec(original ?? '');

	return matches == null ? original : data.values[+matches[1]];
}

export function mapAttributes(data: FragmentData, element: ProperElement): void {
		const attributes = [...element.attributes];
		const {length} = attributes;

		for (let index = 0; index < length; index += 1) {
			const {name, value} = attributes[index];

			const actual = getValue(data, value);

			if (name.startsWith('@')) {
				mapEvent(element, name, actual);
			} else if (name.includes('.') || isReactive(actual)) {
				mapValue(element, name, actual);
			}
		}
	}

function mapValue(element: ProperElement, name: string, value: unknown): void {
	switch (true) {
		case typeof value === 'function':
			mapValue(element, name, value());
			return;

		default:
			setAttribute(element, name, value);
			break;
	}
}
