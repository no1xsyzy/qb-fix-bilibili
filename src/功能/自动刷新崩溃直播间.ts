import { elementEmerge, launchObserver } from 'src/基本/observer'
import { $ } from 'src/基本/selector'

export default async function () {
  const player = $(`#live-player`)
  const trace =
    (...prefix: any[]) =>
    (x: any) => (console.log(...prefix, x), x)
  const video = elementEmerge(`video`, player).then(trace('自动刷新崩溃直播间', 'video'))
  const ending_panel = elementEmerge(`.web-player-ending-panel`, player).then(
    trace('自动刷新崩溃直播间', 'ending_panel'),
  )
  const error_panel = elementEmerge(`.web-player-error-panel`, player).then(trace('自动刷新崩溃直播间', 'error_panel'))
  const last = await Promise.race([video, ending_panel, error_panel])
  if (last.tagName === 'VIDEO') {
    console.log(`successfully loaded`)
    return
  }
  error_panel.then(() => {
    console.log(`load fail, refreshing...`)
    location.reload()
  })
}
