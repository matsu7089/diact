'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// > createElement("div", null, a, b)
// {
//   "type": "div",
//   "props": { "children": [a, b] }
// }
function createElement(type, props) {
  for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  return {
    type: type,
    props: _extends({}, props, {
      children: children.map(function (child) {
        return (typeof child === 'undefined' ? 'undefined' : _typeof(child)) === 'object' ? child : createTextElement(child);
      })
    })
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  };
}

function render(element, container) {
  var dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(element.type);

  element.props.children.forEach(function (child) {
    return render(child, dom);
  });

  var isProperty = function isProperty(key) {
    return key !== "children";
  };
  Object.keys(element.props).filter(isProperty).forEach(function (name) {
    dom[name] = element.props[name];
  });

  container.appendChild(dom);
}

var Diact = {
  createElement: createElement,
  render: render

  /** @jsx Diact.createElement */
};var element = Diact.createElement(
  'div',
  { id: 'foo' },
  Diact.createElement(
    'a',
    null,
    'bar'
  ),
  Diact.createElement('b', null)
);

console.log(element);

var container = document.getElementById('root');
Diact.render(element, container);