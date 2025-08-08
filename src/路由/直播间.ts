import 关注栏尺寸 from '../功能/关注栏尺寸'
import 直播间标题 from '../功能/直播间标题'
import 通用表情框尺寸修复 from '../功能/通用表情框尺寸修复'
import 直播间留言者显示粉丝数 from '../功能/直播间留言者显示粉丝数'
import 自动刷新崩溃直播间 from '../功能/自动刷新崩溃直播间'
import 真原画 from '../功能/真原画'
import 避免被判定为不可见 from '../功能/避免被判定为不可见'
import 直播间底部卡片悬浮标题 from '../功能/直播间底部卡片悬浮标题'

export default function () {
  console.debug('路由/直播间 in')
  关注栏尺寸()
  直播间标题()
  直播间留言者显示粉丝数()
  通用表情框尺寸修复()
  自动刷新崩溃直播间()
  真原画()
  避免被判定为不可见()
  直播间底部卡片悬浮标题()
  console.debug('路由/直播间 out')
}
