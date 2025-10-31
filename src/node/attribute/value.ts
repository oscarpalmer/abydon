import type {PlainObject} from '@oscarpalmer/atoms/models';
import {getString} from '@oscarpalmer/atoms/string';
import {isReactive} from '@oscarpalmer/mora';
import {
	isBooleanAttribute,
	setAttribute as setAttr,
} from '@oscarpalmer/toretto/attribute';
import type {HTMLOrSVGElement} from '@oscarpalmer/toretto/models';
import {
	ATTRIBUTE_CLASS_PREFIX_LENGTH,
	EXPRESSION_ATTRIBUTE_CLASS,
	EXPRESSION_ATTRIBUTE_STYLE_FULL,
	EXPRESSION_ATTRIBUTE_STYLE_PREFIX,
} from '../../constants';
import type {FragmentData} from '../../models';

export function setAttribute(
	data: FragmentData,
	element: HTMLOrSVGElement,
	name: string,
	value: unknown,
): void {
	element.removeAttribute(name);

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
	element: HTMLOrSVGElement,
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
	element: HTMLOrSVGElement,
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
			element.style.setProperty(
				property,
				value === true ? unit : getString(value),
			);
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
	element: HTMLOrSVGElement,
	name: string,
	value: unknown,
): void {
	let callback: (
		element: HTMLOrSVGElement,
		name: string,
		value: unknown,
	) => void;

	if (isBooleanAttribute(name) && name in element) {
		callback = name === 'selected' ? updateSelected : updateProperty;
	} else {
		callback = setAttr;
	}

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

function updateProperty(
	element: HTMLOrSVGElement,
	name: string,
	value: unknown,
): void {
	(element as unknown as PlainObject)[name] = value === true;
}

function updateSelected(
	element: HTMLOrSVGElement,
	name: string,
	value: unknown,
): void {
	const select = element.closest('select') as HTMLSelectElement;
	const options = [...(select?.options ?? [])];

	if (select != null && options.includes(element as HTMLOptionElement)) {
		select.dispatchEvent(new Event('change', {bubbles: true}));
	}

	updateProperty(element, name, value);
}
