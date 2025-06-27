import api from './api';
import { Currency } from '../types';

export const currencyService = {
  async getCurrencies(): Promise<{ currencies: Currency[] }> {
    const response = await api.get('/currencies');
    return response.data;
  },

  async createCurrency(currencyData: Partial<Currency>): Promise<{ message: string; currency: Currency }> {
    const response = await api.post('/currencies', currencyData);
    return response.data;
  },

  async updateCurrency(id: number, currencyData: Partial<Currency>): Promise<{ message: string; currency: Currency }> {
    const response = await api.put(`/currencies/${id}`, currencyData);
    return response.data;
  },
};