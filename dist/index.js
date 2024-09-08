// node_modules/@oscarpalmer/atoms/dist/js/string/index.mjs
function getString(value2) {
  if (typeof value2 === "string") {
    return value2;
  }
  if (typeof value2 !== "object" || value2 == null) {
    return String(value2);
  }
  const valueOff = value2.valueOf?.() ?? value2;
  const asString = valueOff?.toString?.() ?? String(valueOff);
  return asString.startsWith("[object ") ? JSON.stringify(value2) : asString;
}
// node_modules/@oscarpalmer/atoms/dist/js/is.mjs
function isNullableOrWhitespace(value2) {
  return value2 == null || /^\s*$/.test(getString(value2));
}
// node_modules/@oscarpalmer/toretto/node_modules/@oscarpalmer/atoms/dist/js/string/index.mjs
function getString2(value3) {
  if (typeof value3 === "string") {
    return value3;
  }
  if (typeof value3 !== "object" || value3 == null) {
    return String(value3);
  }
  const valueOff = value3.valueOf?.() ?? value3;
  const asString = valueOff?.toString?.() ?? String(valueOff);
  return asString.startsWith("[object ") ? JSON.stringify(value3) : asString;
}
// node_modules/@oscarpalmer/toretto/node_modules/@oscarpalmer/atoms/dist/js/is.mjs
function isPlainObject2(value3) {
  if (typeof value3 !== "object" || value3 === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value3);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value3) && !(Symbol.iterator in value3);
}

// node_modules/@oscarpalmer/toretto/dist/attribute.mjs
function isBadAttribute(attribute) {
  return onPrefix.test(attribute.name) || sourcePrefix.test(attribute.name) && valuePrefix.test(attribute.value);
}
function isBooleanAttribute(name) {
  return booleanAttributes.includes(name.toLowerCase());
}
function isEmptyNonBooleanAttribute(attribute) {
  return !booleanAttributes.includes(attribute.name) && attribute.value.trim().length === 0;
}
function isInvalidBooleanAttribute(attribute) {
  if (!booleanAttributes.includes(attribute.name)) {
    return true;
  }
  const normalised = attribute.value.toLowerCase().trim();
  return !(normalised.length === 0 || normalised === attribute.name || attribute.name === "hidden" && normalised === "until-found");
}
function setAttribute(element, first, second) {
  if (isPlainObject2(first) && typeof first?.name === "string") {
    setAttributeValue(element, first.name, first.value);
  } else if (typeof first === "string") {
    setAttributeValue(element, first, second);
  }
}
function setAttributeValue(element, name, value3) {
  if (value3 == null) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, typeof value3 === "string" ? value3 : getString2(value3));
  }
}
var booleanAttributes = Object.freeze([
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
]);
var onPrefix = /^on/i;
var sourcePrefix = /^(href|src|xlink:href)$/i;
var valuePrefix = /(data:text\/html|javascript:)/i;

// node_modules/@oscarpalmer/toretto/dist/sanitise.mjs
function sanitise(value3, options) {
  return sanitiseNodes(Array.isArray(value3) ? value3 : [value3], {
    sanitiseBooleanAttributes: options?.sanitiseBooleanAttributes ?? true
  });
}
function sanitiseAttributes(element, attributes, options) {
  const { length } = attributes;
  for (let index = 0;index < length; index += 1) {
    const attribute2 = attributes[index];
    if (isBadAttribute(attribute2) || isEmptyNonBooleanAttribute(attribute2)) {
      element.removeAttribute(attribute2.name);
    } else if (options.sanitiseBooleanAttributes && isInvalidBooleanAttribute(attribute2)) {
      element.setAttribute(attribute2.name, "");
    }
  }
}
function sanitiseNodes(nodes, options) {
  const { length } = nodes;
  for (let index = 0;index < length; index += 1) {
    const node = nodes[index];
    if (node instanceof Element) {
      sanitiseAttributes(node, [...node.attributes], options);
    }
    sanitiseNodes([...node.childNodes], options);
  }
  return nodes;
}

// node_modules/@oscarpalmer/toretto/dist/html.mjs
function createTemplate(html) {
  const template3 = document.createElement("template");
  template3.innerHTML = html;
  templates[html] = template3;
  return template3;
}
function getTemplate(value3) {
  if (value3.trim().length === 0) {
    return;
  }
  let template3;
  if (/^[\w-]+$/.test(value3)) {
    template3 = document.querySelector(`#${value3}`);
  }
  if (template3 instanceof HTMLTemplateElement) {
    return template3;
  }
  return templates[value3] ?? createTemplate(value3);
}
function html(value3, sanitisation) {
  const options = sanitisation == null || sanitisation === true ? {} : isPlainObject2(sanitisation) ? { ...sanitisation } : null;
  const template3 = value3 instanceof HTMLTemplateElement ? value3 : typeof value3 === "string" ? getTemplate(value3) : null;
  if (template3 == null) {
    return [];
  }
  const cloned = template3.content.cloneNode(true);
  const scripts = cloned.querySelectorAll("script");
  const { length } = scripts;
  for (let index = 0;index < length; index += 1) {
    scripts[index].remove();
  }
  cloned.normalize();
  return options != null ? sanitise([...cloned.childNodes], options) : [...cloned.childNodes];
}
var templates = {};

// node_modules/@oscarpalmer/sentinel/node_modules/@oscarpalmer/atoms/dist/js/queue.mjs
function queue(callback) {
  _atomic_queued.add(callback);
  if (_atomic_queued.size > 0) {
    queueMicrotask(() => {
      const callbacks = [..._atomic_queued];
      const { length } = callbacks;
      _atomic_queued.clear();
      for (let index = 0;index < length; index += 1) {
        callbacks[index]();
      }
    });
  }
}
if (globalThis._atomic_queued == null) {
  const queued = new Set;
  Object.defineProperty(globalThis, "_atomic_queued", {
    get() {
      return queued;
    }
  });
}

// node_modules/@oscarpalmer/sentinel/dist/global.mjs
if (globalThis._sentinels == null) {
  const effects = [];
  Object.defineProperty(globalThis, "_sentinels", {
    get() {
      return effects;
    }
  });
}

// node_modules/@oscarpalmer/sentinel/dist/effect.mjs
function effect(callback) {
  return new Effect(callback);
}
function watch(reactive, key) {
  const effect2 = globalThis._sentinels[globalThis._sentinels.length - 1];
  if (effect2 != null) {
    if (key == null) {
      reactive.callbacks.any.add(effect2);
    } else {
      if (!reactive.callbacks.keys.has(key)) {
        reactive.callbacks.keys.add(key);
        reactive.callbacks.values.set(key, new Set);
      }
      reactive.callbacks.values.get(key)?.add(effect2);
    }
    effect2.reactives.add(reactive);
  }
}

class Effect {
  $sentinel = "effect";
  state;
  constructor(callback) {
    this.state = {
      callback,
      active: false,
      reactives: new Set
    };
    this.start();
  }
  start() {
    if (!this.state.active) {
      this.state.active = true;
      const index = globalThis._sentinels.push(this.state) - 1;
      this.state.callback();
      globalThis._sentinels.splice(index, 1);
    }
  }
  stop() {
    if (this.state.active) {
      this.state.active = false;
      for (const reactive of this.state.reactives) {
        reactive.callbacks.any.delete(this.state);
        for (const [key, keyed] of reactive.callbacks.values) {
          keyed.delete(this.state);
          if (keyed.size === 0) {
            reactive.callbacks.keys.delete(key);
          }
        }
      }
      this.state.reactives.clear();
    }
  }
}

// node_modules/@oscarpalmer/sentinel/dist/helpers/is.mjs
function isReactive(value3) {
  return isSentinel(value3, /^array|computed|signal|store$/i);
}
function isSentinel(value3, expression) {
  return expression.test(value3?.$sentinel ?? "");
}

// node_modules/@oscarpalmer/sentinel/node_modules/@oscarpalmer/atoms/dist/js/function.mjs
function noop() {
}

// node_modules/@oscarpalmer/sentinel/dist/helpers/subscription.mjs
function subscribe(state, subscriber, key) {
  let set5;
  if (key != null) {
    if (state.callbacks.keys.has(key)) {
      set5 = state.callbacks.values.get(key);
    } else {
      set5 = new Set;
      state.callbacks.keys.add(key);
      state.callbacks.values.set(key, set5);
    }
  } else {
    set5 = state.callbacks.any;
  }
  if (set5 == null || set5.has(subscriber)) {
    return noop;
  }
  set5.add(subscriber);
  subscriber(state.value);
  return () => {
    unsubscribe(state, subscriber, key);
  };
}
function unsubscribe(state, subscriber, key) {
  if (key != null) {
    const set5 = state.callbacks.values.get(key);
    if (set5 != null) {
      if (subscriber == null) {
        set5.clear();
      } else {
        set5.delete(subscriber);
      }
      if (set5.size === 0) {
        state.callbacks.keys.delete(key);
        state.callbacks.values.delete(key);
      }
    }
  } else if (subscriber != null) {
    state.callbacks.any.delete(subscriber);
  }
}

// node_modules/@oscarpalmer/sentinel/dist/helpers/event.mjs
function disable(state) {
  if (state.active) {
    state.active = false;
    const effects = [...state.callbacks.any, ...state.callbacks.values.values()].flatMap((value3) => value3 instanceof Set ? [...value3.values()] : value3).filter((value3) => typeof value3 !== "function");
    for (const fx of effects) {
      if (typeof fx !== "function") {
        fx.reactives.delete(state);
      }
    }
  }
}
function emit(state, keys) {
  if (state.active) {
    const subscribers = [
      ...state.callbacks.any,
      ...[...state.callbacks.values.entries()].filter(([key]) => keys == null || keys.includes(key)).map(([, value3]) => value3)
    ].flatMap((value3) => value3 instanceof Set ? [...value3.values()] : value3).map((value3) => typeof value3 === "function" ? value3 : value3.callback);
    for (const subsriber of subscribers) {
      if (typeof subsriber === "function") {
        queue(() => {
          subsriber(state.value);
        });
      }
    }
  }
}
function enable(state) {
  if (!state.active) {
    state.active = true;
    emit(state);
  }
}

// node_modules/@oscarpalmer/sentinel/dist/helpers/value.mjs
function getValue3(reactive, key) {
  watch(reactive, typeof key === "symbol" ? undefined : key);
  return key == null ? reactive.value : Array.isArray(reactive.value) ? reactive.value.at(key) : reactive.value[key];
}
function setValue3(reactive, value3) {
  if (!Object.is(reactive.value, value3)) {
    reactive.value = value3;
    emit(reactive);
  }
}
var arrayOperations = new Set([
  "copyWithin",
  "fill",
  "pop",
  "push",
  "reverse",
  "shift",
  "sort",
  "splice",
  "unshift"
]);

// node_modules/@oscarpalmer/sentinel/dist/reactive/instance.mjs
class ReactiveInstance {
  state;
  constructor(type, value22) {
    this.$sentinel = type;
    this.state = {
      value: value22,
      active: true,
      callbacks: {
        any: new Set,
        keys: new Set,
        values: new Map
      }
    };
  }
  get() {
    return getValue3(this.state);
  }
  peek() {
    return this.state.value;
  }
  run() {
    enable(this.state);
  }
  stop() {
    disable(this.state);
  }
  toJSON() {
    return getValue3(this.state);
  }
  toString() {
    return String(getValue3(this.state));
  }
}

// node_modules/@oscarpalmer/sentinel/dist/reactive/value.mjs
class ReactiveValue extends ReactiveInstance {
  subscribe(subscriber) {
    return subscribe(this.state, subscriber);
  }
  unsubscribe(subscriber) {
    if (subscriber == null) {
      this.state.callbacks.any.clear();
    } else {
      this.state.callbacks.any.delete(subscriber);
    }
  }
}

// node_modules/@oscarpalmer/sentinel/dist/reactive/computed.mjs
function computed(value32) {
  return new Computed(value32);
}

class Computed extends ReactiveValue {
  fx;
  constructor(value32) {
    super("computed", undefined);
    this.fx = effect(() => setValue3(this.state, value32()));
  }
  run() {
    this.fx.start();
  }
  stop() {
    this.fx.stop();
  }
}
// node_modules/@oscarpalmer/sentinel/dist/reactive/index.mjs
var primitives = new Set(["boolean", "number", "string"]);

// src/helpers/index.ts
function isFragment(value11) {
  return typeof value11 === "object" && value11 != null && "$fragment" in value11 && value11.$fragment === true;
}
function isProperElement(value11) {
  return value11 instanceof HTMLElement || value11 instanceof SVGElement;
}
function isProperNode(value11) {
  return value11 instanceof CharacterData || value11 instanceof Element;
}

// src/node/event.ts
function getController(element) {
  let controller = controllers.get(element);
  if (controller == null) {
    controller = new AbortController;
    controllers.set(element, controller);
  }
  return controller;
}
function getOptions(options) {
  const parts = options.split(":");
  return {
    capture: parts.includes("c") || parts.includes("capture"),
    once: parts.includes("o") || parts.includes("once"),
    passive: !parts.includes("a") && !parts.includes("active")
  };
}
function mapEvent(element, name, value11) {
  element.removeAttribute(name);
  const [, type, options] = eventNamePattern.exec(name) ?? [];
  if (typeof value11 === "function" && type != null) {
    element.addEventListener(type, value11, {
      ...getOptions(options ?? ""),
      signal: getController(element).signal
    });
  }
}
function removeEvents(element) {
  if (controllers.has(element)) {
    controllers.get(element)?.abort();
    controllers.delete(element);
  }
}
var controllers = new WeakMap;
var eventNamePattern = /^@([\w-]+)(?::([a-z:]+))?$/i;

// src/helpers/dom.ts
function createNodes(value11) {
  if (isFragment(value11)) {
    return value11.get();
  }
  if (isProperNode(value11)) {
    return [value11];
  }
  return [new Text(getString(value11))];
}
function removeNodes(nodes) {
  sanitiseNodes2(nodes);
  const { length } = nodes;
  for (let index = 0;index < length; index += 1) {
    nodes[index].remove();
  }
}
function replaceNodes(from, to) {
  const { length } = from;
  for (let index = 0;index < length; index += 1) {
    if (index === 0) {
      from[index].replaceWith(...to);
    } else {
      from[index].remove();
    }
  }
}
function sanitiseNodes2(nodes) {
  const { length } = nodes;
  for (let index = 0;index < length; index += 1) {
    const node = nodes[index];
    if (isProperElement(node)) {
      removeEvents(node);
    }
    if (node.hasChildNodes()) {
      sanitiseNodes2([...node.childNodes]);
    }
  }
}

// src/node/attribute/value.ts
function setAttribute2(element, name, value11) {
  element.removeAttribute(name);
  switch (true) {
    case classExpression.test(name):
      setClasses(element, name, value11);
      return;
    case stylePrefixExpression.test(name):
      setStyle(element, name, value11);
      return;
    default:
      setValue5(element, name, value11);
      break;
  }
}
function setClasses(element, name, value11) {
  function update(value12) {
    if (value12 === true) {
      element.classList.add(...classes);
    } else {
      element.classList.remove(...classes);
    }
  }
  const classes = name.slice(6).split(".");
  if (isReactive(value11)) {
    effect(() => {
      update(value11.get());
    });
  } else {
    update(value11);
  }
}
function setStyle(element, name, value11) {
  function update(value12) {
    if (value12 == null || value12 === false || value12 === true && unit == null) {
      element.style.removeProperty(property);
    } else {
      element.style.setProperty(property, value12 === true ? unit : getString(value12));
    }
  }
  const [, property, unit] = styleFullExpression.exec(name) ?? [];
  if (property != null) {
    if (isReactive(value11)) {
      effect(() => {
        update(value11.get());
      });
    } else {
      update(value11);
    }
  }
}
function setValue5(element, name, value11) {
  const callback = isBooleanAttribute(name) && name in element ? name === "selected" ? updateSelected : updateProperty : setAttribute;
  if (isReactive(value11)) {
    effect(() => {
      callback(element, name, value11.get());
    });
  } else {
    callback(element, name, value11);
  }
}
function triggerSelectChange(select) {
  if (select != null) {
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }
}
function updateProperty(element, name, value11) {
  element[name] = value11 === true;
}
function updateSelected(element, name, value11) {
  const select = element.closest("select");
  const options = [...select?.options ?? []];
  if (select != null && options.includes(element)) {
    triggerSelectChange(select);
  }
  updateProperty(element, name, value11);
}
var classExpression = /^class\./;
var styleFullExpression = /^style\.([\w-]+)(?:\.([\w-]+))?$/;
var stylePrefixExpression = /^style\./;

// src/node/attribute/index.ts
function getValue5(data, original) {
  const matches = commentExpression.exec(original ?? "");
  return matches == null ? original : data.values[+matches[1]];
}
function mapAttributes(data, element) {
  const attributes = [...element.attributes];
  const { length } = attributes;
  for (let index = 0;index < length; index += 1) {
    const { name, value: value12 } = attributes[index];
    const actual = getValue5(data, value12);
    if (name.startsWith("@")) {
      mapEvent(element, name, actual);
    } else if (name.includes(".") || typeof value12 === "function" || isReactive(actual)) {
      mapValue(element, name, actual);
    }
  }
}
function mapValue(element, name, value12) {
  switch (true) {
    case typeof value12 === "function":
      setAttribute2(element, name, computed(value12));
      break;
    default:
      setAttribute2(element, name, value12);
      break;
  }
}
var commentExpression = /^<!--abydon\.(\d+)-->$/;

// src/node/value.ts
function setNodes(nodes, comment, text, value12) {
  const next = createNodes(value12);
  if (nodes == null) {
    if (comment.parentNode != null) {
      replaceNodes([comment], next);
    } else if (text.parentNode != null) {
      replaceNodes([text], next);
    }
  } else {
    replaceNodes(nodes, next);
  }
  return next;
}
function setReactiveNode(data, comment, reactive3) {
  const item = data.items.find((item2) => item2.nodes.includes(comment));
  const text = new Text;
  let nodes;
  effect(() => {
    const value12 = reactive3.get();
    const valueIsFragment = isFragment(value12);
    if (valueIsFragment || isProperNode(value12)) {
      nodes = setNodes(nodes, comment, text, value12);
    } else {
      nodes = setText(nodes, comment, text, value12) ? [text] : undefined;
    }
    if (item != null) {
      item.fragment = valueIsFragment ? value12 : undefined;
      item.nodes = [...nodes ?? [comment]];
    }
  });
}
function setText(nodes, comment, text, value12) {
  const isNullable = isNullableOrWhitespace(value12);
  text.textContent = isNullable ? "" : getString(value12);
  if (nodes != null) {
    replaceNodes(nodes, [isNullable ? comment : text]);
    return !isNullable;
  }
  if (isNullable && comment.parentNode == null) {
    text.replaceWith(comment);
    return false;
  }
  if (!isNullable && text.parentNode == null) {
    comment.replaceWith(text);
    return true;
  }
  return false;
}

// src/node/index.ts
function mapNode(data, comment) {
  const matches = commentExpression2.exec(comment.textContent ?? "");
  const value13 = matches == null ? null : data.values[+matches[1]];
  if (value13 != null) {
    mapValue2(data, comment, value13);
  }
}
function mapNodes(data, nodes) {
  const { length } = nodes;
  for (let index = 0;index < length; index += 1) {
    const node = nodes[index];
    if (node instanceof Comment) {
      mapNode(data, node);
      continue;
    }
    if (isProperElement(node)) {
      mapAttributes(data, node);
    }
    if (node.hasChildNodes()) {
      mapNodes(data, [...node.childNodes]);
    }
  }
}
function mapValue2(data, comment, value13) {
  switch (true) {
    case typeof value13 === "function":
      setReactiveNode(data, comment, computed(value13));
      break;
    case isReactive(value13):
      setReactiveNode(data, comment, value13);
      break;
    default:
      replaceComment(data, comment, value13);
      break;
  }
}
function replaceComment(data, comment, value13) {
  const item = data.items.find((item2) => item2.nodes.includes(comment));
  const nodes = createNodes(value13);
  if (item != null) {
    item.fragment = isFragment(value13) ? value13 : undefined;
    item.nodes = nodes;
  }
  comment.replaceWith(...nodes);
}
var commentExpression2 = /^abydon\.(\d+)$/;

// src/fragment.ts
class Fragment {
  $fragment = true;
  data;
  constructor(strings, expressions) {
    this.data = {
      expressions,
      strings,
      items: [],
      values: []
    };
  }
  appendTo(element) {
    element.append(...this.get());
  }
  get() {
    if (this.data.items.length === 0) {
      const parsed = parse(this.data);
      const templated = html(parsed, {
        sanitiseBooleanAttributes: false
      });
      this.data.items.splice(0, this.data.items.length, ...templated.map((node2) => ({
        nodes: [node2]
      })));
      mapNodes(this.data, this.data.items.flatMap((item) => item.fragment?.get() ?? item.nodes));
    }
    return [
      ...this.data.items.flatMap((item) => item.fragment?.get() ?? item.nodes)
    ];
  }
  remove() {
    const { length } = this.data.items;
    for (let index = 0;index < length; index += 1) {
      const { fragment, nodes } = this.data.items[index];
      fragment?.remove();
      removeNodes(nodes);
    }
    this.data.items.splice(0, length);
  }
}

// src/html.ts
function handleExpression(data, prefix, expression) {
  if (isNullableOrWhitespace(expression)) {
    return prefix;
  }
  if (Array.isArray(expression)) {
    const { length } = expression;
    let expressions = "";
    for (let index = 0;index < length; index += 1) {
      expressions += handleExpression(data, "", expression[index]);
    }
    return `${prefix}${expressions}`;
  }
  if (typeof expression === "function" || typeof expression === "object") {
    const index = data.values.push(expression) - 1;
    return `${prefix}<!--abydon.${index}-->`;
  }
  return `${prefix}${expression}`;
}
function html4(strings, ...values) {
  return new Fragment(strings, values);
}
function parse(data) {
  const { length } = data.strings;
  let template4 = "";
  for (let index = 0;index < length; index += 1) {
    template4 += handleExpression(data, data.strings[index], data.expressions[index]);
  }
  return template4;
}
export {
  html4 as html
};
