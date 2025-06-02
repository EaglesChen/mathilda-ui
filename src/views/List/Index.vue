<template>
  <div class="list-container">
    <el-page-header @back="$router.go(-1)">
      <template #content>
        <h2>策略列表</h2>
      </template>
    </el-page-header>

    <el-card class="table-card">
      <el-table :data="strategyList" stripe style="width: 100%">
        <el-table-column prop="name" label="策略名称" width="200" />
        <el-table-column prop="symbol" label="交易品种" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastRun" label="最后执行时间" width="180" />
        <el-table-column label="收益率" width="120">
          <template #default="{ row }">
            <span :class="profitClass(row.profit)">
              {{ row.profit }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" @click="runStrategy(row)">
                执行
              </el-button>
              <el-button type="warning" size="small" @click="editStrategy(row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="deleteStrategy(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination background layout="prev, pager, next" :total="100" :page-size="10" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟数据
const strategyList = reactive([
  {
    id: 1,
    name: '双均线策略',
    symbol: 'RB2401',
    status: 2,
    lastRun: '2023-07-20 14:30:00',
    profit: 15.6
  },
  {
    id: 2,
    name: '布林带策略',
    symbol: 'CU2403',
    status: 1,
    lastRun: '2023-07-20 15:00:00',
    profit: -3.2
  }
])

const statusText = (status) => {
  return ['未执行', '运行中', '已结束'][status]
}

const statusType = (status) => {
  return ['info', 'primary', 'success'][status]
}

const profitClass = (profit) => {
  return profit >= 0 ? 'profit-positive' : 'profit-negative'
}

const runStrategy = (row) => {
  ElMessage.info(`执行策略：${row.name}`)
}

const editStrategy = (row) => {
  ElMessage.warning(`编辑策略：${row.name}`)
}

const deleteStrategy = (row) => {
  ElMessageBox.confirm(`确定删除策略【${row.name}】吗？`, '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = strategyList.findIndex(item => item.id === row.id)
    strategyList.splice(index, 1)
    ElMessage.success('删除成功')
  })
}
</script>

<style>
.table-card .el-table {
  background-color: var(--color-background-mute);
}

.table-card .el-table th.el-table__cell {
  background-color: var(--color-background-mute);
}
</style>

<style scoped>
.list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.profit-positive {
  color: #67C23A;
}

.profit-negative {
  color: #F56C6C;
}
</style>