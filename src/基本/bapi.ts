import { timedLRU1 } from './cache'

type UID = number | string

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

interface Data {
  card: Card
  following: boolean
  archive_count: number
  article_count: number
  follower: number
  like_num: number
}

type Response = { code: 0; data: Data } | { code: -404; message: string }

export const getCard = timedLRU1(async (uid: UID) => {
  const json: Response = await (
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
})

export const getFansCount = async (uid: UID) => {
  return (await getCard(uid)).card.fans
}

export const getSexTag = async (uid: UID) => {
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

export const infoLine = async (uid: UID) => {
  return `${await getSexTag(uid)} ${await getFansCount(uid)}★ `
}
