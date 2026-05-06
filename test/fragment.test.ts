import {expect, test} from 'vitest';
import * as Abydon from '../src/index';

test('array: complex', () => {
	const array = Abydon.array([1, 2, 3]);

	const items = array.map(item => Abydon.html`<p>${item}</p>`.configure({identifier: item}));

	const fragment = Abydon.html`${items}`;

	fragment.appendTo(document.body);

	expect(document.body.innerHTML).toBe('<p>1</p><p>2</p><p>3</p>');

	array.push(4);

	expect(document.body.innerHTML).toBe('<p>1</p><p>2</p><p>3</p><p>4</p>');

	array.splice(1, 2);

	expect(document.body.innerHTML).toBe('<p>1</p><p>4</p>');

	array.set([5, 6]);

	expect(document.body.innerHTML).toBe('<p>5</p><p>6</p>');

	array.push(5, 6);

	expect(document.body.innerHTML).toBe('<p>5</p><p>6</p><p>5</p><p>6</p>');

	fragment.remove();
});

test('array: simple', () => {
	const array = Abydon.signal([1, 2, 3]);

	const fragment = Abydon.html`${array}`;

	fragment.appendTo(document.body);

	expect(document.body.innerHTML).toBe('123');

	array.set([]);

	expect(document.body.innerHTML).toBe('<!--abydon.0-->');

	array.set([4, 5]);

	expect(document.body.innerHTML).toBe('45');

	fragment.remove();

	expect(document.body.innerHTML).toBe('');
});

test('basic', () => {
	const value = Abydon.signal('Hello, world!');

	const fragment = Abydon.html`<div>
	<!-- this is an ignored comment -->
	<p>${'Hello, world!'}</p>
	<p>${value}</p>
	<p>${() => value.get().toUpperCase()}</p>
	<p>${[123, true, null, undefined, 'test']}</p>
	<p>${() => [123, true, null, undefined, 'test']}</p>
</div>`;

	expect(document.body.innerHTML).toBe('');

	fragment.appendTo(document.body);

	expect(document.body.innerHTML).toBe(`<div>
	<!-- this is an ignored comment -->
	<p>Hello, world!</p>
	<p>Hello, world!</p>
	<p>HELLO, WORLD!</p>
	<p>123truetest</p>
	<p>123truetest</p>
</div>`);

	fragment.remove();

	expect(document.body.innerHTML).toBe('');

	fragment.appendTo(document.body);

	expect(document.body.innerHTML).toBe(`<div>
	<!-- this is an ignored comment -->
	<p>Hello, world!</p>
	<p>Hello, world!</p>
	<p>HELLO, WORLD!</p>
	<p>123truetest</p>
	<p>123truetest</p>
</div>`);

	value.set('Goodbye, world!');

	expect(document.body.innerHTML).toBe(`<div>
	<!-- this is an ignored comment -->
	<p>Hello, world!</p>
	<p>Goodbye, world!</p>
	<p>GOODBYE, WORLD!</p>
	<p>123truetest</p>
	<p>123truetest</p>
</div>`);

	value.set('');

	expect(document.body.innerHTML).toBe(`<div>
	<!-- this is an ignored comment -->
	<p>Hello, world!</p>
	<p><!--abydon.0--></p>
	<p><!--abydon.1--></p>
	<p>123truetest</p>
	<p>123truetest</p>
</div>`);

	fragment.remove();
});

test('get', () => {
	const child = Abydon.html`<p>Child</p>`;
	const parent = Abydon.html`${child}`;

	const nodes = parent.get();

	expect(nodes).toEqual([child.get()[0]]);

	expect(nodes.map(node => (node instanceof HTMLElement ? node.outerHTML : ''))).toEqual([
		'<p>Child</p>',
	]);
});

test('nested', () => {
	const element = document.createElement('div');

	element.textContent = 'Node';

	const first = Abydon.html`<b>First</b>`;
	const second = Abydon.html`<i>Second</i>`;

	const bool = Abydon.signal(true);
	const node = Abydon.signal(element);
	const prefix = Abydon.html`${{abc: 123}}`;
	const span = Abydon.html`<span>Span</span>`;
	const suffix = Abydon.html`<span>Suffix</span>`;
	const text = Abydon.signal({abc: 123});

	const fragment = Abydon.computed(() => (bool.get() ? first : second));

	const parent = Abydon.html`${prefix}<div>${fragment}${node}${span}${text}</div>${suffix}`;

	expect(document.body.innerHTML).toBe('');

	parent.appendTo(document.body);

	expect(document.body.innerHTML).toBe(
		`{"abc":123}<div><b>First</b><div>Node</div><span>Span</span>{"abc":123}</div><span>Suffix</span>`,
	);

	bool.set(false);

	expect(document.body.innerHTML).toBe(
		`{"abc":123}<div><i>Second</i><div>Node</div><span>Span</span>{"abc":123}</div><span>Suffix</span>`,
	);

	parent.remove();

	expect(document.body.innerHTML).toBe('');
});

test('options', () => {
	const fragment = Abydon.html`<div>Hello, world!</div>`;

	expect(fragment.cache).toBe(true);
	expect(fragment.identifier).toBe(undefined);

	fragment.configure({identifier: 'test'});

	expect(fragment.identifier).toBe('test');

	fragment.configure({cache: false});
	fragment.configure({identifier: 'configured'});

	expect(fragment.cache).toBe(false);
	expect(fragment.identifier).toBe('configured');

	fragment.configure({cache: 123 as never});
	fragment.configure({identifier: undefined});

	expect(fragment.cache).toBe(false);
	expect(fragment.identifier).toBe(undefined);

	fragment.configure(123 as never);

	expect(fragment.cache).toBe(false);
	expect(fragment.identifier).toBe(undefined);
});

test('position', () => {
	const body = Abydon.html`<div><span></span></div>`;
	const fragment = Abydon.html`<p></p>`;

	body.appendTo(document.body);

	const div = document.querySelector('div')!;

	expect(document.body.innerHTML).toBe('<div><span></span></div>');

	fragment.after(div);

	expect(document.body.innerHTML).toBe('<div><span></span></div><p></p>');

	fragment.before(div);

	expect(document.body.innerHTML).toBe('<p></p><div><span></span></div>');

	fragment.appendTo(div);

	expect(document.body.innerHTML).toBe('<div><span></span><p></p></div>');

	fragment.prependTo(div);

	expect(document.body.innerHTML).toBe('<div><p></p><span></span></div>');

	fragment.remove();

	expect(document.body.innerHTML).toBe('<div><span></span></div>');

	body.remove();

	expect(document.body.innerHTML).toBe('');
});
