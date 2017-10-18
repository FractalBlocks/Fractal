import {
  hotSwap,
} from '../core'

declare const FuseBox

if (process.env.ENV === 'development') {

  const customizedHMRPlugin = {
    hmrUpdate: async data => {
      if (data.type === 'js') {
          FuseBox.flush()
          FuseBox.dynamic(data.path, data.content)
          if (FuseBox.mainFile && data.path.includes('Root')) {
            let Root = await import('./Root')
            ;(window as any).app = await (window as any).app.moduleAPI.attach(Root, (window as any).app, hotSwap)
          } else if (FuseBox.mainFile) {
            ;(window as any).app.moduleAPI.dispose()
            FuseBox.import(FuseBox.mainFile)
          }
          return true
      }
    }
  }

  if (!process.env.hmrRegistered) {
    process.env.hmrRegistered = <any> false
    FuseBox.addPlugin(customizedHMRPlugin)
  }

}
