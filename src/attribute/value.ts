import {isNullableOrWhitespace} from '@oscarpalmer/atoms/is';
import {getString} from '@oscarpalmer/atoms/string';
import {isReactive} from '@oscarpalmer/mora';
import {setAttribute as setTorettoAttribute} from '@oscarpalmer/toretto/attribute';
import {setStyle} from '@oscarpalmer/toretto/style';
import {
	ATTRIBUTE_CLASS_PREFIX_LENGTH,
	ATTRIBUTE_NAME_DELIMITER,
	EXPRESSION_ATTRIBUTE_CLASS,
	EXPRESSION_ATTRIBUTE_STYLE_FULL,
	EXPRESSION_ATTRIBUTE_STYLE_PREFIX,
	EXPRESSION_ATTRIBUTE_STYLE_VARIABLE,
	VALUE_TRUE,
} from '../constants';
import type {FragmentData} from '../models';

function getStyleValue(value: unknown, unit: string, isVariable: boolean): string | undefined {
	if (removeStyleValue(value, unit, isVariable)) {
		return;
	}

	return value === true || value === VALUE_TRUE ? unit : `${getString(value)}${unit ?? ''}`;
}

function removeStyleValue(value: unknown, unit: unknown, isVariable: boolean): boolean {
	if (value == null || value === false || (isVariable && isNullableOrWhitespace(value))) {
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
	const classes = name.slice(ATTRIBUTE_CLASS_PREFIX_LENGTH).split(ATTRIBUTE_NAME_DELIMITER);

	updateValue(data, value, value => {
		if (value === true || value === VALUE_TRUE) {
			element.classList.add(...classes);
		} else {
			element.classList.remove(...classes);
		}
	});
}

function setStyleValues(
	data: FragmentData,
	element: HTMLElement | SVGElement,
	name: string,
	value: unknown,
): void {
	let [, property, unit] = EXPRESSION_ATTRIBUTE_STYLE_FULL.exec(name)!;

	const isVariable = EXPRESSION_ATTRIBUTE_STYLE_VARIABLE.test(name);

	updateValue(data, value, value => {
		setStyle(
			element,
			property as keyof CSSStyleDeclaration,
			getStyleValue(value, unit, isVariable),
		);
	});
}

function setValue(
	data: FragmentData,
	element: HTMLElement | SVGElement,
	name: string,
	value: unknown,
): void {
	updateValue(data, value, value => {
		setTorettoAttribute(element, name, value);
	});
}

function updateValue(data: FragmentData, value: unknown, updater: (value: unknown) => void): void {
	if (isReactive(value)) {
		data.mora.subscribers.add(value.subscribe(updater));
	} else {
		updater(value);
	}
}
