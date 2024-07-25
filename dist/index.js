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

// src/helpers/dom.ts
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

// src/node/index.ts
var mapNode = function(data, comment) {
  const matches = commentExpression.exec(comment.textContent ?? "");
  const value10 = matches == null ? null : data.values[+matches[1]];
  if (value10 != null) {
    mapValue(comment, value10);
  }
};
function mapNodes(data, nodes) {
  const { length } = nodes;
  for (let index = 0;index < length; index += 1) {
    const node = nodes[index];
    if (node instanceof Comment) {
      mapNode(data, node);
      continue;
    }
    if (node instanceof Element) {
    }
    if (node.hasChildNodes()) {
      mapNodes(data, [...node.childNodes]);
    }
  }
}
var mapReactive = function(comment, value10) {
};
var mapValue = function(comment, value10) {
  switch (true) {
    case value10 instanceof Node:
      comment.replaceWith(value10);
      return;
    case isFragment(value10):
      comment.replaceWith(value10.get());
      break;
    case isReactive(value10):
      mapReactive(comment, value10);
      break;
    case typeof value10 === "function":
      mapValue(comment, value10());
      return;
    case typeof value10 === "object":
      comment.replaceWith(new Text(getString(value10)));
      break;
  }
};
var commentExpression = /^abydon\.(\d+)$/;

// src/fragment.ts
function createFragment(strings, expressions) {
  const data = {
    expressions,
    strings,
    nodes: [],
    values: []
  };
  const instance = Object.create({
    get() {
      if (data.nodes.length === 0) {
        const parsed = parse(data);
        const templated = createTemplate(parsed);
        data.nodes.splice(0, data.nodes.length, ...getNodes(templated));
        mapNodes(data, data.nodes);
      }
      return getFragment(data.nodes);
    },
    remove() {
      const { length } = data.nodes;
      for (let index = 0;index < length; index += 1) {
        const node2 = data.nodes[index];
        node2.parentNode?.removeChild(node2);
      }
      data.nodes.splice(0, data.nodes.length);
    }
  });
  Object.defineProperty(instance, "$fragment", {
    value: true
  });
  return instance;
}
function isFragment(value10) {
  return typeof value10 === "object" && value10 != null && "$fragment" in value10;
}

// src/html.ts
function getFragment(nodes) {
  const fragment3 = document.createDocumentFragment();
  fragment3.append(...nodes);
  return fragment3;
}
var handleExpression = function(data, prefix, expression) {
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
  if (typeof expression === "object") {
    const index = data.values.push(expression) - 1;
    return `${prefix}<!--abydon.${index}-->`;
  }
  return `${prefix}${expression}`;
};
function html2(strings, ...values) {
  return createFragment(strings, values);
}
function parse(data) {
  const { length } = data.strings;
  let template = "";
  for (let index = 0;index < length; index += 1) {
    template += handleExpression(data, data.strings[index], data.expressions[index]);
  }
  return template;
}
export {
  html2 as html
};
