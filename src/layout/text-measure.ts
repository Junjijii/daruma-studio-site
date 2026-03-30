export interface TextMeasureOptions {
  fontFamily: string
  fontSize: number
  fontWeight?: number | string
  fontStyle?: string
  lineHeight?: number
  letterSpacing?: number
}

export interface TextMeasureResult {
  width: number
  height: number
  lineHeight: number
  lines: number
}

export interface TextLayoutOptions extends TextMeasureOptions {
  maxWidth: number
  maxLines?: number
  overflowSuffix?: string
}

export interface TextLayoutResult extends TextMeasureResult {
  linesText: string[]
}

const measurementCache = new Map<string, TextMeasureResult | TextLayoutResult>()

let measurementContext: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null =
  null

function getMeasurementContext(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
  if (measurementContext) {
    return measurementContext
  }

  if (typeof OffscreenCanvas !== 'undefined') {
    measurementContext = new OffscreenCanvas(1, 1).getContext('2d')
  } else if (typeof document !== 'undefined') {
    measurementContext = document.createElement('canvas').getContext('2d')
  }

  if (!measurementContext) {
    throw new Error('Canvas 2D context is not available for text measurement.')
  }

  return measurementContext
}

function createFontDeclaration({
  fontFamily,
  fontSize,
  fontStyle = 'normal',
  fontWeight = 400,
}: TextMeasureOptions): string {
  return `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
}

function measureLineWidth(
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  text: string,
  letterSpacing: number,
): number {
  if (text.length === 0) {
    return 0
  }

  return context.measureText(text).width + Math.max(0, text.length - 1) * letterSpacing
}

function splitGraphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    return Array.from(new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(text), (part) => {
      return part.segment
    })
  }

  return Array.from(text)
}

function createCacheKey(type: string, text: string, options: TextMeasureOptions | TextLayoutOptions): string {
  return JSON.stringify({
    type,
    text,
    fontFamily: options.fontFamily,
    fontSize: options.fontSize,
    fontStyle: options.fontStyle ?? 'normal',
    fontWeight: options.fontWeight ?? 400,
    lineHeight: options.lineHeight ?? 1.2,
    letterSpacing: options.letterSpacing ?? 0,
    maxWidth: 'maxWidth' in options ? options.maxWidth : undefined,
    maxLines: 'maxLines' in options ? options.maxLines : undefined,
    overflowSuffix: 'overflowSuffix' in options ? options.overflowSuffix ?? '…' : undefined,
  })
}

function clampLastLineToWidth(
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  line: string,
  maxWidth: number,
  letterSpacing: number,
  overflowSuffix: string,
): string {
  if (measureLineWidth(context, line, letterSpacing) <= maxWidth) {
    return line
  }

  const graphemes = splitGraphemes(line)
  let candidate = line

  while (candidate.length > 0) {
    candidate = graphemes.slice(0, Math.max(0, graphemes.length - 1)).join('')

    if (measureLineWidth(context, `${candidate}${overflowSuffix}`, letterSpacing) <= maxWidth) {
      return `${candidate}${overflowSuffix}`
    }

    graphemes.pop()
  }

  return overflowSuffix
}

function layoutParagraph(
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  letterSpacing: number,
): string[] {
  const graphemes = splitGraphemes(text)
  const lines: string[] = []
  let currentLine = ''

  for (const grapheme of graphemes) {
    const nextLine = `${currentLine}${grapheme}`

    if (currentLine && measureLineWidth(context, nextLine, letterSpacing) > maxWidth) {
      lines.push(currentLine)
      currentLine = grapheme.trimStart()
      continue
    }

    currentLine = nextLine
  }

  if (currentLine || lines.length === 0) {
    lines.push(currentLine)
  }

  return lines
}

export function measureText(text: string, options: TextMeasureOptions): TextMeasureResult {
  const cacheKey = createCacheKey('measure', text, options)
  const cached = measurementCache.get(cacheKey)

  if (cached) {
    return cached as TextMeasureResult
  }

  const context = getMeasurementContext()
  const lines = text.split(/\r?\n/)
  const letterSpacing = options.letterSpacing ?? 0
  const resolvedLineHeight = options.lineHeight ?? 1.2

  context.font = createFontDeclaration(options)

  let maxWidth = 0

  for (const line of lines) {
    maxWidth = Math.max(maxWidth, measureLineWidth(context, line, letterSpacing))
  }

  const result = {
    width: maxWidth,
    height: lines.length * options.fontSize * resolvedLineHeight,
    lineHeight: options.fontSize * resolvedLineHeight,
    lines: lines.length,
  }

  measurementCache.set(cacheKey, result)

  return result
}

export function layoutTextBlock(text: string, options: TextLayoutOptions): TextLayoutResult {
  const cacheKey = createCacheKey('layout', text, options)
  const cached = measurementCache.get(cacheKey)

  if (cached) {
    return cached as TextLayoutResult
  }

  const context = getMeasurementContext()
  const letterSpacing = options.letterSpacing ?? 0
  const resolvedLineHeight = options.lineHeight ?? 1.2
  const overflowSuffix = options.overflowSuffix ?? '…'
  const paragraphTexts = text.split(/\r?\n/)
  const linesText: string[] = []

  context.font = createFontDeclaration(options)

  for (const paragraph of paragraphTexts) {
    if (paragraph.length === 0) {
      linesText.push('')
      continue
    }

    const wrappedLines = layoutParagraph(
      context,
      paragraph,
      Math.max(1, options.maxWidth),
      letterSpacing,
    )

    for (const line of wrappedLines) {
      if (options.maxLines !== undefined && linesText.length === options.maxLines) {
        break
      }

      linesText.push(line)
    }

    if (options.maxLines !== undefined && linesText.length === options.maxLines) {
      break
    }
  }

  const sourceLineCount = paragraphTexts.flatMap((paragraph) => {
    return paragraph.length === 0
      ? ['']
      : layoutParagraph(context, paragraph, Math.max(1, options.maxWidth), letterSpacing)
  }).length

  const truncated = options.maxLines !== undefined && sourceLineCount > linesText.length

  if (truncated && linesText.length > 0) {
    linesText[linesText.length - 1] = clampLastLineToWidth(
      context,
      `${linesText[linesText.length - 1]}${overflowSuffix}`,
      Math.max(1, options.maxWidth),
      letterSpacing,
      overflowSuffix,
    )
  }

  let maxLineWidth = 0

  for (const line of linesText) {
    maxLineWidth = Math.max(maxLineWidth, measureLineWidth(context, line, letterSpacing))
  }

  const result = {
    width: maxLineWidth,
    height: linesText.length * options.fontSize * resolvedLineHeight,
    lineHeight: options.fontSize * resolvedLineHeight,
    lines: linesText.length,
    linesText,
  }

  measurementCache.set(cacheKey, result)

  return result
}

export function clearTextMeasureCache(): void {
  measurementCache.clear()
}
