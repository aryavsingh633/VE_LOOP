import { request } from './apiClient';
export const claimService = {
  mine: (id) => request({ url: `/giveaways/${id}/my-claim` }),
  submit: (id, payload) =>
    request({ method: 'post', url: `/giveaways/${id}/claim`, data: payload }),
};
