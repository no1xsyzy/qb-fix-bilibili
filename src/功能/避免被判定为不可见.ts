export default function () {
  Object.defineProperty(document, 'visibilityState', {
    value: 'visible',
    writable: false,
  })
}
