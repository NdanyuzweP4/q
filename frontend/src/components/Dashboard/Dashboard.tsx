import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { walletService } from '../../services/wallets';
import { taskService } from '../../services/tasks';
import { Wallet, Task } from '../../types';
import { DollarSign, TrendingUp, CheckSquare } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [walletsData, tasksData] = await Promise.all([
          walletService.getWallets(),
          taskService.getTasks(),
        ]);
        setWallets(walletsData.wallets);
        setTasks(tasksData.tasks.filter(task => task.isActive).slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const activeTasks = tasks.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.username}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900">${totalBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900">${user?.walletBalance.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{activeTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Available Tasks</h2>
        </div>
        <div className="p-6">
          {tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    <p className="text-sm text-green-600 font-medium">
                      Reward: {task.rewardAmount} {task.rewardCurrency?.symbol}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {task.taskType}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No active tasks available</p>
          )}
        </div>
      </div>

      {/* Wallets Overview */}
      {wallets.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Wallet Overview</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{wallet.currency?.name}</h3>
                    <p className="text-sm text-gray-600">{wallet.currency?.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{wallet.balance.toFixed(8)}</p>
                    {wallet.frozenBalance > 0 && (
                      <p className="text-sm text-orange-600">Frozen: {wallet.frozenBalance.toFixed(8)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;