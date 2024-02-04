export function define<T>(name: string, defaultValue: T) {
  const v = localStorage.getItem(name)
  if (v === null) {
    localStorage.setItem(name, JSON.stringify(defaultValue))
  }
  return {
    get() {
      return localStorage.getItem(name)
    },
    set(v: T) {
      return localStorage.setItem(name, JSON.stringify(v))
    },
  }
}
