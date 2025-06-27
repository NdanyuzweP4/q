import React, { useState, useEffect } from 'react';
import { walletService } from '../../services/wallets';
import { currencyService } from '../../services/currencies';
import { Currency } from '../../types';
import { ArrowDownLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Deposit: React.FC = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [payCurrency, setPayCurrency] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const { currencies } = await currencyService.getCurrencies();
        setCurrencies(currencies);
        if (currencies.length > 0) {
          setSelectedCurrency(currencies[0].symbol);
          setPayCurrency(currencies[0].symbol);
        }
      } catch (error) {
        console.error('Error fetching currencies:', error);
      }
    };

    fetchCurrencies();
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCurrency || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const result = await walletService.createDeposit({
        amount: parseFloat(amount),
        currency: selectedCurrency,
        payCurrency: payCurrency || selectedCurrency,
      });
      
      toast.success('Deposit payment created successfully!');
      console.log('Payment details:', result.payment);
      
      // Reset form
      setAmount('');
    } catch (error) {
      console.error('Error creating deposit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
          <ArrowDownLeft className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Deposit Funds</h2>
        <p className="text-gray-600">Add funds to your wallet</p>
      </div>

      <form onSubmit={handleDeposit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Currency</option>
            {currencies.map((currency) => (
              <option key={currency.id} value={currency.symbol}>
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
            step="0.00000001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter amount"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pay with (Optional)
          </label>
          <select
            value={payCurrency}
            onChange={(e) => setPayCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Same as deposit currency</option>
            {currencies.map((currency) => (
              <option key={currency.id} value={currency.symbol}>
                {currency.name} ({currency.symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Deposit Information</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Deposits are processed automatically</li>
            <li>• Minimum deposit varies by currency</li>
            <li>• Processing time: 1-6 confirmations</li>
            <li>• Network fees may apply</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating Deposit...' : 'Create Deposit'}
        </button>
      </form>
    </div>
  );
};

export default Deposit;