import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {isSignal} from '@oscarpalmer/mora';
import {isInputElement} from '@oscarpalmer/toretto/is';
import {
	EVENT_ON_VALUE,
	EXPRESSION_ABYDON_ATTRIBUTE_PREFIX,
	EXPRESSION_ABYDON_CONTENT,
	EXPRESSION_EVENT_PREFIX,
	PROPERTY_VALUE,
} from '../constants';
import {setComputedValue} from '../helpers';
import type {FragmentData} from '../models';
import {mapEvent} from '../node/event';
import {setAttribute} from './value';

function compareAttributes(first: Attr, second: Attr): number {
	return first.name.localeCompare(second.name);
}

function getValue(data: FragmentData, original: string): unknown {
	const matches = EXPRESSION_ABYDON_CONTENT.exec(original);

	return matches == null ? original : data.values[+matches[1]];
}

export function mapAttributeValue(
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

	if (isInputElement(element) && isSignal(value) && name in element) {
		mapEvent(element, EVENT_ON_VALUE, () => {
			value.set(element[name as keyof typeof element]);
		});
	}
}

export function mapAttributes(
	data: FragmentData,
	element: HTMLElement | SVGElement,
	ignoreValue: boolean,
): void {
	const attributes = [...element.attributes].sort(compareAttributes);

	const {length} = attributes;

	for (let index = 0; index < length; index += 1) {
		const {name, value} = attributes[index];

		const actualName = name.replace(EXPRESSION_ABYDON_ATTRIBUTE_PREFIX, '');
		const actualValue = getValue(data, value);

		if (actualName !== name) {
			element.removeAttribute(name);
		}

		if (actualName === PROPERTY_VALUE && ignoreValue) {
			continue;
		}

		switch (true) {
			case EXPRESSION_EVENT_PREFIX.test(actualName):
				mapEvent(element, actualName, actualValue);
				break;

			default:
				mapAttributeValue(data, element, actualName, actualValue);
				break;
		}
	}
}

function setComputedAttribute(
	data: FragmentData,
	element: HTMLElement | SVGElement,
	name: string,
	callback: GenericCallback,
): void {
	setComputedValue(data, callback, computation => {
		setAttribute(data, element, name, computation);
	});
}
