import { IBackendRes } from "@/types/backend";
import { Mutex } from "async-mutex";
import axiosClient from "axios";
import { store } from "@/redux/store";
import { setRefreshTokenAction } from "@/redux/slice/accountSlide";
import { notification } from "antd";
interface AccessTokenResponse {
    access_token: string;
}

/**
 * Creates an initial 'axios' instance with custom settings.
 */

const instance = axiosClient.create({
    baseURL: import.meta.env.VITE_BACKEND_URL as string,
    withCredentials: true
});

const mutex = new Mutex();
const NO_RETRY_HEADER = 'x-no-retry';
const DEBUG = import.meta.env.MODE === 'development';

const handleRefreshToken = async (): Promise<string | null> => {
    return await mutex.runExclusive(async () => {
        try {
            if (DEBUG) console.log('🔄 [Refresh Token] Attempting to refresh access token...');

            // CRITICAL FIX: Gọi trực tiếp axiosClient để tránh interceptor unwrap res.data
            // Instance interceptor đã unwrap res.data → gây lỗi khi access res.data.access_token
            const res = await axiosClient.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/refresh`,
                {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );

            if (DEBUG) console.log('✅ [Refresh Token] Response:', res.data);

            // Kiểm tra cấu trúc response từ backend
            // Backend trả về: { statusCode, message, data: { access_token } }
            const responseData = res.data as IBackendRes<AccessTokenResponse>;
            if (responseData && responseData.data && responseData.data.access_token) {
                const newToken = responseData.data.access_token;
                if (DEBUG) console.log('✅ [Refresh Token] New access token obtained successfully');
                return newToken;
            }

            if (DEBUG) console.error('❌ [Refresh Token] Invalid response structure:', res.data);
            return null;
        } catch (error: any) {
            if (DEBUG) {
                console.error('❌ [Refresh Token] Failed:', error.response?.status, error.response?.data);
            }
            return null;
        }
    });
};

instance.interceptors.request.use(function (config) {
    if (typeof window !== "undefined" && window && window.localStorage && window.localStorage.getItem('access_token')) {
        config.headers.Authorization = 'Bearer ' + window.localStorage.getItem('access_token');
    }
    if (!config.headers.Accept && config.headers["Content-Type"]) {
        config.headers.Accept = "application/json";
        config.headers["Content-Type"] = "application/json; charset=utf-8";
    }
    return config;
});

/**
 * Handle all responses. It is possible to add handlers
 * for requests, but it is omitted here for brevity.
 */
instance.interceptors.response.use(
    (res) => res.data,
    async (error) => {
        // Safe check: Nếu không có response (network error, CORS, timeout)
        if (!error.response) {
            if (DEBUG) console.error('❌ [Axios Error] Network error or request failed:', error.message);
            return Promise.reject(error);
        }

        const status = +error.response.status;
        const config = error.config;
        const url = config?.url || '';

        if (DEBUG) {
            console.log(`⚠️ [Axios Error] ${status} on ${url}`, error.response.data);
        }

        // Kiểm tra có access_token trước khi retry với refresh token
        const access_token_local = localStorage.getItem('access_token');

        // HANDLE 401 - Unauthorized (Token expired hoặc invalid)
        if (status === 401
            && url !== '/api/v1/auth/login'
            && url !== '/api/v1/auth/refresh'  // Tránh loop vô hạn
            && !config.headers[NO_RETRY_HEADER]
            && access_token_local // CHỈ retry nếu có token (tránh gọi refresh khi chưa login)
        ) {
            if (DEBUG) console.log('🔄 [401 Handler] Token expired, attempting refresh...');

            config.headers[NO_RETRY_HEADER] = 'true';

            const access_token = await handleRefreshToken();

            if (access_token) {
                // Refresh thành công → update token và retry request
                config.headers['Authorization'] = `Bearer ${access_token}`;
                localStorage.setItem('access_token', access_token);

                if (DEBUG) console.log('✅ [401 Handler] Retrying original request with new token');

                return instance.request(config);
            } else {
                // Refresh failed → logout user
                if (DEBUG) console.error('❌ [401 Handler] Refresh failed, logging out...');

                localStorage.removeItem('access_token');
                store.dispatch(setRefreshTokenAction({
                    status: true,
                    message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                }));

                return Promise.reject(error);
            }
        }

        // HANDLE 400 on /api/v1/auth/refresh - Refresh token expired
        if (status === 400
            && url === '/api/v1/auth/refresh'
        ) {
            const message = error?.response?.data?.error ?? "Refresh token hết hạn. Vui lòng đăng nhập lại.";

            if (DEBUG) console.error('❌ [Refresh Error] Refresh token expired:', message);

            localStorage.removeItem('access_token');
            store.dispatch(setRefreshTokenAction({ status: true, message }));

            return Promise.reject(error);
        }

        // HANDLE 403 - Forbidden (Không có quyền truy cập)
        if (status === 403) {
            notification.error({
                message: error?.response?.data?.message ?? "Không có quyền truy cập",
                description: error?.response?.data?.error ?? "Bạn không có quyền thực hiện thao tác này"
            });
        }

        // HANDLE 500 - Server Error
        if (status >= 500) {
            if (DEBUG) console.error('❌ [Server Error]', error.response.data);
            notification.error({
                message: "Lỗi máy chủ",
                description: "Đã xảy ra lỗi từ phía máy chủ. Vui lòng thử lại sau."
            });
        }

        return error?.response?.data ?? Promise.reject(error);
    }
);

/**
 * Replaces main `axios` instance with the custom-one.
 *
 * @param cfg - Axios configuration object.
 * @returns A promise object of a response of the HTTP request with the 'data' object already
 * destructured.
 */
// const axios = <T>(cfg: AxiosRequestConfig) => instance.request<any, T>(cfg);

// export default axios;

export default instance;