// api.ts
import { ExecutionStatus, PaginatedResponse, StatusCode, Test, TestResult } from '@/model';
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// 创建一个Axios实例的类型
interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: {
    'Content-Type': string;
  };
}

// 创建一个Axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

const futures_api_path = '/v1/futures'

// 添加请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么，比如添加认证token
    // config.headers['Authorization'] = `Bearer ${yourAuthToken}`;
    return config;
  },
  (error: AxiosError) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 对响应数据做点什么
    return response;
  },
  (error: AxiosError) => {
    // 对响应错误做点什么
    // 可以在这里统一处理错误，比如显示错误消息
    return Promise.reject(error);
  }
);

// 封装API方法的类型
interface Api {
  getTests: (page: number, page_size: number) => Promise<PaginatedResponse<Test>>;
  getAllStrategies: () => Promise<AxiosResponse<any>>;
  addTest: (data: any) => Promise<AxiosResponse<any>>;
  updateTest: (data: any) => Promise<AxiosResponse<any>>;
  startTest: (id: number) => Promise<AxiosResponse<any>>;
  deleteTest: (id: number) => Promise<AxiosResponse<any>>;
  getTestResults: (id: string | number, page: number, page_size: number) => Promise<PaginatedResponse<TestResult>>;
  downloadTestResults: (id: string | number) => Promise<void>;
  downloadTransactionsZip: (id: string | number) => Promise<void>;
}

// 实现API方法
const api: Api = {
  getTests: async (
    page: number = 1,
    page_size: number = 10
  ): Promise<PaginatedResponse<Test>> => {
    try {
      // 参数校验
      if (page < 1) throw new Error('页码不能小于 1');
      if (page_size < 1 || page_size > 100) {
        throw new Error('每页数量需在 1-100 之间');
      }

      const response: AxiosResponse<PaginatedResponse<Test>> = await apiClient.get(`${futures_api_path}/gettests`, {
        params: {
          page,
          page_size
        },
        paramsSerializer: {
          indexes: null // 保留空值数组索引
        }
      });

      if (response.data.status != StatusCode.SUCCESS)
        throw new Error(`获取测试数据失败: ${response.data.message}`);

      // 转换枚举值的显示文本（可选）
      response.data.data = response.data.data.map(item => ({
        ...item,
        status_text: getStatusText(item.execution_status)
      }));

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // 处理 API 错误响应
        const message = error.response?.data?.detail || error.message;
        throw new Error(`获取测试数据失败: ${message}`);
      }
      throw new Error(`请求异常: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  getAllStrategies: () => {
    return apiClient.get(`${futures_api_path}/getallstrategies`);
  },
  addTest: (data: any) => {
    return apiClient.post(`${futures_api_path}/addtest`, data);
  },
  updateTest: async (data: any) => {
    try {
      const response = await apiClient.post(`${futures_api_path}/updatetest`, data);
      if (response.data.status != StatusCode.SUCCESS)
        throw new Error(`更新测试失败: ${response.data.message}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // 处理 API 错误响应
        const message = error.response?.data?.detail || error.message;
        throw new Error(`更新测试失败: ${message}`);
      }
      throw new Error(`请求异常: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  startTest: async (id: number) => {
    try {
      const response = await apiClient.put(`${futures_api_path}/execute?id=${id}`)
      if (response.data.status != StatusCode.SUCCESS)
        throw new Error(`执行测试失败: ${response.data.message}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // 处理 API 错误响应
        const message = error.response?.data?.detail || error.message;
        throw new Error(`执行测试失败: ${message}`);
      }
      throw new Error(`请求异常: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  deleteTest: async (id: number) => {
    try {
      const response = await apiClient.put(`${futures_api_path}/deletetest?id=${id}`)
      if (response.data.status != StatusCode.SUCCESS)
        throw new Error(`删除测试失败: ${response.data.message}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // 处理 API 错误响应
        const message = error.response?.data?.detail || error.message;
        throw new Error(`删除测试失败: ${message}`);
      }
      throw new Error(`请求异常: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  // 获取测试结果
  getTestResults: async (test_id: string | number, page: number, page_size: number): Promise<PaginatedResponse<TestResult>> => {
    try {
      // 参数校验
      if (page < 1) throw new Error('页码不能小于 1');
      if (page_size < 1 || page_size > 100) {
        throw new Error('每页数量需在 1-100 之间');
      }

      const response: AxiosResponse<PaginatedResponse<TestResult>> = await apiClient.get(`${futures_api_path}/gettestresults`, {
        params: {
          test_id,
          page,
          page_size
        },
        paramsSerializer: {
          indexes: null // 保留空值数组索引
        }
      });

      if (response.data.status != StatusCode.SUCCESS)
        throw new Error(`获取测试数据失败: ${response.data.message}`);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // 处理 API 错误响应
        const message = error.response?.data?.detail || error.message;
        throw new Error(`获取测试数据失败: ${message}`);
      }
      throw new Error(`请求异常: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  downloadTestResults: async (test_id: string | number) => {
    try {
      const response = await apiClient.get(
        `${futures_api_path}/test/${test_id}/report`,
        { responseType: 'blob' }
      );

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // 从Content-Disposition获取文件名
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `testreport_${test_id}.csv`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      // 清理
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        // 处理 API 错误响应
        const message = error.response?.data?.detail || error.message;
        throw new Error(`下载失败: ${message}`);
      }
      throw new Error(`请求异常: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  downloadTransactionsZip: async (test_id: string | number) => {
    try {
      const response = await apiClient.get(
        `${futures_api_path}/test/${test_id}/transactions_zip`,
        { responseType: 'blob' }
      );

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // 从Content-Disposition获取文件名
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `transactions_${test_id}.zip`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      // 清理
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        // 处理 API 错误响应
        const message = error.response?.data?.detail || error.message;
        throw new Error(`下载失败: ${message}`);
      }
      throw new Error(`请求异常: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

};

const getStatusText = (status: ExecutionStatus): string => {
  const statusMap = {
    [ExecutionStatus.PENDING]: '等待执行',
    [ExecutionStatus.RUNNING]: '执行中',
    [ExecutionStatus.COMPLETED]: '已完成',
    [ExecutionStatus.FAILED]: '已失败'
  };
  return statusMap[status] || '未知状态';
};

export default api;