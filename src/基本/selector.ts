export const $ = (x: string): HTMLElement => document.querySelector(x)
export const $$ = (x: string): Element[] => Array.from(document.querySelectorAll(x))
