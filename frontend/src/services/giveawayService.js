import { request } from './apiClient';
export const giveawayService = {
  current: () => request({ url: '/giveaways/current' }),
  previous: () => request({ url: '/giveaways/previous' }),
  get: (identifier) => request({ url: `/giveaways/${identifier}` }),
  myStatus: (id) => request({ url: `/giveaways/${id}/my-status` }),
  join: (id, idempotencyKey) =>
    request({
      method: 'post',
      url: `/giveaways/${id}/join`,
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
  winners: (id) => request({ url: `/giveaways/${id}/winners` }),
  previousWinners: () => request({ url: '/giveaways/previous/winners' }),
};
