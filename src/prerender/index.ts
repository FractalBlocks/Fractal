// Initial draft for static pages
import fs = require('fs')
import toHTML = require('snabbdom-to-html')
import { Module } from '../core/module'

export interface PrerenderOptions {
  app: Module
  template: string
  globalStyles?: string
  auxJS?: string
}

export const prerender = ({ app, template, globalStyles, auxJS }: PrerenderOptions): string => {
  let appView = app.ctx.components[app.ctx.id].interfaceValues['view']
  let styleStr = (globalStyles || '') + app.groupHandlers['style'].state.instance.getStyles()
  let html = template.replace('<!--##APP##-->', toHTML(appView))
  html = html.replace('<!--##STYLES##-->', '<style>' + styleStr + '</style>')
  html = auxJS ? html.replace('<!--##AUXJS##-->', '<script>' + auxJS + '</script>') : html
  return html
}

export interface BuildAotOptions {
  app: Module
  templateFile: string
  outputFile: string
  globalStylesFile?: string
  auxJSFile?: string
}

export function buildAot ({
  app,
  templateFile,
  outputFile,
  globalStylesFile,
  auxJSFile,
}: BuildAotOptions) {
  try {
    const template = fs.readFileSync(templateFile, 'utf8')
    const globalStyles = globalStylesFile ? fs.readFileSync(globalStylesFile, 'utf8') : undefined
    const auxJS = auxJSFile ? fs.readFileSync(auxJSFile, 'utf8') : undefined
    let html = prerender({
      app,
      template,
      globalStyles,
      auxJS,
    })
    fs.unlinkSync(outputFile)
    fs.writeFileSync(outputFile, html, { flag: 'wx' })
    console.log('Guardado en archivo ' + outputFile)
  } catch (err) {
    return console.log(err)
  }
}
