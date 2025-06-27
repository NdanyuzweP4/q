import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface OrderAttributes {
  id?: number;
  userId: number;
  agentId?: number;
  currencyId: number;
  amount: number;
  price: number;
  totalValue: number;
  type: 'buy' | 'sell';
  status: 'pending' | 'matched' | 'confirmed' | 'completed' | 'cancelled';
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Order extends Model<OrderAttributes> implements OrderAttributes {
  public id!: number;
  public userId!: number;
  public agentId?: number;
  public currencyId!: number;
  public amount!: number;
  public price!: number;
  public totalValue!: number;
  public type!: 'buy' | 'sell';
  public status!: 'pending' | 'matched' | 'confirmed' | 'completed' | 'cancelled';
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  agentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  currencyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: false,
    validate: {
      min: 0.00000001,
    },
  },
  price: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: false,
    validate: {
      min: 0.00000001,
    },
  },
  totalValue: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('buy', 'sell'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'matched', 'confirmed', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Order',
  tableName: 'orders',
  hooks: {
    beforeCreate: (order: Order) => {
      order.totalValue = order.amount * order.price;
    },
    beforeUpdate: (order: Order) => {
      if (order.changed('amount') || order.changed('price')) {
        order.totalValue = order.amount * order.price;
      }
    },
  },
});