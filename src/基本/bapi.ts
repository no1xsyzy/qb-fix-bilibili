import { cacheStorageFactory, timedLRU } from './cache'
import { localStorage_CacheStorageFactory } from './localStorageCache'

type numstring = number | string

interface Card {
  mid: string
  name: string
  sex: '男' | '女' | '保密'
  rank: string
  face: string
  sign: string
  fans: number
  friend: number
  attention: number
  Official: { role: number; title: string; desc: string; type: number }
  official_verify: { desc: string; type: number }
}

interface CardData {
  card: Card
  following: boolean
  archive_count: number
  article_count: number
  follower: number
  like_num: number
}

interface RelationInfo {
  attention: number
}

interface AnchorInfo {
  relation_info: RelationInfo
}

interface RoomInfoData {
  anchor_info: AnchorInfo
}

type Response<T> = { code: 0; data: T; message: '' } | { code: number; message: string; data: null }

export const getCard = timedLRU<numstring, CardData>(
  async (uid: numstring) => {
    const json: Response<CardData> = await (
      await fetch(`https://api.bilibili.com/x/web-interface/card?mid=${uid}`, {
        // credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
        method: 'GET',
        mode: 'cors',
      })
    ).json()
    if (json.code === 0) {
      return json.data
    } else {
      throw json.message
    }
  },
  {
    id: 'getCard',
    ttl: 86400 * 1000,
    cacheStorageFactory: localStorage_CacheStorageFactory as cacheStorageFactory<numstring, CardData>,
  },
)

export const getFansCount = async (uid: numstring) => {
  return (await getCard(uid)).card.fans
}

export const getSexTag = async (uid: numstring) => {
  const sex = (await getCard(uid)).card.sex
  switch (sex) {
    case '男':
      return '♂'
    case '女':
      return '♀'
    default:
      return '〼'
  }
}

export const infoLine = async (uid: numstring) => {
  return `${await getSexTag(uid)} ${await getFansCount(uid)}★ `
}

export const getInfoByRoom = timedLRU<numstring, RoomInfoData>(
  async (roomid: numstring) => {
    const json: Response<RoomInfoData> = await (
      await fetch(`https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=${roomid}`, {
        // credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
        method: 'GET',
        mode: 'cors',
      })
    ).json()
    if (json.code === 0) {
      return json.data
    } else {
      throw json.message
    }
  },
  {
    id: 'getInfoByRoom',
    ttl: 86400 * 1000,
    cacheStorageFactory: localStorage_CacheStorageFactory as cacheStorageFactory<numstring, RoomInfoData>,
  },
)

export const getRoomFollowers = async (roomid: numstring) => {
  return (await getInfoByRoom(roomid)).anchor_info.relation_info.attention
}

export const followersTextClass = (followers: number): [string, string] => {
  if (followers > 1e6) {
    return [`${Math.round(followers / 1e5) / 10}m★`, 'followers-m']
  } else if (followers > 1e3) {
    return [`${Math.round(followers / 1e2) / 10}k★`, 'followers-k']
  } else {
    return [`${followers}★`, '']
  }
}
