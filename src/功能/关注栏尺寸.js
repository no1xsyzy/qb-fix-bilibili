import { $ } from '../基本/selector'
import { launchObserver } from '../基本/observer'

export default function () {
  GM_addStyle(`.section-content-cntr{height:calc(100vh - 250px)!important;}`)

  launchObserver({
    selector: `.side-bar-popup-cntr.ts-dot-4`,
    successCallback: () => {
      const g = $`.side-bar-popup-cntr.ts-dot-4`
      if (g.style.height !== '0px') {
        g.style.bottom = '75px'
        g.style.height = 'calc(100vh - 150px)'
        // g.style.height = "600px"
      }
      setTimeout(() => $(`.side-bar-popup-cntr.ts-dot-4 .ps`).dispatchEvent(new Event('scroll')), 1000)
    },
    stopWhenSuccess: false,
    config: {
      childList: true,
      subtree: true,
      attributes: true,
    },
  })
}
