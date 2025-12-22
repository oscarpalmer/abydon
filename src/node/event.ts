import {on} from '@oscarpalmer/toretto/event';
import {
	EXPRESSION_EVENT_NAME,
	EXPRESSION_EVENT_OPTIONS_ACTIVE,
	EXPRESSION_EVENT_OPTIONS_CAPTURE,
	EXPRESSION_EVENT_OPTIONS_ONCE,
} from '../constants';

function getOptions(options: string): AddEventListenerOptions {
	const parts = options.split(':');

	return {
		capture: parts.some(part => EXPRESSION_EVENT_OPTIONS_CAPTURE.test(part)),
		once: parts.some(part => EXPRESSION_EVENT_OPTIONS_ONCE.test(part)),
		passive: !parts.some(part => EXPRESSION_EVENT_OPTIONS_ACTIVE.test(part)),
	};
}

export function mapEvent(element: HTMLElement | SVGElement, name: string, value: unknown): void {
	element.removeAttribute(name);

	const [, type, options] = EXPRESSION_EVENT_NAME.exec(name) ?? [];

	if (type != null && typeof value === 'function') {
		on(element, type, value as EventListener, getOptions(options ?? ''));
	}
}
