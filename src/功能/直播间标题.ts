import { $ } from '../基本/selector'
import { elementEmerge, launchObserver } from '../基本/observer'

function liveStatus() {
  switch ($(`.live-status`).innerText) {
    case '直播':
      return '▶️'
    case '闲置':
      return '⏹️'
    case '轮播':
      return '🔁'
    default:
      return `【${$(`.live-status`).innerText}】`
  }
}

const liveTitle = () => $(`.live-title`).innerText
const liveHost = () => $(`.room-owner-username`).innerText
const makeTitle = () => `${liveStatus()} ${liveTitle()} - ${liveHost()} - 哔哩哔哩直播`
const selector = `.live-title`

export default async function () {
  launchObserver({
    parentNode: await elementEmerge(`#head-info-vm .left-header-area`),
    selector,
    successCallback: () => {
      console.debug('直播间标题 osbc in')
      document.title = makeTitle()
      console.debug('直播间标题 osbc out')
    },
    stopWhenSuccess: false,
  })
  document.title = makeTitle()
}
