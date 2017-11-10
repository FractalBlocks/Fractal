import fs = require('fs-jetpack')
import { renderHTML, StaticRenderOptions } from './ssr'

export interface PrerenderOptions {
  outputFile: string
  cssFile?: string
  htmlFile: string
}

export async function prerender (preOp: PrerenderOptions, op: StaticRenderOptions) {
  try {
    op.encoding = op.encoding || 'utf-8'
    let html = fs.read(preOp.htmlFile, 'utf8')
    let css = preOp.cssFile ? fs.read(preOp.cssFile, 'utf8') : ''
    let htmlResult = await renderHTML(<any> {
      ...op,
      html,
      css,
    })
    fs.write(preOp.outputFile, htmlResult, { atomic: true })
    console.log('Guardado en archivo ' + preOp.outputFile)
  } catch (err) {
    throw err
  }
}
