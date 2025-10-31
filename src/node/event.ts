import type {HTMLOrSVGElement} from '@oscarpalmer/toretto/models';
import {
	ABORT_CONTROLLERS,
	EXPRESSION_EVENT_NAME,
	REASON_EVENT_REMOVED,
} from '../constants';

function getController(element: HTMLOrSVGElement): AbortController {
	let controller = ABORT_CONTROLLERS.get(element);

	if (controller == null) {
		controller = new AbortController();

		ABORT_CONTROLLERS.set(element, controller);
	}

	return controller;
}

function getOptions(options: string): AddEventListenerOptions {
	const parts = options.split(':');

	return {
		capture: parts.includes('c') || parts.includes('capture'),
		once: parts.includes('o') || parts.includes('once'),
		passive: !(parts.includes('a') || parts.includes('active')),
	};
}

export function mapEvent(
	element: HTMLOrSVGElement,
	name: string,
	value: unknown,
): void {
	element.removeAttribute(name);

	const [, type, options] = EXPRESSION_EVENT_NAME.exec(name) ?? [];

	if (typeof value === 'function' && type != null) {
		element.addEventListener(type, value as EventListener, {
			...getOptions(options ?? ''),
			signal: getController(element).signal,
		});
	}
}

export function removeEvents(element: HTMLOrSVGElement): void {
	ABORT_CONTROLLERS.get(element)?.abort(REASON_EVENT_REMOVED);
	ABORT_CONTROLLERS.delete(element);
}
