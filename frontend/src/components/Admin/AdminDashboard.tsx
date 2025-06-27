import React, { useEffect, useState } from 'react';
import { userService } from '../../services/users';
import { currencyService } from '../../services/currencies';
import { taskService } from '../../services/tasks';
import { subscriptionService } from '../../services/subscriptions';
import { User, Currency, Task, Subscription } from '../../types';
import { Users, DollarSign, CheckSquare, Star, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currencies, setCurrencies] =useState<Currency[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  // Form states
  const [showCreateCurrency, setShowCreateCurrency] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateSubscription, setShowCreateSubscription] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, currenciesData, tasksData, subscriptionsData] = await Promise.all([
          userService.getUsers(),
          currencyService.getCurrencies(),
          taskService.getTasks(),
          subscriptionService.getSubscriptions(),
        ]);
        
        setUsers(usersData.users);
        setCurrencies(currenciesData.currencies);
        setTasks(tasksData.tasks);
        setSubscriptions(subscriptionsData.subscriptions);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUserStatusUpdate = async (userId: number, isActive: boolean) => {
    try {
      await userService.updateUserStatus(userId, { isActive });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive } : user
      ));
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleCreateCurrency = async (currencyData: Partial<Currency>) => {
    try {
      const result = await currencyService.createCurrency(currencyData);
      setCurrencies([...currencies, result.currency]);
      setShowCreateCurrency(false);
      toast.success('Currency created successfully');
    } catch (error) {
      console.error('Error creating currency:', error);
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const result = await taskService.createTask(taskData);
      setTasks([...tasks, result.task]);
      setShowCreateTask(false);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleCreateSubscription = async (subscriptionData: Partial<Subscription>) => {
    try {
      const result = await subscriptionService.createSubscription(subscriptionData);
      setSubscriptions([...subscriptions, result.subscription]);
      setShowCreateSubscription(false);
      toast.success('Subscription created successfully');
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Currencies', value: currencies.filter(c => c.isActive).length, icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { label: 'Active Tasks', value: tasks.filter(t => t.isActive).length, icon: CheckSquare, color: 'bg-purple-100 text-purple-600' },
    { label: 'VIP Plans', value: subscriptions.filter(s => s.isActive).length, icon: Star, color: 'bg-yellow-100 text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage platform settings and users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'users', label: 'Users', icon: Users },
              { id: 'currencies', label: 'Currencies', icon: DollarSign },
              { id: 'tasks', label: 'Tasks', icon: CheckSquare },
              { id: 'subscriptions', label: 'VIP Plans', icon: Star },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Users Management</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'agent' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${user.walletBalance.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleUserStatusUpdate(user.id, !user.isActive)}
                            className={`${
                              user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Currencies Tab */}
          {activeTab === 'currencies' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Currencies Management</h3>
                <button
                  onClick={() => setShowCreateCurrency(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Currency
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currencies.map((currency) => (
                  <div key={currency.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{currency.name}</h4>
                        <p className="text-sm text-gray-600">{currency.symbol}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        currency.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {currency.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Current Price: ${currency.currentPrice}</p>
                      <p>Min Order: {currency.minOrderAmount}</p>
                      <p>Max Order: {currency.maxOrderAmount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Tasks Management</h3>
                <button
                  onClick={() => setShowCreateTask(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </button>
              </div>
              
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {task.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {task.taskType}
                      </span>
                      <span>Reward: {task.rewardAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">VIP Plans Management</h3>
                <button
                  onClick={() => setShowCreateSubscription(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create VIP Plan
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subscriptions.map((subscription) => (
                  <div key={subscription.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{subscription.name}</h4>
                        <p className="text-lg font-bold text-blue-600">${subscription.price}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        subscription.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        Level {subscription.level}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Max Daily Orders: {subscription.maxDailyOrders}</p>
                      <p>Max Order Amount: ${subscription.maxOrderAmount}</p>
                      <p>Fee Discount: {subscription.tradingFeeDiscount}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Currency Modal */}
      {showCreateCurrency && (
        <CreateCurrencyModal
          onClose={() => setShowCreateCurrency(false)}
          onSubmit={handleCreateCurrency}
        />
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <CreateTaskModal
          currencies={currencies}
          onClose={() => setShowCreateTask(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {/* Create Subscription Modal */}
      {showCreateSubscription && (
        <CreateSubscriptionModal
          onClose={() => setShowCreateSubscription(false)}
          onSubmit={handleCreateSubscription}
        />
      )}
    </div>
  );
};

// Create Currency Modal Component
const CreateCurrencyModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: Partial<Currency>) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    minOrderAmount: '0.00000001',
    maxOrderAmount: '1000000',
    currentPrice: '0',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      minOrderAmount: parseFloat(formData.minOrderAmount),
      maxOrderAmount: parseFloat(formData.maxOrderAmount),
      currentPrice: parseFloat(formData.currentPrice),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Currency</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Order</label>
              <input
                type="number"
                step="0.00000001"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Order</label>
              <input
                type="number"
                value={formData.maxOrderAmount}
                onChange={(e) => setFormData({ ...formData, maxOrderAmount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Price</label>
            <input
              type="number"
              step="0.00000001"
              value={formData.currentPrice}
              onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Task Modal Component
const CreateTaskModal: React.FC<{
  currencies: Currency[];
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => void;
}> = ({ currencies, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    taskType: 'daily' as 'daily' | 'weekly' | 'monthly' | 'one-time',
    rewardAmount: '0',
    rewardCurrencyId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      rewardAmount: parseFloat(formData.rewardAmount),
      rewardCurrencyId: parseInt(formData.rewardCurrencyId),
      requirements: {},
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Task</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
            <select
              value={formData.taskType}
              onChange={(e) => setFormData({ ...formData, taskType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="one-time">One-time</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reward Amount</label>
              <input
                type="number"
                step="0.00000001"
                value={formData.rewardAmount}
                onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reward Currency</label>
              <select
                value={formData.rewardCurrencyId}
                onChange={(e) => setFormData({ ...formData, rewardCurrencyId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Currency</option>
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Subscription Modal Component
const CreateSubscriptionModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: Partial<Subscription>) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    level: '1',
    price: '0',
    maxDailyOrders: '10',
    maxOrderAmount: '1000',
    tradingFeeDiscount: '0',
    features: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      level: parseInt(formData.level),
      price: parseFloat(formData.price),
      maxDailyOrders: parseInt(formData.maxDailyOrders),
      maxOrderAmount: parseFloat(formData.maxOrderAmount),
      tradingFeeDiscount: parseFloat(formData.tradingFeeDiscount),
      features: formData.features.split(',').map(f => f.trim()).filter(f => f),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create VIP Plan</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <input
                type="number"
                min="0"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Daily Orders</label>
              <input
                type="number"
                value={formData.maxDailyOrders}
                onChange={(e) => setFormData({ ...formData, maxDailyOrders: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Order Amount</label>
              <input
                type="number"
                value={formData.maxOrderAmount}
                onChange={(e) => setFormData({ ...formData, maxOrderAmount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trading Fee Discount (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.tradingFeeDiscount}
              onChange={(e) => setFormData({ ...formData, tradingFeeDiscount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Features (comma-separated)</label>
            <textarea
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Feature 1, Feature 2, Feature 3"
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;