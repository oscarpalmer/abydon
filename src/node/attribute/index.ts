import type {GenericCallback} from '@oscarpalmer/atoms/models';
import {parse} from '@oscarpalmer/atoms/string';
import {computed, isReactive, isSignal} from '@oscarpalmer/mora';
import {
	EVENT_ON_PREFIXED,
	EXPRESSION_ABYDON_ATTRIBUTE_PREFIX,
	EXPRESSION_ABYDON_CONTENT,
	EXPRESSION_EVENT_PREFIX,
	EXPRESSION_PERIOD,
	PROPERTY_VALUE,
} from '../../constants';
import {isInputElement} from '../../helpers/dom';
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

			case EXPRESSION_PERIOD.test(actualName):
			case typeof actualValue === 'function':
			case isReactive(actualValue):
				mapValue(data, element, actualName, actualValue);
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

	if (name === PROPERTY_VALUE && isInputElement(element) && isSignal(value)) {
		mapEvent(element, EVENT_ON_PREFIXED, () => {
			value.set(parse(element.value) ?? element.value);
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
