import { $ } from '../基本/selector'
import { launchObserver } from '../基本/observer'

function liveStatus() {
  switch ($`.live-status`.innerText) {
    case '直播':
      return '▶️'
    case '闲置':
      return '⏹️'
    case '轮播':
      return '🔁'
    default:
      return `【${$`.live-status`.innerText}】`
  }
}

const liveTitle = () => $`.live-title`.innerText
const liveHost = () => $`.room-owner-username`.innerText
const makeTitle = () => `${liveStatus()} ${liveTitle()} - ${liveHost()} - 哔哩哔哩直播`
const parentNode = $`#head-info-vm .left-header-area`
const selector = `.live-title`

export default function () {
  launchObserver({
    parentNode,
    selector,
    successCallback: () => {
      document.title = makeTitle()
    },
    stopWhenSuccess: false,
  })

  document.title = makeTitle()
}
