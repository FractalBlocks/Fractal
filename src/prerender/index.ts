// Initial draft for static pages
import fs = require('fs')
import _toHTML = require('../toHTML')
import { Component } from '../core/core'
import { Module } from '../core/module'

export const toHTML: any = _toHTML

export interface PrerenderOptions {
  root: Component<any>
  runModule: {
    (root: Component<any>, DEV: boolean, cb?): Module
  }
  template: string
  cb: {
    (html: string): void
  }
  globalStyles?: string
  auxJS?: string
  DEV?: boolean
}

export const prerender = ({ root, runModule, DEV, template, globalStyles, auxJS, cb }: PrerenderOptions): void => {
  let app = runModule(root, DEV, appView => {
    let styleStr = (globalStyles || '') + app.rootCtx.groupHandlers['style'].state.instance.getStyles()
    let html = template.replace('<!--##APP##-->', toHTML(appView))
    html = html.replace('<!--##STYLES##-->', '<style>' + styleStr + '</style>')
    html = auxJS ? html.replace('<!--##AUXJS##-->', '<script>' + auxJS + '</script>') : html
    cb(html)
  })
}

export interface BuildAotOptions {
  root: Component<any>
  runModule: {
    (root: Component<any>, DEV: boolean, cb?): Module
  }
  templateFile: string
  outputFile: string
  globalStylesFile?: string
  auxJSFile?: string
  DEV?: boolean
}

export function buildAot ({
  root,
  runModule,
  templateFile,
  outputFile,
  globalStylesFile,
  auxJSFile,
  DEV,
}: BuildAotOptions) {
  try {
    const template = fs.readFileSync(templateFile, 'utf8')
    const globalStyles = globalStylesFile ? fs.readFileSync(globalStylesFile, 'utf8') : undefined
    const auxJS = auxJSFile ? fs.readFileSync(auxJSFile, 'utf8') : undefined
    prerender({
      root,
      runModule,
      template,
      globalStyles,
      auxJS,
      DEV,
      cb: html => {
        fs.unlinkSync(outputFile)
        fs.writeFileSync(outputFile, html, { flag: 'wx' })
        console.log('Guardado en archivo ' + outputFile)
      },
    })
  } catch (err) {
    return console.log(err)
  }
}
