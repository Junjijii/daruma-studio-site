import { createSpring } from '../layout/spring'
import { layoutTextBlock } from '../layout/text-measure'
import type { SectionController, ViewportState } from '../types'
import { createLineStack, createElement } from '../utils/dom'
import { clamp } from '../utils/math'

const SERVICE_ITEMS = [
  {
    title: '構成設計 / Layout Direction',
    body: 'コピーの強弱に応じて、ヒーローから下層ページまでの視線ルートを設計。セクション単位ではなく、読み進める速度全体をデザインする。',
    detail: '要件整理 / 情報の優先順位 / ワイヤーの再構成',
  },
  {
    title: '編集的 UI / Editorial Systems',
    body: '記事、作品紹介、採用情報など、テキスト量の多い画面を軽やかに読むための段組みシステムを構築。リサイズ時も行数を壊さない。',
    detail: 'column logic / variable rhythm / pull quote direction',
  },
  {
    title: 'モーション設計 / Spring Motion',
    body: 'クリックやスクロールに追従する動きを、ease ではなく spring で統一。小さな UI でも存在感のある運動を与える。',
    detail: 'scroll choreography / section reveal / responsive retargeting',
  },
  {
    title: 'ブランド言語 / Narrative Tuning',
    body: '短い見出しでも意味が立ち上がるよう、文体と余白のバランスを調整。静かな語り口でも印象に残る密度を作る。',
    detail: 'headline polishing / tone calibration / CTA writing',
  },
  {
    title: 'プロトタイピング / System Probes',
    body: '本番前に複数のレイアウト案を高速比較し、文字量と画面サイズの変化に耐える案だけを残す。試作段階から測って判断する。',
    detail: 'prototype loops / layout probes / implementation handoff',
  },
] as const

const HEADER_HEIGHT = 84

interface ServiceState {
  element: HTMLElement
  button: HTMLButtonElement
  panel: HTMLElement
  bodyHost: HTMLElement
  detailHost: HTMLElement
  height: ReturnType<typeof createSpring>
  arrow: ReturnType<typeof createSpring>
  reveal: ReturnType<typeof createSpring>
  open: boolean
  expandedHeight: number
}

export function createServicesSection(element: HTMLElement): SectionController {
  element.classList.add('site-section--services')

  const shell = createElement('div', { className: 'section-shell' })
  const header = createElement('div', { className: 'section-header' })
  const label = createElement('p', {
    className: 'section-label',
    text: element.dataset.label ?? '04 / Services',
  })
  const title = createElement('h2', {
    className: 'section-heading',
    text: 'Services',
  })
  const intro = createElement('p', {
    className: 'section-intro',
    text: '高さは開いてから測るのではなく、先に予測してから spring で追いかける。複数の項目を同時に開いても動きは破綻しない。',
  })
  const list = createElement('div', { className: 'services-list' })

  const items: ServiceState[] = SERVICE_ITEMS.map((service, index) => {
    const article = createElement('article', { className: 'service-item' })
    const button = createElement('button', {
      className: 'service-button',
      attrs: {
        type: 'button',
      },
    })
    const titleText = createElement('span', {
      className: 'service-title',
      text: service.title,
    })
    const arrow = createElement('span', {
      className: 'service-arrow',
      text: '↘',
    })
    const panel = createElement('div', { className: 'service-panel' })
    const bodyHost = createElement('div', { className: 'service-body-host' })
    const detailHost = createElement('div', { className: 'service-detail-host' })

    button.append(titleText, arrow)
    panel.append(bodyHost, detailHost)
    article.append(button, panel)
    list.append(article)

    const state: ServiceState = {
      element: article,
      button,
      panel,
      bodyHost,
      detailHost,
      height: createSpring({ value: HEADER_HEIGHT, damping: 24, stiffness: 180 }),
      arrow: createSpring({ value: 0, damping: 20, stiffness: 190 }),
      reveal: createSpring({ value: 0, damping: 18, stiffness: 170 }),
      open: index === 0,
      expandedHeight: HEADER_HEIGHT,
    }

    button.addEventListener('click', () => {
      state.open = !state.open
    })

    return state
  })

  header.append(label, title, intro)
  shell.append(header, list)
  element.replaceChildren(shell)

  let visible = false

  function layout(_viewport: ViewportState): void {
    const width = Math.max(280, list.clientWidth || shell.clientWidth)
    const bodyWidth = Math.max(160, width - 64)
    const bodyFontSize = clamp(width * 0.0145, 15, 17)
    const bodyLineHeight = bodyFontSize * 1.88

    items.forEach((item, index) => {
      const bodyLayout = layoutTextBlock(SERVICE_ITEMS[index].body, {
        fontFamily: '"Noto Sans JP", sans-serif',
        fontSize: bodyFontSize,
        fontWeight: 400,
        lineHeight: 1.88,
        maxWidth: bodyWidth,
      })
      const detailLayout = layoutTextBlock(SERVICE_ITEMS[index].detail, {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1.7,
        maxWidth: bodyWidth,
      })

      item.bodyHost.replaceChildren(createLineStack(bodyLayout, 'service-copy'))
      item.detailHost.replaceChildren(createLineStack(detailLayout, 'service-detail'))
      item.bodyHost.style.fontSize = `${bodyFontSize}px`
      item.bodyHost.style.lineHeight = `${bodyLineHeight}px`
      item.detailHost.style.fontSize = '12px'
      item.detailHost.style.lineHeight = `${12 * 1.7}px`
      item.expandedHeight = HEADER_HEIGHT + 24 + bodyLayout.height + 14 + detailLayout.height + 20
      item.element.style.height = `${item.open ? item.expandedHeight : HEADER_HEIGHT}px`
    })
  }

  function setVisible(nextVisible: boolean): void {
    visible = nextVisible
  }

  function update(dt: number, viewport: ViewportState): void {
    const sectionTop = element.offsetTop
    const revealBase = clamp(
      (viewport.scrollY + viewport.height * 0.9 - sectionTop) / (viewport.height * 0.85),
      0,
      1,
    )

    items.forEach((item, index) => {
      item.height.setTarget(item.open ? item.expandedHeight : HEADER_HEIGHT)
      item.arrow.setTarget(item.open ? 1 : 0)
      item.reveal.setTarget(visible ? clamp(revealBase - index * 0.06, 0, 1) : 0)

      const height = item.height.update(dt).value
      const arrow = item.arrow.update(dt).value
      const reveal = item.reveal.update(dt).value
      const openProgress = clamp((height - HEADER_HEIGHT) / Math.max(1, item.expandedHeight - HEADER_HEIGHT), 0, 1)

      item.element.style.height = `${height}px`
      item.element.style.opacity = reveal.toFixed(4)
      item.element.style.transform = `translate3d(0, ${(1 - reveal) * 24}px, 0)`
      item.button.style.setProperty('--open', openProgress.toFixed(4))
      item.button.querySelector<HTMLElement>('.service-arrow')!.style.transform = `rotate(${arrow * 180}deg)`
      item.panel.style.opacity = openProgress.toFixed(4)
      item.panel.style.transform = `translate3d(0, ${(1 - openProgress) * 12}px, 0)`
    })
  }

  return {
    id: 'services',
    element,
    layout,
    setVisible,
    update,
  }
}
