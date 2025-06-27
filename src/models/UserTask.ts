import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserTaskAttributes {
  id?: number;
  userId: number;
  taskId: number;
  completedAt: Date;
  rewardClaimed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserTask extends Model<UserTaskAttributes> implements UserTaskAttributes {
  public id!: number;
  public userId!: number;
  public taskId!: number;
  public completedAt!: Date;
  public rewardClaimed!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserTask.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  rewardClaimed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  modelName: 'UserTask',
  tableName: 'user_tasks',
});