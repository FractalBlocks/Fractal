const {
  FuseBox,
  Sparky,
  CSSPlugin,
  JSONPlugin,
  EnvPlugin,
  WebIndexPlugin,
} = require('fuse-box')

let ENV = 'development'

let fuse

Sparky.task('init', () => {
  fuse = FuseBox.init({
    home: '.',
    output: 'dist/$name.js',
    tsConfig: './tsconfig.json',
    experimentalFeatures: true,
    useTypescriptCompiler: true,
    sourceMaps: true,
    plugins: [
      CSSPlugin(),
      JSONPlugin(),
      EnvPlugin({ ENV }),
      WebIndexPlugin({
        template: './src/playground/index.html',
      }),
    ],
  })



})

Sparky.task('production', () => {
  DEV = 'production'
})

Sparky.task('default', ['init'], () => {
  let playground = fuse
    .bundle('Root')
    .instructions('> src/playground/index.ts')

  fuse.dev({ port: 3000 })
  playground.watch('src/**/**.ts').hmr()
  fuse.run()
})

