<template>
    <el-dialog v-model="dialogVisible" :title="`${currentTest?.name || ''} - ${currentTest?.strategy_id || ''}`"
        width="800px" top="5vh" destroy-on-close>
        <el-card v-loading="loading" class="form-card">
            <StrategyForm :mode="mode" :initial-data="currentTest" :disabled="loading" @submit="handleSubmit"
                @cancel="handleClose" />
        </el-card>
    </el-dialog>
</template>

<script setup lang="ts">
//#region 类型定义
import type { Test } from '@/model'

interface Props {
    mode: string
    modelValue: boolean
    currentTest?: Test
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'submit'): void
}
//#endregion

//#region 组件配置
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import StrategyForm from '@/components/StrategyForm.vue'
import api from '@/api'

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

// 使用 defineModel 简化双向绑定（需要 Vue 3.4+）
const dialogVisible = defineModel<boolean>('modelValue', { required: true })

// 响应式数据
const loading = ref(false)
//#endregion

const handleSubmit = async (val) => {
    try {
        loading.value = true
        emit('submit')
        handleClose()
    } catch (error) {
    } finally {
        loading.value = false
    }
}
//#endregion

// 关闭处理
const handleClose = () => {
    dialogVisible.value = false
}
//#endregion
</script>

<style scoped lang="scss">
.form-card {
    :deep(.el-card__body) {
        padding: 20px 30px;

        // 表单内容响应式布局
        @media (max-width: 768px) {
            padding: 15px;
        }
    }
}
</style>