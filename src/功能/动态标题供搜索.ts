import { elementEmerge } from '../基本/observer'
import { $ } from 'src/基本/selector'

export default async function () {
  console.debug('动态标题供搜索 in')

  const dyn = await elementEmerge(`.bili-rich-text`, document)

  const uname = $(`.bili-dyn-title>span`).textContent.trim()
  const dtime = $(`.bili-dyn-time`).textContent.trim()
  const dcont = dyn.textContent.trim()
  const ddisp = dcont.length > 23 ? dcont.slice(0, 20) + '...' : dcont

  document.title = `${uname} 于 ${dtime} 说道：『${ddisp}』-哔哩哔哩`

  console.debug('动态标题供搜索 out')
}
