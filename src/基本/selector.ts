import { trace } from './debug'

export const $ = (x: string): HTMLElement => document.querySelector(x)
export const $$ = (x: string): Element[] => Array.from(document.querySelectorAll(x))

export function betterSelector<T extends HTMLElement>(
  parentNode: HTMLElement | Document,
  selector: string,
): { select(): T; selectAll(): T[] } {
  // `.class-name`
  const className = /^\.([\w_-]+)$/.exec(selector)
  if (className) {
    return {
      select: () =>
        trace(`betterSelector("${selector}").select#class`, parentNode.getElementsByClassName(className[1])[0] as T),
      selectAll: () =>
        trace(
          `betterSelector("${selector}").selectAll#class`,
          Array.from(parentNode.getElementsByClassName(className[1])) as T[],
        ),
    }
  }

  // `#id`
  const elementID = /^#([\w_-]+)$/.exec(selector)
  if (elementID) {
    return {
      select: () =>
        trace(`betterSelector("${selector}").select#id=${elementID[1]}`, document.getElementById(elementID[1]) as T),
      selectAll: () =>
        trace(`betterSelector("${selector}").selectAll#id=${elementID[1]}`, [
          document.getElementById(elementID[1]) as T,
        ]),
    }
  }

  // `tag-name`
  const tagName = /^([\w_-]+)$/.exec(selector)
  if (tagName) {
    return {
      select: () =>
        trace(`betterSelector("${selector}").select#tag`, parentNode.getElementsByTagName(tagName[1])[0] as T),
      selectAll: () =>
        trace(
          `betterSelector("${selector}").selectAll#tag`,
          Array.from(parentNode.getElementsByTagName(tagName[1])) as T[],
        ),
    }
  }

  // otherwise
  return {
    select: () => trace(`betterSelector("${selector}").select#qs`, parentNode.querySelector(selector)),
    selectAll: () =>
      trace(`betterSelector("${selector}").selectAll#qs`, Array.from(parentNode.querySelectorAll(selector))),
  }
}
