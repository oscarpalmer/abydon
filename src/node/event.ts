import {on} from '@oscarpalmer/toretto/event';
import {
	EVENT_DEFAULTS,
	EXPRESSION_EVENT_CHANGE_TYPES,
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

function getType(element: HTMLElement | SVGElement, type: string): string {
	if (type !== 'on') {
		return type;
	}

	if (element instanceof HTMLInputElement) {
		if (EXPRESSION_EVENT_CHANGE_TYPES.test(element.type)) {
			return 'change';
		}

		return element.type === 'submit' ? 'submit' : 'input';
	}

	return EVENT_DEFAULTS[element.tagName] ?? type;
}

export function mapEvent(element: HTMLElement | SVGElement, name: string, value: unknown): void {
	const [, type, options] = EXPRESSION_EVENT_NAME.exec(name) ?? [];

	if (type != null && typeof value === 'function') {
		on(element, getType(element, type), value as EventListener, getOptions(options ?? ''));
	}
}
