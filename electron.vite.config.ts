import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import ViteAutoImport from 'unplugin-auto-import/vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@share': resolve('src/share')
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    resolve: {
      alias: {
        '@share': resolve('src/share')
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@share': resolve('src/share'),
        '@components': resolve('src/renderer/src/components')
      }
    },
    plugins: [
      vue(),
      vueJsx(),
      tailwindcss(),
      ViteAutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dirs: ['./src/store'],
        dts: './src/auto-imports.d.ts'
      }) // 自动导入
    ],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      }
    },
    server: {
      hmr: true
      // port: 3000,
      // proxy: {
      //   "/": {
      //     target: "http://8.138.20.29:3000"
      //   }
      // }
    }
  }
})
