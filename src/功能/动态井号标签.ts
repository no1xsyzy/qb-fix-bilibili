import { $$ } from '../基本/selector'
import { launchObserver } from '../基本/observer'

export default function () {
  launchObserver({
    parentNode: document.body,
    selector: `a.dynamic-link-hover-bg`,
    successCallback: () => {
      for (let link of $$(`a.dynamic-link-hover-bg`) as HTMLAnchorElement[]) {
        // link: HTMLAnchorElement
        if (/#.+#/.exec(link.innerHTML) && /https?:\/\/search.bilibili.com\/all\?.+/.exec(link.href)) {
          link.href = `https://t.bilibili.com/topic/name/${/#(.+)#/.exec(link.innerHTML)[1]}/feed`
        }
      }
    },
    stopWhenSuccess: false,
  })
}
