import fs = require('fs-jetpack')
import { Module, Component, RunModule } from '../core'
import { renderHTML } from './ssr'

export interface PrerenderOptions {
  root: Component<any>
  runModule: RunModule
  encoding?: string
  outputFile: string
  htmlFile: string
  cssFile?: string
  isStatic?: boolean // is isS this means there are no need of JS at all
  bundlePaths?: string[],
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
  bundlePaths,
  componentNames,
  cb,
}: PrerenderOptions) {
  try {
    encoding = encoding || 'utf-8'
    let html = fs.read(htmlFile, 'utf8')
    let css = cssFile ? fs.read(cssFile, 'utf8') : ''
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
      bundlePaths,
      keywords,
      author,
      extras,
      componentNames,
      cb,
    })

    fs.write(outputFile, htmlResult, { atomic: true })
    console.log('Guardado en archivo ' + outputFile)
  } catch (err) {
    throw err
  }
}
