import api from './api';
import { Subscription } from '../types';

export const subscriptionService = {
  async getSubscriptions(): Promise<{ subscriptions: Subscription[] }> {
    const response = await api.get('/subscriptions');
    return response.data;
  },

  async subscribe(subscriptionId: number): Promise<{ message: string; subscription: any }> {
    const response = await api.post(`/subscriptions/${subscriptionId}/subscribe`);
    return response.data;
  },

  async getMySubscription(): Promise<{ subscription: Subscription | null }> {
    const response = await api.get('/subscriptions/my-subscription');
    return response.data;
  },

  async createSubscription(subscriptionData: Partial<Subscription>): Promise<{ message: string; subscription: Subscription }> {
    const response = await api.post('/subscriptions', subscriptionData);
    return response.data;
  },
};