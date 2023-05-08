import { elementEmerge } from 'src/基本/observer'
import { betterSelector } from 'src/基本/selector'

export default async function () {
  console.debug('排序粉丝勋章 in')
  const list = await elementEmerge(`.medalList .list`)
  console.debug('排序粉丝勋章 list', list)
  ;(Array.from(list.children) as HTMLDivElement[])
    .sort(
      (a, b) =>
        betterSelector(b, '.btn').selectAll().length - betterSelector(a, '.btn').selectAll().length ||
        betterSelector(b, '.living').selectAll().length - betterSelector(a, '.living').selectAll().length ||
        +betterSelector(b, '.m-medal__fans-medal-level').select().textContent -
          +betterSelector(a, '.m-medal__fans-medal-level').select().textContent,
    )
    .forEach((node) => list.appendChild(node))
  console.debug('排序粉丝勋章 out')
}
