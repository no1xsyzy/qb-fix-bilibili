import { betterSelector } from '../基本/selector'
import { elementEmerge, launchObserver } from '../基本/observer'
import { boundaryTimeit } from '../基本/debug'

function liveStatus() {
  const liveStatus = betterSelector(document, `.live-status`).select().innerText
  switch (liveStatus) {
    case '直播':
      return '▶️'
    case '闲置':
      return '⏹️'
    case '轮播':
      return '🔁'
    default:
      return `【${liveStatus}】`
  }
}

const liveTitle = () => betterSelector(document, `.live-title`).select().innerText
const liveHost = () => betterSelector(document, `.room-owner-username`).select().innerText
const makeTitle = () => `${liveStatus()} ${liveTitle()} - ${liveHost()} - 哔哩哔哩直播`
const selector = `.live-title`

export default async function () {
  const timeit = boundaryTimeit('直播间标题')

  launchObserver({
    parentNode: await elementEmerge(`#head-info-vm .left-header-area`),
    selector,
    successCallback: () => {
      const timeit = boundaryTimeit('直播间标题 osbc')
      document.title = makeTitle()
      timeit.out()
    },
    stopWhenSuccess: false,
  })
  document.title = makeTitle()

  timeit.out()
}
