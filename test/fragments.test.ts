import {expect, test} from 'vitest';
import * as Abydon from '../src/index';

test('basic', () => {
	const array = Abydon.array([1, 2, 3]);

	const fragments = Abydon.fragments(
		array,
		item => item,
		item => Abydon.html`${item}`,
	);

	const fragment = Abydon.html`<p>${fragments}</p>`;

	fragment.appendTo(document.body);

	expect(document.body.innerHTML).toBe('<p>123</p>');

	array.push(4, 5, 6);

	expect(document.body.innerHTML).toBe('<p>123456</p>');

	array.splice(1, 2);

	expect(document.body.innerHTML).toBe('<p>1456</p>');

	array.unshift(0);

	expect(document.body.innerHTML).toBe('<p>01456</p>');

	array.set([6, 5, 4, 3, 2, 1]);

	expect(document.body.innerHTML).toBe('<p>654321</p>');

	array.set([]);

	expect(document.body.innerHTML).toBe('<p><!--abydon.0--></p>');

	fragment.remove();

	expect(document.body.innerHTML).toBe('');
});

test('error', () => {
	const array = Abydon.array([1, 1, 1]);

	const fn = () => {};

	let count = 0;

	expect(() => Abydon.fragments(null as never, fn, fn as never)).toThrow(TypeError);
	expect(() => Abydon.fragments(array, null as never, fn as never)).toThrow(TypeError);
	expect(() => Abydon.fragments(array, fn, null as never)).toThrow(TypeError);

	expect(() =>
		Abydon.fragments(
			array,
			() => null,
			item => Abydon.html`${item}`,
		),
	).toThrow(Error);
	expect(() =>
		Abydon.fragments(
			array,
			item => item,
			item => Abydon.html`${item}`,
		),
	).toThrow(Error);

	expect(() =>
		Abydon.fragments(
			array,
			() => ++count,
			() => null as never,
		),
	).toThrow(Error);
});
