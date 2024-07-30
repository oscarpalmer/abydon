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

// src/helpers/index.ts
function isFragment(value2) {
  return typeof value2 === "object" && value2 != null && "$fragment" in value2 && value2.$fragment === true;
}
function isFragmentElement(value2) {
  return value2 instanceof HTMLElement || value2 instanceof SVGElement;
}
function isFragmentNode(value2) {
  return value2 instanceof Comment || value2 instanceof Element || value2 instanceof Text;
}

// src/helpers/dom.ts
function createNodes(value2) {
  if (isFragmentNode(value2)) {
    return [value2];
  }
  if (isFragment(value2)) {
    return value2.get();
  }
  return [new Text(getString(value2))];
}
function createTemplate(html) {
  const template2 = document.createElement("template");
  template2.innerHTML = html;
  const cloned = template2.content.cloneNode(true);
  const scripts = [
    ...cloned instanceof Element ? cloned.querySelectorAll("script") : []
  ];
  const { length } = scripts;
  for (let index = 0;index < length; index += 1) {
    scripts[index].remove();
  }
  cloned.normalize();
  return cloned;
}
function getNodes(node) {
  return /^documentfragment$/i.test(node.constructor.name) ? [...node.childNodes] : [node];
}
function replaceNodes(from, to) {
  const { length } = from;
  for (let index = 0;index < length; index += 1) {
    const node = from[index];
    if (index === 0) {
      node.replaceWith(...to);
    } else {
      node.remove();
    }
  }
}

// node_modules/@oscarpalmer/atoms/dist/js/queue.mjs
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
function isReactive(value2) {
  return isSentinel(value2, /^array|computed|signal|store$/i);
}
function isSentinel(value2, expression) {
  return expression.test(value2?.$sentinel ?? "");
}

// node_modules/@oscarpalmer/sentinel/dist/helpers/value.mjs
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

// node_modules/@oscarpalmer/sentinel/dist/reactive/index.mjs
var primitives = new Set(["boolean", "number", "string"]);

// src/node/event.ts
function getOptions(options) {
  const parts = options.split(":");
  return {
    capture: parts.includes("c") || parts.includes("capture"),
    once: parts.includes("o") || parts.includes("once"),
    passive: !parts.includes("a") && !parts.includes("active")
  };
}
function mapEvent(element, name, value9) {
  element.removeAttribute(name);
  const [, type, options] = /^@(\w+)(?::([a-z:]+))?$/.exec(name) ?? [];
  if (typeof value9 === "function" && type != null) {
    element.addEventListener(type, value9, getOptions(options ?? ""));
  }
}

// node_modules/@oscarpalmer/atoms/dist/js/element/closest.mjs
function calculateDistance(origin, target) {
  if (origin === target || origin.parentElement === target) {
    return 0;
  }
  const comparison = origin.compareDocumentPosition(target);
  const children = [...origin.parentElement?.children ?? []];
  switch (true) {
    case children.includes(target):
      return Math.abs(children.indexOf(origin) - children.indexOf(target));
    case !!(comparison & 2 || comparison & 8):
      return traverse(origin, target);
    case !!(comparison & 4 || comparison & 16):
      return traverse(target, origin);
    default:
      return -1;
  }
}
function closest(origin, selector, context) {
  if (origin.matches(selector)) {
    return [origin];
  }
  const elements = [...(context ?? document).querySelectorAll(selector)];
  const { length } = elements;
  if (length === 0) {
    return [];
  }
  const distances = [];
  let minimum = null;
  for (let index = 0;index < length; index += 1) {
    const element = elements[index];
    const distance = calculateDistance(origin, element);
    if (distance < 0) {
      continue;
    }
    if (minimum == null || distance < minimum) {
      minimum = distance;
    }
    distances.push({
      distance,
      element
    });
  }
  return minimum == null ? [] : distances.filter((found) => found.distance === minimum).map((found) => found.element);
}
function traverse(from, to) {
  const children = [...to.children];
  if (children.includes(from)) {
    return children.indexOf(from) + 1;
  }
  let current = from;
  let distance = 0;
  let parent = from.parentElement;
  while (parent != null) {
    if (parent === to) {
      return distance + 1;
    }
    const children2 = [...parent.children ?? []];
    if (children2.includes(to)) {
      return distance + Math.abs(children2.indexOf(current) - children2.indexOf(to));
    }
    const index = children2.findIndex((child) => child.contains(to));
    if (index > -1) {
      return distance + Math.abs(index - children2.indexOf(current)) + traverse(to, children2[index]);
    }
    current = parent;
    distance += 1;
    parent = parent.parentElement;
  }
  return -1e6;
}
// src/node/attribute/value.ts
function setAttribute(element2, name, value9) {
  element2.removeAttribute(name);
  switch (true) {
    case classPattern.test(name):
      setClasses(element2, name, value9);
      return;
    case stylePattern.test(name):
      setStyle(element2, name, value9);
      return;
    default:
      setValue3(element2, name, value9);
      break;
  }
}
function setClasses(element2, name, value9) {
  function update(value10) {
    if (/^(|true)$/.test(getString(value10))) {
      element2.classList.add(...classes);
    } else {
      element2.classList.remove(...classes);
    }
  }
  const classes = name.slice(6).split(".");
  if (isReactive(value9)) {
    effect(() => {
      update(value9.get());
    });
  } else {
    update(value9);
  }
}
function setStyle(element2, name, value9) {
  function update(value10) {
    if (value10 == null || value10 === false || value10 === true && unit == null) {
      element2.style.removeProperty(property);
    } else {
      element2.style.setProperty(property, value10 === true ? unit : getString(value10));
    }
  }
  const [, property, unit] = /^\w+\.([a-z-]+)(?:\.(\w+))?$/i.exec(name) ?? [];
  if (property == null) {
    return;
  }
  if (isReactive(value9)) {
    effect(() => {
      update(value9.get());
    });
  } else {
    update(value9);
  }
}
function setValue3(element2, name, value9) {
  const callback = booleanAttributes.has(name) && name in element2 ? name === "selected" ? updateSelected(element2) : updateProperty : updateAttribute;
  if (isReactive(value9)) {
    effect(() => {
      callback(element2, name, value9.get());
    });
  } else {
    callback(element2, name, value9);
  }
}
function triggerSelectChange(select) {
  if (select != null) {
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }
}
function updateAttribute(element2, name, value9) {
  if (value9 == null) {
    element2.removeAttribute(name);
  } else {
    element2.setAttribute(name, getString(value9));
  }
}
function updateProperty(element2, name, value9) {
  element2[name] = /^(|true)$/.test(getString(value9));
}
function updateSelected(element2) {
  const select = closest(element2, "select")[0];
  const options = [...select?.options ?? []];
  return (element3, name, value9) => {
    if (select != null && options.includes(element3)) {
      triggerSelectChange(select);
    }
    updateProperty(element3, name, value9);
  };
}
var booleanAttributes = new Set([
  "checked",
  "disabled",
  "hidden",
  "inert",
  "multiple",
  "open",
  "readOnly",
  "required",
  "selected"
]);
var classPattern = /^class\./;
var stylePattern = /^style\./;

// src/node/attribute/index.ts
function getValue3(data2, original) {
  const matches = commentExpression.exec(original ?? "");
  return matches == null ? original : data2.values[+matches[1]];
}
function isBadAttribute(name, value10) {
  return /^on/i.test(name) || /^(href|src|xlink:href)$/i.test(name) && /(data:text\/html|javascript:)/i.test(value10);
}
function mapAttributes(data2, element2) {
  const attributes = [...element2.attributes];
  const { length } = attributes;
  for (let index = 0;index < length; index += 1) {
    const { name, value: value10 } = attributes[index];
    if (isBadAttribute(name, value10)) {
      element2.removeAttribute(name);
      continue;
    }
    const actual = getValue3(data2, value10);
    if (name.startsWith("@")) {
      mapEvent(element2, name, actual);
    } else if (name.includes(".") || isReactive(actual)) {
      mapValue(element2, name, actual);
    }
  }
}
function mapValue(element2, name, value10) {
  switch (true) {
    case typeof value10 === "function":
      mapValue(element2, name, value10());
      return;
    default:
      setAttribute(element2, name, value10);
      break;
  }
}
var commentExpression = /^<!--abydon\.(\d+)-->$/;

// src/node/value.ts
function setReactiveNode(comment, reactive3) {
  const text = new Text;
  let nodes;
  effect(() => {
    const value10 = reactive3.get();
    if (isFragment(value10) || isFragmentNode(value10)) {
      const next = createNodes(value10);
      if (nodes == null) {
        if (comment.parentNode != null) {
          replaceNodes([comment], next);
        } else if (text.parentNode != null) {
          replaceNodes([text], next);
        }
      } else {
        replaceNodes(nodes, next);
      }
      nodes = next;
      return;
    }
    const isNullable = isNullableOrWhitespace(value10);
    text.textContent = getString(value10);
    if (nodes != null) {
      replaceNodes(nodes, [isNullable ? comment : text]);
    } else if (isNullable && comment.parentNode == null) {
      text.replaceWith(comment);
    } else if (!isNullable && text.parentNode == null) {
      comment.replaceWith(text);
    }
    nodes = undefined;
  });
}

// src/node/index.ts
function mapNode(data2, comment) {
  const matches = commentExpression2.exec(comment.textContent ?? "");
  const value11 = matches == null ? null : data2.values[+matches[1]];
  if (value11 != null) {
    mapValue2(comment, value11);
  }
}
function mapNodes(data2, nodes) {
  const { length } = nodes;
  for (let index = 0;index < length; index += 1) {
    const node = nodes[index];
    if (node instanceof Comment) {
      mapNode(data2, node);
      continue;
    }
    if (isFragmentElement(node)) {
      mapAttributes(data2, node);
    }
    if (node.hasChildNodes()) {
      mapNodes(data2, [...node.childNodes]);
    }
  }
}
function mapValue2(comment, value11) {
  switch (true) {
    case typeof value11 === "function":
      mapValue2(comment, value11());
      return;
    case isReactive(value11):
      setReactiveNode(comment, value11);
      break;
    default:
      comment.replaceWith(...createNodes(value11));
      break;
  }
}
var commentExpression2 = /^abydon\.(\d+)$/;

// src/fragment.ts
class Fragment {
  data;
  constructor(strings, expressions) {
    this.data = {
      expressions,
      strings,
      nodes: [],
      values: []
    };
  }
  appendTo(element2) {
    element2.append(...this.get());
  }
  get() {
    if (this.data.nodes.length === 0) {
      const parsed = parse2(this.data);
      const templated = createTemplate(parsed);
      this.data.nodes.splice(0, this.data.nodes.length, ...getNodes(templated));
      mapNodes(this.data, this.data.nodes);
    }
    return [...this.data.nodes];
  }
  remove() {
    const { length } = this.data.nodes;
    for (let index = 0;index < length; index += 1) {
      const node2 = this.data.nodes[index];
      node2.parentNode?.removeChild(node2);
    }
    this.data.nodes.splice(0, length);
  }
}

// src/html.ts
function handleExpression(data2, prefix, expression) {
  if (isNullableOrWhitespace(expression)) {
    return prefix;
  }
  if (Array.isArray(expression)) {
    const { length } = expression;
    let expressions = "";
    for (let index = 0;index < length; index += 1) {
      expressions += handleExpression(data2, "", expression[index]);
    }
    return `${prefix}${expressions}`;
  }
  if (typeof expression === "function" || typeof expression === "object") {
    const index = data2.values.push(expression) - 1;
    return `${prefix}<!--abydon.${index}-->`;
  }
  return `${prefix}${expression}`;
}
function html2(strings, ...values) {
  return new Fragment(strings, values);
}
function parse2(data2) {
  const { length } = data2.strings;
  let template2 = "";
  for (let index = 0;index < length; index += 1) {
    template2 += handleExpression(data2, data2.strings[index], data2.expressions[index]);
  }
  return template2;
}
export {
  html2 as html
};
