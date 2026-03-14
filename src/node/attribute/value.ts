import type {PlainObject} from '@oscarpalmer/atoms/models';
import {isReactive} from '@oscarpalmer/mora';
import {
	isBooleanAttribute,
	setAttribute as setTorettoAttribute,
} from '@oscarpalmer/toretto/attribute';
import {
	ATTRIBUTE_CLASS_PREFIX_LENGTH,
	EXPRESSION_ATTRIBUTE_CLASS,
	EXPRESSION_ATTRIBUTE_STYLE_FULL,
	EXPRESSION_ATTRIBUTE_STYLE_PREFIX,
} from '../../constants';
import type {FragmentData} from '../../models';

function getCallback(element: HTMLElement | SVGElement, name: string) {
	if (isBooleanAttribute(name) && name in element) {
		return name === 'checked' ? updateChecked : updateProperty;
	}

	return name === 'value' ? updateValue : setTorettoAttribute;
}

export function setAttribute(
	data: FragmentData,
	element: HTMLElement | SVGElement,
	name: string,
	value: unknown,
): void {
	switch (true) {
		case EXPRESSION_ATTRIBUTE_CLASS.test(name):
			setClasses(data, element, name, value);
			return;

		case EXPRESSION_ATTRIBUTE_STYLE_PREFIX.test(name):
			setStyle(data, element, name, value);
			return;

		default:
			setValue(data, element, name, value);
			break;
	}
}

function setClasses(
	data: FragmentData,
	element: HTMLElement | SVGElement,
	name: string,
	value: unknown,
): void {
	function update(value: unknown): void {
		if (value === true) {
			element.classList.add(...classes);
		} else {
			element.classList.remove(...classes);
		}
	}

	const classes = name.slice(ATTRIBUTE_CLASS_PREFIX_LENGTH).split('.');

	if (isReactive(value)) {
		data.mora.subscribers.add(value.subscribe(update));
	} else {
		update(value);
	}
}

function setStyle(
	data: FragmentData,
	element: HTMLElement | SVGElement,
	name: string,
	value: unknown,
): void {
	const [, property, unit] = EXPRESSION_ATTRIBUTE_STYLE_FULL.exec(name) ?? [];

	if (property == null) {
		return;
	}

	function update(value: unknown): void {
		if (value == null || value === false || (value === true && unit == null)) {
			element.style.removeProperty(property);
		} else {
			element.style.setProperty(property, value === true ? unit : String(value));
		}
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
	const callback = getCallback(element, name);

	if (isReactive(value)) {
		data.mora.subscribers.add(
			value.subscribe(next => {
				callback(element, name, next);
			}),
		);
	} else {
		callback(element, name, value);
	}
}

function updateChecked(element: HTMLElement | SVGElement, name: string, value: unknown): void {
	updateElement('change', 'checked', element, name, value, value === true);
}

function updateElement(
	event: string,
	property: string,
	element: HTMLElement | SVGElement,
	name: string,
	value: unknown,
	next: unknown,
): void {
	if (!(property in element) || (element as unknown as PlainObject)[property] === next) {
		return;
	}

	setTorettoAttribute(element, name, value);

	if ((element as unknown as PlainObject)[property] === next) {
		return;
	}

	(element as unknown as PlainObject)[property] = next;

	element.dispatchEvent(new Event(event, {bubbles: true}));
}

function updateProperty(element: HTMLElement | SVGElement, name: string, value: unknown): void {
	setTorettoAttribute(element, name, value === true);
}

function updateValue(element: HTMLElement | SVGElement, name: string, value: unknown): void {
	updateElement(
		element instanceof HTMLSelectElement ? 'change' : 'input',
		'value',
		element,
		name,
		value,
		String(value),
	);
}
