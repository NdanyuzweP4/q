import api from './api';
import { Order, CreateOrderRequest } from '../types';

export const orderService = {
  async createOrder(orderData: CreateOrderRequest): Promise<{ message: string; order: Order }> {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  async getMyOrders(params?: { status?: string; type?: string }): Promise<{ orders: Order[] }> {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  async getPendingOrders(): Promise<{ orders: Order[] }> {
    const response = await api.get('/orders/pending');
    return response.data;
  },

  async matchOrder(orderId: number): Promise<{ message: string; order: Order }> {
    const response = await api.patch(`/orders/${orderId}/match`);
    return response.data;
  },

  async confirmOrder(orderId: number): Promise<{ message: string; order: Order }> {
    const response = await api.patch(`/orders/${orderId}/confirm`);
    return response.data;
  },

  async completeOrder(orderId: number): Promise<{ message: string; order: Order }> {
    const response = await api.patch(`/orders/${orderId}/complete`);
    return response.data;
  },

  async cancelOrder(orderId: number): Promise<{ message: string; order: Order }> {
    const response = await api.patch(`/orders/${orderId}/cancel`);
    return response.data;
  },
};