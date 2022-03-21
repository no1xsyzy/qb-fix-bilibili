import { $, $$ } from '../基本/selector'
import { launchObserver } from '../基本/observer'
import { infoLine } from '../基本/bapi'

const parentNode = $(`#chat-items`)
const selector = `.user-name`

GM_addStyle(`.infoline::before{
  content: attr(data-infoline)
}`)

const append = async (un: HTMLElement) => {
  un.classList.add('infoline')
  un.dataset.infoline = await infoLine((un.parentNode as HTMLElement).dataset.uid)
}

export default function () {
  launchObserver({
    parentNode,
    selector,
    successCallback: () => {
      for (const un of $$(`#chat-items .user-name`)) {
        if (un.classList.contains('infoline')) {
          return
        }
        append(un as HTMLElement)
      }
    },
    stopWhenSuccess: false,
  })
}
