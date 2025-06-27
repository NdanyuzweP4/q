import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface TaskAttributes {
  id?: number;
  title: string;
  description: string;
  taskType: 'daily' | 'weekly' | 'monthly' | 'one-time';
  rewardAmount: number;
  rewardCurrencyId: number;
  requirements: any;
  isActive: boolean;
  maxCompletions?: number;
  validUntil?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Task extends Model<TaskAttributes> implements TaskAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public taskType!: 'daily' | 'weekly' | 'monthly' | 'one-time';
  public rewardAmount!: number;
  public rewardCurrencyId!: number;
  public requirements!: any;
  public isActive!: boolean;
  public maxCompletions?: number;
  public validUntil?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  taskType: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'one-time'),
    allowNull: false,
  },
  rewardAmount: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  rewardCurrencyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  requirements: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  maxCompletions: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Task',
  tableName: 'tasks',
});