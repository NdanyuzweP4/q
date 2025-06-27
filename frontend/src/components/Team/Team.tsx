import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Copy, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Team: React.FC = () => {
  const { user } = useAuth();
  const [referralCode] = useState(`REF${user?.id}${user?.username?.toUpperCase().slice(0, 3)}`);
  
  // Mock referral data - in real app, this would come from API
  const [referralTeam] = useState([
    {
      id: 1,
      email: 'user1@example.com',
      vipLevel: 1,
      level: 1,
      joinedAt: '2024-01-15',
    },
    {
      id: 2,
      email: 'user2@example.com',
      vipLevel: 0,
      level: 1,
      joinedAt: '2024-01-20',
    },
    {
      id: 3,
      email: 'user3@example.com',
      vipLevel: 2,
      level: 2,
      joinedAt: '2024-02-01',
    },
  ]);

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

  const getVipBadgeColor = (level: number) => {
    const colors = [
      'bg-gray-100 text-gray-800',
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
    ];
    return colors[level] || colors[0];
  };

  const getLevelBadgeColor = (level: number) => {
    const colors = [
      'bg-green-100 text-green-800',
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
    ];
    return colors[level - 1] || colors[0];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <p className="text-gray-600">Manage your referral network</p>
      </div>

      {/* Referral Code Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Referral Code</h2>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Referral Code</p>
                <p className="text-2xl font-bold text-blue-600">{referralCode}</p>
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
          
          <div className="text-sm text-gray-600">
            <p>Share this code with friends to earn referral bonuses!</p>
            <p className="mt-1">Referral URL: {window.location.origin}/register?ref={referralCode}</p>
          </div>
        </div>
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">{referralTeam.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Level 1</p>
              <p className="text-2xl font-bold text-gray-900">
                {referralTeam.filter(r => r.level === 1).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Level 2</p>
              <p className="text-2xl font-bold text-gray-900">
                {referralTeam.filter(r => r.level === 2).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Team */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Referral Team</h2>
        </div>
        <div className="p-6">
          {referralTeam.length > 0 ? (
            <div className="space-y-4">
              {referralTeam.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{member.email}</p>
                    <p className="text-sm text-gray-600">
                      Joined: {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getVipBadgeColor(member.vipLevel)}`}>
                      VIP {member.vipLevel}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelBadgeColor(member.level)}`}>
                      Level {member.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No referrals yet</p>
              <p className="text-sm text-gray-400 mt-1">Share your referral code to start building your team</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Team;