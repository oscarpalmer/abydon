import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import {getString} from '@oscarpalmer/atoms/string';
import {camelCase} from '@oscarpalmer/atoms/string/case';
import {isReactive} from '@oscarpalmer/mora';
import {setAttribute as setTorettoAttribute} from '@oscarpalmer/toretto/attribute';
import {setStyle} from '@oscarpalmer/toretto/style';
import {
	ATTRIBUTE_CLASS_PREFIX_LENGTH,
	ATTRIBUTE_NAME_DELIMITER,
	EXPRESSION_ATTRIBUTE_CLASS,
	EXPRESSION_ATTRIBUTE_STYLE_FULL,
	EXPRESSION_ATTRIBUTE_STYLE_PREFIX,
	EXPRESSION_ATTRIBUTE_STYLE_PROPERTY,
	PROPERTY_CHECKED,
	PROPERTY_VALUE,
	VALUE_TRUE,
} from '../constants';
import type {FragmentData} from '../models';

function getStyleValue(value: unknown, unit: string, isProperty: boolean): string | undefined {
	if (removeStyleValue(value, unit, isProperty)) {
		return;
	}

	return value === true || value === VALUE_TRUE ? unit : `${getString(value)}${unit ?? ''}`;
}

function removeStyleValue(value: unknown, unit: unknown, isProperty: boolean): boolean {
	if (value == null || value === false || (isProperty && isNullableOrWhitespace(value))) {
		return true;
	}

	return unit == null && (value === true || value === VALUE_TRUE);
}

export function setAttribute(
	data: FragmentData,
	element: HTMLElement | SVGElement,
	name: string,
	value: unknown,
): void {
	switch (true) {
		case EXPRESSION_ATTRIBUTE_CLASS.test(name):
			setClassValues(data, element, name, value);
			return;

		case EXPRESSION_ATTRIBUTE_STYLE_PREFIX.test(name):
			setStyleValues(data, element, name, value);
			return;

		default:
			setValue(data, element, name, value);
			break;
	}
}

function setClassValues(
	data: FragmentData,
	element: HTMLElement | SVGElement,
	name: string,
	value: unknown,
): void {
	function update(value: unknown): void {
		if (value === true || value === VALUE_TRUE) {
			element.classList.add(...classes);
		} else {
			element.classList.remove(...classes);
		}
	}

	const classes = name.slice(ATTRIBUTE_CLASS_PREFIX_LENGTH).split(ATTRIBUTE_NAME_DELIMITER);

	if (isReactive(value)) {
		data.mora.subscribers.add(value.subscribe(update));
	} else {
		update(value);
	}
}

function setStyleValues(
	data: FragmentData,
	element: HTMLElement | SVGElement,
	name: string,
	value: unknown,
): void {
	let [, property, unit] = EXPRESSION_ATTRIBUTE_STYLE_FULL.exec(name)!;

	const isProperty = EXPRESSION_ATTRIBUTE_STYLE_PROPERTY.test(name);

	property = camelCase(property);

	if (isProperty) {
		property = `--${property}`;
	}

	function update(value: unknown): void {
		setStyle(
			element,
			property as keyof CSSStyleDeclaration,
			getStyleValue(value, unit, isProperty),
		);
	}

	if (isReactive(value)) {
		data.mora.subscribers.add(value.subscribe(update));
	} else {
		update(value);
	}
}

function setValue(
	data: FragmentData,
	element: HTMLElement | SVGElement,
	name: string,
	value: unknown,
): void {
	const isReactiveValue = isReactive(value);

	unsetValue(element, name, isReactiveValue ? value.peek() : value);

	if (isReactiveValue) {
		data.mora.subscribers.add(
			value.subscribe(next => {
				setTorettoAttribute(element, name, next);
			}),
		);
	} else {
		setTorettoAttribute(element, name, value);
	}
}

function unsetValue(element: HTMLElement | SVGElement, name: string, value: unknown): void {
	if (name === PROPERTY_CHECKED) {
		(element as HTMLInputElement).checked = !(value === true || value === VALUE_TRUE);
	}

	if (name === PROPERTY_VALUE) {
		(element as HTMLInputElement).value = (element as HTMLInputElement).value === '' ? '_' : '';
	}
}
