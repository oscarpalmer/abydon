import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {computed, isReactive} from '@oscarpalmer/mora';
import {isBooleanAttribute, setProperty} from '@oscarpalmer/toretto/attribute';
import type {HTMLOrSVGElement} from '@oscarpalmer/toretto/models';
import {EXPRESSION_COMMENT_FULL} from '../../constants';
import type {FragmentData} from '../../models';
import {mapEvent} from '../event';
import {setAttribute} from './value';

function getValue(data: FragmentData, original: string): unknown {
	const matches = EXPRESSION_COMMENT_FULL.exec(original ?? '');

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

		switch (true) {
			case name.startsWith('@'):
				mapEvent(element, name, actual);
				break;

			case name.includes('.') ||
				typeof actual === 'function' ||
				isReactive(actual):
				mapValue(data, element, name, actual);
				break;

			case isBooleanAttribute(name):
				setProperty(element, name, value);
				break;

			default:
				break;
		}
	}
}

function mapValue(
	data: FragmentData,
	element: HTMLOrSVGElement,
	name: string,
	value: unknown,
): void {
	if (typeof value === 'function') {
		setComputedAttribute(data, element, name, value as GenericCallback);
	} else {
		setAttribute(data, element, name, value);
	}
}

function setComputedAttribute(
	data: FragmentData,
	element: HTMLOrSVGElement,
	name: string,
	callback: GenericCallback,
): void {
	const value = computed(callback);

	data.mora.values.add(value);

	setAttribute(data, element, name, value);
}
