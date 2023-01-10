import type { cacheStorage } from './cache'

export function localStorageCacheStorageFactory<K, V extends Json>(id: string, version: number): cacheStorage<K, V> {
  const get = (key: K): [number, V] =>
    JSON.parse(localStorage.getItem(`cacheStore__${id}__${version}__${key}`)) ?? [0, undefined]
  const set = (key: K, time: number, value: V) => {
    localStorage.setItem(`cacheStore__${id}__${version}__${key}`, JSON.stringify([time, value]))
  }
  const cleanup = (ttl: number, now: number) => {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k.startsWith(`cacheStore__${id}__`)) {
        continue
      }
      if (!k.startsWith(`cacheStore__${id}__${version}__`)) {
        // other version, clean
        console.debug(`cleaning '${k}' because old version of cacheStore`)
      }
      const [t, _]: [number, V] = JSON.parse(localStorage.getItem(k))
      if (t + ttl < now) {
        console.debug(`cleaning '${k}' because ${t} + ${ttl} < ${now}`)
        localStorage.removeItem(k)
      }
    }
  }
  return { get, set, cleanup }
}
