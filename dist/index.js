// node_modules/@oscarpalmer/atoms/dist/js/string/index.mjs
var getString = function(value) {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value !== "object" || value == null) {
    return String(value);
  }
  const valueOff = value.valueOf?.() ?? value;
  const asString = valueOff?.toString?.() ?? String(valueOff);
  return asString.startsWith("[object ") ? JSON.stringify(value) : asString;
};
// node_modules/@oscarpalmer/atoms/dist/js/is.mjs
var isNullableOrWhitespace = function(value) {
  return value == null || /^\s*$/.test(getString(value));
};

// src/helpers/index.ts
function isFragment(value) {
  return typeof value === "object" && value != null && "$fragment" in value && value.$fragment === true;
}
function isFragmentElement(value) {
  return value instanceof HTMLElement || value instanceof SVGElement;
}
function isFragmentNode(value) {
  return value instanceof Comment || value instanceof Element || value instanceof Text;
}

// src/helpers/dom.ts
function createNodes(value) {
  if (isFragmentNode(value)) {
    return [value];
  }
  if (isFragment(value)) {
    return value.get();
  }
  return [new Text(getString(value))];
}
function createTemplate(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  const cloned = template.content.cloneNode(true);
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

// node_modules/@oscarpalmer/sentinel/node_modules/@oscarpalmer/atoms/dist/js/queue.mjs
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
var effect = function(callback) {
  const state = {
    callback,
    active: false,
    reactives: new Set
  };
  const instance = Object.create({
    start() {
      if (!state.active) {
        state.active = true;
        const index = globalThis._sentinels.push(state) - 1;
        state.callback();
        globalThis._sentinels.splice(index, 1);
      }
    },
    stop() {
      if (state.active) {
        state.active = false;
        for (const reactive of state.reactives) {
          reactive.callbacks.any.delete(state);
          for (const [key, keyed] of reactive.callbacks.values) {
            keyed.delete(state);
            if (keyed.size === 0) {
              reactive.callbacks.keys.delete(key);
            }
          }
        }
        state.reactives.clear();
      }
    }
  });
  Object.defineProperty(instance, "$sentinel", {
    value: "effect"
  });
  instance.start();
  return instance;
};

// node_modules/@oscarpalmer/sentinel/dist/helpers/is.mjs
var isReactive = function(value) {
  return isSentinel(value, /^array|computed|signal|store$/i);
};
var isSentinel = function(value, expression) {
  return expression.test(value?.$sentinel ?? "");
};

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

// src/node/event.ts
function mapEvent(element, name, value10) {
  element.removeAttribute(name);
  if (typeof value10 !== "function") {
    return;
  }
}

// node_modules/@oscarpalmer/atoms/dist/js/element/closest.mjs
var closest = function(origin, selector, context) {
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
};
var calculateDistance = function(origin, target) {
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
};
var traverse = function(from, to) {
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
};
// src/node/attribute/value.ts
function setAttribute(element2, name, value10) {
  element2.removeAttribute(name);
  switch (true) {
    case classPattern.test(name):
      setClasses(element2, name, value10);
      return;
    case stylePattern.test(name):
      setStyle(element2, name, value10);
      return;
    default:
      setValue2(element2, name, value10);
      break;
  }
}
var setClasses = function(element2, name, value10) {
  function update(value11) {
    if (/^(|true)$/.test(getString(value11))) {
      element2.classList.add(...classes);
    } else {
      element2.classList.remove(...classes);
    }
  }
  const classes = name.slice(6).split(".");
  if (isReactive(value10)) {
    effect(() => {
      update(value10.get());
    });
  } else {
    update(value10);
  }
};
var setStyle = function(element2, name, value10) {
  function update(value11) {
    if (value11 == null || value11 === false || value11 === true && unit == null) {
      element2.style.removeProperty(property);
    } else {
      element2.style.setProperty(property, value11 === true ? unit : getString(value11));
    }
  }
  const [, property, unit] = /^\w+\.([a-z-]+)(?:\.(\w+))?$/i.exec(name) ?? [];
  if (property == null) {
    return;
  }
  if (isReactive(value10)) {
    effect(() => {
      update(value10.get());
    });
  } else {
    update(value10);
  }
};
var setValue2 = function(element2, name, value10) {
  const callback = booleanAttributes.has(name) && name in element2 ? name === "selected" ? updateSelected(element2) : updateProperty : updateAttribute;
  if (isReactive(value10)) {
    effect(() => {
      callback(element2, name, value10.get());
    });
  } else {
    callback(element2, name, value10);
  }
};
var triggerSelectChange = function(select) {
  if (select != null) {
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }
};
var updateAttribute = function(element2, name, value10) {
  if (value10 == null) {
    element2.removeAttribute(name);
  } else {
    element2.setAttribute(name, getString(value10));
  }
};
var updateProperty = function(element2, name, value10) {
  element2[name] = /^(|true)$/.test(getString(value10));
};
var updateSelected = function(element2) {
  const select = closest(element2, "select")[0];
  const options = [...select?.options ?? []];
  return (element3, name, value10) => {
    if (select != null && options.includes(element3)) {
      triggerSelectChange(select);
    }
    updateProperty(element3, name, value10);
  };
};
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
var getValue2 = function(data2, original) {
  const matches = commentExpression.exec(original ?? "");
  return matches == null ? original : data2.values[+matches[1]];
};
function isBadAttribute(name, value11) {
  return /^on/i.test(name) || /^(href|src|xlink:href)$/i.test(name) && /(data:text\/html|javascript:)/i.test(value11);
}
function mapAttributes(data2, element2) {
  const attributes = [...element2.attributes];
  const { length } = attributes;
  for (let index = 0;index < length; index += 1) {
    const { name, value: value11 } = attributes[index];
    if (isBadAttribute(name, value11)) {
      element2.removeAttribute(name);
      continue;
    }
    const actual = getValue2(data2, value11);
    if (name.startsWith("@")) {
      mapEvent(element2, name, actual);
    } else if (name.includes(".") || isReactive(actual)) {
      mapValue(element2, name, actual);
    }
  }
}
var mapValue = function(element2, name, value11) {
  switch (true) {
    case typeof value11 === "function":
      mapValue(element2, name, value11());
      return;
    default:
      setAttribute(element2, name, value11);
      break;
  }
};
var commentExpression = /^<!--abydon\.(\d+)-->$/;

// src/node/index.ts
var mapNode = function(data2, comment) {
  const matches = commentExpression2.exec(comment.textContent ?? "");
  const value12 = matches == null ? null : data2.values[+matches[1]];
  if (value12 != null) {
    mapValue2(comment, value12);
  }
};
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
var mapValue2 = function(comment, value12) {
  switch (true) {
    case typeof value12 === "function":
      mapValue2(comment, value12());
      return;
    case isReactive(value12):
      setReactiveNode(comment, value12);
      break;
    default:
      comment.replaceWith(...createNodes(value12));
      break;
  }
};
var commentExpression2 = /^abydon\.(\d+)$/;

// src/fragment.ts
function createFragment(strings, expressions) {
  const data2 = {
    expressions,
    strings,
    nodes: [],
    values: []
  };
  const instance = Object.create({
    appendTo(element2) {
      element2.append(...this.get());
    },
    get() {
      if (data2.nodes.length === 0) {
        const parsed = parse2(data2);
        const templated = createTemplate(parsed);
        data2.nodes.splice(0, data2.nodes.length, ...getNodes(templated));
        mapNodes(data2, data2.nodes);
      }
      return [...data2.nodes];
    },
    remove() {
      const { length } = data2.nodes;
      for (let index = 0;index < length; index += 1) {
        const node2 = data2.nodes[index];
        node2.parentNode?.removeChild(node2);
      }
      data2.nodes.splice(0, data2.nodes.length);
    }
  });
  Object.defineProperty(instance, "$fragment", {
    value: true
  });
  return instance;
}

// src/html.ts
var handleExpression = function(data2, prefix, expression) {
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
  if (typeof expression === "object") {
    const index = data2.values.push(expression) - 1;
    return `${prefix}<!--abydon.${index}-->`;
  }
  return `${prefix}${expression}`;
};
function html2(strings, ...values) {
  return createFragment(strings, values);
}
function parse2(data2) {
  const { length } = data2.strings;
  let template = "";
  for (let index = 0;index < length; index += 1) {
    template += handleExpression(data2, data2.strings[index], data2.expressions[index]);
  }
  return template;
}
export {
  html2 as html
};
