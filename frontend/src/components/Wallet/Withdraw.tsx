import React, { useState, useEffect } from 'react';
import { walletService } from '../../services/wallets';
import { currencyService } from '../../services/currencies';
import { Currency, Wallet } from '../../types';
import { ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Withdraw: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const { wallets } = await walletService.getWallets();
        setWallets(wallets);
        if (wallets.length > 0) {
          setSelectedWallet(wallets[0]);
        }
      } catch (error) {
        console.error('Error fetching wallets:', error);
      }
    };

    fetchWallets();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet || !amount || !address) {
      toast.error('Please fill in all required fields');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > selectedWallet.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would call a withdrawal API endpoint
      toast.success('Withdrawal request submitted successfully!');
      
      // Reset form
      setAmount('');
      setAddress('');
    } catch (error) {
      console.error('Error creating withdrawal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
          <ArrowUpRight className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Withdraw Funds</h2>
        <p className="text-gray-600">Send funds from your wallet</p>
      </div>

      <form onSubmit={handleWithdraw} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wallet
          </label>
          <select
            value={selectedWallet?.id || ''}
            onChange={(e) => {
              const wallet = wallets.find(w => w.id === parseInt(e.target.value));
              setSelectedWallet(wallet || null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Wallet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.currency?.name} - Balance: {wallet.balance.toFixed(8)}
              </option>
            ))}
          </select>
        </div>

        {selectedWallet && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              Available Balance: <span className="font-medium">{selectedWallet.balance.toFixed(8)} {selectedWallet.currency?.symbol}</span>
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Withdrawal Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter destination address"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            type="number"
            step="0.00000001"
            min="0"
            max={selectedWallet?.balance || 0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter amount"
            required
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Withdrawal Information</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Withdrawals require manual approval</li>
            <li>• Processing time: 1-24 hours</li>
            <li>• Network fees will be deducted</li>
            <li>• Minimum withdrawal amounts apply</li>
            <li>• Double-check the address before submitting</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedWallet}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Submitting Withdrawal...' : 'Submit Withdrawal'}
        </button>
      </form>
    </div>
  );
};

export default Withdraw;