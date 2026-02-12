'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { userAPI } from '@/lib/api';
import { 
  User, 
  Bell, 
  Lock, 
  Palette,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'appearance'>('profile');
  const [loading, setLoading] = useState(false);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: '',
    bio: '',
    timezone: 'UTC',
    language: 'en',
  });

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        bio: user.bio || '',
        timezone: user.timezone || 'UTC',
        language: user.language || 'en',
      });
      
      // Load notification preferences from backend
      loadNotificationPreferences();
    }
  }, [user]);

  const loadNotificationPreferences = async () => {
    if (!user) return;
    
    try {
      const preferences = await userAPI.getNotificationPreferences(user.id);
      setNotificationSettings(preferences);
    } catch (error) {
      // If API fails, try loading from localStorage as fallback
      const saved = localStorage.getItem('notificationSettings');
      if (saved) {
        setNotificationSettings(JSON.parse(saved));
      }
    }
  };

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    ticketAssigned: true,
    ticketUpdated: true,
    ticketClosed: false,
    weeklyDigest: true,
    mentionNotifications: true,
  });

  // Security settings
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    compactMode: false,
    showAvatars: true,
    fontSize: 'medium',
  });

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const updatedUser = await userAPI.update(user.id, {
        name: profileData.name,
        bio: profileData.bio,
        timezone: profileData.timezone,
        language: profileData.language,
      });
      
      // Update auth context with new user data
      if (updateUser) {
        updateUser(updatedUser);
      }
      
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Save to backend API
      await userAPI.updateNotificationPreferences(user.id, notificationSettings);
      
      // Also save to localStorage as backup
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      
      toast.success('Notification preferences saved!');
    } catch (error) {
      toast.error('Failed to save preferences');
      console.error('Error saving notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    
    if (!securityData.currentPassword || !securityData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (securityData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      await userAPI.changePassword(user.id, {
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword,
      });
      
      toast.success('Password changed successfully!');
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error('Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAppearance = async () => {
    try {
      setLoading(false);
      // Note: Appearance settings would be saved to localStorage
      localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
      toast.success('Appearance settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
          <div className="space-y-4">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your account settings and preferences
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-200">
                <div className="flex gap-6 px-6 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'profile'
                        ? 'border-orange-600 text-orange-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`flex items-center gap-2 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'notifications'
                        ? 'border-orange-600 text-orange-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    Notifications
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-2 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'security'
                        ? 'border-orange-600 text-orange-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    Security
                  </button>
                  <button
                    onClick={() => setActiveTab('appearance')}
                    className={`flex items-center gap-2 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'appearance'
                        ? 'border-orange-600 text-orange-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Palette className="w-4 h-4" />
                    Appearance
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6 max-w-2xl">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                          />
                        </div>

                        {user?.role !== 'superadmin' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-1">
                            Role
                          </label>
                          <input
                            type="text"
                            value={profileData.role}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-600 capitalize"
                          />
                          
                          <p className="text-sm text-gray-500 mt-1">Contact admin to change your role</p>
                        </div>
                          )}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-1">
                            Bio
                          </label>
                          <textarea
                            value={profileData.bio}
                            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                            rows={3}
                            placeholder="Tell us about yourself..."
                            className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1">
                              Timezone
                            </label>
                            <select
                              value={profileData.timezone}
                              onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                              className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            >
                              <option value="UTC">UTC</option>
                              <option value="EST">EST</option>
                              <option value="PST">PST</option>
                              <option value="CET">CET</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1">
                              Language
                            </label>
                            <select
                              value={profileData.language}
                              onChange={(e) => setProfileData(prev => ({ ...prev, language: e.target.value }))}
                              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            >
                              <option value="en">English</option>
                              <option value="es">Spanish</option>
                              <option value="fr">French</option>
                              <option value="de">German</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="mt-6 flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6 max-w-2xl">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Email Notifications</p>
                            <p className="text-sm text-gray-600">Receive notifications via email</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.emailNotifications}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Ticket Assigned</p>
                            <p className="text-sm text-gray-600">When a ticket is assigned to you</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.ticketAssigned}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, ticketAssigned: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Ticket Updated</p>
                            <p className="text-sm text-gray-600">When a ticket you're watching is updated</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.ticketUpdated}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, ticketUpdated: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Ticket Closed</p>
                            <p className="text-sm text-gray-600">When a ticket is closed</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.ticketClosed}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, ticketClosed: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Weekly Digest</p>
                            <p className="text-sm text-gray-600">Receive a weekly summary of activity</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.weeklyDigest}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, weeklyDigest: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Mention Notifications</p>
                            <p className="text-sm text-gray-600">When someone mentions you in a comment</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationSettings.mentionNotifications}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, mentionNotifications: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={handleSaveNotifications}
                        disabled={loading}
                        className="mt-6 flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6 max-w-2xl">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-1">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? 'text' : 'password'}
                              value={securityData.currentPassword}
                              onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="w-full  text-black px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-1">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={securityData.newPassword}
                              onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="w-full text-black px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Must be at least 8 characters</p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-1">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={securityData.confirmPassword}
                              onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="w-full px-3 text-black py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="mt-6 flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Lock className="w-4 h-4" />
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6 max-w-2xl">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Appearance Settings</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Theme
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setAppearanceSettings(prev => ({ ...prev, theme: 'light' }))}
                              className={`p-4 border-2 rounded-lg text-sm font-semibold transition-all ${
                                appearanceSettings.theme === 'light'
                                  ? 'border-orange-600 bg-orange-50 text-orange-600'
                                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
                              }`}
                            >
                              Light
                            </button>
                            <button
                              onClick={() => setAppearanceSettings(prev => ({ ...prev, theme: 'dark' }))}
                              className={`p-4 border-2 rounded-lg text-sm font-semibold transition-all ${
                                appearanceSettings.theme === 'dark'
                                  ? 'border-orange-600 bg-orange-50 text-orange-600'
                                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
                              }`}
                            >
                              Dark (Coming Soon)
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Font Size
                          </label>
                          <select
                            value={appearanceSettings.fontSize}
                            onChange={(e) => setAppearanceSettings(prev => ({ ...prev, fontSize: e.target.value }))}
                            className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Compact Mode</p>
                            <p className="text-sm text-gray-600">Reduce spacing for more content</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={appearanceSettings.compactMode}
                              onChange={(e) => setAppearanceSettings(prev => ({ ...prev, compactMode: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Show Avatars</p>
                            <p className="text-sm text-gray-600">Display user avatars in lists</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={appearanceSettings.showAvatars}
                              onChange={(e) => setAppearanceSettings(prev => ({ ...prev, showAvatars: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={handleSaveAppearance}
                        disabled={loading}
                        className="mt-6 flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Settings'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DashboardLayout>
    </ProtectedRoute>
  );
}
