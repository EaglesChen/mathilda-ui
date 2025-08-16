<template>
  <div class="test-list-container">
    <el-page-header @back="$router.go(-1)">
      <template #content>
        <h4>测试列表</h4>
      </template>
    </el-page-header>

    <el-card class="list-card">
      <!-- 加载状态 -->
      <el-skeleton v-if="loading" :rows="6" animated />

      <!-- 主体表格 -->
      <el-table v-else :data="testData.data" style="width: 100%" empty-text="暂无测试数据">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="strategy_id" label="策略" min-width="80" align="center" />
        <el-table-column prop="name" label="商品名称" width="80" align="center" />
        <el-table-column prop="tag" label="K线类型" width="80" align="center" />

        <el-table-column label="创建时间" width="240" align="center">
          <template #default="{ row }">
            {{ formatDate.datetime(row.created_at) }}
          </template>
        </el-table-column>

        <!-- 测试类型 -->
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag effect="plain">
              {{ testTypeMap[row.type] }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 状态列 -->
        <el-table-column label="状态" width="180" align="center">
          <template #default="{ row }">
            <!-- 执行中状态显示计时器 -->
            <div v-if="row.execution_status === ExecutionStatus.RUNNING" class="execution-timer">
              <el-icon :size="14" class="timer-icon">
                <clock />
              </el-icon>
              <span class="timer-text">
                {{ formatDuration(row.executed_at) }}
              </span>
            </div>

            <!-- 非执行状态保持原有标签 -->
            <el-tag v-else :type="statusTagType[row.execution_status]" effect="light" class="status-tag">
              {{ statusMap[row.execution_status] }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="220" align="center">
          <template #default="{ row }">
            <!-- 待处理状态操作 -->
            <template v-if="row.execution_status === ExecutionStatus.PENDING">
              <el-button type="primary" size="small" :disabled="hasRunning" @click="startTest(row.id)">
                开始
              </el-button>
              <el-button type="warning" size="small" @click="openEditDialog(row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="confirmDelete(row.id)">
                删除
              </el-button>
            </template>

            <!-- 运行中状态操作 -->
            <template v-if="row.execution_status === ExecutionStatus.RUNNING">
              <el-button type="info" size="small" @click="showParams(row)">
                参数
              </el-button>
            </template>

            <!-- 完成状态操作 -->
            <template v-if="row.execution_status === ExecutionStatus.COMPLETED">
              <el-button type="success" size="small" @click="openReportDialog(row.id)">
                报告
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="testData.total"
          :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" background
          @current-change="fetchTests" @size-change="handlePageSizeChange" />
      </div>

      <!-- 编辑对话框 -->
      <edit-dialog v-model="editDialogVisible" :mode="mode" :current-test="currentTest" @submit="handleEditSubmit" />
      <report-dialog v-model="reportDialogVisible" :test_id="test_id"
        @close="reportDialogVisible = false" />

    </el-card>
  </div>

</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Test, PaginatedResponse, ExecutionStatus, TestType } from '@/model'
import { formatDate } from '@/utils/date'
import EditDialog from '@/components/EditTestDialog.vue'
import ReportDialog from '@/components/ReportDialog.vue'
import api from '@/api'
// 新增引入时钟图标
import { Clock } from '@element-plus/icons-vue'

//#region 类型定义 */
const statusMap = {
  [ExecutionStatus.PENDING]: '待执行',
  [ExecutionStatus.RUNNING]: '执行中',
  [ExecutionStatus.COMPLETED]: '已完成',
  [ExecutionStatus.FAILED]: '已失败'
}

const statusTagType = {
  [ExecutionStatus.PENDING]: 'info',
  [ExecutionStatus.RUNNING]: 'warning',
  [ExecutionStatus.COMPLETED]: 'success',
  [ExecutionStatus.FAILED]: 'danger'
}

const testTypeMap = {
  [TestType.BACKTEST]: '回测',
  [TestType.PARAMETER_OPTIMIZATION]: '参数优化'
}
//#endregion
//#region 获取数据相关
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const testData = ref<PaginatedResponse<Test>>({
  status: 200,
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 0,
  data: [],
  message: ''
})
// 刷新列表定时器相关变量
const refreshInterval = ref<NodeJS.Timeout | null>(null)
const isWindowVisible = ref(true)


// fetch方法，支持静默刷新
const fetchTests = async (silent = false) => {
  try {
    if (!silent) loading.value = true

    const { data, ...resMeta } = await api.getTests(currentPage.value, pageSize.value)

    testData.value = {
      ...resMeta,
      data: data.map(mapTestItem)
    }

  } catch (error) {
    !silent && ElMessage.error('获取测试列表失败')
  } finally {
    !silent && (loading.value = false)
  }
}

// 数据转换逻辑
const mapTestItem = (item: Test): Test => ({
  ...item,
  executed_at: item.execution_status === ExecutionStatus.RUNNING
    ? item.executed_at || new Date().toISOString()
    : null,
})


// 修改自动刷新方法
const startAutoRefresh = () => {
  // 先清理已有定时器
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }

  // 统一刷新逻辑
  const refreshAction = () => {
    // 仅在可见时实际执行请求
    if (document.visibilityState === 'visible') {
      fetchTests(true)
    }
  }

  // 立即执行一次（如果可见）
  refreshAction()

  // 设置统一间隔定时器
  refreshInterval.value = setInterval(refreshAction, 60 * 1000)
}

// 可见性处理
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    // 恢复时直接触发刷新，定时器继续保持
    fetchTests(true)
  }
  // 隐藏时不需特殊处理，定时器仍然运行但请求会被跳过
}

const handlePageSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchTests()
}

//#endregion
//#region 执行中时间计时
// 响应式当前时间
const now = ref(Date.now())
// 优化后的计时器控制
let timer: number | null = null
// 时间格式化（添加调试日志）
const formatDuration = (startTime: string) => {
  // console.log('Formatting duration for:', startTime) // 调试日志

  if (!startTime) return '00:00:00'

  try {
    const start = new Date(startTime).getTime()
    const diff = now.value - start

    // console.log(`Time diff: ${diff}ms`) // 调试日志

    // 处理负时间差（时区问题）
    if (diff < 0) {
      console.warn('Negative time difference detected')
      return '00:00:00'
    }

    // 精确计算
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    return [hours, minutes, seconds]
      .map(v => v.toString().padStart(2, '0'))
      .join(':')
  } catch (e) {
    console.error('Time format error:', e)
    return '00:00:00'
  }
}
const startTimer = () => {
  if (!timer) {
    timer = window.setInterval(() => {
      now.value = Date.now() // 强制触发更新
    }, 1000)
  }
}
const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
//#endregion
//#region 对话框相关

const currentTest = ref<Test | null>(null)
const test_id = ref<number | null>(null)
const mode = ref('edit')

const paramDialogVisible = ref(false)
const editDialogVisible = ref(false)
const reportDialogVisible = ref(false)


const showParams = (test: Test) => {
  mode.value = 'view'
  currentTest.value = test
  editDialogVisible.value = true
}

const openEditDialog = (test: Test) => {
  mode.value = 'edit'
  currentTest.value = test
  editDialogVisible.value = true
}

const openReportDialog = (id: number) => {
  test_id.value = id
  reportDialogVisible.value = true
}
//#endregion
//#region 操作方法相关
// 开始测试
const startTest = async (id: number) => {
  try {
    await ElMessageBox.confirm('确认开始执行该测试？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })

    await api.startTest(id)
    ElMessage.success('测试已开始')
    await fetchTests()
  } catch (error) {
    // 取消操作不提示错误
    if (error !== 'cancel') {
      ElMessage.error('启动测试失败')
    }
  }
}

const handleEditSubmit = async () => {
  try {
    await fetchTests()
    editDialogVisible.value = false
  } catch (error) {
  }
}

const confirmDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('删除后不可恢复，确认删除？', '警告', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      distinguishCancelAndClose: true
    })

    await api.deleteTest(id)
    ElMessage.success('删除成功')
    await fetchTests()
  } catch (error) {
    // 取消操作不处理
  }
}

//#endregion
//#region vue函数

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
  startAutoRefresh() // 直接启动自动刷新
})

// 清除计时器
onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  stopTimer()
})

// 智能计时器控制
const hasRunning = computed(() =>
  testData.value.data.some(
    item => item.execution_status === ExecutionStatus.RUNNING
  )
)

watch(
  hasRunning,
  (newVal) => {
    if (newVal) {
      startTimer()
    } else {
      stopTimer()
    }
  },
  { immediate: true }
)
//#endregion

</script>

<style scoped lang="scss">
.test-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}


.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.el-table {
  margin-top: 20px;
}

.el-tag {
  margin-right: 8px;
}

.status-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timer {
  font-family: 'Courier New', Courier, monospace;
  color: var(--el-color-warning);
  font-size: 0.9em;
}

/* 计时器样式 */
.execution-timer {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: var(--el-color-warning-light-9);
  border-radius: 4px;
  color: var(--el-color-warning);

  .execution-timer .timer-icon {
    margin-right: 6px;
    animation: pulse 1.5s infinite;
  }

  .timer-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.95em;
  }
}

/* 状态标签微调 */
.status-tag {
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.8;
  }
}

@keyframes time-update {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.8;
  }

  100% {
    opacity: 1;
  }
}

.timer-text {
  animation: time-update 1s infinite;
}
</style>