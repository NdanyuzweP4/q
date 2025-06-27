import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface PaymentMethodAttributes {
  id?: number;
  userId: number;
  name: string;
  type: 'bank_transfer' | 'paypal' | 'crypto' | 'mobile_money' | 'cash';
  details: any;
  isActive: boolean;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PaymentMethod extends Model<PaymentMethodAttributes> implements PaymentMethodAttributes {
  public id!: number;
  public userId!: number;
  public name!: string;
  public type!: 'bank_transfer' | 'paypal' | 'crypto' | 'mobile_money' | 'cash';
  public details!: any;
  public isActive!: boolean;
  public isVerified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PaymentMethod.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('bank_transfer', 'paypal', 'crypto', 'mobile_money', 'cash'),
    allowNull: false,
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  modelName: 'PaymentMethod',
  tableName: 'payment_methods',
});