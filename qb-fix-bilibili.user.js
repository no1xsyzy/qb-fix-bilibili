// ==UserScript==
// @name        qb-fix-bilibili
// @description inQ_Beta wants to fix some of bilibili problem
// @namespace   no1xsyzy
// @match       https://*.bilibili.com/*
// @license     Apache License, Version 2.0 (Apache-2.0); https://opensource.org/licenses/Apache-2.0
// @version     0.0.9
// @author      inQ_Beta
// @grant       GM_addStyle
// ==/UserScript==
(function () {
    'use strict';

    const $ = (x) => document.querySelector(x);

    function launchObserver({ parentNode, selector, failCallback = null, successCallback = null, stopWhenSuccess = true, config = {
        childList: true,
        subtree: true,
    }, }) {
        // if parent node does not exist, use body instead
        if (!parentNode) {
            parentNode = document;
        }
        const observeFunc = () => {
            const selected = parentNode.querySelector(selector);
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
                successCallback({
                    selected,
                    selectAll() {
                        return Array.from(parentNode.querySelectorAll(selector));
                    },
                    disconnect() {
                        observer.disconnect();
                    },
                });
            }
        };
        const observer = new MutationObserver(observeFunc);
        observer.observe(parentNode, config);
    }
    function elementEmerge(selector, parentNode) {
        return new Promise((resolve) => {
            launchObserver({
                parentNode,
                selector,
                successCallback: ({ selected }) => {
                    resolve(selected);
                },
            });
        });
    }

    async function 关注栏尺寸 () {
        GM_addStyle(`.section-content-cntr{height:calc(100vh - 250px)!important;}`);
        const selector = (() => {
            if (location.pathname === '/') {
                return `.flying-vm`;
            }
            else if (location.pathname === '/p/eden/area-tags') {
                return `#area-tags`;
            }
            else if (/^(?:\/blanc)?\/(\d+)$/.exec(location.pathname)) {
                return `#sidebar-vm`;
            }
        })();
        launchObserver({
            parentNode: await elementEmerge(selector),
            selector: `.side-bar-popup-cntr.ts-dot-4`,
            successCallback: ({ selected }) => {
                if (selected.style.height !== '0px') {
                    selected.style.bottom = '75px';
                    selected.style.height = 'calc(100vh - 150px)';
                    // selected.style.height = "600px"
                }
                setTimeout(() => $(`.side-bar-popup-cntr.ts-dot-4 .ps`)?.dispatchEvent(new Event('scroll')), 1000);
            },
            stopWhenSuccess: false,
            config: {
                childList: true,
                subtree: true,
                attributes: true,
            },
        });
    }

    const makeTitle$1 = () => `${($(`#area-tags header img+div`) || $(`#area-tags header h2`)).innerText} - 分区列表 - 哔哩哔哩直播`;
    const parentNode$2 = $(`#area-tags`);
    const selector$3 = `header`;
    function 分区标题 () {
        launchObserver({
            parentNode: parentNode$2,
            selector: selector$3,
            successCallback: () => {
                document.title = makeTitle$1();
            },
            stopWhenSuccess: false,
        });
        document.title = makeTitle$1();
    }

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

    function defaultCacheStorageFactory(id) {
        let store = [];
        const get = (key) => store.filter(([k, t, v]) => k === key).map(([k, t, v]) => [t, v])[0] ?? [0, undefined];
        const set = (key, time, value) => {
            const i = store.findIndex(([k, t, v]) => k === key);
            if (i === -1) {
                store.push([key, time, value]);
            }
            else {
                store[i] = [key, time, value];
            }
        };
        const cleanup = (ttl, now) => {
            store = store.filter(([k, t]) => t + ttl > now);
        };
        return { get, set, cleanup };
    }
    function timedLRU(func, { id, ttl = 10 * 60 * 1000, cleanup_interval = 60 * 1000, cacheStorageFactory = defaultCacheStorageFactory, }) {
        const cacheStorage = cacheStorageFactory(id);
        let timeout = null;
        const cleanup = () => {
            if (timeout !== null) {
                clearTimeout(timeout);
            }
            cacheStorage.cleanup(ttl, new Date().getTime());
            timeout = setTimeout(cleanup, cleanup_interval);
        };
        cleanup();
        const wrapped = async (k) => {
            const t = new Date().getTime();
            let [_, v] = cacheStorage.get(k);
            if (v === undefined) {
                v = await func(k);
            }
            cacheStorage.set(k, t, v);
            return v;
        };
        wrapped.cleanup = cleanup;
        return wrapped;
    }

    function localStorage_CacheStorageFactory(id) {
        const get = (key) => JSON.parse(localStorage.getItem(`cacheStore__${id}__${key}`)) ?? [0, undefined];
        const set = (key, time, value) => {
            localStorage.setItem(`cacheStore__${id}__${key}`, JSON.stringify([time, value]));
        };
        const cleanup = (ttl, now) => {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (!k.startsWith(`cacheStore__${id}__`)) {
                    continue;
                }
                const [t, v] = JSON.parse(localStorage.getItem(k));
                if (t + ttl < now) {
                    localStorage.removeItem(k);
                }
            }
        };
        return { get, set, cleanup };
    }

    const getCard = timedLRU(async (uid) => {
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
    }, {
        id: 'getCard',
        ttl: 86400 * 1000,
        cacheStorageFactory: localStorage_CacheStorageFactory,
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

    const getInfoByRoom = timedLRU(async (roomid) => {
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
    }, {
        id: 'getInfoByRoom',
        ttl: 86400 * 1000,
        cacheStorageFactory: localStorage_CacheStorageFactory,
    });
    const getRoomFollowers = async (roomid) => {
        return (await getInfoByRoom(roomid)).anchor_info.relation_info.attention;
    };

    const parentNode$1 = $(`#area-tag-list`);
    const selector$2 = `a.Item_1EohdhbR`;
    GM_addStyle(`
.processed::after {
  content: attr(data-followers);
  color: black;
}
.processed.followers-m::after{
  color: purple;
}
.processed.followers-k::after{
  color: red;
}
`);
    function 分区添加粉丝数 () {
        launchObserver({
            parentNode: parentNode$1,
            selector: selector$2,
            successCallback: ({ selectAll }) => {
                for (const a of selectAll()) {
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
        switch ($(`.live-status`).innerText) {
            case '直播':
                return '▶️';
            case '闲置':
                return '⏹️';
            case '轮播':
                return '🔁';
            default:
                return `【${$(`.live-status`).innerText}】`;
        }
    }
    const liveTitle = () => $(`.live-title`).innerText;
    const liveHost = () => $(`.room-owner-username`).innerText;
    const makeTitle = () => `${liveStatus()} ${liveTitle()} - ${liveHost()} - 哔哩哔哩直播`;
    const selector$1 = `.live-title`;
    async function 直播间标题 () {
        launchObserver({
            parentNode: await elementEmerge(`#head-info-vm .left-header-area`),
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
        if (cls !== '')
            un.classList.add(cls);
    };
    function 直播间留言者显示粉丝数 () {
        launchObserver({
            parentNode,
            selector,
            successCallback: ({ selectAll }) => {
                for (const un of selectAll()) {
                    if (un.classList.contains('infoline')) {
                        continue;
                    }
                    append(un);
                }
            },
            stopWhenSuccess: false,
        });
    }

    async function 动态井号标签 () {
        launchObserver({
            parentNode: /^(?:\/blanc)?\/(\d+)$/.exec(location.pathname)
                ? await elementEmerge(`.room-feed-content`)
                : document.body,
            selector: `a.dynamic-link-hover-bg`,
            successCallback: ({ selectAll }) => {
                for (let link of selectAll()) {
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

    if (location.host === 'live.bilibili.com') {
      if (location.pathname === '/') {
        直播主页();
      } else if (location.pathname === '/p/eden/area-tags') {
        分区();
      } else if (/^(?:\/blanc)?\/(\d+)$/.exec(location.pathname)) {
        直播间();
      } else {
        其他页面();
      }
    } else {
      其他页面();
    }

})();
