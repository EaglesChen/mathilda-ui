<template>
  <div class="strategy-edit-container">
    <el-page-header @back="$router.go(-1)">
      <template #content>
        <h4>新建股票选股回测</h4>
      </template>
    </el-page-header>

    <el-card class="form-card">
      <StrategyForm mode="create" @submit="handleCreate" @cancel="goBack" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import StrategyForm from '@/components/StrategyForm.vue'
import { ElMessage } from 'element-plus'
import api from '@/api'


const router = useRouter()

const handleCreate = async (formData: any) => {
  try {
    await api.addTest(formData)
    ElMessage.success('创建成功')
    router.push('/strategies')
  } catch (error) {
    ElMessage.error('创建失败')
  }
}

const goBack = () => {
  router.go(-1)
}
</script>


<style scoped>
/* 完全保留原有样式 */
.strategy-edit-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
</style>