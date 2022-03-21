const TTL = 10 * 60 * 1000

export function timedLRU1<K, V>(func: (k: K) => V) {
  const cache = new Map<K, V>()
  let time: [K, number][] = []
  let timeout = null

  const cleanup = () => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    const ts = new Date().getTime()
    const idx = time.findIndex(([a, t]) => t + TTL > ts)
    const drop = time.splice(idx)
    for (const [a] of drop) {
      cache.delete(a)
    }
    timeout = setTimeout(cleanup, 60 * 1000)
  }

  return (a1: K) => {
    const got = cache.get(a1)
    if (got !== undefined) {
      const ts = new Date().getTime()
      time = [[a1, ts], ...time.filter(([a, t]) => a !== a1)]
      cleanup()
      return got
    }
    const val = func(a1)
    const ts = new Date().getTime()
    time = [[a1, ts], ...time]
    cache.set(a1, val)
    return val
  }
}
