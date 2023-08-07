import { defineConfig } from 'vite'
import Userscript from 'vite-userscript-plugin'
import { name, version, description, license, author } from './package.json'
import strip from '@rollup/plugin-strip'

export default defineConfig(({ mode }) => ({
  plugins: [
    {
      ...strip({
        include: '**/*.(js|ts)',
        functions: ['console.*', 'timeit.*', 'boundaryTimeit'],
      }),
      apply: 'build',
    },
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
  ],
}))
