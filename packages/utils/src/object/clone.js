import {
  isArray, isObject, isDate, isRegExp, isFunction, isPromise
} from '../base/index.js'
import { pick } from '../object/index.js'

export function clone(arg, options) {
  const {
    shallow = false,
    enumerable = true,
    descriptors = !enumerable,
    transferables = null,
    processValue = null
  } = isFunction(options)
    ? { processValue: options } // TODO: `callback` deprecated in December 2022.
    : options || {}

  const handleValue = value => shallow || transferables?.includes(value)
    ? value
    : clone(value, options)

  let copy = arg
  if (isDate(arg)) {
    copy = new arg.constructor(+arg)
  } else if (isRegExp(arg)) {
    copy = new arg.constructor(arg)
  } else if (isArray(arg)) {
    copy = new arg.constructor(arg.length)
    for (let i = 0, l = arg.length; i < l; i++) {
      copy[i] = handleValue(arg[i])
    }
  } else if (isObject(arg)) {
    // Rely on arg.clone() if it exists and assume it creates an actual clone.
    if (isFunction(arg.clone)) {
      copy = arg.clone(options)
    } else if (isPromise(arg)) {
      // https://stackoverflow.com/questions/37063293/can-i-clone-a-promise
      copy = arg.then()
    } else {
      // Prevent calling the actual constructor since it is not guaranteed to
      // work as intended here, and only clone the non-inherited own properties.
      copy = Object.create(Object.getPrototypeOf(arg))
      const keys = enumerable ? Object.keys(arg) : Reflect.ownKeys(arg)
      for (const key of keys) {
        if (descriptors) {
          const desc = Reflect.getOwnPropertyDescriptor(arg, key)
          if (desc.value != null) {
            desc.value = handleValue(desc.value)
          }
          Reflect.defineProperty(copy, key, desc)
        } else {
          copy[key] = handleValue(arg[key])
        }
      }
    }
  }
  return pick(processValue?.(copy), copy)
}
