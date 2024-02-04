declare function GM_addStyle(a: string): void
declare function GM_notification(
  options: {
    text: string
    title?: string
    tag?: string
    image?: string
    highlight?: bool
    silent?: bool
    timeout?: number
    url?: string
    onclick?: () => void
    ondone?: () => void
  },
  ondone?: () => void,
): void

var unsafeWindow = window

type JsonPrimitive = string | number | boolean | null
type JsonMap = {
  [key: string]: JsonPrimitive | JsonMap | JsonArray
}
type JsonArray = Array<JsonPrimitive | JsonMap | JsonArray>
type Json = JsonPrimitive | JsonMap | JsonArray
