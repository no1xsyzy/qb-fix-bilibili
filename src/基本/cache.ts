export interface cacheStorage<K, V> {
  get(key: K): [number, V]
  set(k: K, t: number, v: V): void
  cleanup(ttl: number, now: number): void
}

export type cacheStorageFactory<K, V> = (id: string) => cacheStorage<K, V>

export interface timedLRUSpec<K, V> {
  id: string
  ttl?: number
  cleanup_interval?: number
  cacheStorageFactory?: cacheStorageFactory<K, V>
}

export interface LRUfunction<K, V> {
  (k: K): V
  cleanup: () => void
}

export function defaultCacheStorageFactory<K, V>(id: string): cacheStorage<K, V> {
  let store: [K, number, V][] = []
  const get = (key: K): [number, V] =>
    store.filter(([k, t, v]) => k === key).map(([k, t, v]) => [t, v] as [number, V])[0] ?? [0, undefined]
  const set = (key: K, time: number, value: V) => {
    const i = store.findIndex(([k, t, v]) => k === key)
    if (i === -1) {
      store.push([key, time, value])
    } else {
      store[i] = [key, time, value]
    }
  }
  const cleanup = (ttl: number, now: number) => {
    store = store.filter(([k, t]) => t + ttl > now)
  }
  return { get, set, cleanup }
}

export function timedLRU<K, V>(
  func: (k: K) => V | Promise<V>,
  {
    id,
    ttl = 10 * 60 * 1000,
    cleanup_interval = 60 * 1000,
    cacheStorageFactory = defaultCacheStorageFactory,
  }: timedLRUSpec<K, V>,
): LRUfunction<K, Promise<V>> {
  const cacheStorage = cacheStorageFactory(id)
  let timeout = null

  const cleanup = () => {
    console.debug(`cleanup timedLRU ${id}`)
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    cacheStorage.cleanup(ttl, new Date().getTime())
    timeout = setTimeout(cleanup, cleanup_interval)
  }

  setTimeout(cleanup, cleanup_interval / 10)

  const wrapped = async (k: K) => {
    const t = new Date().getTime()
    let [_, v] = cacheStorage.get(k)
    if (v === undefined) {
      v = await func(k)
    }
    cacheStorage.set(k, t, v)
    return v
  }

  wrapped.cleanup = cleanup

  return wrapped
}
