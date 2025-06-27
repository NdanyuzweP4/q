import axios from 'axios';
import { logger } from '../utils/logger';

interface NOWPaymentsConfig {
  apiKey: string;
  sandbox: boolean;
  ipnSecret: string;
}

interface CreatePaymentRequest {
  price_amount: number;
  price_currency: string;
  pay_currency?: string;
  order_id: string;
  order_description?: string;
  ipn_callback_url?: string;
  success_url?: string;
  cancel_url?: string;
}

interface PaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  created_at: string;
  updated_at: string;
}

class NOWPaymentsService {
  private config: NOWPaymentsConfig;
  private baseURL: string;

  constructor() {
    this.config = {
      apiKey: process.env.NOWPAYMENTS_API_KEY || 'placeholder-api-key',
      sandbox: process.env.NOWPAYMENTS_SANDBOX === 'true',
      ipnSecret: process.env.NOWPAYMENTS_IPN_SECRET || 'placeholder-ipn-secret'
    };
    
    this.baseURL = this.config.sandbox 
      ? 'https://api-sandbox.nowpayments.io/v1'
      : 'https://api.nowpayments.io/v1';
  }

  private getHeaders() {
    return {
      'x-api-key': this.config.apiKey,
      'Content-Type': 'application/json'
    };
  }

  async getAvailableCurrencies(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseURL}/currencies`, {
        headers: this.getHeaders()
      });
      return response.data.currencies;
    } catch (error) {
      logger.error('Error fetching available currencies:', error);
      throw new Error('Failed to fetch available currencies');
    }
  }

  async getEstimatedPrice(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      const response = await axios.get(`${this.baseURL}/estimate`, {
        params: {
          amount,
          currency_from: fromCurrency,
          currency_to: toCurrency
        },
        headers: this.getHeaders()
      });
      return response.data.estimated_amount;
    } catch (error) {
      logger.error('Error getting estimated price:', error);
      throw new Error('Failed to get estimated price');
    }
  }

  async createPayment(paymentData: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/payment`, paymentData, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      logger.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await axios.get(`${this.baseURL}/payment/${paymentId}`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      logger.error('Error getting payment status:', error);
      throw new Error('Failed to get payment status');
    }
  }

  async getMinimumPaymentAmount(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      const response = await axios.get(`${this.baseURL}/min-amount`, {
        params: {
          currency_from: fromCurrency,
          currency_to: toCurrency
        },
        headers: this.getHeaders()
      });
      return response.data.min_amount;
    } catch (error) {
      logger.error('Error getting minimum payment amount:', error);
      throw new Error('Failed to get minimum payment amount');
    }
  }

  verifyIPNSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha512', this.config.ipnSecret)
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  }
}

export const nowPaymentsService = new NOWPaymentsService();