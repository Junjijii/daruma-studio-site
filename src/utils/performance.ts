export function debounce<T extends (...args: never[]) => void>(callback: T, wait = 120): T {
  let timer = 0

  return ((...args: never[]) => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      callback(...args)
    }, wait)
  }) as T
}
