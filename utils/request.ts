import { router } from 'expo-router';
import { getToken, saveToken } from './useStorageState';
// const DEFAULT_BASE_URL = 'http://182.99.177.29:48099';
// const DEFAULT_BASE_URL = 'http://192.168.1.197:38099';
import { getCurrentBaseUrl } from "@/store/globalStateStore";

type RequestConfig = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
};

type RequestOptions = RequestConfig & {
  timeout?: number;
};

// Timeout control function
const timeoutPromise = (timeout: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('请求超时'));
    }, timeout);
  });
};

// Request interceptor
const requestInterceptor = async (
  config: RequestConfig,
  token?: string
): Promise<RequestConfig> => {
  const headers = {
    ...config.headers,
    "Content-Type": "application/json" // 修改为application/json
  };

  // 从缓存获取token
  const cachedToken = token || await getToken();
  if (cachedToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${cachedToken}`;
  }

  // 如果是POST/PUT请求且body是对象，转换为JSON字符串
  if (config.body && typeof config.body === 'object') {
    return {
      ...config,
      headers: headers as Record<string, string>,
      body: JSON.stringify(config.body)
    };
  }
  return {
    ...config,
    headers: headers as Record<string, string>
  };
};

// Handle response
const handleResponse = async (response: Response, onError?: (type: string, message: string) => void) => {
  if (!response.ok) {
    const errorMessage = {
      401: '未授权，请重新登录',
      403: '拒绝访问',
      404: '请求的资源不存在',
      500: '服务器内部错误'
    }[response.status] || `请求失败: ${response.status}`;
    switch (response.status) {
      case 401:
        console.log("未授权，请重新登录");
        await saveToken('');
        router.replace('/is-login');
        break;
      case 403:
        console.log("拒绝访问");
        break;
      case 404:
        console.log("请求的资源不存在");
        break;
      case 500:
        console.log("服务器内部错误");
        break;
      default:
        break;
    }
    console.log(errorMessage);
    if (onError) {
      onError('error', errorMessage);
    }
    // throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Request function
const request = async (
  url: string,
  options: RequestOptions = {},
  token?: string,
  onError?: (type: string, message: string) => void
) => {
  let fullUrl
  const { timeout = 10000, ...config } = options;
  const currentBaseUrl = getCurrentBaseUrl();
  
  if(url.startsWith('/xddTest')){
    //  fullUrl = `${testBaseURL}${url.slice('/xddTest'.length)}`
    console.log(33333);
    fullUrl = `${currentBaseUrl}${url.slice('/xddTest'.length)}`
  }else{
    fullUrl = url.startsWith('http') ? url : `${currentBaseUrl}${url}`;
  }
  // 修改为异步获取interceptedConfig
  const interceptedConfig = await requestInterceptor(config, token);
  // Handle GET/HEAD requests' body
  const method = (interceptedConfig.method || 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD') {
    if (interceptedConfig.body) {
      // Convert body to URL query parameters
      const queryParams = new URLSearchParams(interceptedConfig.body).toString();
      fullUrl += `${fullUrl.includes('?') ? '&' : '?'}${queryParams}`;
      // Remove request body
      delete interceptedConfig.body;
    }
  }
  try {
    const response = await Promise.race([
      fetch(fullUrl, interceptedConfig),
      timeoutPromise(timeout),
    ]);
    return await handleResponse(response, onError);
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message === '请求超时' ?
        '网络请求超时，请检查网络连接' :
        '请求配置有误';
      if (onError) {
        onError('error', errorMessage);
      }
    }
    throw error;
  }
};

export default request;
