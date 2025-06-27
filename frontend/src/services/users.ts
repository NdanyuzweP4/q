import api from './api';
import { User } from '../types';

export const userService = {
  async getUsers(params?: { role?: string; isActive?: boolean }): Promise<{ users: User[] }> {
    const response = await api.get('/users', { params });
    return response.data;
  },

  async getUser(id: number): Promise<{ user: User }> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async updateUserStatus(id: number, statusData: { isActive?: boolean; isVerified?: boolean }): Promise<{ message: string }> {
    const response = await api.patch(`/users/${id}/status`, statusData);
    return response.data;
  },

  async updateProfile(profileData: { firstName?: string; lastName?: string; username?: string }): Promise<{ message: string; user: User }> {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
};