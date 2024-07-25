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
function setReactive(comment, reactive3) {
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
var mapNode = function(data, comment) {
  const matches = commentExpression.exec(comment.textContent ?? "");
  const value11 = matches == null ? null : data.values[+matches[1]];
  if (value11 != null) {
    mapValue(comment, value11);
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
    if (isFragmentElement(node)) {
    }
    if (node.hasChildNodes()) {
      mapNodes(data, [...node.childNodes]);
    }
  }
}
var mapValue = function(comment, value11) {
  switch (true) {
    case isReactive(value11):
      setReactive(comment, value11);
      break;
    case typeof value11 === "function":
      mapValue(comment, value11());
      return;
    default:
      comment.replaceWith(...createNodes(value11));
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
      return [...data.nodes];
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

// src/html.ts
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
