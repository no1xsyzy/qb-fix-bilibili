import { trace } from 'src/基本/debug'
import { elementEmerge } from 'src/基本/observer'
import { $ } from 'src/基本/selector'

export default async function () {
  const player = $(`#live-player`)

  const video = elementEmerge(`video`, player, false).then((x) => trace('自动刷新崩溃直播间 video', x))
  const endingPanel = elementEmerge(`.web-player-ending-panel`, player, false).then((x) =>
    trace('自动刷新崩溃直播间 ending_panel', x),
  )
  const errorPanel = elementEmerge(`.web-player-error-panel`, player, false).then((x) =>
    trace('自动刷新崩溃直播间 error_panel', x),
  )
  const last = await Promise.race([video, endingPanel, errorPanel])

  // const last = await elementEmerge(`video, .web-player-ending-panel, .web-player-error-panel`, player, false)

  trace('自动刷新崩溃直播间 last', last)

  if (last.tagName === 'VIDEO') {
    console.log(`successfully loaded`)
  } else if (last.classList.contains('web-player-error-panel')) {
    console.log(`load fail, refreshing...`)
    location.reload()
  }
}
