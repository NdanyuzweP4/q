import { sequelize } from '../config/database';
import { User } from './User';
import { Order } from './Order';
import { Message } from './Message';
import { Task } from './Task';
import { Currency } from './Currency';
import { Subscription } from './Subscription';
import { UserTask } from './UserTask';
import { Wallet } from './Wallet';
import { Transaction } from './Transaction';
import { KYC } from './KYC';
import { PaymentMethod } from './PaymentMethod';
import { Dispute } from './Dispute';
import { TradingPair } from './TradingPair';

// Define associations
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Order, { foreignKey: 'agentId', as: 'agentOrders' });
Order.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

Order.hasMany(Message, { foreignKey: 'orderId', as: 'messages' });
Message.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

User.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });
Subscription.hasMany(User, { foreignKey: 'subscriptionId', as: 'users' });

Currency.hasMany(Order, { foreignKey: 'currencyId', as: 'orders' });
Order.belongsTo(Currency, { foreignKey: 'currencyId', as: 'currency' });

Currency.hasMany(Task, { foreignKey: 'rewardCurrencyId', as: 'rewardTasks' });
Task.belongsTo(Currency, { foreignKey: 'rewardCurrencyId', as: 'rewardCurrency' });

// Many-to-many relationship between User and Task
User.belongsToMany(Task, { 
  through: UserTask, 
  foreignKey: 'userId', 
  otherKey: 'taskId',
  as: 'completedTasks'
});
Task.belongsToMany(User, { 
  through: UserTask, 
  foreignKey: 'taskId', 
  otherKey: 'userId',
  as: 'completedByUsers'
});

// Wallet associations
User.hasMany(Wallet, { foreignKey: 'userId', as: 'wallets' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Currency.hasMany(Wallet, { foreignKey: 'currencyId', as: 'wallets' });
Wallet.belongsTo(Currency, { foreignKey: 'currencyId', as: 'currency' });

// Transaction associations
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Wallet.hasMany(Transaction, { foreignKey: 'walletId', as: 'transactions' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' });

Order.hasMany(Transaction, { foreignKey: 'orderId', as: 'transactions' });
Transaction.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// KYC associations
User.hasOne(KYC, { foreignKey: 'userId', as: 'kyc' });
KYC.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Payment Method associations
User.hasMany(PaymentMethod, { foreignKey: 'userId', as: 'paymentMethods' });
PaymentMethod.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Dispute associations
Order.hasOne(Dispute, { foreignKey: 'orderId', as: 'dispute' });
Dispute.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

User.hasMany(Dispute, { foreignKey: 'initiatorId', as: 'initiatedDisputes' });
Dispute.belongsTo(User, { foreignKey: 'initiatorId', as: 'initiator' });

User.hasMany(Dispute, { foreignKey: 'respondentId', as: 'respondentDisputes' });
Dispute.belongsTo(User, { foreignKey: 'respondentId', as: 'respondent' });

User.hasMany(Dispute, { foreignKey: 'resolvedBy', as: 'resolvedDisputes' });
Dispute.belongsTo(User, { foreignKey: 'resolvedBy', as: 'resolver' });

// Trading Pair associations
Currency.hasMany(TradingPair, { foreignKey: 'baseCurrencyId', as: 'basePairs' });
TradingPair.belongsTo(Currency, { foreignKey: 'baseCurrencyId', as: 'baseCurrency' });

Currency.hasMany(TradingPair, { foreignKey: 'quoteCurrencyId', as: 'quotePairs' });
TradingPair.belongsTo(Currency, { foreignKey: 'quoteCurrencyId', as: 'quoteCurrency' });

export {
  User,
  Order,
  Message,
  Task,
  Currency,
  Subscription,
  UserTask,
  Wallet,
  Transaction,
  KYC,
  PaymentMethod,
  Dispute,
  TradingPair,
  sequelize
};