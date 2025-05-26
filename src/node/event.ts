import type {HTMLOrSVGElement} from '@oscarpalmer/toretto/models';

const controllers = new WeakMap<HTMLOrSVGElement, AbortController>();

const eventNamePattern = /^@([\w-]+)(?::([a-z:]+))?$/i;

const reason = 'Event removed as element was removed from document by Abydon';

function getController(element: HTMLOrSVGElement): AbortController {
	let controller = controllers.get(element);

	if (controller == null) {
		controller = new AbortController();

		controllers.set(element, controller);
	}

	return controller;
}

function getOptions(options: string): AddEventListenerOptions {
	const parts = options.split(':');

	return {
		capture: parts.includes('c') || parts.includes('capture'),
		once: parts.includes('o') || parts.includes('once'),
		passive: !parts.includes('a') && !parts.includes('active'),
	};
}

export function mapEvent(
	element: HTMLOrSVGElement,
	name: string,
	value: unknown,
): void {
	element.removeAttribute(name);

	const [, type, options] = eventNamePattern.exec(name) ?? [];

	if (typeof value === 'function' && type != null) {
		element.addEventListener(type, value as EventListener, {
			...getOptions(options ?? ''),
			signal: getController(element).signal,
		});
	}
}

export function removeEvents(element: HTMLOrSVGElement): void {
	controllers.get(element)?.abort(reason);
	controllers.delete(element);
}
