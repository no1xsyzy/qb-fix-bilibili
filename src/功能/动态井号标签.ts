import { $, $$ } from '../基本/selector'
import { elementEmerge, launchObserver } from '../基本/observer'
import { trace } from 'src/基本/debug'

export default async function () {
  launchObserver({
    parentNode: /^(?:\/blanc)?\/(\d+)$/.exec(location.pathname)
      ? await elementEmerge(
          `.room-feed-content`,
          trace('动态井号标签: #sections-vm is', $(`#sections-vm`).parentElement),
        )
      : document.body,
    selector: `a.dynamic-link-hover-bg`,
    successCallback: ({ selectAll }) => {
      console.debug('动态井号标签 oscb in')
      for (let link of selectAll() as HTMLAnchorElement[]) {
        // link: HTMLAnchorElement
        if (/#.+#/.exec(link.innerHTML) && /https?:\/\/search.bilibili.com\/all\?.+/.exec(link.href)) {
          link.href = `https://t.bilibili.com/topic/name/${/#(.+)#/.exec(link.innerHTML)[1]}/feed`
        }
      }
      console.debug('动态井号标签 oscb out')
    },
    stopWhenSuccess: false,
  })
}
