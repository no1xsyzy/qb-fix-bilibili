import { elementEmerge, launchObserver } from '../基本/observer'
import { boundaryTimeit } from '../基本/debug'
import { waitAppBodyMount } from '../基本/waitAppBody'
import { $$ } from '../基本/selector'

export async function 标签动态流() {
  console.debug('动态井号标签/动态标签流 in')

  // match: *://t.bilibili.com/topic/name/:strTopic/feed
  launchObserver({
    selector: `.dynamic-link-hover-bg`,
    successCallback: ({ selectAll }) => {
      console.debug('动态井号标签/动态标签流 oscb in')
      for (const link of selectAll() as HTMLAnchorElement[]) {
        // link: HTMLAnchorElement
        if (/#.+#/.exec(link.innerHTML) && /https?:\/\/search.bilibili.com\/all\?.+/.exec(link.href)) {
          link.href = `https://t.bilibili.com/topic/name/${/#(.+)#/.exec(link.innerHTML)[1]}/feed`
        }
      }
      console.debug('动态井号标签/动态标签流 oscb out')
    },
    failCallback: () => {
      console.debug('动态井号标签/动态标签流 ofcb')
    },
    stopWhenSuccess: false,
  })

  console.debug('动态井号标签/动态标签流 out')
}

export async function 动态页面() {
  // match: *://t.bilibili.com/*
  console.debug('动态井号标签/动态页面 in')

  launchObserver({
    parentNode: document.body,
    selector: `.bili-rich-text-topic`,
    successCallback: ({ selectAll }) => {
      console.debug('动态井号标签/动态页面 oscb in')
      for (const span of selectAll() as HTMLSpanElement[]) {
        if (span.classList.contains('processed')) continue
        const anchor = document.createElement('A') as HTMLAnchorElement
        anchor.href = `https://t.bilibili.com/topic/name/${/#(.+)#/.exec(span.innerHTML)[1]}/feed`
        anchor.classList.add('bili-rich-text-topic')
        anchor.classList.add('processed')
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
  // match: *://live.bilibili.com/blanc/:idLive
  // match: *://live.bilibili.com/:idLive
  const timeit = boundaryTimeit('动态井号标签/直播间')

  const appBody = await waitAppBodyMount
  timeit.trace('waitAppBodyMount', waitAppBodyMount)

  const sectionVM = appBody.querySelector(`#sections-vm`)
  timeit.trace('sectionVM', sectionVM)
  const roomFeed = sectionVM.querySelector('.room-feed') as HTMLElement
  timeit.trace('roomFeed', roomFeed)
  const roomFeedContent = await elementEmerge(`.room-feed-content`, roomFeed, false)
  timeit.trace('roomFeedContent', roomFeedContent)

  launchObserver({
    parentNode: roomFeedContent,
    selector: `.dynamic-link-hover-bg`,
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

  timeit.out()
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
    selector: `.dynamic-link-hover-bg`,
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

export async function opus() {
  for (const anchor of $$(`.topic`) as HTMLAnchorElement[]) {
    if (/#.+#/.exec(anchor.innerHTML) && /https?:\/\/search.bilibili.com\/all\?.+/.exec(anchor.href)) {
      anchor.href = `https://t.bilibili.com/topic/name/${/#(.+)#/.exec(anchor.innerHTML)[1]}/feed`
    }
  }
}
