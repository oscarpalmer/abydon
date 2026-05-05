import {expect, test} from 'vitest';
import * as Abydon from '../src/index';

test('any', () => {
	const value = Abydon.signal('test');
	const hidden = Abydon.computed(() => value.get() === 'test');

	const fragment = Abydon.html`<div hidden="${hidden}" id="${{abc: 123}}">
	<input type="checkbox" checked="${() => value.get() === 'test'}">
	<input type="checkbox" checked="${[1, 2, 3]}">
</div>`;

	fragment.appendTo(document.body);

	const div = document.querySelector('div')!;
	const input = document.querySelector('input')!;

	expect(div.hidden).toBe(true);
	expect(input.checked).toBe(true);

	value.set('changed');

	expect(div.hidden).toBe(false);
	expect(input.checked).toBe(false);

	fragment.remove();
});

test('class', () =>
	new Promise<void>(done => {
		const bool = Abydon.signal(false);

		const fragment = Abydon.html`<div class.foo="${bool}" class.bar="${true}">test</div>`;

		fragment.appendTo(document.body);

		const div = document.querySelector('div')!;

		expect(div.classList.contains('bar')).toBe(true);
		expect(div.classList.contains('foo')).toBe(false);

		bool.set(true);

		setTimeout(() => {
			expect(div.classList.contains('bar')).toBe(true);
			expect(div.classList.contains('foo')).toBe(true);

			bool.set(false);
		}, 25);

		setTimeout(() => {
			expect(div.classList.contains('bar')).toBe(true);
			expect(div.classList.contains('foo')).toBe(false);

			fragment.remove();

			done();
		}, 50);
	}));

test('style', () =>
	new Promise<void>(done => {
		const background = Abydon.signal(false);
		const color = Abydon.signal('red');
		const fontSize = Abydon.signal<number | undefined>(undefined);
		const property = Abydon.signal('value');

		const fragment = Abydon.html`<div style.background.red="${background}" style.color="${color}" style.font-size.px="${fontSize}" style.position.absolute="${true}" style.--property="${property}">test</div>`;

		fragment.appendTo(document.body);

		const div = document.querySelector('div')!;

		expect(div.style.backgroundColor).toBe('');
		expect(div.style.color).toBe('red');
		expect(div.style.fontSize).toBe('');
		expect(div.style.position).toBe('absolute');
		expect(div.style.getPropertyValue('--property')).toBe('value');

		background.set(true);
		color.set('blue');
		fontSize.set(16);
		property.set('changed');

		setTimeout(() => {
			expect(div.style.backgroundColor).toBe('red');
			expect(div.style.color).toBe('blue');
			expect(div.style.fontSize).toBe('16px');
			expect(div.style.getPropertyValue('--property')).toBe('changed');

			color.set('green');
			fontSize.set(undefined);
			property.set('');
		}, 25);

		setTimeout(() => {
			expect(div.style.backgroundColor).toBe('red');
			expect(div.style.color).toBe('green');
			expect(div.style.fontSize).toBe('');
			expect(div.style.getPropertyValue('--property')).toBe('');

			fragment.remove();

			done();
		}, 50);
	}));

test('value', () =>
	new Promise<void>(done => {
		const checked = Abydon.signal(false);
		const text = Abydon.signal('test');

		const fragment = Abydon.html`<input type="checkbox" checked="${checked}"><input type="text" value="${text}">`;

		fragment.appendTo(document.body);

		const checkboxInput = document.querySelector('input[type="checkbox"]')! as HTMLInputElement;
		const textInput = document.querySelector('input[type="text"]')! as HTMLInputElement;

		expect(checkboxInput.checked).toBe(false);
		expect(textInput.value).toBe('test');

		checked.set(true);
		text.set('changed from signal');

		setTimeout(() => {
			expect(checkboxInput.checked).toBe(true);
			expect(textInput.value).toBe('changed from signal');

			checkboxInput.checked = false;
			textInput.value = 'changed in gui';

			checkboxInput.dispatchEvent(new Event('change', {bubbles: true}));
			textInput.dispatchEvent(new Event('input', {bubbles: true}));

			setTimeout(() => {
				expect(checked.peek()).toBe(false);
				expect(text.peek()).toBe('changed in gui');

				fragment.remove();

				done();
			}, 25);
		}, 25);
	}));
