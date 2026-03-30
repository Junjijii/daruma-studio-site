import { createSpring } from '../layout/spring'
import { layoutTextBlock, measureText } from '../layout/text-measure'
import type { SectionController, ViewportState } from '../types'
import { createLineStack, createElement } from '../utils/dom'
import { clamp } from '../utils/math'

const PHILOSOPHY_BLOCKS = [
  {
    kicker: 'Approach',
    body: '文字は情報を載せるだけでなく、読む速度と視線の重さを制御する建築素材でもある。ダルマスタジオでは、その圧力差をレイアウトの主役にする。',
    angle: -3,
  },
  {
    kicker: 'Flow',
    body: '画面幅が変われば列数も余白も再編され、言葉は固定された箱ではなく、環境に応答する流れとして再配置される。',
    angle: 4,
  },
  {
    kicker: 'Rhythm',
    body: '段落ごとにリズムをずらし、フェードではなく呼吸するような出入りを与えることで、読解のテンポに抑揚をつくる。',
    angle: -2,
  },
  {
    kicker: 'Editorial',
    body: '引きの強いフレーズは角度を持ったストラップとして差し込み、本文の密度と衝突させながら視線の逃げ道を設計する。',
    angle: 5,
  },
  {
    kicker: 'Systems',
    body: 'DOM の都合で行数を決めるのではなく、先に測る。測ってから流す。だから resize しても構造が破綻しない。',
    angle: -4,
  },
] as const

interface PhilosophyCardState {
  element: HTMLElement
  bodyHost: HTMLElement
  x: ReturnType<typeof createSpring>
  y: ReturnType<typeof createSpring>
  reveal: ReturnType<typeof createSpring>
  angle: number
  width: number
  baseX: number
  baseY: number
}

export function createPhilosophySection(element: HTMLElement): SectionController {
  element.classList.add('site-section--philosophy')

  const shell = createElement('div', { className: 'section-shell' })
  const header = createElement('div', { className: 'section-header' })
  const label = createElement('p', {
    className: 'section-label',
    text: element.dataset.label ?? '02 / Philosophy',
  })
  const title = createElement('h2', {
    className: 'section-heading',
    text: '言葉が空間を決める',
  })
  const intro = createElement('p', {
    className: 'section-intro',
    text: 'Editorial Engine のように、列幅と流れを JavaScript 側で再編しながら、読む動線を組み替えるセクション。',
  })
  const stage = createElement('div', { className: 'philosophy-stage' })
  const aside = createElement('div', {
    className: 'philosophy-aside',
    text: 'TEXT DIRECTS SPACE',
  })

  const cards: PhilosophyCardState[] = PHILOSOPHY_BLOCKS.map((block, index) => {
    const card = createElement('article', { className: 'philosophy-card' })
    const kicker = createElement('p', {
      className: 'philosophy-card-kicker',
      text: block.kicker,
    })
    const bodyHost = createElement('div', { className: 'philosophy-card-body' })

    card.append(kicker, bodyHost)
    stage.append(card)

    return {
      element: card,
      bodyHost,
      x: createSpring({ value: 0, damping: 24, stiffness: 190 }),
      y: createSpring({ value: 40 + index * 16, damping: 24, stiffness: 190 }),
      reveal: createSpring({ value: 0, damping: 18, stiffness: 170 }),
      angle: block.angle,
      width: 0,
      baseX: 0,
      baseY: 0,
    }
  })

  header.append(label, title, intro)
  stage.append(aside)
  shell.append(header, stage)
  element.replaceChildren(shell)

  let visible = false
  let asideWidth = 0
  let stageHeight = 0

  function layout(_viewport: ViewportState): void {
    const stageWidth = Math.max(280, stage.clientWidth || shell.clientWidth)
    const gap = 18
    const columnCount = stageWidth > 980 ? 3 : stageWidth > 660 ? 2 : 1
    const columnWidth = (stageWidth - gap * (columnCount - 1)) / columnCount
    const bodyFontSize = clamp(stageWidth * 0.015, 15, 17)
    const bodyLineHeight = bodyFontSize * 1.92
    const columnHeights = new Array<number>(columnCount).fill(0).map((value, index) => {
      return value + (index % 2 === 0 ? 0 : 36)
    })

    cards.forEach((card, index) => {
      const bodyLayout = layoutTextBlock(PHILOSOPHY_BLOCKS[index].body, {
        fontFamily: '"Noto Sans JP", sans-serif',
        fontSize: bodyFontSize,
        fontWeight: 400,
        lineHeight: 1.92,
        maxWidth: columnWidth - 40,
      })
      const height = bodyLayout.height + 72
      const column = pickShortestColumn(columnHeights)

      card.width = columnWidth
      card.baseX = column * (columnWidth + gap)
      card.baseY = columnHeights[column]

      columnHeights[column] += height + gap
      card.bodyHost.replaceChildren(createLineStack(bodyLayout, 'philosophy-copy'))
      card.bodyHost.style.fontSize = `${bodyFontSize}px`
      card.bodyHost.style.lineHeight = `${bodyLineHeight}px`
      card.element.style.width = `${columnWidth}px`
    })

    stageHeight = Math.max(...columnHeights, 260)
    stage.style.height = `${stageHeight}px`

    asideWidth = measureText(aside.textContent ?? '', {
      fontFamily: '"Noto Sans JP", sans-serif',
      fontSize: clamp(stageWidth * 0.022, 18, 28),
      fontWeight: 700,
      lineHeight: 1,
      letterSpacing: 1.8,
    }).width

    aside.style.fontSize = `${clamp(stageWidth * 0.022, 18, 28)}px`
  }

  function setVisible(nextVisible: boolean): void {
    visible = nextVisible
  }

  function update(dt: number, viewport: ViewportState): void {
    const sectionTop = element.offsetTop
    const revealBase = clamp(
      (viewport.scrollY + viewport.height * 0.86 - sectionTop) / (viewport.height * 0.9),
      0,
      1,
    )
    const sectionDepth = clamp(
      (viewport.scrollY - sectionTop + viewport.height * 0.5) / (viewport.height * 1.6),
      0,
      1,
    )

    cards.forEach((card, index) => {
      const driftX = Math.sin(viewport.time * 0.00028 + index * 1.2) * 6
      const driftY = Math.cos(viewport.time * 0.00024 + index * 0.8) * 8
      const revealTarget = visible ? clamp(revealBase - index * 0.08, 0, 1) : 0

      card.x.setTarget(card.baseX + driftX)
      card.y.setTarget(card.baseY + driftY)
      card.reveal.setTarget(revealTarget)

      const x = card.x.update(dt).value
      const y = card.y.update(dt).value
      const reveal = card.reveal.update(dt).value

      card.element.style.transform =
        `translate3d(${x}px, ${y + (1 - reveal) * 36}px, 0) rotate(${card.angle * (0.55 + sectionDepth * 0.45)}deg)`
      card.element.style.opacity = reveal.toFixed(4)
    })

    aside.style.transform =
      `translate3d(${Math.max(0, stage.clientWidth - asideWidth - 8)}px, ${stageHeight * (0.12 + sectionDepth * 0.1)}px, 0) rotate(90deg)`
    aside.style.opacity = String(0.25 + revealBase * 0.65)
  }

  return {
    id: 'philosophy',
    element,
    layout,
    setVisible,
    update,
  }
}

function pickShortestColumn(columns: number[]): number {
  let result = 0
  let min = columns[0] ?? 0

  for (let index = 1; index < columns.length; index += 1) {
    if (columns[index] < min) {
      min = columns[index]
      result = index
    }
  }

  return result
}
