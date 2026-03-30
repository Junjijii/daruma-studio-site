import './style.css'
import { measureText } from './layout/text-measure'
import { createSpring } from './layout/spring'
import { createElement, queryOrThrow } from './utils/dom'

const sectionContent = [
  {
    id: 'hero',
    title: 'Daruma Studio',
    body: 'Text-first motion studies for a studio site inspired by editorial systems.',
  },
  {
    id: 'philosophy',
    title: 'Philosophy',
    body: 'Dynamic typography, deliberate spacing, and layout logic driven by code.',
  },
  {
    id: 'works',
    title: 'Works',
    body: 'Case studies will expand here as masonry and flow-based layouts come online.',
  },
  {
    id: 'services',
    title: 'Services',
    body: 'Accordion-driven service outlines will use lightweight spring motion.',
  },
  {
    id: 'contact',
    title: 'Contact',
    body: 'A minimal call to action will close the single-page experience.',
  },
]

for (const section of sectionContent) {
  const element = queryOrThrow<HTMLElement>(`#${section.id}`)
  const title = createElement('h1', {
    className: section.id === 'hero' ? 'section-title section-title--hero' : 'section-title',
    text: section.title,
  })

  element.replaceChildren(
    createElement('p', {
      className: 'section-label',
      text: element.dataset.label ?? '',
    }),
    title,
    createElement('p', {
      className: 'section-body',
      text: section.body,
    }),
  )

  if (section.id === 'hero') {
    syncHeroMeasure(title, section.title)
    animateHero(title)
  }
}

function syncHeroMeasure(title: HTMLElement, text: string): void {
  const applyMeasure = () => {
    const metrics = measureText(text, {
      fontFamily: '"Noto Sans JP", sans-serif',
      fontSize: 84,
      fontWeight: 700,
      lineHeight: 0.95,
      letterSpacing: -1.5,
    })

    title.style.maxWidth = `min(${Math.ceil(metrics.width)}px, 100%)`
  }

  applyMeasure()

  if ('fonts' in document) {
    void document.fonts.ready.then(applyMeasure)
  }
}

function animateHero(title: HTMLElement): void {
  const spring = createSpring({
    value: 0,
    target: 1,
    mass: 1,
    stiffness: 180,
    damping: 20,
  })

  let previousTime = performance.now()

  const tick = (time: number) => {
    const dt = Math.min((time - previousTime) / 1000, 0.05)
    previousTime = time

    const { value } = spring.update(dt)
    title.style.setProperty('--hero-progress', value.toFixed(4))

    if (!spring.isAtRest()) {
      requestAnimationFrame(tick)
    }
  }

  title.style.setProperty('--hero-progress', '0')
  requestAnimationFrame(tick)
}
