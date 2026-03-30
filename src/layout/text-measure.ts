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

const measurementCache = new Map<string, TextMeasureResult>()

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

function createCacheKey(text: string, options: TextMeasureOptions): string {
  return JSON.stringify({
    text,
    fontFamily: options.fontFamily,
    fontSize: options.fontSize,
    fontStyle: options.fontStyle ?? 'normal',
    fontWeight: options.fontWeight ?? 400,
    lineHeight: options.lineHeight ?? 1.2,
    letterSpacing: options.letterSpacing ?? 0,
  })
}

export function measureText(text: string, options: TextMeasureOptions): TextMeasureResult {
  const cacheKey = createCacheKey(text, options)
  const cached = measurementCache.get(cacheKey)

  if (cached) {
    return cached
  }

  const context = getMeasurementContext()
  const lines = text.split(/\r?\n/)
  const letterSpacing = options.letterSpacing ?? 0
  const resolvedLineHeight = options.lineHeight ?? 1.2

  context.font = createFontDeclaration(options)

  let maxWidth = 0

  for (const line of lines) {
    const measuredWidth = context.measureText(line).width
    const spacingWidth = Math.max(0, line.length - 1) * letterSpacing
    maxWidth = Math.max(maxWidth, measuredWidth + spacingWidth)
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

export function clearTextMeasureCache(): void {
  measurementCache.clear()
}
