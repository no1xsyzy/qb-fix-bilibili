import { $ } from '../基本/selector'
import { elementEmerge, launchObserver } from '../基本/observer'

export default async function () {
  GM_addStyle(`.section-content-cntr{height:calc(100vh - 250px)!important;}`)

  const selector = (() => {
    if (location.pathname === '/') {
      return `.flying-vm`
    } else if (location.pathname === '/p/eden/area-tags') {
      return `#area-tags`
    } else if (/^(?:\/blanc)?\/(\d+)$/.exec(location.pathname)) {
      return `#sidebar-vm`
    }
  })()

  launchObserver({
    parentNode: await elementEmerge(selector),
    selector: `.side-bar-popup-cntr.ts-dot-4`,
    successCallback: ({ selected }) => {
      console.debug('关注栏尺寸 osbc in')
      if (selected.style.height !== '0px') {
        selected.style.bottom = '75px'
        selected.style.height = 'calc(100vh - 150px)'
        // selected.style.height = "600px"
      }
      setTimeout(() => $(`.side-bar-popup-cntr.ts-dot-4 .ps`)?.dispatchEvent(new Event('scroll')), 1000)
      console.debug('关注栏尺寸 osbc out')
    },
    stopWhenSuccess: false,
    config: {
      childList: true,
      subtree: true,
      attributes: true,
    },
  })
}
