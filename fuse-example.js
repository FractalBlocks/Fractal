const {
  FuseBox,
  Sparky,
  CSSPlugin,
  JSONPlugin,
  EnvPlugin,
  WebIndexPlugin,
} = require('fuse-box')

let ENV = 'development'

let fuse, name

Sparky.task('init', () => {
  fuse = FuseBox.init({
    home: '.',
    output: 'dist/$name.js',
    tsConfig: './tsconfig.json',
    experimentalFeatures: true,
    useTypescriptCompiler: true,
    // sourceMaps: true,
    plugins: [
      CSSPlugin(),
      JSONPlugin(),
      EnvPlugin({ ENV }),
      WebIndexPlugin({
        template: `./src/${name}/index.html`,
      }),
    ],
  })

})

Sparky.task('production', () => {
  DEV = 'production'
})

Sparky.task('default', ['init'], () => {
  let example = fuse
    .bundle('Root')
    .instructions(`> src/${name}/index.ts`)

  if (name.includes('worker')) {
    console.log('Worker enabled')
    worker = fuse
      .bundle('worker')
      .instructions(`> src/${name}/worker.ts`)
      .watch('src/**/**.ts')
  }

  example.watch('src/**/**.ts').hmr({
   socketURI: 'ws://localhost:3000',
  })
  fuse.dev({ port: 3000 })
  fuse.run()
})

Sparky.task('simpleExample', () => {
  name = 'simpleExample'
  Sparky.start('default')
})

Sparky.task('playground', () => {
  name = 'playground'
  Sparky.start('default')
})

Sparky.task('featureExample', () => {
  name = 'featureExample'
  Sparky.start('default')
})

Sparky.task('workerExample', () => {
  name = 'workerExample'
  Sparky.start('default')
})
