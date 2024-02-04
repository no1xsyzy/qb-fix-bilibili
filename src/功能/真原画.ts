import { define } from '../基本/config'
import { hijack } from '../基本/hijackfetch'

const MCDN_RE = /[xy0-9]+\.mcdn\.bilivideo\.cn:\d+/
const QUALITY_SUFFIX_RE = /(\d+)_(?:minihevc|prohevc|bluray)/g

const disableMcdn = define('disableMcdn', true)

// page-based variables
let forceHighestQuality = true
let recentErrors = 0

setInterval(() => {
  if (recentErrors > 0) {
    recentErrors /= 2
  }
}, 10000)

function healthChecker(promise: Promise<Response>): void {
  promise.then((response) => {
    // health check
    if (!response.url.match(/\.(m3u8|m4s)/)) return
    if (response.status >= 400 && response.status < 500) {
      recentErrors++
      if (recentErrors >= 5 && forceHighestQuality) {
        forceHighestQuality = false
        GM_notification({
          title: '真原画',
          text: '最高清晰度可能不可用，取消强制',
          timeout: 3000,
          silent: true,
        })
      }
    } else {
      console.log('真原画 success')
    }
  })
}

export default function () {
  hijack({
    type: 'wrap',
    func: async (fetch, req) => {
      console.debug('真原画 hijack in')
      try {
        if (MCDN_RE.test(req.url) && disableMcdn.get()) {
          return Promise.reject(new Error()) // do NOT catch it
        }
        if (QUALITY_SUFFIX_RE.test(req.url) && forceHighestQuality) {
          req = new Request(req.url.replace(QUALITY_SUFFIX_RE, '$1'), req)
        }
        const url = req.url
        console.debug('真原画 hijack url=', url)
        const promise = fetch(req)

        healthChecker(promise)

        return promise
      } catch (e) {}
      return fetch(req)
    },
  })
}
