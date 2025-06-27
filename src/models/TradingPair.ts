import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface TradingPairAttributes {
  id?: number;
  baseCurrencyId: number;
  quoteCurrencyId: number;
  symbol: string;
  minOrderAmount: number;
  maxOrderAmount: number;
  priceDecimals: number;
  amountDecimals: number;
  tradingFee: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TradingPair extends Model<TradingPairAttributes> implements TradingPairAttributes {
  public id!: number;
  public baseCurrencyId!: number;
  public quoteCurrencyId!: number;
  public symbol!: string;
  public minOrderAmount!: number;
  public maxOrderAmount!: number;
  public priceDecimals!: number;
  public amountDecimals!: number;
  public tradingFee!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TradingPair.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  baseCurrencyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quoteCurrencyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  symbol: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  minOrderAmount: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: false,
    defaultValue: 0.00000001,
  },
  maxOrderAmount: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: false,
    defaultValue: 1000000,
  },
  priceDecimals: {
    type: DataTypes.INTEGER,
    defaultValue: 8,
  },
  amountDecimals: {
    type: DataTypes.INTEGER,
    defaultValue: 8,
  },
  tradingFee: {
    type: DataTypes.DECIMAL(5, 4),
    defaultValue: 0.001, // 0.1%
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  sequelize,
  modelName: 'TradingPair',
  tableName: 'trading_pairs',
  indexes: [
    {
      unique: true,
      fields: ['baseCurrencyId', 'quoteCurrencyId']
    }
  ]
});