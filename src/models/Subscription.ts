import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface SubscriptionAttributes {
  id?: number;
  name: string;
  level: number;
  price: number;
  features: string[];
  maxDailyOrders: number;
  maxOrderAmount: number;
  tradingFeeDiscount: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Subscription extends Model<SubscriptionAttributes> implements SubscriptionAttributes {
  public id!: number;
  public name!: string;
  public level!: number;
  public price!: number;
  public features!: string[];
  public maxDailyOrders!: number;
  public maxOrderAmount!: number;
  public tradingFeeDiscount!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Subscription.init({
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
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  features: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
  },
  maxDailyOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  maxOrderAmount: {
    type: DataTypes.DECIMAL(15, 8),
    defaultValue: 1000,
  },
  tradingFeeDiscount: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  sequelize,
  modelName: 'Subscription',
  tableName: 'subscriptions',
});