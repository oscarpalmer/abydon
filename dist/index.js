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

// src/html.ts
function html(strings, ...values) {
  const parsed = parse(strings, values);
  const templated = createTemplate(parsed);
  return getNodes(templated);
}
var parse = function(parts, values) {
  const { length } = parts;
  let template = "";
  for (let index = 0;index < length; index += 1) {
    const part = parts[index];
    const value = values[index];
    template += isNullableOrWhitespace(value) ? part : `${part}${value}`;
  }
  return template;
};
export {
  html
};
