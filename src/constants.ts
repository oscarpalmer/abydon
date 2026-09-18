// #region Variables

export const ARRAY_COMPARISON_ADDED = 'added';

export const ARRAY_COMPARISON_DISSIMILAR = 'dissimilar';

export const ARRAY_COMPARISON_REMOVED = 'removed';

export const ATTRIBUTE_CLASS_PREFIX_LENGTH = 'class.'.length;

export const ATTRIBUTE_NAME_DELIMITER = '.';

export const CHANGE_INPUTS = new Set(['checkbox', 'radio']);

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

export const EVENT_ON_VALUE = 'on';

export const EVENT_OPTIONS_DELIMITER = ':';

export const EXPRESSION_ABYDON_ATTRIBUTE_FULL = /(@?[\w-.]+(?::[a-z:]+)?)="<!--abydon.(\d+)-->"/g;

export const EXPRESSION_ABYDON_ATTRIBUTE_PREFIX = /^abydon-/;

export const EXPRESSION_ABYDON_CONTENT = /^abydon\.(\d+)$/;

export const EXPRESSION_ATTRIBUTE_CLASS = /^class\./;

export const EXPRESSION_ATTRIBUTE_STYLE_FULL = /^style\.([\w-]+)(?:\.([\w-]+))?$/;

export const EXPRESSION_ATTRIBUTE_STYLE_PREFIX = /^style\./;

export const EXPRESSION_ATTRIBUTE_STYLE_VARIABLE = /^style\.--/;

export const EXPRESSION_EVENT_ATTRIBUTE = /^@([\w-]+)(?::([a-z:]+))?="$/i;

export const EXPRESSION_EVENT_NAME = /^@?([\w-]+)(?::([a-z:]+))?$/i;

export const EXPRESSION_EVENT_OPTIONS_ACTIVE = /^a(?:ctive)$/i;

export const EXPRESSION_EVENT_OPTIONS_CAPTURE = /^c(?:apture)$/i;

export const EXPRESSION_EVENT_OPTIONS_ONCE = /^o(?:nce)$/i;

export const EXPRESSION_EVENT_PREFIX = /^@/;

export const EXPRESSION_TEXTAREA_VALUE = /(?:<|&lt;)!--abydon\.(\d+)--(?:>|&gt;)/;

export const MESSAGE_FRAGMENT_VALUE =
	'Fragment template must be a string or a template strings array';

export const MESSAGE_FRAGMENTS_FRAGMENT_RESULT =
	'Fragment function must return a Fragment instance';

export const MESSAGE_FRAGMENTS_FRAGMENT_TYPE = 'Fragment handler must be a function';

export const MESSAGE_FRAGMENTS_IDENTIFIER_RESULT_DUPLICATE = "Duplicate identifier found: '<>'";

export const MESSAGE_FRAGMENTS_IDENTIFIER_RESULT_TYPE = 'Identifier cannot be null or undefined';

export const MESSAGE_FRAGMENTS_IDENTIFIER_TYPE = 'Identifier handler must be a function';

export const MESSAGE_FRAGMENTS_VALUE = 'Fragments array must be a reactive array';

export const NAME_FRAGMENT = 'fragment';

export const NAME_FRAGMENTS = 'fragments';

export const PROPERTY_IDENTIFIER = 'identifier';

export const PROPERTY_VALUE = 'value';

export const SYMBOL = Symbol('abydon');

export const TEMPLATE_ITEM = '<>';

export const VALUE_TRUE = 'true';

export const WHITESPACE = /\s+/g;

// #endregion
