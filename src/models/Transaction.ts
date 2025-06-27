import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface TransactionAttributes {
  id?: number;
  userId: number;
  walletId: number;
  orderId?: number;
  type: 'deposit' | 'withdrawal' | 'trade' | 'fee' | 'reward';
  amount: number;
  fee: number;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  confirmations: number;
  requiredConfirmations: number;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Transaction extends Model<TransactionAttributes> implements TransactionAttributes {
  public id!: number;
  public userId!: number;
  public walletId!: number;
  public orderId?: number;
  public type!: 'deposit' | 'withdrawal' | 'trade' | 'fee' | 'reward';
  public amount!: number;
  public fee!: number;
  public status!: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  public txHash?: string;
  public fromAddress?: string;
  public toAddress?: string;
  public confirmations!: number;
  public requiredConfirmations!: number;
  public metadata?: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  walletId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('deposit', 'withdrawal', 'trade', 'fee', 'reward'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: false,
  },
  fee: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  txHash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fromAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  toAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  confirmations: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  requiredConfirmations: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Transaction',
  tableName: 'transactions',
});