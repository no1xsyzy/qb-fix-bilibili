import { $ } from '../基本/selector'
import { attrChange, elementEmerge, launchObserver } from '../基本/observer'
import { trace } from '../基本/debug'
import { waitAppBodyMount } from '../基本/waitAppBody'

export default async function () {
  console.debug('关注栏尺寸 in')

  GM_addStyle(`.section-content-cntr{height:calc(100vh - 250px)!important;}`)

  console.debug('关注栏尺寸 css')

  const sidebarVM = await (async () => {
    console.debug('关注栏尺寸/sidebarVM location.pathname', location.pathname)
    if (location.pathname === '/') {
      return $(`.flying-vm`)
    } else if (location.pathname === '/p/eden/area-tags') {
      return $(`#area-tags`)
    } else if (/^(?:\/blanc)?\/(\d+)$/.exec(location.pathname)) {
      const appBody = await waitAppBodyMount
      return appBody.querySelector(`#sidebar-vm`) as HTMLElement
    }
  })()

  trace('关注栏尺寸 sidebarVM', sidebarVM)

  const sidebarPopup = await elementEmerge(`.side-bar-popup-cntr`, sidebarVM)

  trace('关注栏尺寸 sidebarPopup', sidebarPopup)

  attrChange({
    node: sidebarPopup,
    attributeFilter: ['class'],
    callback: () => {
      console.debug('关注栏尺寸 osbc in')
      console.debug('关注栏尺寸 osbc out')
    },
    once: false,
  })

  launchObserver({
    parentNode: sidebarPopup,
    selector: `*`,
    successCallback: ({ mutationList }) => {
      console.debug('关注栏尺寸 osbc in', mutationList)
      if (sidebarPopup.style.height !== '0px') {
        sidebarPopup.style.bottom = '75px'
        sidebarPopup.style.height = 'calc(100vh - 150px)'
        // selected.style.height = "600px"
      }
      setTimeout(() => $(`.side-bar-popup-cntr.ts-dot-4 .ps`)?.dispatchEvent(new Event('scroll')), 1000)
      console.debug('关注栏尺寸 osbc out')
    },
    stopWhenSuccess: false,
    config: {
      attributes: true,
      attributeFilter: ['class'],
    },
  })

  console.debug('关注栏尺寸 out')
}
