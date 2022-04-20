export function trace<T>(description: string, center: T): T {
  console.debug(description, center)
  return center
}
