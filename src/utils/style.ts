import { types, getStyles as _getStyles } from 'typestyle'
import { TypeStyle } from 'typestyle/lib/internal/typestyle'

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

export function styleGroup (instance: TypeStyle, stylesObj: StyleGroup, moduleName: string): StyleClasses {
  let classes = {}
  for (let key in stylesObj) {
    classes[key] = instance.style(stylesObj[key], { $debugName: `${moduleName}_${key}__` })
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

export function mergeStyles (group1: StyleGroup, group2: StyleGroup): StyleGroup {
  let mergedGroup: StyleGroup = { base: {} }
  for(let i = 0, keys = Object.keys(group1), len = keys.length; i < len; i++) {
    mergedGroup[keys[i]] = group1[keys[i]]
  }
  for(let i = 0, keys = Object.keys(group2), len = keys.length; i < len; i++) {
    if (mergedGroup[keys[i]] && typeof mergedGroup[keys[i]] === 'object') {
      mergedGroup[keys[i]] = Object.assign({}, mergedGroup[keys[i]], group2[keys[i]])
    } else {
      mergedGroup[keys[i]] = group2[keys[i]]
    }
  }
  return mergedGroup
}

export const placeholderColor = (color: string) => ({
  '&::-webkit-input-placeholder': { /* Chrome/Opera/Safari */
    $unique: true,
    color: color,
  },
  '&::-moz-placeholder': { /* Firefox 19+ */
    $unique: true,
    color: color,
  },
  '&:-ms-input-placeholder': { /* IE 10+ */
    $unique: true,
    color: color,
  },
})

export const absoluteCenter = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
