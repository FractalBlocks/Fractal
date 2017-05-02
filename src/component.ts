import {
  Actions,
  Update,
  Component,
  Context,
  InputData,
  HandlerMsg,
  interfaceOf,
  Group,
  ev,
  execute,
  Module,
  Executable,
  propagate,
} from './core'

// set of helpers for building components

// generic action
export const action = (actions: Actions<any>) => ([arg1, arg2]: any): Update<any> => {
  let name
  let value
  if (arg1 instanceof Array) {
    name = arg1[0]
    value = arg1[1]
    if (arg2 !== undefined) {
      // add fetch value
      value = [value, arg2]
    }
  } else {
    name = arg1
    value = arg2
  }
  return actions[name](value) // generic action dispatcher
}

// generic action dispatcher
export const act = (ctx: Context, context?: any, param?: any): InputData => {
  return ev(ctx, 'action', context, param)
}

// extract view interface, sintax sugar
export function vw (ctx: Context, componentName: string): HandlerMsg {
  return interfaceOf(ctx, componentName, 'view')
}

// --- Message interchange between components

// send a message to an input of a component from outside a Module
/* istanbul ignore next */
export function sendMsg (mod: Module, id: string, inputName: string, msg?, isPropagated = true) {
  let ctx = mod.ctx
  let inputResult = <Executable<any> | Executable<any>[]> ctx.components[id].inputs[inputName](msg)
  execute(ctx.components[id].ctx, inputResult)
  if (isPropagated) {
    propagate(ctx.components[id].ctx, ctx.components[id], inputName, msg)
  }
}

// send a message to an input of a component from its parent
/* istanbul ignore next */
export function toChild (ctx: Context, name: string, inputName: string, msg = undefined, isPropagated = true) {
  let childId = ctx.id + '$' + name
  let input = ctx.components[childId].inputs[inputName]
  if (!input) {
    return ctx.error(
      'toChild',
      `there are no '${inputName}' input in '${childId}' as expected by '${ctx.id}'`
    )
  }
  let inputResult = <Executable<any> | Executable<any>[]> input(msg)
  execute(ctx.components[childId].ctx, inputResult)
  if (isPropagated) {
    propagate(ctx.components[childId].ctx, ctx.components[childId], inputName, msg)
  }
}

// send a message to an input of a component from its child
/* istanbul ignore next */
export function toParent (ctx: Context, outputName: string, msg = undefined, unique = false, isPropagated = true) {
  let outMsg
  let parts = (ctx.id + '').split('$')
  if (parts.length === 1) {
    return
  }
  let inputParent
  let name = parts.splice(parts.length - 1, 1)[0]
  let parentId = parts.join('$')
  if (unique) {
    inputParent = `$$${ctx.components[ctx.id].def.name}_${outputName}`
    outMsg = [name, msg]
  } else {
    inputParent = `$${name}_${outputName}`
    outMsg = msg
  }
  let input = ctx.components[parentId].inputs[inputParent]
  if (!input) {
    return ctx.error(
      'toParent',
      `there are no '${inputParent}' input in parent '${parentId}' as expected by '${ctx.id}'`
    )
  }
  let inputResult = <Executable<any> | Executable<any>[]> input(outMsg)
  execute(ctx.components[parentId].ctx, inputResult)
  if (isPropagated) {
    propagate(ctx.components[parentId].ctx, ctx.components[parentId], inputParent, outMsg)
  }
}

// send a message to an input of a component from its child
/* istanbul ignore next */
export function toIt (ctx: Context, inputName: string, msg?, isPropagated = true) {
  let id = ctx.id
  let input = ctx.components[id].inputs[inputName]
  if (!input) {
    return ctx.error(
      'toIt',
      `there are no '${inputName}' input in '${id}' as expected by itself`
    )
  }
  let inputResult = <Executable<any> | Executable<any>[]> input(msg)
  execute(ctx.components[id].ctx, inputResult)
  if (isPropagated) {
    propagate(ctx.components[id].ctx, ctx.components[id], inputName, inputResult)
  }
}

// ---

// make a new component from another merging her state
export function props (state) {
  return function (comp: Component<any>): Component<any> {
    if (comp.state !== null && typeof comp.state === 'object'
    && state !== null && typeof state === 'object') {
      comp.state = Object.assign(comp.state, state)
    } else {
      comp.state = state
    }
    return comp
  }
}

export function setGroup (name: string, group: Group) {
  return function (comp: Component<any>): Component<any> {
    comp.groups[name] = group
    return comp
  }
}

export function stateOf (ctx: Context, name?: string): any {
  let id = name ? ctx.id + '$' + name : ctx.id
  let space = ctx.components[id]
  if (space) {
    return space.state
  } else {
    ctx.error('stateOf',
      name
      ? `there are no child '${name}' in space '${ctx.id}'`
      : `there are no space '${id}'`
    )
  }
}

export function spaceOf (ctx: Context): any {
  return ctx.components[ctx.id]
}
