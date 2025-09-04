const oldFetch = unsafeWindow.fetch

type FetchLike = (input: Request) => Promise<Response>
type BeforeLike = (input: Request) => Request
type AfterLike = (response: Promise<Response>) => Promise<Response>
type WrapLike = (fetch: FetchLike, input: Request) => Promise<Response>

type Middleware =
  | { type: 'before'; func: BeforeLike }
  | { type: 'after'; func: AfterLike }
  | { type: 'wrap'; func: WrapLike }

const middlewares: Middleware[] = []

unsafeWindow.fetch = function (input: RequestInfo, init: RequestInit = {}) {
  const request = new Request(input, init)
  return processFetchWithMiddlewares(middlewares)(request)
}

const processFetchWithMiddlewares = function (middlewares: Middleware[]): FetchLike {
  if (middlewares.length === 0) {
    return oldFetch
  }
  const [head, ...tail] = middlewares
  const next = processFetchWithMiddlewares(tail)
  switch (head.type) {
    case 'before':
      return (input: Request) => next(head.func(input))
    case 'after':
      return (input: Request) => head.func(next(input))
    case 'wrap':
      return (input: Request) => head.func(next, input)
  }
}

export function hijack(m: Middleware) {
  middlewares.push(m)
}
