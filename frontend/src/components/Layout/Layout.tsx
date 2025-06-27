import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navbar from './Navbar';
import { useAuth } from '../../contexts/AuthContext';

const Layout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className={`${user?.role !== 'admin' ? 'pb-20' : ''} pt-4`}>
        <div className="max-w-6xl mx-auto px-4">
          <Outlet />
        </div>
      </main>
      <Navbar />
    </div>
  );
};

export default Layout;