interface ObserverWrapped {
  on(): void
  off(): void
  connected(): boolean
  reroot(x: HTMLElement | Document): void
}

interface ObserverSuccessContext<T extends HTMLElement> extends ObserverWrapped {
  selected: T
  selectAll: () => T[]
  mutationList: MutationRecord[]
}

interface ObserverFailureContext extends ObserverWrapped {
  mutationList: MutationRecord[]
}

interface ObserverSpec<T extends HTMLElement> {
  parentNode?: HTMLElement | Document
  selector: string
  failCallback?: (x: ObserverFailureContext) => void
  successCallback?: (x: ObserverSuccessContext<T>) => void
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
}: ObserverSpec<T>): ObserverWrapped {
  console.debug(`launchObserver/${selector}: in`)
  // if parent node does not exist, use body instead
  let trigger = 0
  let success = 0
  if (!parentNode) {
    parentNode = document
  }

  let _connected = false

  const off = () => {
    if (_connected) {
      console.debug(`launchObserver/${selector}: off`)
      observer.takeRecords()
      observer.disconnect()
      _connected = false
    }
  }

  const on = () => {
    if (!_connected) {
      console.debug(`launchObserver/${selector}: on`)
      observer.observe(parentNode, config)
      _connected = true
    }
  }

  const connected = () => _connected

  const reroot = (newParentNode: HTMLElement | Document) => {
    console.debug(`launchObserver/${selector}: reroot`, newParentNode)
    parentNode = newParentNode
  }

  const wrapped: ObserverWrapped = { on, off, connected, reroot }

  const observeFunc: MutationCallback = (mutationList) => {
    trigger += 1
    const selected: T = parentNode.querySelector(selector)
    if (!selected) {
      console.debug(`launchObserver/${selector}: fail (efficiency=${success / trigger})`)
      if (failCallback) {
        failCallback({ ...wrapped, mutationList })
      }
      return
    }

    console.debug(`launchObserver/${selector}: success (efficiency=${success / trigger})`, selected)
    if (stopWhenSuccess) {
      off()
    }
    if (successCallback) {
      success += 1
      successCallback({
        ...wrapped,
        selected,
        selectAll() {
          return Array.from(parentNode.querySelectorAll(selector))
        },
        mutationList,
      })
    }
  }

  const observer = new MutationObserver(observeFunc)
  on()

  return wrapped
}

export function elementEmerge(selector: string, parentNode?: HTMLElement | Document): Promise<HTMLElement> {
  const g = (parentNode ?? document).querySelector(selector) as HTMLElement
  if (g) return Promise.resolve(g)
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

export async function chainEmerge(parentNode: HTMLElement | Document, ...selectors: string[]): Promise<HTMLElement> {
  let node = parentNode
  for (const selector of selectors) {
    node = await elementEmerge(selector, node)
  }
  if (node instanceof Document) {
    throw Error('must use at least one selector')
  }
  return node
}
