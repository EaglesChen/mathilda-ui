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

            <!-- 动态参数区 -->
            <!-- <template v-if="currentStrategyParams.length">
                <el-divider class="sub-title">
                    {{ form.type === 0 ? '回测参数' : '优化参数' }}
                </el-divider>

                <template v-if="form.type === 0">
                    <el-form-item v-for="param in currentStrategyParams" :key="param.name" :label="param.display_name"
                        class="m-form-item">
                        <el-input-number v-model="form.test_params_fixed[param.name]"
                            :precision="param.value_type === 'float' ? 2 : 0" :controls="param.value_type !== 'string'"
                            :min="0" controls-position="right" :disabled="mode === 'view'" />
                    </el-form-item>
                </template>

<template v-else>
                    <el-form-item v-for="param in currentStrategyParams" :key="param.name" :label="param.display_name"
                        class="m-form-item">
                        <el-row :gutter="10">
                            <el-col :span="8">
                                <span v-if="mode === 'view'">{{ form.test_params_range[param.name]?.from }}</span>
                                <el-input v-else v-model="form.test_params_range[param.name].from" placeholder="最小值"
                                    :type="param.value_type === 'string' ? 'text' : 'number'" />
                            </el-col>
                            <el-col :span="8">
                                <span v-if="mode === 'view'">{{ form.test_params_range[param.name]?.to }}</span>
                                <el-input v-else v-model="form.test_params_range[param.name].to" placeholder="最大值"
                                    :type="param.value_type === 'string' ? 'text' : 'number'" />
                            </el-col>
                            <el-col :span="8">
                                <span v-if="mode === 'view'">{{ form.test_params_range[param.name]?.step }}</span>
                                <el-input v-else v-model="form.test_params_range[param.name].step" placeholder="步长"
                                    :type="param.value_type === 'string' ? 'text' : 'number'" />
                            </el-col>
                        </el-row>
                    </el-form-item>
                </template>
</template> -->

            <!-- 动态参数区 -->
            <template v-if="currentStrategyParams.length">
                <el-divider class="sub-title">
                    {{ form.type === 0 ? '回测参数' : '优化参数' }}
                </el-divider>

                <template v-for="param in currentStrategyParams" :key="param.name">
                    <!-- 优化模式下的参数显示 -->
                    <template v-if="form.type === 1">
                        <!-- 支持优化的参数 -->
                        <el-form-item v-if="param.optimization" :label="param.display_name" class="m-form-item">
                            <el-row :gutter="10">
                                <el-col :span="8">
                                    <el-input-number v-model.number="form.test_params_range[param.name].from"
                                        placeholder="最小值" :precision="param.value_type === 'float' ? 2 : 0" :min="0"
                                        controls-position="right" :disabled="mode === 'view'" />
                                </el-col>
                                <el-col :span="8">
                                    <el-input-number v-model.number="form.test_params_range[param.name].to"
                                        placeholder="最大值" :precision="param.value_type === 'float' ? 2 : 0" :min="0"
                                        controls-position="right" :disabled="mode === 'view'" />
                                </el-col>
                                <el-col :span="8">
                                    <el-input-number v-model.number="form.test_params_range[param.name].step"
                                        placeholder="步长" :precision="param.value_type === 'float' ? 2 : 0" :min="0"
                                        controls-position="right" :disabled="mode === 'view'" />
                                </el-col>
                            </el-row>
                        </el-form-item>

                        <!-- 不支持的优化参数显示为固定值 -->
                        <el-form-item v-else :label="param.display_name" class="m-form-item">
                            <el-input-number v-model="form.test_params_range[param.name]"
                                :precision="param.value_type === 'float' ? 2 : 0" :min="0" controls-position="right"
                                :disabled="mode === 'view'" />
                        </el-form-item>
                    </template>

                    <!-- 回测模式下的参数显示 -->
                    <template v-else>
                        <el-form-item :label="param.display_name" class="m-form-item">
                            <el-input-number v-model="form.test_params_fixed[param.name]"
                                :precision="param.value_type === 'float' ? 2 : 0" :min="0" controls-position="right"
                                :disabled="mode === 'view'" />
                        </el-form-item>
                    </template>
                </template>
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
import { ParamRange, Strategy, TestModel } from '@/model'
import { deepAssign, deepClone } from '@/utils/object'
import { convertValueType } from '@/utils/type'


type FormMode = 'create' | 'edit' | 'view'



const formRef = ref<FormInstance>()
const loading = ref(false) // 新增加载状态
const strategies = ref<Strategy[]>([]) // 新增策略列表
const strategiesLoaded = ref(false) // 新增策略加载状态标识 
const paramCache = reactive<Record<number, {
    fixed: Record<string, any>
    range: Record<string, any>
}>>({})



const form = reactive<TestModel>({
    id: null,
    strategy_id: '',
    name: '',
    tag: '',
    begin: '',
    end: '',
    type: 0,
    execution_status: 0,
    test_params: '',
    created_at: '',
    executed_at: '',
    test_params_range: {
    },
    test_params_fixed: {}
})

const rules = reactive<FormRules<TestModel>>({
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
        { required: true, message: '请输入开始时间', trigger: 'blur' }
    ],
    end: [
        { required: true, message: '请输入结束时间', trigger: 'blur' }
    ]
})
const router = useRouter()

// 在参数处理逻辑中添加
const shouldShowFixed = (param: any) => {
    // 回测模式或参数禁止优化时显示固定值
    return form.type === 0 || (form.type === 1 && !param.optimization)
}

const buildParams = () => {
    const params: Record<string, any> = {}

    currentStrategyParams.value.forEach(param => {
        const { name, value_type, } = param

        // 根据参数类型决定取值方式
        if (shouldShowFixed(param)) {
            // 固定值处理
            const value = form.test_params_fixed[name]
            console.log(value,value_type)

            params[name] = convertValueType(value, value_type)
        } else {
            // 优化参数处理
            const range = form.test_params_range[name]
            if (range) {
                params[name] = {
                    from: convertValueType(range.from, value_type),
                    to: convertValueType(range.to, value_type),
                    step: convertValueType(range.step, value_type)
                }
            }
        }
    })


    return params
}

// 表单提交
const submitForm = async () => {
    try {
        await formRef.value?.validate()

        // 构建提交数据
        const payload = {
            id: form.id,
            strategy_id: form.strategy_id,
            name: form.name,
            tag: form.tag,
            begin: form.begin,
            end: form.end,
            type: form.type,
            test_params: buildParams()
        }

        // 处理创建/更新
        const isCreate = props.mode === 'create'
        const response = await (isCreate
            ? api.addTest(payload)
            : api.updateTest(payload))

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
            parameters: item.parameters
        }))
        strategiesLoaded.value = true // 标记加载完成
    } catch (error) {
        ElMessage.error('策略列表加载失败')
    } finally {
        loading.value = false
    }
}

// 独立初始化方法
const initFormData = () => {
    if (!props.initialData || !strategiesLoaded.value) return

    const targetStrategy = strategies.value.find(
        s => s.id === props.initialData.strategy_id
    )

    if (!targetStrategy) {
        ElMessage.warning('关联策略不存在')
        return
    }

    // 初始化基础字段
    Object.assign(form, {
        id: props.initialData.id,
        strategy_id: props.initialData.strategy_id,
        name: props.initialData.name,
        tag: props.initialData.tag,
        begin: props.initialData.begin,
        end: props.initialData.end,
        type: props.initialData.type
    })


    // // 处理逻辑
    // targetStrategy.parameters.forEach(param => {
    //     // 处理固定参数
    //     form.test_params_fixed[param.name] =
    //         props.initialData.test_params_fixed?.[param.name] ?? null

    //     // 处理优化参数
    //     const savedRange = (props.initialData.test_params_range || {})[param.name] as {
    //         from?: number | null
    //         to?: number | null
    //         step?: number | null
    //     } || {} // 类型断言 + 默认值

    //     form.test_params_range[param.name] = {
    //         from: savedRange.from ?? null, // 安全访问
    //         to: savedRange.to ?? null,
    //         step: savedRange.step ?? null
    //     }

    //     console.log("param", param)
    //     console.log("form", form.test_params_range)
    // })
    targetStrategy.parameters.forEach(param => {
        // 确保所有参数都有初始化值
        if (param.optimization) {
            // 范围参数初始化
            form.test_params_range[param.name] = {
                from: convertValueType(
                    props.initialData?.test_params_range?.[param.name]?.from ?? null,
                    param.value_type
                ),
                to: convertValueType(
                    props.initialData?.test_params_range?.[param.name]?.to ?? null,
                    param.value_type
                ),
                step: convertValueType(
                    props.initialData?.test_params_range?.[param.name]?.step ??
                    (param.value_type === 'float' ? 0.1 : 1),
                    param.value_type
                )
            }
        } else {
            // 固定值初始化到固定参数区
            form.test_params_range[param.name] = convertValueType(
                props.initialData?.test_params_range?.[param.name] ?? null,
                param.value_type
            )
        }

        // 回测模式全部使用固定值
        form.test_params_fixed[param.name] = convertValueType(
            props.initialData?.test_params_fixed?.[param.name] ?? null,
            param.value_type
        )
    })

}

//#region 钩子函数
const emit = defineEmits(['submit', 'cancel'])

const props = defineProps({
    mode: {
        type: String as PropType<FormMode>,
        default: 'create',
        validator: (value: string) => ['create', 'edit', 'view'].includes(value)
    },
    initialData: {
        type: Object as PropType<TestModel>,
        default: () => ({
            id: null,
            name: '',
            strategy_id: '',
            tag: '' as '' | 'ZL' | 'JQ',
            begin: '',
            end: '',
            type: 0,
            test_params_fixed: {},
            test_params_range: {}
        })
    }
})

const strategyName = computed(() => {
    const found = strategies.value.find(s => s.id === form.strategy_id)
    return found ? found.name : '未知策略'
})

const currentStrategyParams = computed(() => {
    if (!form.strategy_id) return []
    const strategy = strategies.value.find(s => s.id === form.strategy_id)
    return strategy?.parameters || []
})

watch(() => props.initialData, () => {
    if (strategiesLoaded.value) {
        initFormData()
    }
}, { deep: true })

watch(() => form.strategy_id, (newVal, oldVal) => {
    // 获取新旧策略对象
    const newStrategy = strategies.value.find(s => s.id === newVal)
    const oldStrategy = strategies.value.find(s => s.id === oldVal)

    // 当离开旧策略时缓存参数
    if (oldVal && oldStrategy) {
        paramCache[oldVal] = {
            fixed: { ...form.test_params_fixed },
            range: deepClone(form.test_params_range) // 需要深拷贝
        }
    }

    // 应用新策略参数逻辑
    if (newStrategy) {
        // 优先从缓存恢复
        const cachedParams = paramCache[newVal]

        // 初始化参数结构
        const initialFixed: Record<string, any> = {}
        const initialRange: Record<string, any> = {}

        newStrategy.parameters.forEach(param => {
            // // 固定参数处理
            // initialFixed[param.name] = cachedParams?.fixed[param.name]
            //     ?? props.initialData.test_params_fixed?.[param.name]
            //     ?? null

            // // 优化参数处理
            // initialRange[param.name] = {
            //     from: cachedParams?.range[param.name]?.from
            //         ?? props.initialData.test_params_range?.[param.name]?.from
            //         ?? null,
            //     to: cachedParams?.range[param.name]?.to
            //         ?? props.initialData.test_params_range?.[param.name]?.to
            //         ?? null,
            //     step: cachedParams?.range[param.name]?.step
            //         ?? props.initialData.test_params_range?.[param.name]?.step
            //         ?? null
            // }
            // 通用逻辑：根据模式初始化参数
            if (param.optimization) {
                initialRange[param.name] = {
                    from: cachedParams?.range[param.name]?.from
                        ?? props.initialData.test_params_range?.[param.name]?.from
                        ?? null,
                    to: cachedParams?.range[param.name]?.to
                        ?? props.initialData.test_params_range?.[param.name]?.to
                        ?? null,
                    step: cachedParams?.range[param.name]?.step
                        ?? props.initialData.test_params_range?.[param.name]?.step
                        ?? null
                }
            } else {
                initialRange[param.name] = cachedParams?.range[param.name]
                    ?? props.initialData.test_params_range?.[param.name]
                    ?? null
            }
            initialFixed[param.name] = cachedParams?.fixed[param.name]
                ?? props.initialData.test_params_fixed?.[param.name]
                ?? null
        })

        // 响应式更新（保留非策略参数字段）
        form.test_params_fixed = { ...initialFixed }
        form.test_params_range = deepClone(initialRange) // 需要深拷贝
    }
})



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