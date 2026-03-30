export interface ViewportState {
  width: number
  height: number
  scrollY: number
  time: number
}

export interface SectionController {
  id: string
  element: HTMLElement
  layout(viewport: ViewportState): void
  setVisible(visible: boolean): void
  update(dt: number, viewport: ViewportState): void
}
