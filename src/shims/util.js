// Minimal browser shim for Node's `util.debuglog`
// Exports `debuglog(section)` which returns a logging function.
// In Node, `debuglog` respects NODE_DEBUG; in browser we simply log via console.debug.
export function debuglog(section) {
  return (...args) => {
    try {
      if (typeof console !== 'undefined' && console.debug) {
        console.debug(`[${section}]`, ...args)
      } else if (typeof console !== 'undefined' && console.log) {
        console.log(`[${section}]`, ...args)
      }
    } catch (e) {
      // swallow
    }
  }
}

export default { debuglog }
