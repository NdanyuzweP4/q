import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface KYCAttributes {
  id?: number;
  userId: number;
  level: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  documentType: 'passport' | 'id_card' | 'driving_license';
  documentNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  rejectionReason?: string;
  verifiedAt?: Date;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class KYC extends Model<KYCAttributes> implements KYCAttributes {
  public id!: number;
  public userId!: number;
  public level!: number;
  public status!: 'pending' | 'approved' | 'rejected' | 'expired';
  public documentType!: 'passport' | 'id_card' | 'driving_license';
  public documentNumber!: string;
  public firstName!: string;
  public lastName!: string;
  public dateOfBirth!: Date;
  public nationality!: string;
  public address!: string;
  public city!: string;
  public postalCode!: string;
  public country!: string;
  public documentFrontUrl?: string;
  public documentBackUrl?: string;
  public selfieUrl?: string;
  public rejectionReason?: string;
  public verifiedAt?: Date;
  public expiresAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

KYC.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'expired'),
    allowNull: false,
    defaultValue: 'pending',
  },
  documentType: {
    type: DataTypes.ENUM('passport', 'id_card', 'driving_license'),
    allowNull: false,
  },
  documentNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  postalCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  documentFrontUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  documentBackUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  selfieUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'KYC',
  tableName: 'kyc_verifications',
});