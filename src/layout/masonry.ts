import { layoutTextBlock, type TextLayoutResult } from './text-measure'

export interface MasonryItem {
  id: string
  category: string
  year: string
  title: string
  summary: string
  note: string
}

export interface MasonryCardMetrics {
  title: TextLayoutResult
  summaryCollapsed: TextLayoutResult
  summaryExpanded: TextLayoutResult
  note: TextLayoutResult
  collapsedHeight: number
  expandedHeight: number
}

export interface MasonryCardLayout {
  id: string
  width: number
  x: number
  y: number
  height: number
  metrics: MasonryCardMetrics
}

export interface MasonryLayoutResult {
  cards: MasonryCardLayout[]
  columnCount: number
  height: number
}

const CARD_PADDING = 22
const META_HEIGHT = 18
const FOOTER_HEIGHT = 28
const CARD_GAP = 14

export function measureMasonryCard(item: MasonryItem, cardWidth: number): MasonryCardMetrics {
  const contentWidth = Math.max(1, cardWidth - CARD_PADDING * 2)
  const title = layoutTextBlock(item.title, {
    fontFamily: '"Noto Sans JP", sans-serif',
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: -0.6,
    maxWidth: contentWidth,
  })
  const summaryCollapsed = layoutTextBlock(item.summary, {
    fontFamily: '"Noto Sans JP", sans-serif',
    fontSize: 15,
    fontWeight: 400,
    lineHeight: 1.8,
    maxWidth: contentWidth,
    maxLines: 3,
  })
  const summaryExpanded = layoutTextBlock(item.summary, {
    fontFamily: '"Noto Sans JP", sans-serif',
    fontSize: 15,
    fontWeight: 400,
    lineHeight: 1.8,
    maxWidth: contentWidth,
  })
  const note = layoutTextBlock(item.note, {
    fontFamily: '"Noto Sans JP", sans-serif',
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.7,
    maxWidth: contentWidth,
  })

  const collapsedHeight =
    CARD_PADDING * 2 + META_HEIGHT + CARD_GAP + title.height + CARD_GAP + summaryCollapsed.height + FOOTER_HEIGHT
  const expandedHeight =
    CARD_PADDING * 2 +
    META_HEIGHT +
    CARD_GAP +
    title.height +
    CARD_GAP +
    summaryExpanded.height +
    CARD_GAP +
    note.height +
    FOOTER_HEIGHT

  return {
    title,
    summaryCollapsed,
    summaryExpanded,
    note,
    collapsedHeight,
    expandedHeight,
  }
}

export function computeMasonryLayout(
  items: MasonryItem[],
  containerWidth: number,
  activeId: string | null,
): MasonryLayoutResult {
  const gap = 18
  const columnCount = Math.max(1, Math.min(3, Math.floor((containerWidth + gap) / 280)))
  const width = (containerWidth - gap * (columnCount - 1)) / columnCount
  const columnHeights = new Array<number>(columnCount).fill(0)
  const cards: MasonryCardLayout[] = []

  for (const item of items) {
    const metrics = measureMasonryCard(item, width)
    const height = item.id === activeId ? metrics.expandedHeight : metrics.collapsedHeight
    const column = pickShortestColumn(columnHeights)
    const x = column * (width + gap)
    const y = columnHeights[column]

    columnHeights[column] += height + gap
    cards.push({
      id: item.id,
      width,
      x,
      y,
      height,
      metrics,
    })
  }

  return {
    cards,
    columnCount,
    height: Math.max(...columnHeights, 0) - (cards.length > 0 ? gap : 0),
  }
}

function pickShortestColumn(columns: number[]): number {
  let index = 0
  let min = columns[0] ?? 0

  for (let cursor = 1; cursor < columns.length; cursor += 1) {
    if (columns[cursor] < min) {
      index = cursor
      min = columns[cursor]
    }
  }

  return index
}
