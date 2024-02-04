import { $ } from '../基本/selector'

export default function () {
  console.debug('专栏可以复制 in')
  $('.article-container').addEventListener('copy', (e) => e.stopImmediatePropagation(), true)
  console.debug('专栏可以复制 out')
}
