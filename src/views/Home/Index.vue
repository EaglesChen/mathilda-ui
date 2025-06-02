<!-- <template>
  <WelcomeItem>
    <template #heading>添加策略</template>

    第一步
    <a @click="handleAdd" href="javascript:;">添加策略</a>

    按照说明填写完商品信息，点击保存，目前一次只能跑一个回测，但是可以同时添加多个商品。
  </WelcomeItem>

  <WelcomeItem>
    <template #heading>策略列表</template>

    策略分为三个状态，待执行，正在执行和已完成。为了避免出错，待执行的策略需要
    <a @click="handleList" href="javascript:;" rel="noopener">策略列表</a>
    点击开始才能执行程序，支持编辑策略。正在执行的策略无法操作。已执行策略可以查看并下载策略的结果，后期可以添加📈，更直观一点。
  </WelcomeItem>

</template> -->
<template>
  <div class="home-container">
    <div class="header">
      <h1 class="title">MATHILDA量化策略回测平台</h1>
    </div>
    <el-row :gutter="30" class="main-actions">
      <el-col :xs="24" :sm="12" class="action-card">
        <el-card shadow="hover" @click="handleAddFutures">
          <div class="action-content">
            <el-icon :size="60" color="var(--color-heading)">
              <i-ep-plus></i-ep-plus>
            </el-icon>
            <h3>期货回测</h3>
            <p>创建期货回测</p>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" class="action-card">
        <el-card shadow="hover" @click="handleTestList">
          <div class="action-content">
            <el-icon :size="60" color="var(--color-heading)">
              <i-ep-list></i-ep-list>
            </el-icon>
            <h3>期货回测列表</h3>
            <p>管理期货回测</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="30" class="main-actions">
      <el-col :xs="24" :sm="12" class="action-card">
        <el-card shadow="hover" @click="handleAddStock">
          <div class="action-content">
            <el-icon :size="60" color="var(--color-heading)">
              <i-ep-plus></i-ep-plus>
            </el-icon>
            <h3>股票回测</h3>
            <p>创建股票回测</p>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" class="action-card">
        <el-card shadow="hover" @click="handleTestList">
          <div class="action-content">
            <el-icon :size="60" color="var(--color-heading)">
              <i-ep-list></i-ep-list>
            </el-icon>
            <h3>股票回测列表</h3>
            <p>管理股票回测</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="instruction-card">
      <WelcomeItem>
        <template #heading>一、添加测试</template>
        <el-text>
          按照说明填写完商品信息，点击保存。执行测试需要在测试列表里面操作。主要是为了可以二次确认。
        </el-text>
      </WelcomeItem>

      <WelcomeItem>
        <template #heading>二、开始测试</template>
        <el-text>
          列表分为三个状态，待执行，正在执行和失败。为了避免出错，待执行的测试需要点击开始才能执行程序，支持重新编辑测试。正在执行的测试无法操作。失败的测试也无法操作，需要重新添加。
        </el-text>
      </WelcomeItem>

      <WelcomeItem>
        <template #heading>三、查看历史记录</template>
        <el-text>
          已执行测试可以查看并下载策略的结果，后期可以添加📈，更直观一点。
        </el-text>
      </WelcomeItem>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import WelcomeItem from './WelcomeItem.vue'
import { useRouter } from 'vue-router'



const router = useRouter();

// 处理添加操作
const handleAddFutures = async () => {
  router.push('/add/futures')
}

const handleAddStock = async () => {
  router.push('/add/stock')
}

const handleTestList = () => {
  router.push('/testlist')
}

const handleList = () => {
  router.push('/list')
}
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 32px;
  margin-bottom: 10px;
}

.main-actions {
  margin-bottom: 30px;
}

.action-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.action-card:hover {
  transform: translateY(-5px);
}

.action-content {
  text-align: center;
  padding: 30px 0;
}

.action-content h3 {
  margin: 15px 0 10px;
  font-size: 20px;
}

.action-content p {
  font-size: 14px;
}

.instruction-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
}

.instruction-content ol {
  line-height: 2;
  padding-left: 20px;
}
</style>