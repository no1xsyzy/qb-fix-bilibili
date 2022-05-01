import 分区 from './路由/分区'
import 直播间 from './路由/直播间'
import 直播主页 from './路由/直播主页'
import 其他页面 from './路由/其他页面'
import 动态页面 from './路由/动态页面'

if (location.host === 'live.bilibili.com') {
  if (location.pathname === '/') {
    直播主页()
  } else if (location.pathname === '/p/eden/area-tags') {
    分区()
  } else if (/^(?:\/blanc)?\/(\d+)$/.exec(location.pathname)) {
    直播间()
  } else {
    其他页面()
  }
} else if (location.host === 't.bilibili.com') {
  动态页面()
} else {
  其他页面()
}