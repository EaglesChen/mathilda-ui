<template>
  <el-config-provider namespace="ep">
    <main>
      <router-view></router-view>
    </main>
  </el-config-provider>
</template>

<script setup lang="ts">
import { useDark,usePreferredDark } from '@vueuse/core'

const preferredDark = usePreferredDark()

useDark({
  valueDark: 'dark',   // 暗黑模式对应的CSS类名
  valueLight: 'light'  // 亮色模式对应的CSS类名
})


</script>