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
  successCallback?: (x: ObserverSuccessContext<T>) => void | Promise<void>
  stopWhenSuccess?: boolean
  config?: MutationObserverInit
}

function betterSelector<T extends HTMLElement>(
  parentNode: HTMLElement | Document,
  selector: string,
): { select(): T; selectAll(): T[] } {
  const className = /^\.([\w_-]+)$/.exec(selector)
  if (className) {
    return {
      select: () => parentNode.getElementsByClassName(className[1])[0] as T,
      selectAll: () => Array.from(parentNode.getElementsByClassName(className[1])) as T[],
    }
  }

  const elementID = /^#([\w_-]+)$/.exec(selector)
  if (elementID) {
    return {
      select: () => document.getElementById(className[1])[0],
      selectAll: () => [document.getElementById(className[1]) as T],
    }
  }

  const tagName = /^([\w_-]+)$/.exec(selector)
  if (tagName) {
    return {
      select: () => parentNode.getElementsByTagName(className[1])[0] as T,
      selectAll: () => Array.from(parentNode.getElementsByTagName(className[1])) as T[],
    }
  }

  return {
    select: () => parentNode.querySelector(selector),
    selectAll: () => Array.from(parentNode.querySelectorAll(selector)),
  }
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

  const { select, selectAll } = betterSelector<T>(parentNode, selector)

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
    const displayTimeElapsed = ((start) => () => {
      const elapsed = +new Date() - +start
      if (elapsed > 50) {
        console.warn(`launchObserver/${selector}: process time ${elapsed}`)
      } else {
        console.debug(`launchObserver/${selector}: process time ${elapsed}`)
      }
    })(new Date())
    trigger += 1
    const selected: T = select()
    if (!selected) {
      console.debug(`launchObserver/${selector}: fail (efficiency=${success / trigger})`)
      if (failCallback) {
        failCallback({ ...wrapped, mutationList })
      }
      displayTimeElapsed()
      return
    }

    success += 1
    console.debug(`launchObserver/${selector}: success (efficiency=${success / trigger})`, selected)
    if (stopWhenSuccess) {
      off()
    }
    if (successCallback) {
      const maybePromise = successCallback({
        ...wrapped,
        selected,
        selectAll,
        mutationList,
      })

      if (maybePromise instanceof Promise) {
        maybePromise.then(() => {
          displayTimeElapsed()
        })
      } else {
        displayTimeElapsed()
      }
    }
  }

  const observer = new MutationObserver(observeFunc)
  on()

  return wrapped
}

export function elementEmerge(
  selector: string,
  parentNode?: HTMLElement | Document,
  subtree = true,
): Promise<HTMLElement> {
  const g = betterSelector(parentNode ?? document, selector).select()
  if (g) return Promise.resolve(g)
  return new Promise((resolve) => {
    launchObserver({
      parentNode,
      selector,
      successCallback: ({ selected }) => {
        console.debug(`elementEmerge: ${selector} emerged as`, selected)
        resolve(selected)
      },
      config: { subtree, childList: true },
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
