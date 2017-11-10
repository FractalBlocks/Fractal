const {
  FuseBox,
  EnvPlugin,
  Sparky,
} = require('fuse-box')

Sparky.task('default', () => {
  let fuse = FuseBox.init({
    homeDir: '.',
    output: './src/playground/dist/$name.js',
    tsConfig : './tsconfig.json',
    experimentalFeatures: true,
    useTypescriptCompiler: true,
    sourceMaps: false,
    cache: false,
    plugins: [
      EnvPlugin({ ENV: 'production' }),
    ],
  })

  fuse.bundle('aot').instructions('> src/playground/aot.ts')

  fuse.bundle('app').instructions('> src/playground/index.ts')

  fuse.run()
})
