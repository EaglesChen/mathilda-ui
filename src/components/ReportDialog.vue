<template>
    <!-- 测试结果弹窗 -->
    <el-dialog v-model="dialogVisible" title="测试结果详情" width="80%" top="5vh" @closed="handleClose">
        <el-skeleton v-if="reportLoading" :rows="10" animated />

        <div v-else>
            <el-table :data="reportData.data" height="60vh" border stripe>
                <el-table-column prop="test_params" label="参数" align="center" />
                <el-table-column prop="transaction_count" label="交易次数" align="center" />
                <el-table-column prop="profit_stop_count" label="止盈次数" align="center" />
                <el-table-column prop="loss_stop_count" label="止损次数" align="center" />
                <el-table-column prop="total_profit" label="总盈利" align="center" />
                <el-table-column prop="total_fee" label="总手续费" align="center" />
            </el-table>

            <!-- 分页控件 -->
            <el-pagination v-if="reportData.total > 0" v-model:current-page="currentPage" v-model:page-size="pageSize"
                :total="reportData.total" :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper" @current-change="fetchReportData"
                @size-change="handleSizeChange" class="pagination-container" />
        </div>

        <template #footer>
            <el-button @click="handleClose">关闭</el-button>
            <el-button type="primary" @click="downloadCSV" :loading="downloading">
                下载完整交易记录(CSV)
            </el-button>
            <el-button type="primary" @click="downloadReport" :loading="downloading">
                下载测试报告(CSV)
            </el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import api from '@/api'
import { PaginatedResponse, TestResult } from '@/model'
import { onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { tr } from 'element-plus/es/locale'

// 使用defineModel控制对话框显示
const dialogVisible = defineModel<boolean>('modelValue', { required: true })

const reportLoading = ref(false)
const reportData = ref<PaginatedResponse<TestResult>>({
    status: 200,
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
    data: [],
    message: ''
})


const currentTestId = ref<number | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const downloading = ref(false)

// 获取报告数据
const fetchReportData = async () => {
    if (!currentTestId.value) return

    try {
        reportLoading.value = true
        const { data, ...resMeta } = await api.getTestResults(
            currentTestId.value,
            currentPage.value,
            pageSize.value
        )

        reportData.value = {
            ...resMeta,
            data
        }
    } catch (error) {
        ElMessage.error('获取测试结果失败')
        console.error(error)
    } finally {
        reportLoading.value = false
    }
}

// 显示报告弹窗
const showReport = async (test_id: number) => {
    if (!test_id) return
    console.log(1111)
    currentTestId.value = test_id
    currentPage.value = 1 // 重置到第一页
    await fetchReportData()
    dialogVisible.value = true
}

// 关闭事件处理
const handleClose = () => {
    dialogVisible.value = false
}

// 分页大小变化处理
const handleSizeChange = (newSize: number) => {
    pageSize.value = newSize
    currentPage.value = 1 // 重置到第一页
    fetchReportData()
}

// CSV下载处理
const downloadCSV = async () => {
    downloading.value = true
    try {
        await api.downloadTransactionsZip(currentTestId.value)
        ElMessage.success('报告下载成功');
    }
    catch (error) {
        ElMessage.error('报告下载失败: ' + (error.response?.data?.message || error.message));
    } finally {
        downloading.value = false;
    }
}

const downloadReport = async () => {
    downloading.value = true
    try {
        await api.downloadTestResults(currentTestId.value)
        ElMessage.success('报告下载成功');
    }
    catch (error) {
        ElMessage.error('报告下载失败: ' + (error.response?.data?.message || error.message));
    } finally {
        downloading.value = false;
    }

}

const props = defineProps({
    test_id: {
        type: Number,
        default: 0
    }
})

// 监听test_id变化
watch(() => props.test_id, (newVal) => {
    console.log(newVal)
    if (newVal) showReport(newVal)
})

// 初始化时加载数据
onMounted(() => {
    if (props.test_id) showReport(props.test_id)
})
</script>

<style scoped>
.pagination-container {
    margin-top: 20px;
    justify-content: flex-end;
}
</style>