// > createElement("div", null, a, b)
// {
//   "type": "div",
//   "props": { "children": [a, b] }
// }
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => 
        typeof child === 'object'
          ? child
          : createTextElement(child)
      )
    }
  }
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text, // TextNode.nodeValue
      children: []
    }
  }
}

function render(element, container) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type)

  const isProperty = key => key !== "children"
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = element.props[name]
    })

  element.props.children.forEach(child => 
    render(child, dom)  
  )
  
  container.appendChild(dom)
}

const Diact = {
  createElement,
  render
}

/** @jsx Diact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)

const container = document.getElementById('root')
Diact.render(element, container)
