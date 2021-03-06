import 分区 from './路由/分区'
import 直播间 from './路由/直播间'
import 直播主页 from './路由/直播主页'
import 其他页面 from './路由/其他页面'
import 动态页面 from './路由/动态页面'
import 空间 from './路由/空间'
import 标签动态流 from './路由/标签动态流'
import { $ } from './基本/selector'

if (location.host === 'live.bilibili.com') {
  if (location.pathname === '/') {
    console.debug('路由: 直播主页')
    直播主页()
  } else if (location.pathname === '/p/eden/area-tags') {
    console.debug('路由: 分区')
    分区()
  } else if (/^(?:\/blanc)?\/(\d+)$/.exec(location.pathname) && $(`.app-body`)) {
    console.debug('路由: 直播间')
    直播间()
  } else {
    console.debug('路由: 其他页面')
    其他页面()
  }
} else if (location.host === 'space.bilibili.com') {
  console.debug('路由: 空间')
  空间()
} else if (location.host === 't.bilibili.com') {
  if (/\/topic\/name\/[^/]+\/feed/.exec(location.pathname)) {
    console.debug('路由: 标签动态流')
    标签动态流()
  } else {
    console.debug('路由: 动态页面')
    动态页面()
  }
} else {
  console.debug('路由: 其他页面')
  其他页面()
}
