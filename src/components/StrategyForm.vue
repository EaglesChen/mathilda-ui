<template>
    <div class="strategy-edit-container">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" label-position="left"
            :disabled="mode === 'view'">
            <!-- 策略选择 -->
            <el-form-item label="选择策略" prop="strategy_id" class="m-form-item">
                <el-select v-model="form.strategy_id" placeholder="请选择交易策略" :loading="loading" filterable clearable
                    :disabled="mode === 'view'">
                    <el-option v-for="strategy in strategies" :key="strategy.id" :label="strategy.name"
                        :value="strategy.id">
                        <span class="strategy-option">
                            <span class="name">{{ strategy.name }}</span>
                            <span class="meta">ID: {{ strategy.id }} | 作者: {{ strategy.author }}</span>
                        </span>
                    </el-option>
                </el-select>
            </el-form-item>

            <!-- 品种名称 -->
            <el-form-item label="品种名称" prop="name" class="m-form-item">
                <el-input v-model="form.name" placeholder="请输入交易品种" clearable :readonly="mode === 'view'" />
            </el-form-item>



            <el-form-item label="K线类型" prop="tag" class="m-form-item">
                <el-select v-model="form.tag" placeholder="请选择K线类型" :disabled="mode === 'view'">
                    <el-option label="主连(ZL)" value="ZL" />
                    <el-option label="加权(JQ)" value="JQ" />
                </el-select>
            </el-form-item>

            <!-- 时间范围 -->
            <el-form-item label="开始时间" prop="begin" class="m-form-item">
                <el-input v-model="form.begin" placeholder="例：20240101" :readonly="mode === 'view'" />
            </el-form-item>
            <el-form-item label="结束时间" prop="end" class="m-form-item">
                <el-input v-model="form.end" placeholder="例：20250101" :readonly="mode === 'view'" />
            </el-form-item>

            <!-- 执行配置 -->
            <el-form-item label="执行类型" prop="executeType" class="m-form-item">
                <el-radio-group v-model="form.type" :disabled="mode === 'view'">
                    <el-radio-button :value="0">回测</el-radio-button>
                    <el-radio-button :value="1">参数优化</el-radio-button>
                </el-radio-group>
            </el-form-item>

            <!-- 动态参数区（JSON格式） -->
            <template v-if="currentStrategyParams.length">
                <el-divider class="sub-title">
                    {{ form.type === 0 ? '回测参数' : '优化参数' }}
                </el-divider>

                <el-form-item label="参数配置(JSON)" class="m-form-item">
                    <el-input 
                        v-model="form.test_params" 
                        type="textarea" 
                        :rows="form.type === 0 ? 4 : 8"
                        :readonly="mode === 'view'"
                    />
                <div class="json-hint" v-if="mode !== 'view'">
                    {{ form.type === 0 ? fixedExampleWithLabels :  rangeExampleWithLabels }}
                </div>
                </el-form-item>
            </template>
            <!-- 操作按钮 -->
            <div class="form-actions" v-if="mode !== 'view'">
                <el-button @click="emit('cancel')">取消</el-button>
                <el-button type="primary" @click="submitForm">
                    {{ mode === 'create' ? '提交' : '保存' }}
                </el-button>
            </div>
        </el-form>
    </div>
</template>
<script setup lang="ts">
import { reactive, ref, onMounted, PropType, watch, computed } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import api from '@/api'
import { ParamRange, Strategy, Test } from '@/model'
import { deepAssign, deepClone } from '@/utils/object'

type FormMode = 'create' | 'edit' | 'view'

const formRef = ref<FormInstance>()
const loading = ref(false) // 新增加载状态
const strategies = ref<Strategy[]>([]) // 新增策略列表
const strategiesLoaded = ref(false) // 新增策略加载状态标识 
const paramCache = reactive<Record<number, string>>({}) // 缓存JSON字符串


const form = reactive<Test>({
    id: -1,
    strategy_id: '',
    name: '',
    tag: '',
    begin: '',
    end: '',
    type: 0,
    execution_status: 0,
    test_params: '', // 绑定表单的JSON参数
    created_at: '',
    executed_at: '',
})

const validateJson = (rule: any, value: string, callback: any) => {
  if (!value) return callback()
  try {
    const json = JSON.parse(value)
    // 额外验证：回测模式必须是键值对，优化模式区分处理
    if (form.type === 0) {
      // 回测参数：值必须是基础类型（number/string/boolean）
      Object.values(json).forEach(val => {
        if (typeof val === 'object' && val !== null) {
          throw new Error('回测参数值不能是对象')
        }
      })
    } else {
      // 优化参数：可优化参数必须包含from/to/step，不可优化参数必须是基础类型
      Object.entries(json).forEach(([key, val]) => {
        const param = currentStrategyParams.value.find(p => p.name === key)
        if (param?.optimization !== false) {
          // 可优化参数验证
          if (!val || typeof val !== 'object' || !('from' in val) || !('to' in val) || !('step' in val)) {
            throw new Error(`优化参数 ${key} 必须包含from、to、step字段`)
          }
        } else {
          // 不可优化参数验证（同回测模式）
          if (typeof val === 'object' && val !== null) {
            throw new Error(`参数 ${key} 不可优化，不能是对象`)
          }
        }
      })
    }
    callback()
  } catch (e) {
    callback(new Error(`JSON格式不正确: ${(e as Error).message}`))
  }
}

const rules = reactive<FormRules<Test>>({
    name: [
        { required: true, message: '请输入品种名称', trigger: 'blur' }
    ],
    tag: [
        { required: true, message: '请选择K线类型', trigger: 'change' }
    ],
    strategy_id: [
        { required: true, message: '请选择交易策略', trigger: 'change' }
    ],
    begin: [
        { required: true, message: '请输入开始时间', trigger: 'blur' },
        { pattern: /^\d{8}$/, message: '请输入8位数字日期（如20240101）', trigger: 'blur' }
    ],
    end: [
        { required: true, message: '请输入结束时间', trigger: 'blur' },
        { pattern: /^\d{8}$/, message: '请输入8位数字日期（如20250101）', trigger: 'blur' }
    ],
    test_params: [
        { required: true, message: '请输入参数配置', trigger: 'blur' },
        { validator: validateJson, trigger: 'blur' } // 新增JSON验证
    ]
})


// 表单提交
const submitForm = async () => {
    try {
        await formRef.value?.validate()

        // 构建提交数据
        const payload = {
            ...form,
            test_params: JSON.parse(form.test_params) // 解析为对象提交
        }

        // 处理创建/更新
        const isCreate = props.mode === 'create'
        const response = await (isCreate
            ? api.addTest(payload)
            : api.updateTest(payload))
        console.log(payload)
        // 处理结果
        ElMessage.success(isCreate ? '添加成功' : '更新成功')
        // 路由跳转逻辑
        if (isCreate) {
            router.back() // 新建保持后退
        } else {
            emit('submit', true) // 编辑触发关闭事件
        }
    } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error(`操作失败: ${(error as Error).message}`)
    }
}


const loadStrategies = async () => {
    try {
        loading.value = true
        const response = await api.getAllStrategies()
        strategies.value = response.data.map((item: any) => ({
            id: item.id,
            name: item.name || `未命名策略-${item.id}`,
            author: item.author || '未知作者',
            creation_time: item.creation_time,
            parameters: item.parameters || [] // 确保parameters存在（关键
        }))
        strategiesLoaded.value = true // 标记加载完成
    } catch (error) {
        ElMessage.error('策略列表加载失败')
    } finally {
        loading.value = false
    }
}

// 核心：根据策略parameters生成初始化JSON
const generateParamsJson = (strategy: Strategy) => {
    if (!strategy.parameters || strategy.parameters.length === 0) {
        return '{}' // 无参数时返回空对象
    }

    // 根据模式生成不同格式的JSON
    if (form.type === 0) {
        // 回测模式：{ paramName: defaultValue, ... }
        const params: Record<string, any> = {}
        strategy.parameters.forEach(param => {
            // 使用参数默认值，无默认值则根据类型设初始值
            params[param.name] = param.default_value ?? (param.value_type === 'float' ? 0 : 0)
        })
        return JSON.stringify(params, null, 2) // 格式化JSON，便于编辑
    } else {
        // 优化模式：区分可优化和不可优化参数
        const params: Record<string, any> = {}
        strategy.parameters.forEach(param => {
            if (param.optimization === false) {
                // optimization: false 时显示固定值（同回测模式）
                params[param.name] = param.default_value ?? (param.value_type === 'float' ? 0 : 0)
            } else {
                // 可优化参数显示范围
                params[param.name] = {
                    from: param.min_value ?? 0,
                    to: param.max_value ?? (param.value_type === 'float' ? 1 : 10),
                    step: param.step ?? (param.value_type === 'float' ? 0.1 : 1)
                }
            }
        })
        return JSON.stringify(params, null, 2)
    }
}


// 初始化表单数据
const initFormData = () => {
    if (!props.initialData || !strategiesLoaded.value) return

    const targetStrategy = strategies.value.find(s => s.id === props.initialData.strategy_id)
    if (!targetStrategy) return;

    // 深拷贝并初始化基础字段
    const safeInitialData = deepClone(props.initialData)
    deepAssign(form, safeInitialData)

    // 强制使用后端返回的 test_params（即使为空也不生成默认值）
    if (props.initialData.test_params) {
        form.test_params = props.initialData.test_params
    } else if (props.mode !== 'edit') {
        // 仅新建模式且无后端数据时生成默认值
        form.test_params = generateParamsJson(targetStrategy)
    }

    // 编辑模式：缓存后端参数，防止后续被覆盖
    if (props.mode === 'edit' && form.strategy_id) {
        paramCache[form.strategy_id] = form.test_params
    }
}

//#region 定义Props和Emits
const emit = defineEmits(['submit', 'cancel'])

const props = defineProps({
    mode: {
        type: String as PropType<FormMode>,
        default: 'create',
        validator: (value: string) => ['create', 'edit', 'view'].includes(value)
    },
    initialData: {
        type: Object as PropType<Test>,
        default: () => ({
            id: null,
            name: '',
            strategy_id: '',
            tag: '',
            begin: '',
            end: '',
            type: 0,
            test_params: ''
        })
    }
})

const currentStrategyParams = computed(() => {
    if (!form.strategy_id) return []
    const strategy = strategies.value.find(s => s.id === form.strategy_id)
    return strategy?.parameters || []
})

const fixedExampleWithLabels = computed(() => {
  const strategy = strategies.value.find(s => s.id === form.strategy_id)
  if (!strategy || !strategy.parameters?.length) {
    return '示例:\n{}'  // 增加换行
  }
  
  let exampleStr = "{\n"
  strategy.parameters.forEach((param, index) => {
    const key = param.name
    const value = param.default_value
    const desc = param.display_name 
    // 增加缩进和换行
    exampleStr += `  // ${desc}\n`
    exampleStr += `  "${key}": ${JSON.stringify(value)}`
    if (index < strategy.parameters.length - 1) {
      exampleStr += ","
    }
    exampleStr += "\n"
  })
  exampleStr += "}"
  
  // 拆分成单独的换行显示
  return `示例:\n${exampleStr}`
})

// 修改 rangeExampleWithLabels 计算属性
const rangeExampleWithLabels = computed(() => {
  const strategy = strategies.value.find(s => s.id === form.strategy_id)
  if (!strategy || !strategy.parameters?.length) {
    return '示例:\n{}'
  }
  
  let exampleStr = "{\n"
  const allParams = strategy.parameters // 改为处理所有参数
  let lastOptimizableIndex = -1
  
  // 先找到最后一个可优化参数的索引，用于正确添加逗号
  allParams.forEach((param, index) => {
    if (param.optimization !== false) {
      lastOptimizableIndex = index
    }
  })
  
  allParams.forEach((param, index) => {
    const key = param.name
    const desc = param.display_name
    exampleStr += `  // ${desc}\n`
    
    if (param.optimization === false) {
      // optimization: false 时显示固定值示例
      const value = param.default_value
      exampleStr += `  "${key}": ${JSON.stringify(value)}`
    } else {
      // 可优化参数显示范围示例
      exampleStr += `  "${key}": {\n`
      exampleStr += `    "from": ${param.min_value ?? 1},\n`
      exampleStr += `    "to": ${param.max_value ?? (param.value_type === 'float' ? 1 : 10)},\n`
      exampleStr += `    "step": ${param.step ?? (param.value_type === 'float' ? 0.1 : 1)}\n`
      exampleStr += "  }"
    }
    
    // 只有当前是可优化参数且不是最后一个可优化参数时才加逗号
    if (param.optimization !== false && index !== lastOptimizableIndex) {
      exampleStr += ","
    }
    exampleStr += "\n"
  })
  exampleStr += "}"
  
  return `示例:\n${exampleStr}`
})


watch(() => form.strategy_id, (newVal, oldVal) => {
    if (oldVal) paramCache[oldVal] = form.test_params // 缓存旧策略参数

    if (newVal) {
        const newStrategy = strategies.value.find(s => s.id === newVal)
        if (newStrategy) {
            // 编辑模式：保留当前参数，不自动生成
            if (props.mode === 'edit') {
                return;
            }
            // 新建模式：仅参数为空时生成默认值
            form.test_params = paramCache[newVal] || (
                form.test_params.trim() ? form.test_params : generateParamsJson(newStrategy)
            )
        }
    }
})

// 监听模式切换（回测/优化）：重新生成参数格式
watch(() => form.type, (newType, oldType) => {
    if (newType === oldType) return

    // 编辑模式：不自动生成，保留用户输入
    if (props.mode === 'edit') {
        return
    }
        
    if (form.strategy_id) {
        const strategy = strategies.value.find(s => s.id === form.strategy_id)
        if (strategy && !form.test_params.trim()) {
            form.test_params = generateParamsJson(strategy)
        }
    }
})

watch(() => props.initialData, () => {
    if (strategiesLoaded.value) {
        initFormData()
    }
}, { deep: true })

// 页面加载时执行
const router = useRouter()
onMounted(async () => {
    await loadStrategies() // 确保先加载策略
    // 仅当有初始数据时处理
    if (props.initialData?.strategy_id) {
        initFormData()
    }
})

//#endregion


</script>

<style scoped>
.json-hint {
  white-space: pre-wrap;  /* 保留换行和空格 */
  word-break: break-all;  /* 允许在单词内换行 */
  color: #606266;
  line-height: 1.4; /* 减小示例文本行高 */
}

/* 针对参数配置文本框的显示设置 */
:deep(.el-textarea__inner) {
  white-space: pre-wrap;  /* 文本框内显示时自动换行 */
  word-break: break-all;
}


.strategy-option {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.strategy-option .name {
    font-weight: 500;
    margin-right: 15px;
}

.strategy-option .meta {
    color: #888;
    font-size: 0.9em;
}

.form-card {
    margin-top: 20px;
    background-color: var(--color-background-mute);
    border-color: var(--color-border);

}

.form-card .el-card {
    color: var(--color-text);
}

.form-card .el-card .el-card__body .el-form .m-form-item .el-form-item__label {
    color: var(--color-text);
}

/* 表单操作按钮容器 */
.form-actions {
    display: flex;
    justify-content: center;
}

/* 添加查看模式下的样式 */
:deep(.el-form-item.is-disabled .el-form-item__content) {
    color: #606266;
    cursor: not-allowed;
}

:deep(.el-input.is-disabled .el-input__inner) {
    background-color: #f5f7fa;
    border-color: #e4e7ed;
    color: #606266;
    cursor: not-allowed;
}

:deep(.el-radio-group.is-disabled) {
    cursor: not-allowed;
}

:deep(.el-radio-button.is-disabled .el-radio-button__inner) {
    background-color: #f5f7fa;
    border-color: #e4e7ed;
    color: #a8abb2;
    cursor: not-allowed;
}

.view-mode-text {
    line-height: 40px;
    padding-left: 15px;
    color: #606266;
}
</style>