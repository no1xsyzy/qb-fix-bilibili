import { elementEmerge } from '../基本/observer'
import { $ } from 'src/基本/selector'

export async function 单条动态页面() {
  console.debug('动态标题供搜索.单条动态页面 in')

  const dyn = await elementEmerge(`.bili-rich-text`, document)

  const uname = $(`.bili-dyn-title>span`).textContent.trim()
  const dtime = $(`.bili-dyn-time`).textContent.trim()
  const dcont = dyn.textContent.trim()
  const ddisp = dcont.length > 23 ? dcont.slice(0, 20) + '...' : dcont

  document.title = `${uname} 于 ${dtime} 说道：『${ddisp}』-哔哩哔哩`

  console.debug('动态标题供搜索.单条动态页面 out')
}

export async function opus() {
  console.debug('动态标题供搜索.opus in')

  const uname = $(`.opus-module-author__name`).textContent.trim()
  const dtime = $(`.opus-module-author__pub__text`).textContent.trim()
  const dcont = $(`.opus-module-content`).textContent.trim()
  const ddisp = dcont.length > 23 ? dcont.slice(0, 20) + '...' : dcont

  document.title = `${uname} 于 ${dtime} 说道：『${ddisp}』-哔哩哔哩`

  console.debug('动态标题供搜索.opus out')
}
