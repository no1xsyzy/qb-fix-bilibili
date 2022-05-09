import { launchObserver } from '../基本/observer'
import { recordDynamicFeed } from '../基本/bapi/getDynamicFeed'

export default async function () {
  const record = recordDynamicFeed({ type: 'video' })
  launchObserver({
    parentNode: document.body,
    selector: `.bili-dyn-item`,
    successCallback: async ({ selectAll }) => {
      console.debug('动态首页联合投稿具名 oscb in')
      for (const dynItem of selectAll() as HTMLDivElement[]) {
        if (dynItem.dataset.qfb_expanded_did === 'processing') {
          return
        }
        if (dynItem.dataset.qfb_expanded_did && !dynItem.querySelector(`.bili-dyn-item-fold`)) {
          console.debug('remove name')
          dynItem.dataset.qfb_expanded_did = 'processing'
          const dyn = await record.getByDynamicID(dynItem.querySelector(`.bili-dyn-card-video`).getAttribute('dyn-id'))
          const timediv = dynItem.querySelector(`.bili-dyn-time`)
          timediv.innerHTML = `${dyn.modules.module_author.pub_time} · ${dyn.modules.module_author.pub_action}`
          delete dynItem.dataset.qfb_expanded_did
        } else if (!dynItem.dataset.qfb_expanded_did && dynItem.querySelector(`.bili-dyn-item-fold`)) {
          console.debug('add name for ', dynItem.querySelector(`.bili-dyn-card-video`).getAttribute('dyn-id'))
          dynItem.dataset.qfb_expanded_did = 'processing'
          const dyn = await record.getByDynamicID(dynItem.querySelector(`.bili-dyn-card-video`).getAttribute('dyn-id'))
          const timediv = dynItem.querySelector(`.bili-dyn-time`)
          if (!dyn.modules.module_fold) return
          const description = (await Promise.all(dyn.modules.module_fold.ids.map((did) => record.getByDynamicID(did))))
            .map((dyn) => `<a href="${dyn.modules.module_author.jump_url}">${dyn.modules.module_author.name}</a>`)
            .join(`、`)
          timediv.innerHTML = `${dyn.modules.module_author.pub_time} · 与${description}联合创作`
          dynItem.dataset.qfb_expanded_did = dyn.id_str
        }
      }
      console.debug('动态首页联合投稿具名 oscb out')
    },
    stopWhenSuccess: false,
  })
}
