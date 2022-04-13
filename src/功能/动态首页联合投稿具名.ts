import { $, $$ } from '../基本/selector'
import { elementEmerge, launchObserver } from '../基本/observer'
import { getDynamicFeed } from '../基本/bapi'
import { recordDynamicFeed } from '../基本/bapi/getDynamicFeed'

export default async function () {
  const record = recordDynamicFeed({ type: 'video' })
  launchObserver({
    parentNode: document.body,
    selector: `div.bili-dyn-item`,
    successCallback: async ({ selectAll }) => {
      console.debug('动态首页联合投稿具名 oscb in')
      for (let dyn_item of selectAll() as HTMLDivElement[]) {
        if (dyn_item.dataset.qfb_expanded_did == 'processing') {
          return
        }
        if (dyn_item.dataset.qfb_expanded_did && !dyn_item.querySelector(`.bili-dyn-item-fold`)) {
          console.debug('remove name')
          dyn_item.dataset.qfb_expanded_did == 'processing'
          const dyn = await record.getByDynamicID(dyn_item.querySelector(`.bili-dyn-card-video`).getAttribute('dyn-id'))
          const timediv = dyn_item.querySelector(`.bili-dyn-time`)
          timediv.innerHTML = `${dyn.modules.module_author.pub_time} · ${dyn.modules.module_author.pub_action}`
          delete dyn_item.dataset.qfb_expanded_did
        } else if (!dyn_item.dataset.qfb_expanded_did && dyn_item.querySelector(`.bili-dyn-item-fold`)) {
          console.debug('add name for ', dyn_item.querySelector(`.bili-dyn-card-video`).getAttribute('dyn-id'))
          dyn_item.dataset.qfb_expanded_did == 'processing'
          const dyn = await record.getByDynamicID(dyn_item.querySelector(`.bili-dyn-card-video`).getAttribute('dyn-id'))
          const timediv = dyn_item.querySelector(`.bili-dyn-time`)
          if (!dyn.modules.module_fold) return
          let description = (await Promise.all(dyn.modules.module_fold.ids.map((did) => record.getByDynamicID(did))))
            .map((dyn) => `<a href="${dyn.modules.module_author.jump_url}">${dyn.modules.module_author.name}</a>`)
            .join(`、`)
          timediv.innerHTML = `${dyn.modules.module_author.pub_time} · 与${description}联合创作`
          dyn_item.dataset.qfb_expanded_did = dyn.id_str
        }
      }
      console.debug('动态首页联合投稿具名 oscb out')
    },
    stopWhenSuccess: false,
  })
}
