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

// src/fragment.ts
function createFragment(strings, expressions) {
  const data = {
    expressions,
    strings,
    nodes: []
  };
  const instance = Object.create({
    append(parent) {
      if (data.nodes.length > 0) {
        return parent.append(...data.nodes);
      }
      const parsed = parse(data);
      const templated = createTemplate(parsed);
      data.nodes.splice(0, data.nodes.length, ...getNodes(templated));
      parent.append(...data.nodes);
    }
  });
  return instance;
}

// src/html.ts
function html2(strings, ...values) {
  return createFragment(strings, values);
}
function parse(data) {
  const { length } = data.strings;
  let template = "";
  for (let index = 0;index < length; index += 1) {
    const part = data.strings[index];
    const expression = data.expressions[index];
    template += isNullableOrWhitespace(expression) ? part : `${part}${expression}`;
  }
  return template;
}
export {
  html2 as html
};
