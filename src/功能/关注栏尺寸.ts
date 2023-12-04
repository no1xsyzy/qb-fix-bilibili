import { $, betterSelector } from '../基本/selector'
import { attrChange, elementEmerge, launchObserver } from '../基本/observer'
import { boundaryTimeit } from '../基本/debug'
import { waitAppBodyMount } from '../基本/waitAppBody'

export default async function () {
  const timeit = boundaryTimeit('关注栏尺寸')

  GM_addStyle(`
  .section-content-cntr{height:calc(100vh - 250px)!important;}
  .follow-cntr{height:calc(100vh - 150px)!important;}
  .follow-cntr>.anchor-list{height:auto!important;}
  .follow-cntr>.anchor-list>.three-anchor{height:auto!important;}
  `)

  console.debug('关注栏尺寸 css')

  const sidebarVM = await (async () => {
    console.debug('关注栏尺寸/sidebarVM location.pathname', location.pathname)
    if (location.pathname === '/') {
      return betterSelector(document, `.flying-vm`).select()
    } else if (location.pathname === '/p/eden/area-tags') {
      return betterSelector(document, `#area-tags`).select()
    } else if (/^(?:\/blanc)?\/(\d+)$/.exec(location.pathname)) {
      const appBody = await waitAppBodyMount
      timeit.trace(`waitAppBodyMount`, waitAppBodyMount)
      return betterSelector(appBody, `#sidebar-vm`).select()
    }
  })()

  timeit.trace(`sidebarVM`, sidebarVM)

  const sidebarPopup = await elementEmerge(`.side-bar-popup-cntr`, sidebarVM)

  timeit.trace('sidebarPopup', sidebarPopup)

  // attrChange({
  //   node: sidebarPopup,
  //   attributeFilter: ['class'],
  //   callback: () => {
  //     console.debug('关注栏尺寸 osbc in')
  //     console.debug('关注栏尺寸 osbc out')
  //   },
  //   once: false,
  // })

  launchObserver({
    parentNode: sidebarPopup,
    selector: `*`,
    successCallback: ({ mutationList }) => {
      const timeit = boundaryTimeit('关注栏尺寸 osbc')
      timeit.trace('mutationList', mutationList)
      if (sidebarPopup.style.height !== '0px') {
        sidebarPopup.style.bottom = '75px'
        sidebarPopup.style.height = 'calc(100vh - 150px)'
        // selected.style.height = "600px"
      }
      setTimeout(() => $(`.side-bar-popup-cntr.ts-dot-4 .ps`)?.dispatchEvent(new Event('scroll')), 2000)
      timeit.out()
    },
    stopWhenSuccess: false,
    config: {
      attributes: true,
      attributeFilter: ['class'],
    },
  })

  timeit.out()
}
