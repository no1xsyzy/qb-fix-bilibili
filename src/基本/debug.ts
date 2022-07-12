export function trace<T>(description: string, center: T): T {
  console.debug(description, center)
  return center
}

export function timeit(): () => number {
  const start = +new Date()

  return function () {
    return +new Date() - start
  }
}

interface Timeit {
  ping(): void
  trace<T>(d: string, center: T): T
  out(): void
}

export function boundaryTimeit(fn: string): Timeit {
  const t = timeit()
  console.debug(`${fn} in`)

  return {
    ping() {
      console.debug(`${fn} ping ${t()}ms`)
    },
    trace(d, center) {
      console.debug(`${fn} ping ${t()}ms & trace ${d}`, center)
      return center
    },
    out() {
      console.debug(`${fn} ping ${t()}ms & out`)
    },
  }
}
