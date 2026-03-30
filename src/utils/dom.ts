import type { TextLayoutResult } from '../layout/text-measure'
type DOMChild = Node | string

interface CreateElementOptions {
  className?: string
  text?: string
  html?: string
  attrs?: Record<string, boolean | number | string | undefined>
  dataset?: Record<string, string | undefined>
  children?: DOMChild[]
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options: CreateElementOptions = {},
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName)

  if (options.className) {
    element.className = options.className
  }

  if (options.text !== undefined) {
    element.textContent = options.text
  }

  if (options.html !== undefined) {
    element.innerHTML = options.html
  }

  if (options.attrs) {
    for (const [name, value] of Object.entries(options.attrs)) {
      if (value === undefined || value === false) {
        continue
      }

      element.setAttribute(name, value === true ? '' : String(value))
    }
  }

  if (options.dataset) {
    for (const [key, value] of Object.entries(options.dataset)) {
      if (value !== undefined) {
        element.dataset[key] = value
      }
    }
  }

  if (options.children) {
    appendChildren(element, options.children)
  }

  return element
}

export function appendChildren(parent: Element, children: DOMChild[]): void {
  for (const child of children) {
    parent.append(child)
  }
}

export function createLineStack(layout: TextLayoutResult, className: string): HTMLDivElement {
  const stack = createElement('div', {
    className,
  })

  stack.replaceChildren(
    ...layout.linesText.map((line) => {
      return createElement('span', {
        className: `${className}__line`,
        text: line.length > 0 ? line : '\u00A0',
      })
    }),
  )

  return stack
}

export function queryOrThrow<T extends Element>(
  selector: string,
  parent: ParentNode = document,
): T {
  const element = parent.querySelector<T>(selector)

  if (!element) {
    throw new Error(`Element not found for selector: ${selector}`)
  }

  return element
}
