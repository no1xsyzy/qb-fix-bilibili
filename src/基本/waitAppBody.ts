import { $ } from './selector'
import { launchObserver } from './observer'

export function getAppBody() {
  return $(`.app-body`)
}

export const waitAppBodyMount = (async function () {
  const appBody = $(`.app-body`)

  if (!appBody) {
    throw new Error('activity page')
  }

  await new Promise((resolve) => {
    launchObserver({
      parentNode: appBody,
      selector: `#sections-vm`,
      successCallback: () => {
        resolve(null)
      },
      config: { childList: true },
    })
  })

  return appBody
})()
