import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {computed, isReactive} from '@oscarpalmer/sentinel';
import type {FragmentData, HTMLOrSVGElement} from '../../models';
import {mapEvent} from '../event';
import {setAttribute} from './value';

const commentExpression = /^<!--abydon\.(\d+)-->$/;

function getValue(data: FragmentData, original: string): unknown {
	const matches = commentExpression.exec(original ?? '');

	return matches == null ? original : data.values[+matches[1]];
}

export function mapAttributes(
	data: FragmentData,
	element: HTMLOrSVGElement,
): void {
	const attributes = [...element.attributes];
	const {length} = attributes;

	for (let index = 0; index < length; index += 1) {
		const {name, value} = attributes[index];

		const actual = getValue(data, value);

		if (name.startsWith('@')) {
			mapEvent(element, name, actual);
		} else if (
			name.includes('.') ||
			typeof value === 'function' ||
			isReactive(actual)
		) {
			mapValue(data, element, name, actual);
		}
	}
}

function mapValue(
	data: FragmentData,
	element: HTMLOrSVGElement,
	name: string,
	value: unknown,
): void {
	switch (true) {
		case typeof value === 'function':
			setComputedAttribute(data, element, name, value as GenericCallback);
			break;

		default:
			setAttribute(data, element, name, value);
			break;
	}
}

function setComputedAttribute(
	data: FragmentData,
	element: HTMLOrSVGElement,
	name: string,
	callback: GenericCallback,
): void {
	const value = computed(callback);

	data.sentinel.values.add(value);

	setAttribute(data, element, name, value);
}
