import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react({
      babel: {
        parserOpts: {
          plugins: ['decorators-legacy', 'classProperties']
        }
      }
    }),
    dts({
      insertTypesEntry: true,
      rollupTypes: false,
      outDir: 'dist',
      tsconfigPath: 'tsconfig.json',
      entryRoot: resolve(__dirname, 'index.ts'),
    }),
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      name: 'LowCodeEditor',
      fileName: (format) => `index.${format}.js`,
      formats: ['es']
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'qs',
        'classnames',
        'react-router-dom',
        'react-router',
        'lodash-es',
        'echarts',
      ]
    },
    cssCodeSplit: false,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  resolve: {
    alias: [
      {
        find: 'moment/locale',
        replacement: 'moment/dist/locale'
      },
      {
        find: 'amis-formula/lib',
        replacement: resolve(__dirname, './packages/amis-formula/src')
      },
      {
        find: 'amis-formula',
        replacement: resolve(__dirname, './packages/amis-formula/src')
      },
      {
        find: 'amis-ui/lib',
        replacement: resolve(__dirname, './packages/amis-ui/src')
      },
      {
        find: 'amis-ui',
        replacement: resolve(__dirname, './packages/amis-ui/src')
      },
      {
        find: 'amis-core',
        replacement: resolve(__dirname, './packages/amis-core/src')
      },
      {
        find: 'amis/lib',
        replacement: resolve(__dirname, './packages/amis/src')
      },
      {
        find: 'amis',
        replacement: resolve(__dirname, './packages/amis/src')
      },
      {
        find: 'amis-editor',
        replacement: resolve(__dirname, './packages/amis-editor/src')
      },
      {
        find: 'amis-editor-core',
        replacement: resolve(__dirname, './packages/amis-editor-core/src')
      },
      // {
      //   find: 'office-viewer',
      //   replacement: resolve(__dirname, './packages/office-viewer/src')
      // },
      {
        find: 'amis-theme-editor-helper',
        replacement: resolve(__dirname, './packages/amis-theme-editor-helper/src')
      }
    ]
  }
})
