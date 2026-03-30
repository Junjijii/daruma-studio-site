import { createSpring } from '../layout/spring'
import { layoutTextBlock, measureText } from '../layout/text-measure'
import type { SectionController, ViewportState } from '../types'
import { createLineStack, createElement } from '../utils/dom'
import { clamp } from '../utils/math'

const CTA_TEXT = Array.from('次の景色をつくる')

interface ContactGlyph {
  element: HTMLSpanElement
  x: ReturnType<typeof createSpring>
  y: ReturnType<typeof createSpring>
  rotate: ReturnType<typeof createSpring>
  opacity: ReturnType<typeof createSpring>
  width: number
}

export function createContactSection(element: HTMLElement): SectionController {
  element.classList.add('site-section--contact')

  const shell = createElement('div', { className: 'contact-shell' })
  const label = createElement('p', {
    className: 'section-label',
    text: element.dataset.label ?? '05 / Contact',
  })
  const stage = createElement('div', { className: 'contact-stage' })
  const glyphLayer = createElement('div', { className: 'contact-glyph-layer' })
  const copyHost = createElement('div', { className: 'contact-copy' })
  const link = createElement('a', {
    className: 'contact-link',
    text: 'brand@daruma.studio',
    attrs: {
      href: 'mailto:brand@daruma.studio',
    },
  })
  const underline = createElement('span', { className: 'contact-link-line' })

  const glyphs: ContactGlyph[] = CTA_TEXT.map((character, index) => {
    const glyph = createElement('span', {
      className: 'contact-glyph',
      text: character,
    })
    glyphLayer.append(glyph)

    return {
      element: glyph,
      x: createSpring({ value: -40 * index, damping: 22, stiffness: 170 }),
      y: createSpring({ value: 110 + index * 18, damping: 22, stiffness: 170 }),
      rotate: createSpring({ value: 18 - index * 4, damping: 18, stiffness: 150 }),
      opacity: createSpring({ value: 0, damping: 18, stiffness: 170 }),
      width: 0,
    }
  })

  const linkSpring = createSpring({ value: 0, damping: 20, stiffness: 180 })

  link.append(underline)
  stage.append(glyphLayer)
  shell.append(label, stage, copyHost, link)
  element.replaceChildren(shell)

  let visible = false
  let hovered = false
  let fontSize = 56
  let stageWidth = 0
  let stageHeight = 0

  link.addEventListener('pointerenter', () => {
    hovered = true
  })
  link.addEventListener('pointerleave', () => {
    hovered = false
  })

  function layout(viewport: ViewportState): void {
    stageWidth = Math.max(260, stage.clientWidth || shell.clientWidth)
    stageHeight = clamp(viewport.height * 0.32, 220, 320)
    fontSize = clamp(Math.min(stageWidth * 0.11, stageHeight * 0.36), 34, 76)
    const copyFontSize = clamp(stageWidth * 0.017, 14, 17)

    stage.style.height = `${stageHeight}px`

    const copyLayout = layoutTextBlock(
      '相談の輪郭がまだ曖昧でも大丈夫です。散らばった要件を拾い集め、読む体験に変換するところから一緒に始めます。',
      {
        fontFamily: '"Noto Sans JP", sans-serif',
        fontSize: copyFontSize,
        fontWeight: 400,
        lineHeight: 1.88,
        maxWidth: clamp(stageWidth * 0.46, 220, 420),
      },
    )

    copyHost.replaceChildren(createLineStack(copyLayout, 'contact-copy-stack'))
    copyHost.style.fontSize = `${copyFontSize}px`
    copyHost.style.lineHeight = `${copyFontSize * 1.88}px`

    for (const glyph of glyphs) {
      glyph.element.style.fontSize = `${fontSize}px`
      glyph.width = measureText(glyph.element.textContent ?? '', {
        fontFamily: '"Noto Sans JP", sans-serif',
        fontSize,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: -fontSize * 0.015,
      }).width
    }
  }

  function setVisible(nextVisible: boolean): void {
    visible = nextVisible
  }

  function update(dt: number, viewport: ViewportState): void {
    const sectionTop = element.offsetTop
    const focus = clamp(
      (viewport.scrollY + viewport.height * 0.72 - sectionTop) / (viewport.height * 0.8),
      0,
      1,
    )

    const anchors = glyphs.map((_, index) => {
      return {
        x: 0.02 + index * 0.11 + (index % 2 === 0 ? 0 : 0.015),
        y: 0.16 + (index % 3) * 0.16,
        rotate: index % 2 === 0 ? -5 : 4,
      }
    })

    glyphs.forEach((glyph, index) => {
      const anchor = anchors[index]
      const driftX = Math.sin(viewport.time * 0.00033 + index) * 6
      const driftY = Math.cos(viewport.time * 0.00029 + index * 1.1) * 7
      const x = clamp(anchor.x * (stageWidth - glyph.width) + driftX, 0, stageWidth - glyph.width)
      const y = clamp(anchor.y * (stageHeight - fontSize) + driftY - focus * 12, 0, stageHeight - fontSize)

      glyph.x.setTarget(x)
      glyph.y.setTarget(y)
      glyph.rotate.setTarget(anchor.rotate + Math.sin(viewport.time * 0.00021 + index) * 2)
      glyph.opacity.setTarget(visible ? 0.38 + focus * 0.62 : 0.14)

      glyph.element.style.transform =
        `translate3d(${glyph.x.update(dt).value}px, ${glyph.y.update(dt).value}px, 0) rotate(${glyph.rotate.update(dt).value}deg)`
      glyph.element.style.opacity = glyph.opacity.update(dt).value.toFixed(4)
    })

    linkSpring.setTarget(hovered || visible ? 1 : 0.3)
    underline.style.transform = `scaleX(${linkSpring.update(dt).value})`
  }

  return {
    id: 'contact',
    element,
    layout,
    setVisible,
    update,
  }
}
