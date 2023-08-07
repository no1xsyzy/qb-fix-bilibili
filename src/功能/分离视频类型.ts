import { attrChange, elementEmerge, launchObserver } from '../基本/observer'

export default async function () {
  console.debug('分离视频类型 in')

  GM_addStyle(`
  .qfb__subselect_list {display: none;}

  .bili-dyn-list-tabs__item.active:nth-child(2) ~ .qfb__subselect_list {
    display: flex;
  }

  #qfb_upload, #qfb_live_replay {
    display: none;
  }

  #qfb_upload:not(:checked) ~ .bili-dyn-list-tabs .qfb_upload::before {content:"☐"}
  #qfb_upload:checked ~ .bili-dyn-list-tabs .qfb_upload::before {content:"☑"}
  #qfb_upload:not(:checked) ~ .bili-dyn-list .qfb_upload {
    display: none;
  }

  #qfb_live_replay:not(:checked) ~ .bili-dyn-list-tabs .qfb_live_replay::before {content:"☐"}
  #qfb_live_replay:checked ~ .bili-dyn-list-tabs .qfb_live_replay::before {content:"☑"}
  #qfb_live_replay:not(:checked) ~ .bili-dyn-list .qfb_live_replay {
    display: none;
  }
  `)

  const listTabs = await elementEmerge(`.bili-dyn-list-tabs`)
  console.debug('分离视频类型 listTabs', listTabs)

  const cmbUpload = document.createElement('input')
  cmbUpload.setAttribute('type', 'checkbox')
  cmbUpload.setAttribute('id', 'qfb_upload')
  cmbUpload.checked = true
  listTabs.before(cmbUpload)
  console.debug('分离视频类型 cmbUpload', cmbUpload)

  const cmbLiveReplay = document.createElement('input')
  cmbLiveReplay.setAttribute('type', 'checkbox')
  cmbLiveReplay.setAttribute('id', 'qfb_live_replay')
  cmbLiveReplay.checked = true
  listTabs.before(cmbLiveReplay)
  console.debug('分离视频类型 cmbLiveReplay', cmbLiveReplay)

  const listTabsUpload = await elementEmerge(`.bili-dyn-list-tabs__item:nth-child(2)`, listTabs)
  console.debug('分离视频类型 listTabsUpload', listTabsUpload)

  const subSelect = document.createElement('div')
  subSelect.classList.add('bili-dyn-list-tabs')
  subSelect.classList.add('qfb__subselect_list')
  subSelect.innerHTML = `
  <div class="bili-dyn-list-tabs__list">
    <label class="bili-dyn-list-tabs__item qfb_upload" for="qfb_upload">
      投稿视频
    </label>
    <label class="bili-dyn-list-tabs__item qfb_live_replay" for="qfb_live_replay">
      直播回放
    </label>
  </div>
  `

  listTabs.after(subSelect)
  console.debug('分离视频类型 subSelect', subSelect)

  attrChange({
    node: listTabsUpload,
    attributeFilter: ['class'],
    callback: () => {
      if (listTabsUpload.classList.contains('active')) {
        subSelect.style.display = 'flex'
      } else {
        subSelect.style.display = 'none'
      }
    },
    once: false,
  })

  listTabs.addEventListener('click', (e) => {
    console.debug('分离视频类型 listTabs click', e)
    listTabsUpload.classList.contains('')
    if (e.target === listTabsUpload) {
      subSelect.style.display = 'flex'
    } else {
      subSelect.style.display = 'none'
    }
  })

  const dynList = await elementEmerge(`.bili-dyn-list__items`)
  console.debug('分离视频类型 dynList', dynList)
  console.debug('分离视频类型 dynList.children', dynList.children)

  launchObserver({
    parentNode: dynList,
    selector: `.bili-dyn-list__item`,
    successCallback: ({ selectAll }) => {
      console.debug('分离视频类型 oscb in')
      for (const div of selectAll() as HTMLDivElement[]) {
        if (div.classList.contains('processed')) continue
        console.debug('分离视频类型 div', div)
        const type = div.getElementsByClassName(`bili-dyn-card-video__badge`)[0]?.textContent.trim()
        console.debug('分离视频类型 type', type)
        switch (type) {
          case '直播回放':
            div.classList.add('qfb_live_replay')
            break
          case '合作视频':
          case '投稿视频':
            div.classList.add('qfb_upload')
            break
        }
        div.classList.add('processed')
      }
      console.debug('分离视频类型 oscb out')
    },
    config: {
      childList: true,
    },
  })

  console.debug('分离视频类型 out')
}
