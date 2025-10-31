export const ABORT_CONTROLLERS: WeakMap<HTMLOrSVGElement, AbortController> =
	new WeakMap();

export const ATTRIBUTE_CLASS_PREFIX_LENGTH = 6;

export const EXPRESSION_ATTRIBUTE_CLASS = /^class\./;

export const EXPRESSION_ATTRIBUTE_STYLE_FULL =
	/^style\.([\w-]+)(?:\.([\w-]+))?$/;

export const EXPRESSION_ATTRIBUTE_STYLE_PREFIX = /^style\./;

export const EXPRESSION_COMMENT_FULL = /^<!--abydon\.(\d+)-->$/;

export const EXPRESSION_COMMENT_CONTENT = /^abydon\.(\d+)$/;

export const EXPRESSION_EVENT_NAME = /^@([\w-]+)(?::([a-z:]+))?$/i;

export const REASON_EVENT_REMOVED =
	'Event removed as element was removed from document by Abydon';
