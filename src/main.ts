import './style.css'
import { clearTextMeasureCache } from './layout/text-measure'
import { createSpring } from './layout/spring'
import { createContactSection } from './sections/contact'
import { createHeroSection } from './sections/hero'
import { createPhilosophySection } from './sections/philosophy'
import { createServicesSection } from './sections/services'
import { createWorksSection } from './sections/works'
import type { SectionController, ViewportState } from './types'
import { createElement, queryOrThrow } from './utils/dom'
import { debounce } from './utils/performance'

const controllers: SectionController[] = [
  createHeroSection(queryOrThrow('#hero')),
  createPhilosophySection(queryOrThrow('#philosophy')),
  createWorksSection(queryOrThrow('#works')),
  createServicesSection(queryOrThrow('#services')),
  createContactSection(queryOrThrow('#contact')),
]

const nav = createElement('nav', {
  className: 'site-nav',
  attrs: {
    'aria-label': 'Section navigation',
  },
})

const navItems = controllers.map((controller, index) => {
  const button = createElement('button', {
    className: 'site-nav-button',
    text: `${String(index + 1).padStart(2, '0')} ${controller.id}`,
    attrs: {
      type: 'button',
    },
  })
  const indicator = createElement('span', { className: 'site-nav-indicator' })
  const state = {
    id: controller.id,
    button,
    indicator,
    spring: createSpring({ value: index === 0 ? 1 : 0, damping: 20, stiffness: 180 }),
  }

  button.append(indicator)
  button.addEventListener('click', () => {
    scrollController.scrollTo(targetScrollTop(controller.element))
  })

  nav.append(button)

  return state
})

document.body.append(nav)

const revealStates = new Map<string, ReturnType<typeof createSpring>>()
const visibleSections = new Set<string>()

for (const controller of controllers) {
  revealStates.set(
    controller.id,
    createSpring({
      value: controller.id === 'hero' ? 1 : 0.2,
      damping: 22,
      stiffness: 180,
    }),
  )
}

const scrollController = createScrollController()
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const id = (entry.target as HTMLElement).id

      if (entry.isIntersecting || entry.intersectionRatio > 0.16) {
        visibleSections.add(id)
      } else {
        visibleSections.delete(id)
      }

      const controller = controllers.find((candidate) => candidate.id === id)
      controller?.setVisible(visibleSections.has(id))
    }
  },
  {
    threshold: [0, 0.16, 0.35, 0.6, 0.85],
  },
)

for (const controller of controllers) {
  observer.observe(controller.element)
}

function getViewport(time = performance.now()): ViewportState {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollY: window.scrollY,
    time,
  }
}

function relayoutAll(viewport: ViewportState): void {
  clearTextMeasureCache()

  for (const controller of controllers) {
    controller.layout(viewport)
  }
}

const debouncedRelayout = debounce(() => {
  relayoutAll(getViewport())
}, 140)

window.addEventListener('resize', debouncedRelayout, { passive: true })
window.addEventListener('wheel', () => scrollController.cancel(), { passive: true })
window.addEventListener('touchstart', () => scrollController.cancel(), { passive: true })
window.addEventListener('keydown', (event) => {
  if (['Space', 'PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp'].includes(event.code)) {
    scrollController.cancel()
  }
})

relayoutAll(getViewport())

if ('fonts' in document) {
  void document.fonts.ready.then(() => {
    relayoutAll(getViewport())
  })
}

let previousTime = performance.now()

function frame(time: number): void {
  const dt = Math.min((time - previousTime) / 1000, 0.05)
  previousTime = time

  scrollController.update(dt)

  const viewport = getViewport(time)
  const activeId = pickActiveSection(viewport)

  for (const controller of controllers) {
    const reveal = revealStates.get(controller.id)

    reveal?.setTarget(visibleSections.has(controller.id) || controller.id === activeId ? 1 : 0.24)
    const revealValue = reveal?.update(dt).value ?? 1

    controller.element.style.opacity = revealValue.toFixed(4)
    controller.element.style.transform = `translate3d(0, ${(1 - revealValue) * 36}px, 0)`
    controller.update(dt, viewport)
  }

  for (const item of navItems) {
    item.spring.setTarget(item.id === activeId ? 1 : 0)
    const value = item.spring.update(dt).value

    item.button.style.opacity = String(0.4 + value * 0.6)
    item.button.style.transform = `translate3d(${value * -4}px, 0, 0)`
    item.indicator.style.transform = `scaleX(${0.12 + value * 0.88})`
  }

  requestAnimationFrame(frame)
}

requestAnimationFrame(frame)

function pickActiveSection(viewport: ViewportState): string {
  const focusPoint = viewport.scrollY + viewport.height * 0.34
  let activeId = controllers[0]?.id ?? 'hero'
  let minDistance = Number.POSITIVE_INFINITY

  for (const controller of controllers) {
    const center = controller.element.offsetTop + controller.element.offsetHeight * 0.5
    const distance = Math.abs(center - focusPoint)

    if (distance < minDistance) {
      minDistance = distance
      activeId = controller.id
    }
  }

  return activeId
}

function targetScrollTop(element: HTMLElement): number {
  return Math.max(0, element.offsetTop - 24)
}

function createScrollController() {
  const spring = createSpring({
    value: window.scrollY,
    target: window.scrollY,
    damping: 28,
    stiffness: 190,
  })
  let active = false

  return {
    scrollTo(target: number) {
      spring.snapTo(window.scrollY)
      spring.setTarget(target)
      active = true
    },
    cancel() {
      if (!active) {
        return
      }

      active = false
      spring.snapTo(window.scrollY)
    },
    update(dt: number) {
      if (!active) {
        spring.snapTo(window.scrollY)
        return
      }

      const next = spring.update(dt).value
      window.scrollTo({
        top: next,
        behavior: 'auto',
      })

      if (spring.isAtRest()) {
        active = false
      }
    },
  }
}
