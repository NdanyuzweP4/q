import React, { useEffect, useState } from 'react';
import { walletService } from '../../services/wallets';
import { Wallet, Transaction } from '../../types';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const WalletOverview: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalances, setShowBalances] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const [walletsData, transactionsData] = await Promise.all([
          walletService.getWallets(),
          walletService.getTransactions({ limit: 10 }),
        ]);
        setWallets(walletsData.wallets);
        setTransactions(transactionsData.transactions);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Balance */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Total Balance</h2>
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
          >
            {showBalances ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <p className="text-3xl font-bold">
          {showBalances ? `$${totalBalance.toFixed(2)}` : '****'}
        </p>
      </div>

      {/* Individual Wallets */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Wallets</h3>
        {wallets.length > 0 ? (
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">{wallet.currency?.name}</h4>
                    <p className="text-sm text-gray-600">{wallet.currency?.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {showBalances ? wallet.balance.toFixed(8) : '****'}
                    </p>
                    {wallet.frozenBalance > 0 && (
                      <p className="text-sm text-orange-600">
                        Frozen: {showBalances ? wallet.frozenBalance.toFixed(8) : '****'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No wallets found</p>
            <p className="text-sm text-gray-400 mt-1">Create a wallet to get started</p>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${
                      transaction.amount > 0 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.amount > 0 ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{transaction.type}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(8)}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{transaction.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletOverview;