let patched = false

type State = [unknown, string, string | URL]
export type ReplaceStatePatcher = (state: State) => State

const patchers: ReplaceStatePatcher[] = []

function monkeypatch4ReplaceState() {
  if (patched) {
    return
  }
  patched = true
  const originalReplaceState = history.replaceState

  history.replaceState = function (state, unused, url?) {
    console.debug('replaceStatePatcher patched history.replaceState in')
    let pre: State = [state, unused, url]
    for (const patcher of patchers) {
      pre = patcher(pre)
    }
    originalReplaceState.call(history, ...pre)
    console.debug('replaceStatePatcher patched history.replaceState out')
  }
}

export function patchReplaceState(patcher: ReplaceStatePatcher) {
  monkeypatch4ReplaceState()
  patchers.unshift(patcher)
}

export function unpatchReplaceState(patcher: ReplaceStatePatcher) {
  const i = patchers.findIndex((x) => x === patcher)
  if (i >= 0) {
    patchers.splice(i, 1)
  }
}
