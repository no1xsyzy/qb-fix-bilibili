import { $ } from '../基本/selector'
import { launchObserver } from '../基本/observer'
import { getSexTag, getFansCount } from '../基本/bapi'
import { followersTextClass } from '../基本/followersTextClass'

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
  const uid = (un.parentNode.parentNode as HTMLElement).dataset.uid
  console.debug(`直播间留言者显示粉丝数 append uid=${uid}`)
  const fans: number = await getFansCount(uid)
  const [txt, cls] = followersTextClass(fans)
  const sextag = await getSexTag(uid)
  un.dataset.infoline = `${sextag} ${txt} `
  if (cls !== '') un.classList.add(cls)
}

export default function () {
  launchObserver({
    parentNode,
    selector,
    successCallback: ({ selectAll }) => {
      console.debug('直播间留言者显示粉丝数 osbc in')
      for (const un of selectAll()) {
        if (!un.classList.contains('infoline')) {
          un.classList.add('infoline')
          append(un)
        }
      }
      console.debug('直播间留言者显示粉丝数 osbc out')
    },
    stopWhenSuccess: false,
  })
}
