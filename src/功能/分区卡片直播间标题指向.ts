import { $ } from '../基本/selector'
import { launchObserver } from '../基本/observer'

const CARDCLS = 'Item_1EohdhbR'
const TITLECLS = 'Item_2GEmdhg6'

const parentNode = $(`#area-tag-list`)
const selector = `.${CARDCLS}`

export default function () {
  launchObserver({
    parentNode,
    selector,
    successCallback: ({ selectAll }) => {
      for (const card of selectAll()) {
        ;(async () => {
          const titletag: HTMLElement = card.querySelector(`.${TITLECLS}`)
          titletag.title = titletag.textContent.trim()
        })()
      }
    },
    stopWhenSuccess: false,
  })
}
