import {on} from '@oscarpalmer/toretto/event';
import type {HTMLOrSVGElement, RemovableEventListener} from '@oscarpalmer/toretto/models';
import {EXPRESSION_EVENT_NAME} from '../constants';

function getOptions(options: string): AddEventListenerOptions {
	const parts = options.split(':');

	return {
		capture: parts.includes('c') || parts.includes('capture'),
		once: parts.includes('o') || parts.includes('once'),
		passive: !(parts.includes('a') || parts.includes('active')),
	};
}

export function mapEvent(element: HTMLOrSVGElement, name: string, value: unknown): void {
	element.removeAttribute(name);

	const [, type, options] = EXPRESSION_EVENT_NAME.exec(name) ?? [];

	if (typeof value !== 'function' || type == null) {
		return;
	}

	let listeners = mapped.get(element);

	if (listeners == null) {
		listeners = [];

		mapped.set(element, listeners);
	}

	listeners.push(
		on(element, type, value as EventListener, {
			...getOptions(options ?? ''),
		}),
	);
}

export function removeEvents(element: HTMLOrSVGElement): void {
	const listeners = mapped.get(element);

	if (listeners != null) {
		for (const remove of listeners) {
			remove();
		}
	}

	mapped.delete(element);
}

//

const mapped = new WeakMap<HTMLOrSVGElement, RemovableEventListener[]>();

// @ts-expect-error debug
window.mapped = mapped;
