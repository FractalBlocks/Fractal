import { VNode, VNodeData } from './vnode'
export declare function h(sel: string): VNode
export declare function h(sel: string, data: VNodeData): VNode
export declare function h(sel: string, text: string): VNode
export declare function h(sel: string, children: Array<VNode | undefined | null>): VNode
export declare function h(sel: string, data: VNodeData, text: string): VNode
export declare function h(sel: string, data: VNodeData, children: Array<VNode | undefined | null>): VNode
export default h
