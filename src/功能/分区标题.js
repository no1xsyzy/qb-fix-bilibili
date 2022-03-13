import { $ } from '../基本/selector'
import { launchObserver } from '../基本/observer'

const makeTitle = () =>
  `${($`#area-tags header img+div` || $`#area-tags header h2`).innerText} - 分区列表 - 哔哩哔哩直播`
const parentNode = $`#area-tags`
const selector = `header`
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
