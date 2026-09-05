import axios from 'axios';

const apiBaseUrl =
  import.meta.env.API_URI ||
  import.meta.env.VITE_API_URI ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : undefined);

if (!apiBaseUrl) {
  throw new Error(
    'Missing API_URI environment variable. Configure it in the frontend deployment settings.',
  );
}

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
let refreshPromise = null;

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('velop_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  let deviceId = sessionStorage.getItem('velop_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    sessionStorage.setItem('velop_device_id', deviceId);
  }
  config.headers['X-Device-Id'] = deviceId;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const shouldRefresh =
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest._skipAuthRefresh &&
      !originalRequest.url?.includes('/auth/refresh');
    if (!shouldRefresh) return Promise.reject(error);

    originalRequest._retry = true;
    refreshPromise ||= apiClient
      .post('/auth/refresh', undefined, { _skipAuthRefresh: true })
      .then(({ data }) => {
        sessionStorage.setItem('velop_access_token', data.data.token);
        return data.data.token;
      })
      .finally(() => {
        refreshPromise = null;
      });

    try {
      const token = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      sessionStorage.removeItem('velop_access_token');
      return Promise.reject(refreshError);
    }
  },
);

export class ApiError extends Error {
  constructor(error) {
    super(
      error?.response?.data?.error?.message ||
        'We could not complete that request. Please try again.',
    );
    this.code = error?.response?.data?.error?.code;
    this.status = error?.response?.status;
    this.details = error?.response?.data?.error?.details;
  }
}

export async function request(config) {
  try {
    const response = await apiClient(config);
    return response.data.data;
  } catch (error) {
    throw new ApiError(error);
  }
}

export default apiClient;
