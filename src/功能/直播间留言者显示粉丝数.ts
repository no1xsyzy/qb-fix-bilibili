import { $, $$ } from '../基本/selector'
import { launchObserver } from '../基本/observer'
import { getSexTag, getFansCount } from '../基本/bapi'

const parentNode = $(`#chat-items`)
const selector = `.user-name`

GM_addStyle(`.infoline::before{
  content: attr(data-infoline)
  font-color: white
}
.infoline.infoline-m::before{
  font-color: red
}
.infoline.infoline-k::before{
  font-color: pink
}
`)

const append = async (un: HTMLElement) => {
  un.classList.add('infoline')
  const uid = (un.parentNode as HTMLElement).dataset.uid
  let fans: string | number = await getFansCount(uid)
  if (fans > 1e6) {
    fans = `${Math.round(fans / 1e5) / 10}m`
    un.classList.add('infoline-m')
  } else if (fans > 1e3) {
    fans = `${Math.round(fans / 1e2) / 10}k`
    un.classList.add('infoline-k')
  }
  const sextag = await getSexTag(uid)
  un.dataset.infoline = `${sextag} ${fans}★ `
}

export default function () {
  launchObserver({
    parentNode,
    selector,
    successCallback: () => {
      for (const un of $$(`#chat-items .user-name`)) {
        if (un.classList.contains('infoline')) {
          continue
        }
        append(un as HTMLElement)
      }
    },
    stopWhenSuccess: false,
  })
}
