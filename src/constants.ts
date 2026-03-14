export const ARRAY_COMPARISON_ADDED = 'added';

export const ARRAY_COMPARISON_DISSIMILAR = 'dissimilar';

export const ARRAY_COMPARISON_REMOVED = 'removed';

export const ATTRIBUTE_CLASS_PREFIX_LENGTH = 6;

export const ATTRIBUTE_NAME_DELIMITER = '.';

export const ERROR_FRAGMENT = 'Fragment function must return a Fragment instance';

export const ERROR_IDENTIFIER_DUPLICATE = "Duplicate identifier found: '<id>'";

export const ERROR_IDENTIFIER_TYPE = 'Identifier cannot be null or undefined';

export const EVENT_CHANGE = 'change';

export const EVENT_INPUT = 'input';

export const EVENT_SUBMIT = 'submit';

export const EVENT_DEFAULTS: Record<string, string> = {
	A: 'click',
	BUTTON: 'click',
	DETAILS: 'toggle',
	FORM: EVENT_SUBMIT,
	SELECT: EVENT_CHANGE,
	TEXTAREA: EVENT_INPUT,
};

export const EVENT_ON_PREFIXED = '@on';

export const EVENT_ON_VALUE = 'on';

export const EVENT_OPTIONS_DELIMITER = ':';

export const EXPRESSION_ABYDON_ATTRIBUTE_FULL = /(@?[\w-]+)="<!--abydon.(\d+)-->"/g;

export const EXPRESSION_ABYDON_ATTRIBUTE_PREFIX = /^_/;

export const EXPRESSION_ABYDON_CONTENT = /^@?abydon\.(\d+)@?$/;

export const EXPRESSION_ATTRIBUTE_CLASS = /^class\./;

export const EXPRESSION_ATTRIBUTE_STYLE_FULL = /^style\.([\w-]+)(?:\.([\w-]+))?$/;

export const EXPRESSION_ATTRIBUTE_STYLE_PREFIX = /^style\./;

export const EXPRESSION_EVENT_CHANGE_TYPES = /^(checkbox|radio)$/;

export const EXPRESSION_EVENT_NAME = /^@([\w-]+)(?::([a-z:]+))?$/i;

export const EXPRESSION_EVENT_OPTIONS_ACTIVE = /^a(ctive)$/i;

export const EXPRESSION_EVENT_OPTIONS_CAPTURE = /^c(apture)$/i;

export const EXPRESSION_EVENT_OPTIONS_ONCE = /^o(nce)$/i;

export const EXPRESSION_EVENT_PREFIX = /^@/;

export const EXPRESSION_PERIOD = /\./;

export const NAME_FRAGMENT = '$fragment';

export const NAME_FRAGMENTS = '$fragments';

export const PROPERTY_CHECKED = 'checked';

export const PROPERTY_IDENTIFIER = 'identifier';

export const PROPERTY_VALUE = 'value';

export const TEMPLATE_ITEM = '<>';
