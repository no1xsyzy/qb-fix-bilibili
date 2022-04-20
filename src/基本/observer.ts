interface ObserverContext<T extends HTMLElement> {
  selected: T
  selectAll: () => T[]
  disconnect: () => void
}

interface ObserverSpec<T extends HTMLElement> {
  parentNode?: HTMLElement | Document
  selector: string
  failCallback?: () => void
  successCallback?: (x: ObserverContext<T>) => void
  stopWhenSuccess?: boolean
  config?: MutationObserverInit
}

export function launchObserver<T extends HTMLElement>({
  parentNode,
  selector,
  failCallback = null,
  successCallback = null,
  stopWhenSuccess = true,
  config = {
    childList: true,
    subtree: true,
  },
}: ObserverSpec<T>) {
  // if parent node does not exist, use body instead
  let trigger = 0
  let success = 0
  if (!parentNode) {
    parentNode = document
  }
  const observeFunc = () => {
    trigger += 1
    const selected: T = parentNode.querySelector(selector)
    if (!selected) {
      if (failCallback) {
        failCallback()
      }
      return
    }
    if (stopWhenSuccess) {
      observer.disconnect()
    }
    if (successCallback) {
      success += 1
      console.debug(`launchObserver: observed ${selector} (efficiency=${success / trigger})`, selected)
      successCallback({
        selected,
        selectAll() {
          return Array.from(parentNode.querySelectorAll(selector))
        },
        disconnect() {
          observer.disconnect()
        },
      })
    }
  }
  const observer = new MutationObserver(observeFunc)
  observer.observe(parentNode, config)
}

export function elementEmerge(selector: string, parentNode?: HTMLElement | Document): Promise<HTMLElement> {
  return new Promise((resolve) => {
    launchObserver({
      parentNode,
      selector,
      successCallback: ({ selected }) => {
        console.debug(`elementEmerge: ${selector} emerged as`, selected)
        resolve(selected)
      },
    })
  })
}
