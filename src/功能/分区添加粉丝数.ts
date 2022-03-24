import { $ } from '../基本/selector'
import { launchObserver } from '../基本/observer'
import { followersTextClass, getRoomFollowers } from 'src/基本/bapi'

const parentNode = $(`#area-tag-list`)
const selector = `a.Item_1EohdhbR`

GM_addStyle(`
.processed::after {
  content: attr(data-followers);
  color: black;
}
.processed.followers-m::after{
  color: purple;
}
.processed.followers-k::after{
  color: red;
}
`)

export default function () {
  launchObserver({
    parentNode,
    selector,
    successCallback: ({ selectAll }) => {
      for (const a of selectAll()) {
        ;(async () => {
          const nametag: HTMLElement = a.querySelector(`.Item_QAOnosoB`)
          if (nametag.classList.contains('processed')) {
            return
          }
          const followers = await getRoomFollowers((a as HTMLAnchorElement).pathname.slice(1))
          let [txt, cls] = followersTextClass(followers)
          nametag.dataset.followers = txt
          nametag.classList.add('processed')
          nametag.classList.add(cls)
        })()
      }
    },
    stopWhenSuccess: false,
  })
}
