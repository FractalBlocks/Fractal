import { Actions, Inputs, Interfaces, Components, Hook, toChild, action, StyleGroup, _ } from '../../core'
import { View, h } from '../../interfaces/view'
import { palette } from './constants'

let emailDB = {
  '12323ewrd': { title: 'hello friend', content: 'hello firend, I want to ...', sender: 'Carlos Galarza', date: '12/12/2017' },
  '213dfe345': { title: 'bussines news', content: 'hello Carlos', sender: 'Bill Gates', date: '12/12/2017' },
  '324rsdfr4': { title: 'bussines purpose', content: 'hello my dear friend', sender: 'Elon Musk', date: '12/12/2017' },
  'sdsdf546tfg': { title: 'future...', content: 'hello future ...', sender: 'Alan Kay', date: '12/12/2017' },
}

import * as SideMenu from './SideMenu'
import * as EmailList from './EmailList'
import * as Email from './Email'

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
  toChild(ctx)('EmailList', 'action', ['SetEmails', emailDB])
}

export const inputs: Inputs<S> = ({ ctx, toChild }) => ({
  action: action(actions),
  $EmailList_select: emailId => {
    let email = emailDB[emailId] !== undefined
      ? emailDB[emailId]
      : { title: 'Not Found', content: 'Email Not Found', sender: 'Sparky the invisible man', date: 'unknown' }
    toChild('Email', 'action', ['Set', email])
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

const view: View<S> = ({ ctx, vw }) => s => {
  let style = ctx.groups.style

  return h('div', {
    key: ctx.name,
    class: { [style.base]: true },
  }, [
    vw('SideMenu'),
    vw(s.view),
  ])
}

export interface Routes<S> {
  (ctx): {
    (s: S): {
      [regExp: string]: any
    }
  }
}

const routes: Routes<S> = ({ ctx, ev }) => s => ({
  _: '/' + s.emailId,
  '/': ev('action', ['SetView', ['EmailList']]),
  '/:id': ev('$EmailList_select', _, ['params', 'id']),
})

export const interfaces: Interfaces = { view, routes }

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
