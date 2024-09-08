import type {PlainObject} from '@oscarpalmer/atoms/models';
import {getString} from '@oscarpalmer/atoms/string';
import {effect, isReactive} from '@oscarpalmer/sentinel';
import {
	isBooleanAttribute,
	setAttribute as setAttr,
} from '@oscarpalmer/toretto/attribute';
import type {ProperElement} from '../../models';

const classExpression = /^class\./;
const styleFullExpression = /^style\.([\w-]+)(?:\.([\w-]+))?$/;
const stylePrefixExpression = /^style\./;

export function setAttribute(
	element: ProperElement,
	name: string,
	value: unknown,
): void {
	element.removeAttribute(name);

	switch (true) {
		case classExpression.test(name):
			setClasses(element, name, value);
			return;

		case stylePrefixExpression.test(name):
			setStyle(element, name, value);
			return;

		default:
			setValue(element, name, value);
			break;
	}
}

function setClasses(
	element: ProperElement,
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

	const classes = name.slice(6).split('.');

	if (isReactive(value)) {
		effect(() => {
			update(value.get());
		});
	} else {
		update(value);
	}
}

function setStyle(element: ProperElement, name: string, value: unknown): void {
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

	const [, property, unit] = styleFullExpression.exec(name) ?? [];

	if (property != null) {
		if (isReactive(value)) {
			effect(() => {
				update(value.get());
			});
		} else {
			update(value);
		}
	}
}

function setValue(element: ProperElement, name: string, value: unknown): void {
	const callback =
		isBooleanAttribute(name) && name in element
			? name === 'selected'
				? updateSelected
				: updateProperty
			: setAttr;

	if (isReactive(value)) {
		effect(() => {
			callback(element, name, value.get());
		});
	} else {
		callback(element, name, value);
	}
}

function triggerSelectChange(select: HTMLSelectElement): void {
	if (select != null) {
		select.dispatchEvent(new Event('change', {bubbles: true}));
	}
}

function updateProperty(
	element: ProperElement,
	name: string,
	value: unknown,
): void {
	(element as unknown as PlainObject)[name] = value === true;
}

function updateSelected(
	element: ProperElement,
	name: string,
	value: unknown,
): void {
	const select = element.closest('select') as HTMLSelectElement;
	const options = [...(select?.options ?? [])];

	if (select != null && options.includes(element as HTMLOptionElement)) {
		triggerSelectChange(select);
	}

	updateProperty(element, name, value);
}
