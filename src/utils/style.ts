import { types, getStyles as _getStyles } from 'typestyle'
import { TypeStyle } from 'typestyle/lib/internal/typestyle'
import { deepmerge } from './fun'
import { h } from '../interfaces/view/index'
import { VNode } from '../interfaces/view/vnode'

export type CSS = types.NestedCSSProperties

export const getStyles = _getStyles

export interface StyleClasses {
  base: string
  [className: string]: string
}

export interface StyleGroup {
  base: CSS
  [className: string]: CSS
}

export interface ComponentGroups {
  [className: string]: StyleGroup
}

/* istanbul ignore next */
export function styleGroup (instance: TypeStyle, stylesObj: StyleGroup, moduleName: string): StyleClasses {
  let classes = {}
  for (let key in stylesObj) {
    if (moduleName !== undefined) {
      classes[key] = instance.style(stylesObj[key], { $debugName: `_${moduleName}_${key}__` })
    } else {
      classes[key] = instance.style(stylesObj[key])
    }
  }
  return <StyleClasses> classes
}

/* istanbul ignore next */
export function hasBaseObject (obj: Object): boolean {
  for (let key in obj) {
    if (obj[key] !== null && typeof obj[key] === 'object' && key == 'base') {
      return true
    }
  }
  return false
}

// function for ngClass with one dynamic property
/* istanbul ignore next */
export function c(className: string, condition: boolean): any {
  return {
    [className]: condition,
  }
}

/* istanbul ignore next */
export function mergeStyles (group1: StyleGroup, group2: StyleGroup): StyleGroup {
  let mergedGroup: StyleGroup = { base: {} }
  for(let i = 0, keys = Object.keys(group1), len = keys.length; i < len; i++) {
    mergedGroup[keys[i]] = group1[keys[i]]
  }
  for(let i = 0, keys = Object.keys(group2), len = keys.length; i < len; i++) {
    if (mergedGroup[keys[i]] && typeof mergedGroup[keys[i]] === 'object') {
      mergedGroup[keys[i]] = deepmerge(mergedGroup[keys[i]], group2[keys[i]])
    } else {
      mergedGroup[keys[i]] = group2[keys[i]]
    }
  }
  return mergedGroup
}

/* istanbul ignore next */
export const placeholderColor = (color: string): CSS => ({
  $nest: {
    '&::-webkit-input-placeholder': { /* Chrome/Opera/Safari */
      $unique: true,
      color: color,
    },
    '&::-moz-placeholder': { /* Firefox */
      $unique: true,
      color: color,
      opacity: 1,
    },
    '&:-ms-input-placeholder': { /* IE 10+ */
      $unique: true,
      color: color,
    },
  },
})

export const absoluteCenter: CSS = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export const clickable: CSS = {
  cursor: 'pointer',
  userSelect: 'none',
  '-moz-user-select': 'none',
}

export const obfuscator: CSS = {
  position: 'absolute',
  top: '0px',
  left: '0px',
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'none',
}

/* istanbul ignore next */
export const iconView = (iconName, options = {}): VNode => h('svg', deepmerge({class: {['svg_' + iconName]: true}}, options), [
  h('use', {attrs: { 'xlink:href': 'assets/icons-bundle.min.svg#' + iconName }}),
])
