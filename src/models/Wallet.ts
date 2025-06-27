import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface WalletAttributes {
  id?: number;
  userId: number;
  currencyId: number;
  balance: number;
  frozenBalance: number;
  address?: string;
  privateKey?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Wallet extends Model<WalletAttributes> implements WalletAttributes {
  public id!: number;
  public userId!: number;
  public currencyId!: number;
  public balance!: number;
  public frozenBalance!: number;
  public address?: string;
  public privateKey?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Wallet.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  currencyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  balance: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  frozenBalance: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  privateKey: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  sequelize,
  modelName: 'Wallet',
  tableName: 'wallets',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'currencyId']
    }
  ]
});