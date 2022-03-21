import { $, $$ } from '../基本/selector'
import { launchObserver } from '../基本/observer'
import { getSexTag, getFansCount, followersTextClass } from '../基本/bapi'

const parentNode = $(`#chat-items`)
const selector = `.user-name`

GM_addStyle(`.infoline::before{
  content: attr(data-infoline);
  color: white;
}
.infoline.followers-m::before{
  color: purple;
}
.infoline.followers-k::before{
  color: red;
}
`)

const append = async (un: HTMLElement) => {
  un.classList.add('infoline')
  const uid = (un.parentNode as HTMLElement).dataset.uid
  const fans: string | number = await getFansCount(uid)
  const [txt, cls] = followersTextClass(fans)
  const sextag = await getSexTag(uid)
  un.dataset.infoline = `${sextag} ${txt} `
  un.classList.add(cls)
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
