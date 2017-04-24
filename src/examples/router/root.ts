import { Actions, Inputs, Components, Hook, ev, _ } from '../../core'
import { StyleGroup } from '../../style'
import { View } from '../../interfaces/view'
import { vw, toChild, action } from '../../component'
import h from 'snabbdom/h'
import { palette } from './constants'

let emailDB = {
  '12323ewrd': { title: 'hello friend', content: 'hello firend, I want to ...', sender: 'Carlos Galarza', date: '12/12/2017' },
  '213dfe345': { title: 'bussines news', content: 'hello Carlos', sender: 'Bill Gates', date: '12/12/2017' },
  '324rsdfr4': { title: 'bussines purpose', content: 'hello my dear friend', sender: 'Elon Musk', date: '12/12/2017' },
  'sdsdf546tfg': { title: 'future...', content: 'hello future ...', sender: 'Alan Kay', date: '12/12/2017' },
}

import * as SideMenu from './sideMenu'
import * as EmailList from './emailList'
import * as Email from './email'

export const name = 'Root'

export const components: Components = {
  SideMenu,
  EmailList,
  Email,
}

export const state = {
  view: 'EmailList', // 'EmailList' | 'Email' | 'NotFound'
  emailId: '',
}

export type S = typeof state

export const init: Hook = ctx => {
  toChild(ctx, 'EmailList', 'action', ['SetEmails', emailDB])
}

export const inputs: Inputs<S> = ctx => ({
  action: action(actions),
  $EmailList_select: emailId => {
    let email = emailDB[emailId] !== undefined
      ? emailDB[emailId]
      : { title: 'Not Found', content: 'Email Not Found', sender: 'Sparky the invisible man', date: 'unknown' }
    toChild(ctx, 'Email', 'action', ['Set', email])
    return actions.SetView(['Email', emailId])
  },
  $Email_back: () => {
    return actions.SetView(['EmailList', ''])
  },
})

const actions: Actions<S> = {
  SetView: ([value, id]) => s => {
    s.view = value
    s.emailId = id !== undefined ? id : s.emailId
    return s
  },
}

const view: View<S> = (ctx, s) => {
  let style = ctx.groups.style

  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
  }, [
    vw(ctx, 'SideMenu'),
    vw(ctx, s.view),
  ])
}

export interface Routes<S> {
  (ctx, s: S): {
    [regExp: string]: any
  }
}

const routes: Routes<S> = (ctx, s) => ({
  _: '/' + s.emailId,
  '/': ev(ctx, 'action', ['SetView', ['EmailList']]),
  '/:id': ev(ctx, '$EmailList_select', _, ['params', 'id']),
})

export const interfaces = { view, routes }

const style: StyleGroup = {
  base: {
    width: '100%',
    height: '100%',
    padding: '20px',
    display: 'flex',
    overflow: 'auto',
    color: palette.text,
    fontFamily: 'sans-serif',
  },
}

export const groups = { style }
