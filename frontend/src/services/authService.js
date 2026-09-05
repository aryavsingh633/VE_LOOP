import { request } from './apiClient';
export const authService = {
  login: (payload) =>
    request({ method: 'post', url: '/auth/login', data: payload }),
  register: (payload) =>
    request({ method: 'post', url: '/auth/register', data: payload }),
  me: () => request({ url: '/auth/me' }),
  logout: () => request({ method: 'post', url: '/auth/logout' }),
};
