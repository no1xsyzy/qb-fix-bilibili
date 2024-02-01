import { defineConfig } from 'vite'
import Userscript from 'vite-userscript-plugin'
import { name, version, description, license, author } from './package.json'
import strip from '@rollup/plugin-strip'

export default defineConfig(({ mode }) => {
  const plugins = [
    Userscript({
      entry: 'src/main.ts',
      header: {
        name: mode === 'development' ? name + '-dev' : name,
        version: mode === 'development' ? version + '+' + new Date().toISOString() : version,
        description,
        license,
        author,
        match: ['https://*.bilibili.com/*'],
      },
      server: {
        port: 3000,
      },
      esbuildTransformOptions: {
        minify: false,
        charset: 'utf8',
      },
    }),
  ]

  if (mode !== 'development') {
    plugins.unshift({
      ...strip({
        include: '**/*.(js|ts)',
        functions: ['console.*', 'timeit.*', 'timeit2.*', 'boundaryTimeit'],
      }),
      apply: 'build',
    })
  }

  return {
    plugins,
  }
})
