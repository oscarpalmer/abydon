import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {computed, isSignal} from '@oscarpalmer/mora';
import {
	EVENT_ON_VALUE,
	EXPRESSION_ABYDON_ATTRIBUTE_PREFIX,
	EXPRESSION_ABYDON_CONTENT,
	EXPRESSION_EVENT_PREFIX,
	INPUT_TYPE_CHECKBOX,
	INPUT_TYPE_RADIO,
	PROPERTY_CHECKED,
	PROPERTY_VALUE,
} from '../constants';
import {isInputElement} from '../helpers/dom';
import type {FragmentData} from '../models';
import {mapEvent} from '../node/event';
import {setAttribute} from './value';

function getValue(data: FragmentData, original: string): unknown {
	const matches = EXPRESSION_ABYDON_CONTENT.exec(original);

	return matches == null ? original : data.values[+matches[1]];
}

export function mapAttributes(data: FragmentData, element: HTMLElement | SVGElement): void {
	const attributes = [...element.attributes].sort((first, second) =>
		first.name.localeCompare(second.name),
	);

	const {length} = attributes;

	for (let index = 0; index < length; index += 1) {
		const {name, value} = attributes[index];

		const actualName = name.replace(EXPRESSION_ABYDON_ATTRIBUTE_PREFIX, '');
		const actualValue = getValue(data, value) as never;

		if (actualName !== name) {
			element.removeAttribute(name);
		}

		switch (true) {
			case EXPRESSION_EVENT_PREFIX.test(actualName):
				mapEvent(element, actualName, actualValue);
				break;

			default:
				mapValue(data, element, actualName, actualValue);
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

	if (isInputElement(element) && isSignal(value) && name in element) {
		mapEvent(element, EVENT_ON_VALUE, () => {
			value.set(element[name as keyof typeof element]);
		});
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
