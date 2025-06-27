import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Plus, ShoppingCart, DollarSign, List } from 'lucide-react';
import BuySell from './P2P/BuySell';
import Orders from './P2P/Orders';

const P2PTrading: React.FC = () => {
  const [showAgentApplication, setShowAgentApplication] = useState(false);

  const navItems = [
    { to: 'buy-sell', label: 'Buy/Sell', icon: ShoppingCart },
    { to: 'orders', label: 'My Orders', icon: List },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">P2P Trading</h2>
          <p className="text-gray-600">Trade directly with other users</p>
        </div>
        
        <button
          onClick={() => setShowAgentApplication(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Become P2P Agent
        </button>
      </div>

      {/* Sub Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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

      <Routes>
        <Route index element={<Navigate to="buy-sell" replace />} />
        <Route path="buy-sell" element={<BuySell />} />
        <Route path="orders" element={<Orders />} />
      </Routes>

      {/* P2P Agent Application Modal */}
      {showAgentApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Become P2P Agent</h3>
            <p className="text-gray-600 mb-6">
              P2P agents facilitate trades between users and earn commissions. 
              This requires verification and meeting certain criteria.
            </p>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Agent Benefits:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Earn commission on facilitated trades</li>
                  <li>• Access to agent dashboard</li>
                  <li>• Priority customer support</li>
                  <li>• Higher trading limits</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Requirements:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Complete KYC verification</li>
                  <li>• Minimum trading volume</li>
                  <li>• Good reputation score</li>
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

export default P2PTrading;