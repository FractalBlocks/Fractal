import fs = require('fs')
import { Module, Component, RunModule } from '../core'
import { renderHTML } from './ssr'

export interface PrerenderOptions {
  root: Component<any>
  runModule: RunModule
  encoding: string
  outputFile: string
  htmlFiles: string
  cssFile: string
  isStatic?: boolean // is isS this means there are no need of JS at all
  bundlePath?: string,
  url?: string, // canonical url
  componentNames?: any, // will be merged client-side
  title?: string
  description?: string
  keywords?: string
  author?: string
  extras?: string
  lang?: string
  version?: string
  cb: { (app: Module) }
}

export async function prerender ({
  root,
  runModule,
  encoding,
  isStatic,
  outputFile,
  htmlFile,
  cssFile,
  lang,
  version,
  url,
  title,
  description,
  keywords,
  author,
  extras,
  componentNames,
  cb,
}: PrerenderOptions) {
  try {
    let html = fs.readFileSync(htmlFile, encoding)
    let css = fs.readFileSync(cssFile, encoding)
    let htmlResult = await renderHTML({
      root,
      encoding,
      runModule,
      isStatic,
      lang,
      html,
      css,
      url,
      version,
      title,
      description,
      keywords,
      author,
      extras,
      componentNames,
      cb,
    })

    fs.unlink(outputFile, err => {
      fs.writeFile(outputFile, htmlResult, { flag: 'wx' }, err => {
        if (err) throw err
        console.log('Guardado en archivo ' + outputFile)
      })
    })
  } catch (err) {
    throw err
  }
}
