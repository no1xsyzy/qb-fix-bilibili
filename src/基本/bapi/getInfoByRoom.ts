import { cacheStorageFactory, timedLRU } from '../cache'
import { localStorageCacheStorageFactory } from '../localStorageCache'
import type { RoomID, Response } from './index'

interface RelationInfo {
  attention: number
}

interface AnchorInfo {
  relation_info: RelationInfo
}

interface RoomInfoData {
  anchor_info: AnchorInfo
}

interface RoomInfoCache {
  followers: number
}

export const getInfoByRoom = timedLRU<RoomID, RoomInfoCache>(
  async (roomid: RoomID) => {
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
    if (json.code !== 0) {
      throw json.message
    }
    const followers = json.data.anchor_info.relation_info.attention
    return { followers }
  },
  {
    id: 'getInfoByRoom',
    version: 2,
    ttl: 86400 * 1000,
    cacheStorageFactory: localStorageCacheStorageFactory as cacheStorageFactory<RoomID, RoomInfoCache>,
  },
)

export const getRoomFollowers = async (roomid: RoomID) => {
  return (await getInfoByRoom(roomid)).followers
}
