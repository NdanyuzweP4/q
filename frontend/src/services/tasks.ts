import api from './api';
import { Task, UserTask } from '../types';

export const taskService = {
  async getTasks(): Promise<{ tasks: Task[] }> {
    const response = await api.get('/tasks');
    return response.data;
  },

  async completeTask(taskId: number): Promise<{ message: string; reward: any }> {
    const response = await api.post(`/tasks/${taskId}/complete`);
    return response.data;
  },

  async getMyCompletions(): Promise<{ completions: UserTask[] }> {
    const response = await api.get('/tasks/my-completions');
    return response.data;
  },

  async createTask(taskData: Partial<Task>): Promise<{ message: string; task: Task }> {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },
};