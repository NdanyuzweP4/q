import { Wallet } from '../models/Wallet';
import { Transaction } from '../models/Transaction';
import { Currency } from '../models/Currency';
import { sequelize } from '../config/database';
import { logger } from '../utils/logger';

class WalletService {
  async createWallet(userId: number, currencyId: number): Promise<Wallet> {
    try {
      const existingWallet = await Wallet.findOne({
        where: { userId, currencyId }
      });

      if (existingWallet) {
        throw new Error('Wallet already exists for this currency');
      }

      const wallet = await Wallet.create({
        userId,
        currencyId,
        balance: 0,
        frozenBalance: 0,
        isActive: true
      });

      return wallet;
    } catch (error) {
      logger.error('Error creating wallet:', error);
      throw error;
    }
  }

  async getUserWallets(userId: number): Promise<Wallet[]> {
    try {
      const wallets = await Wallet.findAll({
        where: { userId, isActive: true },
        include: [
          { model: Currency, as: 'currency' }
        ]
      });

      return wallets;
    } catch (error) {
      logger.error('Error fetching user wallets:', error);
      throw error;
    }
  }

  async getWalletBalance(userId: number, currencyId: number): Promise<{ balance: number; frozenBalance: number }> {
    try {
      const wallet = await Wallet.findOne({
        where: { userId, currencyId, isActive: true }
      });

      if (!wallet) {
        return { balance: 0, frozenBalance: 0 };
      }

      return {
        balance: wallet.balance,
        frozenBalance: wallet.frozenBalance
      };
    } catch (error) {
      logger.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  async updateBalance(
    userId: number, 
    currencyId: number, 
    amount: number, 
    type: 'credit' | 'debit',
    transactionType: 'deposit' | 'withdrawal' | 'trade' | 'fee' | 'reward',
    orderId?: number,
    metadata?: any
  ): Promise<{ wallet: Wallet; transaction: Transaction }> {
    const transaction = await sequelize.transaction();

    try {
      let wallet = await Wallet.findOne({
        where: { userId, currencyId, isActive: true },
        transaction
      });

      if (!wallet) {
        wallet = await this.createWallet(userId, currencyId);
      }

      const balanceChange = type === 'credit' ? amount : -amount;
      
      if (type === 'debit' && wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      await wallet.update({
        balance: wallet.balance + balanceChange
      }, { transaction });

      const txRecord = await Transaction.create({
        userId,
        walletId: wallet.id,
        orderId,
        type: transactionType,
        amount: balanceChange,
        fee: 0,
        status: 'confirmed',
        confirmations: 1,
        requiredConfirmations: 1,
        metadata
      }, { transaction });

      await transaction.commit();

      return { wallet, transaction: txRecord };
    } catch (error) {
      await transaction.rollback();
      logger.error('Error updating wallet balance:', error);
      throw error;
    }
  }

  async freezeBalance(userId: number, currencyId: number, amount: number): Promise<Wallet> {
    const transaction = await sequelize.transaction();

    try {
      const wallet = await Wallet.findOne({
        where: { userId, currencyId, isActive: true },
        transaction
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.balance < amount) {
        throw new Error('Insufficient balance to freeze');
      }

      await wallet.update({
        balance: wallet.balance - amount,
        frozenBalance: wallet.frozenBalance + amount
      }, { transaction });

      await transaction.commit();
      return wallet;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error freezing balance:', error);
      throw error;
    }
  }

  async unfreezeBalance(userId: number, currencyId: number, amount: number): Promise<Wallet> {
    const transaction = await sequelize.transaction();

    try {
      const wallet = await Wallet.findOne({
        where: { userId, currencyId, isActive: true },
        transaction
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.frozenBalance < amount) {
        throw new Error('Insufficient frozen balance to unfreeze');
      }

      await wallet.update({
        balance: wallet.balance + amount,
        frozenBalance: wallet.frozenBalance - amount
      }, { transaction });

      await transaction.commit();
      return wallet;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error unfreezing balance:', error);
      throw error;
    }
  }

  async getTransactionHistory(userId: number, limit: number = 50, offset: number = 0): Promise<Transaction[]> {
    try {
      const transactions = await Transaction.findAll({
        where: { userId },
        include: [
          { model: Wallet, as: 'wallet', include: [{ model: Currency, as: 'currency' }] }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return transactions;
    } catch (error) {
      logger.error('Error fetching transaction history:', error);
      throw error;
    }
  }
}

export const walletService = new WalletService();