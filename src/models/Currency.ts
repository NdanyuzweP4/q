import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface CurrencyAttributes {
  id?: number;
  name: string;
  symbol: string;
  isActive: boolean;
  minOrderAmount: number;
  maxOrderAmount: number;
  currentPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Currency extends Model<CurrencyAttributes> implements CurrencyAttributes {
  public id!: number;
  public name!: string;
  public symbol!: string;
  public isActive!: boolean;
  public minOrderAmount!: number;
  public maxOrderAmount!: number;
  public currentPrice!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Currency.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  symbol: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  minOrderAmount: {
    type: DataTypes.DECIMAL(15, 8),
    defaultValue: 0.00000001,
  },
  maxOrderAmount: {
    type: DataTypes.DECIMAL(15, 8),
    defaultValue: 1000000,
  },
  currentPrice: {
    type: DataTypes.DECIMAL(15, 8),
    defaultValue: 0,
  },
}, {
  sequelize,
  modelName: 'Currency',
  tableName: 'currencies',
});