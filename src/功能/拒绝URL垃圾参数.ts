import { patchReplaceState } from '../基本/replaceStatePatcher'

function makeRegExpFromSearchKey(s: string | string[]) {
  if (typeof s === 'string') {
    return new RegExp(`(?<=[?&])(?<key>${s})=(?<value>[^&]+)(?<trailing>&?)`, 'g')
  }
  return new RegExp(`(?<=[?&])(?<key>${s.join('|')})=(?<value>[^&]+)(?<trailing>&?)`, 'g')
}

export default function () {
  console.debug('拒绝URL垃圾参数 in')
  patchReplaceState(([state, title, url]) => {
    console.debug('拒绝URL垃圾参数 PRS in')
    console.debug('url:', url)
    if (url === undefined) {
      return [state, title, url]
    }
    if (typeof url === 'string') {
      url = new URL(url, location.href)
    }
    url.search = url.search.replace(makeRegExpFromSearchKey(['vd_source']), '').replace(/^\?$/, '')
    console.debug('拒绝URL垃圾参数 PRS out')
    return [state, title, url]
  })
  console.debug('拒绝URL垃圾参数 out')
}
