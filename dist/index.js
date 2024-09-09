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
function isReactive(value) {
  return isSentinel(value, /^array|computed|signal|store$/i);
}
function isSentinel(value, expression) {
  return expression.test(value?.$sentinel ?? "");
}

// node_modules/@oscarpalmer/sentinel/node_modules/@oscarpalmer/atoms/dist/js/function.mjs
function noop() {
}

// node_modules/@oscarpalmer/sentinel/dist/helpers/subscription.mjs
function subscribe(state, subscriber, key) {
  let set;
  if (key != null) {
    if (state.callbacks.keys.has(key)) {
      set = state.callbacks.values.get(key);
    } else {
      set = new Set;
      state.callbacks.keys.add(key);
      state.callbacks.values.set(key, set);
    }
  } else {
    set = state.callbacks.any;
  }
  if (set == null || set.has(subscriber)) {
    return noop;
  }
  set.add(subscriber);
  subscriber(state.value);
  return () => {
    unsubscribe(state, subscriber, key);
  };
}
function unsubscribe(state, subscriber, key) {
  if (key != null) {
    const set = state.callbacks.values.get(key);
    if (set != null) {
      if (subscriber == null) {
        set.clear();
      } else {
        set.delete(subscriber);
      }
      if (set.size === 0) {
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
    const effects = [...state.callbacks.any, ...state.callbacks.values.values()].flatMap((value) => value instanceof Set ? [...value.values()] : value).filter((value) => typeof value !== "function");
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
      ...[...state.callbacks.values.entries()].filter(([key]) => keys == null || keys.includes(key)).map(([, value]) => value)
    ].flatMap((value) => value instanceof Set ? [...value.values()] : value).map((value) => typeof value === "function" ? value : value.callback);
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
function getValue(reactive, key) {
  watch(reactive, typeof key === "symbol" ? undefined : key);
  return key == null ? reactive.value : Array.isArray(reactive.value) ? reactive.value.at(key) : reactive.value[key];
}
function setValue(reactive, value) {
  if (!Object.is(reactive.value, value)) {
    reactive.value = value;
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
  constructor(type, value2) {
    this.$sentinel = type;
    this.state = {
      value: value2,
      active: true,
      callbacks: {
        any: new Set,
        keys: new Set,
        values: new Map
      }
    };
  }
  get() {
    return getValue(this.state);
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
    return getValue(this.state);
  }
  toString() {
    return String(getValue(this.state));
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
    this.fx = effect(() => setValue(this.state, value32()));
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
// node_modules/@oscarpalmer/atoms/dist/js/string/index.mjs
function getString2(value10) {
  if (typeof value10 === "string") {
    return value10;
  }
  if (typeof value10 !== "object" || value10 == null) {
    return String(value10);
  }
  const valueOff = value10.valueOf?.() ?? value10;
  const asString = valueOff?.toString?.() ?? String(valueOff);
  return asString.startsWith("[object ") ? JSON.stringify(value10) : asString;
}
// node_modules/@oscarpalmer/atoms/dist/js/is.mjs
function isNullableOrWhitespace(value10) {
  return value10 == null || /^\s*$/.test(getString2(value10));
}
// node_modules/@oscarpalmer/toretto/node_modules/@oscarpalmer/atoms/dist/js/string/index.mjs
function getString3(value11) {
  if (typeof value11 === "string") {
    return value11;
  }
  if (typeof value11 !== "object" || value11 == null) {
    return String(value11);
  }
  const valueOff = value11.valueOf?.() ?? value11;
  const asString = valueOff?.toString?.() ?? String(valueOff);
  return asString.startsWith("[object ") ? JSON.stringify(value11) : asString;
}
// node_modules/@oscarpalmer/toretto/node_modules/@oscarpalmer/atoms/dist/js/is.mjs
function isPlainObject3(value11) {
  if (typeof value11 !== "object" || value11 === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value11);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value11) && !(Symbol.iterator in value11);
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
  if (isPlainObject3(first) && typeof first?.name === "string") {
    setAttributeValue(element, first.name, first.value);
  } else if (typeof first === "string") {
    setAttributeValue(element, first, second);
  }
}
function setAttributeValue(element, name, value11) {
  if (value11 == null) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, typeof value11 === "string" ? value11 : getString3(value11));
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
function sanitise(value11, options) {
  return sanitiseNodes(Array.isArray(value11) ? value11 : [value11], {
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
  const template4 = document.createElement("template");
  template4.innerHTML = html;
  templates[html] = template4;
  return template4;
}
function getTemplate(value11) {
  if (value11.trim().length === 0) {
    return;
  }
  let template4;
  if (/^[\w-]+$/.test(value11)) {
    template4 = document.querySelector(`#${value11}`);
  }
  if (template4 instanceof HTMLTemplateElement) {
    return template4;
  }
  return templates[value11] ?? createTemplate(value11);
}
function html(value11, sanitisation) {
  const options = sanitisation == null || sanitisation === true ? {} : isPlainObject3(sanitisation) ? { ...sanitisation } : null;
  const template4 = value11 instanceof HTMLTemplateElement ? value11 : typeof value11 === "string" ? getTemplate(value11) : null;
  if (template4 == null) {
    return [];
  }
  const cloned = template4.content.cloneNode(true);
  const scripts = cloned.querySelectorAll("script");
  const { length } = scripts;
  for (let index = 0;index < length; index += 1) {
    scripts[index].remove();
  }
  cloned.normalize();
  return options != null ? sanitise([...cloned.childNodes], options) : [...cloned.childNodes];
}
var templates = {};

// src/helpers/index.ts
function compareArrays(first, second) {
  const firstIsLarger = first.length > second.length;
  const from = firstIsLarger ? first : second;
  const to = firstIsLarger ? second : first;
  if (!from.filter((key) => to.includes(key)).every((key, index) => to[index] === key)) {
    return "dissimilar";
  }
  return firstIsLarger ? "removed" : "added";
}
function isChildNode(value11) {
  return value11 instanceof CharacterData || value11 instanceof Element;
}
function isFragment(value11) {
  return typeof value11 === "object" && value11 != null && "$fragment" in value11 && value11.$fragment === true;
}
function isHTMLOrSVGElement(value11) {
  return value11 instanceof HTMLElement || value11 instanceof SVGElement;
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
  controllers.get(element)?.abort(reason);
  controllers.delete(element);
}
var controllers = new WeakMap;
var eventNamePattern = /^@([\w-]+)(?::([a-z:]+))?$/i;
var reason = "Event removed as element was removed from document by Abydon";

// src/helpers/dom.ts
function createNodes(value11) {
  if (isFragment(value11)) {
    return value11.get();
  }
  if (isChildNode(value11)) {
    return [value11];
  }
  return [new Text(getString2(value11))];
}
function removeNodes(nodes) {
  sanitiseNodes2(nodes);
  const { length } = nodes;
  for (let index = 0;index < length; index += 1) {
    nodes[index].remove();
  }
}
function replaceNodes(from, to) {
  from[0]?.replaceWith(...to);
  const { length } = from;
  for (let index = 1;index < length; index += 1) {
    from[index].remove();
  }
}
function sanitiseNodes2(nodes) {
  const { length } = nodes;
  for (let index = 0;index < length; index += 1) {
    const node = nodes[index];
    if (isHTMLOrSVGElement(node)) {
      removeEvents(node);
    }
    if (node.hasChildNodes()) {
      sanitiseNodes2([...node.childNodes]);
    }
  }
}

// src/node/attribute/value.ts
function setAttribute2(data, element, name, value11) {
  element.removeAttribute(name);
  switch (true) {
    case classExpression.test(name):
      setClasses(data, element, name, value11);
      return;
    case stylePrefixExpression.test(name):
      setStyle(data, element, name, value11);
      return;
    default:
      setValue5(data, element, name, value11);
      break;
  }
}
function setClasses(data, element, name, value11) {
  function update(value12) {
    if (value12 === true) {
      element.classList.add(...classes);
    } else {
      element.classList.remove(...classes);
    }
  }
  const classes = name.slice(6).split(".");
  if (isReactive(value11)) {
    data.sentinel.effects.add(effect(() => {
      update(value11.get());
    }));
  } else {
    update(value11);
  }
}
function setStyle(data, element, name, value11) {
  function update(value12) {
    if (value12 == null || value12 === false || value12 === true && unit == null) {
      element.style.removeProperty(property);
    } else {
      element.style.setProperty(property, value12 === true ? unit : getString2(value12));
    }
  }
  const [, property, unit] = styleFullExpression.exec(name) ?? [];
  if (property != null) {
    if (isReactive(value11)) {
      data.sentinel.effects.add(effect(() => {
        update(value11.get());
      }));
    } else {
      update(value11);
    }
  }
}
function setValue5(data, element, name, value11) {
  const callback = isBooleanAttribute(name) && name in element ? name === "selected" ? updateSelected : updateProperty : setAttribute;
  if (isReactive(value11)) {
    data.sentinel.effects.add(effect(() => {
      callback(element, name, value11.get());
    }));
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
      mapValue(data, element, name, actual);
    }
  }
}
function mapValue(data, element, name, value12) {
  switch (true) {
    case typeof value12 === "function":
      setComputedAttribute(data, element, name, value12);
      break;
    default:
      setAttribute2(data, element, name, value12);
      break;
  }
}
function setComputedAttribute(data, element, name, callback) {
  const value12 = computed(callback);
  data.sentinel.values.add(value12);
  setAttribute2(data, element, name, value12);
}
var commentExpression = /^<!--abydon\.(\d+)-->$/;

// src/node/value.ts
function removeFragments(fragments) {
  if (fragments != null) {
    const { length } = fragments;
    for (let index = 0;index < length; index += 1) {
      fragments[index].remove();
    }
  }
}
function setArray(fragments, nodes, comment, text, value12) {
  if (value12.length === 0) {
    return {
      nodes: setText(fragments, nodes, comment, text, value12)
    };
  }
  let templates2 = value12.filter((item) => isFragment(item) && item.identifier != null);
  const identifiers = templates2.map((fragment) => fragment.identifier);
  const oldIdentifiers = fragments?.map((fragment) => fragment.identifier) ?? [];
  if (new Set(identifiers).size !== templates2.length) {
    templates2 = [];
  }
  const noTemplates = templates2.length === 0;
  if (noTemplates || nodes == null || oldIdentifiers.some((identifier) => identifier == null)) {
    return {
      fragments: noTemplates ? undefined : templates2,
      nodes: setNodes(fragments, nodes, comment, text, noTemplates ? value12.flatMap((item) => createNodes(item)) : templates2.flatMap((template4) => template4.get()))
    };
  }
  const next = templates2.map((template4) => fragments?.find((fragment) => fragment.identifier === template4.identifier) ?? template4);
  const comparison = compareArrays(fragments ?? [], templates2);
  if (comparison !== "removed") {
    let position = nodes[0];
    const before = comparison === "added" && !oldIdentifiers.includes(templates2[0].identifier);
    const items = next.flatMap((fragment) => fragment.get().flatMap((node) => ({
      identifier: fragment.identifier,
      value: node
    })));
    const { length: length2 } = items;
    for (let index = 0;index < length2; index += 1) {
      const item = items[index];
      if (comparison === "dissimilar" || !oldIdentifiers.includes(item.identifier)) {
        if (index === 0 && before) {
          position.before(item.value);
        } else {
          position.after(item.value);
        }
      }
      position = item.value;
    }
  }
  const toRemove = fragments?.filter((fragment) => !identifiers.includes(fragment.identifier)) ?? [];
  const { length } = toRemove;
  for (let index = 0;index < length; index += 1) {
    toRemove[index].remove();
  }
  return {
    fragments: next,
    nodes: next.flatMap((fragment) => fragment.get())
  };
}
function setNodes(fragments, nodes, comment, text, next) {
  if (nodes == null) {
    if (comment.parentNode != null) {
      replaceNodes([comment], next);
    } else if (text.parentNode != null) {
      replaceNodes([text], next);
    }
  } else {
    replaceNodes(nodes, next);
  }
  removeFragments(fragments);
  return next;
}
function setReactiveValue(data, comment, reactive3) {
  const item = data.items.find((item2) => item2.nodes.includes(comment));
  const text = new Text;
  let fragments;
  let nodes;
  data.sentinel.effects.add(effect(() => {
    const value12 = reactive3.get();
    if (Array.isArray(value12)) {
      const result = setArray(fragments, nodes, comment, text, value12);
      fragments = typeof result === "boolean" ? undefined : result?.fragments;
      nodes = typeof result === "boolean" ? result ? [text] : undefined : result?.nodes;
    } else {
      const valueIsFragment = isFragment(value12);
      fragments = valueIsFragment ? [value12] : undefined;
      if (valueIsFragment || isChildNode(value12)) {
        nodes = setNodes(fragments, nodes, comment, text, createNodes(value12));
      } else {
        nodes = setText(fragments, nodes, comment, text, value12);
      }
    }
    if (item != null) {
      item.fragments = fragments;
      item.nodes = [...nodes ?? [comment]];
    }
  }));
}
function setText(fragments, nodes, comment, text, value12) {
  const isNullable = isNullableOrWhitespace(value12);
  text.textContent = isNullable ? "" : getString2(value12);
  let result = false;
  if (nodes != null) {
    replaceNodes(nodes, [isNullable ? comment : text]);
    result = !isNullable;
  } else if (isNullable && comment.parentNode == null) {
    text.replaceWith(comment);
  } else if (!isNullable && text.parentNode == null) {
    comment.replaceWith(text);
    result = true;
  }
  removeFragments(fragments);
  return result ? [text] : undefined;
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
    if (isHTMLOrSVGElement(node)) {
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
      setComputedValue(data, comment, value13);
      break;
    case isReactive(value13):
      setReactiveValue(data, comment, value13);
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
    item.fragments = isFragment(value13) ? [value13] : undefined;
    item.nodes = nodes;
  }
  comment.replaceWith(...nodes);
}
function setComputedValue(data, comment, callback) {
  const value13 = computed(callback);
  data.sentinel.values.add(value13);
  setReactiveValue(data, comment, value13);
}
var commentExpression2 = /^abydon\.(\d+)$/;

// src/fragment.ts
function removeFragment(data) {
  removeSentinels(data);
  const { length } = data.items;
  for (let index = 0;index < length; index += 1) {
    const { fragments, nodes } = data.items[index];
    const { length: length2 } = fragments ?? [];
    for (let index2 = 0;index2 < length2; index2 += 1) {
      fragments?.[index2]?.remove();
    }
    removeNodes(nodes);
  }
  data.items.splice(0, length);
}
function removeSentinels(data) {
  const sentinels = [...data.sentinel.effects, ...data.sentinel.values];
  const { length } = sentinels;
  for (let index = 0;index < length; index += 1) {
    sentinels[index].stop();
  }
  data.sentinel.effects.clear();
  data.sentinel.values.clear();
}

class Fragment {
  $fragment = true;
  data;
  get identifier() {
    return this.data.identifier;
  }
  constructor(strings, expressions) {
    this.data = {
      expressions,
      strings,
      items: [],
      sentinel: {
        effects: new Set,
        values: new Set
      },
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
      mapNodes(this.data, this.data.items.flatMap((item) => item.fragments?.flatMap((fragment) => fragment.get()) ?? item.nodes));
    }
    return [
      ...this.data.items.flatMap((item) => item.fragments?.flatMap((fragment) => fragment.get()) ?? item.nodes)
    ];
  }
  identify(identifier) {
    this.data.identifier = identifier;
    return this;
  }
  remove() {
    removeFragment(this.data);
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
