import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {computed, isReactive} from '@oscarpalmer/mora';
import {isBooleanAttribute, setProperty} from '@oscarpalmer/toretto/attribute';
import {
	EXPRESSION_ABYDON_ATTRIBUTE_PREFIX,
	EXPRESSION_ABYDON_CONTENT,
	EXPRESSION_EVENT_PREFIX,
	EXPRESSION_PERIOD,
} from '../../constants';
import type {FragmentData} from '../../models';
import {mapEvent} from '../event';
import {setAttribute} from './value';

function getValue(data: FragmentData, original: string): unknown {
	const matches = EXPRESSION_ABYDON_CONTENT.exec(original ?? '');

	return matches == null ? original : data.values[+matches[1]];
}

export function mapAttributes(data: FragmentData, element: HTMLElement | SVGElement): void {
	const attributes = [...element.attributes];
	const {length} = attributes;

	for (let index = 0; index < length; index += 1) {
		let {name, value} = attributes[index];

		name = name.replace(EXPRESSION_ABYDON_ATTRIBUTE_PREFIX, '');
		value = getValue(data, value) as never;

		switch (true) {
			case EXPRESSION_EVENT_PREFIX.test(name):
				mapEvent(element, name, value);
				break;

			case EXPRESSION_PERIOD.test(name) || typeof value === 'function' || isReactive(value):
				mapValue(data, element, name, value);
				break;

			case isBooleanAttribute(name):
				setProperty(element, name, true);
				break;

			default:
				break;
		}
	}
}

function mapValue(
	data: FragmentData,
	element: HTMLElement | SVGElement,
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
	element: HTMLElement | SVGElement,
	name: string,
	callback: GenericCallback,
): void {
	const value = computed(callback);

	data.mora.values.add(value);

	setAttribute(data, element, name, value);
}
