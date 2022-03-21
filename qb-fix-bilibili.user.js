// ==UserScript==
// @name        qb-fix-bilibili
// @description inQ_Beta wants to fix some of bilibili problem
// @namespace   no1xsyzy
// @match       https://*.bilibili.com/*
// @license     Apache License, Version 2.0 (Apache-2.0); https://opensource.org/licenses/Apache-2.0
// @version     0.0.6
// @author      inQ_Beta
// @grant       GM_addStyle
// ==/UserScript==
(function () {
    'use strict';

    const $ = (x) => document.querySelector(x);
    const $$ = (x) => Array.from(document.querySelectorAll(x));

    function launchObserver({ parentNode, selector, failCallback = null, successCallback = null, stopWhenSuccess = true, config = {
        childList: true,
        subtree: true,
    }, }) {
        // if parent node does not exist, use body instead
        if (!parentNode) {
            parentNode = document.body;
        }
        const observeFunc = () => {
            const selected = document.querySelector(selector);
            if (!selected) {
                if (failCallback) {
                    failCallback();
                }
                return;
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
      GM_addStyle(`.section-content-cntr{height:calc(100vh - 250px)!important;}`);

      launchObserver({
        selector: `.side-bar-popup-cntr.ts-dot-4`,
        successCallback: () => {
          const g = $`.side-bar-popup-cntr.ts-dot-4`;
          if (g.style.height !== '0px') {
            g.style.bottom = '75px';
            g.style.height = 'calc(100vh - 150px)';
            // g.style.height = "600px"
          }
          if ($(`.side-bar-popup-cntr.ts-dot-4 .ps`)) {
            setTimeout(() => $(`.side-bar-popup-cntr.ts-dot-4 .ps`).dispatchEvent(new Event('scroll')), 1000);
          }
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
    const parentNode$3 = $`#area-tags`;
    const selector$3 = `header`;
    function 分区标题 () {
      launchObserver({
        parentNode: parentNode$3,
        selector: selector$3,
        successCallback: () => {
          document.title = makeTitle$1();
        },
        stopWhenSuccess: false,
      });

      document.title = makeTitle$1();
    }

    const TTL = 10 * 60 * 1000;
    function timedLRU1(func) {
        const cache = new Map();
        let time = [];
        let timeout = null;
        const cleanup = () => {
            if (timeout !== null) {
                clearTimeout(timeout);
            }
            const ts = new Date().getTime();
            const idx = time.findIndex(([a, t]) => t + TTL > ts);
            const drop = time.splice(idx);
            for (const [a] of drop) {
                cache.delete(a);
            }
            timeout = setTimeout(cleanup, 60 * 1000);
        };
        return (a1) => {
            const got = cache.get(a1);
            if (got !== undefined) {
                const ts = new Date().getTime();
                time = [[a1, ts], ...time.filter(([a, t]) => a !== a1)];
                cleanup();
                return got;
            }
            const val = func(a1);
            const ts = new Date().getTime();
            time = [[a1, ts], ...time];
            cache.set(a1, val);
            return val;
        };
    }

    const getCard = timedLRU1(async (uid) => {
        const json = await (await fetch(`https://api.bilibili.com/x/web-interface/card?mid=${uid}`, {
            // credentials: 'include',
            headers: {
                Accept: 'application/json',
            },
            method: 'GET',
            mode: 'cors',
        })).json();
        if (json.code === 0) {
            return json.data;
        }
        else {
            throw json.message;
        }
    });
    const getFansCount = async (uid) => {
        return (await getCard(uid)).card.fans;
    };
    const getSexTag = async (uid) => {
        const sex = (await getCard(uid)).card.sex;
        switch (sex) {
            case '男':
                return '♂';
            case '女':
                return '♀';
            default:
                return '〼';
        }
    };
    const getInfoByRoom = timedLRU1(async (roomid) => {
        const json = await (await fetch(`https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=${roomid}`, {
            // credentials: 'include',
            headers: {
                Accept: 'application/json',
            },
            method: 'GET',
            mode: 'cors',
        })).json();
        if (json.code === 0) {
            return json.data;
        }
        else {
            throw json.message;
        }
    });
    const getRoomFollowers = async (roomid) => {
        return (await getInfoByRoom(roomid)).anchor_info.relation_info.attention;
    };
    const followersTextClass = (followers) => {
        if (followers > 1e6) {
            return [`${Math.round(followers / 1e5) / 10}m★`, 'followers-m'];
        }
        else if (followers > 1e3) {
            return [`${Math.round(followers / 1e2) / 10}k★`, 'followers-k'];
        }
        else {
            return [`${followers}★`, ''];
        }
    };

    const parentNode$2 = $(`#area-tag-list`);
    const selector$2 = `a.Item_1EohdhbR`;
    GM_addStyle(`
.processed::after {
  content: attr(data-followers);
  color: white;
}
.processed.followers-m::before{
  color: purple;
}
.processed.followers-k::before{
  color: red;
}
`);
    function 分区添加粉丝数 () {
        launchObserver({
            parentNode: parentNode$2,
            selector: selector$2,
            successCallback: () => {
                for (const a of $$(`a.Item_1EohdhbR`)) {
                    (async () => {
                        const nametag = a.querySelector(`.Item_QAOnosoB`);
                        if (nametag.classList.contains('processed')) {
                            return;
                        }
                        const followers = await getRoomFollowers(a.pathname.slice(1));
                        let [txt, cls] = followersTextClass(followers);
                        nametag.dataset.followers = txt;
                        nametag.classList.add('processed');
                        nametag.classList.add(cls);
                    })();
                }
            },
            stopWhenSuccess: false,
        });
    }

    function 分区 () {
      关注栏尺寸();
      分区标题();
      分区添加粉丝数();
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
    const parentNode$1 = $`#head-info-vm .left-header-area`;
    const selector$1 = `.live-title`;

    function 直播间标题 () {
      launchObserver({
        parentNode: parentNode$1,
        selector: selector$1,
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

    const parentNode = $(`#chat-items`);
    const selector = `.user-name`;
    GM_addStyle(`.infoline::before{
  content: attr(data-infoline);
  color: white;
}
.infoline.followers-m::before{
  color: purple;
}
.infoline.followers-k::before{
  color: red;
}
`);
    const append = async (un) => {
        un.classList.add('infoline');
        const uid = un.parentNode.dataset.uid;
        const fans = await getFansCount(uid);
        const [txt, cls] = followersTextClass(fans);
        const sextag = await getSexTag(uid);
        un.dataset.infoline = `${sextag} ${txt} `;
        un.classList.add(cls);
    };
    function 直播间留言者显示粉丝数 () {
        launchObserver({
            parentNode,
            selector,
            successCallback: () => {
                for (const un of $$(`#chat-items .user-name`)) {
                    if (un.classList.contains('infoline')) {
                        continue;
                    }
                    append(un);
                }
            },
            stopWhenSuccess: false,
        });
    }

    function 动态井号标签 () {
        launchObserver({
            parentNode: document.body,
            selector: `a.dynamic-link-hover-bg`,
            successCallback: () => {
                for (let link of $$(`a.dynamic-link-hover-bg`)) {
                    // link: HTMLAnchorElement
                    if (/#.+#/.exec(link.innerHTML) && /https?:\/\/search.bilibili.com\/all\?.+/.exec(link.href)) {
                        link.href = `https://t.bilibili.com/topic/name/${/#(.+)#/.exec(link.innerHTML)[1]}/feed`;
                    }
                }
            },
            stopWhenSuccess: false,
        });
    }

    function 直播间 () {
      关注栏尺寸();
      直播间标题();
      直播间留言者显示粉丝数();
      通用表情框尺寸修复();
      动态井号标签();
    }

    function 直播主页 () {
      关注栏尺寸();
    }

    function 其他页面 () {
      动态井号标签();
    }

    if (location.pathname === '/') {
      直播主页();
    } else if (location.pathname === '/p/eden/area-tags') {
      分区();
    } else if (/^\/\d+$/.exec(location.pathname)) {
      直播间();
    } else {
      其他页面();
    }

})();
