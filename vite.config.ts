import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import Unocss from 'unocss/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import path from 'path'

const pathSrc = path.resolve(__dirname, 'src')

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: '../mathilda/static',  // 直接输出到FastAPI目录
    emptyOutDir: true,  // 构建前清空目标目录
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // 目标服务器的URL
        changeOrigin: true, // 是否改变源
      },
      // '/favicon.ico':{
      //   target: 'http://127.0.0.1:8000', // 目标服务器的URL
      //   changeOrigin: true, // 是否改变源
      // }
    }
  },
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      // Auto import functions from Vue, e.g. ref, reactive, toRef...
      // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
      imports: ['vue'],

      // Auto import functions from Element Plus, e.g. ElMessage, ElMessageBox... (with style)
      // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox... (带样式)
      resolvers: [
        ElementPlusResolver(),
      ],

      dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
    }),
    
    Components({
      resolvers: [
        // Auto register icon components
        // 自动注册图标组件
        //自动导入图标组件
        IconsResolver({
          enabledCollections: ['ep'],
          prefix: 'i',
        }),
        // Auto register Element Plus components
        // 自动导入 Element Plus 组件
        ElementPlusResolver({
          importStyle: 'sass',
        }),
      ],

      dts: path.resolve(pathSrc, 'components.d.ts'),
    }),

    Icons({
      autoInstall: true,
    }),
    Unocss()
  ],
  resolve: {
    alias: {
      '@': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element/index.scss" as *;`,
        api: 'modern-compiler',
      },
    },
  },
})
