export function launchObserver({
  parentNode,
  selector,
  failCallback = null,
  successCallback = null,
  stopWhenSuccess = true,
  config = {
    childList: true,
    subtree: true,
  },
}) {
  // if parent node does not exist, use body instead
  if (!parentNode) {
    parentNode = document.body
  }
  const observeFunc = (mutationList) => {
    const selected = document.querySelector(selector)
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
      successCallback(selected)
    }
  }
  const observer = new MutationObserver(observeFunc)
  observer.observe(parentNode, config)
}
