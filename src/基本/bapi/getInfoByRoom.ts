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

export const getInfoByRoom = timedLRU<RoomID, RoomInfoData>(
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
    if (json.code === 0) {
      return json.data
    } else {
      throw json.message
    }
  },
  {
    id: 'getInfoByRoom',
    ttl: 86400 * 1000,
    cacheStorageFactory: localStorageCacheStorageFactory as cacheStorageFactory<RoomID, RoomInfoData>,
  },
)

export const getRoomFollowers = async (roomid: RoomID) => {
  return (await getInfoByRoom(roomid)).anchor_info.relation_info.attention
}
