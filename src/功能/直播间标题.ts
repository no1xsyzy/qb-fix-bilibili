import { betterSelector } from '../基本/selector'
import { elementEmerge, launchObserver } from '../基本/observer'
import { boundaryTimeit } from '../基本/debug'

function liveStatus() {
  const livePlayer = betterSelector(document, `#live-player`).select()
  const video = betterSelector(livePlayer, `video`).select()
  if (typeof video === 'undefined') {
    return '⏹️'
  } else {
    return '▶️'
  }
  // TODO: 轮播 return '🔁'
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
