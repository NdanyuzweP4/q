import React, { useState, useEffect } from 'react';
import { orderService } from '../../../services/orders';
import { currencyService } from '../../../services/currencies';
import { Currency, Order } from '../../../types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

const BuySell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [formData, setFormData] = useState({
    currencyId: '',
    amount: '',
    price: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [currenciesData, ordersData] = await Promise.all([
          currencyService.getCurrencies(),
          orderService.getPendingOrders(),
        ]);
        setCurrencies(currenciesData.currencies);
        setPendingOrders(ordersData.orders);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.currencyId || !formData.amount || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await orderService.createOrder({
        currencyId: parseInt(formData.currencyId),
        amount: parseFloat(formData.amount),
        price: parseFloat(formData.price),
        type: activeTab,
        description: formData.description,
      });

      toast.success(`${activeTab} order created successfully!`);
      setFormData({ currencyId: '', amount: '', price: '', description: '' });
      
      // Refresh pending orders
      const ordersData = await orderService.getPendingOrders();
      setPendingOrders(ordersData.orders);
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = pendingOrders.filter(order => order.type !== activeTab);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('buy')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'buy'
              ? 'bg-green-600 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Buy
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'sell'
              ? 'bg-red-600 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingDown className="h-4 w-4 mr-2" />
          Sell
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Order Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create {activeTab === 'buy' ? 'Buy' : 'Sell'} Order
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                name="currencyId"
                value={formData.currencyId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Currency</option>
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                step="0.00000001"
                min="0"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter amount"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per unit
              </label>
              <input
                type="number"
                name="price"
                step="0.00000001"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter price"
                required
              />
            </div>

            {formData.amount && formData.price && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  Total: <span className="font-medium">${(parseFloat(formData.amount) * parseFloat(formData.price)).toFixed(2)}</span>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any additional information..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors disabled:opacity-50 ${
                activeTab === 'buy'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? 'Creating Order...' : `Create ${activeTab === 'buy' ? 'Buy' : 'Sell'} Order`}
            </button>
          </form>
        </div>

        {/* Available Orders */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Available {activeTab === 'buy' ? 'Sell' : 'Buy'} Orders
          </h3>
          
          {filteredOrders.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {order.currency?.name} ({order.currency?.symbol})
                      </h4>
                      <p className="text-sm text-gray-600">
                        by {order.user?.username}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.type === 'buy' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.type.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      Amount: <span className="font-medium">{order.amount}</span>
                    </p>
                    <p className="text-gray-600">
                      Price: <span className="font-medium">${order.price}</span>
                    </p>
                    <p className="text-gray-600">
                      Total: <span className="font-medium">${order.totalValue.toFixed(2)}</span>
                    </p>
                  </div>

                  {order.description && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      "{order.description}"
                    </p>
                  )}

                  <button
                    className={`w-full mt-3 py-2 px-4 rounded-md font-medium text-white transition-colors ${
                      order.type === 'sell'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {order.type === 'sell' ? 'Buy Now' : 'Sell Now'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No {activeTab === 'buy' ? 'sell' : 'buy'} orders available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuySell;