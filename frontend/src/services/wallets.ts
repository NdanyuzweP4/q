import api from './api';
import { Wallet, Transaction } from '../types';

export const walletService = {
  async getWallets(): Promise<{ wallets: Wallet[] }> {
    const response = await api.get('/wallets');
    return response.data;
  },

  async createWallet(currencyId: number): Promise<{ message: string; wallet: Wallet }> {
    const response = await api.post('/wallets/create', { currencyId });
    return response.data;
  },

  async getBalance(currencyId: number): Promise<{ balance: { balance: number; frozenBalance: number } }> {
    const response = await api.get(`/wallets/balance/${currencyId}`);
    return response.data;
  },

  async getTransactions(params?: { limit?: number; offset?: number }): Promise<{ transactions: Transaction[] }> {
    const response = await api.get('/wallets/transactions', { params });
    return response.data;
  },

  async createDeposit(depositData: { amount: number; currency: string; payCurrency?: string }): Promise<{ message: string; payment: any }> {
    const response = await api.post('/wallets/deposit/create', depositData);
    return response.data;
  },
};