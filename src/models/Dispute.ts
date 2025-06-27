import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface DisputeAttributes {
  id?: number;
  orderId: number;
  initiatorId: number;
  respondentId: number;
  reason: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  resolution?: string;
  resolvedBy?: number;
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Dispute extends Model<DisputeAttributes> implements DisputeAttributes {
  public id!: number;
  public orderId!: number;
  public initiatorId!: number;
  public respondentId!: number;
  public reason!: string;
  public description!: string;
  public status!: 'open' | 'in_review' | 'resolved' | 'closed';
  public resolution?: string;
  public resolvedBy?: number;
  public resolvedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Dispute.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  initiatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  respondentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('open', 'in_review', 'resolved', 'closed'),
    allowNull: false,
    defaultValue: 'open',
  },
  resolution: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resolvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Dispute',
  tableName: 'disputes',
});