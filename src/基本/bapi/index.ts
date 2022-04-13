export type Response<T> = { code: 0; data: T; message: '' } | { code: number; message: string; data: null }

export type UserID = number | string
export type RoomID = number | string

export { getCard, getFansCount, getSexTag } from './getCard'
export { getInfoByRoom, getRoomFollowers } from './getInfoByRoom'
export { getDynamicFeed } from './getDynamicFeed'
