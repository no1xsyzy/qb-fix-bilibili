import metablock from 'rollup-plugin-userscript-metablock'
import typescript from '@rollup/plugin-typescript'
import strip from '@rollup/plugin-strip'

const pkg = require('./package.json')

const metab = metablock({
  file: './src/meta.json',
  override: {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    homepage: pkg.homepage,
    author: pkg.author,
  },
})

export default (commandLineArgs) => {
  const input = 'src/main.js'
  const output = {
    file: 'qb-fix-bilibili.user.js',
    format: 'iife',
    globals: {},
  }
  const plugins = [metab, typescript()]
  const external = []

  if (!commandLineArgs.configDebug) {
    plugins.push(strip({ include: '**/*.(js|ts)' }))
  }

  return {
    input,
    output,
    plugins,
    external,
  }
}
