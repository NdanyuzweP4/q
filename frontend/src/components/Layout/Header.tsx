import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">P2P Trading</h1>
          {user && (
            <p className="text-sm text-gray-600">
              Welcome, {user.username} ({user.role})
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {user?.role === 'admin' && (
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <Settings size={20} />
            </button>
          )}
          <button
            onClick={logout}
            className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;