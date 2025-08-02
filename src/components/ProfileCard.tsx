import React, { useState } from 'react';
import { Mail, Calendar, Edit3, Save, X, MapPin, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  bio: string;
  createdAt: string;
  _count?: {
    posts: number;
  };
}

interface ProfileCardProps {
  profile: ProfileData;
  isOwnProfile: boolean;
  onProfileUpdated?: (updatedProfile: ProfileData) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  isOwnProfile, 
  onProfileUpdated 
}) => {
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: profile.name,
    bio: profile.bio || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const handleSave = async () => {
    if (!editData.name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const updatedProfile = await api.updateUserProfile(profile.id, editData);
      updateUser(updatedProfile);
      onProfileUpdated?.(updatedProfile);
      setIsEditing(false);
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: profile.name,
      bio: profile.bio || ''
    });
    setError('');
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
      {/* Cover Photo */}
      <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600"></div>
      
      {/* Profile Content */}
      <div className="px-6 pb-6">
        {/* Profile Header */}
        <div className="flex items-start justify-between -mt-16 mb-4">
          <div className="flex items-end space-x-4">
            <div className={`w-32 h-32 rounded-full border-4 border-white flex items-center justify-center text-white text-2xl font-bold ${getAvatarColor(profile.name)}`}>
              {getInitials(profile.name)}
            </div>
          </div>

          {isOwnProfile && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-16 flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 border border-blue-600 rounded-full transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
              </button>

              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Name and Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              {profile.bio && (
                <p className="text-lg text-gray-600 mt-1">{profile.bio}</p>
              )}
              <div className="flex items-center space-x-1 text-sm text-gray-500 mt-2">
                <MapPin className="w-4 h-4" />
                <span>Remote • Global</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{profile.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                <span className="text-sm">ConnectHub Community</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Joined {formatJoinDate(profile.createdAt)}</span>
              </div>

              {profile._count && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">{profile._count.posts}</span> posts
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;