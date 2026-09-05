import { request } from './apiClient';

export const adminService = {
  dashboard: () => request({ url: '/admin/dashboard' }),
  giveaways: () => request({ url: '/admin/giveaways' }),
  participants: () => request({ url: '/admin/participants' }),
  winners: () => request({ url: '/admin/winners' }),
  claims: () => request({ url: '/admin/claims' }),
  fraudEvents: () => request({ url: '/admin/fraud' }),
  auditLogs: () => request({ url: '/admin/audit-logs' }),
  create: (payload) =>
    request({ method: 'post', url: '/admin/giveaways', data: payload }),
  finalizeWinners: (id) =>
    request({ method: 'post', url: `/admin/giveaways/${id}/select-winners` }),
  updateClaim: (claimId, status) =>
    request({
      method: 'patch',
      url: `/admin/claims/${claimId}`,
      data: { status },
    }),
};
