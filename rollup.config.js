import metablock from 'rollup-plugin-userscript-metablock'
import typescript from '@rollup/plugin-typescript'
import strip from '@rollup/plugin-strip'
import pkg from './package.json'

export default (commandLineArgs) => {
  const { configDebug } = commandLineArgs

  const input = 'src/main.ts'
  const output = {
    file: configDebug ? 'qb-fix-bilibili-debug.user.js' : 'qb-fix-bilibili.user.js',
    format: 'iife',
    globals: {},
  }

  const plugins = [
    metablock({
      file: './src/meta.json',
      override: {
        name: configDebug ? pkg.name + '-debug' : pkg.name,
        description: configDebug ? pkg.description + ' (debug version)' : pkg.description,
        version: configDebug
          ? pkg.version + '-' + new Date().toISOString().slice(0, 10).replace(/-?/g, '')
          : pkg.version,
        homepage: pkg.homepage,
        author: pkg.author,
      },
    }),
    typescript(),
  ]

  const external = []

  if (!configDebug) {
    plugins.push(
      strip({
        include: '**/*.(js|ts)',
        functions: ['console.*', 'timeit.*', 'boundaryTimeit'],
      }),
    )
  }

  return {
    input,
    output,
    plugins,
    external,
  }
}
