import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getUserStats, getPredictionHistory, getFavorites, updateProfile } from '../services/api';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, updateUser, logout } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, historyData, favoritesData] = await Promise.all([
          getUserStats(),
          getPredictionHistory(),
          getFavorites()
        ]);
        setStats(statsData);
        setHistory(historyData.results || historyData);
        setFavorites(favoritesData.results || favoritesData);
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        user_type: user.user_type || '',
        preferred_language: user.preferred_language || 'en',
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateProfile(formData);
      updateUser(updated);
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: t('profile.overview', 'Overview') },
    { id: 'history', label: t('profile.history', 'Prediction History') },
    { id: 'favorites', label: t('profile.favorites', 'Favorites') },
    { id: 'settings', label: t('profile.settings', 'Settings') },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-green-600">
                {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.full_name || 'User'}</h1>
              <p className="text-gray-500">{user?.email}</p>
              <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full mt-1">
                {user?.user_type}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
          >
            {t('profile.logout', 'Logout')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.total_predictions}</p>
              <p className="text-gray-600">{t('profile.totalPredictions', 'Total Predictions')}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.total_favorites}</p>
              <p className="text-gray-600">{t('profile.totalFavorites', 'Favorite Breeds')}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.total_comparisons}</p>
              <p className="text-gray-600">{t('profile.savedComparisons', 'Saved Comparisons')}</p>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('profile.recentPredictions', 'Recent Predictions')}</h3>
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.slice(0, 10).map(prediction => (
                  <div key={prediction.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{prediction.predicted_breed_name}</p>
                      <p className="text-sm text-gray-500">{prediction.animal_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600 font-semibold">
                        {(prediction.breed_confidence * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(prediction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                {t('profile.noPredictions', 'No predictions yet')}
              </p>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('profile.favoriteBreeds', 'Favorite Breeds')}</h3>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map(fav => (
                  <div key={fav.id} className="border rounded-lg p-4">
                    <p className="font-medium">{fav.breed_name}</p>
                    <p className="text-sm text-gray-500">{fav.breed_type}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                {t('profile.noFavorites', 'No favorite breeds yet')}
              </p>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('profile.accountSettings', 'Account Settings')}</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('profile.fullName', 'Full Name')}
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('profile.phone', 'Phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('profile.language', 'Preferred Language')}
                </label>
                <select
                  value={formData.preferred_language}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_language: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                </select>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {t('profile.saveChanges', 'Save Changes')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
