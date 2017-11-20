import { Component, RunModule, Module } from '../core'
import _toHTML from '../toHTML'

export const toHTML = _toHTML

export interface StaticRenderOptions {
  root: Component<any>
  runModule: RunModule
  bundlePaths: string[],
  encoding?: string
  html?: string
  css?: string
  url?: string, // Canonical url
  componentNames?: any, // will be merged client-side
  title?: string
  description?: string
  keywords?: string
  author?: string
  extras?: string
  lang?: string
  isStatic?: boolean // is isS this means there are no need of JS at all
  version?: string
  base?: string // Base URL
  htmlFn? (op: StaticRenderOptions, renderData: RenderData, app: Module) // Replace default template transform function
  cb? (app: Module): Promise<void>
}

export interface RenderData {
  view: any
  style: string
}

export const renderHTML = (op: StaticRenderOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    return (async () => {
      try {
        var app = await op.runModule(op.root, false, { render: false })
        if (op.cb) await op.cb(app)
        let view = await app.rootCtx.components.Root.interfaces['view'](app.rootCtx.components.Root.state)
        let styleStr = (op.css || '') + app.rootCtx.groupHandlers['style'].state.instance.getStyles()
        let renderData =  {
          view,
          style: styleStr,
        }
        let html
        if (op.htmlFn) {
          html = await op.htmlFn(op, renderData, app)
        } else {
          html = await transformHTML(op, renderData, app)
        }
        resolve(html)
      } catch (err) {
        reject(err)
      }
    })()
  })
}

export function transformHTML (op: StaticRenderOptions, renderData: RenderData, app: Module) {
  let html = op.html.replace('<!--##HTML##-->', _toHTML(renderData.view))
  html = html.replace('<!--##STYLES##-->', '<style>' + renderData.style + '</style>')
  html = html.replace('<!--##ENCODING##-->', op.encoding || 'utf-8')
  html = html.replace('<!--##DESCRIPTION##-->', op.description || '')
  html = html.replace('<!--##KEYWORDS##-->', op.keywords || '')
  html = html.replace('<!--##AUTHOR##-->', op.author || '')
  html = html.replace('<!--##TITLE##-->', op.title || '')
  html = html.replace('<!--##URL##-->', op.url || '/')
  html = html.replace('<!--##BASE##-->', op.base || '/')
  let bundles = op.bundlePaths.map(
    p => `<script defer src="${p}?v=${op.version || ''}"></script>`
  ).join('')
  html = html.replace('<!--##BUNDLES##-->', bundles)
  html = html.replace('<!--##EXTRAS##-->', op.extras || '')
  html = html.replace('<!--##LANG##-->', op.lang || 'en')
  html = html.replace('<!--##VERSION##-->', op.version || '')
  let components = {}
  let key
  let subkey
  for (key in app.rootCtx.components) {
    if (op.componentNames && op.componentNames.indexOf(key) === -1) {
      continue
    }
    components[key] = {}
    for (subkey in app.rootCtx.components[key]) {
      if (['state'].indexOf(subkey) !== -1) {
        // avoid cyclic structure
        components[key][subkey] = app.rootCtx.components[key][subkey]
      }
    }
  }
  html = html.replace('<!--##COMPONENTS##-->', JSON.stringify(components))
  html = html.replace('<!--##INITIALIZED##-->', 'true')
  return html
}
