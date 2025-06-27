import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Wallet as WalletIcon, Plus, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import WalletOverview from './WalletOverview';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import P2PTrading from './P2PTrading';

const Wallet: React.FC = () => {
  const [showAgentApplication, setShowAgentApplication] = useState(false);

  const navItems = [
    { to: 'overview', label: 'Overview', icon: WalletIcon },
    { to: 'deposit', label: 'Deposit', icon: TrendingDown },
    { to: 'withdraw', label: 'Withdraw', icon: TrendingUp },
    { to: 'p2p', label: 'P2P Trading', icon: ArrowUpDown },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600">Manage your funds and trading</p>
        </div>
        
        <button
          onClick={() => setShowAgentApplication(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Apply to be Agent
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`
                }
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<WalletOverview />} />
            <Route path="deposit" element={<Deposit />} />
            <Route path="withdraw" element={<Withdraw />} />
            <Route path="p2p/*" element={<P2PTrading />} />
          </Routes>
        </div>
      </div>

      {/* Agent Application Modal */}
      {showAgentApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply to be P2P Agent</h3>
            <p className="text-gray-600 mb-6">
              As a P2P agent, you'll be able to facilitate trades between users and earn commissions.
              This requires KYC verification and a minimum deposit.
            </p>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Requirements:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Complete KYC verification</li>
                  <li>• Minimum deposit of $1,000</li>
                  <li>• Good trading history</li>
                  <li>• Admin approval required</li>
                </ul>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAgentApplication(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle application submission
                    setShowAgentApplication(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;