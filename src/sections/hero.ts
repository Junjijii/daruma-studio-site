import { createSpring } from '../layout/spring'
import { layoutTextBlock, measureText } from '../layout/text-measure'
import type { SectionController, ViewportState } from '../types'
import { createLineStack, createElement } from '../utils/dom'
import { clamp } from '../utils/math'

const HERO_TITLE = Array.from('ダルマスタジオ')
const HERO_COPY =
  'レイアウトそのものを演出に変える。ダルマスタジオは、文字の流れと余白の圧力でブランドの熱量を立ち上げます。'

interface GlyphState {
  element: HTMLSpanElement
  x: ReturnType<typeof createSpring>
  y: ReturnType<typeof createSpring>
  rotate: ReturnType<typeof createSpring>
  opacity: ReturnType<typeof createSpring>
  width: number
}

const DESKTOP_ANCHORS = [
  { x: 0.02, y: 0.08, rotate: -7, shiftX: -0.18, shiftY: -0.08 },
  { x: 0.18, y: 0.02, rotate: -4, shiftX: -0.1, shiftY: -0.04 },
  { x: 0.39, y: 0.1, rotate: 1, shiftX: 0.02, shiftY: -0.03 },
  { x: 0.68, y: 0.24, rotate: 6, shiftX: 0.12, shiftY: 0.02 },
  { x: 0.48, y: 0.46, rotate: 3, shiftX: 0.04, shiftY: 0.06 },
  { x: 0.14, y: 0.58, rotate: -5, shiftX: -0.06, shiftY: 0.1 },
  { x: 0.6, y: 0.68, rotate: 7, shiftX: 0.1, shiftY: 0.12 },
] as const

const MOBILE_ANCHORS = [
  { x: 0.02, y: 0.06, rotate: -5, shiftX: -0.08, shiftY: -0.05 },
  { x: 0.18, y: 0.16, rotate: -2, shiftX: -0.04, shiftY: -0.02 },
  { x: 0.38, y: 0.12, rotate: 1, shiftX: 0.02, shiftY: -0.01 },
  { x: 0.52, y: 0.34, rotate: 5, shiftX: 0.08, shiftY: 0.03 },
  { x: 0.18, y: 0.5, rotate: 2, shiftX: -0.02, shiftY: 0.06 },
  { x: 0.46, y: 0.62, rotate: -3, shiftX: 0.04, shiftY: 0.1 },
  { x: 0.26, y: 0.76, rotate: 4, shiftX: 0.02, shiftY: 0.12 },
] as const

export function createHeroSection(element: HTMLElement): SectionController {
  element.classList.add('site-section--hero')

  const shell = createElement('div', { className: 'hero-shell' })
  const label = createElement('p', {
    className: 'section-label',
    text: element.dataset.label ?? '01 / Hero',
  })
  const stage = createElement('div', { className: 'hero-stage' })
  const accent = createElement('div', { className: 'hero-accent' })
  const orb = createElement('div', { className: 'hero-orb' })
  const glyphLayer = createElement('div', { className: 'hero-glyph-layer' })
  const detail = createElement('div', { className: 'hero-detail' })
  const leadHost = createElement('div', { className: 'hero-copy' })
  const note = createElement('p', {
    className: 'hero-note',
    text: 'scroll / resize / reroute',
  })

  const glyphs: GlyphState[] = HERO_TITLE.map((character, index) => {
    const glyph = createElement('span', {
      className: 'hero-glyph',
      text: character,
    })

    glyphLayer.append(glyph)

    return {
      element: glyph,
      x: createSpring({ value: 40 * index, damping: 20, stiffness: 170 }),
      y: createSpring({ value: -90 - index * 18, damping: 20, stiffness: 170 }),
      rotate: createSpring({ value: -18 + index * 5, damping: 18, stiffness: 150 }),
      opacity: createSpring({ value: 0, damping: 18, stiffness: 170 }),
      width: 0,
    }
  })

  const accentScale = createSpring({ value: 0.15, damping: 24, stiffness: 180 })
  const accentY = createSpring({ value: 0, damping: 22, stiffness: 180 })
  const orbX = createSpring({ value: 0, damping: 20, stiffness: 160 })
  const orbY = createSpring({ value: 0, damping: 20, stiffness: 160 })

  stage.append(accent, orb, glyphLayer)
  detail.append(leadHost, note)
  shell.append(label, stage, detail)
  element.replaceChildren(shell)

  let visible = true
  let fontSize = 120
  let stageWidth = 0
  let stageHeight = 0

  function layout(viewport: ViewportState): void {
    stageWidth = Math.max(280, shell.clientWidth)
    stageHeight = clamp(viewport.height * 0.74, 420, 760)
    fontSize = clamp(Math.min(stageWidth * 0.18, stageHeight * 0.34), 72, 164)
    const copyFontSize = clamp(stageWidth * 0.018, 15, 18)

    stage.style.height = `${stageHeight}px`

    const leadLayout = layoutTextBlock(HERO_COPY, {
      fontFamily: '"Noto Sans JP", sans-serif',
      fontSize: copyFontSize,
      fontWeight: 400,
      lineHeight: 1.85,
      maxWidth: clamp(stageWidth * 0.38, 220, 420),
    })

    leadHost.replaceChildren(createLineStack(leadLayout, 'hero-copy-stack'))
    leadHost.style.fontSize = `${copyFontSize}px`
    leadHost.style.lineHeight = `${copyFontSize * 1.85}px`

    for (const glyph of glyphs) {
      glyph.element.style.fontSize = `${fontSize}px`
      glyph.element.style.lineHeight = '0.92'
      glyph.width = measureText(glyph.element.textContent ?? '', {
        fontFamily: '"Noto Sans JP", sans-serif',
        fontSize,
        fontWeight: 700,
        lineHeight: 0.92,
        letterSpacing: -fontSize * 0.02,
      }).width
    }
  }

  function setVisible(nextVisible: boolean): void {
    visible = nextVisible
  }

  function update(dt: number, viewport: ViewportState): void {
    const anchors = viewport.width < 760 ? MOBILE_ANCHORS : DESKTOP_ANCHORS
    const sectionTop = element.offsetTop
    const focus = clamp(
      (viewport.scrollY + viewport.height * 0.6 - sectionTop) / (viewport.height * 1.1),
      0,
      1,
    )

    accentScale.setTarget(visible ? 0.84 + focus * 0.22 : 0.25)
    accentY.setTarget(stageHeight * (0.26 + focus * 0.14))
    orbX.setTarget(stageWidth * (0.56 + Math.sin(viewport.time * 0.00035) * 0.03))
    orbY.setTarget(stageHeight * (0.33 + focus * 0.12))

    const accentScaleValue = accentScale.update(dt).value
    const accentYValue = accentY.update(dt).value
    const orbXValue = orbX.update(dt).value
    const orbYValue = orbY.update(dt).value

    accent.style.transform = `translate3d(${stageWidth * 0.08}px, ${accentYValue}px, 0) scaleX(${accentScaleValue})`
    orb.style.transform = `translate3d(${orbXValue}px, ${orbYValue}px, 0)`

    glyphs.forEach((glyph, index) => {
      const anchor = anchors[index]
      const idleX = Math.sin(viewport.time * 0.00042 + index * 0.9) * (12 + focus * 10)
      const idleY = Math.cos(viewport.time * 0.00036 + index * 0.7) * (10 + focus * 18)
      const scrollX = anchor.shiftX * stageWidth * focus
      const scrollY = anchor.shiftY * stageHeight * focus
      const targetX = clamp(anchor.x * (stageWidth - glyph.width) + idleX + scrollX, 0, stageWidth - glyph.width)
      const targetY = clamp(anchor.y * (stageHeight - fontSize) + idleY + scrollY, 0, stageHeight - fontSize)

      glyph.x.setTarget(targetX)
      glyph.y.setTarget(targetY)
      glyph.rotate.setTarget(anchor.rotate + focus * 12 + Math.sin(viewport.time * 0.00025 + index) * 3)
      glyph.opacity.setTarget(visible ? 0.72 + index * 0.03 : 0.16)

      const x = glyph.x.update(dt).value
      const y = glyph.y.update(dt).value
      const rotate = glyph.rotate.update(dt).value
      const opacity = glyph.opacity.update(dt).value

      glyph.element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg)`
      glyph.element.style.opacity = opacity.toFixed(4)
    })
  }

  return {
    id: 'hero',
    element,
    layout,
    setVisible,
    update,
  }
}
