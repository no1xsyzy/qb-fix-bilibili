import { cacheStorageFactory, timedLRU } from '../cache'
import { localStorage_CacheStorageFactory } from '../localStorageCache'
import type { UserID, Response } from './index'

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

export const getCard = timedLRU<UserID, CardData>(
  async (uid: UserID) => {
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
    cacheStorageFactory: localStorage_CacheStorageFactory as cacheStorageFactory<UserID, CardData>,
  },
)

export const getFansCount = async (uid: UserID) => {
  return (await getCard(uid)).card.fans
}

export const getSexTag = async (uid: UserID) => {
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

export const infoLine = async (uid: UserID) => {
  return `${await getSexTag(uid)} ${await getFansCount(uid)}★ `
}
