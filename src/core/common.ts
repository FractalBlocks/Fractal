import { Context, Actions, Action, performUpdate } from '.'

// generic action input
export const action = <S>(ctx: Context<S>, actions: Actions<any>) => async ([arg1, arg2]: any): Promise<any> => {
  let name
  let value
  if (arg1 instanceof Array) {
    name = arg1[0]
    value = arg1[1]
    if (arg2 !== undefined) {
      // add fetch value
      // TODO: test it!!
      value = (value !== undefined) ? [value, arg2]: arg2
    }
  } else {
    name = arg1
    value = arg2
  }
  if (ctx.global.record) {
    ctx.global.records.push({ id: ctx.id, actionName: name, value })
  }
  let result = await performUpdate(ctx, await actions[name](value))
  return result
}

// generic execute input
export const SetAction: Action<any> = (args): any => s => {
  if (args[0] instanceof Array) {
    // Multiple assignments
    for (let i = 0, arg; arg = args[i]; i++) {
      s[arg[0]] = arg[1]
    }
  } else {
    // Single assignment
    s[args[0]] = args[1]
  }
  return s
}

export const AddComp = (compFn): Action<any> => (compArgs?: any): any => s => {
  let [name, component] = compFn(s._compCounter, compArgs)
  s._nest[name] = component
  s._compCounter++
  s._compUpdated = true
  return s
}

export const _removeAction: Action<any> = (name): any => s => {
  delete s._nest[name]
  s._compUpdated = true
  return s
}
