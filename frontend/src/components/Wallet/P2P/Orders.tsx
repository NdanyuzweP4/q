import React, { useEffect, useState } from 'react';
import { orderService } from '../../../services/orders';
import { Order } from '../../../types';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { orders } = await orderService.getMyOrders();
        setOrders(orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: number) => {
    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      
      // Update orders list
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' as const }
          : order
      ));
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    try {
      await orderService.completeOrder(orderId);
      toast.success('Order completed successfully');
      
      // Update orders list
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'completed' as const }
          : order
      ));
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'matched':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'confirmed':
        return <AlertCircle className="h-4 w-4 text-purple-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'matched':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {['all', 'pending', 'matched', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-2 rounded-md font-medium text-sm transition-colors ${
              filter === status
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {order.type.toUpperCase()} {order.currency?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Order #{order.id} • Created {new Date(order.createdAt!).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-medium">{order.amount} {order.currency?.symbol}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-medium">${order.price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="font-medium">${order.totalValue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    order.type === 'buy' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {order.type.toUpperCase()}
                  </span>
                </div>
              </div>

              {order.agent && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Matched with agent: <span className="font-medium">{order.agent.username}</span>
                  </p>
                </div>
              )}

              {order.description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 italic">"{order.description}"</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
                
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => handleCompleteOrder(order.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
                
                {(order.status === 'matched' || order.status === 'confirmed') && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Contact Agent
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500">No {filter === 'all' ? '' : filter} orders found</p>
          <p className="text-sm text-gray-400 mt-1">
            {filter === 'all' 
              ? 'Create your first order to get started' 
              : `No orders with ${filter} status`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Orders;