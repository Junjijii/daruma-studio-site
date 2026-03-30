import { computeMasonryLayout, type MasonryItem } from '../layout/masonry'
import { createSpring } from '../layout/spring'
import type { SectionController, ViewportState } from '../types'
import { createLineStack, createElement } from '../utils/dom'
import { clamp } from '../utils/math'

const WORKS_ITEMS: MasonryItem[] = [
  {
    id: '1',
    category: 'Brand Film',
    year: '2026',
    title: '街角の火を編む',
    summary:
      '地方の工房ブランドに向けて、音声ガイド付きの没入型 LP を制作。短い見出しでも文脈が立ち上がるよう、余白とリズムを再設計した。',
    note: 'hover すると注釈が開き、周囲のカードは予測高さに沿って位置を譲る。',
  },
  {
    id: '2',
    category: 'Editorial',
    year: '2025',
    title: '雨粒のプロトコル',
    summary:
      '研究報告サイトを単なる論文置き場にせず、章立てごとに視線速度が変わるエディトリアル体験へ変換した。',
    note: '段組みの変化はブラウザの auto layout ではなく、計測済みテキストから導いている。',
  },
  {
    id: '3',
    category: 'Launch',
    year: '2026',
    title: '朱の輪郭線',
    summary:
      '新規スタジオのティザーサイト。ブランドカラーの線が画面を横切り、その周辺でコピーが再配列される。',
    note: '短文でもリズムが残るよう、文字間の密度をカードごとに微調整した。',
  },
  {
    id: '4',
    category: 'Exhibition',
    year: '2025',
    title: '展示室の文体',
    summary:
      '展示会マップと作品解説を統合し、移動しながら読むためのレイアウトを設計。立ち止まり時間に合わせて情報密度を変えた。',
    note: 'スマホでは列数を減らしつつ、カード密度だけは落ちないよう Masonry を再計算する。',
  },
  {
    id: '5',
    category: 'Archive',
    year: '2024',
    title: '静かな機械語',
    summary:
      '長いアーカイブ年表を、年代ごとの温度差が伝わるタイポグラフィに整理。本文量は多いが、読む負荷は軽い。',
    note: 'hover で本文の続きが開き、関連メモが現れる。',
  },
  {
    id: '6',
    category: 'Identity',
    year: '2026',
    title: '木漏れ日の記録線',
    summary:
      '地域プロジェクトの CI とサイトを同時制作。コピーの長さが変わっても視線が破綻しないよう、行数予測を先に行った。',
    note: 'カードは絶対配置でも詰められる。高さ予測があるから、隙間を先回りできる。',
  },
  {
    id: '7',
    category: 'Campaign',
    year: '2025',
    title: '音の余白計画',
    summary:
      '音響ブランドのキャンペーンページ。コピーの一拍を伸ばすために、段落間の距離をインタラクションに応じて可変化した。',
    note: 'アクティブなカード以外も数ピクセル単位で位置を揺らし、静止感を消している。',
  },
]

interface CardState {
  id: string
  element: HTMLElement
  titleHost: HTMLElement
  summaryHost: HTMLElement
  noteHost: HTMLElement
  x: ReturnType<typeof createSpring>
  y: ReturnType<typeof createSpring>
  height: ReturnType<typeof createSpring>
  focus: ReturnType<typeof createSpring>
  reveal: ReturnType<typeof createSpring>
}

export function createWorksSection(element: HTMLElement): SectionController {
  element.classList.add('site-section--works')

  const shell = createElement('div', { className: 'section-shell' })
  const header = createElement('div', { className: 'section-header' })
  const label = createElement('p', {
    className: 'section-label',
    text: element.dataset.label ?? '03 / Works',
  })
  const title = createElement('h2', {
    className: 'section-heading',
    text: 'Works',
  })
  const intro = createElement('p', {
    className: 'section-intro',
    text: 'Masonry は CSS 任せにせず、テキスト量から先に高さを見積もってから詰める。hover で一枚が開くと、他のカードも自然に位置を譲る。',
  })
  const board = createElement('div', { className: 'works-board' })

  const cards: CardState[] = WORKS_ITEMS.map((item, index) => {
    const card = createElement('article', {
      className: 'works-card',
      attrs: {
        tabindex: 0,
      },
    })
    const meta = createElement('div', { className: 'works-card-meta' })
    const category = createElement('span', {
      className: 'works-card-category',
      text: item.category,
    })
    const year = createElement('span', {
      className: 'works-card-year',
      text: item.year,
    })
    const titleHost = createElement('div', { className: 'works-card-title-host' })
    const summaryHost = createElement('div', { className: 'works-card-summary-host' })
    const noteHost = createElement('div', { className: 'works-card-note-host' })

    meta.append(category, year)
    card.append(meta, titleHost, summaryHost, noteHost)
    board.append(card)

    card.addEventListener('pointerenter', () => {
      activeId = item.id
      relayout(lastViewport)
    })
    card.addEventListener('pointerleave', () => {
      activeId = null
      relayout(lastViewport)
    })
    card.addEventListener('focus', () => {
      activeId = item.id
      relayout(lastViewport)
    })
    card.addEventListener('blur', () => {
      activeId = null
      relayout(lastViewport)
    })

    return {
      id: item.id,
      element: card,
      titleHost,
      summaryHost,
      noteHost,
      x: createSpring({ value: 0, damping: 26, stiffness: 200 }),
      y: createSpring({ value: index * 18, damping: 26, stiffness: 200 }),
      height: createSpring({ value: 260, damping: 24, stiffness: 190 }),
      focus: createSpring({ value: 0, damping: 20, stiffness: 180 }),
      reveal: createSpring({ value: 0, damping: 18, stiffness: 170 }),
    }
  })

  header.append(label, title, intro)
  shell.append(header, board)
  element.replaceChildren(shell)

  let visible = false
  let activeId: string | null = null
  let lastViewport: ViewportState = { width: window.innerWidth, height: window.innerHeight, scrollY: 0, time: 0 }
  let activeLayout = computeMasonryLayout(WORKS_ITEMS, Math.max(280, board.clientWidth || shell.clientWidth), activeId)

  function relayout(viewport: ViewportState): void {
    lastViewport = viewport

    const width = Math.max(280, board.clientWidth || shell.clientWidth)
    const layouts = [computeMasonryLayout(WORKS_ITEMS, width, null)]

    for (const item of WORKS_ITEMS) {
      layouts.push(computeMasonryLayout(WORKS_ITEMS, width, item.id))
    }

    activeLayout = computeMasonryLayout(WORKS_ITEMS, width, activeId)
    const maxHeight = Math.max(...layouts.map((layout) => layout.height))

    board.style.height = `${maxHeight}px`

    cards.forEach((card) => {
      const next = activeLayout.cards.find((entry) => entry.id === card.id)

      if (!next) {
        return
      }

      card.element.style.width = `${next.width}px`
      card.titleHost.replaceChildren(createLineStack(next.metrics.title, 'works-card-title'))
      card.summaryHost.replaceChildren(createLineStack(next.metrics.summaryExpanded, 'works-card-summary'))
      card.noteHost.replaceChildren(createLineStack(next.metrics.note, 'works-card-note'))
      card.titleHost.style.fontSize = '24px'
      card.titleHost.style.lineHeight = '24px'
      card.summaryHost.style.fontSize = '15px'
      card.summaryHost.style.lineHeight = `${15 * 1.8}px`
      card.noteHost.style.fontSize = '13px'
      card.noteHost.style.lineHeight = `${13 * 1.7}px`

      card.x.setTarget(next.x)
      card.y.setTarget(next.y)
      card.height.setTarget(next.height)
    })
  }

  function layout(viewport: ViewportState): void {
    relayout(viewport)
  }

  function setVisible(nextVisible: boolean): void {
    visible = nextVisible
  }

  function update(dt: number, viewport: ViewportState): void {
    lastViewport = viewport
    const sectionTop = element.offsetTop
    const revealBase = clamp(
      (viewport.scrollY + viewport.height * 0.92 - sectionTop) / (viewport.height * 0.9),
      0,
      1,
    )

    cards.forEach((card, index) => {
      card.focus.setTarget(activeId === card.id ? 1 : 0)
      card.reveal.setTarget(visible ? clamp(revealBase - index * 0.06, 0, 1) : 0)

      const x = card.x.update(dt).value
      const y = card.y.update(dt).value
      const height = card.height.update(dt).value
      const focus = card.focus.update(dt).value
      const reveal = card.reveal.update(dt).value

      card.element.style.transform = `translate3d(${x}px, ${y + (1 - reveal) * 40}px, 0)`
      card.element.style.height = `${height}px`
      card.element.style.opacity = reveal.toFixed(4)
      card.element.style.setProperty('--focus', focus.toFixed(4))
      card.noteHost.style.opacity = String(clamp((focus - 0.1) / 0.9, 0, 1))
      card.noteHost.style.transform = `translate3d(0, ${(1 - focus) * 18}px, 0)`
      card.element.style.zIndex = activeId === card.id ? '2' : '1'
    })
  }

  return {
    id: 'works',
    element,
    layout,
    setVisible,
    update,
  }
}
