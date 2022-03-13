// ==UserScript==
// @name        qb-fix-bilibili
// @description inQ_Beta wants to fix some of bilibili problem
// @namespace   no1xsyzy
// @match       https://live.bilibili.com/*
// @license     Apache License, Version 2.0 (Apache-2.0); https://opensource.org/licenses/Apache-2.0
// @version     0.0.1
// @author      inQ_Beta
// @grant       GM_addStyle
// ==/UserScript==
(function () {
  'use strict';

  const $ = (x) => document.querySelector(x);

  function launchObserver({
    parentNode,
    selector,
    failCallback = null,
    successCallback = null,
    stopWhenSuccess = true,
    config = {
      childList: true,
      subtree: true,
    },
  }) {
    // if parent node does not exist, use body instead
    if (!parentNode) {
      parentNode = document.body;
    }
    const observeFunc = (mutationList) => {
      const selected = document.querySelector(selector);
      if (!selected) {
        if (failCallback) {
          failCallback();
        }
        return
      }
      if (stopWhenSuccess) {
        observer.disconnect();
      }
      if (successCallback) {
        successCallback(selected);
      }
    };
    const observer = new MutationObserver(observeFunc);
    observer.observe(parentNode, config);
  }

  function 关注栏尺寸 () {
    GM_addStyle(`.section-content-cntr[data-v-649cf1f8]{height:calc(100vh - 250px)!important;}`);

    launchObserver({
      selector: `#sidebar-vm .side-bar-popup-cntr.ts-dot-4`,
      successCallback: () => {
        const g = $`#sidebar-vm .side-bar-popup-cntr.ts-dot-4`;
        if (g.style.height !== '0px') {
          g.style.bottom = '75px';
          g.style.height = 'calc(100vh - 150px)';
          // g.style.height = "600px"
        }
        setTimeout(() => $(`#sidebar-vm .side-bar-popup-cntr.ts-dot-4 .ps`).dispatchEvent(new Event('scroll')), 1000);
      },
      stopWhenSuccess: false,
      config: {
        childList: true,
        subtree: true,
        attributes: true,
      },
    });
  }

  const makeTitle$1 = () =>
    `${($`#area-tags header img+div` || $`#area-tags header h2`).innerText} - 分区列表 - 哔哩哔哩直播`;
  const parentNode$1 = $`#area-tags`;
  const selector$1 = `header`;
  function 分区标题 () {
    launchObserver({
      parentNode: parentNode$1,
      selector: selector$1,
      successCallback: () => {
        document.title = makeTitle$1();
      },
      stopWhenSuccess: false,
    });

    document.title = makeTitle$1();
  }

  function 分区 () {
    关注栏尺寸();
    分区标题();
  }

  function liveStatus() {
    switch ($`.live-status`.innerText) {
      case '直播':
        return '▶️'
      case '闲置':
        return '⏹️'
      case '轮播':
        return '🔁'
      default:
        return `【${$`.live-status`.innerText}】`
    }
  }

  const liveTitle = () => $`.live-title`.innerText;
  const liveHost = () => $`.room-owner-username`.innerText;
  const makeTitle = () => `${liveStatus()} ${liveTitle()} - ${liveHost()} - 哔哩哔哩直播`;
  const parentNode = $`#head-info-vm .left-header-area`;
  const selector = `.live-title`;

  function 直播间标题 () {
    launchObserver({
      parentNode,
      selector,
      successCallback: () => {
        document.title = makeTitle();
      },
      stopWhenSuccess: false,
    });

    document.title = makeTitle();
  }

  function 通用表情框尺寸修复 () {
    GM_addStyle(`
#control-panel-ctnr-box > .border-box.top-left[style^="transform-origin: 249px "],
#control-panel-ctnr-box > .border-box.top-left[style^="transform-origin: 251px "]
{
  height: 700px
}
`);
  }

  function 直播间 () {
    关注栏尺寸();
    直播间标题();
    通用表情框尺寸修复();
  }

  if (location.pathname === '/p/eden/area-tags') {
    分区();
  } else if (/^\/\d+$/.exec(location.pathname)) {
    直播间();
  }

})();
