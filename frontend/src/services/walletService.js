import { request } from './apiClient';
export const walletService = { get: () => request({ url: '/wallet' }) };
