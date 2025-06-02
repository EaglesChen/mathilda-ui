// 定义类型
export enum TestType {
    BACKTEST = 0,
    PARAMETER_OPTIMIZATION = 1
}

export enum ExecutionStatus {
    PENDING = 0,
    RUNNING = 1,
    COMPLETED = 2,
    FAILED = 3
}

export enum StatusCode {
    SUCCESS = 200,
    BAD_REQUEST = 400,
    INTERNAL_ERROR = 500
}

export interface Strategy {
    id: string
    name: string
    author: string
    creation_time: string
    parameters: StrategyParam[]
}

interface StrategyParam {
    name: string
    display_name: string
    value_type: 'int' | 'float'
    optimization: boolean
}

export interface Test {
    id: number;
    strategy_id: string;
    name: string;
    tag: string;
    begin: string;
    end: string;
    type: TestType;
    execution_status: ExecutionStatus;
    test_params: string;
    created_at: string;
    executed_at: string;
    report_url?: string;
}

export interface TestModel extends Test {
    test_params_fixed: Record<string, any>
    test_params_range: Record<string, { from: any; to: any; step: any }> | Record<string, any>
}

export interface TestResult {
    id: number;
    test_id: number;
    transaction_count: number;
    profit_stop_count: number;
    loss_stop_count: number;
    total_fee: number;
    total_profit: number;
    transaction_details_csv: string;
    created_at: string;
    test_params: string;

}

export interface ParamRange {
    from?: number | null
    to?: number | null
    step?: number | null
}

export interface Response<T = unknown> {
    data: T;
    status: number;
    message: string;
}
export interface PaginatedResponse<T = unknown> {
    status: number;
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    data: T[];
    message: string;
}
export interface ExecuteParams {
    id: number
}