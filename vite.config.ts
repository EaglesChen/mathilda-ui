import { defineConfig, loadEnv } from 'vite'
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
export default defineConfig(({ mode }) => {

  console.log('当前模式:', mode)
  console.log('项目根目录:', process.cwd())
  console.log('环境变量:', loadEnv(mode, process.cwd()))

  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'CUSTOM_PREFIX_']);

  // 是否为生产环境
  const isProduction = mode === 'production'

  const proxyConfig = {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    secure: false,
    configure: (proxy) => {
      // 代理请求事件
      proxy.on('proxyReq', (proxyReq, req) => {
        console.log(`[请求代理] ${req.method} ${req.url} => ${proxyConfig.target}${req.originalUrl}`)
      })
      
      // 代理响应事件
      proxy.on('proxyRes', (proxyRes, req, res) => {
        console.log(`[响应代理] ${req.url} => ${proxyRes.statusCode} ${proxyRes.statusMessage}`)
      })
      
      // 代理错误事件
      proxy.on('error', (err, req, res) => {
        console.error(`[代理错误] ${req.url}:`, err.message)
      })
    }
  }

  return {
    base: isProduction ? '/static/' : '/',
    server: {
      proxy: {
        '/api': proxyConfig, // 匹配所有以/api开头的路径
      },
      open: true,
      port: 5173
    },
    build: {
      outDir: '../mathilda/static',  // 直接输出到FastAPI目录
      emptyOutDir: true,  // 构建前清空目标目录
      manifest: true,
      sourcemap: !isProduction, // 生产环境关闭 sourcemap
      minify: isProduction ? 'terser' : false,
      terserOptions: {
        compress: {
          drop_console: isProduction // 生产环境移除 console
        }
      },
      rollupOptions: {
        output: {
          // 生产环境代码分割
          manualChunks: isProduction ? {
            vue: ['vue', 'vue-router', 'pinia'],
            vendor: ['axios', 'lodash-es'],
          } : {},
          entryFileNames: `assets/[name]${isProduction ? '.[hash]' : ''}.js`,
          chunkFileNames: `assets/[name]${isProduction ? '.[hash]' : ''}.js`,
          assetFileNames: `assets/[name]${isProduction ? '.[hash]' : ''}.[ext]`
        }
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
  }
})
