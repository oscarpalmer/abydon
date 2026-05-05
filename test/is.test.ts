import {expect, test} from 'vitest';
import * as Abydon from '../src/index';

test('', () => {
	const values = [
		null,
		undefined,
		true,
		123,
		123n,
		'abc',
		Symbol('abc'),
		{},
		[],
		() => {},
		new Map(),
		new Set(),
		new Date(),
		new RegExp('abc'),
	];

	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		const value = values[index];

		expect(Abydon.isFragment(value)).toBe(false);
		expect(Abydon.isFragments(value)).toBe(false);
	}

	const fragment = Abydon.html``;
	const fragments = Abydon.fragments(
		Abydon.array([]),
		() => -1,
		() => Abydon.html``,
	);

	expect(Abydon.isFragment(fragment)).toBe(true);
	expect(Abydon.isFragments(fragment)).toBe(false);

	expect(Abydon.isFragments(fragments)).toBe(true);
	expect(Abydon.isFragment(fragments)).toBe(false);
});
