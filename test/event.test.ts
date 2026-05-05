import {expect, test} from 'vitest';
import * as Abydon from '../src/index';

test('basic', () =>
	new Promise<void>(done => {
		function onEvent(key: keyof typeof result, event: Event): void {
			result[key] = event.type;
		}

		const obj = {
			test: 'should not result in an event listener',
		};

		const result = {
			a: undefined as unknown as string,
			button: undefined as unknown as string,
			checkbox: undefined as unknown as string,
			details: undefined as unknown as string,
			divClick: undefined as unknown as string,
			divDefault: undefined as unknown as string,
			form: undefined as unknown as string,
			input: undefined as unknown as string,
			radio: undefined as unknown as string,
			select: undefined as unknown as string,
			submit: undefined as unknown as string,
			textarea: undefined as unknown as string,
		};

		let divClicks = 0;

		const fragment = Abydon.html`<a href="#" @on="${(event: Event) => onEvent('a', event)}">test</a>
<button @on="${(event: Event) => onEvent('button', event)}">test</button>
<input type="checkbox" @on="${(event: Event) => onEvent('checkbox', event)}" />
<details @on="${(event: Event) => onEvent('details', event)}"><summary>test</summary></details>
<div id="div_click" @click="${[
			(event: Event) => onEvent('divClick', event),
			() => {
				divClicks += 1;
			},
		]}"></div>
<div id="div_default" @on="${(event: Event) => onEvent('divDefault', event)}"></div>
<div id="div_fail_1" @="${obj}"></div>
<div id="div_fail_2" @on="${obj}"></div>
<form @on="${(event: Event) => onEvent('form', event)}"><button type="submit">test</button></form>
<input type="text" @on="${(event: Event) => onEvent('input', event)}" />
<input type="radio" @on="${(event: Event) => onEvent('radio', event)}" />
<select @on="${(event: Event) => onEvent('select', event)}"><option>test</option></select>
<input type="submit" @on="${(event: Event) => onEvent('submit', event)}" />
<textarea @on="${(event: Event) => onEvent('textarea', event)}">test</textarea>`;

		fragment.appendTo(document.body);

		const a = document.querySelector('a')!;
		const button = document.querySelector('button')!;
		const checkbox = document.querySelector('input[type="checkbox"]')!;
		const details = document.querySelector('details')!;
		const divClick = document.querySelector('#div_click')!;
		const divDefault = document.querySelector('#div_default')!;
		const form = document.querySelector('form')!;
		const input = document.querySelector('input[type="text"]')!;
		const radio = document.querySelector('input[type="radio"]')!;
		const select = document.querySelector('select')!;
		const submit = document.querySelector('input[type="submit"]')!;
		const textarea = document.querySelector('textarea')!;

		a.dispatchEvent(new MouseEvent('click', {bubbles: true}));
		button.dispatchEvent(new MouseEvent('click', {bubbles: true}));
		checkbox.dispatchEvent(new MouseEvent('click', {bubbles: true}));
		details.dispatchEvent(new MouseEvent('toggle', {bubbles: true}));
		divDefault.dispatchEvent(new MouseEvent('click', {bubbles: true}));
		form.dispatchEvent(new SubmitEvent('submit', {bubbles: true}));
		input.dispatchEvent(new InputEvent('input', {bubbles: true}));
		radio.dispatchEvent(new MouseEvent('click', {bubbles: true}));
		select.dispatchEvent(new Event('change', {bubbles: true}));
		submit.dispatchEvent(new MouseEvent('submit', {bubbles: true}));
		textarea.dispatchEvent(new InputEvent('input', {bubbles: true}));

		for (let index = 0; index < 5; index += 1) {
			divClick.dispatchEvent(new MouseEvent('click', {bubbles: true}));
		}

		setTimeout(() => {
			expect(divClicks).toBe(5);

			expect(result).toEqual({
				a: 'click',
				button: 'click',
				checkbox: 'change',
				details: 'toggle',
				divClick: 'click',
				divDefault: undefined,
				form: 'submit',
				input: 'input',
				radio: 'change',
				select: 'change',
				submit: 'submit',
				textarea: 'input',
			});

			fragment.remove();

			done();
		}, 25);
	}));

test('options + propagation', () =>
	new Promise<void>(done => {
		function onClick(name: string, event?: Event): void {
			if (event != null) {
				event[name === 'stop' ? 'stopPropagation' : 'preventDefault']();
			}

			order.push(name);
		}

		const fragment = Abydon.html`<div @click:capture="${() => onClick('parent')}">
	<button id="once" @click:once="${() => onClick('once')}"></button>
	<div id="none" @click="${() => onClick('none')}">
		<button id="stop" @click="${(event: Event) => onClick('stop', event)}"></button>
	</div>
	<details @toggle="${() => onClick('details')}">
		<summary @click:active="${(event: Event) => onClick('summary', event)}">test</summary>
		<div>test</div>
	</details>
</div>`;

		const order: string[] = [];

		fragment.appendTo(document.body);

		const details = document.querySelector('details')!;
		const none = document.querySelector('#none')!;
		const once = document.querySelector('#once')!;
		const stop = document.querySelector('#stop')!;
		const summary = document.querySelector('summary')!;

		once.dispatchEvent(new MouseEvent('click', {bubbles: true}));
		once.dispatchEvent(new MouseEvent('click', {bubbles: true}));

		setTimeout(() => {
			expect(order).toEqual(['parent', 'once', 'parent']);

			none.dispatchEvent(new MouseEvent('click', {bubbles: true}));
			none.dispatchEvent(new MouseEvent('click', {bubbles: true}));
		}, 25);

		setTimeout(() => {
			expect(order).toEqual(['parent', 'once', 'parent', 'parent', 'none', 'parent', 'none']);

			stop.dispatchEvent(new MouseEvent('click', {bubbles: true}));
			stop.dispatchEvent(new MouseEvent('click', {bubbles: true}));
		}, 50);

		setTimeout(() => {
			expect(order).toEqual([
				'parent',
				'once',
				'parent',

				'parent',
				'none',
				'parent',
				'none',

				'parent',
				'stop',
				'parent',
				'stop',
			]);

			expect(details.open).toBe(false);

			summary.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));

			expect(details.open).toBe(false);

			summary.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));
		}, 50);

		setTimeout(() => {
			expect(details.open).toBe(false);

			expect(order).toEqual([
				'parent',
				'once',
				'parent',

				'parent',
				'none',
				'parent',
				'none',

				'parent',
				'stop',
				'parent',
				'stop',

				'parent',
				'summary',
				'parent',
				'summary',
			]);
		}, 75);

		setTimeout(() => {
			fragment.remove();

			done();
		}, 100);
	}));

test('select', () => {
	function onEvent(event: Event): void {
		values.push((event.target as HTMLSelectElement).value);
	}

	const value = Abydon.signal('2');
	const hidden = Abydon.computed(() => value.get() === '2');

	const values: string[] = [];

	const fragment = Abydon.html`<select hidden="${hidden}" value="${value}" @on="${onEvent}">
	<option value="1">Option 1</option>
	<option value="2">Option 2</option>
	<option value="3">Option 3</option>
</select>`;

	fragment.appendTo(document.body);

	const select = document.querySelector('select')!;
	const options = [...select.querySelectorAll('option')];

	expect(select.value).toBe('2');
	expect(values).toEqual(['2']);
	expect(options.map(option => option.selected)).toEqual([false, true, false]);

	value.set('3');

	expect(select.value).toBe('3');
	expect(values).toEqual(['2', '3']);
	expect(options.map(option => option.selected)).toEqual([false, false, true]);

	select.value = '1';

	select.dispatchEvent(new Event('change', {cancelable: true, bubbles: true}));

	expect(value.peek()).toBe('1');
	expect(values).toEqual(['2', '3', '1']);
	expect(options.map(option => option.selected)).toEqual([true, false, false]);

	options[1]!.selected = true;

	select.dispatchEvent(new Event('change', {cancelable: true, bubbles: true}));

	expect(value.peek()).toBe('2');
	expect(values).toEqual(['2', '3', '1', '2']);
	expect(options.map(option => option.selected)).toEqual([false, true, false]);

	fragment.remove();
});

test('textarea', () => {
	const value = Abydon.signal('test');
	const computed = Abydon.computed(() => value.get().toLocaleUpperCase());

	const fragment = Abydon.html`<textarea>${value}</textarea>
<textarea>${computed}</textarea>
<textarea>${() => value.get().split('').join('-')}</textarea>
<textarea>${{abc: 123}}</textarea>`;

	fragment.appendTo(document.body);

	const textAreas = document.querySelectorAll('textarea');

	const one = textAreas[0]! as HTMLTextAreaElement;
	const two = textAreas[1]! as HTMLTextAreaElement;
	const three = textAreas[2]! as HTMLTextAreaElement;
	const four = textAreas[3]! as HTMLTextAreaElement;

	expect(document.body.innerHTML).toBe(`<textarea></textarea>
<textarea></textarea>
<textarea></textarea>
<textarea></textarea>`);

	expect(one.value).toBe('test');
	expect(two.value).toBe('TEST');
	expect(three.value).toBe('t-e-s-t');
	expect(four.value).toBe('');

	value.set('changed');

	expect(document.body.innerHTML).toBe(`<textarea></textarea>
<textarea></textarea>
<textarea></textarea>
<textarea></textarea>`);

	expect(one.value).toBe('changed');
	expect(two.value).toBe('CHANGED');
	expect(three.value).toBe('c-h-a-n-g-e-d');
	expect(four.value).toBe('');

	one.value = 'input';

	one.dispatchEvent(new InputEvent('input', {bubbles: true}));

	expect(value.peek()).toBe('input');
	expect(computed.peek()).toBe('INPUT');

	expect(document.body.innerHTML).toBe(`<textarea></textarea>
<textarea></textarea>
<textarea></textarea>
<textarea></textarea>`);

	expect(one.value).toBe('input');
	expect(two.value).toBe('INPUT');
	expect(three.value).toBe('i-n-p-u-t');
	expect(four.value).toBe('');

	fragment.remove();
});
