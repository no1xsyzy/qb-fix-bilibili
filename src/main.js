import 分区 from './路由/分区'
import 直播间 from './路由/直播间'

if (location.pathname === '/p/eden/area-tags') {
  分区()
} else if (/^\/\d+$/.exec(location.pathname)) {
  直播间()
}
