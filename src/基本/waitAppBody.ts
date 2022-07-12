import { betterSelector } from './selector'
import { launchObserver } from './observer'
import { boundaryTimeit } from './debug'

export function getAppBody() {
  return betterSelector(document, `.app-body`).select()
}

export const waitAppBodyMount = (async function () {
  const timeit = boundaryTimeit('waitAppBodyMount')

  const appBody = betterSelector(document, `.app-body`).select()
  timeit.trace('appBody', appBody)

  if (!appBody) {
    throw new Error('activity page')
  }

  await new Promise((resolve) => {
    launchObserver({
      parentNode: appBody,
      selector: `#sections-vm`,
      successCallback: ({ selected }) => {
        timeit.trace('selected', selected)
        resolve(null)
      },
      config: { childList: true },
    })
  })

  timeit.out()
  return appBody
})()
