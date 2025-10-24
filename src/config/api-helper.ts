import axios from '@/config/axios-customize';
import { AxiosRequestConfig } from 'axios';

/**
 * Public API helper - cho các endpoint không cần authentication
 * Đánh dấu request với header đặc biệt để axios interceptor KHÔNG retry khi 401
 */

const NO_RETRY_HEADER = 'x-no-retry';

export const publicApi = {
    get: <T = any>(url: string, config?: AxiosRequestConfig) => {
        return axios.get<T>(url, {
            ...config,
            headers: {
                ...config?.headers,
                [NO_RETRY_HEADER]: 'true', // Không retry 401 cho public API
            },
        });
    },

    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
        return axios.post<T>(url, data, {
            ...config,
            headers: {
                ...config?.headers,
                [NO_RETRY_HEADER]: 'true',
            },
        });
    },
};

/**
 * Protected API helper - cho các endpoint cần authentication
 * Sử dụng axios instance thông thường (có retry logic)
 */
export const protectedApi = axios;

export default axios;
