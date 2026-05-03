import {expect, test} from 'vitest';
import * as Abydon from '../src/index';

test('attribute: class', () =>
	new Promise<void>(done => {
		const bool = Abydon.signal(false);

		const fragment = Abydon.html`<div class.test="${bool}">test</div>`;

		fragment.appendTo(document.body);

		const div = document.querySelector('div')!;

		expect(div.classList.contains('test')).toBe(false);

		bool.set(true);

		setTimeout(() => {
			expect(div.classList.contains('test')).toBe(true);

			bool.set(false);
		}, 25);

		setTimeout(() => {
			expect(div.classList.contains('test')).toBe(false);

			fragment.remove();

			done();
		}, 50);
	}));

test('attribute: style', () =>
	new Promise<void>(done => {
		const background = Abydon.signal(false);
		const color = Abydon.signal('red');
		const fontSize = Abydon.signal<number | undefined>(undefined);

		const fragment = Abydon.html`<div style.background.red="${background}" style.color="${color}" style.font-size.px="${fontSize}">test</div>`;

		fragment.appendTo(document.body);

		const div = document.querySelector('div')!;

		expect(div.style.backgroundColor).toBe('');
		expect(div.style.color).toBe('red');
		expect(div.style.fontSize).toBe('');

		background.set(true);
		color.set('blue');
		fontSize.set(16);

		setTimeout(() => {
			expect(div.style.backgroundColor).toBe('red');
			expect(div.style.color).toBe('blue');
			expect(div.style.fontSize).toBe('16px');

			color.set('green');
			fontSize.set(undefined);
		}, 25);

		setTimeout(() => {
			expect(div.style.backgroundColor).toBe('red');
			expect(div.style.color).toBe('green');
			expect(div.style.fontSize).toBe('');

			fragment.remove();

			done();
		}, 50);
	}));

test('basic', () => {
	const fragment = Abydon.html`<div>test</div>`;

	expect(document.body.innerHTML).toBe('');

	fragment.appendTo(document.body);

	expect(document.body.innerHTML).toBe('<div>test</div>');

	fragment.remove();

	expect(document.body.innerHTML).toBe('');
});
