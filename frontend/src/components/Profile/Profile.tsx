import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/users';
import { User, Edit, Copy, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
  });
  const [loading, setLoading] = useState(false);

  const referralCode = `REF${user?.id}${user?.username?.toUpperCase().slice(0, 3)}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await userService.updateProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Referral code copied to clipboard!');
  };

  const shareReferralCode = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join P2P Trading Platform',
        text: `Use my referral code: ${referralCode}`,
        url: `${window.location.origin}/register?ref=${referralCode}`,
      });
    } else {
      copyReferralCode();
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'agent':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4 mr-1" />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">First Name</p>
                  <p className="font-medium text-gray-900">{user?.firstName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Name</p>
                  <p className="font-medium text-gray-900">{user?.lastName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="font-medium text-gray-900">{user?.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user?.role || '')}`}>
                    {user?.role?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Status</p>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user?.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {user?.isVerified && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Referral Code */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Referral Code</h2>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Your Referral Code</p>
                <p className="text-xl font-bold text-blue-600">{referralCode}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={copyReferralCode}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Copy className="h-5 w-5" />
                </button>
                <button
                  onClick={shareReferralCode}
                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Share this code with friends to earn referral bonuses when they join and start trading!
          </p>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Account Actions</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Security Settings</p>
                  <p className="text-sm text-gray-600">Change password, enable 2FA</p>
                </div>
                <User className="h-5 w-5 text-gray-400" />
              </div>
            </button>
            
            <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">KYC Verification</p>
                  <p className="text-sm text-gray-600">Complete identity verification</p>
                </div>
                <User className="h-5 w-5 text-gray-400" />
              </div>
            </button>

            <button
              onClick={logout}
              className="w-full text-left px-4 py-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-red-600"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sign Out</p>
                  <p className="text-sm">Sign out of your account</p>
                </div>
                <User className="h-5 w-5" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;