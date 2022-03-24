declare function GM_addStyle(a: string): void

type JsonPrimitive = string | number | boolean | null
type JsonMap = {
  [key: string]: JsonPrimitive | JsonMap | JsonArray
}
type JsonArray = Array<JsonPrimitive | JsonMap | JsonArray>
type Json = JsonPrimitive | JsonMap | JsonArray
