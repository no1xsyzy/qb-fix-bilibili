import { $ } from './selector'
import { launchObserver } from './observer'

export function getAppBody() {
  return $(`.app-body`)
}

export const waitAppBodyMount = (async function () {
  console.debug('waitAppBodyMount in')

  const appBody = $(`.app-body`)
  console.debug('waitAppBodyMount appBody', appBody)

  if (!appBody) {
    throw new Error('activity page')
  }

  await new Promise((resolve) => {
    launchObserver({
      parentNode: appBody,
      selector: `#sections-vm`,
      successCallback: ({ selected }) => {
        console.debug('waitAppBodyMount selected', selected)
        resolve(null)
      },
      config: { childList: true },
    })
  })

  console.debug('waitAppBodyMount resolved')

  return appBody
})()
