export { deepmerge } from './deepmerge'
import { style as typeStyle, types, getStyles as _getStyles } from 'typestyle'

export const getStyles = _getStyles

export interface StyleClasses {
  base: string
  [className: string]: string
}

export interface StyleGroup {
  base: types.NestedCSSProperties
  [className: string]: types.NestedCSSProperties
}

export interface ComponentGroups {
  [className: string]: StyleGroup
}

export function styleGroup (stylesObj: StyleGroup, moduleName: string): StyleClasses {
  let classes = {}
  for (let key in stylesObj) {
    classes[key] = typeStyle(stylesObj[key], { $debugName: `${moduleName}_${key}__` })
  }
  return <StyleClasses> classes
}

export function hasBaseObject (obj: Object): boolean {
  for (let key in obj) {
    if (obj[key] !== null && typeof obj[key] === 'object' && key == 'base') {
      return true
    }
  }
  return false
}

// function for ngClass with one dynamic property
export function c(className: string, condition: boolean): any {
  return {
    [className]: condition,
  }
}

// function for ngClass with many dynamic properties
export function cs() {
  let obj = {}
  if (arguments.length % 2 !== 0) {
    throw 'Error CS function should have an even number of arguments'
  }
  for (let i = 0, len = arguments.length; i < len; i += 2) {
    obj[arguments[i]] = arguments[i + 1]
  }
  return obj
}
