import { trace } from 'src/基本/debug'
import { elementEmerge } from 'src/基本/observer'
import { $ } from 'src/基本/selector'

export default async function () {
  const player = $(`#live-player`)
  const video = elementEmerge(`video`, player).then((x) => trace('自动刷新崩溃直播间 video', x))
  const endingPanel = elementEmerge(`.web-player-ending-panel`, player).then((x) =>
    trace('自动刷新崩溃直播间 ending_panel', x),
  )
  const errorPanel = elementEmerge(`.web-player-error-panel`, player).then((x) =>
    trace('自动刷新崩溃直播间 error_panel', x),
  )
  const last = await Promise.race([video, endingPanel, errorPanel])
  if (last.tagName === 'VIDEO') {
    console.log(`successfully loaded`)
    return
  }
  errorPanel.then(() => {
    console.log(`load fail, refreshing...`)
    location.reload()
  })
}
