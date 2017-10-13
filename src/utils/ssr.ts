import { Component, RunModule, Module } from '../core'
import { toHTML } from '../prerender/index'

export interface StaticRenderOptions {
  root: Component<any>
  runModule: RunModule
  encoding: string
  html: string
  css?: string
  bundlePath?: string,
  url?: string, // canonical url
  componentNames?: any, // will be merged client-side
  title?: string
  description?: string
  keywords?: string
  author?: string
  extras?: string
  lang?: string
  isStatic?: boolean // is isS this means there are no need of JS at all
  version?: string
  cb: { (app: Module) }
}

export const renderHTML = ({
  root,
  runModule,
  encoding,
  html,
  css,
  bundlePath,
  url,
  componentNames,
  title,
  description,
  keywords,
  extras,
  isStatic,
  author,
  lang,
  version,
  cb,
}: StaticRenderOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    return (async () => {
      try {
        var app = await runModule(root, false, { render: false })
        await cb(app)
        let view = app.rootCtx.components.Root.interfaces['view'](app.rootCtx.components.Root.state)
        let styleStr = (css || '') + app.groupHandlers['style'].state.instance.getStyles()
        html = html.replace('<!--##HTML##-->', toHTML(view))
        html = html.replace('<!--##STYLES##-->', '<style>' + styleStr + '</style>')
        html = html.replace('<!--##ENCODING##-->', encoding || 'utf-8')
        html = html.replace('<!--##DESCRIPTION##-->', description || '')
        html = html.replace('<!--##KEYWORDS##-->', keywords || '')
        html = html.replace('<!--##AUTHOR##-->', author || '')
        html = html.replace('<!--##TITLE##-->', title || '')
        html = html.replace('<!--##URL##-->', url || '/')
        let bundle = isStatic
        ? ''
        : `<script defer src="${bundlePath || 'bundle.js'}?v=${version || ''}"></script>`
        html = html.replace('<!--##BUNDLE##-->', bundle)
        html = html.replace('<!--##EXTRAS##-->', extras || '')
        html = html.replace('<!--##LANG##-->', lang || 'en')
        html = html.replace('<!--##VERSION##-->', version || '')
        let components = {}
        let key
        let subkey
        for (key in app.rootCtx.components) {
          if (componentNames && componentNames.indexOf(key) === -1) {
            continue
          }
          components[key] = {}
          for (subkey in app.rootCtx.components[key]) {
            if (['state', 'isStatic'].indexOf(subkey) !== -1) {
              // avoid cyclic structure
              components[key][subkey] = app.rootCtx.components[key][subkey]
            }
          }
        }
        html = html.replace('<!--##COMPONENTS##-->', JSON.stringify(components))
        html = html.replace('<!--##INITIALIZED##-->', 'true')
        resolve(html)
      } catch (err) {
        reject(err)
      }
    })()
  })
}
