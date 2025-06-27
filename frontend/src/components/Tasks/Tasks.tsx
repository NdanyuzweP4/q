import React, { useEffect, useState } from 'react';
import { taskService } from '../../services/tasks';
import { subscriptionService } from '../../services/subscriptions';
import { Task, Subscription } from '../../types';
import { CheckSquare, Clock, Award, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingTask, setCompletingTask] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, subscriptionsData] = await Promise.all([
          taskService.getTasks(),
          subscriptionService.getSubscriptions(),
        ]);
        setTasks(tasksData.tasks);
        setSubscriptions(subscriptionsData.subscriptions);
      } catch (error) {
        console.error('Error fetching tasks data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCompleteTask = async (taskId: number) => {
    setCompletingTask(taskId);
    try {
      const result = await taskService.completeTask(taskId);
      toast.success(`Task completed! Earned ${result.reward.amount} reward`);
      // Remove completed one-time tasks from the list
      setTasks(tasks.filter(task => task.id !== taskId || task.taskType !== 'one-time'));
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      setCompletingTask(null);
    }
  };

  const handleSubscribe = async (subscriptionId: number) => {
    try {
      await subscriptionService.subscribe(subscriptionId);
      toast.success('Successfully subscribed to VIP plan!');
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <p className="text-gray-600">Complete tasks to earn rewards</p>
      </div>

      {/* VIP Memberships */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            VIP Memberships
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">{subscription.name}</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-2">${subscription.price}</p>
                  <p className="text-sm text-gray-600 mt-1">Level {subscription.level}</p>
                </div>
                
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    Max Daily Orders: {subscription.maxDailyOrders}
                  </p>
                  <p className="text-sm text-gray-600">
                    Max Order Amount: ${subscription.maxOrderAmount}
                  </p>
                  <p className="text-sm text-gray-600">
                    Trading Fee Discount: {subscription.tradingFeeDiscount}%
                  </p>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {subscription.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSubscribe(subscription.id)}
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Subscribe
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available Tasks */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Available Tasks</h2>
        </div>
        <div className="p-6">
          {tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      <p className="text-gray-600 mt-1">{task.description}</p>
                      
                      <div className="flex items-center mt-3 space-x-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {task.taskType}
                        </div>
                        <div className="flex items-center text-sm text-green-600">
                          <Award className="h-4 w-4 mr-1" />
                          {task.rewardAmount} {task.rewardCurrency?.symbol}
                        </div>
                      </div>

                      {task.validUntil && (
                        <p className="text-sm text-orange-600 mt-2">
                          Valid until: {new Date(task.validUntil).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={completingTask === task.id}
                      className="ml-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {completingTask === task.id ? 'Completing...' : 'Complete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No tasks available at the moment</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;