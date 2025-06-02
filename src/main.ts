// import '@/assets/main.css'
import '@/styles/index.scss'
import 'uno.css'
import 'element-plus/theme-chalk/src/message.scss'
import 'element-plus/theme-chalk/src/message-box.scss'

import App from './App.vue'
import { createApp } from 'vue'
import router from './router'
import ElementPlus from 'element-plus'

const app = createApp(App)
// 全局配置 ElMessage
app.config.globalProperties.$message = ElMessage

app.use(router)
// 挂载
app.use(ElementPlus)

app.mount('#app')
