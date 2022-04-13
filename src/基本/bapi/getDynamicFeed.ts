import type { Response } from './index'

type DynamicID = string
type BVID = string

interface DynamicFeedGetSpec {
  timezone?: number
  type?: 'all' | 'video' | 'pgc' | 'article'
}

interface ModuleAuthor {
  name: string
  jump_url: string
  pub_action: string
  pub_time: string
}

interface Archive {
  bvid: string
}

interface MajorArchive {
  archive: Archive
  type: 'MAJOR_TYPE_ARCHIVE'
}

interface ModuleDynamic {
  major: MajorArchive
}

interface ModuleFold {
  ids: DynamicID[]
}

interface Modules {
  module_author?: ModuleAuthor
  module_dynamic?: ModuleDynamic
  module_fold?: ModuleFold
}

interface Dynamic {
  id_str: DynamicID
  modules: Modules
  type: 'DYNAMIC_TYPE_WORD' | 'DYNAMIC_TYPE_AV' | 'DYNAMIC_TYPE_FORWARD' | 'DYNAMIC_TYPE_DRAW' | 'DYNAMIC_TYPE_PGC'
  visible: boolean
}

interface DynamicFeedData {
  items: Dynamic[]
  offset: DynamicID
  has_more: boolean
}

export async function* getDynamicFeed({
  timezone = -480,
  type = 'all',
}: DynamicFeedGetSpec): AsyncGenerator<Dynamic, void, string> {
  let page = 1
  let json: Response<DynamicFeedData> = await (
    await fetch(
      `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all?timezone_offset=${timezone}&type=${type}&page=${page}`,
      {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
        method: 'GET',
        mode: 'cors',
      },
    )
  ).json()
  console.debug('getDynamicFeed():', json)
  if (json.code === 0) {
    for (const item of json.data.items) {
      yield item
    }
  } else {
    throw json.message
  }
  while (json.data.has_more) {
    page += 1
    json = await (
      await fetch(
        `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all?timezone_offset=${timezone}&type=${type}&offset=${json.data.offset}&page=${page}`,
        {
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
          method: 'GET',
          mode: 'cors',
        },
      )
    ).json()
    console.debug('getDynamicFeed():', json)
    if (json.code === 0) {
      for (const item of json.data.items) {
        yield item
      }
    } else {
      throw json.message
    }
  }
}

interface DynamicFeedRecord {
  getByIndex(i: number): Promise<Dynamic | null>
  getByDynamicID(did: DynamicID): Promise<Dynamic | null>
  getByBVID(bvid: BVID): Promise<Dynamic | null>
}

function compareDynamicID(a: DynamicID, b: DynamicID): -1 | 0 | 1 {
  if (a === b) return 0
  if (a.length < b.length) return -1
  if (a.length > b.length) return 1
  if (a < b) return -1
  if (a > b) return 1
}

export function recordDynamicFeed(spec?: DynamicFeedGetSpec): DynamicFeedRecord {
  const registry: Dynamic[] = []
  const gen = getDynamicFeed(spec)

  const extend = async (n = 1): Promise<boolean> => {
    for (let i = 0; i < n; i++) {
      let v
      try {
        v = (await gen.next()).value
        console.debug('recordDynamicFeed(): extend(): v', v)
      } catch (err) {
        console.debug('recordDynamicFeed(): extend(): err', err)
      }
      if (v) {
        registry.push(v)
        console.debug(`recordDynamicFeed(): extend(): ${v.id_str} by ${v.modules.module_author.name}`)
      } else {
        return false
      }
    }
    return true
  }

  const getByIndex = async (i: number): Promise<Dynamic | null> => {
    while (registry.length < i && (await extend())) {}
    if (registry.length > i) {
      return registry[i]
    }
  }

  const lastVisibleDynamic = (): Dynamic | null => {
    for (let i = registry.length - 1; i >= 0; i--) {
      if (registry[i].visible) {
        return registry[i]
      }
    }
    return null
  }

  const getByDynamicID = async (did: DynamicID): Promise<Dynamic | null> => {
    console.debug(`getByDynamicID(${did})`)
    if (!registry.length && !(await extend())) {
      console.debug(`getByDynamicID(${did}): cannot find any dynamic`)
      return null
    }
    do {
      console.debug(`getByDynamicID(${did}): registry:`, JSON.parse(JSON.stringify(registry)))
      if (registry[registry.length - 1].id_str == did) {
        console.debug(`getByDynamicID(${did}): found at ${registry.length - 1}`)
        return registry[registry.length - 1]
      }
      if (compareDynamicID(lastVisibleDynamic().id_str, did) < 0) {
        for (const dyn of registry) {
          if (dyn.id_str == did) {
            console.debug(`getByDynamicID(${did}): found in dones`)
            return dyn
          }
        }
        console.debug(`getByDynamicID(${did}): unfound beyond id`)
        return null
      }
    } while (await extend())
  }

  const getByBVID = async (bvid: BVID): Promise<Dynamic | null> => {
    if (spec.type == 'article') {
      return null
    }
    for (const dyn of registry) {
      if (dyn.modules.module_dynamic.major.archive.bvid === bvid) {
        return dyn
      }
    }
    do {
      if (lastVisibleDynamic()?.modules.module_dynamic.major.archive.bvid === bvid) {
        return lastVisibleDynamic()
      }
    } while (await extend())
    return null
  }

  return { getByIndex, getByDynamicID, getByBVID }
}
