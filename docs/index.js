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
      nodeValue: text, // TextNode.nodeValue
      children: []
    }
  };
}

function createDom(fiber) {
  var dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type);

  var isProperty = function isProperty(key) {
    return key !== "children";
  };
  Object.keys(fiber.props).filter(isProperty).forEach(function (name) {
    dom[name] = fiber.props[name];
  });

  return dom;
}

var wipRoot = null;
var nextUnitOfWork = null;

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    }
  };
  nextUnitOfWork = wipRoot;
}

// ファイバーツリー全体をDOMにコミット
function commitRoot() {
  commitWork(wipRoot.child);
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  var domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function workLoop(deadline) {
  var shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  // すべての作業が完了したらコミット
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // 子要素ごとに新しいファイバーを作成する
  var elements = fiber.props.children;
  var index = 0;
  var prevSibling = null;

  while (index < elements.length) {
    var _element = elements[index];

    var newFiber = {
      type: _element.type,
      props: _element.props,
      parent: fiber,
      dom: null

      // 子か兄弟を設定
    };if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }

  // 子がいた場合はその子が次の作業
  if (fiber.child) {
    return fiber.child;
  }
  var nextFiber = fiber;
  while (nextFiber) {
    // 子がいない場合は兄弟が次の作業
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // 兄弟もいない場合は親の兄弟を探す
    nextFiber = nextFiber.parent;
  }
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

var container = document.getElementById('root');
Diact.render(element, container);