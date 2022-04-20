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

export default (commandLineArgs) => ({
  input: 'src/main.js',
  output: {
    file: 'qb-fix-bilibili.user.js',
    format: 'iife',
    globals: {},
  },
  plugins: commandLineArgs.configDebug
    ? [metab, typescript()]
    : [metab, typescript(), strip({ include: ['**/*.js', '**/*.ts'] })],
  external: [],
})
