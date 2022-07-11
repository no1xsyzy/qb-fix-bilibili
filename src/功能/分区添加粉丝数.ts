import { $ } from '../基本/selector'
import { launchObserver } from '../基本/observer'
import { followersTextClass } from '../基本/followersTextClass'
import { getRoomFollowers } from '../基本/bapi'

const CARDCLS = 'Item_1EohdhbR'
const NAMECLS = 'Item_QAOnosoB'

const parentNode = $(`#area-tag-list`)
const selector = `.${CARDCLS}`

GM_addStyle(`
.${NAMECLS}.processed::after {
  content: attr(data-followers);
}

.${NAMECLS}.processed.followers-m {
  color: purple !important;
}

.${NAMECLS}.processed.followers-k {
  color: grey !important;
}

.${NAMECLS}.processed.followers-1 {
  color: red !important;
}
`)

export default function () {
  launchObserver({
    parentNode,
    selector,
    successCallback: ({ selectAll }) => {
      for (const card of selectAll()) {
        ;(async () => {
          const nametag: HTMLElement = card.querySelector(`.${NAMECLS}`)
          if (nametag.classList.contains('processed')) {
            return
          }
          const followers = await getRoomFollowers((card as HTMLAnchorElement).pathname.slice(1))
          const [txt, cls] = followersTextClass(followers)
          nametag.dataset.followers = txt
          nametag.title = txt
          nametag.classList.add('processed')
          nametag.classList.add(cls)
        })()
      }
    },
    stopWhenSuccess: false,
  })
}
