import { $ } from '../基本/selector'
import { elementEmerge, launchObserver } from '../基本/observer'
import { trace } from 'src/基本/debug'

export async function 动态页面() {
  // match: *://t.bilibili.com/*
  console.debug('动态井号标签/动态页面 in')

  if (/\/topic\/name\/[^/]+\/feed/.exec(location.pathname)) {
    launchObserver({
      selector: `a.dynamic-link-hover-bg`,
      successCallback: ({ selectAll }) => {
        console.debug('动态井号标签/空间 oscb in')
        for (const link of selectAll() as HTMLAnchorElement[]) {
          // link: HTMLAnchorElement
          if (/#.+#/.exec(link.innerHTML) && /https?:\/\/search.bilibili.com\/all\?.+/.exec(link.href)) {
            link.href = `https://t.bilibili.com/topic/name/${/#(.+)#/.exec(link.innerHTML)[1]}/feed`
          }
        }
        console.debug('动态井号标签/空间 oscb out')
      },
      failCallback: () => {
        console.debug('动态井号标签/空间 ofcb')
      },
      stopWhenSuccess: false,
    })
    return
  }

  launchObserver({
    parentNode: document.body,
    selector: `span.bili-rich-text-topic`,
    successCallback: ({ selectAll }) => {
      console.debug('动态井号标签/动态页面 oscb in')
      for (const span of selectAll() as HTMLSpanElement[]) {
        // link: HTMLAnchorElement
        const anchor = document.createElement('A') as HTMLAnchorElement
        anchor.href = `https://t.bilibili.com/topic/name/${/#(.+)#/.exec(span.innerHTML)[1]}/feed`
        anchor.classList.add('bili-rich-text-topic')
        anchor.setAttribute('target', '_blank')
        anchor.addEventListener('click', (e) => e.stopPropagation())
        anchor.innerHTML = span.innerHTML
        span.replaceWith(anchor)
      }
      console.debug('动态井号标签/动态页面 oscb out')
    },
    failCallback: () => {
      console.debug('动态井号标签/动态页面 ofcb')
    },
    stopWhenSuccess: false,
  })

  console.debug('动态井号标签/动态页面 out')
}

export async function 直播间() {
  // match: *://live.bilibili.com/blanc/:live_id
  // match: *://live.bilibili.com/:live_id
  console.debug('动态井号标签/直播间 in')

  const appBody = $(`#sections-vm`).parentElement
  trace('动态井号标签/直播间: #sections-vm is', appBody)
  const roomFeed = await elementEmerge(`.room-feed`, appBody)
  trace('动态井号标签/直播间: .room-feed is', roomFeed)
  const parentNode = await elementEmerge(`.room-feed-content`, roomFeed)
  trace('动态井号标签/直播间: .room-feed-content is', parentNode)

  launchObserver({
    parentNode,
    selector: `a.dynamic-link-hover-bg`,
    successCallback: ({ selectAll }) => {
      console.debug('动态井号标签/直播间 oscb in')
      for (const link of selectAll() as HTMLAnchorElement[]) {
        // link: HTMLAnchorElement
        if (/#.+#/.exec(link.innerHTML) && /https?:\/\/search.bilibili.com\/all\?.+/.exec(link.href)) {
          link.href = `https://t.bilibili.com/topic/name/${/#(.+)#/.exec(link.innerHTML)[1]}/feed`
        }
      }
      console.debug('动态井号标签/直播间 oscb out')
    },
    failCallback: () => {
      console.debug('动态井号标签/直播间 ofcb')
    },
    stopWhenSuccess: false,
  })

  console.debug('动态井号标签/直播间 out')
}

export async function 空间() {
  // match: space.bilibili.com/:mid
  console.debug('动态井号标签/空间 in')
  const sSpace = await elementEmerge(`.s-space`)
  console.debug('动态井号标签/空间 sSpace', sSpace)
  const parentNode = await elementEmerge(`#page-dynamic`, sSpace)
  console.debug('动态井号标签/空间 parentNode', parentNode)

  const ob = launchObserver({
    parentNode,
    selector: `a.dynamic-link-hover-bg`,
    successCallback: ({ selectAll }) => {
      console.debug('动态井号标签/空间 oscb in')
      for (const link of selectAll() as HTMLAnchorElement[]) {
        // link: HTMLAnchorElement
        if (/#.+#/.exec(link.innerHTML) && /https?:\/\/search.bilibili.com\/all\?.+/.exec(link.href)) {
          link.href = `https://t.bilibili.com/topic/name/${/#(.+)#/.exec(link.innerHTML)[1]}/feed`
        }
      }
      console.debug('动态井号标签/空间 oscb out')
    },
    failCallback: () => {
      console.debug('动态井号标签/空间 ofcb')
    },
    stopWhenSuccess: false,
  })

  launchObserver({
    parentNode: sSpace,
    selector: `#page-dynamic`,
    successCallback: ({ selected }) => {
      ob.reroot(selected)
      ob.on()
    },
    failCallback: () => {
      ob.off()
    },
    stopWhenSuccess: false,
  })

  console.debug('动态井号标签/空间 out')
}
