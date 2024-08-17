import type {ProperElement} from '../models';

function getOptions(options: string): AddEventListenerOptions {
	const parts = options.split(':');

	return {
		capture: parts.includes('c') || parts.includes('capture'),
		once: parts.includes('o') || parts.includes('once'),
		passive: !parts.includes('a') && !parts.includes('active'),
	};
}

export function mapEvent(
	element: ProperElement,
	name: string,
	value: unknown,
): void {
	element.removeAttribute(name);

	const [, type, options] = /^@(\w+)(?::([a-z:]+))?$/.exec(name) ?? [];

	if (typeof value === 'function' && type != null) {
		element.addEventListener(
			type,
			value as EventListener,
			getOptions(options ?? ''),
		);
	}
}
