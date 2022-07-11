// ==UserScript==
// @name        qb-fix-bilibili
// @description inQ_Beta wants to fix some of bilibili problem
// @namespace   no1xsyzy
// @match       https://*.bilibili.com/*
// @license     Apache License, Version 2.0 (Apache-2.0); https://opensource.org/licenses/Apache-2.0
// @version     0.0.16
// @author      inQ_Beta
// @grant       GM_addStyle
// ==/UserScript==
(function () {
    'use strict';

    function trace(description, center) {
        return center;
    }

    const $ = (x) => document.querySelector(x);
    function betterSelector(parentNode, selector) {
        // `.class-name`
        const className = /^\.([\w_-]+)$/.exec(selector);
        if (className) {
            return {
                select: () => trace(`betterSelector("${selector}").select#class`, parentNode.getElementsByClassName(className[1])[0]),
                selectAll: () => trace(`betterSelector("${selector}").selectAll#class`, Array.from(parentNode.getElementsByClassName(className[1]))),
            };
        }
        // `#id`
        const elementID = /^#([\w_-]+)$/.exec(selector);
        if (elementID) {
            return {
                select: () => trace(`betterSelector("${selector}").select#id=${elementID[1]}`, document.getElementById(elementID[1])),
                selectAll: () => trace(`betterSelector("${selector}").selectAll#id=${elementID[1]}`, [
                    document.getElementById(elementID[1]),
                ]),
            };
        }
        // `tag-name`
        const tagName = /^([\w_-]+)$/.exec(selector);
        if (tagName) {
            return {
                select: () => trace(`betterSelector("${selector}").select#tag`, parentNode.getElementsByTagName(tagName[1])[0]),
                selectAll: () => trace(`betterSelector("${selector}").selectAll#tag`, Array.from(parentNode.getElementsByTagName(tagName[1]))),
            };
        }
        // otherwise
        return {
            select: () => trace(`betterSelector("${selector}").select#qs`, parentNode.querySelector(selector)),
            selectAll: () => trace(`betterSelector("${selector}").selectAll#qs`, Array.from(parentNode.querySelectorAll(selector))),
        };
    }

    function launchObserver({ parentNode, selector, failCallback = null, successCallback = null, stopWhenSuccess = true, config = {
        childList: true,
        subtree: true,
    }, }) {
        if (!parentNode) {
            parentNode = document;
        }
        const { select, selectAll } = betterSelector(parentNode, selector);
        let _connected = false;
        const off = () => {
            if (_connected) {
                observer.takeRecords();
                observer.disconnect();
                _connected = false;
            }
        };
        const on = () => {
            if (!_connected) {
                observer.observe(parentNode, config);
                _connected = true;
            }
        };
        const connected = () => _connected;
        const reroot = (newParentNode) => {
            parentNode = newParentNode;
        };
        const wrapped = { on, off, connected, reroot };
        const observeFunc = (mutationList) => {
            const selected = select();
            if (!selected) {
                if (failCallback) {
                    failCallback({ ...wrapped, mutationList });
                }
                return;
            }
            if (stopWhenSuccess) {
                off();
            }
            if (successCallback) {
                const maybePromise = successCallback({
                    ...wrapped,
                    selected,
                    selectAll,
                    mutationList,
                });
                if (maybePromise instanceof Promise) {
                    maybePromise.then(() => {
                    });
                }
            }
        };
        const observer = new MutationObserver(observeFunc);
        on();
        return wrapped;
    }
    function attrChange({ node, attributeFilter, callback, once = true, }) {
        let _connected = false;
        let _resolve;
        const promise = new Promise((resolve) => {
            _resolve = resolve;
        });
        const wrapped = {
            on() {
                if (_connected)
                    return;
                _connected = true;
                observer.observe(node, { attributeFilter, attributeOldValue: true });
            },
            off() {
                if (!_connected)
                    return;
                _connected = false;
                observer.disconnect();
            },
            connected() {
                return _connected;
            },
            reroot(x) {
                if (_connected) {
                    wrapped.off();
                    node = x;
                    wrapped.on();
                }
                else {
                    node = x;
                }
            },
            then(onfulfill, onrejected) {
                return promise.then(onfulfill, onrejected);
            },
        };
        const observer = new MutationObserver((mutationList) => {
            if (once) {
                wrapped.off();
            }
            callback(mutationList, wrapped);
            _resolve(mutationList[0].attributeName);
        });
        wrapped.on();
        return wrapped;
    }
    function elementEmerge(selector, parentNode, subtree = true) {
        const g = betterSelector(parentNode ?? document, selector).select();
        if (g)
            return Promise.resolve(g);
        return new Promise((resolve) => {
            launchObserver({
                parentNode,
                selector,
                successCallback: ({ selected }) => {
                    resolve(selected);
                },
                config: { subtree, childList: true },
            });
        });
    }

    const waitAppBodyMount = (async function () {
        const appBody = $(`.app-body`);
        if (!appBody) {
            throw new Error('activity page');
        }
        await new Promise((resolve) => {
            launchObserver({
                parentNode: appBody,
                selector: `#sections-vm`,
                successCallback: ({ selected }) => {
                    resolve(null);
                },
                config: { childList: true },
            });
        });
        return appBody;
    })();

    async function 关注栏尺寸 () {
        GM_addStyle(`.section-content-cntr{height:calc(100vh - 250px)!important;}`);
        const sidebarVM = await (async () => {
            if (location.pathname === '/') {
                return $(`.flying-vm`);
            }
            else if (location.pathname === '/p/eden/area-tags') {
                return $(`#area-tags`);
            }
            else if (/^(?:\/blanc)?\/(\d+)$/.exec(location.pathname)) {
                const appBody = await waitAppBodyMount;
                return appBody.querySelector(`#sidebar-vm`);
            }
        })();
        const sidebarPopup = await elementEmerge(`.side-bar-popup-cntr`, sidebarVM);
        attrChange({
            node: sidebarPopup,
            attributeFilter: ['class'],
            callback: () => {
            },
            once: false,
        });
        launchObserver({
            parentNode: sidebarPopup,
            selector: `*`,
            successCallback: ({ mutationList }) => {
                if (sidebarPopup.style.height !== '0px') {
                    sidebarPopup.style.bottom = '75px';
                    sidebarPopup.style.height = 'calc(100vh - 150px)';
                    // selected.style.height = "600px"
                }
                setTimeout(() => $(`.side-bar-popup-cntr.ts-dot-4 .ps`)?.dispatchEvent(new Event('scroll')), 1000);
            },
            stopWhenSuccess: false,
            config: {
                attributes: true,
                attributeFilter: ['class'],
            },
        });
    }

    const makeTitle$1 = () => `${($(`#area-tags header img+div`) || $(`#area-tags header h2`)).innerText} - 分区列表 - 哔哩哔哩直播`;
    const parentNode$3 = $(`#area-tags`);
    const selector$4 = `header`;
    function 分区标题 () {
        launchObserver({
            parentNode: parentNode$3,
            selector: selector$4,
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
            return [`${followers}★`, 'followers-1'];
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
    function timedLRU(func, { id, ttl = 10 * 60 * 1000, cleanupInterval = 60 * 1000, cacheStorageFactory = defaultCacheStorageFactory, }) {
        const cacheStorage = cacheStorageFactory(id);
        let timeout = null;
        const cleanup = () => {
            if (timeout !== null) {
                clearTimeout(timeout);
            }
            cacheStorage.cleanup(ttl, new Date().getTime());
            timeout = setTimeout(cleanup, cleanupInterval);
        };
        setTimeout(cleanup, cleanupInterval / 10);
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

    function localStorageCacheStorageFactory(id) {
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
        cacheStorageFactory: localStorageCacheStorageFactory,
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
        cacheStorageFactory: localStorageCacheStorageFactory,
    });
    const getRoomFollowers = async (roomid) => {
        return (await getInfoByRoom(roomid)).anchor_info.relation_info.attention;
    };

    async function* getDynamicFeed({ timezone = -480, type = 'all', }) {
        let page = 1;
        let json = await (await fetch(`https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all?timezone_offset=${timezone}&type=${type}&page=${page}`, {
            credentials: 'include',
            headers: {
                Accept: 'application/json',
            },
            method: 'GET',
            mode: 'cors',
        })).json();
        if (json.code === 0) {
            for (const item of json.data.items) {
                yield item;
            }
        }
        else {
            throw json.message;
        }
        while (json.data.has_more) {
            page += 1;
            json = await (await fetch(`https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all?timezone_offset=${timezone}&type=${type}&offset=${json.data.offset}&page=${page}`, {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                },
                method: 'GET',
                mode: 'cors',
            })).json();
            if (json.code === 0) {
                for (const item of json.data.items) {
                    yield item;
                }
            }
            else {
                throw json.message;
            }
        }
    }
    function compareDynamicID(a, b) {
        if (a === b)
            return 0;
        if (a.length < b.length)
            return -1;
        if (a.length > b.length)
            return 1;
        if (a < b)
            return -1;
        if (a > b)
            return 1;
    }
    function recordDynamicFeed(spec) {
        const registry = [];
        const gen = getDynamicFeed(spec);
        const extend = async (n = 1) => {
            for (let i = 0; i < n; i++) {
                let v;
                try {
                    v = (await gen.next()).value;
                }
                catch (err) {
                }
                if (v) {
                    registry.push(v);
                }
                else {
                    return false;
                }
            }
            return true;
        };
        const getByIndex = async (i) => {
            while (registry.length < i) {
                if (!(await extend()))
                    break;
            }
            if (registry.length > i) {
                return registry[i];
            }
        };
        const lastVisibleDynamic = () => {
            for (let i = registry.length - 1; i >= 0; i--) {
                if (registry[i].visible) {
                    return registry[i];
                }
            }
            return null;
        };
        const getByDynamicID = async (did) => {
            if (!registry.length && !(await extend())) {
                return null;
            }
            do {
                if (registry[registry.length - 1].id_str === did) {
                    return registry[registry.length - 1];
                }
                if (compareDynamicID(lastVisibleDynamic().id_str, did) < 0) {
                    for (const dyn of registry) {
                        if (dyn.id_str === did) {
                            return dyn;
                        }
                    }
                    return null;
                }
            } while (await extend());
        };
        const getByBVID = async (bvid) => {
            if (spec.type === 'article') {
                return null;
            }
            for (const dyn of registry) {
                if (dyn.modules.module_dynamic.major.archive.bvid === bvid) {
                    return dyn;
                }
            }
            do {
                if (lastVisibleDynamic()?.modules.module_dynamic.major.archive.bvid === bvid) {
                    return lastVisibleDynamic();
                }
            } while (await extend());
            return null;
        };
        return { getByIndex, getByDynamicID, getByBVID };
    }

    const CARDCLS$1 = 'Item_1EohdhbR';
    const NAMECLS = 'Item_QAOnosoB';
    const parentNode$2 = $(`#area-tag-list`);
    const selector$3 = `.${CARDCLS$1}`;
    GM_addStyle(`
.${NAMECLS}.processed::after {
  content: attr(data-followers);
}

.${NAMECLS}.processed.followers-m {
  color: purple !important;
}

.${NAMECLS}.processed.followers-k {
  color: grey !important;
}

.${NAMECLS}.processed.followers-1 {
  color: red !important;
}
`);
    function 分区添加粉丝数 () {
        launchObserver({
            parentNode: parentNode$2,
            selector: selector$3,
            successCallback: ({ selectAll }) => {
                for (const card of selectAll()) {
                    (async () => {
                        const nametag = card.querySelector(`.${NAMECLS}`);
                        if (nametag.classList.contains('processed')) {
                            return;
                        }
                        const followers = await getRoomFollowers(card.pathname.slice(1));
                        const [txt, cls] = followersTextClass(followers);
                        nametag.dataset.followers = txt;
                        nametag.title = txt;
                        nametag.classList.add('processed');
                        nametag.classList.add(cls);
                    })();
                }
            },
            stopWhenSuccess: false,
        });
    }

    const CARDCLS = 'Item_1EohdhbR';
    const TITLECLS = 'Item_2GEmdhg6';
    const parentNode$1 = $(`#area-tag-list`);
    const selector$2 = `.${CARDCLS}`;
    function 分区卡片直播间标题指向 () {
        launchObserver({
            parentNode: parentNode$1,
            selector: selector$2,
            successCallback: ({ selectAll }) => {
                for (const card of selectAll()) {
                    (async () => {
                        const titletag = card.querySelector(`.${TITLECLS}`);
                        titletag.title = titletag.textContent.trim();
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
        分区卡片直播间标题指向();
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
        const uid = un.parentNode.parentNode.dataset.uid;
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
                    if (!un.classList.contains('infoline')) {
                        un.classList.add('infoline');
                        append(un);
                    }
                }
            },
            stopWhenSuccess: false,
        });
    }

    async function 标签动态流$1() {
        // match: *://t.bilibili.com/topic/name/:strTopic/feed
        launchObserver({
            selector: `.dynamic-link-hover-bg`,
            successCallback: ({ selectAll }) => {
                for (const link of selectAll()) {
                    // link: HTMLAnchorElement
                    if (/#.+#/.exec(link.innerHTML) && /https?:\/\/search.bilibili.com\/all\?.+/.exec(link.href)) {
                        link.href = `https://t.bilibili.com/topic/name/${/#(.+)#/.exec(link.innerHTML)[1]}/feed`;
                    }
                }
            },
            failCallback: () => {
            },
            stopWhenSuccess: false,
        });
    }
    async function 动态页面$1() {
        // match: *://t.bilibili.com/*
        launchObserver({
            parentNode: document.body,
            selector: `.bili-rich-text-topic`,
            successCallback: ({ selectAll }) => {
                for (const span of selectAll()) {
                    if (span.classList.contains('processed'))
                        continue;
                    const anchor = document.createElement('A');
                    anchor.href = `https://t.bilibili.com/topic/name/${/#(.+)#/.exec(span.innerHTML)[1]}/feed`;
                    anchor.classList.add('bili-rich-text-topic');
                    anchor.classList.add('processed');
                    anchor.setAttribute('target', '_blank');
                    anchor.addEventListener('click', (e) => e.stopPropagation());
                    anchor.innerHTML = span.innerHTML;
                    span.replaceWith(anchor);
                }
            },
            failCallback: () => {
            },
            stopWhenSuccess: false,
        });
    }
    async function 直播间$1() {
        // match: *://live.bilibili.com/blanc/:idLive
        // match: *://live.bilibili.com/:idLive
        const appBody = await waitAppBodyMount;
        const sectionVM = appBody.querySelector(`#sections-vm`);
        const roomFeed = sectionVM.querySelector('.room-feed');
        const roomFeedContent = await elementEmerge(`.room-feed-content`, roomFeed, false);
        launchObserver({
            parentNode: roomFeedContent,
            selector: `.dynamic-link-hover-bg`,
            successCallback: ({ selectAll }) => {
                for (const link of selectAll()) {
                    // link: HTMLAnchorElement
                    if (/#.+#/.exec(link.innerHTML) && /https?:\/\/search.bilibili.com\/all\?.+/.exec(link.href)) {
                        link.href = `https://t.bilibili.com/topic/name/${/#(.+)#/.exec(link.innerHTML)[1]}/feed`;
                    }
                }
            },
            failCallback: () => {
            },
            stopWhenSuccess: false,
        });
    }
    async function 空间$1() {
        // match: space.bilibili.com/:mid
        const sSpace = await elementEmerge(`.s-space`);
        const parentNode = await elementEmerge(`#page-dynamic`, sSpace);
        const ob = launchObserver({
            parentNode,
            selector: `.dynamic-link-hover-bg`,
            successCallback: ({ selectAll }) => {
                for (const link of selectAll()) {
                    // link: HTMLAnchorElement
                    if (/#.+#/.exec(link.innerHTML) && /https?:\/\/search.bilibili.com\/all\?.+/.exec(link.href)) {
                        link.href = `https://t.bilibili.com/topic/name/${/#(.+)#/.exec(link.innerHTML)[1]}/feed`;
                    }
                }
            },
            failCallback: () => {
            },
            stopWhenSuccess: false,
        });
        launchObserver({
            parentNode: sSpace,
            selector: `#page-dynamic`,
            successCallback: ({ selected }) => {
                ob.reroot(selected);
                ob.on();
            },
            failCallback: () => {
                ob.off();
            },
            stopWhenSuccess: false,
        });
    }

    async function 自动刷新崩溃直播间 () {
        const player = $(`#live-player`);
        const video = elementEmerge(`video`, player, false).then((x) => trace('自动刷新崩溃直播间 video', x));
        const endingPanel = elementEmerge(`.web-player-ending-panel`, player, false).then((x) => trace('自动刷新崩溃直播间 ending_panel', x));
        const errorPanel = elementEmerge(`.web-player-error-panel`, player, false).then((x) => trace('自动刷新崩溃直播间 error_panel', x));
        const last = await Promise.race([video, endingPanel, errorPanel]);
        if (last.tagName === 'VIDEO') ;
        else if (last.classList.contains('web-player-error-panel')) {
            location.reload();
        }
    }

    function 直播间 () {
        关注栏尺寸();
        直播间标题();
        直播间留言者显示粉丝数();
        通用表情框尺寸修复();
        直播间$1();
        自动刷新崩溃直播间();
    }

    function 直播主页 () {
        关注栏尺寸();
    }

    async function 分离视频类型 () {
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
  `);
        const listTabs = await elementEmerge(`.bili-dyn-list-tabs`);
        const cmbUpload = document.createElement('input');
        cmbUpload.setAttribute('type', 'checkbox');
        cmbUpload.setAttribute('id', 'qfb_upload');
        cmbUpload.checked = true;
        listTabs.before(cmbUpload);
        const cmbLiveReplay = document.createElement('input');
        cmbLiveReplay.setAttribute('type', 'checkbox');
        cmbLiveReplay.setAttribute('id', 'qfb_live_replay');
        cmbLiveReplay.checked = true;
        listTabs.before(cmbLiveReplay);
        const listTabsUpload = await elementEmerge(`.bili-dyn-list-tabs__item:nth-child(2)`, listTabs);
        const subSelect = document.createElement('div');
        subSelect.classList.add('bili-dyn-list-tabs');
        subSelect.classList.add('qfb__subselect_list');
        subSelect.innerHTML = `
  <div class="bili-dyn-list-tabs__list">
    <label class="bili-dyn-list-tabs__item qfb_upload" for="qfb_upload">
      投稿视频
    </label>
    <label class="bili-dyn-list-tabs__item qfb_live_replay" for="qfb_live_replay">
      直播回放
    </label>
  </div>
  `;
        listTabs.after(subSelect);
        attrChange({
            node: listTabsUpload,
            attributeFilter: ['class'],
            callback: () => {
                if (listTabsUpload.classList.contains('active')) {
                    subSelect.style.display = 'flex';
                }
                else {
                    subSelect.style.display = 'none';
                }
            },
            once: false,
        });
        listTabs.addEventListener('click', (e) => {
            listTabsUpload.classList.contains('');
            if (e.target === listTabsUpload) {
                subSelect.style.display = 'flex';
            }
            else {
                subSelect.style.display = 'none';
            }
        });
        const dynList = await elementEmerge(`.bili-dyn-list__items`);
        launchObserver({
            parentNode: dynList,
            selector: `.bili-dyn-list__item`,
            successCallback: ({ selectAll }) => {
                for (const div of selectAll()) {
                    if (div.classList.contains('processed'))
                        continue;
                    const type = div.getElementsByClassName(`bili-dyn-card-video__badge`)[0]?.textContent.trim();
                    switch (type) {
                        case '直播回放':
                            div.classList.add('qfb_live_replay');
                            break;
                        case '合作视频':
                        case '投稿视频':
                            div.classList.add('qfb_upload');
                            break;
                    }
                    div.classList.add('processed');
                }
            },
            config: {
                childList: true,
            },
        });
    }

    async function 动态首页联合投稿具名 () {
        const record = recordDynamicFeed({ type: 'video' });
        launchObserver({
            parentNode: document.body,
            selector: `.bili-dyn-item`,
            successCallback: async ({ selectAll }) => {
                for (const dynItem of selectAll()) {
                    if (dynItem.dataset.qfb_expanded_did === 'processing') {
                        return;
                    }
                    if (dynItem.dataset.qfb_expanded_did && !dynItem.querySelector(`.bili-dyn-item-fold`)) {
                        dynItem.dataset.qfb_expanded_did = 'processing';
                        const dyn = await record.getByDynamicID(dynItem.querySelector(`.bili-dyn-card-video`).getAttribute('dyn-id'));
                        const timediv = dynItem.querySelector(`.bili-dyn-time`);
                        timediv.innerHTML = `${dyn.modules.module_author.pub_time} · ${dyn.modules.module_author.pub_action}`;
                        delete dynItem.dataset.qfb_expanded_did;
                    }
                    else if (!dynItem.dataset.qfb_expanded_did && dynItem.querySelector(`.bili-dyn-item-fold`)) {
                        dynItem.dataset.qfb_expanded_did = 'processing';
                        const dyn = await record.getByDynamicID(dynItem.querySelector(`.bili-dyn-card-video`).getAttribute('dyn-id'));
                        const timediv = dynItem.querySelector(`.bili-dyn-time`);
                        if (!dyn.modules.module_fold)
                            return;
                        const description = (await Promise.all(dyn.modules.module_fold.ids.map((did) => record.getByDynamicID(did))))
                            .map((dyn) => `<a href="${dyn.modules.module_author.jump_url}">${dyn.modules.module_author.name}</a>`)
                            .join(`、`);
                        timediv.innerHTML = `${dyn.modules.module_author.pub_time} · 与${description}联合创作`;
                        dynItem.dataset.qfb_expanded_did = dyn.id_str;
                    }
                }
            },
            stopWhenSuccess: false,
        });
    }

    function 动态页面 () {
        动态页面$1();
        动态首页联合投稿具名();
        分离视频类型();
    }

    function 空间 () {
        空间$1();
    }

    function 标签动态流 () {
        标签动态流$1();
    }

    if (location.host === 'live.bilibili.com') {
        if (location.pathname === '/') {
            直播主页();
        }
        else if (location.pathname === '/p/eden/area-tags') {
            分区();
        }
        else if (/^(?:\/blanc)?\/(\d+)$/.exec(location.pathname) && $(`.app-body`)) {
            直播间();
        }
        else ;
    }
    else if (location.host === 'space.bilibili.com') {
        空间();
    }
    else if (location.host === 't.bilibili.com') {
        if (/\/topic\/name\/[^/]+\/feed/.exec(location.pathname)) {
            标签动态流();
        }
        else {
            动态页面();
        }
    }
    else ;

})();
