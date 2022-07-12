import { boundaryTimeit } from 'src/基本/debug'
import { elementEmerge } from 'src/基本/observer'
import { betterSelector } from 'src/基本/selector'

export default async function () {
  // 延迟5秒启动
  await new Promise((resolve) => setTimeout(resolve, 5000))

  const timeit = boundaryTimeit('自动刷新崩溃直播间')

  const player = betterSelector(document, `#live-player`).select()

  const video = elementEmerge(`video`, player, false).then((x) => timeit.trace('video', x))
  const endingPanel = elementEmerge(`.web-player-ending-panel`, player, false).then((x) =>
    timeit.trace('ending_panel', x),
  )
  const errorPanel = elementEmerge(`.web-player-error-panel`, player, false).then((x) => timeit.trace('error_panel', x))
  const last = await Promise.race([video, endingPanel, errorPanel])

  // const last = await elementEmerge(`video, .web-player-ending-panel, .web-player-error-panel`, player, false)

  timeit.trace('last', last)

  if (last.tagName === 'VIDEO') {
    console.log(`successfully loaded`)
  } else if (last.classList.contains('web-player-error-panel')) {
    console.log(`load fail, refreshing...`)
    location.reload()
  }

  timeit.out()
}
