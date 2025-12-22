export const ATTRIBUTE_CLASS_PREFIX_LENGTH = 6;

export const EXPRESSION_ABYDON_ATTRIBUTE_FULL = /(@?\w+)="<!--abydon.(\d+)-->"/g;

export const EXPRESSION_ABYDON_ATTRIBUTE_PREFIX = /^_/;

export const EXPRESSION_ABYDON_CONTENT = /^@?abydon\.(\d+)@?$/;

export const EXPRESSION_ATTRIBUTE_CLASS = /^class\./;

export const EXPRESSION_ATTRIBUTE_STYLE_FULL = /^style\.([\w-]+)(?:\.([\w-]+))?$/;

export const EXPRESSION_ATTRIBUTE_STYLE_PREFIX = /^style\./;

export const EXPRESSION_EVENT_NAME = /^@([\w-]+)(?::([a-z:]+))?$/i;

export const EXPRESSION_EVENT_OPTIONS_ACTIVE = /^a(ctive)$/i;

export const EXPRESSION_EVENT_OPTIONS_CAPTURE = /^c(apture)$/i;

export const EXPRESSION_EVENT_OPTIONS_ONCE = /^o(nce)$/i;

export const EXPRESSION_EVENT_PREFIX = /^@/;

export const EXPRESSION_PERIOD = /\./;

export const NAME_FRAGMENT = '$fragment';

export const NAME_FRAGMENTS = '$fragments';
