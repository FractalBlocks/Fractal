import { Hooks } from 'snabbdom/hooks'
import { AttachData } from 'snabbdom/helpers/attachto'
import { VNodeStyle } from 'snabbdom/modules/style'
import { On } from './eventListeners'
import { OnGlobal } from './globalListeners'
import { Attrs } from 'snabbdom/modules/attributes'
import { Classes } from 'snabbdom/modules/class'
import { Props } from 'snabbdom/modules/props'
import { Dataset } from 'snabbdom/modules/dataset'
import { Hero } from 'snabbdom/modules/hero'

export declare type Key = string | number

export interface VNode {
    sel: string | undefined
    data: VNodeData | undefined
    children: Array<VNode | string> | undefined
    elm: Node | undefined
    text: string | undefined
    key: Key
}

export interface VNodeData {
    props?: Props
    attrs?: Attrs
    class?: Classes
    style?: VNodeStyle
    dataset?: Dataset
    on?: On
    global?: OnGlobal
    hero?: Hero
    attachData?: AttachData
    hook?: Hooks
    key?: Key
    ns?: string
    fn?: () => VNode
    args?: Array<any>
    [key: string]: any
}

export function vnode(sel: string | undefined,
                      data: any | undefined,
                      children: Array<VNode | string> | undefined,
                      text: string | undefined,
                      elm: Element | Text | undefined): VNode {
  let key = data === undefined ? undefined : data.key;
  return {sel: sel, data: data, children: children,
          text: text, elm: elm, key: key};
}

export default vnode
